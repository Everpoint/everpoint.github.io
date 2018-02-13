define(["require", "exports", "../EventHandler", "../layers/FeatureLayer", "../features/Point", "../symbols/point/CrossPointSymbol"], function (require, exports, EventHandler_1, FeatureLayer_1, Point_1, CrossPointSymbol_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Drawing of a new feature is started. When this event is fired, the control will have a new feature as its .activeFeature property.
     * @event DrawingBeginEvent
     */
    class DrawingBeginEvent extends EventHandler_1.sGisEvent {
        constructor() {
            super(DrawingBeginEvent.type);
        }
    }
    DrawingBeginEvent.type = 'drawingBegin';
    exports.DrawingBeginEvent = DrawingBeginEvent;
    /**
     * Drawing of the current feature is finished.
     * @event DrawingFinishEvent
     */
    class DrawingFinishEvent extends EventHandler_1.sGisEvent {
        constructor(feature, browserEvent) {
            super(DrawingFinishEvent.type);
            this.feature = feature;
            this.browserEvent = browserEvent;
        }
    }
    DrawingFinishEvent.type = 'drawingFinish';
    exports.DrawingFinishEvent = DrawingFinishEvent;
    /**
     * Control's active feature has been changed. This event is fired after change process is complete, e.g. drag is over or
     * double click is processed.
     * @event EditEvent
     */
    class EditEvent extends EventHandler_1.sGisEvent {
        constructor() {
            super(EditEvent.type);
        }
    }
    EditEvent.type = 'edit';
    exports.EditEvent = EditEvent;
    /**
     * Control's active feature is being changed. This event is fired during the change, e.g. on every drag or click event.
     * @event ChangeEvent
     */
    class ChangeEvent extends EventHandler_1.sGisEvent {
        constructor(ringIndex = null, pointIndex = null) {
            super(ChangeEvent.type);
            this.ringIndex = ringIndex;
            this.pointIndex = pointIndex;
        }
    }
    ChangeEvent.type = 'change';
    exports.ChangeEvent = ChangeEvent;
    /**
     * A new point was added to the control's active feature.
     * @event PointAddEvent
     */
    class PointAddEvent extends EventHandler_1.sGisEvent {
        constructor() {
            super(PointAddEvent.type);
        }
    }
    PointAddEvent.type = 'pointAdd';
    exports.PointAddEvent = PointAddEvent;
    /**
     * Base class of all controls. Controls are objects that provide methods for setting interactions between user and map.
     * @alias sGis.Control
     */
    class Control extends EventHandler_1.EventHandler {
        /**
         * @param map - map the control will work with.
         * @param __namedParameters - key-value set of properties to be set to the instance
         */
        constructor(map, { useTempLayer = false, snappingProvider = null, activeLayer = null, isActive = false } = {}) {
            super();
            this._snappingSymbol = new CrossPointSymbol_1.CrossPointSymbol();
            this._isActive = false;
            /**
             * Temporary feature layer that is added to the map when the control is activated. It is used to show snapping point
             * and can be used as a temporary storage for features the control works with.
             */
            this._tempLayer = null;
            this._map = map;
            this.useTempLayer = useTempLayer;
            this.snappingProvider = snappingProvider;
            this.activeLayer = activeLayer;
            if (isActive)
                this.isActive = isActive;
        }
        /**
         * Makes the control active.
         */
        activate() {
            this.isActive = true;
        }
        /**
         * Makes the control inactive.
         */
        deactivate() {
            this.isActive = false;
        }
        /**
         * Active status of the control.
         */
        get isActive() { return this._isActive; }
        set isActive(bool) {
            if (!this._map || this._isActive === bool)
                return;
            this._isActive = bool;
            if (bool) {
                if (this.useTempLayer) {
                    this._tempLayer = new FeatureLayer_1.FeatureLayer();
                    this._map.addLayer(this._tempLayer);
                }
                this._activate();
            }
            else {
                this._deactivate();
                if (this._map.contains(this._tempLayer)) {
                    this._map.removeLayer(this._tempLayer);
                }
                this._tempLayer = null;
            }
        }
        /**
         * Using the provider set in .snappingProvider property, this method searches for snapping point based on given
         * parameters. If such a point is found, it adds the snapping feature to the tempLayer (if temp layer is used).
         * Then it returns the position of the snapping point as a return value.
         * If no snapping point was found, it clears the snapping feature and removes the original coordinates.
         * @param point - base point that should be snapped.
         * @param isAltPressed - whether alt key is pressed (to cancel snapping).
         * @param activeContour - active contour of the feature. This is used for axis and orthogonal snapping methods.
         * @param activeIndex - index of the active point in the contour. This is used for axis and orthogonal snapping methods.
         * @param isPolygon - specifies whether the contour should be treated as enclosed (meaning, that last and first
         *                    points should be connected.
         * @param snappingProviderOverride - if specified, this provider will be used instead of the default one.
         */
        _snap(point, isAltPressed, activeContour, activeIndex, isPolygon, snappingProviderOverride) {
            let snappingPoint = null;
            const snappingProvider = snappingProviderOverride || this.snappingProvider;
            if (!isAltPressed && snappingProvider) {
                snappingPoint = snappingProvider.getSnappingPoint(point, activeContour, activeIndex, isPolygon);
            }
            if (this._tempLayer) {
                const snappingFeature = this._getSnappingFeature(snappingPoint || point);
                if (snappingPoint && !this._tempLayer.has(snappingFeature)) {
                    this._tempLayer.add(snappingFeature);
                }
                else if (!snappingPoint && this._tempLayer.has(snappingFeature)) {
                    this._tempLayer.remove(snappingFeature);
                }
                this._tempLayer.redraw();
            }
            return snappingPoint || point;
        }
        /**
         * Removes snapping point from the temp layer.
         */
        _unsnap() {
            if (this._tempLayer && this._snappingFeature && this._tempLayer.has(this._snappingFeature)) {
                this._tempLayer.remove(this._snappingFeature);
            }
        }
        _getSnappingFeature(point) {
            if (!this._snappingFeature) {
                this._snappingFeature = new Point_1.PointFeature([0, 0], { crs: this._map.crs, symbol: this._snappingSymbol });
            }
            if (point) {
                this._snappingFeature.position = point;
            }
            return this._snappingFeature;
        }
        /**
         * Map the control works with.
         */
        get map() { return this._map; }
    }
    exports.Control = Control;
});
