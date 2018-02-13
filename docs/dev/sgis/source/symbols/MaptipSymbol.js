define(["require", "exports", "../utils/utils", "../renders/HtmlElement", "./Symbol", "../features/Maptip"], function (require, exports, utils_1, HtmlElement_1, Symbol_1, Maptip_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Balloon over a map with html content.
     * @alias sGis.symbol.maptip.Simple
     */
    class MaptipSymbol extends Symbol_1.Symbol {
        constructor() {
            super();
        }
        renderFunction(feature, resolution, crs) {
            if (!(feature instanceof Maptip_1.Maptip))
                return [];
            let position = feature.point.projectTo(crs).position;
            let pxPosition = [position[0] / resolution, position[1] / resolution];
            let render = new HtmlElement_1.HtmlElement(`<div class="sGis-maptip-outerContainer"><div class="sGis-maptip-innerContainer">${feature.content}</div></div>`, pxPosition);
            return [render];
        }
    }
    exports.MaptipSymbol = MaptipSymbol;
    utils_1.setStyleNode(`

    .sGis-maptip-outerContainer {
        transform: translate(-50%, -100%);
    }
    
    .sGis-maptip-innerContainer {
        background-color: white;
        transform: translate(0, -16px);
        padding: 8px;
        border-radius: 5px;
        position: relative;
        box-shadow: 0 0 6px #B2B2B2;
    }
    
    .sGis-maptip-innerContainer:after {
        content: ' ';
        position: absolute;
        display: block;
        background: white;
        top: 100%;
        left: 50%;
        height: 20px;
        width: 20px;
        transform: translate(-50%, -10px) rotate(45deg);
        box-shadow: 2px 2px 2px 0 rgba( 178, 178, 178, .4 );
    }

`);
});
