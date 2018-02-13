define(["require", "exports", "../Symbol", "../../renders/HtmlElement", "../../serializers/symbolSerializer", "../../resourses/images", "../../features/Point", "../../utils/utils"], function (require, exports, Symbol_1, HtmlElement_1, symbolSerializer_1, images_1, Point_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Symbol of point drawn as circle with outline.
     * @alias sGis.symbol.point.Image
     */
    class PointImageSymbol extends Symbol_1.Symbol {
        /**
         * @param options - key-value list of the properties to be assigned to the instance.
         */
        constructor(options = {}) {
            super();
            /** Width of the image. If not set, image will be automatically resized according to height. If both width and height are not set, original image size will be used. */
            this.width = 32;
            /** Height of the image. If not set, image will be automatically resized according to width. If both width and height are not set, original image size will be used. */
            this.height = 32;
            this._anchorPoint = [16, 32];
            /** Source of the image. Can be url or data:url string. */
            this.source = images_1.PIN_IMAGE;
            /**
             * Clockwise rotation of the image in radians.
             */
            this.angle = 0;
            Object.assign(this, options);
        }
        /**
         * Anchor point of the image. If set to [0, 0], image's left top corner will be at the feature position.<br>
         *     Anchor point does not scale with width and height parameters.
         */
        get anchorPoint() {
            return this._anchorPoint;
        }
        set anchorPoint(anchorPoint) {
            // TODO: remove deprecated part after 2018
            let deprecated = anchorPoint;
            if (deprecated.x !== undefined && deprecated.y !== undefined) {
                utils_1.warn('Using anchorPoint in {x, y} format is deprecated. Use [x, y] format instead.');
                this._anchorPoint = [deprecated.x, deprecated.y];
            }
            else {
                this._anchorPoint = anchorPoint;
            }
        }
        renderFunction(feature, resolution, crs) {
            if (!(feature instanceof Point_1.PointFeature))
                return [];
            let position = feature.projectTo(crs).position;
            let pxPosition = [position[0] / resolution, -position[1] / resolution];
            let renderPosition = [pxPosition[0], pxPosition[1]];
            let widthProp = this.width > 0 ? `width="${this.width}"` : '';
            let heightProp = this.height > 0 ? `height="${this.height}"` : '';
            let translateProp = this.angle !== 0 ? `style="transform-origin: 50% 50%; transform: rotate(${this.angle}rad)"` : '';
            let html = `<img src="${this.source}" ${widthProp} ${heightProp} ${translateProp}>`;
            return [new HtmlElement_1.HtmlElement(html, renderPosition, null, [-this.anchorPoint[0], -this.anchorPoint[0]])];
        }
    }
    exports.PointImageSymbol = PointImageSymbol;
    symbolSerializer_1.registerSymbol(PointImageSymbol, 'point.Image', ['width', 'height', 'anchorPoint', 'source', 'angle']);
});
