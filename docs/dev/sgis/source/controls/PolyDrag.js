define(["require", "exports", "./Control", "../symbols/polygon/Simple", "../features/Polygon", "../commonEvents"], function (require, exports, Control_1, Simple_1, Polygon_1, commonEvents_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Base class for controls that create polygon feature by dragging some area on the map. When the control is activated,
     * a new temporary layer is created and added to the map. The feature is drawn on that temp layer. After drawing is
     * finished, if the .activeLayer property is set, the feature is moved to the active layer.
     * @alias sGis.controls.PolyDrag
     * @fires [[DrawingBeginEvent]]
     * @fires [[DrawingFinishEvent]]
     */
    class PolyDrag extends Control_1.Control {
        /**
         * @param map - map the control will work with
         * @param __namedParameters - key-value set of properties to be set to the instance
         */
        constructor(map, { symbol = new Simple_1.PolygonSymbol(), activeLayer = null, isActive = false } = {}) {
            super(map, { activeLayer, useTempLayer: true });
            this.symbol = symbol;
            this._handleDragStart = this._handleDragStart.bind(this);
            this._handleDrag = this._handleDrag.bind(this);
            this._handleDragEnd = this._handleDragEnd.bind(this);
            this.isActive = isActive;
        }
        _activate() {
            this.map.on(commonEvents_1.DragStartEvent.type, this._handleDragStart);
        }
        _deactivate() {
            this._activeFeature = null;
            this._removeDragListeners();
            this.map.off(commonEvents_1.DragStartEvent.type, this._handleDragStart);
        }
        _handleDragStart(event) {
            this._activeFeature = new Polygon_1.Polygon(this._getNewCoordinates(event.point), { crs: event.point.crs, symbol: this.symbol });
            this._tempLayer.add(this._activeFeature);
            this.map.on(commonEvents_1.DragEvent.type, this._handleDrag);
            this.map.on(commonEvents_1.DragEndEvent.type, this._handleDragEnd);
            this.fire(new Control_1.DrawingBeginEvent());
        }
        _handleDrag(event) {
            this._activeFeature.rings = this._getUpdatedCoordinates(event.point);
            this._tempLayer.redraw();
            event.stopPropagation();
        }
        _handleDragEnd(event) {
            let feature = this._activeFeature;
            this._activeFeature = null;
            if (this._tempLayer && this._tempLayer.has(feature)) {
                this._tempLayer.remove(feature);
            }
            this._removeDragListeners();
            if (this.activeLayer)
                this.activeLayer.add(feature);
            this.fire(new Control_1.DrawingFinishEvent(feature, event.browserEvent));
        }
        _removeDragListeners() {
            this.map.off(commonEvents_1.DragEvent.type, this._handleDrag);
            this.map.off(commonEvents_1.DragEndEvent.type, this._handleDragEnd);
        }
        /**
         * The feature being drawn.
         */
        get activeFeature() { return this._activeFeature; }
    }
    exports.PolyDrag = PolyDrag;
});
