define(["require", "exports", "../Symbol", "../../utils/utils"], function (require, exports, Symbol_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const DEFAULT_CLASS_NAME = 'sGis-dynamicLabel';
    const DEFAULT_STYLE = `
    transform: translate(0, -50%);
    font: 14px arial;
    color: black;
    text-shadow: -1px -1px 0 white, 1px -1px 0 white, -1px 1px 0 white, 1px 1px 0 white; 
`;
    utils_1.setCssClasses({ [DEFAULT_CLASS_NAME]: DEFAULT_STYLE });
    /**
     * @example symbols/Label_Symbols
     */
    class DynamicLabelSymbol extends Symbol_1.DynamicPointSymbol {
        constructor({ cssClassName = DEFAULT_CLASS_NAME, offset } = {}) {
            super({ offset });
            this.cssClassName = cssClassName;
        }
        _getFeatureNode(feature) {
            let labelFeature = feature;
            let node = document.createElement('span');
            node.innerText = labelFeature.content;
            if (this.cssClassName)
                node.className = this.cssClassName;
            return node;
        }
        _updateFeatureNode(feature) {
            let node = this.getNode(feature);
            node.innerText = feature.content;
        }
    }
    exports.DynamicLabelSymbol = DynamicLabelSymbol;
});
