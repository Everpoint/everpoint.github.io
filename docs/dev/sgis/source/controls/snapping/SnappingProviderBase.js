define(["require", "exports", "./SnappingMethods"], function (require, exports, SnappingMethods_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class SnappingProviderBase {
        constructor(map, { snappingDistance = 7, snappingMethods = [SnappingMethods_1.vertexSnapping, SnappingMethods_1.midPointSnapping, SnappingMethods_1.lineSnapping, SnappingMethods_1.orthogonalSnapping, SnappingMethods_1.axisSnapping] } = {}) {
            this._map = map;
            this.snappingDistance = snappingDistance;
            this.snappingMethods = snappingMethods;
        }
        getSnappingPoint(point, activeContour, activeIndex, isPolygon) {
            const data = this._getSnappingData(point);
            const distance = this.snappingDistance * this._map.resolution;
            for (let i = 0; i < this.snappingMethods.length; i++) {
                const snappingPoint = this.snappingMethods[i](point, data, distance, activeContour, activeIndex, isPolygon);
                if (snappingPoint)
                    return snappingPoint;
            }
            return null;
        }
    }
    exports.SnappingProviderBase = SnappingProviderBase;
});
