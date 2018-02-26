define(["require", "exports", "./Control", "../commonEvents", "../features/Balloon", "../features/Poly", "../features/PointFeature", "../utils/utils", "../symbols/BalloonSymbol", "../Bbox"], function (require, exports, Control_1, commonEvents_1, Balloon_1, Poly_1, PointFeature_1, utils_1, BalloonSymbol_1, Bbox_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const OFFSET = 10;
    /**
     * @example controls/Balloon_Control
     */
    class BalloonControl extends Control_1.Control {
        constructor(map, { painter = null } = {}) {
            super(map, { useTempLayer: true });
            this.painter = painter;
            this._ns = '.' + utils_1.getGuid;
            this._onMapClick = this._onMapClick.bind(this);
            this._symbol = new BalloonSymbol_1.BalloonSymbol({ onRender: this._onRender.bind(this) });
        }
        attach(feature, html) {
            let balloon = new Balloon_1.Balloon([0, 0], { crs: feature.crs, content: html, symbol: this._symbol });
            feature.on(commonEvents_1.sGisClickEvent.type + this._ns, this._showBalloon.bind(this, feature, balloon));
        }
        detach(feature) {
            feature.off(this._ns);
        }
        _showBalloon(feature, balloon, event) {
            event.stopPropagation();
            if (feature instanceof Poly_1.Poly) {
                balloon.position = feature.centroid;
            }
            else if (feature instanceof PointFeature_1.PointFeature) {
                balloon.position = feature.position;
            }
            if (this._activeBalloon) {
                this._tempLayer.remove(this._activeBalloon);
            }
            if (!this._isActive)
                this.activate();
            this._tempLayer.add(balloon);
            this._activeBalloon = balloon;
        }
        _onRender() {
            if (!this.painter)
                return;
            let node = this._symbol.getNode(this._activeBalloon);
            if (!node)
                return;
            let size = node.getBoundingClientRect();
            let position = this._activeBalloon.projectTo(this.map.crs).position;
            let resolution = this.map.resolution;
            let halfWidth = size.width * resolution / 2;
            let height = size.height * resolution;
            let balloonBbox = new Bbox_1.Bbox([position[0] - halfWidth, position[1]], [position[0] + halfWidth, position[1] + height], this._activeBalloon.crs)
                .offset([OFFSET * resolution, OFFSET * resolution]);
            let mapBbox = this.painter.bbox;
            let newBbox = mapBbox.clone();
            if (newBbox.yMin > balloonBbox.yMin) {
                newBbox.yMin = balloonBbox.yMin;
                newBbox.yMax = newBbox.yMin + mapBbox.height;
            }
            else if (newBbox.yMax < balloonBbox.yMax) {
                newBbox.yMax = balloonBbox.yMax;
                newBbox.yMin = newBbox.yMax - mapBbox.height;
            }
            if (newBbox.xMin > balloonBbox.xMin && newBbox.xMax < balloonBbox.xMax) {
                newBbox.xMin = balloonBbox.center[0] - mapBbox.width / 2;
                newBbox.xMax = balloonBbox.center[1] + mapBbox.width / 2;
            }
            else if (newBbox.xMin > balloonBbox.xMin) {
                newBbox.xMin = balloonBbox.xMin;
                newBbox.xMax = newBbox.xMin + mapBbox.width;
            }
            else if (newBbox.xMax < balloonBbox.xMax) {
                newBbox.xMax = balloonBbox.xMax;
                newBbox.xMin = newBbox.xMax - mapBbox.width;
            }
            this.painter.show(newBbox);
        }
        _activate() {
            this.map.on('click', this._onMapClick);
        }
        _deactivate() {
            this.map.off('click', this._onMapClick);
            this._activeBalloon = null;
        }
        _onMapClick() {
            this.deactivate();
        }
    }
    exports.BalloonControl = BalloonControl;
});
