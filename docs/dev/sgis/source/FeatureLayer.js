var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
define(["require", "exports", "./Layer", "./utils/utils", "./EventHandler", "./renders/StaticImageRender"], function (require, exports, Layer_1, utils_1, EventHandler_1, StaticImageRender_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * New features are added to the feature layer
     * @event FeaturesAddEvent
     */
    class FeaturesAddEvent extends EventHandler_1.sGisEvent {
        constructor(features) {
            super(FeaturesAddEvent.type);
            this.features = features;
        }
    }
    FeaturesAddEvent.type = 'featuresAdd';
    exports.FeaturesAddEvent = FeaturesAddEvent;
    /**
     * Some features were removed from the feature layer
     * @event FeaturesRemoveEvent
     */
    class FeaturesRemoveEvent extends EventHandler_1.sGisEvent {
        constructor(features) {
            super(FeaturesRemoveEvent.type);
            this.features = features;
        }
    }
    FeaturesRemoveEvent.type = 'featuresRemove';
    exports.FeaturesRemoveEvent = FeaturesRemoveEvent;
    /**
     * A layer that contains arbitrary set of features.
     * @alias sGis.FeatureLayer
     */
    class FeatureLayer extends Layer_1.Layer {
        /**
         * @param __namedParameters - properties to be set to the corresponding fields.
         * @param extensions - [JS ONLY]additional properties to be copied to the created instance.
         */
        constructor(_a = {}, extensions) {
            var { delayedUpdate = true, features = [] } = _a, layerParams = __rest(_a, ["delayedUpdate", "features"]);
            super(Object.assign({ delayedUpdate }, layerParams), extensions);
            this._features = features;
        }
        getRenders(bbox, resolution) {
            if (!this.checkVisibility(resolution))
                return [];
            let renders = [];
            this._features.forEach(feature => {
                if (!feature.crs.canProjectTo(bbox.crs) || !feature.bbox.intersects(bbox))
                    return;
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
            let obj = [];
            this._features.forEach(feature => {
                if (feature.crs.canProjectTo(bbox.crs) && feature.bbox.intersects(bbox))
                    obj.push(feature);
            });
            return obj;
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
            toAdd.forEach(f => {
                if (this._features.indexOf(f) !== -1)
                    utils_1.error(new Error(`Feature ${f} is already in the layer`));
            });
            this._features = this._features.concat(toAdd);
            this.fire(new FeaturesAddEvent(toAdd));
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
            toRemove.forEach(f => {
                let index = this._features.indexOf(f);
                if (index === -1)
                    utils_1.error(new Error(`Feature ${f} is not in the layer`));
                this._features.splice(index, 1);
            });
            this.fire(new FeaturesRemoveEvent(toRemove));
            this.redraw();
        }
        /**
         * Returns true if the given feature is in the layer.
         * @param feature
         */
        has(feature) {
            return this._features.indexOf(feature) !== -1;
        }
        /**
         * Moves the given feature to the top of the layer (end of the list). If the feature is not in the layer, the command is ignored.
         * @param feature
         */
        moveToTop(feature) {
            let index = this._features.indexOf(feature);
            if (index !== -1) {
                this._features.splice(index, 1);
                this._features.push(feature);
                this.redraw();
            }
        }
        /**
         * List of features in the layer. If assigned, it removes all features and add new ones, firing all the respective events.
         * @fires [[FeaturesAddEvent]]
         * @fires [[FeaturesRemoveEvent]]
         */
        get features() {
            return this._features;
        }
        set features(features) {
            const currFeatures = this._features;
            this._features = [];
            this.fire(new FeaturesRemoveEvent(currFeatures));
            this.add(features);
            this.redraw();
        }
    }
    exports.FeatureLayer = FeatureLayer;
});
