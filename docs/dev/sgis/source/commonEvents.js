define(["require", "exports", "./EventHandler"], function (require, exports, EventHandler_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class sGisMouseEvent extends EventHandler_1.sGisEvent {
        constructor({ type, flag }, { point, browserEvent, contourIndex = null, pointIndex = null }) {
            super(type);
            this.point = point;
            this.browserEvent = browserEvent;
            this.contourIndex = contourIndex;
            this.pointIndex = pointIndex;
            this.eventFlag = flag;
        }
    }
    exports.sGisMouseEvent = sGisMouseEvent;
    class sGisClickEvent extends sGisMouseEvent {
        constructor(params) {
            super(EventHandler_1.mouseEvents.click, params);
        }
    }
    sGisClickEvent.type = EventHandler_1.mouseEvents.click.type;
    sGisClickEvent.eventFlag = EventHandler_1.mouseEvents.click.flag;
    exports.sGisClickEvent = sGisClickEvent;
    class sGisDoubleClickEvent extends sGisMouseEvent {
        constructor(params) {
            super(EventHandler_1.mouseEvents.doubleClick, params);
        }
    }
    sGisDoubleClickEvent.type = EventHandler_1.mouseEvents.doubleClick.type;
    sGisDoubleClickEvent.eventFlag = EventHandler_1.mouseEvents.doubleClick.flag;
    exports.sGisDoubleClickEvent = sGisDoubleClickEvent;
    class sGisMouseMoveEvent extends sGisMouseEvent {
        constructor(params) {
            super(EventHandler_1.mouseEvents.mouseMove, params);
        }
    }
    sGisMouseMoveEvent.type = EventHandler_1.mouseEvents.mouseMove.type;
    sGisMouseMoveEvent.eventFlag = EventHandler_1.mouseEvents.mouseMove.flag;
    exports.sGisMouseMoveEvent = sGisMouseMoveEvent;
    class sGisMouseOutEvent extends sGisMouseEvent {
        constructor(params) {
            super(EventHandler_1.mouseEvents.mouseOut, params);
        }
    }
    sGisMouseOutEvent.type = EventHandler_1.mouseEvents.mouseOut.type;
    sGisMouseOutEvent.eventFlag = EventHandler_1.mouseEvents.mouseOut.flag;
    exports.sGisMouseOutEvent = sGisMouseOutEvent;
    class sGisMouseOverEvent extends sGisMouseEvent {
        constructor(params) {
            super(EventHandler_1.mouseEvents.mouseOver, params);
        }
    }
    sGisMouseOverEvent.type = EventHandler_1.mouseEvents.mouseOver.type;
    sGisMouseOverEvent.eventFlag = EventHandler_1.mouseEvents.mouseOver.flag;
    exports.sGisMouseOverEvent = sGisMouseOverEvent;
    class DragStartEvent extends sGisMouseEvent {
        constructor(draggingObject, params) {
            super(EventHandler_1.mouseEvents.dragStart, params);
            this.draggingObject = draggingObject;
        }
    }
    DragStartEvent.type = EventHandler_1.mouseEvents.dragStart.type;
    DragStartEvent.eventFlag = EventHandler_1.mouseEvents.dragStart.flag;
    exports.DragStartEvent = DragStartEvent;
    class DragEvent extends sGisMouseEvent {
        constructor({ point, browserEvent, offset, pxOffset }) {
            super(EventHandler_1.mouseEvents.drag, { point, browserEvent });
            this.offset = offset;
            this.pxOffset = pxOffset;
        }
    }
    DragEvent.type = EventHandler_1.mouseEvents.drag.type;
    DragEvent.eventFlag = EventHandler_1.mouseEvents.drag.flag;
    exports.DragEvent = DragEvent;
    class DragEndEvent extends sGisMouseEvent {
        constructor(params) {
            super(EventHandler_1.mouseEvents.dragEnd, params);
        }
    }
    DragEndEvent.type = EventHandler_1.mouseEvents.dragEnd.type;
    DragEndEvent.eventFlag = EventHandler_1.mouseEvents.dragEnd.flag;
    exports.DragEndEvent = DragEndEvent;
});
