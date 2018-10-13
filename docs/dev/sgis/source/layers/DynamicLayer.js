define(["require", "exports", "./Layer", "../renders/StaticHtmlImageRender"], function (require, exports, Layer_1, StaticHtmlImageRender_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Represents a layer that is fully drawn by server and is displayed as an image overlay.
     * @alias sGis.DynamicLayer
     */
    class DynamicLayer extends Layer_1.Layer {
        /**
         * @param properties - properties to be set to the corresponding fields
         * @param extensions - [JS ONLY]additional properties to be copied to the created instance
         */
        constructor(properties = {}, extensions) {
            super(properties, extensions);
            this._forceUpdate = false;
            this.delayedUpdate = true;
        }
        getRenders(bbox, resolution) {
            if (!this.checkVisibility(resolution))
                return [];
            if (this.crs) {
                if (bbox.crs.canProjectTo(this.crs)) {
                    bbox = bbox.projectTo(this.crs);
                }
                else {
                    return [];
                }
            }
            let needRedraw = this._forceUpdate || !this._currentRender || !bbox.equals(this._currentRender.bbox);
            if (needRedraw) {
                this._loadNextRender(bbox, resolution);
            }
            if (this._nextRender !== this._currentRender && this._nextRender.isReady) {
                this._currentRender = this._nextRender;
            }
            this._forceUpdate = false;
            return this._currentRender ? [this._currentRender] : [];
        }
        _loadNextRender(bbox, resolution) {
            if (this._currentRender === this._nextRender) {
                let height = Math.round(bbox.height / resolution);
                let width = Math.round(bbox.width / resolution);
                let src = this.getUrl(bbox, resolution);
                if (this._forceUpdate)
                    src += `&ts=${Date.now()}`;
                this._nextRender = new StaticHtmlImageRender_1.StaticHtmlImageRender({
                    src,
                    bbox,
                    height,
                    width,
                    opacity: this.opacity,
                    onLoad: () => {
                        this.redraw();
                    },
                    onDisplayed: () => {
                        this._startNextLoad();
                    }
                });
                this._toLoad = null;
            }
            else {
                this._toLoad = { bbox, resolution };
            }
        }
        _startNextLoad() {
            if (this._toLoad) {
                this._loadNextRender(this._toLoad.bbox, this._toLoad.resolution);
                this._toLoad = null;
            }
        }
        /**
         * Ensures update of the layer image
         */
        forceUpdate() {
            this._forceUpdate = true;
            this.fire(new Layer_1.PropertyChangeEvent('source'));
        }
        get opacity() { return this.getOpacity(); }
        set opacity(opacity) {
            this.setOpacity(opacity);
        }
        setOpacity(value) {
            if (this._currentRender)
                this._currentRender.opacity = value;
            if (this._nextRender)
                this._nextRender.opacity = value;
            super.setOpacity(value);
        }
        /**
         * Coordinate system of the layer
         */
        get crs() { return this._crs; }
        set crs(crs) { this._crs = crs; }
    }
    exports.DynamicLayer = DynamicLayer;
});
