define(["require", "exports", "./StaticImageRender", "../Point"], function (require, exports, StaticImageRender_1, Point_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class StaticHtmlImageRender extends StaticImageRender_1.StaticImageRender {
        constructor({ src, bbox, width, height, opacity, onLoad, onDisplayed = undefined, onRemoved = undefined }) {
            super({ src, width, height, opacity, onLoad });
            this.bbox = bbox;
            this.onDisplayed = onDisplayed;
            this.onRemoved = onRemoved;
        }
        contains(position) {
            let resolution = this.bbox.width / this.width;
            return this.bbox.contains(new Point_1.Point([position[0] * resolution, -position[1] * resolution], this.bbox.crs));
        }
    }
    exports.StaticHtmlImageRender = StaticHtmlImageRender;
});
