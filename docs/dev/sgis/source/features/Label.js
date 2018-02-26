var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
define(["require", "exports", "../symbols/label/StaticLabelSymbol", "./PointFeature", "../Point"], function (require, exports, StaticLabelSymbol_1, PointFeature_1, Point_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const DEFAULT_LABEL_SYMBOL = new StaticLabelSymbol_1.StaticLabelSymbol();
    /**
     * Text label on the map.
     * @example symbols/Label_Symbols
     */
    class LabelFeature extends PointFeature_1.PointFeature {
        constructor(position, _a) {
            var { content = '', symbol = DEFAULT_LABEL_SYMBOL } = _a, params = __rest(_a, ["content", "symbol"]);
            super(position, Object.assign({ symbol }, params));
            this._content = content;
        }
        /**
         * The text of the label.
         */
        get content() { return this._content; }
        set content(value) {
            this._content = value;
            this.redraw();
        }
        clone() {
            return new LabelFeature(this.position, { crs: this.crs, symbol: this.symbol, content: this.content, persistOnMap: this.persistOnMap });
        }
        projectTo(crs) {
            let projected = Point_1.Point.prototype.projectTo.call(this, crs).position;
            return new LabelFeature(projected, { crs, symbol: this.symbol, content: this.content, persistOnMap: this.persistOnMap });
        }
    }
    exports.LabelFeature = LabelFeature;
});
