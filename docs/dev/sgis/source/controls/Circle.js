define(["require", "exports", "./PolyDrag"], function (require, exports, PolyDrag_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Control for drawing circles by dragging from center to the radius.
     * @alias sGis.controls.Circle
     */
    class Circle extends PolyDrag_1.PolyDrag {
        constructor() {
            super(...arguments);
            /** The number of segments of the circle. The higher this number is the smoother the circle will be. */
            this.segmentNo = 36;
        }
        _getNewCoordinates(point) {
            this._centerPoint = point.position;
            return [[]];
        }
        _getUpdatedCoordinates(point) {
            let radius = Math.sqrt(Math.pow(this._centerPoint[0] - point.position[0], 2) + Math.pow(this._centerPoint[1] - point.position[1], 2));
            let angleStep = 2 * Math.PI / this.segmentNo;
            let coordinates = [];
            for (let i = 0; i < this.segmentNo; i++) {
                coordinates.push([
                    this._centerPoint[0] + radius * Math.sin(angleStep * i),
                    this._centerPoint[1] + radius * Math.cos(angleStep * i)
                ]);
            }
            return [coordinates];
        }
    }
    exports.Circle = Circle;
});
