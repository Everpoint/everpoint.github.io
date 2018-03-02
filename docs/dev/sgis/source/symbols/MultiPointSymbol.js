define(["require", "exports", "../features/MultiPoint", "../features/PointFeature", "./Symbol"], function (require, exports, MultiPoint_1, PointFeature_1, Symbol_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class MultiPointSymbol extends Symbol_1.Symbol {
        constructor(baseSymbol) {
            super();
            this.baseSymbol = baseSymbol;
        }
        renderFunction(feature, resolution, crs) {
            if (!(feature instanceof MultiPoint_1.MultiPoint))
                return [];
            let renders = [];
            feature.points.forEach(point => {
                let f = new PointFeature_1.PointFeature(point, { crs: feature.crs, symbol: this.baseSymbol });
                renders = renders.concat(f.render(resolution, crs));
            });
            return renders;
        }
    }
    exports.MultiPointSymbol = MultiPointSymbol;
});
