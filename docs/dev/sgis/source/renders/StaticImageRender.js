define(["require", "exports", "./Render"], function (require, exports, Render_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class StaticImageRender extends Render_1.StaticRender {
        constructor({ src, width = 0, height = 0, onLoad = null, opacity = 1, offset = [0, 0] }) {
            super();
            this.offset = offset;
            this.onLoad = onLoad;
            this._opacity = opacity;
            this._width = width;
            this._height = height;
            this._src = src;
            this._createNode();
        }
        _createNode() {
            this._node = new Image();
            this._node.onload = () => {
                if (this.onLoad)
                    this.onLoad();
            };
            this._node.onerror = (err) => {
                this._node.onload(err);
            };
            if (this._width > 0)
                this._node.width = this._width;
            if (this._height > 0)
                this._node.height = this._height;
            this._node.style.opacity = this._opacity.toString();
            this._node.src = this._src;
        }
        get node() {
            if (this._node)
                return this._node;
            this._createNode();
            return this._node;
        }
        get width() {
            return this._width;
        }
        get height() {
            return this._height;
        }
        get isReady() {
            return this._node && this._node.complete;
        }
        get error() {
            return this._node && this._node.complete && this._node.naturalWidth === 0;
        }
        get opacity() { return parseFloat(this.node.style.opacity); }
        set opacity(value) {
            this._opacity = value;
            if (this.node)
                this.node.style.opacity = value.toString();
        }
    }
    exports.StaticImageRender = StaticImageRender;
});
