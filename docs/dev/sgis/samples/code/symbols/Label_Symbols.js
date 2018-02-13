/// Template: "full_screen_map.html"
/// Title: "Label symbols"
define(["require", "exports", "../../../source/layers/FeatureLayer", "../../../source/features/Point", "../../../source/init", "../../../source/layers/TileLayer", "../../../source/symbols/point/CrossPointSymbol", "../../../source/symbols/label/StaticLabelSymbol", "../../../source/renders/VectorLabel", "../../../source/features/Label", "../../../source/symbols/label/DynamicLabelSymbol", "../../../source/utils/utils"], function (require, exports, FeatureLayer_1, Point_1, init_1, TileLayer_1, CrossPointSymbol_1, StaticLabelSymbol_1, VectorLabel_1, Label_1, DynamicLabelSymbol_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let { map } = init_1.init({
        wrapper: document.body,
        layers: [new TileLayer_1.TileLayer('http://b.tile.openstreetmap.org/{z}/{x}/{y}.png')]
    });
    let symbols = [
        new StaticLabelSymbol_1.StaticLabelSymbol(),
        new StaticLabelSymbol_1.StaticLabelSymbol({
            fontSize: 20,
            fontFamily: 'Times New Roman, sans-serif',
            fontStyle: 'bold',
            verticalAlignment: VectorLabel_1.VerticalAlignment.Bottom,
            horizontalAlignment: VectorLabel_1.HorizontalAlignment.Center,
            offset: [0, 5],
            fillColor: 'rgba(0,0,255,0.5)',
            strokeColor: 'blue',
            strokeWidth: 0.5
        }),
        new DynamicLabelSymbol_1.DynamicLabelSymbol(),
        new DynamicLabelSymbol_1.DynamicLabelSymbol({ cssClassName: 'sGis-dynamicLabel customLabel', offset: [0, -3] })
    ];
    utils_1.setStyleNode(`
    .customLabel {
        font-size: 20px;
        color: red;
        cursor: pointer;
        transform: translate(-50%, -100%);
    }
    
    .customLabel:hover {
        color: green;
    }
`);
    let step = 100 * map.resolution;
    let position = [map.position[0] - step * 2, map.position[1]];
    let features = [];
    let crossSymbol = new CrossPointSymbol_1.CrossPointSymbol({ strokeColor: 'red' });
    symbols.forEach((symbol, index) => {
        features.push(new Point_1.PointFeature(position, { symbol: crossSymbol, crs: map.crs }));
        features.push(new Label_1.LabelFeature(position, { symbol, crs: map.crs, content: `Label ${index}` }));
        position = [position[0] + step, position[1]];
    });
    let layer = new FeatureLayer_1.FeatureLayer({ features });
    map.addLayer(layer);
});
