define(["require", "exports", "./StaticImageRender"], function (require, exports, StaticImageRender_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class StaticVectorImageRender extends StaticImageRender_1.StaticImageRender {
        constructor({ src, position, width, height, onLoad, offset, angle = 0 }) {
            super({ src, width, height, onLoad, offset });
            this._cachedSin = null;
            this._cachedCos = null;
            this.position = position;
            this.angle = angle;
        }
        contains(position) {
            if (this.angle === 0)
                return this._boxContains(position[0], position[1]);
            let sin = this._sin;
            let cos = this._cos;
            let dx = position[0] - this.position[0];
            let dy = position[1] - this.position[1];
            let rotatedX = this.position[0] + dx * cos + dy * sin;
            let rotatedY = this.position[1] + dy * cos - dx * sin;
            return this._boxContains(rotatedX, rotatedY);
        }
        _boxContains(x, y) {
            let minX = this.position[0] + this.offset[0];
            let minY = this.position[1] + this.offset[1];
            return x > minX
                && x < minX + this.width
                && y > minY
                && y < minY + this.height;
        }
        get angle() { return this._angle; }
        set angle(value) {
            this._angle = value;
            this._cachedCos = null;
            this._cachedSin = null;
        }
        get _sin() {
            if (this._cachedSin === null)
                this._cachedSin = Math.sin(this.angle);
            return this._cachedSin;
        }
        get _cos() {
            if (this._cachedCos === null)
                this._cachedCos = Math.cos(this.angle);
            return this._cachedCos;
        }
    }
    exports.StaticVectorImageRender = StaticVectorImageRender;
});
