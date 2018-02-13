define(["require", "exports", "./EventHandler"], function (require, exports, EventHandler_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Some property of the layer has been changed
     * @event PropertyChangeEvent
     */
    class PropertyChangeEvent extends EventHandler_1.sGisEvent {
        /**
         * @param propertyName - ame of the property that has been changed
         */
        constructor(propertyName) {
            super(PropertyChangeEvent.type);
            this.property = propertyName;
        }
    }
    PropertyChangeEvent.type = 'propertyChange';
    exports.PropertyChangeEvent = PropertyChangeEvent;
    /**
     * Visibility property of the layer has been changed.
     * @event VisibilityChangeEvent
     */
    class VisibilityChangeEvent extends EventHandler_1.sGisEvent {
        constructor() {
            super(VisibilityChangeEvent.type);
        }
    }
    VisibilityChangeEvent.type = 'visibilityChange';
    exports.VisibilityChangeEvent = VisibilityChangeEvent;
    /**
     * Base class for all map layers. A layer is a container for features, that is responsible for filter out (or create)
     * features for requested bbox and resolution.
     * @alias sGis.Layer
     */
    class Layer extends EventHandler_1.EventHandler {
        /**
         * @param __namedParameters - properties to be set to the corresponding fields
         * @param extensions - [JS ONLY]additional properties to be copied to the created instance
         */
        constructor({ delayedUpdate = false, resolutionLimits = [-1, -1], opacity = 1, isDisplayed = true } = {}, extensions) {
            super();
            this.delayedUpdate = delayedUpdate;
            this._resolutionLimits = resolutionLimits;
            this._opacity = opacity;
            this._isDisplayed = isDisplayed;
            if (extensions)
                Object.assign(this, extensions);
        }
        /**
         * Whether the layer is drawn to map
         * @fires [[VisibilityChangeEvent]]
         */
        get isDisplayed() { return this._isDisplayed; }
        set isDisplayed(bool) {
            this._isDisplayed = bool;
            this.fire(new VisibilityChangeEvent());
        }
        /**
         * Return true if the layer is displayed and the resolution is inside the limits
         * @param resolution
         */
        checkVisibility(resolution) {
            return this._isDisplayed && (this.resolutionLimits[0] < 0 || resolution >= this.resolutionLimits[0]) && (this.resolutionLimits[1] < 0 || resolution <= this.resolutionLimits[1]);
        }
        /**
         * Makes the layer visible
         * @fires [[PropertyChangeEvent]]
         */
        show() {
            this.isDisplayed = true;
        }
        /**
         * Makes the layer invisible
         * @fires [[PropertyChangeEvent]]
         */
        hide() {
            this.isDisplayed = false;
        }
        /**
         * Opacity of the layer. It sets the opacity of all features in this layer. Valid values: [0..1].
         * @fires [[PropertyChangeEvent]]
         */
        get opacity() { return this.getOpacity(); }
        set opacity(opacity) { this.setOpacity(opacity); }
        getOpacity() { return this._opacity; }
        setOpacity(opacity) {
            opacity = opacity < 0 ? 0 : opacity > 1 ? 1 : opacity;
            this._opacity = opacity;
            this.fire(new PropertyChangeEvent('opacity'));
        }
        /**
         * Min and max resolution between which the layer will be displayed. Negative values are treated as no limit.
         * @fires [[PropertyChangeEvent]]
         */
        get resolutionLimits() { return this._resolutionLimits; }
        set resolutionLimits(limits) {
            this._resolutionLimits = limits;
            this.fire(new PropertyChangeEvent('resolutionLimits'));
        }
        /**
         * Forces redrawing of the layer
         * @fires [[PropertyChangeEvent]]
         */
        redraw() {
            this.fire(new PropertyChangeEvent('content'));
        }
    }
    exports.Layer = Layer;
});
