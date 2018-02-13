define(["require", "exports", "./Symbol", "../utils/utils", "../serializers/symbolSerializer", "../utils/math", "../renders/Poly"], function (require, exports, Symbol_1, utils_1, symbolSerializer_1, math_1, Poly_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Symbol of polyline drawn as simple line
     * @alias sGis.symbol.polyline.Simple
     * @extends sGis.Symbol
     */
    class PolylineSymbol extends Symbol_1.Symbol {
        /**
         * @constructor
         * @param {Object} properties - key-value list of the properties to be assigned to the instance.
         */
        constructor(properties) {
            super();
            /** Stroke color of the outline. Can be any valid css color string. */
            this.strokeColor = 'black';
            /** Stroke width of the outline. */
            this.strokeWidth = 1;
            /** Dash pattern for the line as specified in HTML CanvasRenderingContext2D.setLineDash() specification */
            this.lineDash = [];
            if (properties)
                Object.assign(this, properties);
        }
        renderFunction(/** sGis.feature.Polyline */ feature, resolution, crs) {
            let coordinates = PolylineSymbol._getRenderedCoordinates(feature, resolution, crs);
            if (!coordinates)
                return [];
            return [new Poly_1.PolyRender(coordinates, { strokeColor: this.strokeColor, strokeWidth: this.strokeWidth, lineDash: this.lineDash })];
        }
        static _getRenderedCoordinates(feature, resolution, crs) {
            if (!feature.coordinates || !utils_1.isArray(feature.coordinates) || !utils_1.isArray(feature.coordinates[0]))
                return null;
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
