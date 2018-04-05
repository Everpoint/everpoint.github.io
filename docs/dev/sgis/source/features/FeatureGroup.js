var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
define(["require", "exports", "./Feature", "../Point", "../symbols/point/Point", "../Bbox", "./PointFeature"], function (require, exports, Feature_1, Point_1, Point_2, Bbox_1, PointFeature_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class FeatureGroup extends Feature_1.Feature {
        constructor(features, _a = {}) {
            var { symbol = new Point_2.PointSymbol() } = _a, params = __rest(_a, ["symbol"]);
            super(Object.assign({ symbol }, params));
            this._features = features.map(feature => {
                if (this.crs.equals(feature.crs))
                    return feature;
                else {
                    let projected = feature.projectTo(this.crs);
                    return new PointFeature_1.PointFeature(projected.position, { crs: this.crs, symbol: this.symbol });
                }
            });
        }
        /**
         * Returns a copy of the feature. Only generic properties are copied.
         */
        clone() {
            return new FeatureGroup(this._features, { crs: this.crs, symbol: this.symbol });
        }
        projectTo(crs) {
            return new FeatureGroup(this._features, { crs: crs, symbol: this.symbol });
        }
        features() {
            return this._features;
        }
        get position() {
            let x = 0;
            let y = 0;
            for (let i = 0; i < this._features.length; i++) {
                x += this._features[i].centroid[0];
                y += this._features[i].centroid[1];
            }
            return [x / this._features.length, y / this._features.length];
        }
        get bbox() {
            if (this._bbox)
                return this._bbox;
            let xMin = Number.MAX_VALUE;
            let yMin = Number.MAX_VALUE;
            let xMax = Number.MIN_VALUE;
            let yMax = Number.MIN_VALUE;
            this._features.forEach(feature => {
                xMin = Math.min(xMin, feature.centroid[0]);
                yMin = Math.min(yMin, feature.centroid[1]);
                xMax = Math.max(xMax, feature.centroid[0]);
                yMax = Math.max(yMax, feature.centroid[1]);
            });
            this._bbox = new Bbox_1.Bbox([xMin, yMin], [xMax, yMax], this.crs);
            return this._bbox;
        }
        get point() { return new Point_1.Point(this.position, this.crs); }
        get x() { return this.position[0]; }
        get y() { return this.position[1]; }
        /**
         * @deprecated
         */
        get coordinates() { return [this.position[0], this.position[1]]; }
        get centroid() { return this.position; }
    }
    exports.FeatureGroup = FeatureGroup;
});
