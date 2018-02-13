define(["require", "exports", "../symbols/Image", "./Feature"], function (require, exports, Image_1, Feature_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @alias sGis.feature.Image
     * @extends sGis.Feature
     */
    class ImageFeature extends Feature_1.Feature {
        /**
         * @constructor
         * @param {sGis.Bbox} bbox - bbox that the image will fit
         * @param {Object} [properties] - key-value list of the properties to be assigned to the instance
         */
        constructor(bbox, { src, crs, symbol = new Image_1.ImageSymbol() }, extension) {
            super({ symbol, crs }, extension);
            this._src = src;
            this.bbox = bbox;
        }
        /**
         * @override
         * @private
         */
        _needToRender(resolution, crs) {
            return !this.getRenderCache();
        }
        /**
         * Source of the image. Can be html address or data:url string.
         * @type String
         * @default null
         */
        get src() { return this._src; }
        set src(/** String */ src) {
            this._src = src;
            this.redraw();
        }
        /**
         * Bbox that the image will fit
         * @type sGis.Bbox
         */
        get bbox() { return this._bbox; }
        set bbox(/** sGis.Bbox */ bbox) {
            this._bbox = bbox.projectTo(this.crs);
            this.redraw();
        }
    }
    exports.ImageFeature = ImageFeature;
});
