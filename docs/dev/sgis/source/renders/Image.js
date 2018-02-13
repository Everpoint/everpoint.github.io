define(["require", "exports", "../interfaces/IRender"], function (require, exports, IRender_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Rendered image on a map.
     * @alias sGis.render.ImageRender
     */
    class ImageRender extends IRender_1.Render {
        /**
         * @param src - the source of the image.
         * @param bbox - bbox that will contain image. The rendered image will be adjusted to fit the given bbox.
         * @param onAfterDisplayed - callback function that will be called after a render node is drawn to the DOM.
         */
        constructor(src, bbox, onAfterDisplayed = null) {
            super();
            /** Opacity of the image */
            this.opacity = 1;
            this._src = src;
            this._bbox = bbox;
            this.onAfterDisplayed = onAfterDisplayed;
        }
        /**
         * Returns HTML img element as the second parameter to callback function
         * @param callback - callback function that will be called after node is ready
         */
        getNode(callback) {
            let node = new Image();
            node.style.opacity = this.opacity;
            node.onload = function () { callback(null, node); };
            node.onerror = function () { callback('Failed to load image', null); };
            node.src = this._src;
            this._node = node;
        }
        /**
         * Bbox that will contain image.
         */
        get bbox() { return this._bbox; }
        contains() {
            // TODO: Contains method works with pixel position, but Image render does not know about pixels. Should change its operation from bbox to px.
            return false;
        }
        get isVector() { return false; }
        /**
         * Returns rendered node if ready.
         */
        getCache() { return this._node || null; }
    }
    exports.ImageRender = ImageRender;
});
