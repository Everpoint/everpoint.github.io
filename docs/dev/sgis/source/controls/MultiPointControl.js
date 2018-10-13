define(["require", "exports", "./Control", "../features/MultiPoint", "../symbols/point/Point", "../commonEvents"], function (require, exports, Control_1, MultiPoint_1, Point_1, commonEvents_1) {
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
     * @fires [[DrawingBeginEvent]]
     * @fires [[PointAddEvent]]
     * @fires [[DrawingFinishEvent]]
     */
    class MultiPointControl extends Control_1.Control {
        constructor(map, { snappingProvider, activeLayer, isActive = false } = {}) {
            super(map, { snappingProvider, activeLayer, useTempLayer: true });
            this._dblClickTime = 0;
            this._activeFeature = null;
            this.dblClickTimeout = 30;
            this.symbol = new Point_1.PointSymbol();
            this._handleClick = this._handleClick.bind(this);
            this._handleDblclick = this._handleDblclick.bind(this);
            this.isActive = isActive;
        }
        _activate() {
            this.map.on(commonEvents_1.sGisClickEvent.type, this._handleClick);
        }
        _deactivate() {
            this.cancelDrawing();
            this.map.off(commonEvents_1.sGisClickEvent.type, this._handleClick);
        }
        _handleClick(event) {
            let clickEvent = event;
            setTimeout(() => {
                if (Date.now() - this._dblClickTime < this.dblClickTimeout)
                    return;
                if (this._activeFeature) {
                    this._activeFeature.addPoint(clickEvent.point);
                }
                else {
                    this.startNewFeature(clickEvent.point);
                    this.fire(new Control_1.DrawingBeginEvent());
                }
                this.fire(new Control_1.PointAddEvent());
                if (this._tempLayer)
                    this._tempLayer.redraw();
            }, 10);
            event.stopPropagation();
        }
        /**
         * Starts a new feature with the first point at given position. If the control was not active, this method will set it active.
         * @param point
         */
        startNewFeature(point) {
            this.activate();
            this.cancelDrawing();
            this._activeFeature = new MultiPoint_1.MultiPoint([point.position], { crs: this.map.crs, symbol: this.symbol });
            if (this._tempLayer)
                this._tempLayer.add(this._activeFeature);
            this._setHandlers();
        }
        _setHandlers() {
            this.map.on(commonEvents_1.sGisDoubleClickEvent.type, this._handleDblclick);
        }
        /**
         * Cancels drawing of the current feature, removes the feature and the temp layer. No events are fired.
         */
        cancelDrawing() {
            if (!this._activeFeature)
                return;
            this.map.off(commonEvents_1.sGisDoubleClickEvent.type, this._handleDblclick);
            if (this._tempLayer && this._tempLayer.has(this._activeFeature))
                this._tempLayer.remove(this._activeFeature);
            this._activeFeature = null;
        }
        _handleDblclick(event) {
            if (!this._activeFeature)
                return;
            let dblclickEvent = event;
            let feature = this._activeFeature;
            this.finishDrawing();
            event.stopPropagation();
            this._dblClickTime = Date.now();
            this.fire(new Control_1.DrawingFinishEvent(feature, dblclickEvent.browserEvent));
        }
        /**
         * Finishes drawing of the current feature and moves it to the active layer (if set).
         */
        finishDrawing() {
            let feature = this._activeFeature;
            this.cancelDrawing();
            if (this.activeLayer && feature)
                this.activeLayer.add(feature);
        }
        /**
         * The active drawing feature.
         */
        get activeFeature() { return this._activeFeature; }
        set activeFeature(feature) {
            if (!this._isActive)
                return;
            this.cancelDrawing();
            this._activeFeature = feature;
            this._setHandlers();
        }
    }
    exports.MultiPointControl = MultiPointControl;
});
