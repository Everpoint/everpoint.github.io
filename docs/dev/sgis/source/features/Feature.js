define(["require", "exports", "../Crs", "../EventHandler"], function (require, exports, Crs_1, EventHandler_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Feature is an abstract representation of a geographical object.
     * @alias sGis.Feature
     */
    class Feature extends EventHandler_1.EventHandler {
        constructor({ crs = Crs_1.geo, symbol, persistOnMap = false } = {}) {
            super();
            this._hidden = false;
            this._symbolContainer = new FeatureSymbolContainer(this, symbol);
            this._crs = crs;
            this.persistOnMap = persistOnMap;
        }
        /**
         * Sets default coordinate system for all features.<br><br>
         *     <strong>
         *     NOTE: This method affects all already created features that do not have explicitly specified crs.
         *     You should use this function only when initializing the library.
         *     </strong>
         * @param crs
         */
        static setDefaultCrs(crs) {
            Feature.prototype._crs = crs;
        }
        /**
         * Calls the render method of the feature's symbol (or temp symbol if it is set) to render the feature. The render result
         * is cached inside the feature class.
         * @param resolution
         * @param crs
         */
        render(resolution, crs) { return this._symbolContainer.render(resolution, crs); }
        /**
         * Resets the rendered cache of the feature, making it to redraw in the next redraw cycle.
         */
        redraw() {
            this._symbolContainer.reset();
        }
        /**
         * Prevents feature from rendering.
         */
        hide() { this._hidden = true; }
        /**
         * Allows feature to render after it was hidden.
         */
        show() { this._hidden = false; }
        /**
         * Sets a temporary symbol for the feature. This symbol is used instead of the original symbol until cleared.
         * @param symbol
         */
        setTempSymbol(symbol) {
            this._symbolContainer.setTempSymbol(symbol);
        }
        /**
         * Clears the previously set temporary symbol, restoring the original symbol.
         */
        clearTempSymbol() {
            this._symbolContainer.clearTempSymbol();
        }
        /**
         * Returns true, if a temporary symbol is currently set for this feature.
         */
        get isTempSymbolSet() { return this._symbolContainer.isTempSymbolSet; }
        /**
         * Returns the original symbol of the feature. If temporary symbol is not set, the returned value will be same as value of the .symbol property.
         */
        get originalSymbol() { return this._symbolContainer.originalSymbol; }
        /**
         * Coordinate system of the feature.
         */
        get crs() { return this._crs; }
        /**
         * Current symbol of the feature. If temporary symbol is set, the value will be the temporary symbol.
         */
        get symbol() { return this._symbolContainer.symbol; }
        set symbol(symbol) { this._symbolContainer.symbol = symbol; }
        /**
         * Specifies weather the feature is hidden by .hide() method.
         */
        get hidden() { return this._hidden; }
    }
    exports.Feature = Feature;
    class FeatureSymbolContainer {
        constructor(feature, symbol) {
            this._feature = feature;
            this._symbol = symbol;
        }
        get symbol() { return this._tempSymbol || this._symbol; }
        set symbol(symbol) {
            this._symbol = symbol;
            this.reset();
        }
        /**
         * Renders the feature with the given parameters.
         * @param resolution
         * @param crs
         */
        render(resolution, crs) {
            if (this._feature.hidden || !this.symbol)
                return [];
            if (this._cached && !this._needToRender(resolution, crs))
                return this._cached.renders;
            this._cached = {
                resolution: resolution,
                crs: crs,
                renders: this.symbol.renderFunction(this._feature, resolution, crs)
            };
            if (this._feature.eventFlags !== EventHandler_1.MouseEventFlags.None)
                this._cached.renders.forEach(render => {
                    render.listenFor(this._feature.eventFlags, (event) => {
                        this._feature.fire(event);
                    });
                });
            return this._cached.renders;
        }
        _needToRender(resolution, crs) {
            return !this._cached || this._cached.resolution !== resolution || this._cached.crs !== crs || this._cached.renders.length === 0;
        }
        reset() {
            this._cached = undefined;
        }
        setTempSymbol(symbol) {
            this._tempSymbol = symbol;
            this.reset();
        }
        clearTempSymbol() {
            this._tempSymbol = undefined;
            this.reset();
        }
        get isTempSymbolSet() { return !!this._tempSymbol; }
        get originalSymbol() { return this._symbol; }
    }
});
