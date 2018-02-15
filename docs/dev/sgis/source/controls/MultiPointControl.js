define(["require", "exports", "./Control", "../features/MultiPoint", "../symbols/point/Point"], function (require, exports, Control_1, MultiPoint_1, Point_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Control for creating multipoints. When active, every click on the map will add a new point to the current multipoint.
     * Double click will finish drawing of current multipoint and start a new one.<br><br>
     *
     * When control is activated, a temporary feature layer is created and added to the map. Feature is drawn on that temp
     * layer. After drawing is finished, if .activeLayer is set, the created feature is removed from the temp layer and
     * added to the active layer.
     *
     * @alias sGis.controls.MultiPoint
     * @extends sGis.Control
     * @fires sGis.controls.MultiPoint#drawingBegin
     * @fires sGis.controls.MultiPoint#pointAdd
     * @fires sGis.controls.MultiPoint#drawingFinish
     */
    class MultiPointControl extends Control_1.Control {
        /**
         * @param {sGis.Map} map - map the control will work with
         * @param {Object} [properties] - key-value set of properties to be set to the instance
         */
        constructor(map, { snappingProvider = null, activeLayer = null, isActive = false } = {}) {
            super(map, { snappingProvider, activeLayer, useTempLayer: true });
            this.dblClickTimeout = 30;
            this.symbol = new Point_1.PointSymbol();
            this._handleClick = this._handleClick.bind(this);
            this._handleDblclick = this._handleDblclick.bind(this);
            this.isActive = isActive;
        }
        _activate() {
            this.map.on('click', this._handleClick);
        }
        _deactivate() {
            this.cancelDrawing();
            this.map.off('click', this._handleClick);
        }
        _handleClick(sGisEvent) {
            setTimeout(() => {
                if (Date.now() - this._dblClickTime < this.dblClickTimeout)
                    return;
                if (this._activeFeature) {
                    this._activeFeature.addPoint(sGisEvent.point);
                }
                else {
                    this.startNewFeature(sGisEvent.point);
                    this.fire('drawingBegin');
                }
                this.fire('pointAdd');
                this._tempLayer.redraw();
            }, 10);
            sGisEvent.stopPropagation();
        }
        /**
         * Starts a new feature with the first point at given position. If the control was not active, this method will set it active.
         * @param {sGis.IPoint} point
         */
        startNewFeature(point) {
            this.activate();
            this.cancelDrawing();
            this._activeFeature = new MultiPoint_1.MultiPoint([point.position], { crs: this.map.crs, symbol: this.symbol });
            this._tempLayer.add(this._activeFeature);
            this._setHandlers();
        }
        _setHandlers() {
            this.map.addListener('dblclick', this._handleDblclick);
        }
        /**
         * Cancels drawing of the current feature, removes the feature and the temp layer. No events are fired.
         */
        cancelDrawing() {
            if (!this._activeFeature)
                return;
            this.map.removeListener('dblclick', this._handleDblclick);
            if (this._tempLayer.has(this._activeFeature))
                this._tempLayer.remove(this._activeFeature);
            this._activeFeature = null;
        }
        _handleDblclick(sGisEvent) {
            let feature = this._activeFeature;
            this.finishDrawing();
            sGisEvent.stopPropagation();
            this._dblClickTime = Date.now();
            this.fire('drawingFinish', { feature: feature, browserEvent: sGisEvent.browserEvent });
        }
        /**
         * Finishes drawing of the current feature and moves it to the active layer (if set).
         */
        finishDrawing() {
            let feature = this._activeFeature;
            this.cancelDrawing();
            if (this.activeLayer)
                this.activeLayer.add(feature);
        }
        /**
         * The active drawing feature.
         * @type {sGis.feature.MultiPoint}
         */
        get activeFeature() { return this._activeFeature; }
        set activeFeature(/** sGis.feature.MultiPoint */ feature) {
            if (!this._isActive)
                return;
            this.cancelDrawing();
            this._activeFeature = feature;
            this._setHandlers();
        }
    }
    exports.MultiPointControl = MultiPointControl;
});
/**
 * The drawing of a new feature is started by clicking on the map.
 * @event sGis.controls.MultiPoint#drawingBegin
 * @type {Object}
 * @mixes sGisEvent
 */
/**
 * A new point is added to the feature by clicking on the map.
 * @event sGis.controls.MultiPoint#pointAdd
 * @type {Object}
 * @mixes sGisEvent
 */
/**
 * Drawing of the feature is finished by double click and the feature is moved to the active layer (if set).
 * @event sGis.controls.MultiPoint#drawingFinish
 * @type {Object}
 * @mixes sGisEvent
 * @prop {sGis.feature.MultiPoint} feature - feature that was created
 */
