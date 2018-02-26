var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
define(["require", "exports", "./Feature", "../Bbox", "../symbols/point/Point", "../symbols/MultiPointSymbol", "../geotools"], function (require, exports, Feature_1, Bbox_1, Point_1, MultiPointSymbol_1, geotools_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Represents a set of points on a map that behave as one feature: have same symbol, can be added, transformed or removed as one.
     * @alias sGis.feature.MultiPoint
     */
    class MultiPoint extends Feature_1.Feature {
        constructor(points = [], _a = {}) {
            var { symbol = new MultiPointSymbol_1.MultiPointSymbol(new Point_1.PointSymbol()) } = _a, params = __rest(_a, ["symbol"]);
            super(Object.assign({ symbol }, params));
            this._points = points;
        }
        /**
         * Set of points' coordinates.
         */
        get points() { return this._points; }
        set points(points) {
            this._points = points.slice();
            this._update();
        }
        projectTo(crs) {
            let projected = geotools_1.projectPoints(this.points, this.crs, crs);
            return new MultiPoint(projected, { symbol: this.symbol, crs: crs, persistOnMap: this.persistOnMap });
        }
        /**
         * Returns a copy of the feature. Only generic properties are copied.
         */
        clone() {
            return this.projectTo(this.crs);
        }
        /**
         * Adds a point to the end of the coordinates' list.
         * @param point - if sGis.IPoint instance is given, it will be automatically projected to the multipoint coordinate system.
         */
        addPoint(point) {
            if (point.position && point.crs) {
                this._points.push(point.projectTo(this.crs).position);
            }
            else {
                this._points.push([point[0], point[1]]);
            }
            this._update();
        }
        _update() {
            this._bbox = null;
            this.redraw();
        }
        get bbox() {
            if (this._bbox)
                return this._bbox;
            let xMin = Number.MAX_VALUE;
            let yMin = Number.MAX_VALUE;
            let xMax = Number.MIN_VALUE;
            let yMax = Number.MIN_VALUE;
            this._points.forEach(point => {
                xMin = Math.min(xMin, point[0]);
                yMin = Math.min(yMin, point[1]);
                xMax = Math.max(xMax, point[0]);
                yMax = Math.max(yMax, point[1]);
            });
            this._bbox = new Bbox_1.Bbox([xMin, yMin], [xMax, yMax], this.crs);
            return this._bbox;
        }
        /**
         * @deprecated
         */
        get coordinates() { return this._points.slice(); }
        set coordinates(points) { this.points = points; }
        get centroid() {
            return this.bbox.center;
        }
    }
    exports.MultiPoint = MultiPoint;
});
