define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Converts degrees to radians
     */
    exports.degToRad = d => d / 180 * Math.PI;
    /**
     * Converts radians to degrees
     */
    exports.radToDeg = r => r / Math.PI * 180;
    const TOLERANCE = 0.000001;
    /**
     * Returns true if a and b differ less then tolerance
     */
    exports.softEquals = function softEquals(a, b, tolerance = TOLERANCE) {
        return Math.abs(a - b) <= tolerance;
    };
    /**
     * Prepares the set of coordinates for matrix operations
     * @param coord
     * @param center - the center of the operation
     */
    exports.extendCoordinates = function (coord, center) {
        coord.forEach(point => {
            point[0] = point[0] - center[0];
            point[1] = point[1] - center[1];
            point[2] = 1;
        });
    };
    /**
     * Takes extended coordinates and make them plain again
     * @param coord
     * @param center - the center of the operation
     */
    exports.collapseCoordinates = function (coord, center) {
        coord.forEach(point => {
            point[0] = point[0] + center[0];
            point[1] = point[1] + center[1];
            point.splice(2, 1);
        });
    };
    /**
     * Returns a new array with simplified coordinates
     * @param rings - array of coordinate contours
     * @param tolerance - the tolerance of simplification. Points that are overflow other points or lines with given tolerance will be excluded from the result
     */
    exports.simplifyCoordinates = function (rings, tolerance) {
        let result = [];
        for (let ring = 0, l = rings.length; ring < l; ring++) {
            let simplified = [rings[ring][0]];
            for (let i = 1, len = rings[ring].length - 1; i < len; i++) {
                if (!exports.softEquals(rings[ring][i][0], simplified[simplified.length - 1][0], tolerance) || !exports.softEquals(rings[ring][i][1], simplified[simplified.length - 1][1], tolerance)) {
                    simplified.push(rings[ring][i]);
                }
            }
            if (simplified[simplified.length - 1] !== rings[ring][rings[ring].length - 1])
                simplified.push(rings[ring][rings[ring].length - 1]);
            result[ring] = simplified;
        }
        return result;
    };
    /**
     * Multiplies matrix a by matrix b
     */
    exports.multiplyMatrix = function (a, b) {
        let c = [];
        for (let i = 0, m = a.length; i < m; i++) {
            c[i] = [];
            for (let j = 0, q = b[0].length; j < q; j++) {
                c[i][j] = 0;
                for (let r = 0, n = b.length; r < n; r++) {
                    c[i][j] += a[i][r] * b[r][j];
                }
            }
        }
        return c;
    };
    exports.squareDistance = function (a, b) {
        return (a[0] - b[0]) * (a[0] - b[0]) + (a[1] - b[1]) * (a[1] - b[1]);
    };
});
