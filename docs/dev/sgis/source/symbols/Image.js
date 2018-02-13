define(["require", "exports", "../serializers/symbolSerializer", "../renders/Image", "./Symbol"], function (require, exports, symbolSerializer_1, Image_1, Symbol_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Symbol for image with size bound by feature bbox.
     * @alias sGis.symbol.image.Image
     */
    class ImageSymbol extends Symbol_1.Symbol {
        /**
         * @param __namedParameters - key-value list of the properties to be assigned to the instance.
         */
        constructor({ opacity = 1, transitionTime = 0 } = {}) {
            super();
            this.transitionTime = transitionTime;
            this.opacity = opacity;
        }
        renderFunction(feature, resolution, crs) {
            let bbox = feature.bbox.projectTo(crs);
            let render = new Image_1.ImageRender(feature.src, bbox);
            if (this.transitionTime > 0) {
                render.opacity = 0;
                render.onAfterDisplayed = (node) => {
                    setTimeout(() => {
                        node.style.transition = 'opacity ' + this.transitionTime / 1000 + 's linear';
                        node.style.opacity = this.opacity;
                    }, 0);
                };
            }
            else {
                render.opacity = this.opacity;
            }
            return [render];
        }
    }
    exports.ImageSymbol = ImageSymbol;
    symbolSerializer_1.registerSymbol(ImageSymbol, 'image.Image', ['transitionTime', 'opacity']);
});
