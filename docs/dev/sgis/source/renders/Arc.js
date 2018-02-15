define(["require", "exports", "./Render"], function (require, exports, Render_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Rendered arc (circle) on a map.
     * @alias sGis.render.Arc
     */
    class Arc extends Render_1.VectorRender {
        /**
         * @param center - the center of the arc, in the [x, y] format.
         * @param [options] - key-value options of any Arc parameters
         */
        constructor(center, options = {}) {
            super();
            /** The center of the arc in [x, y] format. */
            this.center = [0, 0];
            /** The radius of the arc. */
            this.radius = 5;
            /** The stroke color of the arc (outline color). The value can be any valid css color string. */
            this.strokeColor = 'black';
            /** The stroke width of the arc. */
            this.strokeWidth = 1;
            /** The fill color of the arc. The value can be any valid css color string. */
            this.fillColor = 'transparent';
            /** Specifies whether this render can catch mouse events. If true, this render will be transparent for any pointer events. */
            this.ignoreEvents = false;
            /** Start angle of the sector. */
            this.startAngle = 0;
            /** End angle of the sector. */
            this.endAngle = 2 * Math.PI;
            /** Shows whether the arc is a sector of a circle rather then simple arc. Set to false if you need to draw a circle, for sector has all its boundaries outlined. */
            this.isSector = false;
            /** Direction of the arc. */
            this.clockwise = true;
            Object.assign(this, options);
            this.center = center;
        }
        contains(position) {
            let dx = position[0] - this.center[0];
            let dy = position[1] - this.center[1];
            let distance2 = dx * dx + dy * dy;
            return distance2 < (this.radius + 2) * (this.radius + 2);
        }
        get isVector() { return true; }
    }
    exports.Arc = Arc;
});
