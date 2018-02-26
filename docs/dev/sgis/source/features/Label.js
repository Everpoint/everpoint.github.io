define(["require", "exports", "../symbols/label/StaticLabelSymbol", "./PointFeature"], function (require, exports, StaticLabelSymbol_1, PointFeature_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const DEFAULT_LABEL_SYMBOL = new StaticLabelSymbol_1.StaticLabelSymbol();
    /**
     * @example symbols/Label_Symbols
     */
    class LabelFeature extends PointFeature_1.PointFeature {
        constructor(position, { crs, content = '', symbol = DEFAULT_LABEL_SYMBOL }) {
            super(position, { crs, symbol });
            this._content = content;
        }
        get content() { return this._content; }
        set content(value) {
            this._content = value;
            this.redraw();
        }
    }
    exports.LabelFeature = LabelFeature;
});
