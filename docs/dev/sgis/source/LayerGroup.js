define(["require", "exports", "./EventHandler", "./utils/utils", "./layers/Layer"], function (require, exports, EventHandler_1, utils_1, Layer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ContentsChangeType;
    (function (ContentsChangeType) {
        ContentsChangeType[ContentsChangeType["Add"] = 0] = "Add";
        ContentsChangeType[ContentsChangeType["Remove"] = 1] = "Remove";
        ContentsChangeType[ContentsChangeType["Reorder"] = 2] = "Reorder";
        ContentsChangeType[ContentsChangeType["VisibilityChange"] = 3] = "VisibilityChange";
    })(ContentsChangeType = exports.ContentsChangeType || (exports.ContentsChangeType = {}));
    /**
     * The contents, their order or visibility of the group is changed.
     * @event ContentsChangeEvent
     */
    class ContentsChangeEvent extends EventHandler_1.sGisEvent {
        constructor(changeType, affectedLayers) {
            super(ContentsChangeEvent.type);
            this.changeType = changeType;
            this.affectedLayers = affectedLayers;
        }
    }
    ContentsChangeEvent.type = 'contentsChange';
    exports.ContentsChangeEvent = ContentsChangeEvent;
    /**
     * Ordered nested list of layers.
     * @alias sGis.LayerGroup
     */
    class LayerGroup extends EventHandler_1.EventHandler {
        /**
         * @param layers - initial list of layers in the group
         */
        constructor(layers = []) {
            super();
            this._fireContentChange = (changeType, layers) => this.fire(new ContentsChangeEvent(changeType, layers));
            this._forwardEvent = (ev) => this.fire(ev);
            this._isDisplayed = true;
            this._layers = layers;
        }
        /**
         * Adds a layer to the end of the list.
         * @param layer - layer to add.
         * @fires [[ContentsChangeEvent]]
         * @throws If the layer is already in the group, or in any of the child groups.
         */
        addLayer(layer) {
            if (layer === this)
                utils_1.error(new Error('Cannot add self to the group'));
            if (this.contains(layer)) {
                utils_1.error(new Error('Cannot add layer to the group: the layer is already in the group'));
            }
            this._layers.push(layer);
            this._setChildListeners(layer);
            if (layer instanceof LayerGroup) {
                this._setForwardListeners(layer);
            }
            this.fire(new ContentsChangeEvent(ContentsChangeType.Add, [layer]));
        }
        /**
         * Removes the layer from the group.
         * @param layer - layer to remove.
         * @param recurse - if set to true, the layer will be removed from all child groups containing this layer.
         * @fires [[ContentsChangeEvent]]
         * @throws If the layer not in the group.
         */
        removeLayer(layer, recurse = false) {
            let index = this._layers.indexOf(layer);
            let removed = false;
            if (index !== -1) {
                this._layers.splice(index, 1);
                this._removeChildListeners(layer);
                if (layer instanceof LayerGroup) {
                    this._removeForwardListeners(layer);
                }
                this.fire(new ContentsChangeEvent(ContentsChangeType.Remove, [layer]));
                removed = true;
            }
            else if (recurse) {
                for (let i = 0; i < this._layers.length; i++) {
                    if (!(this._layers[i] instanceof LayerGroup))
                        continue;
                    let group = this._layers[i];
                    if (group.contains(layer)) {
                        group.removeLayer(layer, true);
                        removed = true;
                    }
                }
            }
            if (!removed)
                utils_1.error(new Error('The layer is not in the group'));
        }
        _setChildListeners(layer) {
            layer.on(Layer_1.VisibilityChangeEvent.type, () => this._fireContentChange(ContentsChangeType.VisibilityChange, [layer]));
        }
        _removeChildListeners(layer) {
            layer.off(Layer_1.VisibilityChangeEvent.type, () => this._fireContentChange(ContentsChangeType.VisibilityChange, [layer]));
        }
        _setForwardListeners(layerGroup) {
            layerGroup.on(ContentsChangeEvent.type, this._forwardEvent);
        }
        _removeForwardListeners(layerGroup) {
            layerGroup.off(ContentsChangeEvent.type, this._forwardEvent);
        }
        /**
         * Returns true if the group or any of the child groups (recursively) contains the given layer.
         * @param layer - layer to check
         */
        contains(layer) {
            for (let i = 0; i < this._layers.length; i++) {
                if (layer === this._layers[i])
                    return true;
                if (!(this._layers[i] instanceof LayerGroup))
                    continue;
                let group = this._layers[i];
                if (group.contains(layer)) {
                    return true;
                }
            }
            return false;
        }
        /**
         * Returns index of a layer in the group. If not in the group, returns -1.
         * @param layer
         */
        indexOf(layer) {
            return this._layers.indexOf(layer);
        }
        /**
         * Inserts the layer to the given position. If the layer is already in the group, moves the layer so that new index of the layer equals the specified index.
         * If the index is negative, layer is added to the n-th position from the end of the list.
         * If the index is larger than number of the layers in the group, layer will be added to the end of the list.
         * @param layer - layer to insert.
         * @param index - integer position of the layer after insertion.
         * @fires [[ContentsChangeEvent]]
         * @throws If the given layer cannot be added to the group (e.g. if the result of reordering creates recursive nesting).
         */
        insertLayer(layer, index) {
            let currIndex = this._layers.indexOf(layer);
            let added = false;
            if (currIndex === -1) {
                this.prohibitEvent('layerAdd');
                this.addLayer(layer);
                this.allowEvent('layerAdd');
                currIndex = this._layers.length - 1;
                added = true;
            }
            let length = this._layers.length;
            index = index > length ? length : index < 0 && index < -length ? -length : index;
            if (index < 0)
                index = length + index;
            this._layers.splice(currIndex, 1);
            this._layers.splice(index, 0, layer);
            let changeType = added ? ContentsChangeType.Add : ContentsChangeType.Reorder;
            this.fire(new ContentsChangeEvent(changeType, [layer]));
        }
        /**
         * Moves the layer to the end of the list. If the layer is not in the group, the effect of this method is same as .add(layer).
         * @param layer - layer to add.
         */
        moveLayerToTop(layer) {
            this.insertLayer(layer, -1);
        }
        /**
         * Returns the flat list of layers in the group. Child LayerGroups are not included.
         * @param recurse - if set to true, the contents of child LayerGroups will be added to the list in the corresponding order.
         *                  E.g. if the group contents are layer1, group1, layer2, then the resulting list will be the result of concatenation of
         *                  [layer1], group1.getLayers(true), [layer2].
         * @param excludeInactive - if set to true, layers with isDisplayed=false and all their children will not be included.
         */
        getLayers(recurse = false, excludeInactive = false) {
            let layers = [];
            this._layers.forEach(layer => {
                if (excludeInactive && !layer.isDisplayed)
                    return;
                if (recurse && layer instanceof LayerGroup) {
                    layers = layers.concat(layer.getLayers(recurse, excludeInactive));
                }
                else {
                    layers.push(layer);
                }
            });
            return layers;
        }
        /**
         * The list of the layers and child groups in the group. If assigned, two change event will be fired: one for layers
         * removal and one for layers adding.
         * @fires [[ContentsChangeEvent]]
         */
        get layers() {
            return this._layers;
        }
        set layers(layers) {
            let currLayers = this._layers;
            if (currLayers.length > 0) {
                this._layers.length = 0;
                this.fire(new ContentsChangeEvent(ContentsChangeType.Remove, currLayers));
            }
            if (layers.length > 0) {
                this.prohibitEvent(ContentsChangeEvent.type);
                for (let i = 0; i < layers.length; i++) {
                    this.addLayer(layers[i]);
                }
                this.allowEvent(ContentsChangeEvent.type);
                this.fire(new ContentsChangeEvent(ContentsChangeType.Add, layers));
            }
        }
        /**
         * Whether the group is active and should be displayed on the map.
         * @fires [[VisibilityChangeEvent]]
         */
        get isDisplayed() {
            return this._isDisplayed;
        }
        set isDisplayed(bool) {
            if (this._isDisplayed === bool)
                return;
            this._isDisplayed = bool;
            this.fire(new Layer_1.VisibilityChangeEvent());
        }
        /**
         * Sets .isDisplayed property to true
         */
        show() {
            this.isDisplayed = true;
        }
        /**
         * Sets .isDisplayed property to false
         */
        hide() {
            this.isDisplayed = false;
        }
    }
    exports.LayerGroup = LayerGroup;
});
