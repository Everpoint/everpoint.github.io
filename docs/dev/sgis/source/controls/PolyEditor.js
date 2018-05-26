var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
define(["require", "exports", "./Control", "../geotools", "../Point", "../features/Polygon", "../commonEvents", "./snapping/PolySnappingProvider", "./snapping/SnappingMethods", "../utils/math"], function (require, exports, Control_1, geotools_1, Point_1, Polygon_1, commonEvents_1, PolySnappingProvider_1, SnappingMethods_1, math_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Control for editing polyline and polygon features. When activeFeature is set, the feature becomes draggable.
     * If a vertex is dragged, the vertex position is changed. If a side is dragged, a new point is added to the side and
     * then being dragged. If inside area of the polygon is dragged, the whole polygon will change position.
     * @alias sGis.controls.PolyEditor
     * @fires [[EditEvent]]
     * @fires [[ChangeEvent]]
     */
    class PolyEditor extends Control_1.Control {
        /**
         * @param map - map object the control will work with
         * @param __namedParameters - key-value set of properties to be set to the instance
         */
        constructor(map, _a = {}) {
            var { isActive = false, onFeatureRemove = null, hoverSnappingProvider } = _a, controlParams = __rest(_a, ["isActive", "onFeatureRemove", "hoverSnappingProvider"]);
            super(map, Object.assign({ useTempLayer: true }, controlParams));
            /** Distance from a vertex in pixels that will be considered as inside of the vertex. If the cursor is in this range from */
            this.vertexSize = 7;
            /** If user tries to remove the last point of the feature, the control will not remove it but will call this callback */
            this.onFeatureRemove = null;
            /** If set to false it will be not possible to change the shape of the feature. */
            this.vertexChangeAllowed = true;
            /** If set to false it will be not possible to move the feature as whole. */
            this.featureDragAllowed = true;
            this.ignoreEvents = false;
            this._activeRing = null;
            this._activeIndex = null;
            this.onFeatureRemove = onFeatureRemove;
            this._handleMousemove = this._handleMousemove.bind(this);
            this._handleDragStart = this._handleDragStart.bind(this);
            this._handleDrag = this._handleDrag.bind(this);
            this._handleDragEnd = this._handleDragEnd.bind(this);
            this._handleDblClick = this._handleDblClick.bind(this);
            if (hoverSnappingProvider === undefined) {
                this.hoverSnappingProvider = new PolySnappingProvider_1.PolySnappingProvider(map, { snappingMethods: [SnappingMethods_1.vertexSnapping, SnappingMethods_1.lineSnapping] });
            }
            this.isActive = isActive;
        }
        _activate() {
            if (!this._activeFeature)
                return;
            this.map.on(commonEvents_1.sGisMouseMoveEvent.type, this._handleMousemove);
            this._activeFeature.on(commonEvents_1.DragStartEvent.type, this._handleDragStart);
            this._activeFeature.on(commonEvents_1.DragEvent.type, this._handleDrag);
            this._activeFeature.on(commonEvents_1.DragEndEvent.type, this._handleDragEnd);
            this._activeFeature.on(commonEvents_1.sGisDoubleClickEvent.type, this._handleDblClick);
            this.hoverSnappingProvider.feature = this._activeFeature;
        }
        _deactivate() {
            if (!this._activeFeature)
                return;
            this.map.off(commonEvents_1.sGisMouseMoveEvent.type, this._handleMousemove);
            this._activeFeature.off(commonEvents_1.DragStartEvent.type, this._handleDragStart);
            this._activeFeature.off(commonEvents_1.DragEvent.type, this._handleDrag);
            this._activeFeature.off(commonEvents_1.DragEndEvent.type, this._handleDragEnd);
            this._activeFeature.off(commonEvents_1.sGisDoubleClickEvent.type, this._handleDblClick);
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
        _handleMousemove(event) {
            if (this.ignoreEvents) {
                this._unsnap();
                return;
            }
            this._snap(event.point.position, event.browserEvent.altKey, undefined, undefined, undefined, this.hoverSnappingProvider);
        }
        _getProjectedPoint(position, fromCrs) {
            return new Point_1.Point(position, fromCrs).projectTo(this.map.crs).position;
        }
        _handleDragStart(event) {
            if (this.ignoreEvents || !this.vertexChangeAllowed && !this.featureDragAllowed)
                return;
            let [ringIndex, pointIndex] = this._getTargetPoint(event.point);
            console.log("Vertex", ringIndex, pointIndex);
            if (ringIndex === null) {
                [ringIndex, pointIndex] = this._getTargetEdge(event.point);
                console.log("Edge", ringIndex, pointIndex);
                if (ringIndex !== null) {
                    pointIndex++;
                    this._activeFeature.insertPoint(ringIndex, pointIndex, event.point.position);
                }
            }
            this._activeRing = ringIndex;
            this._activeIndex = pointIndex;
            if (this._activeRing !== null || this.featureDragAllowed) {
                event.draggingObject = this._activeFeature;
                event.stopPropagation();
            }
        }
        _getTargetPoint(point) {
            if (!this.activeFeature)
                return [null, null];
            let closestDistanceSq = this.vertexSize * this.vertexSize * this.map.resolution * this.map.resolution;
            let closestRingIndex = null;
            let closestPointIndex = null;
            this.activeFeature.rings.forEach((ring, ringIndex) => {
                ring.forEach((coord, pointIndex) => {
                    let projected = this._getProjectedPoint(coord, this.map.crs);
                    let distanceSq = math_1.squareDistance(projected, point.position);
                    if (distanceSq < closestDistanceSq) {
                        closestDistanceSq = distanceSq;
                        closestRingIndex = ringIndex;
                        closestPointIndex = pointIndex;
                    }
                });
            });
            return [closestRingIndex, closestPointIndex];
        }
        _getTargetEdge(point) {
            if (!this.activeFeature)
                return [null, null];
            let closestDistanceSq = this.vertexSize * this.vertexSize * this.map.resolution * this.map.resolution;
            let closestRingIndex = null;
            let closestEdgeIndex = null;
            this.activeFeature.rings.forEach((ring, ringIndex) => {
                ring.forEach((coord, pointIndex) => {
                    let projectedA = this._getProjectedPoint(coord, this.map.crs);
                    let projectedB = this._getProjectedPoint(pointIndex === ring.length - 1 ? ring[0] : ring[pointIndex + 1], this.map.crs);
                    let distanceSq = geotools_1.pointToLineDistanceSquare(point.position, [projectedA, projectedB]);
                    if (distanceSq < closestDistanceSq) {
                        closestDistanceSq = distanceSq;
                        closestRingIndex = ringIndex;
                        closestEdgeIndex = pointIndex;
                    }
                });
            });
            return [closestRingIndex, closestEdgeIndex];
        }
        _handleDrag(event) {
            if (this._activeRing === null)
                return this._handleFeatureDrag(event);
            this._activeFeature.setPoint(this._activeRing, this._activeIndex, this._snap(event.point.position, event.browserEvent.altKey, this._activeFeature.rings[this._activeRing], this._activeIndex, this._activeFeature instanceof Polygon_1.Polygon));
            this._activeFeature.redraw();
            if (this.activeLayer)
                this.activeLayer.redraw();
            this.fire(new Control_1.ChangeEvent(this._activeRing, this._activeIndex));
        }
        get isDraggingVertex() { return this._activeRing !== null; }
        _handleDragEnd() {
            this._activeRing = null;
            this._activeIndex = null;
            this.fire(new Control_1.EditEvent());
        }
        _handleFeatureDrag(event) {
            geotools_1.move([this._activeFeature], [-event.offset[0], -event.offset[1]], this.map.crs);
            this._activeFeature.redraw();
            if (this.activeLayer)
                this.activeLayer.redraw();
            this.fire(new Control_1.ChangeEvent());
        }
        _handleDblClick(event) {
            if (this.ignoreEvents)
                return;
            let [ringIndex, pointIndex] = this._getTargetPoint(event.point);
            if (ringIndex === null)
                return;
            let ring = this._activeFeature.rings[ringIndex];
            let evPoint = event.point.projectTo(this._activeFeature.crs).position;
            let d1 = distance(evPoint, ring[pointIndex]);
            let nextIndex = (pointIndex + 1) % ring.length;
            let d2 = distance(evPoint, ring[nextIndex]);
            if (d2 < d1)
                pointIndex = nextIndex;
            if (ring.length > 2) {
                this._activeFeature.removePoint(ringIndex, pointIndex);
                this.fire('edit', { ringIndex: ringIndex, pointIndex: pointIndex });
            }
            else if (this._activeFeature.rings.length > 1) {
                this._activeFeature.removeRing(ringIndex);
                this.fire('edit', { ringIndex: ringIndex, pointIndex: pointIndex });
            }
            else if (this.onFeatureRemove) {
                this.onFeatureRemove();
            }
            this._unsnap();
            if (this.activeLayer)
                this.activeLayer.redraw();
            event.stopPropagation();
        }
    }
    exports.PolyEditor = PolyEditor;
    function distance(p1, p2) {
        return Math.sqrt((p1[0] - p2[0]) * (p1[0] - p2[0]) + (p1[1] - p2[1]) * (p1[1] - p2[1]));
    }
});
