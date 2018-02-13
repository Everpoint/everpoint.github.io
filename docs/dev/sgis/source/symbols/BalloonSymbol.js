define(["require", "exports", "./Symbol", "../utils/utils"], function (require, exports, Symbol_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    utils_1.setStyleNode(`
    .sGis-balloon {
        border: 3px solid rgba(0, 0, 0, 0.3);
        border-radius: 7px;
        transform: translate(-50%, -100%);
    }
    
    .sGis-balloon:before {
        content: " ";
        position: absolute;
        background: white;
        border: 3px solid rgba(0, 0, 0, 0.3);
        width: 10px;
        height: 10px;
        margin-left: 0;
        transform: translate(-50%, -50%) rotate(45deg);
        left: 50%;
        top: 100%;
    }
    
    .sGis-balloon > div {
        border-radius: 5px;
        background: white;
        position: relative;
        min-height: 40px;
        min-width: 40px;
        overflow: hidden;
        padding: 5px;
    }
`);
    class BalloonSymbol extends Symbol_1.DynamicPointSymbol {
        constructor({ onRender, offset = [0, -7] } = {}) {
            super({ offset, onRender });
        }
        _getFeatureNode(feature) {
            let balloonFeature = feature;
            let node = document.createElement('div');
            node.className = 'sGis-balloon';
            let container = document.createElement('div');
            if (balloonFeature.content)
                container.appendChild(balloonFeature.content);
            node.appendChild(container);
            let mapNode = node;
            mapNode.doNotBubbleToMap = true;
            return node;
        }
    }
    exports.BalloonSymbol = BalloonSymbol;
});
