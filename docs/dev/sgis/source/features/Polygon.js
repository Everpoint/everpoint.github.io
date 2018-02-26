define(["require", "exports", "./Poly", "../symbols/polygon/Simple"], function (require, exports, Poly_1, Simple_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Polygon with one or more contours (rings). Coordinates in the contours must not be enclosed (first and last points must not be same).
     * @alias sGis.feature.Polygon
     */
    class Polygon extends Poly_1.Poly {
        constructor(rings, { symbol = new Simple_1.PolygonSymbol(), crs } = {}) {
            super(rings, { symbol, crs });
            this.isEnclosed = true;
        }
        /**
         * Returns a copy of the feature. Only generic properties are copied.
         */
        clone() {
            return new Polygon(this.rings, { crs: this.crs, symbol: this.originalSymbol });
        }
    }
    exports.Polygon = Polygon;
});
