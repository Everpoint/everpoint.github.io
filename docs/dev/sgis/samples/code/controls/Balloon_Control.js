/// Template: "full_screen_map.html"
/// Title: "Map Balloon Control"
define(["require", "exports", "../../../source/init", "../../../source/layers/TileLayer", "../../../source/layers/FeatureLayer", "../../../source/features/PointFeature", "../../../source/controls/BalloonControl", "../../../source/Point"], function (require, exports, init_1, TileLayer_1, FeatureLayer_1, PointFeature_1, BalloonControl_1, Point_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let points = [
        { position: [55.7514, 37.6409], text: 'Moscow', link: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/MSK_Collage_2015.png/343px-MSK_Collage_2015.png' },
        { position: [59.9226, 30.3324], text: 'Saint Petersburg', link: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/St._Petersburg_Montage_2016.png/343px-St._Petersburg_Montage_2016.png' }
    ];
    let { map, painter } = init_1.init({
        wrapper: document.body,
        layers: [new TileLayer_1.TileLayer('http://b.tile.openstreetmap.org/{z}/{x}/{y}.png')],
        centerPoint: new Point_1.Point([57.84, 40.56]),
        resolution: 2445.984905125002
    });
    let control = new BalloonControl_1.BalloonControl(map, { painter });
    let featureLayer = new FeatureLayer_1.FeatureLayer();
    points.forEach(point => {
        let feature = new PointFeature_1.PointFeature(point.position);
        control.attach(feature, `<h1>${point.text}</h1><img src="${point.link}" />`);
        featureLayer.add(feature);
    });
    map.addLayer(featureLayer);
});
