define(["require", "exports", "../symbols/BalloonSymbol", "./PointFeature"], function (require, exports, BalloonSymbol_1, PointFeature_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Balloon extends PointFeature_1.PointFeature {
        constructor({ position, content, crs, symbol = new BalloonSymbol_1.BalloonSymbol(), persistOnMap = true }) {
            super(position, { crs, symbol, persistOnMap });
            if (content instanceof HTMLElement) {
                this._content = content;
            }
            else {
                this._content = this._getNode(content);
            }
        }
        _getNode(htmlString) {
            let div = document.createElement('div');
            div.innerHTML = htmlString;
            if (div.children.length === 1) {
                return div.firstChild;
            }
            else {
                return div;
            }
        }
        get content() { return this._content; }
    }
    exports.Balloon = Balloon;
});
