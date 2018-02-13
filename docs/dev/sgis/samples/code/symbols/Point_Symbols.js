/// Template: "full_screen_map.html"
/// Title: "Point symbols"
define(["require", "exports", "../../../source/layers/FeatureLayer", "../../../source/features/Point", "../../../source/init", "../../../source/symbols/point/Point", "../../../source/symbols/point/Square", "../../../source/symbols/point/StaticImageSymbol", "../../../source/symbols/point/MaskedImage", "../../../source/layers/TileLayer", "../../../source/symbols/point/CrossPointSymbol", "../../../source/symbols/point/DynamicImageSymbol"], function (require, exports, FeatureLayer_1, Point_1, init_1, Point_2, Square_1, StaticImageSymbol_1, MaskedImage_1, TileLayer_1, CrossPointSymbol_1, DynamicImageSymbol_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let { map } = init_1.init({
        wrapper: document.body,
        layers: [new TileLayer_1.TileLayer('http://b.tile.openstreetmap.org/{z}/{x}/{y}.png')]
    });
    let symbols = [
        new Point_2.PointSymbol(),
        new Point_2.PointSymbol({ size: 30, strokeColor: 'green', strokeWidth: 2, fillColor: 'rgba(0,255,0,0.5)' }),
        new Square_1.SquareSymbol(),
        new Square_1.SquareSymbol({ size: 30, strokeColor: 'green', strokeWidth: 2, fillColor: 'rgba(0,255,0,0.5)' }),
        new StaticImageSymbol_1.StaticImageSymbol(),
        new StaticImageSymbol_1.StaticImageSymbol({ angle: Math.PI / 4, width: 32, height: 64, anchorPoint: [16, 64], source: '../../resources/Car_red.png' }),
        new MaskedImage_1.MaskedImage({ onUpdate: updateLayer }),
        new MaskedImage_1.MaskedImage({
            onUpdate: updateLayer,
            width: 64,
            height: 64,
            anchorPoint: [32, 32],
            imageSource: '../../resources/Car.png',
            maskSource: '../../resources/Car_mask.png',
            maskColor: 'blue',
            angle: Math.PI / 2
        }),
        new DynamicImageSymbol_1.DynamicImageSymbol(),
        new DynamicImageSymbol_1.DynamicImageSymbol({ source: '../../resources/Car_red.png', height: 48, width: 48, anchorPoint: [24, 32], angle: Math.PI / 6 })
    ];
    let step = 100 * map.resolution;
    let position = [map.position[0] - step * 4, map.position[1]];
    let features = [];
    let crossSymbol = new CrossPointSymbol_1.CrossPointSymbol();
    symbols.forEach(symbol => {
        features.push(new Point_1.PointFeature(position, { symbol: crossSymbol, crs: map.crs }));
        features.push(new Point_1.PointFeature(position, { symbol, crs: map.crs }));
        position = [position[0] + step, position[1]];
    });
    let layer = new FeatureLayer_1.FeatureLayer({ features });
    map.addLayer(layer);
    function updateLayer() { layer.redraw(); }
});
