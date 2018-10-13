var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
define(["require", "exports", "../symbols/BalloonSymbol", "./PointFeature"], function (require, exports, BalloonSymbol_1, PointFeature_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * This feature lets you put a custom html blocks on the map in the form of balloons over the map. The position of the balloon
     * is set as geographic coordinates of a point.
     * @alias sGis.feature.Balloon
     * @example controls/Balloon_Control
     */
    class Balloon extends PointFeature_1.PointFeature {
        constructor(position, _a) {
            var { content, symbol = new BalloonSymbol_1.BalloonSymbol(), persistOnMap = true } = _a, params = __rest(_a, ["content", "symbol", "persistOnMap"]);
            super(position, Object.assign({ symbol, persistOnMap }, params));
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
