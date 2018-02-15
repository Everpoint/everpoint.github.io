define(["require", "exports", "../Crs", "../EventHandler"], function (require, exports, Crs_1, EventHandler_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Abstract feature object without any geometry. All other features inherit from this class. It can be used to store attributes in the way compatible with other features.
     * @alias sGis.Feature
     * @extends sGis.EventHandler
     */
    class Feature extends EventHandler_1.EventHandler {
        constructor({ crs = Crs_1.geo, symbol, persistOnMap = false } = {}, extension) {
            super();
            this._hidden = false;
            if (extension)
                Object.assign(this, extension);
            this._symbol = symbol;
            this._crs = crs;
            this.persistOnMap = persistOnMap;
        }
        /**
         * Sets default coordinate system for all features.<br><br>
         *     <strong>
         *     NOTE: This method affects all already created features that do not have explicitly specified crs.
         *     You should use this function only when initializing the library.
         *     </strong>
         * @param {sGis.Crs} crs
         * @static
         */
        static setDefaultCrs(crs) {
            Feature.prototype._crs = crs;
        }
        /**
         * Renders the feature with the given parameters.
         * @param {Number} resolution
         * @param {sGis.Crs} crs
         * @returns {sGis.IRender[]}
         */
        render(resolution, crs) {
            if (this._hidden || !this.symbol)
                return [];
            if (!this._needToRender(resolution, crs))
                return this._rendered.renders;
            /**
             * @type {{resolution: Number, crs: sGis.Crs, renders: sGis.IRender[]}}
             * @private
             */
            this._rendered = {
                resolution: resolution,
                crs: crs,
                renders: this.symbol.renderFunction(this, resolution, crs)
            };
            if (this.eventFlags !== EventHandler_1.MouseEventFlags.None)
                this._rendered.renders.forEach(render => {
                    render.listenFor(this.eventFlags, (event) => {
                        this.fire(event);
                    });
                });
            return this._rendered.renders;
        }
        _needToRender(resolution, crs) {
            return !this._rendered || this._rendered.resolution !== resolution || this._rendered.crs !== crs || this._rendered.renders.length === 0;
        }
        /**
         * Resets the rendered cache of the feature, making it to redraw in the next redraw cycle.
         */
        redraw() {
            delete this._rendered;
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
         * @param {sGis.Symbol} symbol
         */
        setTempSymbol(symbol) {
            this._tempSymbol = symbol;
            this.redraw();
        }
        /**
         * Clears the previously set temporary symbol, restoring the original symbol.
         */
        clearTempSymbol() {
            this._tempSymbol = null;
            this.redraw();
        }
        /**
         * Returns true, if a temporary symbol is currently set for this feature.
         * @returns {Boolean}
         */
        get isTempSymbolSet() { return !!this._tempSymbol; }
        /**
         * Returns the original symbol of the feature. If temporary symbol is not set, the returned value will be same as value of the .symbol property.
         * @returns {sGis.Symbol}
         */
        get originalSymbol() { return this._symbol; }
        /**
         * Coordinate system of the feature.
         * @readonly
         * @type {sGis.Crs}
         * @default sGis.CRS.geo
         */
        get crs() { return this._crs; }
        /**
         * Current symbol of the feature. If temporary symbol is set, the value will be the temporary symbol.
         * @type {sGis.Symbol}
         * @default null
         */
        get symbol() { return this._tempSymbol || this._symbol; }
        set symbol(symbol) {
            this._symbol = symbol;
            this.redraw();
        }
        /**
         * Specifies weather the feature is hidden by .hide() method.
         * @type Boolean
         * @readonly
         */
        get hidden() { return this._hidden; }
    }
    exports.Feature = Feature;
});
/**
 * @typedef {function(Object)} sGis.Feature.constructor
 * @returns sGis.Feature
 */
