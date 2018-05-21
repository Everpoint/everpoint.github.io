var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
define(["require", "exports", "./Layer", "../layers/clusterProviders/GridClusterProvider", "../renders/StaticImageRender", "../symbols/ClusterSymbol", "./FeatureLayer", "../utils/utils"], function (require, exports, Layer_1, GridClusterProvider_1, StaticImageRender_1, ClusterSymbol_1, FeatureLayer_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * A layer that contains arbitrary set of features.
     * @alias sGis.FeatureLayer
     */
    class ClusterLayer extends Layer_1.Layer {
        /**
         * @param __namedParameters - properties to be set to the corresponding fields.
         * @param extensions - [JS ONLY]additional properties to be copied to the created instance.
         */
        constructor(_a = {}, extensions) {
            var { delayedUpdate = true, features = [], clusterSymbol = new ClusterSymbol_1.ClusterSymbol(), symbol = new ClusterSymbol_1.ClusterSymbol(), size } = _a, layerParams = __rest(_a, ["delayedUpdate", "features", "clusterSymbol", "symbol", "size"]);
            clusterSymbol;
            super(Object.assign({ delayedUpdate }, layerParams), extensions);
            this._features = features;
            this._clusterSymbol = clusterSymbol;
            this._symbol = symbol;
            this._gridClusterProvider = new GridClusterProvider_1.GridClusterProvider({
                size,
            });
        }
        getRenders(bbox, resolution) {
            let renders = [];
            this.getFeatures(bbox, resolution).forEach((feature) => {
                if (feature.features.length === 1) {
                    feature.symbol = this._symbol;
                }
                else {
                    feature.symbol = this._clusterSymbol;
                }
                renders = renders.concat(feature.render(resolution, bbox.crs));
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
        add(features) {
            const toAdd = Array.isArray(features) ? features : [features];
            if (toAdd.length === 0)
                return;
            toAdd.forEach(f => {
                if (this._features.indexOf(f) !== -1)
                    utils_1.error(new Error(`Feature ${f} is already in the layer`));
            });
            this._features = this._features.concat(toAdd);
            this.fire(new FeatureLayer_1.FeaturesAddEvent(toAdd));
            this.redraw();
            this._gridClusterProvider.add(toAdd);
        }
        remove(features) {
            const toRemove = Array.isArray(features) ? features : [features];
            if (toRemove.length === 0)
                return;
            toRemove.forEach(f => {
                let index = this._features.indexOf(f);
                if (index === -1)
                    utils_1.error(new Error(`Feature ${f} is not in the layer`));
                this._features.splice(index, 1);
            });
            this.fire(new FeatureLayer_1.FeaturesRemoveEvent(toRemove));
            this.redraw();
            this._gridClusterProvider.remove(toRemove);
        }
        has(feature) {
            return this._features.indexOf(feature) !== -1;
        }
        get features() {
            return this._features;
        }
        set features(features) {
            const currFeatures = this._features;
            this._features = [];
            this.fire(new FeatureLayer_1.FeaturesRemoveEvent(currFeatures));
            this.add(features);
            this.redraw();
        }
    }
    exports.ClusterLayer = ClusterLayer;
});
