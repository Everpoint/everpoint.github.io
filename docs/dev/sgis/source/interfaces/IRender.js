define(["require", "exports", "../Point", "../commonEvents"], function (require, exports, Point_1, commonEvents_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Render {
        constructor() {
            this._listensFor = commonEvents_1.MouseEventFlags.None;
            this._eventHandler = null;
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
    class DynamicRender extends Render {
        constructor() {
            super(...arguments);
            this.listensFor = commonEvents_1.MouseEventFlags.None;
        }
    }
    exports.DynamicRender = DynamicRender;
    class StaticImageRender extends StaticRender {
        constructor({ src, width = 0, height = 0, onLoad = null, offset = [0, 0] }) {
            super();
            this._isReady = false;
            this.offset = offset;
            this.onLoad = onLoad;
            this.node = new Image();
            this.node.onload = () => {
                this._isReady = true;
                if (this.onLoad)
                    this.onLoad();
            };
            this.node.onerror = this.node.onload;
            if (width > 0)
                this.node.width = width;
            if (height > 0)
                this.node.height = height;
            this.node.src = src;
        }
        get width() { return this.node.width; }
        get height() { return this.node.height; }
        get isReady() { return this._isReady; }
    }
    exports.StaticImageRender = StaticImageRender;
    class StaticVectorImageRender extends StaticImageRender {
        constructor({ src, position, width, height, onLoad, offset, angle = 0 }) {
            super({ src, width, height, onLoad, offset });
            this.position = position;
            this.angle = angle;
        }
        contains(position) {
            let minX = this.position[0] + this.offset[0];
            let minY = this.position[1] + this.offset[1];
            return position[0] > minX
                && position[0] < minX + this.width
                && position[1] > minY
                && position[1] < minY + this.height;
        }
    }
    exports.StaticVectorImageRender = StaticVectorImageRender;
    class StaticHtmlImageRender extends StaticImageRender {
        constructor({ src, bbox, width, height, onLoad }) {
            super({ src, width, height, onLoad });
            this.isComplete = true;
            this.bbox = bbox;
        }
        contains(position) {
            let resolution = this.bbox.width / this.width;
            return this.bbox.contains(new Point_1.Point([position[0] * resolution, position[1] * resolution], this.bbox.crs));
        }
    }
    exports.StaticHtmlImageRender = StaticHtmlImageRender;
    class VectorRender extends StaticRender {
    }
    exports.VectorRender = VectorRender;
    class DomRender extends DynamicRender {
    }
    exports.DomRender = DomRender;
});
