define(["require", "exports", "../../utils/domEvent", "../../commonEvents"], function (require, exports, domEvent_1, commonEvents_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const MIN_WHEEL_DELAY = 300;
    /**
     * @alias sGis.painter.domPainter.EventDispatcher
     */
    class EventDispatcher {
        constructor(baseNode, master) {
            this._hoverRender = null;
            this._master = master;
            this._setListeners(baseNode);
            this._baseNode = baseNode;
            this._onDocumentMousemove = this._onDocumentMousemove.bind(this);
            this._onDocumentMouseup = this._onDocumentMouseup.bind(this);
            this._wheelTimer = 0;
            this._touchHandler = { dragPrevPosition: [] };
        }
        _dispatchEvent(event) {
            let map = this._master.map;
            let layerRenderers = this._master.layerRenderers;
            let position = [event.point.x / map.resolution, -event.point.y / map.resolution];
            if (event instanceof commonEvents_1.sGisMouseOutEvent) {
                if (this._hoverRender)
                    this._hoverRender.triggerEvent(event);
                this._hoverRender = null;
                if (!event.isCanceled)
                    map.fire(event);
                return;
            }
            let mouseOutEvent, mouseOverEvent;
            let targetRender = null;
            for (let i = layerRenderers.length - 1; i >= 0; i--) {
                targetRender = layerRenderers[i].getEventCatcher(event.eventFlag, position);
                if (targetRender)
                    break;
            }
            if (!mouseOutEvent && event instanceof commonEvents_1.sGisMouseMoveEvent && this._hoverRender !== targetRender) {
                if (this._hoverRender) {
                    mouseOutEvent = new commonEvents_1.sGisMouseOutEvent(event);
                    this._hoverRender.triggerEvent(mouseOutEvent);
                }
                if (targetRender) {
                    mouseOverEvent = new commonEvents_1.sGisMouseOverEvent(event);
                    targetRender.triggerEvent(mouseOverEvent);
                }
                this._hoverRender = targetRender;
            }
            if (targetRender)
                targetRender.triggerEvent(event);
            if (!event.isCanceled)
                map.fire(event);
        }
        _listenFor(node, eventType, handler) {
            domEvent_1.listenDomEvent(node, eventType, (event) => {
                let target = (event && event.target);
                let cancelEvent = event.defaultPrevented;
                while (target && target !== node) {
                    if (target.doNotBubbleToMap) {
                        cancelEvent = true;
                        break;
                    }
                    target = target.parentNode;
                }
                if (!cancelEvent)
                    handler(event);
            });
        }
        _setListeners(baseNode) {
            this._listenFor(baseNode, 'mousedown', this._onmousedown.bind(this));
            this._listenFor(baseNode, 'mousedown', this._onmousedown.bind(this));
            this._listenFor(baseNode, 'wheel', this._onwheel.bind(this));
            this._listenFor(baseNode, 'click', this._onclick.bind(this));
            this._listenFor(baseNode, 'dblclick', this._ondblclick.bind(this));
            this._listenFor(baseNode, 'mousemove', this._onmousemove.bind(this));
            this._listenFor(baseNode, 'mouseleave', this._onmouseleave.bind(this));
            this._listenFor(baseNode, 'touchstart', this._ontouchstart.bind(this));
            this._listenFor(baseNode, 'touchmove', this._ontouchmove.bind(this));
            this._listenFor(baseNode, 'touchend', this._ontouchend.bind(this));
        }
        _onmousedown(event) {
            this._clickCatcher = true;
            if (event.which === 1) {
                this._dragPosition = domEvent_1.getMouseOffset(event.currentTarget, event);
                domEvent_1.listenDomEvent(document, 'mousemove', this._onDocumentMousemove);
                domEvent_1.listenDomEvent(document, 'mouseup', this._onDocumentMouseup);
                document.ondragstart = function () { return false; };
                document.body.onselectstart = function () { return false; };
            }
            event.preventDefault();
            event.stopPropagation();
        }
        _onDocumentMousemove(event) {
            let map = this._master.map;
            let mousePosition = domEvent_1.getMouseOffset(this._master.wrapper, event);
            let dxPx = this._dragPosition.x - mousePosition.x;
            let dyPx = this._dragPosition.y - mousePosition.y;
            let resolution = map.resolution;
            let point = this._master.getPointFromPxPosition(mousePosition.x, mousePosition.y);
            if (Math.abs(dxPx) > 2 || Math.abs(dyPx) > 2 || !this._clickCatcher) {
                this._lastDrag = { x: dxPx * resolution, y: -dyPx * resolution };
                if (this._clickCatcher) {
                    this._clickCatcher = null;
                    let originalPoint = this._master.getPointFromPxPosition(this._dragPosition.x, this._dragPosition.y);
                    let dragStartEvent = new commonEvents_1.DragStartEvent(map, { point: originalPoint, browserEvent: event });
                    this._dispatchEvent(dragStartEvent);
                    this._draggingObject = dragStartEvent.draggingObject;
                }
                this._dragPosition = mousePosition;
                let dragEvent = new commonEvents_1.DragEvent({ point, browserEvent: event, offset: [this._lastDrag.x, this._lastDrag.y], pxOffset: [dxPx, dyPx] });
                this._draggingObject.fire(dragEvent);
            }
        }
        _onDocumentMouseup(event) {
            this._clearDocumentListeners();
            if (this._draggingObject) {
                this._draggingObject.fire(new commonEvents_1.DragEndEvent(this._getMouseEventDescription(event)));
            }
            this._draggingObject = null;
            this._lastDrag = null;
        }
        remove() {
            this._clearDocumentListeners();
        }
        _clearDocumentListeners() {
            domEvent_1.removeDomEventListener(document, 'mousemove', this._onDocumentMousemove);
            domEvent_1.removeDomEventListener(document, 'mouseup', this._onDocumentMouseup);
            document.ondragstart = null;
            document.body.onselectstart = null;
        }
        _onwheel(event) {
            let time = Date.now();
            if (time - this._wheelTimer > MIN_WHEEL_DELAY) {
                this._wheelTimer = time;
                let map = this._master.map;
                let wheelDirection = domEvent_1.getWheelDirection(event);
                let mouseOffset = domEvent_1.getMouseOffset(event.currentTarget, event);
                map.zoom(wheelDirection, this._master.getPointFromPxPosition(mouseOffset.x, mouseOffset.y));
            }
            event.preventDefault();
        }
        _getMouseEventDescription(event) {
            let mouseOffset = domEvent_1.getMouseOffset(event.currentTarget, event);
            let point = this._master.getPointFromPxPosition(mouseOffset.x, mouseOffset.y);
            return { point: point, browserEvent: event };
        }
        _onclick(event) {
            if (this._clickCatcher) {
                this._dispatchEvent(new commonEvents_1.sGisClickEvent(this._getMouseEventDescription(event)));
            }
        }
        _ondblclick(event) {
            this._clickCatcher = null;
            this._dispatchEvent(new commonEvents_1.sGisDoubleClickEvent(this._getMouseEventDescription(event)));
        }
        _onmousemove(event) {
            this._dispatchEvent(new commonEvents_1.sGisMouseMoveEvent(this._getMouseEventDescription(event)));
        }
        _onmouseleave(event) {
            if (event.target === this._baseNode)
                this._dispatchEvent(new commonEvents_1.sGisMouseOutEvent(this._getMouseEventDescription(event)));
        }
        _ontouchstart(event) {
            if (!this._touches)
                this._touches = [];
            for (let i = 0; i < event.changedTouches.length; i++) {
                let touch = event.changedTouches[i];
                if (!this._touches.some(t => t.id === touch.identifier))
                    this._touches.push({ id: touch.identifier, position: [touch.pageX, touch.pageY] });
            }
            this._touchHandler.lastDrag = { x: 0, y: 0 };
            if (event.touches.length > 1)
                event.preventDefault();
        }
        _ontouchmove(event) {
            this._clearTouches(event);
            let touches = Array.prototype.slice.apply(event.touches);
            let map = this._master.map;
            if (touches.length === 1 && this._touchHandler.lastDrag) {
                let touch = event.targetTouches[0];
                let [prevX, prevY] = this._touches[0].position;
                let dxPx = prevX - touch.pageX;
                let dyPx = prevY - touch.pageY;
                let resolution = map.resolution;
                let touchOffset = domEvent_1.getMouseOffset(event.currentTarget, touch);
                let point = this._master.getPointFromPxPosition(touchOffset.x, touchOffset.y);
                let fakeMouseEvent = new MouseEvent('mousemove', event);
                if (this._touchHandler.lastDrag.x === 0 && this._touchHandler.lastDrag.y === 0) {
                    let dragStartEvent = new commonEvents_1.DragStartEvent(map, { point, browserEvent: fakeMouseEvent });
                    this._dispatchEvent(dragStartEvent);
                    this._draggingObject = dragStartEvent.draggingObject;
                }
                this._touchHandler.lastDrag = { x: dxPx * resolution, y: 0 - dyPx * resolution };
                let dragEvent = new commonEvents_1.DragEvent({ point, browserEvent: fakeMouseEvent, offset: [this._touchHandler.lastDrag.x, this._touchHandler.lastDrag.y], pxOffset: [dxPx, dyPx] });
                this._draggingObject.fire(dragEvent);
                this._touches[0].position = [touch.pageX, touch.pageY];
            }
            else if (touches.length > 1) {
                this._master.forbidUpdate();
                this._touchHandler.lastDrag = null;
                this._touchHandler.scaleChanged = true;
                let t1 = touches.find(t => t.identifier === this._touches[0].id);
                let t2 = touches.find(t => t.identifier === this._touches[1].id);
                let [x11, y11] = this._touches[0].position;
                let [x12, y12] = [t1.pageX, t1.pageY];
                let [x21, y21] = this._touches[1].position;
                let [x22, y22] = [t2.pageX, t2.pageY];
                let c1 = [(x11 + x21) / 2, (y11 + y21) / 2];
                let c2 = [(x12 + x22) / 2, (y12 + y22) / 2];
                let base = [(c1[0] + c2[0]) / 2, (c1[1] + c2[1]) / 2];
                let len1 = Math.sqrt(Math.pow(x11 - x21, 2) + Math.pow(y11 - y21, 2));
                let len2 = Math.sqrt(Math.pow(x12 - x22, 2) + Math.pow(y12 - y22, 2));
                let baseOffset = domEvent_1.getMouseOffset(event.target, { pageX: base[0], pageY: base[1] });
                let basePoint = this._master.getPointFromPxPosition(baseOffset.x, baseOffset.y);
                let dc = [c1[0] - c2[0], c2[1] - c1[1]];
                let zoomK = len1 / len2;
                if (len1 !== len2 && len2 !== 0)
                    map.changeScale(zoomK, basePoint, true);
                map.move(dc[0] * map.resolution, dc[1] * map.resolution);
                this._touches[0].position = [x12, y12];
                this._touches[1].position = [x22, y22];
                this._touchHandler.lastZoomDirection = zoomK < 1;
            }
            event.preventDefault();
        }
        _ontouchend(event) {
            this._clearTouches(event);
            for (let i = 0; i < event.changedTouches.length; i++) {
                let index = this._touches.findIndex(touch => touch.id === event.changedTouches[i].identifier);
                if (index >= 0)
                    this._touches.splice(index, 1);
            }
            this._touchHandler.lastDrag = null;
            if (this._touchHandler.scaleChanged) {
                this._master.allowUpdate();
                this._master.map.adjustResolution(this._touchHandler.lastZoomDirection);
                this._touchHandler.scaleChanged = false;
            }
            else {
                if (this._draggingObject) {
                    this._draggingObject.fire(new commonEvents_1.DragEndEvent({ point: null, browserEvent: new MouseEvent('mouseup', event) }));
                    this._draggingObject = null;
                }
            }
        }
        _clearTouches(event) {
            let touches = Array.prototype.slice.apply(event.touches);
            for (let i = this._touches.length - 1; i >= 0; i--) {
                if (!touches.some(touch => touch.identifier === this._touches[i].id))
                    this._touches.splice(i, 1);
            }
        }
    }
    exports.EventDispatcher = EventDispatcher;
});
