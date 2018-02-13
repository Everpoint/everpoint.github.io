define(["require", "exports", "../interfaces/Render"], function (require, exports, Render_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Custom HTML element on the map.
     * @alias sGis.render.HtmlElement
     */
    class HtmlElement extends Render_1.Render {
        /**
         * @param htmlText - the inner html value of html element
         * @param position - projected position of render
         * @param onAfterDisplayed - callback function that will be called after a render node is drawn to the DOM
         * @param offset - offset of the element from the position
         */
        constructor(htmlText, position, onAfterDisplayed = null, offset = [0, 0]) {
            super();
            this._htmlText = htmlText;
            this._position = position;
            this.onAfterDisplayed = onAfterDisplayed;
            this.offset = offset;
        }
        /**
         * Returns HTML div element as the second parameter to callback function
         * @param callback - callback function that will be called after node is ready
         */
        getNode(callback) {
            let node = document.createElement('div');
            node.innerHTML = this._htmlText;
            this._lastNode = node;
            callback(null, node);
        }
        /**
         * Position of the render
         */
        get position() { return this._position; }
        contains(position) {
            let width = this._lastNode.clientWidth || this._lastNode.offsetWidth || 0;
            let height = this._lastNode.clientHeight || this._lastNode.offsetHeight || 0;
            let x = this._position[0] + (this.offset && this.offset[0] || 0);
            let y = this._position[1] + (this.offset && this.offset[1] || 0);
            return x < position[0] && y < position[1] && x + width > position[0] && y + height > position[1];
        }
        get isVector() { return false; }
    }
    exports.HtmlElement = HtmlElement;
});
