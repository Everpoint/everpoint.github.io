define(["require", "exports", "./utils/utils"], function (require, exports, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const TOLERANCE = 0.001;
    const defaultLevels = [{
            resolution: 156543.03392800014,
            indexCount: 1,
            zIndex: 0
        }];
    for (let i = 1; i < 18; i++) {
        defaultLevels[i] = {
            resolution: defaultLevels[i - 1].resolution / 2,
            indexCount: defaultLevels[i - 1].indexCount * 2,
            zIndex: i
        };
    }
    /**
     * Tile scheme used by tile layers to calculate indexes and coordinates of the tiles.
     * @alias sGis.TileScheme
     */
    class TileScheme {
        constructor({ origin, levels, limits = [-Infinity, -Infinity, Infinity, Infinity], reversedY = false, tileWidth = 256, tileHeight = 256 }) {
            this._levels = levels.sort((a, b) => a.resolution - b.resolution);
            this._origin = origin;
            this.reversedY = reversedY;
            this.tileWidth = tileWidth;
            this.tileHeight = tileHeight;
            this.limits = limits;
        }
        /** @see [[TileSchemeConstructorParams.levels]] */
        get levels() { return this._levels; }
        /**
         * Returns resolution of the closest level in the tile scheme in the given direction. If no such level is found, returns smallest or largest possible resolution.
         * @param resolution - resolution that will be used as a base for search
         * @param direction - if false, will return resolution smaller then given, if true, will return resolution larger then given
         */
        getAdjustedResolution(resolution, direction = false) {
            return this.levels[this.getLevel(resolution, direction)].resolution;
        }
        /**
         * Returns closest level index in the tile scheme that has resolution in the given direction. If no such level is found, returns the last level index.
         * @param resolution - resolution that will be used as a base for search
         * @param direction - if false, resolution level with smaller resolution will be returned. If true, resolution level with larger resolution will be returned.
         */
        getLevel(resolution, direction = false) {
            if (!this.levels || this.levels.length === 0)
                utils_1.error('Tile scheme levels are not set');
            let i;
            for (i = 0; i < this.levels.length; i++) {
                if (resolution <= this.levels[i].resolution + TOLERANCE) {
                    if (direction) {
                        return i === 0 ? i : i - 1;
                    }
                    return i;
                }
            }
            return i - 1;
        }
        /**
         * Maximum resolution in the scheme
         */
        get maxResolution() {
            return this.levels[this.levels.length - 1].resolution;
        }
        /**
         * Minimum resolution in the scheme
         */
        get minResolution() {
            return this.levels[0].resolution;
        }
        /** @see [[TileSchemeConstructorParams.origin]] */
        get origin() { return this._origin; }
    }
    /** Default tile scheme used for Mercator projections. */
    TileScheme.default = new TileScheme({
        origin: [-20037508.342787, 20037508.342787],
        levels: defaultLevels,
        tileWidth: 256,
        tileHeight: 256,
        reversedY: false,
        limits: [-Infinity, -20037508.342787, Infinity, 20037508.342787]
    });
    exports.TileScheme = TileScheme;
});
