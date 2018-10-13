/// Template: "full_screen_map.html"
/// Title: "Using DynamicLayer to Show Arcgis MapService"
define(["require", "exports", "../../source/layers/DynamicLayer", "../../source/init", "../../source/layers/TileLayer"], function (require, exports, DynamicLayer_1, init_1, TileLayer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ArcGisLayer extends DynamicLayer_1.DynamicLayer {
        constructor(url, opacity) {
            super({ opacity });
            this.url = url;
        }
        getUrl(bbox, resolution) {
            let imgWidth = Math.round((bbox.xMax - bbox.xMin) / resolution);
            let imgHeight = Math.round((bbox.yMax - bbox.yMin) / resolution);
            let sr = bbox.crs.toString();
            return `${this.url}/export?dpi=96&transparent=true&bbox=${bbox.xMin}%2C${bbox.yMin}%2C${bbox.xMax}%2C${bbox.yMax}` +
                `&bboxSR=${sr}&imageSR=${sr}&size=${imgWidth}%2C${imgHeight}&f=image`;
        }
    }
    init_1.init({
        position: [-10295767.463030389, 4868831.057002825],
        resolution: 4891.969810250004,
        wrapper: document.body,
        layers: [
            new TileLayer_1.TileLayer('http://b.tile.openstreetmap.org/{z}/{x}/{y}.png'),
            new ArcGisLayer('//utility.arcgis.com/usrsvcs/rest/services/f060a57639324461a263846c284a6e61/MapServer', 0.5)
        ]
    });
});
