define(["require", "exports", "./Canvas", "../../renders/Render", "../../renders/StaticVectorImageRender", "../../renders/StaticImageRender", "../../renders/StaticHtmlImageRender", "../../EventHandler"], function (require, exports, Canvas_1, Render_1, StaticVectorImageRender_1, StaticImageRender_1, StaticHtmlImageRender_1, EventHandler_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @alias sGis.painter.domPainter.LayerRenderer
     * @ignore
     */
    class LayerRenderer {
        /**
         * @constructor
         * @param master
         * @param layer
         * @param index
         * @param useCanvas
         */
        constructor(master, layer, index, useCanvas = true) {
            this.delayedUpdateTime = 500;
            this.listensFor = [
                EventHandler_1.MouseEventFlags.MouseClick,
                EventHandler_1.MouseEventFlags.DoubleClick,
                EventHandler_1.MouseEventFlags.MouseDown,
                EventHandler_1.MouseEventFlags.MouseMove,
                EventHandler_1.MouseEventFlags.MouseOut,
                EventHandler_1.MouseEventFlags.MouseOver,
                EventHandler_1.MouseEventFlags.MouseUp,
                EventHandler_1.MouseEventFlags.DragStart
            ];
            this._renders = [];
            this._master = master;
            this._layer = layer;
            this._useCanvas = useCanvas;
            this._canvas = new Canvas_1.Canvas();
            this._resetEventCatcherMaps();
            this._setListeners();
            this.setIndex(index);
            this._forceUpdate();
        }
        get layer() {
            return this._layer;
        }
        _setListeners() {
            this._layer.on('propertyChange', () => {
                this._forceUpdate();
            });
        }
        _resetEventCatcherMaps() {
            this._eventCatchers = {};
            this.listensFor.forEach(eventName => {
                this._eventCatchers[eventName] = new Map();
            });
        }
        _forceUpdate() {
            this.updateNeeded = true;
        }
        setIndex(index) {
            if (index === this._index)
                return;
            let zIndex = index * 2 + 1;
            for (let render of this._renders) {
                if (render instanceof StaticImageRender_1.StaticImageRender || render instanceof Render_1.DynamicRender) {
                    render.node.style.zIndex = zIndex.toString();
                }
            }
            this._canvas.setIndex(index * 2);
            this._index = index;
            this._zIndex = zIndex;
        }
        clear() {
            for (let render of this._renders) {
                this._removeRender(render);
            }
            this._renders = [];
            this._resetEventCatcherMaps();
            if (this._canvasContainer)
                this._canvasContainer.removeNode(this._canvas.node);
            if (this._updateTimer)
                clearTimeout(this._updateTimer);
        }
        update() {
            if (this._layer.delayedUpdate) {
                if (this._updateTimer)
                    clearTimeout(this._updateTimer);
                if (this.updateNeeded) {
                    this._rerender();
                }
                else {
                    this._updateTimer = setTimeout(() => {
                        this._rerender();
                    }, this.delayedUpdateTime);
                }
            }
            else {
                this._rerender();
            }
            this.updateNeeded = false;
        }
        updateDynamic() {
            this._renders.forEach(render => {
                if (render instanceof Render_1.DynamicRender)
                    render.update(this._master.bbox, this._master.map.resolution);
            });
        }
        _removeOutdatedRenders(newRenders) {
            for (let i = this._renders.length - 1; i >= 0; i--) {
                if (newRenders.indexOf(this._renders[i]) < 0) {
                    this._removeRender(this._renders[i]);
                }
            }
        }
        _removeCanvas() {
            if (this._canvasContainer)
                this._canvasContainer.removeNode(this._canvas.node);
        }
        _addCanvasToDom(bbox) {
            this._canvasContainer = this.currentContainer;
            this._canvasContainer.addNode(this._canvas.node, this._canvas.width, this._canvas.height, bbox);
        }
        _resetCanvas(bbox) {
            this._removeCanvas();
            this._canvas.reset(bbox, this._master.map.resolution, this._master.width, this._master.height);
        }
        _rerender() {
            let bbox = this._master.bbox;
            let renders = this._layer.getRenders(bbox, this._master.map.resolution);
            if (this._layer.updateProhibited)
                return;
            this.currentContainer = this._master.currContainer;
            this._resetCanvas(bbox);
            this._removeCanvas();
            this._removeOutdatedRenders(renders);
            this._draw(renders);
            if (!this._canvas.isEmpty) {
                this._addCanvasToDom(bbox);
            }
            this._renders = renders;
        }
        _draw(renders) {
            for (let render of renders) {
                if (render instanceof StaticVectorImageRender_1.StaticVectorImageRender || render instanceof Render_1.VectorRender || this._renders.indexOf(render) < 0) {
                    this._drawRender(render);
                }
            }
        }
        _drawRender(render) {
            if (render instanceof Render_1.StaticRender) {
                this._drawStaticRender(render);
            }
            else if (render instanceof Render_1.DynamicRender) {
                this._drawDynamicRender(render);
            }
            this._setRenderListeners(render);
        }
        _setRenderListeners(render) {
            this.listensFor.forEach(eventFlag => {
                if (render.listensFor & eventFlag)
                    this._eventCatchers[eventFlag].set(render, render);
            });
        }
        _removeRenderListeners(render) {
            this.listensFor.forEach(eventFlag => {
                if (render.listensFor & eventFlag)
                    this._eventCatchers[eventFlag].delete(render);
            });
        }
        _drawStaticRender(render) {
            if (render instanceof StaticHtmlImageRender_1.StaticHtmlImageRender) {
                this._drawImageRender(render);
            }
            else if (render instanceof Render_1.VectorRender || render instanceof StaticVectorImageRender_1.StaticVectorImageRender) {
                this._drawVectorRender(render);
            }
        }
        _drawImageRender(render) {
            render.node.style.zIndex = this._zIndex.toString();
            this._currentContainer.addNode(render.node, render.width, render.height, render.bbox);
            if (render.onDisplayed)
                render.onDisplayed();
        }
        _drawVectorRender(render) {
            this._canvas.draw(render);
        }
        _drawDynamicRender(render) {
            render.update(this._master.bbox, this._master.map.resolution);
            this._master.dynamicContainer.appendChild(render.node);
            this._renders.push(render);
            if (render.onRender)
                render.onRender();
        }
        get currentContainer() {
            return this._currentContainer;
        }
        set currentContainer(container) {
            if (this._currentContainer !== container) {
                this._currentContainer = container;
                this._master.resolveLayerOverlay();
            }
        }
        _removeRender(render) {
            if (render instanceof StaticImageRender_1.StaticImageRender || render instanceof Render_1.DynamicRender) {
                if (!render.node.parentNode)
                    return;
                render.node.parentNode.removeChild(render.node);
                if (render instanceof StaticHtmlImageRender_1.StaticHtmlImageRender && render.onRemoved)
                    render.onRemoved();
            }
            this._removeRenderListeners(render);
        }
        moveToLastContainer() {
            this._moveRendersToLastContainer();
            if (this._canvas.node.parentNode) {
                this._canvasContainer.removeNode(this._canvas.node);
                this._master.currContainer.addNode(this._canvas.node, this._canvas.width, this._canvas.height, this._canvas.bbox);
                this._canvasContainer = this._master.currContainer;
            }
            this._currentContainer = this._master.currContainer;
        }
        _moveRendersToLastContainer() {
            let container = this._master.currContainer;
            for (let render of this._renders) {
                if (render instanceof StaticHtmlImageRender_1.StaticHtmlImageRender) {
                    container.addNode(render.node, render.width, render.height, render.bbox);
                }
            }
        }
        getEventCatcher(eventFlag, position) {
            if (!this._eventCatchers[eventFlag])
                return [null, null];
            for (let render of this._eventCatchers[eventFlag].keys()) {
                let intersectionType = render.contains && render.contains(position);
                if (intersectionType) {
                    return [render, intersectionType];
                }
            }
            return [null, null];
        }
    }
    exports.LayerRenderer = LayerRenderer;
});
