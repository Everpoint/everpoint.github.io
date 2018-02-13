define(["require", "exports", "./Crs", "./Point", "./utils/math", "./utils/utils"], function (require, exports, Crs_1, Point_1, math_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Object representing a rectangular area on a map between two points.
     * @alias sGis.Bbox
     */
    class Bbox {
        /**
         * Resulting rectangle will be the minimum rectangle that includes both points. The order and relative position of
         * points can be arbitrary.
         * @param point1 - first corner point of rectangle
         * @param point2 - second corner point of rectangle
         * @param crs - coordinate system of the point coordinates
         */
        constructor(point1, point2, crs = Crs_1.geo) {
            this._crs = crs;
            this._p = [Math.min(point1[0], point2[0]), Math.min(point1[1], point2[1]), Math.max(point1[0], point2[0]), Math.max(point1[1], point2[1])];
        }
        /**
         * Returns a new Bbox in the specified coordinate system
         * @param crs - target coordinate system
         * @throws If the instance coordinates cannot be projected into the target crs
         */
        projectTo(crs) {
            let projected1 = new Point_1.Point([this._p[0], this._p[1]], this._crs).projectTo(crs).position;
            let projected2 = new Point_1.Point([this._p[2], this._p[3]], this._crs).projectTo(crs).position;
            return new Bbox(projected1, projected2, crs);
        }
        /**
         * Center point of the bounding box
         */
        get center() { return new Point_1.Point([(this.xMax + this.xMin) / 2, (this.yMax + this.yMin) / 2], this.crs); }
        /**
         * Returns a copy of the bbox
         */
        clone() {
            return this.projectTo(this._crs);
        }
        /**
         * Returns true if the given bbox is equal (geographically) to the target bbox. It will return false if the target
         * bbox is set in different coordinate system or if any of the 4 coordinates are different by more then 0.0001%.
         * @param bbox - target bbox
         */
        equals(bbox) {
            let target = bbox.coordinates;
            for (let i = 0; i < 4; i++)
                if (!math_1.softEquals(this._p[i], target[i]))
                    return false;
            return this._crs.equals(bbox.crs);
        }
        /**
         * Returns combination of the current bbox with the given one. It will include be a minimum rectangle that includes
         * both bboxes.
         * @param bbox
         */
        intersect(bbox) {
            bbox = bbox.crs === this.crs ? bbox : bbox.projectTo(this.crs);
            return new Bbox([Math.min(this.xMin, bbox.xMin), Math.min(this.yMin, bbox.yMin)], [Math.max(this.xMax, bbox.xMax), Math.max(this.yMax, bbox.yMax)], this.crs);
        }
        /**
         * Returns true if at list one point of the given bbox lies inside the target bbox.
         * <br><bNOTE</b> that this method will return true if on of the bboxes is completely inside the other.
         * It will return false if bboxes are adjustened, e.g. a side of one bbox touches a side of another one.
         * @param bbox - target bbox
         */
        intersects(bbox) {
            let projected = bbox.projectTo(this._crs);
            return this.xMax > projected.xMin && this.xMin < projected.xMax && this.yMax > projected.yMin && this.yMin < projected.yMax;
        }
        /**
         * Returns true, if the target point is inside the bbox or lies on one of its sides
         * @param point
         */
        contains(point) {
            let projected = point.projectTo(this.crs);
            return this.xMin <= projected.x && this.xMax >= projected.x && this.yMin <= projected.y && this.yMax >= projected.y;
        }
        /**
         * Coordinate system of the bbox.
         */
        get crs() { return this._crs; }
        /**
         * Coordinate of the right border of the bbox. Cannot be assigned value less then xMin.
         */
        get xMax() { return this._p[2]; }
        set xMax(value) {
            if (value < this.xMin)
                utils_1.error('Max value cannot be lower than the min value');
            this._p[2] = value;
        }
        /**
         * Coordinate of the top border of the bbox. Cannot be assigned value less then yMin.
         */
        get yMax() { return this._p[3]; }
        set yMax(value) {
            if (value < this.yMin)
                utils_1.error('Max value cannot be lower than the min value');
            this._p[3] = value;
        }
        /**
         * Coordinate of the left border of the bbox. Cannot be assigned value larger then xMax.
         */
        get xMin() { return this._p[0]; }
        set xMin(value) {
            if (value > this.xMax)
                utils_1.error('Min value cannot be higher than the max value');
            this._p[0] = value;
        }
        /**
         * Coordinate of the bottom border of the bbox. Cannot be assigned value larger then yMax.
         */
        get yMin() { return this._p[1]; }
        set yMin(value) {
            if (value > this.yMax)
                utils_1.error('Min value cannot be higher than the max value');
            this._p[1] = value;
        }
        /**
         * Width of the bbox.
         */
        get width() { return this.xMax - this.xMin; }
        /**
         * Height of the bbox.
         */
        get height() { return this.yMax - this.yMin; }
        /**
         * Coordinates of the bbox in the form [xMin, yMin, xMax, yMax].
         */
        get coordinates() { return [this._p[0], this._p[1], this._p[2], this._p[3]]; }
        /**
         * Creates a bbox from a point and offset. The created bbox will be a square area around the point min and max
         * coordinates of which are 'offset' away from the point. Bbox will have point's crs.
         * @param point - center point of created bbox.
         * @param offset - distance from center to the borders of bbox.
         */
        static fromPoint(point, offset) {
            return new Bbox([point.x - offset, point.y - offset], [point.x + offset, point.y + offset], point.crs);
        }
        offset(offset) {
            return new Bbox([this.xMin - offset[0], this.yMin - offset[1]], [this.xMax + offset[0], this.yMax + offset[1]], this.crs);
        }
    }
    exports.Bbox = Bbox;
});
