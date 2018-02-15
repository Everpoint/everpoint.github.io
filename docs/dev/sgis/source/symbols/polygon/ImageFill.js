define(["require", "exports", "../../serializers/symbolSerializer", "../../renders/Poly", "../PolylineSymbol", "../Symbol", "../../features/Poly"], function (require, exports, symbolSerializer_1, Poly_1, PolylineSymbol_1, Symbol_1, Poly_2) {
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
        constructor(options = {}) {
            super();
            //noinspection SpellCheckingInspection
            this._src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
            /** Stroke color of the outline. Can be any valid css color string. */
            this.strokeColor = 'black';
            /** Stroke width of the outline. */
            this.strokeWidth = 1;
            /** Dash pattern for the line as specified in HTML CanvasRenderingContext2D.setLineDash() specification. */
            this.lineDash = [];
            Object.assign(this, options);
            if (!this._image)
                this.src = this._src;
        }
        renderFunction(feature, resolution, crs) {
            if (!(feature instanceof Poly_2.Poly))
                return [];
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
            this._image = new Image();
            this._image.src = src;
        }
    }
    exports.ImageFill = ImageFill;
    symbolSerializer_1.registerSymbol(ImageFill, 'polygon.ImageFill', ['src', 'strokeColor', 'strokeWidth']);
});
