define(["require", "exports", "./Render", "../geotools"], function (require, exports, Render_1, geotools_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var FillStyle;
    (function (FillStyle) {
        FillStyle[FillStyle["None"] = 0] = "None";
        FillStyle[FillStyle["Color"] = 1] = "Color";
        FillStyle[FillStyle["Image"] = 2] = "Image";
    })(FillStyle = exports.FillStyle || (exports.FillStyle = {}));
    /**
     * Rendered polygon
     * @alias sGis.render.Poly
     */
    class PolyRender extends Render_1.VectorRender {
        /**
         * @param coordinates - the coordinates of the polygon.
         * @param options - properties to be assigned to the instance
         */
        constructor(coordinates, options = {}) {
            super();
            /** Whether the first and the last points should be connected. */
            this.enclosed = false;
            /** Fill style of the polygon. */
            this.fillStyle = FillStyle.Color;
            /** Stroke color of the polygon. Can be any valid css color string. */
            this.strokeColor = 'black';
            /** Fill color of the polygon. Can be any valid css color string. */
            this.fillColor = 'transparent';
            /** Stroke width of the polyline. */
            this.strokeWidth = 1;
            /** Specifies whether this render can catch mouse events. If true, this render will be transparent for any pointer events. */
            this.ignoreEvents = false;
            /** The distance (px) from the drawn line inside which the event is still considered to be inside the line. */
            this.lineContainsTolerance = 4;
            /** Dash pattern for the line as specified in HTML CanvasRenderingContext2D.setLineDash() specification. */
            this.lineDash = [];
            /** Fill image of the polygon */
            this.fillImage = null;
            Object.assign(this, options);
            this.coordinates = coordinates;
        }
        get isVector() { return true; }
        contains(position) {
            let polygonContains = geotools_1.contains(this.coordinates, position, this.strokeWidth / 2 + this.lineContainsTolerance);
            if (this.enclosed)
                return !!polygonContains;
            return Array.isArray(polygonContains) && polygonContains[1] !== this.coordinates[polygonContains[0]].length - 1;
        }
    }
    exports.PolyRender = PolyRender;
});
