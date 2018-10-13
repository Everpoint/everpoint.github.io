/// Template: "full_screen_map.html"
/// Title: "Polyline creation control"
define(["require", "exports", "../../../source/init", "../../../source/layers/TileLayer", "../../../source/layers/FeatureLayer", "../../../source/Crs", "../../../source/controls/PolylineControl", "../../../source/symbols/PolylineSymbol"], function (require, exports, init_1, TileLayer_1, FeatureLayer_1, Crs_1, PolylineControl_1, PolylineSymbol_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let featureLayer = new FeatureLayer_1.FeatureLayer();
    let { map } = init_1.init({
        wrapper: document.body,
        layers: [new TileLayer_1.TileLayer('http://b.tile.openstreetmap.org/{z}/{x}/{y}.png'), featureLayer],
    });
    let control = new PolylineControl_1.PolylineControl(map, { activeLayer: featureLayer, symbol: getSymbol() });
    control.on('drawingFinish', (event) => {
        console.log(event.feature.projectTo(Crs_1.geo).rings);
        control.symbol = getSymbol();
    });
    control.activate();
    function getSymbol() {
        return new PolylineSymbol_1.PolylineSymbol({ strokeColor: getRandomColor(), strokeWidth: 3 });
    }
    function getRandomColor() {
        return '#' + ('000000' + Math.floor(Math.random() * 255 * 255 * 255).toString(16)).slice(-6);
    }
});
