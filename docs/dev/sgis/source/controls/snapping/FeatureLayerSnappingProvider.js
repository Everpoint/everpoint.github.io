define(["require", "exports", "./SnappingProviderBase", "../../Bbox", "../../Point", "../../features/Point", "../../features/Poly", "../../features/Polygon"], function (require, exports, SnappingProviderBase_1, Bbox_1, Point_1, Point_2, Poly_1, Polygon_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class FeatureLayerSnappingProvider extends SnappingProviderBase_1.SnappingProviderBase {
        constructor(map, layer, options = {}) {
            super(map, options);
            this._layer = layer;
        }
        _getSnappingData(point) {
            let bbox = Bbox_1.Bbox.fromPoint(new Point_1.Point(point, this._map.crs), this.snappingDistance * this._map.resolution);
            let features = this._layer.getFeatures(bbox, this._map.resolution);
            let snappingData = { points: [], lines: [] };
            features.forEach(feature => {
                if (feature instanceof Point_2.PointFeature) {
                    snappingData.points.push(feature.position);
                }
                else if (feature instanceof Poly_1.Poly) {
                    FeatureLayerSnappingProvider.setPolyData(feature, snappingData);
                }
            });
            return snappingData;
        }
        static setPolyData(poly, data) {
            const isPolygon = poly instanceof Polygon_1.Polygon;
            poly.rings.forEach(ring => {
                ring.forEach(point => {
                    data.points.push(point);
                });
                for (let i = 1; i < ring.length; i++) {
                    data.lines.push([ring[i - 1], ring[i]]);
                }
                if (isPolygon)
                    data.lines.push([ring[ring.length - 1], ring[0]]);
            });
        }
        clone() {
            return new FeatureLayerSnappingProvider(this._map, this._layer, { snappingDistance: this.snappingDistance, snappingMethods: this.snappingMethods });
        }
    }
    exports.FeatureLayerSnappingProvider = FeatureLayerSnappingProvider;
});
