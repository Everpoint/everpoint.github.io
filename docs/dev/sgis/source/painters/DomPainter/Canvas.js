define(["require", "exports", "../../renders/Arc", "../../renders/Point", "../../renders/Poly", "../../utils/utils", "../../renders/StaticVectorImageRender"], function (require, exports, Arc_1, Point_1, Poly_1, utils_1, StaticVectorImageRender_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @alias sGis.painter.domPainter.Canvas
     * @ignore
     */
    class Canvas {
        constructor(canvasNode) {
            if (canvasNode) {
                this._canvasNode = canvasNode;
                this._ctx = this._canvasNode.getContext('2d');
            }
            else {
                this._createNode();
            }
        }
        _createNode() {
            this._canvasNode = document.createElement('canvas');
            this._canvasNode.style.pointerEvents = 'none';
            this._ctx = this._canvasNode.getContext('2d');
        }
        reset(bbox, resolution, width, height) {
            this._ctx.clearRect(0, 0, this._canvasNode.width, this._canvasNode.height);
            this._canvasNode.width = width;
            this._canvasNode.height = height;
            this._isEmpty = true;
            this._ctx.translate(Math.round(-bbox.xMin / resolution), Math.round(bbox.yMax / resolution));
            this.bbox = bbox;
        }
        get width() { return this._canvasNode.width; }
        get height() { return this._canvasNode.height; }
        draw(render) {
            if (render instanceof Arc_1.Arc) {
                this._drawArc(render);
            }
            else if (render instanceof Point_1.Point) {
                this._drawPoint(render);
            }
            else if (render instanceof Poly_1.PolyRender) {
                this._drawPoly(render);
            }
            else if (render instanceof StaticVectorImageRender_1.StaticVectorImageRender) {
                this._drawImage(render);
            }
            else {
                utils_1.error('Unknown vector geometry type.');
            }
            this._isEmpty = false;
        }
        setIndex(index) {
            this._canvasNode.style.zIndex = index;
        }
        _drawArc(render) {
            var center = render.center;
            this._ctx.beginPath();
            this._ctx.lineWidth = render.strokeWidth;
            this._ctx.strokeStyle = render.strokeColor;
            this._ctx.fillStyle = render.fillColor;
            if (render.isSector) {
                this._ctx.moveTo(center[0], center[1]);
            }
            this._ctx.arc(center[0], center[1], render.radius, render.startAngle, render.endAngle, !render.clockwise);
            if (render.isSector) {
                this._ctx.lineTo(center[0], center[1]);
            }
            this._ctx.fill();
            this._ctx.stroke();
        }
        _drawPoint(render) {
            this._ctx.strokeStyle = this._ctx.fillStyle = render.color;
            this._ctx.fillRect(render.coordinates[0], render.coordinates[1], 1, 1);
        }
        _drawImage(render) {
            let [x, y] = render.position;
            x = Math.round(x);
            y = Math.round(y);
            this._ctx.translate(x, y);
            this._ctx.rotate(render.angle);
            let opacity = render.opacity;
            if (opacity !== 1)
                this._ctx.globalAlpha = opacity;
            this._ctx.drawImage(render.node, render.offset[0], render.offset[1], render.width, render.height);
            if (opacity !== 1)
                this._ctx.globalAlpha = 1;
            this._ctx.rotate(-render.angle);
            this._ctx.translate(-x, -y);
        }
        _drawPoly(render) {
            var coordinates = render.coordinates;
            this._ctx.beginPath();
            this._ctx.lineCap = 'round';
            this._ctx.lineJoin = 'round';
            this._ctx.lineWidth = render.strokeWidth;
            this._ctx.strokeStyle = render.strokeColor;
            this._ctx.setLineDash(render.lineDash || []);
            for (var ring = 0, ringsCount = coordinates.length; ring < ringsCount; ring++) {
                this._ctx.moveTo(coordinates[ring][0][0], coordinates[ring][0][1]);
                for (var i = 1, len = coordinates[ring].length; i < len; i++) {
                    this._ctx.lineTo(coordinates[ring][i][0], coordinates[ring][i][1]);
                }
                if (render.enclosed) {
                    this._ctx.closePath();
                }
            }
            if (render.fillStyle === Poly_1.FillStyle.Color) {
                this._ctx.fillStyle = render.fillColor;
                this._ctx.fill();
            }
            else if (render.fillStyle === Poly_1.FillStyle.Image) {
                this._ctx.fillStyle = this._ctx.createPattern(render.fillImage, 'repeat');
                let patternOffsetX = (coordinates[0][0][0]) % render.fillImage.width, patternOffsetY = (coordinates[0][0][1]) % render.fillImage.height;
                this._ctx.translate(patternOffsetX, patternOffsetY);
                this._ctx.fill();
                this._ctx.translate(-patternOffsetX, -patternOffsetY);
            }
            this._ctx.stroke();
        }
        get isEmpty() { return this._isEmpty; }
        get node() { return this._canvasNode; }
    }
    exports.Canvas = Canvas;
});
