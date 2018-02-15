define(["require", "exports", "../Symbol", "../../serializers/symbolSerializer", "../../resourses/images"], function (require, exports, Symbol_1, symbolSerializer_1, images_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Symbol of point drawn as circle with outline.
     * @alias sGis.symbol.point.Image
     */
    class DynamicImageSymbol extends Symbol_1.DynamicPointSymbol {
        /**
         * @param options - key-value list of the properties to be assigned to the instance.
         */
        constructor(options = {}) {
            super();
            /** Width of the image. If not set, image will be automatically resized according to height. If both width and height are not set, original image size will be used. */
            this.width = 32;
            /** Height of the image. If not set, image will be automatically resized according to width. If both width and height are not set, original image size will be used. */
            this.height = 32;
            /**
             * Anchor point of the image. If set to [0, 0], image's left top corner will be at the feature position.<br>
             *     Anchor point does not scale with width and height parameters.
             */
            this.anchorPoint = [16, 32];
            /** Source of the image. Can be url or data:url string. */
            this.source = images_1.PIN_IMAGE;
            /**
             * Clockwise rotation of the image in radians.
             */
            this.angle = 0;
            Object.assign(this, options);
        }
        _getFeatureNode(feature) {
            let node = new Image();
            node.src = this.source;
            node.style.transformOrigin = `${this.anchorPoint[0]}px ${this.anchorPoint[1]}px`;
            node.style.transform = `translate(-${this.anchorPoint[0]}px,-${this.anchorPoint[1]}px) rotate(${this.angle}rad)`;
            if (this.width > 0)
                node.width = this.width;
            if (this.height > 0)
                node.height = this.height;
            if (this.angle !== 0) {
            }
            return node;
        }
    }
    exports.DynamicImageSymbol = DynamicImageSymbol;
    symbolSerializer_1.registerSymbol(DynamicImageSymbol, 'point.Image', ['width', 'height', 'anchorPoint', 'source', 'angle']);
});
