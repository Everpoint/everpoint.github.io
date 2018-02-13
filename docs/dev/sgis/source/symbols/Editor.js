define(["require", "exports", "./point/Point", "../renders/Poly", "../renders/Arc", "./point/PointImageSymbol", "./point/MaskedImage", "./Symbol"], function (require, exports, Point_1, Poly_1, Arc_1, PointImageSymbol_1, MaskedImage_1, Symbol_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Symbol of a highlighted feature for editor.
     * @alias sGis.symbol.Editor
     * @extends sGis.Symbol
     */
    class EditorSymbol extends Symbol_1.Symbol {
        /**
         * @constructor
         * @param {Object} [properties] - key-value list of properties to be assigned to the instance.
         */
        constructor(properties) {
            super();
            /** Base symbol of the feature. Used to render original feature with the highlight. */
            this.baseSymbol = new Point_1.PointSymbol();
            /** Color of the halo (highlight). Can be any valid css color string. */
            this.color = 'rgba(97,239,255,0.5)';
            /** Size of the halo around the feature. */
            this.haloSize = 5;
            if (properties)
                Object.assign(this, properties);
        }
        renderFunction(feature, resolution, crs) {
            var baseRender = this.baseSymbol.renderFunction(feature, resolution, crs);
            var halo;
            for (var i = 0; i < baseRender.length; i++) {
                if (baseRender[i] instanceof Arc_1.Arc) {
                    halo = new Arc_1.Arc(baseRender[i].center, {
                        fillColor: this.color,
                        radius: parseFloat(baseRender[i].radius) + this.haloSize,
                        strokeColor: 'transparent'
                    });
                    break;
                }
                else if (baseRender[i] instanceof Poly_1.PolyRender) {
                    halo = new Poly_1.PolyRender(baseRender[i].coordinates, {
                        enclosed: baseRender[i].enclosed,
                        fillStyle: baseRender[i].fillStyle === Poly_1.FillStyle.None ? Poly_1.FillStyle.None : Poly_1.FillStyle.Color,
                        strokeColor: this.color,
                        fillColor: this.color,
                        strokeWidth: parseFloat(baseRender[i].strokeWidth) + 2 * this.haloSize
                    });
                    break;
                }
                else if (this.baseSymbol instanceof PointImageSymbol_1.PointImageSymbol || this.baseSymbol instanceof MaskedImage_1.MaskedImage) {
                    halo = new Arc_1.Arc([
                        baseRender[i].position[0] - (+this.baseSymbol.anchorPoint.x) + this.baseSymbol.width / 2,
                        baseRender[i].position[1] - (+this.baseSymbol.anchorPoint.x) + this.baseSymbol.width / 2,
                    ], {
                        fillColor: this.color,
                        radius: this.baseSymbol.width / 2 + this.haloSize,
                        strokeColor: 'transparent'
                    });
                    break;
                }
            }
            if (halo)
                baseRender.unshift(halo);
            return baseRender;
        }
    }
    exports.EditorSymbol = EditorSymbol;
});
