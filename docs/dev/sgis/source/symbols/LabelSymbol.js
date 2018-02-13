define(["require", "exports", "../renders/HtmlElement", "../utils/utils", "./Symbol", "../features/Label"], function (require, exports, HtmlElement_1, utils_1, Symbol_1, Label_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Symbol of simple html text label.
     * @alias sGis.symbol.label.Label
     */
    class LabelSymbol extends Symbol_1.Symbol {
        /**
         * @param options - key-value list of the properties to be assigned to the instance.
         */
        constructor(options = {}) {
            super();
            /** Css class to be added to the label node. */
            this.css = 'sGis-symbol-label-center-top';
            Object.assign(this, options);
        }
        renderFunction(feature, resolution, crs) {
            if (!(feature instanceof Label_1.Label))
                return [];
            let html = '<div' + (this.css ? ' class="' + this.css + '"' : '') + '>' + feature.content + '</div>';
            let point = feature.point.projectTo(crs);
            let position = [point.x / resolution, -point.y / resolution];
            return [new HtmlElement_1.HtmlElement(html, position)];
        }
    }
    exports.LabelSymbol = LabelSymbol;
    utils_1.setCssClasses({
        'sGis-symbol-label-left-top': 'transform:translate(-120%,-120%);',
        'sGis-symbol-label-left-middle': 'transform:translate(-120%,-50%);',
        'sGis-symbol-label-left-bottom': 'transform:translate(-120%,20%);',
        'sGis-symbol-label-center-top': 'transform:translate(-50%,-120%);',
        'sGis-symbol-label-center-middle': 'transform:translate(-50%,-50%);',
        'sGis-symbol-label-center-bottom': 'transform:translate(-50%,20%);',
        'sGis-symbol-label-right-top': 'transform:translate(20%,-120%);',
        'sGis-symbol-label-right-middle': 'transform:translate(20%,-50%);',
        'sGis-symbol-label-right-bottom': 'transform:translate(20%,20%);'
    });
});
