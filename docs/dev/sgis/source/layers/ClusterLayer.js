var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
define(["require", "exports", "./Layer", "../renders/StaticImageRender", "../symbols/ClusterSymbol", "./clusterProviders/GridClusterProvider", "./FeatureLayer"], function (require, exports, Layer_1, StaticImageRender_1, ClusterSymbol_1, GridClusterProvider_1, FeatureLayer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @alias sGis.ClusterLayer
     */
    class ClusterLayer extends Layer_1.Layer {
        /**
         * @param __namedParameters - properties to be set to the corresponding fields.
         */
        constructor(_a = {}) {
            var { delayedUpdate = true, clusterSymbol = new ClusterSymbol_1.ClusterSymbol(), gridClusterProvider = new GridClusterProvider_1.GridClusterProvider() } = _a, layerParams = __rest(_a, ["delayedUpdate", "clusterSymbol", "gridClusterProvider"]);
            super(Object.assign({ delayedUpdate }, layerParams));
            this._clusterSymbol = clusterSymbol;
            this._gridClusterProvider = gridClusterProvider;
        }
        getRenders(bbox, resolution) {
            let renders = [];
            this.getFeatures(bbox, resolution).forEach((cluster) => {
                if (cluster.symbol !== this._clusterSymbol) {
                    cluster.symbol = this._clusterSymbol;
                }
                if (cluster.features.length === 1) {
                    renders = renders.concat(cluster.features[0].render(resolution, bbox.crs));
                }
                else {
                    renders = renders.concat(cluster.render(resolution, bbox.crs));
                }
                renders.forEach(render => {
                    if (render instanceof StaticImageRender_1.StaticImageRender) {
                        render.onLoad = () => {
                            this.redraw();
                        };
                    }
                });
            });
            return renders;
        }
        getFeatures(bbox, resolution) {
            if (!this.checkVisibility(resolution))
                return [];
            return this._gridClusterProvider.getClusters(bbox, resolution);
        }
        /**
         * Adds a feature or an array of features to the layer.
         * @param features - features to add.
         * @throws if one of the features is already in the layer.
         * @fires FeaturesAddEvent
         */
        add(features) {
            const toAdd = Array.isArray(features) ? features : [features];
            if (toAdd.length === 0)
                return;
            this.fire(new FeatureLayer_1.FeaturesAddEvent(toAdd));
            this._gridClusterProvider.add(toAdd);
            this.redraw();
        }
        /**
         * Removes a feature or an array of features from the layer.
         * @param features - feature or features to be removed.
         * @throws if the one of the features is not in the layer.
         * @fires [[FeaturesRemoveEvent]]
         */
        remove(features) {
            const toRemove = Array.isArray(features) ? features : [features];
            if (toRemove.length === 0)
                return;
            this.fire(new FeatureLayer_1.FeaturesRemoveEvent(toRemove));
            this._gridClusterProvider.remove(toRemove);
            this.redraw();
        }
        /**
         * Returns true if the given feature is in the layer.
         * @param feature
         */
        has(feature) {
            return this._gridClusterProvider.has(feature);
        }
    }
    exports.ClusterLayer = ClusterLayer;
});
