define(["require", "exports", "../../features/FeatureGroup", "../../utils/utils"], function (require, exports, FeatureGroup_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class GridClusterProvider {
        constructor(size = 88) {
            this._features = [];
            this._size = size;
            this._resolution = 0;
            this._cache = [];
        }
        getClusters(bbox, resolution) {
            if (this._resolution !== resolution) {
                this._cache = [];
                this._resolution = resolution;
                const size = this._size * resolution;
                const groups = {};
                for (let i = 0; i < this._features.length; i++) {
                    const point = this._features[i].projectTo(bbox.crs);
                    const indexX = Math.floor(point.centroid[0] / size);
                    const indexY = Math.floor(point.centroid[1] / size);
                    if (groups[`${indexX}-${indexY}`]) {
                        groups[`${indexX}-${indexY}`].push(this._features[i]);
                    }
                    else
                        groups[`${indexX}-${indexY}`] = [this._features[i]];
                }
                this._cache = Object.keys(groups).map(group => new FeatureGroup_1.FeatureGroup(groups[group], { crs: bbox.crs }));
            }
            return this._cache.filter(feature => feature.crs.canProjectTo(bbox.crs) &&
                (feature.persistOnMap || feature.bbox.intersects(bbox)));
        }
        add(features) {
            this._cache = [];
            const toAdd = Array.isArray(features) ? features : [features];
            if (toAdd.length === 0)
                return;
            toAdd.forEach(f => {
                if (this._features.indexOf(f) !== -1)
                    utils_1.error(new Error(`Feature ${f} is already in the GridClusterProvider`));
            });
            this._features.push(...toAdd);
        }
        remove(features) {
            this._cache = [];
            const toRemove = Array.isArray(features) ? features : [features];
            if (toRemove.length === 0)
                return;
            toRemove.forEach(f => {
                let index = this._features.indexOf(f);
                if (index === -1)
                    utils_1.error(new Error(`Feature ${f} is not in the GridClusterProvider`));
                this._features.splice(index, 1);
            });
        }
        has(feature) {
            return this._features.indexOf(feature) !== -1;
        }
    }
    exports.GridClusterProvider = GridClusterProvider;
});
