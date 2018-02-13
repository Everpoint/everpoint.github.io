/// Template: "4_maps.html"
/// Title: "Setting position and resolution with init function"
define(["require", "exports", "sgis/dist/init", "sgis/dist/layers/TileLayer", "sgis/dist/Point", "sgis/dist/Crs"], function (require, exports, init_1, TileLayer_1, Point_1, Crs_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let gis1 = init_1.init({
        wrapper: 'map1',
        layers: [new TileLayer_1.TileLayer('http://b.tile.openstreetmap.org/{z}/{x}/{y}.png')]
    });
    let gis2 = init_1.init({
        wrapper: 'map2',
        layers: [new TileLayer_1.TileLayer('http://b.tile.openstreetmap.org/{z}/{x}/{y}.png')],
        position: new Point_1.Point([59.9194063, 30.3458224]).projectTo(Crs_1.webMercator).position
    });
    let gis3 = init_1.init({
        wrapper: 'map3',
        layers: [new TileLayer_1.TileLayer('http://b.tile.openstreetmap.org/{z}/{x}/{y}.png')],
        centerPoint: new Point_1.Point([59.9194063, 30.3458224]),
        resolution: 611.4962262812505 / 4
    });
    let gis4 = init_1.init({
        wrapper: 'map4',
        layers: [new TileLayer_1.TileLayer('http://b.tile.openstreetmap.org/{z}/{x}/{y}.png')],
        position: [4422391, 5405574],
        resolution: 611.4962262812505
    });
});
