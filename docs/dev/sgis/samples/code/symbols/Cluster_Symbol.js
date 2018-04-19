/// Template: "full_screen_map.html"
/// Title: "Cluster symbols"
define(["require", "exports", "../../../source/layers/FeatureLayer", "../../../source/init", "../../../source/layers/TileLayer", "../../../source/symbols/ClusterSymbol", "../../../source/features/FeatureGroup", "../../../source/features/PointFeature", "../../../source/Crs"], function (require, exports, FeatureLayer_1, init_1, TileLayer_1, ClusterSymbol_1, FeatureGroup_1, PointFeature_1, Crs_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let { map } = init_1.init({
        wrapper: document.body,
        layers: [new TileLayer_1.TileLayer('http://b.tile.openstreetmap.org/{z}/{x}/{y}.png')]
    });
    let symbols = [
        new ClusterSymbol_1.ClusterSymbol(),
        new ClusterSymbol_1.ClusterSymbol({
            fontColor: '#fff',
            fillColor: 'rgba(252, 217, 89, 1)',
            borderColor: '#fff',
            offset: [0, -3],
        }),
        new ClusterSymbol_1.ClusterSymbol({
            borderWidth: 4,
            fontColor: 'rgb(100, 199, 108)',
            borderColor: 'rgb(100, 199, 108)',
            font: 'bold 12px Roboto, sans-serif',
        }),
        new ClusterSymbol_1.ClusterSymbol({
            fontColor: '#fff',
            size: 40,
            outlineWidth: 0,
            borderWidth: 4,
            font: 'bold 14px sans-serif',
            borderColor: '#fff',
            fillColor: 'rgba(249, 88, 87, 1)',
        }),
    ];
    let features = [];
    const points = [
        [
            [38.684968, 56.195796],
            [36.484312, 56.206483],
            [37.115252, 56.883747],
            [35.857988, 54.967378],
        ],
        [
            [38.684968, 56.197796],
            [36.484312, 55.106483],
            [37.115252, 56.884747],
            [37.857988, 56.967378],
            [33.857988, 55.967378],
            [34.857988, 52.967378],
        ],
        [
            [38.684968, 56.195796],
            [38.484312, 54.206483],
            [37.115252, 56.883747],
        ],
        [
            [38.684968, 56.194796],
            [38.484312, 54.205483],
            [38.115252, 57.883747],
            [36.857988, 54.467378],
            [36.877988, 54.417378],
        ],
    ].map(group => group.map(point => new PointFeature_1.PointFeature([point[0], point[1]], { crs: Crs_1.wgs84 })));
    symbols.forEach((symbol, index) => {
        features.push(new FeatureGroup_1.FeatureGroup(points[index], { symbol: symbols[index], crs: map.crs }));
    });
    let layer = new FeatureLayer_1.FeatureLayer({ features });
    map.addLayer(layer);
});
