define(["require", "exports", "../interfaces/IRender"], function (require, exports, IRender_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Image render that is drawn to the vector container instead of DOM.
     */
    class VectorImage extends IRender_1.VectorRender {
        constructor(imageNode, position, offset = [0, 0]) {
            super();
            this._node = imageNode;
            this._position = position;
            this.offset = offset;
        }
        /**
         * Image of the render.
         */
        get node() { return this._node; }
        get isVector() { return true; }
        get origin() { return [this._position[0] + this.offset[0], this._position[1] + this.offset[1]]; }
        contains(position) {
            let [x, y] = this.origin;
            return position[0] >= x && position[0] <= x + this._node.width && position[1] >= y && position[1] <= y + this._node.height;
        }
    }
    exports.VectorImage = VectorImage;
});
