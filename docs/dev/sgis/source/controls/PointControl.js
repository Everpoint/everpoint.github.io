define(["require", "exports", "./Control", "../features/PointFeature", "../symbols/point/Point", "../commonEvents"], function (require, exports, Control_1, PointFeature_1, Point_1, commonEvents_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Control for creating point features. When active, any click on the map will create a new point feature and add it
     * to the active layer. If active layer is not set, the point feature will be given through 'drawingFinish' event.
     * @alias sGis.controls.Point
     * @fires [[DrawingFinishEvent]]
     */
    class PointControl extends Control_1.Control {
        /**
         * @param map
         * @param __namedParameters - key-value set of properties to be set to the instance
         */
        constructor(map, { activeLayer = null, snappingProvider = null, isActive = false, symbol = new Point_1.PointSymbol() } = {}) {
            super(map, { activeLayer, snappingProvider, useTempLayer: true });
            this._handleClick = this._handleClick.bind(this);
            this._handleMouseMove = this._handleMouseMove.bind(this);
            this.symbol = symbol;
            this.isActive = isActive;
        }
        _activate() {
            this.map.on(commonEvents_1.sGisClickEvent.type, this._handleClick);
            this.map.on(commonEvents_1.sGisMouseMoveEvent.type, this._handleMouseMove);
        }
        _deactivate() {
            this.map.off(commonEvents_1.sGisClickEvent.type, this._handleClick);
            this.map.off(commonEvents_1.sGisMouseMoveEvent.type, this._handleMouseMove);
        }
        _handleClick(event) {
            event.stopPropagation();
            let feature = new PointFeature_1.PointFeature(this._snap(event.point.position, event.browserEvent.altKey), { crs: this.map.crs, symbol: this.symbol });
            if (this.activeLayer)
                this.activeLayer.add(feature);
            this.fire(new Control_1.DrawingFinishEvent(feature, event.browserEvent));
        }
        _handleMouseMove(event) {
            this._snap(event.point.position, event.browserEvent.altKey);
        }
    }
    exports.PointControl = PointControl;
});
