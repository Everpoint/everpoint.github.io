/// Template: "full_screen_map.html"
/// Title: "Cluster layer"
define(["require", "exports", "../../source/layers/ClusterLayer", "../../source/init", "../../source/layers/TileLayer", "../../source/features/PointFeature", "../../source/Crs", "../../source/Point", "../resources/data"], function (require, exports, ClusterLayer_1, init_1, TileLayer_1, PointFeature_1, Crs_1, Point_1, data_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let { map } = init_1.init({
        centerPoint: new Point_1.Point([58, 92]),
        resolution: 9595,
        wrapper: document.body,
        layers: [
            new TileLayer_1.TileLayer('http://tile1.maps.2gis.com/tiles?x={x}&y={y}&z={z}&v=40'),
        ],
    });
    const features = data_1.data.map(coordinates => new PointFeature_1.PointFeature([coordinates[0], coordinates[1]], {
        crs: Crs_1.wgs84,
    }));
    const layer = new ClusterLayer_1.ClusterLayer();
    layer.add(features);
    map.addLayer(layer);
});
