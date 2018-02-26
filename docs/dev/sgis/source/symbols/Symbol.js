define(["require", "exports", "../serializers/symbolSerializer", "../renders/Render", "../EventHandler", "../utils/domEvent"], function (require, exports, symbolSerializer_1, Render_1, EventHandler_1, domEvent_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Symbol that renders a feature to the screen coordinate system. All symbols take as input a feature, target resolution
     * and target crs, and must return a set of renders (rendered primitives) that then can be used to draw the feature.
     * @alias sGis.Symbol
     */
    class Symbol {
        /**
         * Returns a copy of the symbol. Only essential properties are copied.
         */
        clone() {
            let desc = symbolSerializer_1.serialize(this);
            return symbolSerializer_1.deserialize(desc);
        }
    }
    exports.Symbol = Symbol;
    class DynamicPointSymbol extends Symbol {
        constructor({ offset = [5, 0], onRender } = {}) {
            super();
            this.offset = offset;
            this.onRender = onRender;
        }
        renderFunction(feature, resolution, crs) {
            let dynamicFeature = feature;
            if (dynamicFeature.__dynamicSymbolRender)
                return [dynamicFeature.__dynamicSymbolRender];
            let node = this._getFeatureNode(feature);
            node.style.position = 'absolute';
            dynamicFeature.__dynamicSymbolRender = new Render_1.DynamicRender({
                node: node,
                onRender: this.onRender,
                update: (bbox, resolution) => {
                    if (!dynamicFeature.crs.canProjectTo(bbox.crs))
                        return;
                    let point = dynamicFeature.projectTo(bbox.crs);
                    let dx = Math.round((point.x - bbox.xMin) / resolution + this.offset[0]);
                    let dy = Math.round((bbox.yMax - point.y) / resolution + this.offset[1]);
                    node.style.left = `${dx.toString()}px`;
                    node.style.top = `${dy.toString()}px`;
                }
            });
            this._setEventListeners(dynamicFeature);
            return [dynamicFeature.__dynamicSymbolRender];
        }
        getNode(feature) {
            let [render] = this.renderFunction(feature, 1, null);
            return render.node;
        }
        _setEventListeners(dynamicFeature) {
            if (dynamicFeature.eventFlags === EventHandler_1.MouseEventFlags.None)
                return;
            Object.keys(EventHandler_1.mouseEvents).forEach(eventName => {
                if (dynamicFeature.eventFlags & EventHandler_1.mouseEvents[eventName].flag) {
                    domEvent_1.listenDomEvent(dynamicFeature.__dynamicSymbolRender.node, EventHandler_1.mouseEvents[eventName].type, (event) => {
                        dynamicFeature.fire(EventHandler_1.mouseEvents[eventName].type, {
                            node: dynamicFeature.__dynamicSymbolRender.node,
                            browserEvent: event
                        });
                    });
                }
            });
        }
    }
    exports.DynamicPointSymbol = DynamicPointSymbol;
});
