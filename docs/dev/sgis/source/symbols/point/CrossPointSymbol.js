define(["require", "exports", "../Symbol", "../../features/PointFeature", "../../renders/Poly"], function (require, exports, Symbol_1, PointFeature_1, Poly_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class CrossPointSymbol extends Symbol_1.Symbol {
        /**
         * @param options - key-value list of the properties to be assigned to the instance.
         */
        constructor(options = {}) {
            super();
            /** Size of the square. */
            this.size = 11;
            /** Offset of the point from the feature position in {x: dx, y: dy} format. If set to {x:0, y:0}, center of the square will be at the position of the feature. */
            this.offset = [0, 0];
            /** Color of the outline of the square. Can be any valid css color string. */
            this.strokeColor = '#444';
            /** Width of the outline. */
            this.strokeWidth = 1;
            Object.assign(this, options);
        }
        renderFunction(feature, resolution, crs) {
            if (!(feature instanceof PointFeature_1.PointFeature))
                return [];
            let position = feature.projectTo(crs).position;
            let pxPosition = [position[0] / resolution, -position[1] / resolution];
            let halfSize = this.size / 2;
            let offset = this.offset;
            let coordinates = [
                [[pxPosition[0], pxPosition[1] - halfSize + offset[1]], [pxPosition[0], pxPosition[1] + halfSize + offset[1]]],
                [[pxPosition[0] - halfSize + offset[0], pxPosition[1]], [pxPosition[0] + halfSize + offset[0], pxPosition[1]]]
            ];
            return [new Poly_1.PolyRender(coordinates, {
                    strokeColor: this.strokeColor,
                    strokeWidth: this.strokeWidth,
                    enclosed: false,
                    fillStyle: Poly_1.FillStyle.None
                })];
        }
    }
    exports.CrossPointSymbol = CrossPointSymbol;
});
