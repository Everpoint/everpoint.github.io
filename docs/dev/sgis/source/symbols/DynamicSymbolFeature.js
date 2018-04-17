define(["require", "exports", "../features/PointFeature"], function (require, exports, PointFeature_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class DynamicSymbolFeature extends PointFeature_1.PointFeature {
        constructor() {
            super(...arguments);
            this.__dynamicSymbolRender = null;
            this.__lastBbox = null;
            this.__lastResolution = null;
        }
    }
    exports.DynamicSymbolFeature = DynamicSymbolFeature;
});
