define(["require", "exports", "./Map", "./painters/DomPainter/DomPainter", "./utils/utils"], function (require, exports, Map_1, DomPainter_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Convenience method for simple map initialization
     * @param position
     * @param centerPoint
     * @param resolution
     * @param crs
     * @param layers
     * @param wrapper
     * @param pluginDefinitions
     * @example init_Setting_position_and_resolution
     */
    exports.init = function ({ position = undefined, centerPoint = undefined, resolution = undefined, crs = undefined, layers = undefined, wrapper = undefined, pluginDefinitions = [] }) {
        let map = new Map_1.Map({ crs, position, centerPoint, resolution, layers });
        let painter = new DomPainter_1.DomPainter(map, { wrapper });
        let p = pluginDefinitions.map(pluginDefinition => {
            let name = pluginDefinition.name;
            if (!exports.plugins[name]) {
                throw new Error(`Plugin ${name} is not available.`);
            }
            return new exports.plugins[name](map, painter, pluginDefinition.properties);
        });
        return { map, painter, p };
    };
    exports.plugins = {
        registerPlugin(name, Constructor) {
            if (exports.plugins[name]) {
                utils_1.warn(`Plugin with name ${name} already registered. Skipping.`);
            }
            else {
                exports.plugins[name] = Constructor;
            }
        }
    };
});
