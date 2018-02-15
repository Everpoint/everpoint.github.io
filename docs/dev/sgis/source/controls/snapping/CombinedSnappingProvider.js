define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class CombinedSnappingProvider {
        constructor(providers) {
            this.providers = providers;
        }
        getSnappingPoint(point, activeContour, activeIndex, isPolygon) {
            for (let i = 0; i < this.providers.length; i++) {
                const snappingPoint = this.providers[i].getSnappingPoint(point, activeContour, activeIndex, isPolygon);
                if (snappingPoint !== null)
                    return snappingPoint;
            }
        }
        clone() {
            let children = this.providers.map(x => x.clone());
            return new CombinedSnappingProvider(children);
        }
    }
    exports.CombinedSnappingProvider = CombinedSnappingProvider;
});
