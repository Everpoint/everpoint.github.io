define(["require", "exports", "./Control", "../commonEvents"], function (require, exports, Control_1, commonEvents_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Control for editing point features. When activeFeature is set, the feature is becoming draggable.
     * @alias sGis.controls.PointEditor
     * @fires [[EditEvent]]
     */
    class PointEditor extends Control_1.Control {
        /**
         * @param map - map object the control will work with
         * @param __namedParameters - key-value set of properties to be set to the instance
         */
        constructor(map, { snappingProvider = null, isActive = false, activeLayer = null } = {}) {
            super(map, { useTempLayer: true, snappingProvider, activeLayer });
            this.ignoreEvents = false;
            this._handleDragStart = this._handleDragStart.bind(this);
            this._handleDrag = this._handleDrag.bind(this);
            this._handleDragEnd = this._handleDragEnd.bind(this);
            this.isActive = isActive;
        }
        _activate() {
            if (!this._activeFeature)
                return;
            this._activeFeature.on(commonEvents_1.DragStartEvent.type, this._handleDragStart);
            this._activeFeature.on(commonEvents_1.DragEvent.type, this._handleDrag);
            this._activeFeature.on(commonEvents_1.DragEndEvent.type, this._handleDragEnd);
        }
        _deactivate() {
            if (!this._activeFeature)
                return;
            this._activeFeature.off(commonEvents_1.DragStartEvent.type, this._handleDragStart);
            this._activeFeature.off(commonEvents_1.DragEvent.type, this._handleDrag);
            this._activeFeature.off(commonEvents_1.DragEndEvent.type, this._handleDragEnd);
        }
        /**
         * Point to drag. If set to null, the control is deactivated.
         */
        get activeFeature() { return this._activeFeature; }
        set activeFeature(feature) {
            this.deactivate();
            this._activeFeature = feature;
            if (feature)
                this.activate();
        }
        _handleDragStart(event) {
            if (this.ignoreEvents)
                return;
            event.draggingObject = this._activeFeature;
            event.stopPropagation();
        }
        _handleDrag(event) {
            this._activeFeature.position = this._snap(event.point.position, event.browserEvent.altKey);
            if (this.activeLayer)
                this.activeLayer.redraw();
        }
        _handleDragEnd() {
            this.fire(new Control_1.EditEvent());
        }
    }
    exports.PointEditor = PointEditor;
});
