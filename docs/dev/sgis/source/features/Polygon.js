var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
define(["require", "exports", "./Poly", "../symbols/polygon/Simple", "../geotools"], function (require, exports, Poly_1, Simple_1, geotools_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Polygon with one or more contours (rings). Coordinates in the contours must not be enclosed (first and last points must not be same).
     * @alias sGis.feature.Polygon
     */
    class Polygon extends Poly_1.Poly {
        constructor(rings, _a = {}) {
            var { symbol = new Simple_1.PolygonSymbol() } = _a, params = __rest(_a, ["symbol"]);
            super(rings, Object.assign({ symbol }, params));
            this.isEnclosed = true;
        }
        /**
         * Returns a copy of the feature. Only generic properties are copied.
         */
        clone() {
            return new Polygon(this.rings, { crs: this.crs, symbol: this.originalSymbol });
        }
        projectTo(crs) {
            let projected = geotools_1.projectRings(this.rings, this.crs, crs);
            return new Polygon(projected, { crs: this.crs, symbol: this.symbol, persistOnMap: this.persistOnMap });
        }
    }
    exports.Polygon = Polygon;
});
