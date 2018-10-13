var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
define(["require", "exports", "./Feature", "../Point", "../Bbox", "../symbols/point/Point"], function (require, exports, Feature_1, Point_1, Bbox_1, Point_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Simple geographical point.
     * @alias sGis.feature.Point
     * @example symbols/Point_Symbols
     */
    class PointFeature extends Feature_1.Feature {
        constructor(position, _a = {}) {
            var { symbol = new Point_2.PointSymbol() } = _a, params = __rest(_a, ["symbol"]);
            super(Object.assign({ symbol }, params));
            this._position = position;
        }
        projectTo(crs) {
            let projected = Point_1.Point.prototype.projectTo.call(this, crs);
            return new PointFeature(projected.position, { crs: crs, symbol: this.symbol });
        }
        /**
         * Returns a copy of the feature.
         */
        clone() {
            return this.projectTo(this.crs);
        }
        get bbox() { return new Bbox_1.Bbox(this._position, this._position, this.crs); }
        /**
         * Geographical coordinates of the point, given in the feature crs.
         */
        get position() { return [this._position[0], this._position[1]]; }
        set position(position) {
            this._position = position;
            this.redraw();
        }
        /**
         * Point object corresponding to the feature position. This is the same as position property, but also
         * includes the information about coordinate system. If set, the point will first be projected to the feature
         * crs, and then the projected coordinates will be set to the feature.
         */
        get point() { return new Point_1.Point(this.position, this.crs); }
        set point(point) { this.position = point.projectTo(this.crs).position; }
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
        /**
         * @deprecated
         */
        get coordinates() { return [this.position[0], this.position[1]]; }
        set coordinates(position) { this.position = [position[0], position[1]]; }
        get centroid() { return this.position; }
    }
    exports.PointFeature = PointFeature;
});
