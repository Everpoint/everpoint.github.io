var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
define(["require", "exports", "./SnappingProviderBase", "./FeatureLayerSnappingProvider"], function (require, exports, SnappingProviderBase_1, FeatureLayerSnappingProvider_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * This provider allows to find snapping points on a single polygon or polyline.
     */
    class PolySnappingProvider extends SnappingProviderBase_1.SnappingProviderBase {
        /**
         * @param map - working map of the control that uses snapping.
         * @param options - snapping parameters.
         */
        constructor(map, _a = {}) {
            var { feature = null } = _a, params = __rest(_a, ["feature"]);
            super(map, params);
            this.feature = feature;
        }
        _getSnappingData(point) {
            let snappingData = { points: [], lines: [] };
            if (this.feature)
                FeatureLayerSnappingProvider_1.FeatureLayerSnappingProvider.setPolyData(this.feature, snappingData);
            return snappingData;
        }
        clone() {
            const result = new PolySnappingProvider(this._map, { snappingDistance: this.snappingDistance, snappingMethods: this.snappingMethods });
            result.feature = this.feature;
            return result;
        }
    }
    exports.PolySnappingProvider = PolySnappingProvider;
});
