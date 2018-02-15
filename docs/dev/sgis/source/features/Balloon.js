define(["require", "exports", "./Feature", "../Point", "../Bbox", "../symbols/BalloonSymbol"], function (require, exports, Feature_1, Point_1, Bbox_1, BalloonSymbol_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Balloon extends Feature_1.Feature {
        constructor({ position, content, crs, symbol = new BalloonSymbol_1.BalloonSymbol(), persistOnMap = true }) {
            super({ crs, symbol, persistOnMap });
            this._position = position;
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
        get position() { return this._position; }
        set position(value) {
            this._position = value;
            this.redraw();
        }
        get x() { return this._position[0]; }
        get y() { return this._position[1]; }
        projectTo(newCrs) {
            let projected = Point_1.Point.prototype.projectTo.call(this, newCrs);
            return new Balloon({ position: projected.position, content: this._content, crs: newCrs, symbol: this.symbol });
        }
        get bbox() {
            return new Bbox_1.Bbox(this._position, this._position, this.crs);
        }
    }
    exports.Balloon = Balloon;
});
