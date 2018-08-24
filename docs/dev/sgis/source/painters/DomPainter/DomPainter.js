define(["require", "exports", "../../Point", "./EventDispatcher", "./LayerRenderer", "./Container", "../../Map", "../../Bbox", "../../utils/utils", "../../utils/math", "../../EventHandler", "../../LayerGroup", "../../commonEvents"], function (require, exports, Point_1, EventDispatcher_1, LayerRenderer_1, Container_1, Map_1, Bbox_1, utils_1, math_1, EventHandler_1, LayerGroup_1, commonEvents_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let innerWrapperStyle = 'position: relative; overflow: hidden; width: 100%; height: 100%;';
    let layerWrapperStyle = 'position: absolute; width: 100%; height: 100%; z-index: 0;';
    class MapResize extends EventHandler_1.sGisEvent {
        constructor() {
            super(MapResize.type);
        }
    }
    MapResize.type = 'mapResize';
    exports.MapResize = MapResize;
    class DomPainter extends EventHandler_1.EventHandler {
        /**
         * @param map - the map to be drawn.
         * @param options - key-value list of properties to be assigned to the instance.
         */
        constructor(map, { wrapper = null } = {}) {
            super();
            this._fireMapResize = utils_1.debounce(() => this.fire(new MapResize()), this._map && this._map.changeEndDelay || 300);
            this._map = map;
            this.wrapper = wrapper;
            this._layerRenderers = new Map();
            this._containers = [];
            this._position = [Infinity, Infinity];
            this._resolution = Infinity;
            this._needUpdate = true;
            this._updateAllowed = true;
            this._updateLayerList();
            this._setEventListeners();
            this._repaintBound = this._repaint.bind(this);
            this._repaint();
        }
        /**
         * DOM element, inside of which the map will be drawn. If null is given, the map will not be drawn. If string is given, an element with given id will be searched.
         */
        get wrapper() { return this._wrapper; }
        set wrapper(wrapper) {
            if (this._wrapper)
                this._clearDOM();
            if (wrapper) {
                this._initDOM(wrapper);
                this._eventDispatcher = new EventDispatcher_1.EventDispatcher(this._innerWrapper, this);
                this._needUpdate = true;
                this._redrawNeeded = true;
            }
            this.fire('wrapperChange');
        }
        get layerRenderers() { return Array.from(this._layerRenderers.values()); }
        /**
         * Sets position and resolution of the map to show the full bounding box in the center of the map
         * @param bbox
         * @param animate - if set to true, the position will be changed gradually with animation.
         * @returns the actual bbox of the map after the change.
         */
        show(bbox, animate = true) {
            let projected = bbox.projectTo(this.map.crs);
            let xResolution = projected.width / this.width;
            let yResolution = projected.height / this.height;
            let method = animate ? 'animateTo' : 'setPosition';
            let center = projected.center;
            this.map[method](center, this.map.getAdjustedResolution(Math.max(xResolution, yResolution)));
            return new Bbox_1.Bbox([center[0] - this.width * xResolution, center[1] - this.height * yResolution], [center[0] + this.width * xResolution, center[1] + this.height * yResolution], this.map.crs);
        }
        _updateLayerList() {
            let mapLayers = this._map.getLayers(true, true);
            for (let layer of this._layerRenderers.keys()) {
                if (mapLayers.indexOf(layer) < 0)
                    this._removeLayer(layer);
            }
            mapLayers.forEach((layer, index) => {
                let renderer = this._layerRenderers.get(layer);
                if (renderer) {
                    renderer.setIndex(index);
                }
                else {
                    this._addLayer(layer, index);
                }
            });
        }
        _addLayer(layer, index) {
            this._layerRenderers.set(layer, new LayerRenderer_1.LayerRenderer(this, layer, index));
        }
        _removeLayer(layer) {
            this._layerRenderers.get(layer).clear();
            this._layerRenderers.delete(layer);
        }
        _setEventListeners() {
            this._map.on(LayerGroup_1.ContentsChangeEvent.type, this._updateLayerList.bind(this));
            this._map.on(commonEvents_1.DragEvent.type, this._onMapDrag.bind(this));
            this._map.on(commonEvents_1.sGisDoubleClickEvent.type, this._onMapDblClick.bind(this));
            this._map.on(Map_1.AnimationStartEvent.type, this.forbidUpdate.bind(this));
            this._map.on(Map_1.AnimationEndEvent.type, this.allowUpdate.bind(this));
        }
        /**
         * Prevents the map to be redrawn.
         */
        forbidUpdate() {
            this._updateAllowed = false;
        }
        /**
         * Allows redrawing of the map again after .forbidUpdate() has been called.
         */
        allowUpdate() {
            this._updateAllowed = true;
        }
        _repaint() {
            this._updateSize();
            if (this.isDisplayed) {
                if (this._needUpdate && this._updateAllowed) {
                    this._setNewContainer();
                    this._needUpdate = false;
                }
                this._updateBbox();
                let layers = this._map.getLayers(true, true);
                let redrawNeeded = this._redrawNeeded;
                if (this._updateAllowed) {
                    layers.reverse().forEach(layer => {
                        let renderer = this._layerRenderers.get(layer);
                        if (redrawNeeded || renderer.updateNeeded) {
                            try {
                                renderer.update();
                            }
                            catch (e) {
                                utils_1.warn(e);
                                renderer.updateNeeded = false;
                            }
                        }
                    });
                    this._redrawNeeded = false;
                }
                if (redrawNeeded) {
                    layers.forEach(layer => {
                        let renderer = this._layerRenderers.get(layer);
                        renderer.updateDynamic();
                    });
                }
            }
            window.requestAnimationFrame(this._repaintBound);
        }
        _setNewContainer() {
            this._containers.push(new Container_1.Container(this._staticRendersContainer, this.bbox, this._map.resolution, this._removeEmptyContainers.bind(this)));
        }
        _removeEmptyContainers() {
            // Check all containers except the last one, for we never remove it
            for (let i = this._containers.length - 2; i >= 0; i--) {
                if (this._containers[i].isEmpty) {
                    this._removeContainer(i);
                }
            }
        }
        _removeContainer(i) {
            this._containers[i].remove();
            this._containers.splice(i, 1);
        }
        _updateSize() {
            const newWidth = this._wrapper ? this._wrapper.clientWidth || this._wrapper.offsetWidth : 0;
            const newHeight = this._wrapper ? this._wrapper.clientHeight || this._wrapper.offsetHeight : 0;
            if (this._width !== newWidth || this._height !== newHeight) {
                this._fireMapResize();
            }
            this._width = newWidth;
            this._height = newHeight;
        }
        /**
         * Returns true is the map is currently displayed in the DOM>
         */
        get isDisplayed() { return this._width > 0 && this._height > 0; }
        _updateBbox() {
            let mapPosition = this._map.position;
            if (this._position[0] !== mapPosition[0] || this._position[1] !== mapPosition[1] || !math_1.softEquals(this._map.resolution, this._resolution) || this._bboxWidth !== this._width || this._bboxHeight !== this._height) {
                this._position = [mapPosition[0], mapPosition[1]];
                this._resolution = this._map.resolution;
                let dx = this._width * this._resolution / 2;
                let dy = this._height * this._resolution / 2;
                this._bbox = new Bbox_1.Bbox([mapPosition[0] - dx, mapPosition[1] - dy], [mapPosition[0] + dx, mapPosition[1] + dy], this._map.crs);
                this._containers.forEach(container => {
                    if (container.crs.canProjectTo(this._map.crs)) {
                        container.updateTransform(this._bbox, this._resolution);
                    }
                    else {
                        this._removeContainer(this._containers.indexOf(container));
                        if (this._containers.length === 0)
                            this._setNewContainer();
                    }
                });
                if (this._containers.length > 0 && this._containers[this._containers.length - 1].scale !== 1)
                    this._needUpdate = true;
                this._bboxWidth = this._width;
                this._bboxHeight = this._height;
                this._redrawNeeded = true;
            }
        }
        /**
         * Current bbox of the map drawn by this painter.
         */
        get bbox() {
            if (!this._bbox)
                this._updateBbox();
            return this._bbox;
        }
        /**
         * The map this painter draws.
         */
        get map() { return this._map; }
        get currContainer() { return this._containers[this._containers.length - 1]; }
        get dynamicContainer() { return this._dynamicRendersContainer; }
        /**
         * Width of the map on the screen in pixels.
         */
        get width() { return this._width; }
        /**
         * Height of the map on the screen in pixels.
         */
        get height() { return this._height; }
        _initDOM(node) {
            let wrapper = node instanceof HTMLElement ? node : document.getElementById(node);
            if (!wrapper)
                utils_1.error('The element with ID "' + node + '" is not found.');
            this._innerWrapper = document.createElement('div');
            this._innerWrapper.style.cssText = innerWrapperStyle;
            this._staticRendersContainer = document.createElement('div');
            this._staticRendersContainer.style.cssText = layerWrapperStyle;
            this._dynamicRendersContainer = document.createElement('div');
            this._dynamicRendersContainer.style.cssText = layerWrapperStyle;
            this._innerWrapper.appendChild(this._staticRendersContainer);
            this._innerWrapper.appendChild(this._dynamicRendersContainer);
            wrapper.appendChild(this._innerWrapper);
            this._wrapper = wrapper;
        }
        _clearDOM() {
            if (this._innerWrapper.parentNode)
                this._innerWrapper.parentNode.removeChild(this._innerWrapper);
            this._innerWrapper = null;
            this._staticRendersContainer = null;
            this._dynamicRendersContainer = null;
            this._wrapper = null;
            this._eventDispatcher.remove();
            this._eventDispatcher = null;
            this._clearContainers();
        }
        _clearContainers() {
            this._containers.forEach((container, i) => {
                this._removeContainer(i);
            });
            this._map.getLayers(true, true).reverse().forEach(layer => {
                let renderer = this._layerRenderers.get(layer);
                renderer.clear();
            });
        }
        get innerWrapper() { return this._innerWrapper; }
        resolveLayerOverlay() {
            let prevContainerIndex = 0;
            this._map.getLayers(true, true).forEach(layer => {
                let renderer = this._layerRenderers.get(layer);
                if (!renderer)
                    return;
                let containerIndex = this._containers.indexOf(renderer.currentContainer);
                if (containerIndex < prevContainerIndex) {
                    renderer.moveToLastContainer();
                    prevContainerIndex = this._containers.length - 1;
                }
                else {
                    prevContainerIndex = containerIndex;
                }
            });
            this._removeEmptyContainers();
        }
        /**
         * Returns the point in map coordinates, that is located at the given offset from the left top corner of the map.
         * @param x
         * @param y
         */
        getPointFromPxPosition(x, y) {
            let resolution = this._map.resolution;
            let bbox = this.bbox;
            return new Point_1.Point([
                bbox.xMin + x * resolution,
                bbox.yMax - y * resolution
            ], bbox.crs);
        }
        /**
         * For the given point, returns the px offset on the screen from the left top corner of the map.
         * @param position - point in the map coordinates
         */
        getPxPosition(position) {
            return [
                (position[0] - this.bbox.xMin) / this._map.resolution,
                (this.bbox.yMax - position[1]) / this._map.resolution
            ];
        }
        _onMapDrag(event) {
            setTimeout(() => {
                if (event.isCanceled)
                    return;
                this._map.move(event.offset[0], event.offset[1]);
            }, 0);
        }
        _onMapDblClick(event) {
            setTimeout(() => {
                if (event.isCanceled)
                    return;
                this._map.animateSetResolution(this._map.resolution / 2, event.point);
            }, 0);
        }
    }
    exports.DomPainter = DomPainter;
});
