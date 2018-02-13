/// Template: "full_screen_map.html"
/// Title: "Map Balloon Symbol"
define(["require", "exports", "../../../source/layers/TileLayer", "../../../source/init", "../../../source/layers/FeatureLayer", "../../../source/features/Balloon", "../../../source/features/Point", "../../../source/symbols/point/CrossPointSymbol"], function (require, exports, TileLayer_1, init_1, FeatureLayer_1, Balloon_1, Point_1, CrossPointSymbol_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let { map } = init_1.init({
        wrapper: document.body,
        layers: [new TileLayer_1.TileLayer('http://b.tile.openstreetmap.org/{z}/{x}/{y}.png')]
    });
    let featureLayer = new FeatureLayer_1.FeatureLayer();
    featureLayer.add(new Point_1.PointFeature([map.position[0], map.position[1]], { crs: map.crs, symbol: new CrossPointSymbol_1.CrossPointSymbol() }));
    featureLayer.add(new Balloon_1.Balloon({
        position: [map.position[0], map.position[1]],
        crs: map.crs,
        content: '<iframe width=600 height=500 src="https://en.m.wikipedia.org/wiki/Moscow" />'
    }));
    map.addLayer(featureLayer);
});
