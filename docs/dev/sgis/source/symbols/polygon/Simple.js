define(["require", "exports", "../../serializers/symbolSerializer", "../Symbol", "../../renders/Poly", "../PolylineSymbol", "../../features/Poly"], function (require, exports, symbolSerializer_1, Symbol_1, Poly_1, PolylineSymbol_1, Poly_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Symbol of polygon with one color filling.
     * @alias sGis.symbol.polygon.Simple
     */
    class PolygonSymbol extends Symbol_1.Symbol {
        /**
         * @param options - key-value list of the properties to be assigned to the instance.
         */
        constructor(options = {}) {
            super();
            /** Fill color of the polygon. Can be any valid css color string. */
            this.fillColor = 'transparent';
            /** Stroke color of the outline. Can be any valid css color string. */
            this.strokeColor = 'black';
            /** Stroke width of the outline. */
            this.strokeWidth = 1;
            /** Dash pattern for the line as specified in HTML CanvasRenderingContext2D.setLineDash() specification */
            this.lineDash = [];
            Object.assign(this, options);
        }
        renderFunction(feature, resolution, crs) {
            if (!(feature instanceof Poly_2.Poly))
                return [];
            let coordinates = PolylineSymbol_1.PolylineSymbol.getRenderedCoordinates(feature, resolution, crs);
            return [new Poly_1.PolyRender(coordinates, {
                    enclosed: true,
                    fillStyle: Poly_1.FillStyle.Color,
                    strokeColor: this.strokeColor,
                    strokeWidth: this.strokeWidth,
                    fillColor: this.fillColor,
                    lineDash: this.lineDash
                })];
        }
    }
    exports.PolygonSymbol = PolygonSymbol;
    symbolSerializer_1.registerSymbol(PolygonSymbol, 'polygon.Simple', ['fillColor', 'strokeColor', 'strokeWidth']);
});
