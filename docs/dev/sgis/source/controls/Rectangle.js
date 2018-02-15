define(["require", "exports", "./PolyDrag"], function (require, exports, PolyDrag_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Control for drawing rectangles by dragging from corner to corner.
     * @alias sGis.controls.Rectangle
     */
    class Rectangle extends PolyDrag_1.PolyDrag {
        _getNewCoordinates(point) {
            const position = point.position;
            return [[position, position, position, position]];
        }
        _getUpdatedCoordinates(point) {
            const coord = this._activeFeature.rings[0];
            const pointCoord = point.position;
            return [[coord[0], [coord[1][0], pointCoord[1]], pointCoord, [pointCoord[0], coord[3][1]]]];
        }
    }
    exports.Rectangle = Rectangle;
});
