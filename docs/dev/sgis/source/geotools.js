define(["require", "exports", "./Point", "./Crs", "./utils/math"], function (require, exports, Point_1, Crs_1, math_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Finds distance between two geographical points. If the coordinate system of the points can be projected to the
     * wgs84 crs, the distance will be calculated on a sphere with radius 6,371,009 meters (mean radius of the Earth).
     * @param {sGis.IPoint} a
     * @param {sGis.IPoint} b
     * @returns {Number}
     */
    exports.distance = function (a, b) {
        let l;
        if (a.crs.canProjectTo(Crs_1.wgs84)) {
            let p1 = a.projectTo(Crs_1.wgs84);
            let p2 = b.projectTo(Crs_1.wgs84);
            let lat1 = math_1.degToRad(p1.y);
            let lat2 = math_1.degToRad(p2.y);
            let dLat = lat2 - lat1;
            let dLon = math_1.degToRad(p2.x - p1.x);
            let d = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
            let c = 2 * Math.atan2(Math.sqrt(d), Math.sqrt(1 - d));
            let R = 6371009;
            l = R * c;
        }
        else {
            l = Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
        }
        return l;
    };
    /**
     * Finds geographical length of the polyline or polygon. If the coordinates cannot be projected to wgs84 crs,
     * simple geometrical length will be returned.
     * @param {Position[][]} rings - the set of coordinates
     * @param {sGis.Crs} crs - coordinate system
     * @param {Boolean} [enclose=false] - if set to true, the geometry is treated as polygon, meaning that the result
     *                                    will also include the distance between first and last point of every contour
     * @returns {Number}
     */
    exports.length = function (rings, crs, enclose = false) {
        let length = 0;
        let ringTemp;
        for (let ring = 0, l = rings.length; ring < l; ring++) {
            ringTemp = [].concat(rings[ring]);
            if (enclose)
                ringTemp.push(ringTemp[0]);
            for (let i = 0, m = ringTemp.length - 1; i < m; i++) {
                length += exports.distance(new Point_1.Point(ringTemp[i], crs), new Point_1.Point(ringTemp[i + 1], crs));
            }
        }
        return length;
    };
    /**
     * Finds geographical area of the polygon. If the coordinates cannot be projected to wgs84 crs, simple geometrical
     * area will be returned.
     * @param {Position[][]} rings - coordinates of the polygon
     * @param {sGis.Crs} crs - coordinate system
     * @returns {Number}
     */
    exports.area = function (rings, crs) {
        let projected;
        if (crs.canProjectTo(Crs_1.conicEqualArea)) {
            projected = exports.projectRings(rings, crs, Crs_1.conicEqualArea);
        }
        else {
            projected = rings;
        }
        let area = 0;
        projected.forEach(ring => area += polygonArea(ring));
        return area;
    };
    /**
     * Projects the set of coordinates from one coordinate system to another.
     * If the coordinates cannot be projected, exception will be thrown.
     * @param {Position[][]} rings - coordinates
     * @param {sGis.Crs} fromCrs - source coordinate system
     * @param {sGis.Crs} toCrs - target coordinate system
     * @returns {Position[][]} - new array with projected coordinates
     */
    exports.projectRings = function (rings, fromCrs, toCrs) {
        let projection = fromCrs.projectionTo(toCrs);
        let result = [];
        rings.forEach(ring => {
            let projectedRing = [];
            ring.forEach(position => {
                projectedRing.push(projection(position));
            });
            result.push(projectedRing);
        });
        return result;
    };
    exports.projectPoints = function (ring, fromCrs, toCrs) {
        let projection = fromCrs.projectionTo(toCrs);
        let projectedRing = [];
        ring.forEach(position => {
            projectedRing.push(projection(position));
        });
        return projectedRing;
    };
    function polygonArea(coord) {
        coord = coord.concat([coord[0]]);
        let area = 0;
        for (let i = 0, l = coord.length - 1; i < l; i++) {
            area += (coord[i][0] + coord[i + 1][0]) * (coord[i][1] - coord[i + 1][1]);
        }
        return Math.abs(area / 2);
    }
    /**
     * Returns a point on the line, closest to the given point
     * @param {Position} point
     * @param {Position[]} line - line coordinates in the form [[x1, y1], [x2, y2]]
     * @returns {Position}
     */
    exports.pointToLineProjection = function (point, line) {
        if (line[0][0] === line[1][0]) {
            return [line[0][0], point[1]];
        }
        else if (line[0][1] === line[1][1]) {
            return [point[0], line[0][1]];
        }
        else {
            let lx = line[1][0] - line[0][0];
            let ly = line[1][1] - line[0][1];
            let dx = line[0][0] - point[0];
            let dy = line[0][1] - point[1];
            let t = -(dx * lx + dy * ly) / (lx * lx + ly * ly);
            let x = line[0][0] + t * lx;
            let y = line[0][1] + t * ly;
            return [x, y];
        }
    };
    /**
     * Checks if a point is located inside a polygon.
     * @param {Number[]} polygon - coordinates of polygon in format [[[x11, y11], [x12, y12], ...], [x21, y21], [x22, y22], ...], ...]. If there is only one counter outer array can be omitted.
     * @param {number[]} point - coordinates of the point [x, y]
     * @param {Number} [tolerance=0] - the tolerance of check. If the point is out of the polygon, but is closer then tolerance, the returned result will be true.
     * @returns {boolean|Array} - true, if the point is inside of polygon, [ring, index] - index of vertex if the point is closer then 'tolerance' to one of the sides of polygon, false otherwise
     */
    exports.contains = function (polygon, point, tolerance = 0) {
        let intersectionCount = 0;
        let adjusted = Array.isArray(polygon[0][0]) ? polygon : [polygon];
        for (let ring = 0, l = adjusted.length; ring < l; ring++) {
            let points = adjusted[ring].concat([adjusted[ring][0]]);
            let prevD = points[0][0] - point[0];
            let prevH = points[0][1] > point[1];
            for (let i = 1; i < points.length; i++) {
                if (exports.pointToLineDistance(point, [points[i - 1], points[i]]) <= tolerance) {
                    return [ring, i - 1];
                }
                let D = points[i][0] - point[0];
                let H = points[i][1] > point[1];
                if (!H !== !prevH //otherwise line does not intersect horizontal line
                    && (D > 0 || prevD > 0) //line is to the left from the point, but we look to the right
                ) {
                    if (!(point[1] === points[i][1] && point[1] === points[i - 1][1])) {
                        if (exports.intersects([[points[i][0], points[i][1]], [points[i - 1][0], points[i - 1][1]]], [point, [Math.max(points[i][0], points[i - 1][0]), point[1]]])) {
                            intersectionCount++;
                        }
                    }
                }
                prevD = D;
                prevH = H;
            }
        }
        return intersectionCount % 2 === 1;
    };
    /**
     * Returns the minimum distance between the given point and line.
     * @param point
     * @param line - line coordinates in the form [[x1, y1], [x2, y2]]
     */
    exports.pointToLineDistance = function (point, line) {
        return Math.sqrt(exports.pointToLineDistanceSquare(point, line));
    };
    /**
     * Returns the minimum square distance between the given point and line.
     * @param point
     * @param line
     */
    exports.pointToLineDistanceSquare = function (point, line) {
        let lx = line[1][0] - line[0][0];
        let ly = line[1][1] - line[0][1];
        let dx = line[0][0] - point[0];
        let dy = line[0][1] - point[1];
        let t = 0 - (dx * lx + dy * ly) / (lx * lx + ly * ly);
        t = t < 0 ? 0 : t > 1 ? 1 : t;
        return Math.pow(lx * t + dx, 2) + Math.pow(ly * t + dy, 2);
    };
    /**
     * Returns true if the given lines have at least one common point.
     * @param {Position[]} line1 - line coordinates in the form [[x1, y1], [x2, y2]]
     * @param {Position[]} line2 - line coordinates in the form [[x1, y1], [x2, y2]]
     * @returns {Boolean}
     */
    exports.intersects = function (line1, line2) {
        if (line1[0][0] === line1[1][0]) {
            return line1[0][0] > line2[0][0];
        }
        else {
            let k = (line1[0][1] - line1[1][1]) / (line1[0][0] - line1[1][0]);
            let b = line1[0][1] - k * line1[0][0];
            let x = (line2[0][1] - b) / k;
            return x > line2[0][0];
        }
    };
    /**
     * Returns the angle of line relative to horizon in radians. The value can be from -PI to PI, first point is considered base point for rotation.
     * @param {Position[]} line - line coordinates in the form [[x1, y1], [x2, y2]]
     * @return {Number}
     */
    exports.getLineAngle = function (line) {
        if (line[0][0] === line[1][0] && line[0][1] === line[1][1])
            return NaN;
        let x = line[1][0] - line[0][0];
        let y = line[1][1] - line[0][1];
        let cos = x / Math.sqrt(x * x + y * y);
        return y >= 0 ? Math.acos(cos) : -Math.acos(cos);
    };
    /**
     * Returns a point at the specified distance and angle relative to horizon from origin point
     * @param {Position} point - origin point
     * @param {Number} angle - angle in radians
     * @param {Number} distance - distance
     * @returns {Position}
     */
    exports.getPointFromAngleAndDistance = function (point, angle, distance) {
        return [point[0] + Math.cos(angle) * distance, point[1] + Math.sin(angle) * distance];
    };
    /**
     * Returns false if polygon has self-intersection, segments of zero length or contours with less then 3 points
     * @param {sGis.feature.Polygon|Position[][]} polygon  - polygon feature or coordinates
     * @returns {Boolean}
     */
    exports.isPolygonValid = function (polygon) {
        let coordinates = polygon.rings ? polygon.rings : polygon;
        if (coordinates.length === 0)
            return false;
        for (let ring = 0; ring < coordinates.length; ring++) {
            if (coordinates[ring].length <= 2)
                return false;
            for (let i = 0; i < coordinates[ring].length; i++) {
                let p1 = coordinates[ring][i];
                let p2 = coordinates[ring][i + 1] || coordinates[ring][0];
                if (p1[0] == p2[0] && p1[1] === p2[1])
                    return false;
                if (hasIntersection(coordinates, [p1, p2], [ring, i]))
                    return false;
            }
        }
        return true;
    };
    function hasIntersection(coordinates, line, exc) {
        for (let ring = 0; ring < coordinates.length; ring++) {
            for (let i = 0; i < coordinates[ring].length; i++) {
                if (ring === exc[0] && (Math.abs(i - exc[1]) < 2 || exc[1] === 0 && i === coordinates[ring].length - 1 || i === 0 && exc[1] === coordinates[ring].length - 1))
                    continue;
                if (lineIntersects([coordinates[ring][i], coordinates[ring][i + 1] || coordinates[ring][0]], line))
                    return true;
            }
        }
        return false;
    }
    function lineIntersects(l1, l2) {
        let o1 = orient(l1[0], l1[1], l2[0]);
        let o2 = orient(l1[0], l1[1], l2[1]);
        let o3 = orient(l2[0], l2[1], l1[0]);
        let o4 = orient(l2[0], l2[1], l1[1]);
        if (o1 !== o2 && o3 !== o4)
            return true;
        if (o1 === 0 && onSegment(l1[0], l2[0], l1[1]))
            return true;
        if (o2 === 0 && onSegment(l1[0], l2[1], l1[1]))
            return true;
        if (o3 === 0 && onSegment(l2[1], l1[0], l2[1]))
            return true;
        if (o4 === 0 && onSegment(l2[1], l1[1], l2[1]))
            return true;
        return false;
    }
    function orient(p, q, r) {
        let val = (q[1] - p[1]) * (r[0] - q[0]) - (q[0] - p[0]) * (r[1] - q[1]);
        if (Math.abs(val) < 0.000001)
            return 0;
        return val > 0 ? 1 : 2;
    }
    function onSegment(p, q, r) {
        return (q[0] <= Math.max(p[0], r[0]) && q[0] >= Math.min(p[0], r[0])) &&
            (q[1] <= Math.max(p[1], r[1]) && q[1] >= Math.min(p[1], r[1]));
    }
    /**
     * Applies matrix transformation on each feature in the set
     * @param {sGis.Feature[]} features
     * @param {Number[][]} matrix - transformation matrix
     * @param {IPoint|Position} center - the center of transformation
     * @param {sGis.Crs} [mapCrs] - coordinate system of transformation. If not specified, transformation will be preformed
     * on the coordinates as is. This will result in errors with any non-cartesian coordinates (like lat/lon).
     */
    exports.transform = function (features, matrix, center, mapCrs = null) {
        if (Array.isArray(features)) {
            features.forEach(feature => transformFeature(feature, matrix, center, mapCrs));
        }
        else {
            transformFeature(features, matrix, center, mapCrs);
        }
    };
    /**
     * Rotates the features around given point
     * @param {sGis.Feature[]} features
     * @param {Number} angle - rotation angle in radians. Positive values stand for counterclockwise rotation.
     * @param {IPoint|Position} center - rotation center
     * @param {sGis.Crs} [mapCrs] - coordinate system of transformation. If not specified, transformation will be preformed
     * on the coordinates as is. This will result in errors with any non-cartesian coordinates (like lat/lon).
     */
    exports.rotate = function (features, angle, center, mapCrs = null) {
        let sin = Math.sin(angle);
        let cos = Math.cos(angle);
        exports.transform(features, [[cos, sin, 0], [-sin, cos, 0], [0, 0, 1]], center, mapCrs);
    };
    /**
     * Scales the features
     * @param {sGis.Feature[]} features
     * @param {Number} scale - the magnitude of scaling. E.g. value of 2 means that the size of features will be increased 2 times.
     * @param {Position} center - center of scaling
     * @param {sGis.Crs} [mapCrs] - coordinate system of transformation. If not specified, transformation will be preformed
     * on the coordinates as is. This will result in errors with any non-cartesian coordinates (like lat/lon).
     */
    exports.scale = function (features, scale, center, mapCrs = null) {
        exports.transform(features, [[scale[0], 0, 0], [0, scale[1], 0], [0, 0, 1]], center, mapCrs);
    };
    /**
     * Moves the features
     * @param {sGis.Feature[]} features
     * @param {Number[]} translate - moving values in form [dx, dy]
     * @param {sGis.Crs} [mapCrs] - coordinate system of transformation. If not specified, transformation will be preformed
     * on the coordinates as is. This will result in errors with any non-cartesian coordinates (like lat/lon).
     */
    exports.move = function (features, translate, mapCrs = null) {
        exports.transform(features, [[1, 0, 0], [0, 1, 1], [translate[0], translate[1], 1]], [0, 0], mapCrs);
    };
    function transformFeature(feature, matrix, center, mapCrs = null) {
        let targetCrs = mapCrs || feature.crs;
        let base = center.crs ? center.projectTo(targetCrs).position : center;
        if (feature.rings) {
            let rings = feature.rings;
            if (targetCrs !== feature.crs) {
                rings = exports.projectRings(rings, feature.crs, targetCrs);
            }
            transformRings(rings, matrix, base);
            if (targetCrs !== feature.crs) {
                rings = exports.projectRings(rings, targetCrs, feature.crs);
            }
            feature.rings = rings;
        }
        else if (feature.points) {
            let points = feature.points;
            if (targetCrs !== feature.crs) {
                points = exports.projectRings([points], feature.crs, targetCrs)[0];
            }
            points = transformRing(points, matrix, base);
            if (targetCrs !== feature.crs) {
                points = exports.projectRings([points], targetCrs, feature.crs)[0];
            }
            feature.points = points;
        }
        else if (feature.position) {
            let points = [feature.position];
            if (targetCrs !== feature.crs) {
                points = exports.projectRings([points], feature.crs, targetCrs)[0];
            }
            points = transformRing(points, matrix, base);
            if (targetCrs !== feature.crs) {
                points = exports.projectRings([points], targetCrs, feature.crs)[0];
            }
            feature.position = points[0];
        }
    }
    function transformRings(rings, matrix, base) {
        rings.forEach((ring, index) => {
            rings[index] = transformRing(ring, matrix, base);
        });
    }
    function transformRing(ring, matrix, base) {
        math_1.extendCoordinates(ring, base);
        let transformed = math_1.multiplyMatrix(ring, matrix);
        math_1.collapseCoordinates(transformed, base);
        return transformed;
    }
});
