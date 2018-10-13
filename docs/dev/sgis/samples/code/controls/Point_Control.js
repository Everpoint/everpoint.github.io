/// Template: "full_screen_map.html"
/// Title: "Point creation control"
define(["require", "exports", "../../../source/init", "../../../source/layers/TileLayer", "../../../source/layers/FeatureLayer", "../../../source/controls/PointControl", "../../../source/symbols/point/MaskedImage", "../../../source/Crs"], function (require, exports, init_1, TileLayer_1, FeatureLayer_1, PointControl_1, MaskedImage_1, Crs_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let featureLayer = new FeatureLayer_1.FeatureLayer();
    let { map } = init_1.init({
        wrapper: document.body,
        layers: [new TileLayer_1.TileLayer('http://b.tile.openstreetmap.org/{z}/{x}/{y}.png'), featureLayer],
    });
    let control = new PointControl_1.PointControl(map, { activeLayer: featureLayer, symbol: getSymbol() });
    control.on('drawingFinish', (event) => {
        console.log(event.feature.projectTo(Crs_1.geo).centroid);
        control.symbol = getSymbol();
    });
    control.activate();
    function getSymbol() {
        return new MaskedImage_1.MaskedImage({ maskColor: getRandomColor() });
    }
    function getRandomColor() {
        return '#' + ('000000' + Math.floor(Math.random() * 255 * 255 * 255).toString(16)).slice(-6);
    }
});
