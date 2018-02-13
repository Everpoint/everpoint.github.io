define(["require", "exports", "./SnappingProviderBase", "./FeatureLayerSnappingProvider"], function (require, exports, SnappingProviderBase_1, FeatureLayerSnappingProvider_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class PolySnappingProvider extends SnappingProviderBase_1.SnappingProviderBase {
        constructor(map, options = {}) {
            super(map, options);
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
