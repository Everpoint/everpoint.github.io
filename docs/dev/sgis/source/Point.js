define(["require", "exports", "./Crs", "./utils/utils", "./utils/math"], function (require, exports, Crs_1, utils_1, math_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Simple geographical point
     * @alias sGis.Point
     */
    class Point {
        /**
         * @param position - point position
         * @param crs - point coordinate system
         */
        constructor(position, crs = Crs_1.geo) {
            this.crs = crs;
            this.position = position;
        }
        /**
         * Returns a new point with same position in new crs
         * @param newCrs - target coordinate system
         * @throws Cannot project to specified crs.
         */
        projectTo(newCrs) {
            const projection = this.crs.projectionTo(newCrs);
            if (projection) {
                return new Point(projection(this.position), newCrs);
            }
            else {
                return utils_1.error(new Error("Cannot project point to crs: " + newCrs.toString()));
            }
        }
        /**
         * Returns a copy of the point
         */
        clone() {
            return new Point(this.position, this.crs);
        }
        /**
         * Getter returns clone of this point. Setter set point position.
         */
        get point() { return this.clone(); }
        set point(point) { this.position = point.projectTo(this.crs).position; }
        get x() { return this.position[0]; }
        set x(x) { this.position[0] = x; }
        get y() { return this.position[1]; }
        set y(y) { this.position[1] = y; }
        /**
         * Returns true if the target point has the same position and crs as the current one
         * @param point - target point for comparison
         */
        equals(point) {
            return math_1.softEquals(point.x, this.x) && math_1.softEquals(point.y, this.y) && point.crs.equals(this.crs);
        }
        /**
         * Coordinates / position of this point
         */
        get coordinates() { return [this.position[0], this.position[1]]; }
        set coordinates(position) { this.position = [position[0], position[1]]; }
    }
    exports.Point = Point;
});
