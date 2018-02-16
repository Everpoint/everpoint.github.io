define(["require", "exports", "./SnappingMethods"], function (require, exports, SnappingMethods_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Base functionality for snapping based on selected [[SnappingMethod]]s and snapping distance.
     */
    class SnappingProviderBase {
        /**
         * @param map - working map of the control that uses snapping.
         * @param __namedParams - snapping parameters.
         */
        constructor(map, { snappingDistance = 7, snappingMethods = [SnappingMethods_1.vertexSnapping, SnappingMethods_1.midPointSnapping, SnappingMethods_1.lineSnapping, SnappingMethods_1.orthogonalSnapping, SnappingMethods_1.axisSnapping] } = {}) {
            this._map = map;
            this.snappingDistance = snappingDistance;
            this.snappingMethods = snappingMethods;
        }
        getSnappingPoint(position, activeContour, activeIndex, isEnclosed) {
            const data = this._getSnappingData(position);
            const snappingDistance = this.snappingDistance * this._map.resolution;
            for (let i = 0; i < this.snappingMethods.length; i++) {
                const snappingPoint = this.snappingMethods[i]({ position, data, snappingDistance, activeContour, activeIndex, isEnclosed });
                if (snappingPoint)
                    return snappingPoint;
            }
            return null;
        }
    }
    exports.SnappingProviderBase = SnappingProviderBase;
});
