define(["require", "exports", "../../serializers/symbolSerializer", "../../renders/Poly", "../Symbol", "../../features/Point", "../../utils/utils"], function (require, exports, symbolSerializer_1, Poly_1, Symbol_1, Point_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Symbol of point drawn as a square.
     * @alias sGis.symbol.point.Square
     */
    class SquareSymbol extends Symbol_1.Symbol {
        /**
         * @param options - key-value list of the properties to be assigned to the instance.
         */
        constructor(options = {}) {
            super();
            /** Size of the square. */
            this.size = 10;
            this._offset = [0, 0];
            /** Color of the inner part of the square. Can be any valid css color string. */
            this.fillColor = 'black';
            /** Color of the outline of the square. Can be any valid css color string. */
            this.strokeColor = 'transparent';
            /** Width of the outline. */
            this.strokeWidth = 1;
            Object.assign(this, options);
        }
        /** Offset of the point from the feature position. If set to [0, 0], center of the circle will be at the position of the feature. */
        get offset() { return this._offset; }
        set offset(value) {
            // TODO: remove deprecated part after 2018
            let deprecated = value;
            if (deprecated.x !== undefined && deprecated.y !== undefined) {
                utils_1.warn('Using anchorPoint in {x, y} format is deprecated. Use [x, y] format instead.');
                this._offset = [deprecated.x, deprecated.y];
            }
            else {
                this._offset = value;
            }
        }
        renderFunction(feature, resolution, crs) {
            if (!(feature instanceof Point_1.PointFeature))
                return [];
            let position = feature.projectTo(crs).position;
            let pxPosition = [position[0] / resolution, -position[1] / resolution];
            let halfSize = this.size / 2;
            let offset = this.offset;
            let coordinates = [[
                    [pxPosition[0] - halfSize + offset[0], pxPosition[1] - halfSize + offset[1]],
                    [pxPosition[0] - halfSize + offset[0], pxPosition[1] + halfSize + offset[1]],
                    [pxPosition[0] + halfSize + offset[0], pxPosition[1] + halfSize + offset[1]],
                    [pxPosition[0] + halfSize + offset[0], pxPosition[1] - halfSize + offset[1]]
                ]];
            return [new Poly_1.PolyRender(coordinates, {
                    fillColor: this.fillColor,
                    strokeColor: this.strokeColor,
                    strokeWidth: this.strokeWidth,
                    enclosed: true,
                    fillStyle: Poly_1.FillStyle.Color
                })];
        }
    }
    exports.SquareSymbol = SquareSymbol;
    symbolSerializer_1.registerSymbol(SquareSymbol, 'point.Square', ['size', 'offset', 'fillColor', 'strokeColor', 'strokeWidth']);
});
