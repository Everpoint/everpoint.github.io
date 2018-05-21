var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
define(["require", "exports", "./Feature", "../Point", "../symbols/point/Point", "../Bbox"], function (require, exports, Feature_1, Point_1, Point_2, Bbox_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Represents a group or a cluster of geographic features.
     */
    class FeatureGroup extends Feature_1.Feature {
        /**
         * When the group is created, all the features given in constructor are projected into the group crs. It means that
         * the group might not have the original features, but their copies in the projected CRS. If features are changed
         * after the group is created, a new group must be created to reflect the changes.
         * @param features - list of features to be added to the group
         * @param __namedParameters
         */
        constructor(features, _a = {}) {
            var { symbol = new Point_2.PointSymbol() } = _a, params = __rest(_a, ["symbol"]);
            super(Object.assign({ symbol }, params));
            this._features = features.map(feature => {
                if (this.crs.equals(feature.crs))
                    return feature;
                else {
                    const projected = feature.projectTo(this.crs);
                    const assigned = Object.assign(feature, projected);
                    return assigned;
                }
            });
        }
        clone() {
            return new FeatureGroup(this._features, { crs: this.crs, symbol: this.symbol });
        }
        /**
         * Projects the group and all the features in it to the given CRS, returning a copy of the group containing
         * copies of the features.
         * @param crs
         */
        projectTo(crs) {
            return new FeatureGroup(this._features, { crs, symbol: this.symbol });
        }
        /**
         * The list of features in the group. Position and bbox of the group will be calculated based on the position and
         * bboxes of all the features in the group.
         */
        get features() {
            return this._features;
        }
        get centroid() { return this.position; }
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
                xMin = Math.min(xMin, feature.bbox.xMin);
                yMin = Math.min(yMin, feature.bbox.yMin);
                xMax = Math.max(xMax, feature.bbox.xMax);
                yMax = Math.max(yMax, feature.bbox.yMax);
            });
            this._bbox = new Bbox_1.Bbox([xMin, yMin], [xMax, yMax], this.crs);
            return this._bbox;
        }
        get point() { return new Point_1.Point(this.position, this.crs); }
        get x() { return this.position[0]; }
        get y() { return this.position[1]; }
    }
    exports.FeatureGroup = FeatureGroup;
});
