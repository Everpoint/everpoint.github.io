define(["require", "exports", "./Feature", "../Point", "../Bbox", "../symbols/label/StaticLabelSymbol"], function (require, exports, Feature_1, Point_1, Bbox_1, StaticLabelSymbol_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const DEFAULT_LABEL_SYMBOL = new StaticLabelSymbol_1.StaticLabelSymbol();
    class LabelFeature extends Feature_1.Feature {
        constructor(position, { crs, content = '', symbol = DEFAULT_LABEL_SYMBOL }) {
            super({ crs, symbol });
            this._position = position;
            this._content = content;
        }
        get content() { return this._content; }
        set content(value) {
            this._content = value;
            this.redraw();
        }
        get bbox() {
            return new Bbox_1.Bbox(this._position, this._position, this.crs);
        }
        get position() { return this._position; }
        set position(value) {
            this._position = value;
            this.redraw();
        }
        get x() { return this._position[0]; }
        get y() { return this._position[1]; }
        projectTo(newCrs) {
            let projected = Point_1.Point.prototype.projectTo.call(this, newCrs);
            return new LabelFeature(projected.position, { crs: newCrs, symbol: this.symbol, content: this.content });
        }
    }
    exports.LabelFeature = LabelFeature;
});
