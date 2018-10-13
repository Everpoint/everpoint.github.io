define(["require", "exports", "../../serializers/symbolSerializer", "../Symbol", "../../features/PointFeature", "../../renders/Arc", "../../utils/utils"], function (require, exports, symbolSerializer_1, Symbol_1, PointFeature_1, Arc_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Symbol of point drawn as circle with outline.
     * @alias sGis.symbol.point.Point
     */
    class PointSymbol extends Symbol_1.Symbol {
        /**
         * @param options - key-value list of the properties to be assigned to the instance.
         */
        constructor(options = {}) {
            super();
            /** Diameter of the circle. */
            this.size = 10;
            this._offset = [0, 0];
            /** Color of the inner part of the circle. Can be any valid css color string. */
            this.fillColor = 'black';
            /** Color of the outline of the circle. Can be any valid css color string. */
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
            if (!(feature instanceof PointFeature_1.PointFeature))
                return [];
            let position = feature.projectTo(crs).position;
            let pxPosition = [position[0] / resolution + (this.offset[0] || 0), -position[1] / resolution + (this.offset[1] || 0)];
            return [new Arc_1.Arc(pxPosition, {
                    fillColor: this.fillColor,
                    strokeColor: this.strokeColor,
                    strokeWidth: this.strokeWidth,
                    radius: this.size / 2
                })];
        }
    }
    exports.PointSymbol = PointSymbol;
    symbolSerializer_1.registerSymbol(PointSymbol, 'point.Point', ['size', 'offset', 'fillColor', 'strokeColor', 'strokeWidth']);
});
