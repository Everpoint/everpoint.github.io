define(["require", "exports", "../../serializers/symbolSerializer", "../../renders/Poly", "../PolylineSymbol", "../Symbol"], function (require, exports, symbolSerializer_1, Poly_1, PolylineSymbol_1, Symbol_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Symbol of polygon with image filling.
     * @alias sGis.symbol.polygon.ImageFill
     */
    class ImageFill extends Symbol_1.Symbol {
        /**
         * @param options - key-value list of the properties to be assigned to the instance.
         */
        constructor({ src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', strokeWidth = 1, strokeColor = 'block', lineDash = [] } = {}) {
            super();
            this._image = new Image();
            this.strokeWidth = strokeWidth;
            this.strokeColor = strokeColor;
            this.lineDash = lineDash;
            this._src = src;
            this._updateImage();
        }
        renderFunction(feature, resolution, crs) {
            if (!this._image.complete) {
                this._image.onload = feature.redraw.bind(feature);
                return [];
            }
            let coordinates = PolylineSymbol_1.PolylineSymbol.getRenderedCoordinates(feature, resolution, crs);
            return [new Poly_1.PolyRender(coordinates, {
                    enclosed: true,
                    strokeColor: this.strokeColor,
                    strokeWidth: this.strokeWidth,
                    fillStyle: Poly_1.FillStyle.Image,
                    fillImage: this._image,
                    lineDash: this.lineDash
                })];
        }
        /**
         * Source for the filling image. Can be url or data:url string.
         */
        get src() { return this._src; }
        set src(src) {
            this._src = src;
            this._updateImage();
        }
        _updateImage() {
            this._image = new Image();
            this._image.src = this._src;
        }
    }
    exports.ImageFill = ImageFill;
    symbolSerializer_1.registerSymbol(ImageFill, 'polygon.ImageFill', ['src', 'strokeColor', 'strokeWidth']);
});
