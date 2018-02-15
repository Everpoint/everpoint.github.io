define(["require", "exports", "./Control", "../utils/StateManager", "./PointEditor", "./PolyEditor", "./PolyTransform", "../utils/utils", "../utils/domEvent", "../symbols/EditorSymbol", "../layers/FeatureLayer", "../commonEvents", "../features/Point", "../features/Poly", "../EventHandler", "./snapping/SnappingProviderBase", "./snapping/SnappingMethods", "./snapping/CombinedSnappingProvider"], function (require, exports, Control_1, StateManager_1, PointEditor_1, PolyEditor_1, PolyTransform_1, utils_1, domEvent_1, EditorSymbol_1, FeatureLayer_1, commonEvents_1, Point_1, Poly_1, EventHandler_1, SnappingProviderBase_1, SnappingMethods_1, CombinedSnappingProvider_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class FeatureSelectEvent extends EventHandler_1.sGisEvent {
        constructor(feature) {
            super(FeatureSelectEvent.type);
            this.feature = feature;
        }
    }
    FeatureSelectEvent.type = 'featureSelect';
    exports.FeatureSelectEvent = FeatureSelectEvent;
    class FeatureDeselectEvent extends EventHandler_1.sGisEvent {
        constructor(feature) {
            super(FeatureDeselectEvent.type);
            this.feature = feature;
        }
    }
    FeatureDeselectEvent.type = 'featureDeselect';
    exports.FeatureDeselectEvent = FeatureDeselectEvent;
    class FeatureRemoveEvent extends EventHandler_1.sGisEvent {
        constructor(feature) {
            super(FeatureRemoveEvent.type);
            this.feature = feature;
        }
    }
    FeatureRemoveEvent.type = 'featureRemove';
    exports.FeatureRemoveEvent = FeatureRemoveEvent;
    const modes = ['vertex', 'rotate', 'scale', 'drag'];
    /**
     * Control for editing points, polylines and polygons. It uses PointEditor, PolyEditor, PolyTransform and Snapping classes for editing corresponding features.
     * @alias sGis.controls.Editor
     */
    class Editor extends Control_1.Control {
        /**
         * @param map - map object the control will work with
         * @param options - key-value set of properties to be set to the instance
         */
        constructor(map, { snappingProvider = null, isActive = false, activeLayer = null } = {}) {
            super(map, { snappingProvider, activeLayer });
            this._activeFeature = null;
            this._deselectAllowed = true;
            /**
             * If set to true the feature will be deleted in one of two cases:<br>
             *     1) User removes last point of polyline or polygon.
             *     2) User presses "del" button
             */
            this.allowDeletion = true;
            this._ns = '.' + utils_1.getGuid();
            this._setListener = this._setListener.bind(this);
            this._removeListener = this._removeListener.bind(this);
            this._onEdit = this._onEdit.bind(this);
            this._setEditors();
            this._states = new StateManager_1.StateManager();
            this._deselect = this._deselect.bind(this);
            this.setMode(modes);
            this._handleFeatureAdd = this._handleFeatureAdd.bind(this);
            this._handleFeatureRemove = this._handleFeatureRemove.bind(this);
            this._handleKeyDown = this._handleKeyDown.bind(this);
            this.isActive = isActive;
        }
        _setEditors() {
            this._pointEditor = new PointEditor_1.PointEditor(this.map, { snappingProvider: this.snappingProvider, activeLayer: this.activeLayer });
            this._pointEditor.on(Control_1.EditEvent.type, this._onEdit);
            this._polyEditor = new PolyEditor_1.PolyEditor(this.map, { snappingProvider: this._getPolyEditorSnappingProvider(), onFeatureRemove: this._delete.bind(this), activeLayer: this.activeLayer });
            this._polyEditor.on(Control_1.EditEvent.type, this._onEdit);
            this._polyEditor.on(Control_1.ChangeEvent.type, this._updateTransformControl.bind(this));
            this._polyTransform = new PolyTransform_1.PolyTransform(this.map);
            this._polyTransform.on('rotationEnd scalingEnd', this._onEdit);
        }
        setSnappingProvider(provider) {
            this.snappingProvider = provider;
            if (this._pointEditor)
                this._pointEditor.snappingProvider = provider;
            if (this._polyEditor)
                this._polyEditor.snappingProvider = this._getPolyEditorSnappingProvider();
        }
        _getPolyEditorSnappingProvider() {
            if (!this.snappingProvider)
                return null;
            const result = this.snappingProvider.clone();
            if (result instanceof SnappingProviderBase_1.SnappingProviderBase) {
                result.snappingMethods = result.snappingMethods.concat([SnappingMethods_1.emptySnapping]);
            }
            else if (result instanceof CombinedSnappingProvider_1.CombinedSnappingProvider) {
                result.providers.forEach(child => {
                    if (child instanceof SnappingProviderBase_1.SnappingProviderBase) {
                        child.snappingMethods = child.snappingMethods.concat([SnappingMethods_1.emptySnapping]);
                    }
                });
            }
            return result;
        }
        _onEdit() {
            this.fire('edit');
            this._saveState();
        }
        _activate() {
            if (!this.activeLayer)
                return;
            this.activeLayer.features.forEach(this._setListener, this);
            this.activeLayer.on(FeatureLayer_1.FeaturesAddEvent.type, this._handleFeatureAdd);
            this.activeLayer.on(FeatureLayer_1.FeaturesRemoveEvent.type, this._handleFeatureRemove);
            this.activeLayer.redraw();
            this.map.on(commonEvents_1.sGisClickEvent.type, this._onMapClick.bind(this));
            domEvent_1.listenDomEvent(document, 'keydown', this._handleKeyDown);
        }
        _handleFeatureAdd(event) {
            event.features.forEach(f => this._setListener(f));
        }
        _handleFeatureRemove(event) {
            event.features.forEach(f => this._removeListener(f));
        }
        _setListener(feature) {
            feature.on(commonEvents_1.sGisClickEvent.type + this._ns, this._handleFeatureClick.bind(this, feature));
        }
        _removeListener(feature) {
            feature.off(commonEvents_1.sGisClickEvent.type + this._ns);
        }
        _onMapClick() {
            if (!this.ignoreEvents)
                this._deselect();
        }
        _deactivate() {
            this._deselect();
            this.activeLayer.features.forEach(this._removeListener, this);
            this.activeLayer.off('featureAdd', this._handleFeatureAdd);
            this.activeLayer.off('featureRemove', this._handleFeatureRemove);
            this.map.off('click', this._deselect);
            domEvent_1.removeDomEventListener(document, 'keydown', this._handleKeyDown);
        }
        /**
         * Selects a given feature if it is in the active layer.
         * @param feature
         */
        select(feature) { this.activeFeature = feature; }
        /**
         * Clears selection if any.
         */
        deselect() { this.activeFeature = null; }
        /**
         * Currently selected for editing feature.
         */
        get activeFeature() { return this._activeFeature; }
        set activeFeature(feature) {
            if (feature)
                this.activate();
            this._select(feature);
        }
        _handleFeatureClick(feature, event) {
            if (this.ignoreEvents)
                return;
            event.stopPropagation();
            this._select(feature);
        }
        _select(feature) {
            if (this._activeFeature === feature)
                return;
            this._deselect();
            this._activeFeature = feature;
            if (!feature)
                return;
            feature.setTempSymbol(new EditorSymbol_1.EditorSymbol({ baseSymbol: feature.symbol }));
            if (feature instanceof Point_1.PointFeature) {
                this._pointEditor.activeLayer = this.activeLayer;
                this._pointEditor.activeFeature = feature;
            }
            else if (feature instanceof Poly_1.Poly) {
                this._activatePolyControls(feature);
            }
            this.activeLayer.redraw();
            this._saveState();
            this.fire(new FeatureSelectEvent(feature));
        }
        _activatePolyControls(feature) {
            this._polyEditor.featureDragAllowed = this._dragging;
            this._polyEditor.vertexChangeAllowed = this._vertexEditing;
            this._polyEditor.activeLayer = this.activeLayer;
            this._polyEditor.activeFeature = feature;
            this._polyTransform.enableRotation = this._rotation;
            this._polyTransform.enableScaling = this._scaling;
            this._polyTransform.activeLayer = this.activeLayer;
            this._polyTransform.activeFeature = feature;
        }
        _deselect() {
            if (!this._activeFeature || !this._deselectAllowed)
                return;
            this._pointEditor.deactivate();
            this._polyEditor.deactivate();
            this._polyTransform.deactivate();
            let feature = this._activeFeature;
            this._activeFeature.clearTempSymbol();
            this._activeFeature = null;
            this.activeLayer.redraw();
            this.fire(new FeatureDeselectEvent(feature));
        }
        _updateTransformControl() {
            if (this._polyTransform.isActive)
                this._polyTransform.update();
        }
        /**
         * Sets the editing mode. Available modes are:<br>
         *     * vertex - editing vertexes of polygons and polylines.
         *     * rotate - rotation of polygons and polylines
         *     * drag - dragging of whole features
         *     * scale - scaling of polygons and polylines
         *     * all - all modes are active
         * @param mode - can be coma separated list or array of mode names
         */
        setMode(mode) {
            if (mode === 'all')
                mode = modes;
            if (!Array.isArray(mode))
                mode = mode.split(',').map(x => x.trim());
            this._vertexEditing = mode.indexOf('vertex') >= 0;
            this._rotation = mode.indexOf('rotate') >= 0;
            this._dragging = mode.indexOf('drag') >= 0;
            this._scaling = mode.indexOf('scale') >= 0;
            if (this._activeFeature && this._activeFeature.rings) {
                this._polyEditor.deactivate();
                this._polyTransform.deactivate();
                this._activatePolyControls(this._activeFeature);
            }
        }
        /**
         * If deselecting was prohibited, this methods turns it on again.
         */
        allowDeselect() { this._deselectAllowed = true; }
        /**
         * Prevents feature to be deselected by any user or code interaction. It will not have effect if the control is deactivated though.
         */
        prohibitDeselect() { this._deselectAllowed = false; }
        _delete() {
            if (this._deselectAllowed && this.allowDeletion && this._activeFeature) {
                let feature = this._activeFeature;
                this.prohibitEvent(FeatureDeselectEvent.type);
                this._deselect();
                this.allowEvent(FeatureDeselectEvent.type);
                this.activeLayer.remove(feature);
                this._saveState();
                this.fire(new FeatureRemoveEvent(feature));
            }
        }
        _handleKeyDown(event) {
            switch (event.which) {
                case 27:
                    this._deselect();
                    return false; // esc
                case 46:
                    this._delete();
                    return false; // del
                case 90:
                    if (event.ctrlKey) {
                        this.undo();
                        return false;
                    }
                    break; // ctrl+z
                case 89:
                    if (event.ctrlKey) {
                        this.redo();
                        return false;
                    }
                    break; // ctrl+y
            }
        }
        _saveState() {
            this._states.setState({ feature: this._activeFeature, coordinates: this._activeFeature && this._activeFeature.coordinates });
        }
        /**
         * Undo last change.
         */
        undo() {
            this._setState(this._states.undo());
        }
        /**
         * Redo a change that was undone.
         */
        redo() {
            this._setState(this._states.redo());
        }
        _setState(state) {
            if (!state)
                return this._deselect();
            if (!state.coordinates && this.activeLayer.features.indexOf(state.feature) >= 0) {
                this.activeFeature = null;
                this.activeLayer.remove(state.feature);
            }
            else if (state.coordinates && this.activeLayer.features.indexOf(state.feature) < 0) {
                this._setCoordinates(state);
                this.activeLayer.add(state.feature);
                this.activeFeature = state.feature;
            }
            else if (state.coordinates) {
                this._setCoordinates(state);
                this.activeFeature = state.feature;
            }
            this._updateTransformControl();
            this.activeLayer.redraw();
        }
        _setCoordinates(state) {
            if (state.feature instanceof Point_1.PointFeature) {
                state.feature.position = state.coordinates;
            }
            else if (state.feature instanceof Poly_1.Poly) {
                state.feature.coordinates = state.coordinates;
            }
        }
        get ignoreEvents() { return this._ignoreEvents; }
        set ignoreEvents(bool) {
            this._ignoreEvents = bool;
            this._pointEditor.ignoreEvents = bool;
            this._polyEditor.ignoreEvents = bool;
            this._polyTransform.ignoreEvents = bool;
        }
        get pointEditor() { return this._pointEditor; }
        get polyEditor() { return this._polyEditor; }
        get polyTransform() { return this._polyTransform; }
    }
    exports.Editor = Editor;
});
