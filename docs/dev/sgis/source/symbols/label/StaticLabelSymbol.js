define(["require", "exports", "../Symbol", "../../renders/VectorLabel"], function (require, exports, Symbol_1, VectorLabel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @example symbols/Label_Symbols
     */
    class StaticLabelSymbol extends Symbol_1.Symbol {
        constructor({ fontSize, fontFamily, fontStyle, horizontalAlignment, verticalAlignment, offset = [5, 0], strokeColor, strokeWidth, fillColor } = {}) {
            super();
            this.fontSize = fontSize;
            this.fontFamily = fontFamily;
            this.fontStyle = fontStyle;
            this.horizontalAlignment = horizontalAlignment;
            this.verticalAlignment = verticalAlignment;
            this.offset = offset;
            this.strokeColor = strokeColor;
            this.strokeWidth = strokeWidth;
            this.fillColor = fillColor;
        }
        renderFunction(feature, resolution, crs) {
            if (!feature.crs.canProjectTo(crs))
                return [];
            let label = feature;
            let position = label.projectTo(crs).position;
            let pxPosition = [position[0] / resolution + (this.offset[0] || 0), -position[1] / resolution + (this.offset[1] || 0)];
            return [new VectorLabel_1.VectorLabel({
                    position: pxPosition,
                    text: label.content,
                    fontSize: this.fontSize,
                    fontFamily: this.fontFamily,
                    fontStyle: this.fontStyle,
                    verticalAlignment: this.verticalAlignment,
                    horizontalAlignment: this.horizontalAlignment,
                    fillColor: this.fillColor,
                    strokeColor: this.strokeColor,
                    strokeWidth: this.strokeWidth
                })];
        }
    }
    exports.StaticLabelSymbol = StaticLabelSymbol;
});
