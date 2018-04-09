var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
define(["require", "exports", "./Feature", "../Point", "../symbols/point/Point", "./PointFeature", "../Bbox"], function (require, exports, Feature_1, Point_1, Point_2, PointFeature_1, Bbox_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class FeatureGroup extends Feature_1.Feature {
        constructor(position, _a = {}) {
            var { symbol = new Point_2.PointSymbol() } = _a, params = __rest(_a, ["symbol"]);
            super(Object.assign({ symbol }, params));
            this._position = position;
        }
        projectTo(crs) {
            let projected = Point_1.Point.prototype.projectTo.call(this, crs);
            return new PointFeature_1.PointFeature(projected.position, { crs: crs, symbol: this.symbol });
        }
        get features() {
            return this._features;
        }
        get bbox() { return new Bbox_1.Bbox(this._position, this._position, this.crs); }
        get position() { return [this._position[0], this._position[1]]; }
        get x() { return this._position[0]; }
        set x(x) {
            this._position[0] = x;
            this.redraw();
        }
        get y() { return this._position[1]; }
        set y(y) {
            this._position[1] = y;
            this.redraw();
        }
        get centroid() { return this.position; }
    }
    exports.FeatureGroup = FeatureGroup;
});
