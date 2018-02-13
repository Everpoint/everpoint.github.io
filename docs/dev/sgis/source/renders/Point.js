define(["require", "exports", "./Render"], function (require, exports, Render_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Point geometry rendered to the screen coordinates for drawing.
     * @alias sGis.render.Point
     */
    class Point extends Render_1.VectorRender {
        /**
         * @param coordinates - the rendered (px) coordinates of the point in [x, y] format.
         * @param __namedParameters - properties to be set to the corresponding fields.
         */
        constructor(coordinates, { color = 'black', ignoreEvents = false } = {}) {
            super();
            /** The color of the point. Can be any valid css color string. */
            this.color = 'black';
            /** Specifies whether this render can catch mouse events. If true, this render will be transparent for any pointer events. */
            this.ignoreEvents = false;
            this._coord = coordinates;
            this.color = color;
            this.ignoreEvents = ignoreEvents;
        }
        get isVector() { return true; }
        contains(position, tolerance = 2) {
            let dx = position[0] - this._coord[0];
            let dy = position[1] - this._coord[1];
            let distance2 = dx * dx + dy * dy;
            return distance2 < tolerance * tolerance;
        }
        /**
         *  The rendered (px) coordinates of the point in [x, y] format.
         */
        get coordinates() { return this._coord; }
    }
    exports.Point = Point;
});
