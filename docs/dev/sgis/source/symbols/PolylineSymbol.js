define(["require", "exports", "./Symbol", "../serializers/symbolSerializer", "../utils/math", "../renders/Poly", "../features/Poly"], function (require, exports, Symbol_1, symbolSerializer_1, math_1, Poly_1, Poly_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Symbol of polyline drawn as simple line.
     * @alias sGis.symbol.polyline.Simple
     */
    class PolylineSymbol extends Symbol_1.Symbol {
        /**
         * @param options - key-value list of the properties to be assigned to the instance.
         */
        constructor(options = {}) {
            super();
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
            let coordinates = PolylineSymbol.getRenderedCoordinates(feature, resolution, crs);
            return [new Poly_1.PolyRender(coordinates, {
                    fillStyle: Poly_1.FillStyle.None,
                    enclosed: false,
                    strokeColor: this.strokeColor,
                    strokeWidth: this.strokeWidth,
                    lineDash: this.lineDash
                })];
        }
        /**
         * Projects coordinates of a poly feature to the requested crs and resolution.
         * @param feature
         * @param resolution
         * @param crs
         */
        static getRenderedCoordinates(feature, resolution, crs) {
            let projected = feature.crs.equals(crs) ? feature.rings : feature.projectTo(crs).rings;
            return math_1.simplifyCoordinates(projected.map(ring => {
                return ring.map(point => {
                    return [point[0] / resolution, point[1] / -resolution];
                });
            }), 1);
        }
    }
    exports.PolylineSymbol = PolylineSymbol;
    symbolSerializer_1.registerSymbol(PolylineSymbol, 'polyline.Simple', ['strokeColor', 'strokeWidth']);
});
