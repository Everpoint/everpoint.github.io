define(["require", "exports", "./Control", "../symbols/point/Point", "../symbols/point/Square", "../features/Point", "../geotools", "../commonEvents", "../EventHandler"], function (require, exports, Control_1, Point_1, Square_1, Point_2, geotools_1, commonEvents_1, EventHandler_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @event RotationStartEvent
     */
    class RotationStartEvent extends EventHandler_1.sGisEvent {
        constructor() {
            super(RotationStartEvent.type);
        }
    }
    RotationStartEvent.type = 'rotationStart';
    exports.RotationStartEvent = RotationStartEvent;
    /**
     * @event RotationEndEvent
     */
    class RotationEndEvent extends EventHandler_1.sGisEvent {
        constructor() {
            super(RotationEndEvent.type);
        }
    }
    RotationEndEvent.type = 'rotationEnd';
    exports.RotationEndEvent = RotationEndEvent;
    /**
     * @event ScalingStartEvent
     */
    class ScalingStartEvent extends EventHandler_1.sGisEvent {
        constructor() {
            super(ScalingStartEvent.type);
        }
    }
    ScalingStartEvent.type = 'scalingStart';
    exports.ScalingStartEvent = ScalingStartEvent;
    /**
     * @event ScalingEndEvent
     */
    class ScalingEndEvent extends EventHandler_1.sGisEvent {
        constructor() {
            super(ScalingEndEvent.type);
        }
    }
    ScalingEndEvent.type = 'scalingEnd';
    exports.ScalingEndEvent = ScalingEndEvent;
    /**
     * Control for modifying polylines or polygons as whole. When activeFeature is set, it shows points around the feature
     * dragging which one can scale or rotate the feature.
     * @alias sGis.controls.PolyTransform
     * @fires [[RotationStartEvent]]
     * @fires [[RotationEndEvent]]
     * @fires [[ScalingStartEvent]]
     * @fires [[ScalingEndEvent]]
     */
    class PolyTransform extends Control_1.Control {
        /**
         * @param map - map object the control will work with
         * @param __namedParameters - key-value set of properties to be set to the instance
         */
        constructor(map, { activeLayer = null, isActive = false } = {}) {
            super(map, { activeLayer, useTempLayer: true });
            /** Symbol of the rotation handle. */
            this.rotationHandleSymbol = new Point_1.PointSymbol({ offset: [0, -30] });
            /** Symbol of the scaling handles. */
            this.scaleHandleSymbol = new Square_1.SquareSymbol({ fillColor: 'transparent', strokeColor: 'black', strokeWidth: 2, size: 7 });
            /** Distance in pixels between scaling handles and feature bbox. */
            this.scaleHandleOffset = 12;
            /** If set to false the rotation handle will not be displayed. */
            this.enableRotation = true;
            /** If set to false the scaling handle will not be displayed. */
            this.enableScaling = true;
            this.ignoreEvents = false;
            this._handleRotationStart = this._handleRotationStart.bind(this);
            this._handleRotation = this._handleRotation.bind(this);
            this._handleRotationEnd = this._handleRotationEnd.bind(this);
            this._handleScalingEnd = this._handleScalingEnd.bind(this);
            this.isActive = isActive;
        }
        /**
         * Feature to edit. If set to null, the control is deactivated.
         */
        get activeFeature() { return this._activeFeature; }
        set activeFeature(feature) {
            this.deactivate();
            this._activeFeature = feature;
            if (feature)
                this.activate();
        }
        /**
         * Updates position of the editor handles.
         */
        update() { if (this._activeFeature)
            this._updateHandles(); }
        _activate() {
            if (!this._activeFeature)
                return;
            this._setHandles();
        }
        _deactivate() {
            return;
        }
        _setHandles() {
            if (this.enableRotation)
                this._setRotationHandle();
            if (this.enableScaling)
                this._setScaleHandles();
        }
        _setRotationHandle() {
            this._rotationHandle = new Point_2.PointFeature([0, 0], { crs: this.map.crs, symbol: this.rotationHandleSymbol });
            this._updateRotationHandle();
            this._rotationHandle.on(commonEvents_1.DragStartEvent.type, this._handleRotationStart);
            this._rotationHandle.on(commonEvents_1.DragEvent.type, this._handleRotation);
            this._rotationHandle.on(commonEvents_1.DragEndEvent.type, this._handleRotationEnd);
            this._tempLayer.add(this._rotationHandle);
        }
        _setScaleHandles() {
            this._scaleHandles = [];
            for (let i = 0; i < 9; i++) {
                if (i === 4)
                    continue;
                let symbol = this.scaleHandleSymbol.clone();
                let xk = i % 3 - 1;
                let yk = 1 - Math.floor(i / 3);
                symbol.offset = [this.scaleHandleOffset * xk, this.scaleHandleOffset * yk];
                this._scaleHandles[i] = new Point_2.PointFeature([0, 0], { symbol: symbol, crs: this.map.crs });
                this._scaleHandles[i].on(commonEvents_1.DragStartEvent.type, this._handleScalingStart.bind(this, i));
                this._scaleHandles[i].on(commonEvents_1.DragEvent.type, this._handleScaling.bind(this, i));
                this._scaleHandles[i].on(commonEvents_1.DragEndEvent.type, this._handleScalingEnd);
            }
            this._tempLayer.add(this._scaleHandles);
            this._updateScaleHandles();
        }
        _handleRotationStart(event) {
            if (this.ignoreEvents)
                return;
            this._rotationBase = this._activeFeature.bbox.center.projectTo(this.map.crs).position;
            event.draggingObject = this._rotationHandle;
            event.stopPropagation();
            this.fire(new RotationStartEvent());
        }
        _handleRotation(event) {
            let xPrev = event.point.x + event.offset[0];
            let yPrev = event.point.y + event.offset[1];
            let alpha1 = xPrev === this._rotationBase[0] ? Math.PI / 2 : Math.atan2(yPrev - this._rotationBase[1], xPrev - this._rotationBase[0]);
            let alpha2 = event.point.x === this._rotationBase[0] ? Math.PI / 2 : Math.atan2(event.point.y - this._rotationBase[1], event.point.x - this._rotationBase[0]);
            let angle = alpha2 - alpha1;
            geotools_1.rotate([this._activeFeature], angle, this._rotationBase, this.map.crs);
            if (this.activeLayer)
                this.activeLayer.redraw();
            this._updateHandles();
        }
        _handleRotationEnd() {
            this.fire(new RotationEndEvent());
        }
        _updateHandles() {
            if (this.enableRotation)
                this._updateRotationHandle();
            if (this.enableScaling)
                this._updateScaleHandles();
            this._tempLayer.redraw();
        }
        _updateRotationHandle() {
            let bbox = this._activeFeature.bbox.projectTo(this.map.crs);
            this._rotationHandle.position = [(bbox.xMin + bbox.xMax) / 2, bbox.yMax];
        }
        _updateScaleHandles() {
            let bbox = this._activeFeature.bbox.projectTo(this.map.crs);
            let xs = [bbox.xMin, (bbox.xMin + bbox.xMax) / 2, bbox.xMax];
            let ys = [bbox.yMin, (bbox.yMin + bbox.yMax) / 2, bbox.yMax];
            for (let i = 0; i < 9; i++) {
                if (i === 4)
                    continue;
                this._scaleHandles[i].position = [xs[i % 3], ys[Math.floor(i / 3)]];
            }
        }
        _handleScalingStart(index, event) {
            if (this.ignoreEvents)
                return;
            event.draggingObject = this._scaleHandles[index];
            event.stopPropagation();
            this.fire(new ScalingStartEvent());
        }
        _handleScaling(index, event) {
            const MIN_SIZE = 10;
            let xIndex = index % 3;
            let yIndex = Math.floor(index / 3);
            let baseX = xIndex === 0 ? 2 : xIndex === 2 ? 0 : 1;
            let baseY = yIndex === 0 ? 2 : yIndex === 2 ? 0 : 1;
            let basePoint = this._scaleHandles[baseX + 3 * baseY].position;
            let bbox = this._activeFeature.bbox.projectTo(this.map.crs);
            let resolution = this.map.resolution;
            let tolerance = MIN_SIZE * resolution;
            let width = bbox.width;
            let xScale = baseX === 1 ? 1 : (width + (baseX - 1) * event.offset[0]) / width;
            if (width < tolerance && xScale < 1)
                xScale = 1;
            let height = bbox.height;
            let yScale = baseY === 1 ? 1 : (height + (baseY - 1) * event.offset[1]) / height;
            if (height < tolerance && yScale < 1)
                yScale = 1;
            geotools_1.scale([this._activeFeature], [xScale, yScale], basePoint, this.map.crs);
            if (this.activeLayer)
                this.activeLayer.redraw();
            this._updateHandles();
        }
        _handleScalingEnd() {
            this.fire(new ScalingEndEvent());
        }
    }
    exports.PolyTransform = PolyTransform;
});
