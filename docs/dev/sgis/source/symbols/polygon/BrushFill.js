define(["require", "exports", "../../serializers/symbolSerializer", "../../renders/Poly", "../PolylineSymbol", "../../utils/Color", "../Symbol", "../../features/Poly"], function (require, exports, symbolSerializer_1, Poly_1, PolylineSymbol_1, Color_1, Symbol_1, Poly_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const ALPHA_NORMALIZER = 65025;
    /**
     * Symbol of polygon with brush filling.
     * @alias sGis.symbol.polygon.BrushFill
     */
    class BrushFill extends Symbol_1.Symbol {
        /**
         * @param options - key-value list of the properties to be assigned to the instance.
         */
        constructor(options = {}) {
            super();
            this._fillBackground = 'transparent';
            this._fillForeground = 'black';
            this._fillBrush = [[255, 255, 0, 0, 0, 0, 0, 0, 255, 255],
                [255, 255, 255, 0, 0, 0, 0, 0, 0, 255],
                [255, 255, 255, 255, 0, 0, 0, 0, 0, 0],
                [0, 255, 255, 255, 255, 0, 0, 0, 0, 0],
                [0, 0, 255, 255, 255, 255, 0, 0, 0, 0],
                [0, 0, 0, 255, 255, 255, 255, 0, 0, 0],
                [0, 0, 0, 0, 255, 255, 255, 255, 0, 0],
                [0, 0, 0, 0, 0, 255, 255, 255, 255, 0],
                [0, 0, 0, 0, 0, 0, 255, 255, 255, 255],
                [255, 0, 0, 0, 0, 0, 0, 255, 255, 255]];
            /** Stroke color of the outline. Can be any valid css color string. */
            this.strokeColor = 'black';
            /** Stroke width of the outline. */
            this.strokeWidth = 1;
            /** Dash pattern for the line as specified in HTML CanvasRenderingContext2D.setLineDash() specification */
            this.lineDash = [];
            this._initialized = false;
            if (options)
                Object.assign(this, options);
            this._initialized = true;
            this._updateBrush();
        }
        renderFunction(feature, resolution, crs) {
            if (!(feature instanceof Poly_2.Poly))
                return [];
            let coordinates = PolylineSymbol_1.PolylineSymbol.getRenderedCoordinates(feature, resolution, crs);
            return [new Poly_1.PolyRender(coordinates, {
                    enclosed: true,
                    strokeColor: this.strokeColor,
                    strokeWidth: this.strokeWidth,
                    fillStyle: Poly_1.FillStyle.Image,
                    fillImage: this._brush,
                    lineDash: this.lineDash
                })];
        }
        /**
         * Brush pattern for filling.
         */
        get fillBrush() { return this._fillBrush; }
        set fillBrush(brush) {
            this._fillBrush = brush;
            this._updateBrush();
        }
        /**
         * Brush background color. Can be any valid css color string.
         */
        get fillBackground() { return this._fillBackground; }
        set fillBackground(color) {
            this._fillBackground = color;
            this._updateBrush();
        }
        /**
         * Brush foreground color. Can be any valid css color string.
         */
        get fillForeground() { return this._fillForeground; }
        set fillForeground(color) {
            this._fillForeground = color;
            this._updateBrush();
        }
        _updateBrush() {
            if (!this._initialized)
                return;
            let canvas = document.createElement('canvas');
            let ctx = canvas.getContext('2d');
            let brush = this.fillBrush;
            let foreground = new Color_1.Color(this.fillForeground);
            let background = new Color_1.Color(this.fillBackground);
            canvas.height = brush.length;
            canvas.width = brush[0].length;
            for (let i = 0, l = brush.length; i < l; i++) {
                for (let j = 0, m = brush[i].length; j < m; j++) {
                    let srcA = brush[i][j] * foreground.a / ALPHA_NORMALIZER, dstA = background.a / 255 * (1 - srcA), a = +Math.min(1, (srcA + dstA)).toFixed(2), r = Math.round(Math.min(255, background.r * dstA + foreground.r * srcA)), g = Math.round(Math.min(255, background.g * dstA + foreground.g * srcA)), b = Math.round(Math.min(255, background.b * dstA + foreground.b * srcA));
                    ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
                    ctx.fillRect(j, i, 1, 1);
                }
            }
            this._brush = new Image();
            this._brush.src = canvas.toDataURL();
        }
    }
    exports.BrushFill = BrushFill;
    symbolSerializer_1.registerSymbol(BrushFill, 'polygon.BrushFill', ['fillBrush', 'fillBackground', 'fillForeground', 'strokeColor', 'strokeWidth']);
});
