/// Template: "full_screen_map.html"
/// Title: "Polygon creation control"
define(["require", "exports", "../../../source/init", "../../../source/layers/TileLayer", "../../../source/layers/FeatureLayer", "../../../source/features/PointFeature", "../../../source/symbols/point/StaticImageSymbol", "../../../source/features/Polyline", "../../../source/features/Polygon", "../../../source/controls/Editor"], function (require, exports, init_1, TileLayer_1, FeatureLayer_1, PointFeature_1, StaticImageSymbol_1, Polyline_1, Polygon_1, Editor_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let featureLayer = new FeatureLayer_1.FeatureLayer();
    let { map } = init_1.init({
        wrapper: document.body,
        layers: [new TileLayer_1.TileLayer('http://b.tile.openstreetmap.org/{z}/{x}/{y}.png'), featureLayer],
    });
    let step = map.resolution * 50;
    featureLayer.add([
        new PointFeature_1.PointFeature([map.position[0], map.position[1]], { crs: map.crs, symbol: new StaticImageSymbol_1.StaticImageSymbol() }),
        new Polyline_1.Polyline([[
                [map.position[0] + step * 2, map.position[1]], [map.position[0] + step * 3, map.position[1] + step]
            ]], { crs: map.crs }),
        new Polygon_1.Polygon([[
                [map.position[0] - step, map.position[1]], [map.position[0] - step, map.position[1] + step], [map.position[0] - step * 2, map.position[1]]
            ]], { crs: map.crs })
    ]);
    let control = new Editor_1.Editor(map, { activeLayer: featureLayer });
    control.activate();
});
