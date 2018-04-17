define(["require", "exports", "../EventHandler"], function (require, exports, EventHandler_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Render {
        constructor() {
            this._listensFor = EventHandler_1.MouseEventFlags.None;
            this._eventHandler = null;
            this.contourIndex = -1;
            this.pointIndex = -1;
        }
        get listensFor() { return this._listensFor; }
        triggerEvent(event) {
            if (this._eventHandler)
                this._eventHandler(event);
        }
        listenFor(eventFlags, handler) {
            this._eventHandler = handler;
            this._listensFor = eventFlags;
        }
    }
    exports.Render = Render;
    class StaticRender extends Render {
    }
    exports.StaticRender = StaticRender;
    class VectorRender extends StaticRender {
    }
    exports.VectorRender = VectorRender;
    class DynamicRender extends Render {
        contains(position) {
            return false;
        }
        constructor({ node, update, redraw, onRender }) {
            super();
            this.node = node;
            this.update = update;
            this.onRender = onRender;
            this.redraw = redraw;
        }
    }
    exports.DynamicRender = DynamicRender;
});
