define(["require", "exports", "./Point", "./TileScheme", "./Crs", "./LayerGroup", "./utils/utils", "./EventHandler"], function (require, exports, Point_1, TileScheme_1, Crs_1, LayerGroup_1, utils_1, EventHandler_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class BboxChangeEvent extends EventHandler_1.sGisEvent {
        constructor() {
            super(BboxChangeEvent.type);
        }
    }
    BboxChangeEvent.type = 'bboxChange';
    exports.BboxChangeEvent = BboxChangeEvent;
    class BboxChangeEndEvent extends EventHandler_1.sGisEvent {
        constructor() {
            super(BboxChangeEndEvent.type);
        }
    }
    BboxChangeEndEvent.type = 'bboxChangeEnd';
    exports.BboxChangeEndEvent = BboxChangeEndEvent;
    class AnimationStartEvent extends EventHandler_1.sGisEvent {
        constructor() {
            super(AnimationStartEvent.type);
        }
    }
    AnimationStartEvent.type = 'animationStart';
    exports.AnimationStartEvent = AnimationStartEvent;
    class AnimationEndEvent extends EventHandler_1.sGisEvent {
        constructor() {
            super(AnimationEndEvent.type);
        }
    }
    AnimationEndEvent.type = 'animationEnd';
    exports.AnimationEndEvent = AnimationEndEvent;
    /**
     * Map object with set of layers, specified position, resolution, coordinate system.
     * @alias sGis.Map
     */
    class Map extends LayerGroup_1.LayerGroup {
        constructor({ position = new Point_1.Point([55.755831, 37.617673]).projectTo(Crs_1.webMercator).position, resolution = 611.4962262812505 / 2, crs = Crs_1.webMercator, centerPoint, tileScheme = TileScheme_1.TileScheme.default, animationTime = 300, changeEndDelay = 300, minResolution = -1, maxResolution = -1, layers = [] } = {}) {
            super(layers);
            this._animationStopped = true;
            this._animationTarget = null;
            this._crs = crs;
            this._position = centerPoint ? centerPoint.projectTo(crs).position : position;
            this._resolution = resolution;
            this.tileScheme = tileScheme;
            this.animationTime = animationTime;
            this.changeEndDelay = changeEndDelay;
            this._minResolution = minResolution;
            this._maxResolution = maxResolution;
            this._listenForBboxChange();
        }
        _listenForBboxChange() {
            this.on(BboxChangeEvent.type, utils_1.debounce(this._fireBboxChangeEnd.bind(this), this.changeEndDelay));
        }
        _fireBboxChangeEnd() {
            this.fire(new BboxChangeEndEvent());
        }
        /**
         * Moves the map position by the specified offset
         * @param dx - Offset along X axis in map coordinates, positive direction is right
         * @param dy - Offset along Y axis in map coordinates, positive direction is down
         */
        move(dx, dy) {
            this._position[0] += dx;
            this._position[1] += dy;
            this.fire(new BboxChangeEvent());
        }
        /**
         * Changes the scale of map by scalingK
         * @param scalingK - Coefficient of scaling (Ex. 5 -> 5 times zoom in)
         * @param basePoint - Base point of zooming
         * @param doNotAdjust - do not adjust resolution to the round ones
         */
        changeScale(scalingK, basePoint, doNotAdjust) {
            this.setResolution(this.resolution * scalingK, basePoint, doNotAdjust);
        }
        /**
         * Changes the scale of map by scalingK with animation
         * @param scalingK - Coefficient of scaling (Ex. 5 -> 5 times zoom in)
         * @param basePoint - Base point of zooming
         */
        animateChangeScale(scalingK, basePoint) {
            this.animateSetResolution(this.resolution * scalingK, basePoint);
        }
        /**
         * Changes resolution of the map by k zoom levels. Positive values represent zoom in.
         * @param k - number of levels to zoom
         * @param basePoint - zooming base point
         */
        zoom(k, basePoint) {
            let tileScheme = this.tileScheme;
            let currResolution = this._animationTarget ? this._animationTarget[1] : this.resolution;
            let resolution;
            if (tileScheme) {
                let level = tileScheme.getLevel(currResolution) + (k > 0 ? -1 : 1);
                resolution = tileScheme.levels[level] ? tileScheme.levels[level].resolution : currResolution;
            }
            else {
                resolution = currResolution * Math.pow(2, -k);
            }
            resolution = Math.min(Math.max(resolution, this.minResolution || 0), this.maxResolution || Number.MAX_VALUE);
            this.animateSetResolution(resolution, basePoint);
        }
        /**
         * Changes resolution of the map so that the new resolution corresponds to an even tile scheme level. Resolution is changed with animation.
         * @param direction - if false will adjust to smaller resolution, if true - to larger
         */
        adjustResolution(direction = false) {
            let resolution = this.resolution;
            let newResolution = this.getAdjustedResolution(resolution, direction);
            let ratio = newResolution / resolution;
            if (ratio > 1.1 || ratio < 0.9) {
                this.animateSetResolution(newResolution);
            }
            else if (ratio > 1.0001 || ratio < 0.9999) {
                this.setResolution(newResolution);
            }
        }
        /**
         * Returns closest resolution to the given one that corresponds to an even tile scheme level.
         * @param resolution - target resolution
         * @param direction - if false will adjust to smaller resolution, if true - to larger
         */
        getAdjustedResolution(resolution, direction = false) {
            if (!this.tileScheme)
                return resolution;
            return this.tileScheme.getAdjustedResolution(resolution, direction);
        }
        /**
         * Sets new resolution to the map with animation
         * @param resolution
         * @param basePoint - Base point of zooming
         */
        animateSetResolution(resolution, basePoint) {
            let adjustedResolution = this.getAdjustedResolution(resolution);
            let newPosition = this._getScaledPosition(adjustedResolution, basePoint && this._getBase(basePoint));
            this.animateTo(newPosition, adjustedResolution);
        }
        /**
         * Changes position and resolution of the map with animation
         * @param point - target center point of the map
         * @param resolution - target resolution;
         */
        animateTo(point, resolution) {
            if (!Array.isArray(point))
                point = point.projectTo(this.crs).position;
            this.stopAnimation();
            this.fire(new AnimationStartEvent());
            let originalPosition = this.centerPoint;
            let originalResolution = this.resolution;
            let dx = point[0] - originalPosition.x;
            let dy = point[1] - originalPosition.y;
            let dr = resolution - originalResolution;
            let startTime = Date.now();
            this._animationStopped = false;
            this._animationTarget = [point, resolution];
            let self = this;
            this._animationTimer = setInterval(function () {
                let time = Date.now() - startTime;
                if (time >= self.animationTime || self._animationStopped) {
                    self.setPosition(point, resolution);
                    self.stopAnimation();
                    self.fire(new AnimationEndEvent());
                }
                else {
                    let x = self._easeFunction(time, originalPosition.x, dx, self.animationTime);
                    let y = self._easeFunction(time, originalPosition.y, dy, self.animationTime);
                    let r = self._easeFunction(time, originalResolution, dr, self.animationTime);
                    self.setPosition(new Point_1.Point([x, y], self.crs), r);
                }
            }, 1000 / 60);
        }
        _getBase(basePoint) {
            return basePoint.projectTo ? basePoint.projectTo(this.crs).position : basePoint;
        }
        _getScaledPosition(newResolution, basePoint = null) {
            let position = this.position;
            let base = basePoint ? basePoint : position;
            let resolution = this.resolution;
            let scalingK = newResolution / resolution;
            return [(position[0] - base[0]) * scalingK + base[0], (position[1] - base[1]) * scalingK + base[1]];
        }
        /**
         * Stops all animations of the map
         */
        stopAnimation() {
            this._animationStopped = true;
            this._animationTarget = null;
            clearInterval(this._animationTimer);
        }
        easing(t) {
            return t < 0.5 ? 2 * t * t : (4 - 2 * t) * t - 1;
        }
        _easeFunction(t, b, c, d) {
            return b + c * this.easing(t / d);
        }
        /**
         * Sets new position and resolution to the map
         * @param point - new center point of the map
         * @param resolution - new resolution of the map
         */
        setPosition(point, resolution) {
            if (!Array.isArray(point))
                point = point.projectTo(this.crs).position;
            this.prohibitEvent(BboxChangeEvent.type);
            this.position = point;
            if (resolution)
                this.resolution = resolution;
            this.allowEvent(BboxChangeEvent.type);
            this.fire(new BboxChangeEvent());
        }
        /**
         * Sets new resolution to the map
         * @param resolution
         * @param basePoint - Base point of zooming
         * @param doNotAdjust - do not adjust resolution to the round ones
         */
        setResolution(resolution, basePoint = null, doNotAdjust = false) {
            this.setPosition(this._getScaledPosition(resolution, basePoint && this._getBase(basePoint)), doNotAdjust ? resolution : this.getAdjustedResolution(resolution));
        }
        /**
         * Geographical position of the center of the map given in map coordinate system
         */
        get position() { return this._position; }
        set position(position) {
            this._position = position;
            this.fire(new BboxChangeEvent());
        }
        /**
         * Center point of the map
         */
        get centerPoint() { return new Point_1.Point(this.position, this.crs); }
        set centerPoint(point) {
            this.position = point.projectTo(this.crs).position;
        }
        /**
         * Coordinate system of the map. If the value is set and old crs cannot be projected to the new one, position of the map is set to [0, 0].
         * Otherwise position is projected to the new crs.
         */
        get crs() { return this._crs; }
        set crs(crs) {
            let projection = this._crs.projectionTo(crs);
            this._crs = crs;
            if (projection) {
                this.position = projection(this.position);
            }
            else {
                this.position = [0, 0];
            }
        }
        /**
         * Resolution of the map. Can be any positive number.
         */
        get resolution() { return this._resolution; }
        set resolution(resolution) {
            this._resolution = resolution;
            this.fire(new BboxChangeEvent());
        }
        /**
         * Minimum allowed resolution of the map. If not set, the minimum value from the map tile scheme will be used. Must be smaller then max resolution.
         * If current resolution is smaller that the newly assigned minResolution, the current resolution will be adjusted accordingly.
         */
        get minResolution() { return this._minResolution > 0 ? this._minResolution : this.tileScheme && this.tileScheme.minResolution; }
        set minResolution(resolution) {
            if (resolution > 0) {
                let maxResolution = this.maxResolution;
                if (resolution > maxResolution)
                    utils_1.error('maxResolution cannot be less then minResolution');
            }
            this._minResolution = resolution;
            if (this.resolution < this.minResolution)
                this.resolution = resolution;
        }
        /**
         * Maximum allowed resolution of the map. If not set, the maximum value from the map tile scheme will be used. Must be larger then min resolution.
         * If current resolution is larger that the newly assigned maxResolution, the current resolution will be adjusted accordingly.
         */
        get maxResolution() { return this._maxResolution > 0 ? this._maxResolution : this.tileScheme && this.tileScheme.maxResolution; }
        set maxResolution(resolution) {
            if (resolution > 0) {
                let minResolution = this.minResolution;
                if (resolution < minResolution)
                    utils_1.error('maxResolution cannot be less then minResolution');
            }
            this._maxResolution = resolution;
            if (this.resolution > this.maxResolution)
                this.resolution = resolution;
        }
    }
    exports.Map = Map;
});
