define(["require", "exports", "./Poly", "../symbols/PolylineSymbol"], function (require, exports, Poly_1, PolylineSymbol_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * A line or a set of geographical lines.
     * @alias sGis.feature.Polyline
     */
    class Polyline extends Poly_1.Poly {
        constructor(rings, { symbol = new PolylineSymbol_1.PolylineSymbol(), crs } = {}) {
            super(rings, { symbol, crs });
        }
        /**
         * Returns a copy of the feature. Only generic properties are copied.
         */
        clone() {
            return new Polyline(this.rings, { crs: this.crs, symbol: this.originalSymbol });
        }
    }
    exports.Polyline = Polyline;
});
