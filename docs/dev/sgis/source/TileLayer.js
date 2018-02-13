var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
define(["require", "exports", "./TileScheme", "./Layer", "./Crs", "./Bbox", "./renders/StaticHtmlImageRender"], function (require, exports, TileScheme_1, Layer_1, Crs_1, Bbox_1, StaticHtmlImageRender_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * A layer that is drawn as a set of tile images received from server. The layer calculates tile indexes (x, y, z)
     * according to the tile scheme and requested resolution, then inserts them into url mask and creates ImageFeatures
     * for each tile. The features are cached by the layer to prevent unnecessary recalculations and garbage collection.
     * @alias sGis.TileLayer
     */
    class TileLayer extends Layer_1.Layer {
        /**
         * @param urlMask - url of the source for tiles in format http(s)://...../..{x}..{y}..{z} - where x an y are indexes of tiles for the scale level z
         * @param __namedParameters - properties to be set to the corresponding fields.
         * @param extensions - [JS ONLY]additional properties to be copied to the created instance
         */
        constructor(urlMask, _a = {}, extensions) {
            var { tileScheme = TileScheme_1.TileScheme.default, crs = Crs_1.webMercator, cycleX = true, cycleY = false, cacheSize = 256, transitionTime = 500 } = _a, LayerParams = __rest(_a, ["tileScheme", "crs", "cycleX", "cycleY", "cacheSize", "transitionTime"]);
            super(LayerParams, extensions);
            this._tileCache = {};
            this._cachedIndexes = [];
            this._previousTiles = [];
            this._urlMask = urlMask;
            this.tileScheme = tileScheme;
            this.crs = crs;
            this.cycleX = cycleX;
            this.cycleY = cycleY;
            this._cacheSize = cacheSize;
            this._transitionTime = transitionTime;
            this._tileFadeIn = this._tileFadeIn.bind(this);
        }
        /**
         * Returns url of a tile.
         * @param xIndex - index of tile along x axis.
         * @param yIndex - index of tile along y axis.
         * @param level - scale level of the tile.
         */
        getTileUrl(xIndex, yIndex, level) {
            return this._urlMask.replace('{x}', xIndex.toString())
                .replace('{y}', yIndex.toString())
                .replace('{z}', level.toString());
        }
        getRenders(bbox, resolution) {
            let indexes = this._getTileIndexes(bbox, resolution);
            let renders = [];
            let isSetComplete = true;
            for (let index of indexes) {
                let tile = this._getRender(index);
                if (tile.isReady)
                    renders.push(tile);
                if (!tile.isComplete || !tile.isReady)
                    isSetComplete = false;
            }
            if (isSetComplete) {
                this._previousTiles = [];
            }
            else {
                this._previousTiles.forEach(tile => {
                    if (renders.indexOf(tile) < 0)
                        renders.push(tile);
                });
            }
            this._previousTiles = renders;
            return renders;
        }
        _getRender(index) {
            let tileId = TileLayer._getTileId(index.z, index.x, index.y);
            if (this._tileCache[tileId])
                return this._tileCache[tileId];
            let adjX = this.cycleX ? this._getAdjustedIndex(index.x, index.level) : index.x;
            let adjY = this.cycleY ? this._getAdjustedIndex(index.y, index.level) : index.y;
            let bbox = this._getTileBbox(index);
            let tile = new StaticHtmlImageRender_1.StaticHtmlImageRender({
                src: this.getTileUrl(adjX, adjY, index.z),
                width: this.tileWidth,
                height: this.tileHeight,
                bbox,
                onLoad: () => this.redraw()
            });
            if (this._transitionTime > 0) {
                tile.node.style.opacity = '0';
                tile.node.style.transition = `opacity ${this.transitionTime / 1000}s`;
                tile.isComplete = false;
            }
            tile.onDisplayed = () => {
                if (this.transitionTime > 0)
                    setTimeout(() => {
                        tile.node.style.opacity = this.opacity.toString();
                        setTimeout(() => {
                            tile.isComplete = true;
                            this.redraw();
                        }, this.transitionTime);
                    }, 0);
            };
            tile.onRemoved = () => {
                if (this.transitionTime > 0) {
                    tile.node.style.opacity = '0';
                    tile.isComplete = false;
                }
            };
            this._cacheTile(tileId, tile);
            return tile;
        }
        _getTileBbox(index) {
            let resolution = this.tileScheme.levels[index.level].resolution;
            let width = this.tileWidth * resolution;
            let x = this.tileScheme.origin[0] + index.x * width;
            let height = this.tileHeight * resolution;
            if (!this.tileScheme.reversedY)
                height *= -1;
            let yOffset = index.y * height;
            let y = this.tileScheme.origin[1] + yOffset;
            return new Bbox_1.Bbox([x, y], [x + width, y + height], this.crs);
        }
        _cacheTile(id, tile) {
            if (this._tileCache[id])
                return;
            this._tileCache[id] = tile;
            this._cachedIndexes.push(id);
            if (this._cachedIndexes.length > this._cacheSize) {
                delete this._tileCache[this._cachedIndexes.shift()];
            }
        }
        _getTileIndexes(bbox, resolution) {
            if (!this.crs.canProjectTo(bbox.crs))
                return [];
            if (!this.checkVisibility(resolution))
                return [];
            let level = this.tileScheme.getLevel(resolution);
            if (level < 0)
                return [];
            let trimmedBbox = this._getTrimmedBbox(bbox.projectTo(this.crs));
            if (trimmedBbox.width === 0 || trimmedBbox.height === 0)
                return [];
            let layerResolution = this.tileScheme.levels[level].resolution;
            if (layerResolution * 2 < resolution)
                return [];
            let xStartIndex = Math.floor((trimmedBbox.xMin - this.tileScheme.origin[0]) / this.tileWidth / layerResolution);
            let xEndIndex = Math.ceil((trimmedBbox.xMax - this.tileScheme.origin[0]) / this.tileWidth / layerResolution);
            let yStartIndex, yEndIndex;
            if (this.tileScheme.reversedY) {
                yStartIndex = Math.floor((trimmedBbox.yMin - this.tileScheme.origin[0]) / this.tileHeight / layerResolution);
                yEndIndex = Math.ceil((trimmedBbox.yMax - this.tileScheme.origin[0]) / this.tileHeight / layerResolution);
            }
            else {
                yStartIndex = Math.floor((this.tileScheme.origin[1] - trimmedBbox.yMax) / this.tileHeight / layerResolution);
                yEndIndex = Math.ceil((this.tileScheme.origin[1] - trimmedBbox.yMin) / this.tileHeight / layerResolution);
            }
            let indexes = [];
            for (let xIndex = xStartIndex; xIndex < xEndIndex; xIndex++) {
                for (let yIndex = yStartIndex; yIndex < yEndIndex; yIndex++) {
                    indexes.push({ x: xIndex, y: yIndex, z: this.tileScheme.levels[level].zIndex, level: level });
                }
            }
            return indexes;
        }
        static _getTileId(level, xIndex, yIndex) {
            return [level, xIndex, yIndex].join(',');
        }
        _getAdjustedIndex(index, level) {
            let desc = this.tileScheme.levels[level];
            if (!desc.indexCount || desc.indexCount <= 0 || (index >= 0 && index < desc.indexCount))
                return index;
            while (index < 0)
                index += desc.indexCount;
            return index % desc.indexCount;
        }
        /**
         * Width of the tiles in px. Same as tile scheme's tileWidth.
         */
        get tileWidth() { return this.tileScheme.tileWidth; }
        /**
         * Height of the tiles in px. Same as tile scheme's tileHeight.
         */
        get tileHeight() { return this.tileScheme.tileHeight; }
        get opacity() { return this._opacity; }
        set opacity(opacity) {
            this._opacity = opacity;
            for (let tileId of Object.keys(this._tileCache)) {
                if (this._tileCache[tileId].isReady)
                    this._tileCache[tileId].node.style.opacity = opacity.toString();
            }
            this.redraw();
        }
        /**
         * Opacity transition time in milliseconds with which tiles are added to the map.
         */
        get transitionTime() { return this._transitionTime; }
        set transitionTime(time) {
            this._transitionTime = time;
        }
        _getTrimmedBbox(bbox) {
            if (!this.tileScheme.limits)
                return bbox;
            let limits = this.tileScheme.limits;
            let xMin = Math.max(bbox.xMin, limits[0]);
            let yMin = Math.max(bbox.yMin, limits[1]);
            let xMax = Math.min(bbox.xMax, limits[2]);
            let yMax = Math.min(bbox.yMax, limits[3]);
            if (xMax < xMin)
                xMax = xMin;
            if (yMax < yMin)
                yMax = yMin;
            return new Bbox_1.Bbox([xMin, yMin], [xMax, yMax], bbox.crs);
        }
        _tileFadeIn(image) {
            if (this._transitionTime <= 0)
                return;
            image.style.transition = 'opacity ' + this.transitionTime / 1000 + 's linear';
            image.style.opacity = this.opacity.toString();
        }
    }
    exports.TileLayer = TileLayer;
});
