define(["require", "exports", "../utils/Color", "../utils/utils"], function (require, exports, Color_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let symbolDescriptions = {};
    /**
     * Registers symbol class for serialization. After registration, the symbol can be serialized and deserialized with this
     * serialier.
     * @param constructor - constructor (class) of the symbol.
     * @param name - unique name of the symbol type. It is used to find correct constructor on deserialization.
     * @param properties - list of property names that should be serialized.
     */
    exports.registerSymbol = (constructor, name, properties) => {
        symbolDescriptions[name] = { Constructor: constructor, properties: properties };
    };
    /**
     * Serializes symbol to a key-value JSON object.
     * @param symbol - symbol to be serialized.
     * @param colorsFormat - color format to be used during serialization. If not set, the value from the symbol property
     *                       will be used without change.
     */
    exports.serialize = (symbol, colorsFormat = null) => {
        let keys = Object.keys(symbolDescriptions);
        for (let i = 0; i < keys.length; i++) {
            let desc = symbolDescriptions[keys[i]];
            if (symbol instanceof desc.Constructor) {
                let serialized = { symbolName: keys[i] };
                desc.properties.forEach(prop => {
                    let value = symbol[prop];
                    if (colorsFormat) {
                        let color = new Color_1.Color(value);
                        if (color.isValid)
                            value = color.toString(colorsFormat);
                    }
                    if (value instanceof Object) {
                        value = utils_1.copyObject(value);
                    }
                    serialized[prop] = value;
                });
                return serialized;
            }
        }
        utils_1.error(new Error('Unknown type of symbol.'));
    };
    /**
     * Deserializes symbol.
     * @param desc - serialized symbol as JSON object.
     * @param colorsFormat - format of the color properties to be used after deserialization. If not set, the values will be
     *                       set without change.
     */
    exports.deserialize = (desc, colorsFormat = null) => {
        if (!symbolDescriptions[desc.symbolName])
            utils_1.error(new Error('Unknown type of symbol.'));
        let symbol = new symbolDescriptions[desc.symbolName].Constructor();
        symbolDescriptions[desc.symbolName].properties.forEach(prop => {
            let val = desc[prop];
            if (colorsFormat) {
                let color = new Color_1.Color(val.toString());
                if (color.isValid && color.format === colorsFormat)
                    val = color.toString('rgba');
            }
            if (val instanceof Object) {
                val = utils_1.copyObject(val);
            }
            symbol[prop] = val;
        });
        return symbol;
    };
});
