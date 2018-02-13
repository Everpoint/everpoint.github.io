define(["require", "exports", "../../serializers/symbolSerializer", "../Symbol", "../../utils/Color", "../../utils/utils", "../../resourses/images", "../../features/Point", "../../renders/StaticVectorImageRender"], function (require, exports, symbolSerializer_1, Symbol_1, Color_1, utils_1, images_1, Point_1, StaticVectorImageRender_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Symbol of point drawn as masked image.
     * @alias sGis.symbol.point.MaskedImage
     */
    class MaskedImage extends Symbol_1.Symbol {
        /**
         * @param options - key-value list of the properties to be assigned to the instance.
         */
        constructor(options = {}) {
            super();
            /** Width of the image. If not set, image will be automatically resized according to height. If both width and height are not set, original image size will be used. */
            this.width = 32;
            /** Height of the image. If not set, image will be automatically resized according to width. If both width and height are not set, original image size will be used. */
            this.height = 32;
            this._anchorPoint = [16, 32];
            /**
             * Clockwise rotation of the image in radians.
             */
            this.angle = 0;
            this._imageSource = images_1.PIN_BACKGROUND;
            this._maskSource = images_1.PIN_FOREGROUND;
            this._maskColor = '#9bdb00';
            Object.assign(this, options);
            if (!this._image)
                this.imageSource = this._imageSource;
            if (!this._mask)
                this.maskSource = this._maskSource;
            this._updateMasked();
        }
        /**
         * Anchor point of the image. If set to [0, 0], image's left top corner will be at the feature position.<br>
         *     Anchor point does not scale with width and height parameters.
         */
        get anchorPoint() {
            return this._anchorPoint;
        }
        set anchorPoint(anchorPoint) {
            // TODO: remove deprecated part after 2018
            let deprecated = anchorPoint;
            if (deprecated.x !== undefined && deprecated.y !== undefined) {
                utils_1.warn('Using anchorPoint in {x, y} format is deprecated. Use [x, y] format instead.');
                this._anchorPoint = [deprecated.x, deprecated.y];
            }
            else {
                this._anchorPoint = anchorPoint;
            }
        }
        renderFunction(feature, resolution, crs) {
            if (!this._maskedSrc || !(feature instanceof Point_1.PointFeature))
                return [];
            let position = feature.projectTo(crs).position;
            let pxPosition = [position[0] / resolution, -position[1] / resolution];
            return [new StaticVectorImageRender_1.StaticVectorImageRender({
                    src: this._maskedSrc,
                    position: pxPosition,
                    angle: this.angle,
                    width: this.width,
                    height: this.height,
                    offset: [-this.anchorPoint[0], -this.anchorPoint[1]]
                })];
        }
        /**
         * Source of the base image. Can be url or data:url string.
         */
        get imageSource() { return this._imageSource; }
        set imageSource(source) {
            this._imageSource = source;
            this._image = new Image();
            this._image.src = source;
            if (this._image.complete) {
                this._updateMasked();
            }
            else {
                this._image.onload = this._updateMasked.bind(this);
            }
        }
        /**
         * Source of the mask image. Can be url or data:url string.
         */
        get maskSource() { return this._maskSource; }
        set maskSource(source) {
            this._maskSource = source;
            this._mask = new Image();
            this._mask.src = source;
            if (this._mask.complete) {
                this._updateMasked();
            }
            else {
                this._mask.onload = this._updateMasked.bind(this);
            }
        }
        /**
         * Color of the mask. Can be any valid css color string.
         */
        get maskColor() { return this._maskColor; }
        set maskColor(color) {
            this._maskColor = color;
            this._updateMasked();
        }
        _isLoaded() { return this._image.complete && this._mask.complete; }
        _updateMasked() {
            if (!this._mask || !this._image || !this._isLoaded())
                return;
            let canvas = document.createElement('canvas');
            canvas.width = this._mask.width;
            canvas.height = this._mask.height;
            let ctx = canvas.getContext('2d');
            ctx.drawImage(this._mask, 0, 0);
            let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            this._recolorMask(imageData);
            ctx.putImageData(imageData, 0, 0);
            let resultCanvas = document.createElement('canvas');
            resultCanvas.width = this._image.width;
            resultCanvas.height = this._image.height;
            let resultCtx = resultCanvas.getContext('2d');
            resultCtx.drawImage(this._image, 0, 0);
            resultCtx.drawImage(canvas, 0, 0);
            this._maskedSrc = resultCanvas.toDataURL();
            if (this.onUpdate)
                this.onUpdate();
        }
        _recolorMask(imageData) {
            let maskColor = new Color_1.Color(this.maskColor);
            let alphaNormalizer = 65025;
            let d = imageData.data;
            for (let i = 0; i < d.length; i += 4) {
                let r = d[i];
                let a = d[i + 3];
                let srcA = a * maskColor.a / alphaNormalizer;
                d[i + 3] = +Math.round(Math.min(1, srcA) * 255);
                d[i] = maskColor.r * r / 255;
                d[i + 1] = maskColor.g * r / 255;
                d[i + 2] = maskColor.b * r / 255;
            }
        }
    }
    exports.MaskedImage = MaskedImage;
    symbolSerializer_1.registerSymbol(MaskedImage, 'point.MaskedImage', ['width', 'height', 'anchorPoint', 'imageSource', 'maskSource', 'maskColor', 'angle']);
});
