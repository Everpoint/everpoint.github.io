define(["require", "exports", "../../utils/math", "../../geotools"], function (require, exports, math_1, geotools_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.emptySnapping = (position) => {
        return position;
    };
    exports.vertexSnapping = (position, data, snappingDistance) => {
        let minSqDist = snappingDistance * snappingDistance;
        let snappingPoint = null;
        data.points.forEach(point => {
            const currSqDist = math_1.squareDistance(position, point);
            if (currSqDist < minSqDist) {
                snappingPoint = point;
                minSqDist = currSqDist;
            }
        });
        return snappingPoint;
    };
    exports.lineSnapping = (position, data, snappingDistance) => {
        let snappingPoint = null;
        let currDistanceSq = snappingDistance * snappingDistance;
        data.lines.forEach(contour => {
            for (let i = 1; i < contour.length; i++) {
                const projectedPoint = geotools_1.pointToLineProjection(position, [contour[i - 1], contour[i]]);
                let minX = Math.min(contour[i - 1][0], contour[i][0]);
                let maxX = Math.max(contour[i - 1][0], contour[i][0]);
                if (projectedPoint[0] < minX || projectedPoint[0] > maxX)
                    continue;
                const distanceSq = math_1.squareDistance(projectedPoint, position);
                if (distanceSq < currDistanceSq) {
                    currDistanceSq = distanceSq;
                    snappingPoint = projectedPoint;
                }
            }
        });
        return snappingPoint;
    };
    exports.midPointSnapping = (position, data, snappingDistance) => {
        let snappingPoint = null;
        let currDistanceSq = snappingDistance * snappingDistance;
        data.lines.forEach(contour => {
            for (let i = 1; i < contour.length; i++) {
                const midX = (contour[i - 1][0] + contour[i][0]) / 2;
                const midY = (contour[i - 1][1] + contour[i][1]) / 2;
                const distanceSq = math_1.squareDistance([midX, midY], position);
                if (distanceSq < currDistanceSq) {
                    currDistanceSq = distanceSq;
                    snappingPoint = [midX, midY];
                }
            }
        });
        return snappingPoint;
    };
    exports.axisSnapping = (position, data, snappingDistance, activeContour, activeIndex = -1, isEnclosed = false) => {
        if (!activeContour || activeIndex < 0 || activeContour.length < 2)
            return null;
        const lines = [];
        const lastIndex = activeContour.length - 1;
        if (activeIndex === 0 && isEnclosed) {
            lines.push([activeContour[0], activeContour[lastIndex]]);
        }
        if (activeIndex !== 0) {
            lines.push([activeContour[activeIndex], activeContour[activeIndex - 1]]);
        }
        if (activeIndex !== lastIndex) {
            lines.push([activeContour[activeIndex], activeContour[activeIndex + 1]]);
        }
        if (activeIndex === lastIndex && isEnclosed) {
            lines.push([activeContour[lastIndex], activeContour[0]]);
        }
        const basePoints = [];
        for (let i = 0; i < lines.length; i++) {
            for (let axis = 0; axis < 2; axis++) {
                let projection = [lines[i][axis][0], lines[i][(axis + 1) % 2][1]];
                if (Math.abs(projection[0] - position[0]) < snappingDistance && Math.abs(projection[1] - position[1]) < snappingDistance) {
                    basePoints[(axis + 1) % 2] = lines[i][1][(axis + 1) % 2];
                    break;
                }
            }
        }
        if (basePoints.length > 0) {
            return [basePoints[0] === undefined ? position[0] : basePoints[0], basePoints[1] === undefined ? position[1] : basePoints[1]];
        }
        return null;
    };
    exports.orthogonalSnapping = (position, data, snappingDistance, activeContour, activeIndex = -1, isEnclosed = false) => {
        if (!activeContour || activeIndex < 0 || activeContour.length < 3)
            return null;
        const lines = [];
        const contourLength = activeContour.length;
        if (isEnclosed) {
            lines.push([activeContour[(activeIndex + 1) % contourLength], activeContour[(activeIndex + 2) % contourLength]]);
            lines.push([activeContour[(contourLength + activeIndex - 1) % contourLength], activeContour[(contourLength + activeIndex - 2) % contourLength]]);
        }
        else {
            if (activeIndex >= 2)
                lines.push([activeContour[activeIndex - 1], activeContour[activeIndex - 2]]);
            if (activeIndex <= contourLength - 3)
                lines.push([activeContour[activeIndex + 1], activeContour[activeIndex + 2]]);
        }
        let basePoint = position;
        for (let i = 0; i < lines.length; i++) {
            let projection = geotools_1.pointToLineProjection(basePoint, lines[i]);
            let dx = projection[0] - lines[i][0][0];
            let dy = projection[1] - lines[i][0][1];
            if (Math.abs(dx) < snappingDistance && Math.abs(dy) < snappingDistance) {
                basePoint = [basePoint[0] - dx, basePoint[1] - dy];
                let direction = i === 0 ? 1 : -1;
                let nextPoint = isEnclosed ? activeContour[(contourLength + activeIndex + direction) % contourLength] : activeContour[activeIndex + direction];
                let prevPoint = isEnclosed ? activeContour[(contourLength + activeIndex - direction) % contourLength] : activeContour[activeIndex - direction];
                if (nextPoint && prevPoint) {
                    projection = geotools_1.pointToLineProjection(prevPoint, [activeContour[activeIndex], nextPoint]);
                    if (Math.abs(projection[0] - basePoint[0]) < snappingDistance && Math.abs(projection[1] - basePoint[1]) < snappingDistance) {
                        basePoint = projection;
                    }
                }
            }
        }
        if (basePoint[0] === position[0] && basePoint[1] === position[1])
            return null;
        return basePoint;
    };
});
