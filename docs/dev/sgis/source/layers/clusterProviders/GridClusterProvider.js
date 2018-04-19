define(["require", "exports", "../../features/FeatureGroup", "../../Crs", "../../utils/utils"], function (require, exports, FeatureGroup_1, Crs_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class GridClusterProvider {
        constructor({ features = [], size = 44, resolution = 9444, crs = Crs_1.geo } = {}) {
            this._features = features;
            this._size = size * resolution;
            this._crs = crs;
        }
        _groupByIndex(features) {
            const groups = {};
            const f = (feature) => [feature.indexX, feature.indexY];
            features.forEach((feature) => {
                const group = JSON.stringify(f(feature));
                groups[group] = groups[group] || [];
                groups[group].push(feature);
            });
            return Object.keys(groups).map((group) => {
                return new FeatureGroup_1.FeatureGroup(groups[group], { crs: this._crs });
            });
        }
        _pythagoras(p1, p2) {
            return Math.hypot(p2.centroid[0] - p1.centroid[0], p2.centroid[1] - p1.centroid[1]);
        }
        _compareGroupsByDistance(featureGroups) {
            const groups = utils_1.copyArray(featureGroups);
            const clusters = [];
            for (let i = 0; i < groups.length; i++) {
                let cluster = groups[i].features;
                for (let j = i + 1; j < groups.length; j++) {
                    if (this._pythagoras(groups[i], groups[j]) < this._size) {
                        cluster = cluster.concat(groups[j].features);
                        groups.splice(j, 1);
                    }
                }
                if (clusters.length > 0 &&
                    this._pythagoras(clusters[clusters.length - 1], new FeatureGroup_1.FeatureGroup(cluster, { crs: this._crs })) < this._size) {
                    clusters[clusters.length - 1] = new FeatureGroup_1.FeatureGroup(clusters[clusters.length - 1].features.concat(cluster), { crs: this._crs });
                }
                else
                    clusters.push(new FeatureGroup_1.FeatureGroup(cluster, { crs: this._crs }));
            }
            return clusters;
        }
        _checkDistance(groups) {
            let flag = false;
            for (let i = 0; i < groups.length; i++) {
                if (flag)
                    break;
                for (let j = i + 1; j < groups.length; j++) {
                    if (flag)
                        break;
                    if (this._pythagoras(groups[i], groups[j]) < this._size)
                        flag = true;
                }
            }
            return flag;
        }
        getClusters() {
            const indexedFeatures = this._features.map(feature => {
                const point = feature.projectTo(this._crs);
                const indexX = Math.round(point.centroid[0] / this._size);
                const indexY = Math.round(point.centroid[1] / this._size);
                return Object.assign(feature, { indexX, indexY });
            });
            let flag = true;
            let clusters = this._groupByIndex(indexedFeatures);
            while (flag) {
                const comparedClusters = this._compareGroupsByDistance(clusters);
                clusters = comparedClusters;
                flag = this._checkDistance(comparedClusters);
            }
            return clusters;
        }
    }
    exports.GridClusterProvider = GridClusterProvider;
});
