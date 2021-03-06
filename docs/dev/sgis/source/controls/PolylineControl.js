var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
define(["require", "exports", "./PolyControl", "../symbols/PolylineSymbol", "../features/Polyline"], function (require, exports, PolyControl_1, PolylineSymbol_1, Polyline_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Control for drawing polyline features.
     * @alias sGis.controls.Polyline
     */
    class PolylineControl extends PolyControl_1.PolyControl {
        /**
         * @param map - map the control will work with
         * @param properties - key-value set of properties to be set to the instance
         */
        constructor(map, _a = {}) {
            var { symbol = new PolylineSymbol_1.PolylineSymbol() } = _a, controlOptions = __rest(_a, ["symbol"]);
            super(map, Object.assign({ symbol }, controlOptions));
        }
        _getNewFeature(position) {
            return new Polyline_1.Polyline([[position, position]], { crs: this.map.crs, symbol: this.symbol });
        }
    }
    exports.PolylineControl = PolylineControl;
});
