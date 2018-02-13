define(["require", "exports", "./Feature", "../Point", "../Bbox", "../symbols/point/Point"], function (require, exports, Feature_1, Point_1, Bbox_1, Point_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Simple geographical point.
     * @alias sGis.feature.Point
     */
    class PointFeature extends Feature_1.Feature {
        /**
         * @param {Position} position - coordinates of the point
         * @param {Object} properties - key-value set of properties to be set to the instance
         */
        constructor(position, { symbol = new Point_2.PointSymbol(), crs } = {}, extension) {
            super({ symbol, crs }, extension);
            this._position = position;
        }
        projectTo(crs) {
            let projected = Point_1.Point.prototype.projectTo.call(this, crs);
            return new PointFeature(projected.position, { crs: crs, symbol: this.symbol });
        }
        /**
         * Returns a copy of the point. The copy will include all sGis.Point properties, but will not copy of user defined properties or event listeners.
         */
        clone() {
            return this.projectTo(this.crs);
        }
        get bbox() { return new Bbox_1.Bbox(this._position, this._position, this.crs); }
        get position() { return [this._position[0], this._position[1]]; }
        set position(position) {
            this._position = position;
            this.redraw();
        }
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
        get coordinates() { return [this.position[0], this.position[1]]; }
        set coordinates(position) { this.position = [position[0], position[1]]; }
    }
    exports.PointFeature = PointFeature;
});
