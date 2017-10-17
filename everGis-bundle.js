(function() {
    'use strict';

    /**
     * @namespace sGis
     */
    let sGis = {};

    sGis.version = "0.3.1";
    sGis.releaseDate = "17.10.2017";

    let loadedModules = { 'sGis': sGis };
    let loadingDefs = [];

    /**
     * This function is used to define sGis library modules and their dependencies. It should not be used if a module loading system (like CommonJS or AMD) is used.
     * @param {String} moduleName - name of the module. Can contain any number of namespaces, like: "namespace.subNamespace.moduleName"
     * @param {String[]} dependencies - list of dependency module names with namespaces
     * @param {Function} intiHandler - module initialization handler. The function will be called with array of loaded models as specified in 'dependencies' argument
     */
    sGis.module = function(moduleName, dependencies, intiHandler) {
        if (loadedModules[moduleName]) throw new Error('Module definition conflict: ' + moduleName);
        loadingDefs.push(Array.prototype.slice.call(arguments));

        while (loadModules()) {
            //continue
        }
    };

    /**
     * This function is called each time a new module is loaded. The only argument of the callback is the name of the module.
     * @type {Function|null}
     */
    sGis.module.onLoad = null;

    function loadModules() {
        let loaded = 0;
        let list = loadingDefs.slice();
        let remains = [];
        list.forEach(function(def) {
            let deps = [];
            for (let i = 0; i < def[1].length; i++) {
                if (!loadedModules[def[1][i]]) {
                    remains.push(def);
                    // console.log('Tried to load: ' + def[0] + '. Not found: ' + def[1][i]);
                    return;
                }
                deps.push(loadedModules[def[1][i]]);
            }

            let module = def[2].apply(this, deps);
            loadedModules[def[0]] = module;
            setModuleReference(module, def[0]);
            loaded ++;

            // console.log('Initialized: ' + def[0]);
            if (sGis.module.onLoad) sGis.module.onLoad(def[0]);
        });
        loadingDefs = remains;

        sGis.loadingDefs = loadingDefs;

        return loaded;
    }

    sGis.loadedModules = loadedModules;

    if (window.define && window.define.amd) {
        window.define([], () => sGis);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = sGis;
    } else {
        window.sGis = sGis;
    }

    function setModuleReference(module, name) {
        let ns = name.split('.');
        let curr = sGis;
        for (let i = 0; i < ns.length - 1; i++) {
            if (!curr[ns[i]]) curr[ns[i]] = {};
            curr = curr[ns[i]];
        }
        curr[ns.pop()] = module;
    }

})();
sGis.module('Bbox', [
    'utils',
    'CRS',
    'Point'
], function(utils, CRS, Point) {
    'use strict';

    let defaults = {
        _crs: CRS.geo
    };

    /**
     * Object representing a rectangular area on a map between two point.
     * @alias sGis.Bbox
     */
    class Bbox {
        /**
         * @constructor
         * @param {Position} point1 - first corner point of rectangle
         * @param {Position} point2 - second corner point of rectangle
         * @param {sGis.Crs} [crs=sGis.CRS.geo] - coordinate system of the point coordinates
         */
        constructor(point1, point2, crs)
        {
            if (crs) this._crs = crs;
            this._p = [Math.min(point1[0], point2[0]), Math.min(point1[1], point2[1]), Math.max(point1[0], point2[0]), Math.max(point1[1], point2[1])];
        }

        /**
         * Returns a new Bbox in the specified coordinate system.
         * @param {sGis.Crs} crs - target coordinate system
         * @throws If the instance coordinates cannot be projected into the target crs.
         * @returns {sGis.Bbox}
         */
        projectTo(crs) {
            let projected1 = new Point(this._p.slice(0,2), this._crs).projectTo(crs).position;
            let projected2 = new Point(this._p.slice(2,4), this._crs).projectTo(crs).position;
            return new Bbox(projected1, projected2, crs);
        }

        /**
         * Center point of the bounding box
         * @type sGis.Point
         * @readonly
         */
        get center() { return new Point([(this.xMax + this.xMin)/2, (this.yMax + this.yMin)/2], this.crs); }

        /**
         * Returns a copy of the bbox
         * @returns {sGis.Bbox}
         */
        clone() {
            return this.projectTo(this._crs);
        }

        /**
         * Returns true if the given bbox is equal (geographically) to the target bbox. It will return false if the target
         * bbox is set in different coordinate system or if any of the 4 coordinates are different by more then 0.0001%.
         * @param {sGis.Bbox} bbox - target bbox
         * @returns {boolean}
         */
        equals(bbox) {
            let target = bbox.coordinates;
            for (let i = 0; i < 4; i++) if (!utils.softEquals(this._p[i], target[i])) return false;
            return this._crs.equals(bbox.crs);
        }

        intersect(bbox) {
            bbox = bbox.crs === this.crs ? bbox : bbox.projectTo(this.crs);
            return new Bbox([Math.min(this.xMin, bbox.xMin), Math.min(this.yMin, bbox.yMin)], [Math.max(this.xMax, bbox.xMax), Math.max(this.yMax, bbox.yMax)], this.crs);
        }

        /**
         * Returns true if at list one point of the given bbox lies inside the target bbox. NOTE that this method will return true
         * if on of the bboxes is completely inside the other. It will return false if bboxes are adjustened, e.g. a side of one bbox
         * touches a side of another one.
         * @param {sGis.Bbox} bbox - target bbox
         * @returns {boolean}>
         */
        intersects(bbox) {
            let projected = bbox.projectTo(this._crs);
            return this.xMax > projected.xMin && this.xMin < projected.xMax && this.yMax > projected.yMin && this.yMin < projected.yMax;
        }

        /**
         * Returns true, if the target point is inside the bbox.
         * @param {sGis.Point} point
         * @returns {boolean}
         */
        contains(point) {
            let projected = point.projectTo(this.crs);
            return this.xMin <= projected.x && this.xMax >= projected.x && this.yMin <= projected.y && this.yMax >= projected.y;
        }

        /**
         * Coordinate system of the bbox.
         * @type sGis.Crs
         * @readonly
         */
        get crs() { return this._crs; }

        /**
         * Coordinate of the right border of the bbox. Cannot be assigned value less then xMin.
         * @type Number
         */
        get xMax() { return this._p[2] }
        set xMax(/** Number */ value) {
            if (value < this.xMin) utils.error('Max value cannot be lower than the min value');
            this._p[2] = value;
        }

        /**
         * Coordinate of the top border of the bbox. Cannot be assigned value less then yMin.
         * @type Number
         */
        get yMax() { return this._p[3]; }
        set yMax(/** Number */ value) {
            if (value < this.yMin) utils.error('Max value cannot be lower than the min value');
            this._p[3] = value;
        }

        /**
         * Coordinate of the left border of the bbox. Cannot be assigned value larger then xMax.
         * @type Number
         */
        get xMin() { return this._p[0]; }
        set xMin(/** Number */ value) {
            if (value > this.xMax) utils.error('Min value cannot be higher than the max value');
            this._p[0] = value;
        }

        /**
         * Coordinate of the bottom border of the bbox. Cannot be assigned value larger then yMax.
         * @type Number
         */
        get yMin() { return this._p[1]; }
        set yMin(/** Number */ value) {
            if (value > this.yMax) utils.error('Min value cannot be higher than the max value');
            this._p[1] = value;
        }

        /**
         * Width of the bbox.
         * @type Number
         * @readonly
         */
        get width() { return this.xMax - this.xMin; }

        /**
         * Height of the bbox.
         * @type number
         * @readonly
         */
        get height() { return this.yMax - this.yMin; }

        /**
         * Coordinates of the bbox in the form [xMin, yMin, xMax, yMax].
         * @type number[]
         * @readonly
         */
        get coordinates() { return utils.copyArray(this._p); }
    }

    utils.extend(Bbox.prototype, defaults);

    return Bbox;

});

sGis.module('Crs', [

], function() {
    'use strict';

    let identityProjection = ([x,y]) => [x,y];

    /**
     * @class
     * @alias sGis.Crs
     * @property {Object} description - description of the crs
     */
    class Crs {
        /**
         * @constructor
         * @param {Object} [description] - description of the crs
         * @param {Map} [projectionsMap]
         */
        constructor(description = {}, projectionsMap = new Map()) {
            let { wkid, authority, wkt, details } = description;

            this.wkid = wkid;
            this.authority = authority;
            this.wkt = wkt;
            this.details = details;

            this._projections = projectionsMap;
        }

        toString() {
            if (this.wkid) return this.wkid.toString();
            if (this.wkt) return this.wkt;

            return this.details;
        }

        /**
         * Returns true if given crs represents the same spatial reference system
         * @param {sGis.Crs} crs
         * @returns {boolean}
         */
        equals(crs) {
            if (this === crs) return true;
            if (this.wkid && this.wkid === crs.wkid) return true;

            return this.wkt && this.wkt === crs.wkt;
        }

        /**
         * Returns projection function from the current coordinate system to specified. Returned function takes one [x,y] parameter and returns projected [x,y] (corresponding to crs parameter)
         * @param {sGis.Crs} crs
         * @returns {Function|null}
         */
        projectionTo(crs) {
            if (this._projections.get(crs)) return this._projections.get(crs);
            return this._discoverProjectionTo(crs);
        }

        /**
         * Returns true if the current coordinate system can be projected to the given crs
         * @param {sGis.CRS} crs
         * @returns {boolean}
         */
        canProjectTo(crs) {
            return this.projectionTo(crs) !== null;
        }

        /**
         * Adds the projection function to the coordinate system
         * @param {sGis.Crs} crs
         * @param {Function} func
         */
        setProjectionTo(crs, func) {
            this._projections.set(crs, func);
        }

        _discoverProjectionTo(crs) {
            if (this._discoveryMode) return null;
            if (this.equals(crs)) return identityProjection;

            this._discoveryMode = true;
            for (let [ownCrs, func] of this._projections) {
                if (ownCrs.equals(crs)) {
                    this._projections.set(crs, func);
                    break;
                }

                let innerProjection = ownCrs._discoverProjectionTo(crs);
                if (innerProjection) {
                    let result = function([x, y]) { return innerProjection(func([x, y])); };
                    this._projections.set(crs, result);
                    break;
                }
            }
            this._discoveryMode = false;

            return this._projections.get(crs) || null;
        }

        /**
         * String description of the crs.
         * @type string
         */
        get stringDescription() {
            return JSON.stringify(this.description);
        }

        /**
         * @deprecated
         */
        getWkidString() {
            return this.description;
        }
    }

    return Crs;

});


sGis.module('CRS', [
    'Crs',
    'math'
], function(Crs, math) {

    /**
     * @namespace
     * @alias sGis.CRS
     */
    let CRS = {};

    /**
     * Plain euclidean coordinate system. This projection cannot be projected to any other projection.
     * @type sGis.Crs
     * @alias sGis.CRS.plain
     * @memberof sGis.CRS
     */
    CRS.plain = new Crs('Plain crs without any projection functions');

    /**
     * Geographical coordinate system, which has longitude set as X coordinate, and latitude as Y coordinate.
     * @type sGis.Crs
     * @alias sGis.CRS.wgs84
     * @memberof sGis.CRS
     */
    CRS.wgs84 = new Crs({
        wkid: 84,
        authority: 'OCG',
        wkt: 'GEOGCS["GCS_WGS_1984",DATUM["D_WGS_1984",SPHEROID["WGS_1984",6378137,298.257223563]],PRIMEM["Greenwich",0],UNIT["Degree",0.017453292519943295]]'
    });

    /**
     * @type sGis.Crs
     * @alias sGis.CRS.geo
     * @memberof sGis.CRS
     */
    CRS.geo = new Crs({
        wkid: 4326,
        authority: 'EPSG'
    });

    CRS.geo.setProjectionTo(CRS.wgs84, ([x,y]) => [y,x]);

    /**
     * @deprecated
     */
    CRS.geo.from = (x,y) => { return {x: x, y: y}};
    /**
     * @deprecated
     */
    CRS.geo.to = (x,y) => { return {x: x, y: y}};

    CRS.wgs84.setProjectionTo(CRS.geo, ([x,y]) => [y,x]);

    {
        let a = 6378137;

        /**
         * @type sGis.Crs
         * @alias sGis.CRS.webMercator
         * @memberof sGis.CRS

         */
        CRS.webMercator = new Crs({
            wkid: 3857,
            authority: 'EPSG',
            wkt: 'PROJCS["WGS 84 / Pseudo-Mercator",GEOGCS["GCS_WGS_1984",DATUM["D_WGS_1984",SPHEROID["WGS_1984",6378137,298.257223563]],PRIMEM["Greenwich",0],UNIT["Degree",0.017453292519943295]],PROJECTION["Mercator"],PARAMETER["central_meridian",0],PARAMETER["scale_factor",1],PARAMETER["false_easting",0],PARAMETER["false_northing",0],UNIT["Meter",1]]'
        });

        CRS.webMercator.setProjectionTo(CRS.wgs84, ([x,y]) => {
            let rLat = Math.PI / 2 - 2 * Math.atan(Math.exp(-y / a));
            let rLong = x / a;
            let lon = math.radToDeg(rLong);
            let lat = math.radToDeg(rLat);

            return [lon, lat];
        });
        CRS.wgs84.setProjectionTo(CRS.webMercator, ([x,y]) => {
            let rLon = math.degToRad(x);
            let rLat = math.degToRad(y);
            let X = a * rLon;
            let Y = a * Math.log(Math.tan(Math.PI / 4 + rLat / 2));

            return [X, Y];
        });

        /**
         * @deprecated
         */
        CRS.webMercator.from = (x,y) => {
            let [lat, lon] = CRS.webMercator.projectionTo(CRS.geo)([x,y]);
            return {x: lon, y: lat, lon: lon, lat: lat};
        };
        /**
         * @deprecated
         */
        CRS.webMercator.to = (lon,lat) => {
            let [x, y] = CRS.geo.projectionTo(CRS.webMercator)([lat,lon]);
            return {x: x, y: y};
        }
    }

    {
        let a = 6378137;
        let b = 6356752.3142451793;
        let e =  Math.sqrt(1 - b*b/a/a);
        let eh = e/2;
        let pih = Math.PI/2;

        /**
         * @type sGis.Crs
         * @alias sGis.CRS.ellipticalMercator
         * @memberof sGis.CRS
         */
        CRS.ellipticalMercator = new Crs({
            wkid: 3395,
            authority: 'EPSG',
            wkt: 'PROJCS["WGS 84 / World Mercator",GEOGCS["GCS_WGS_1984",DATUM["D_WGS_1984",SPHEROID["WGS_1984",6378137,298.257223563]],PRIMEM["Greenwich",0],UNIT["Degree",0.017453292519943295]],PROJECTION["Mercator"],PARAMETER["central_meridian",0],PARAMETER["scale_factor",1],PARAMETER["false_easting",0],PARAMETER["false_northing",0],UNIT["Meter",1]]'
        });

        CRS.ellipticalMercator.setProjectionTo(CRS.wgs84, ([x,y]) => {
            let ts = Math.exp(-y/a);
            let phi = pih - 2 * Math.atan(ts);
            let i = 0;
            let dphi = 1;

            while (Math.abs(dphi) > 0.000000001 && i++ < 15) {
                let con = e * Math.sin(phi);
                dphi = pih - 2 * Math.atan(ts * Math.pow((1 - con) / (1 + con), eh)) - phi;
                phi += dphi;
            }

            let rLong = x / a,
                rLat = phi,
                lon = math.radToDeg(rLong),
                lat = math.radToDeg(rLat);

            return [lon, lat];
        });
        CRS.wgs84.setProjectionTo(CRS.ellipticalMercator, ([x,y]) => {
            let rLat = math.degToRad(y);
            let rLon = math.degToRad(x);
            let X = a * rLon;
            let Y = a * Math.log(Math.tan(Math.PI / 4 + rLat / 2) * Math.pow((1 - e * Math.sin(rLat)) / (1 + e * Math.sin(rLat)), (e/2)));

            return [X, Y];
        });

        /**
         * @deprecated
         */
        CRS.ellipticalMercator.from = (x,y) => {
            let [lat, lon] = CRS.ellipticalMercator.projectionTo(CRS.geo)([x,y]);
            return {x: lon, y: lat, lon: lon, lat: lat};
        };
        /**
         * @deprecated
         */
        CRS.ellipticalMercator.to = (lat,lon) => {
            let [x, y] = CRS.geo.projectionTo(CRS.ellipticalMercator)([lat,lon]);
            return {x: x, y: y};
        }
    }

    //noinspection SpellCheckingInspection
    CRS.moscowBessel = new Crs({
        wkt: "PROJCS[\"Moscow_bessel\",GEOGCS[\"GCS_Bessel_1841\",DATUM[\"D_Bessel_1841\",SPHEROID[\"Bessel_1841\",6377397.155,299.1528128]],PRIMEM[\"Greenwich\",0.0],UNIT[\"Degree\",0.0174532925199433]],PROJECTION[\"Transverse_Mercator\"],PARAMETER[\"False_Easting\",0.0],PARAMETER[\"False_Northing\",0.0],PARAMETER[\"Central_Meridian\",37.5],PARAMETER[\"Scale_Factor\",1.0],PARAMETER[\"Latitude_Of_Origin\",55.66666666666666],UNIT[\"Meter\",1.0]]"
    });

    {
        //http://mathworld.wolfram.com/AlbersEqual-AreaConicProjection.html

        let R = 6372795;
        /**
         * Class constructor of Alber's equal area projections.
         * @alias sGis.CRS.AlbersEqualArea
         * @extends Crs
         */
        class AlbersEqualArea extends Crs {
            /**
             * @param {Number} lat0 - latitude of origin
             * @param {Number} lon0 - longitude of origin
             * @param {Number} stLat1 - first standard parallel
             * @param {Number} stLat2 - second standard parallel
             */
            constructor(lat0, lon0, stLat1, stLat2) {
                super({
                    details: 'Albers Equal-Area Conic Projection: ' + lat0 + ',' + lon0 + ',' + stLat1 + ',' + stLat2
                });

                let _lat0 = math.degToRad(lat0);
                let _lon0 = math.degToRad(lon0);
                let _stLat1 = math.degToRad(stLat1);
                let _stLat2 = math.degToRad(stLat2);
                let _n = (Math.sin(_stLat1) + Math.sin(_stLat2)) / 2;
                let _c = Math.pow(Math.cos(_stLat1), 2) + 2 * _n * Math.sin(_stLat1);
                let _ro0 = Math.sqrt(_c - 2 * _n * Math.sin(_lat0)) / _n;

                this.setProjectionTo(CRS.wgs84, ([x,y]) => {
                    let xRad = x / R;
                    let yRad = y / R;
                    let th = Math.atan(xRad / (_ro0 - yRad));
                    let ro = xRad / Math.sin(th);
                    let rLat = Math.asin((_c - ro * ro * _n * _n) / 2 / _n);
                    let rLon = _lon0 + th / _n;

                    let lat = math.radToDeg(rLat);
                    let lon = math.radToDeg(rLon);

                    return [lon, lat];
                });

                CRS.wgs84.setProjectionTo(this, ([lon,lat]) => {
                    let rLon = math.degToRad(lon),
                        rLat = math.degToRad(lat),
                        th = _n * (rLat - _lon0),
                        ro = Math.sqrt(_c - 2 * _n * Math.sin(rLon)) / _n,
                        x = ro * Math.sin(th) * R,
                        y = _ro0 - ro * Math.cos(th) * R;

                    return [x, y];
                });
            }
        }

        /**
         * @deprecated
         */
        AlbersEqualArea.prototype.from = function(x, y) {
            let [lat, lon] = this.projectionTo(CRS.geo)([x,y]);
            return {x: lon, y: lat, lon: lon, lat: lat};
        };
        /**
         * @deprecated
         */        AlbersEqualArea.prototype.to = function(lat, lon)  {
            let [x, y] = CRS.geo.projectionTo(this)([lat,lon]);
            return {x: x, y: y};
        };

        CRS.AlbersEqualArea = AlbersEqualArea;
    }

    /**
     * @type sGis.Crs
     * @alias sGis.CRS.cylindricalEqualArea
     * @memberof sGis.CRS
     */
    CRS.cylindricalEqualArea = new CRS.AlbersEqualArea(0, 180, 60, 50);

    return CRS;

});

sGis.module('DynamicLayer', [
    'utils',
    'Layer',
    'feature.Image',
    'symbol.image.Image'
], function(utils, /** sGis.Layer.constructor */ Layer, Image, ImageSymbol) {
    'use strict';

    /**
     * Represents a layer that is fully drawn by server and is displayed as an image overlay.
     * @alias sGis.DynamicLayer
     * @extends sGis.Layer
     */
    class DynamicLayer extends Layer {
        /**
         * @constructor
         * @param {function(sGis.Bbox, Number)} getUrlDelegate
         * @param {Object} [properties] - key-value set of properties to be assigned to the instance
         */
        constructor(getUrlDelegate, properties) {
            super(properties);
            this._getUrl = getUrlDelegate;
        }

        getFeatures(bbox, resolution) {
            if (!this.checkVisibility(resolution)) return [];
            
            if (this.crs) {
                if (bbox.crs.canProjectTo(this.crs)) {
                    bbox = bbox.projectTo(this.crs);
                } else {
                    return [];
                }
            }
            
            if (this._features && this._features[0].crs !== bbox.crs) this._features = null;

            if (!this._features) this._createFeature(bbox);
            var width  = bbox.width / resolution;
            var height = bbox.height / resolution;
            if (this._forceUpdate || !this._features[0].bbox.equals(bbox) || this._features[0].width !== width || this._features[0].height !== height) {
                var url = this._getUrl(bbox, resolution);
                if (url == null) return [];
                if (this._forceUpdate) {
                    url += '&ts=' + Date.now();
                    this._forceUpdate = false;
                }

                this._features[0].src = url;
                this._features[0].bbox = bbox;
                this._features[0].width = bbox.width / resolution;
                this._features[0].height = bbox.height / resolution;
            }

            return this._features;
        }

        /**
         * Ensures update of the layer image
         */
        forceUpdate() {
            this._forceUpdate = true;
            this.fire('propertyChange', {property: 'source'});
        }

        _createFeature(bbox) {
            var feature = new Image(bbox, { crs: this.crs || bbox.crs, opacity: this.opacity});
            this._features = [feature];
            this._updateSymbol();
        }

        get opacity() { return this.getOpacity(); }
        set opacity(opacity) {
            this.setOpacity(opacity);
            this._updateSymbol();
        }

        /**
         * Coordinate system of the layer
         * @type {sGis.Crs}
         * @default null
         */
        get crs() { return this._crs; }
        set crs(/** sGis.Crs */ crs) { this._crs = crs; }

        /**
         * Base url of the service
         * @type {String}
         */
        get url() { return this._url; }
        
        _updateSymbol() {
            if (this._features) this._features[0].symbol = new ImageSymbol({ opacity: this.opacity });
        }
    }

    /**
     * Additional url parameters to be added to the image url as a key-value set.
     * @member {Object} additionalParameters
     * @memberof sGis.DynamicLayer
     * @instance
     * @default {}
     */
    DynamicLayer.prototype.additionalParameters = {};

    /**
     * @default true
     */
    DynamicLayer.prototype.delayedUpdate = true;

    DynamicLayer.prototype._crs = null;

    return DynamicLayer;

});

sGis.module('event', [], function() {
    
    'use strict';

    let id = 0;

    /**
     * Utility methods for cross-browser DOM event handling
     * @namespace sGis.event
     */
    let ev = {
        /**
         * Cross browser DOM event attachment
         * @param {HTMLElement} element - target element
         * @param {String} type - name of the event
         * @param {Function} handler - event handler
         * @returns {Function} - attached handler
         */
        add: function (element, type, handler) {
            if (type === 'wheel') type = getWheelEventType();
            if (!handler.guid) handler.guid = ++id;

            if (!element.events) {
                element.events = {};
                element.handle = event => {
                    return commonHandle.call(element, event);
                };
            }

            if (!element.events[type]) {
                element.events[type] = {};

                if (element.addEventListener) {
                    element.addEventListener(type, element.handle, false);
                } else if (element.attachEvent) {
                    element.attachEvent("on" + type, element.handle);
                }
            }

            element.events[type][handler.guid] = handler;

            return handler;
        },

        /**
         * Removes an event handler.
         * @param {HTMLElement} element - target element
         * @param {String} type - event name
         * @param {Function} [handler] - handler to be removed. If not specified all handlers will be removed.
         */
        remove: function (element, type, handler) {
            var handlers = element.events && element.events[type];
            if (!handlers) return;

            if (!handler) {
                Object.keys(handlers).forEach(key => {
                    delete handlers[key];
                });
            } else {
                delete handlers[handler.guid];
            }

            if (Object.keys(handlers).length > 0) return;

            if (element.removeEventListener) {
                element.removeEventListener(type, element.handle, false);
            } else if (element.detachEvent) {
                element.detachEvent("on" + type, element.handle);
            }

            delete element.events[type];

            if (Object.keys(element.events).length > 0) return;

            try {
                delete element.handle;
                delete element.events;
            } catch (e) { // IE
                element.removeAttribute("handle");
                element.removeAttribute("events");
            }
        }
    };

    function fixEvent(event) {
        event = event || window.event;

        if (event.isFixed) {
            return event;
        }
        event.isFixed = true;

        event.preventDefault = event.preventDefault || function () {
                this.returnValue = false;
            };
        event.stopPropagation = event.stopPropagation || function () {
                this.cancelBubble = true;
            };

        if (!event.target) {
            event.target = event.srcElement;
        }

        if (!event.currentTarget) {
            event.currentTarget = event.srcElement;
        }

        if (event.relatedTarget === undefined && event.fromElement) {
            event.relatedTarget = event.fromElement === event.target ? event.toElement : event.fromElement;
        }

        if (event.pageX == null && event.clientX != null) {
            var html = document.documentElement, body = document.body;
            event.pageX = event.clientX + (html && html.scrollLeft || body && body.scrollLeft || 0) - (html.clientLeft || 0);
            event.pageY = event.clientY + (html && html.scrollTop || body && body.scrollTop || 0) - (html.clientTop || 0);
        }

        if (!event.which && event.button) {
            // noinspection JSBitwiseOperatorUsage
            event.which = (event.button & 1 ? 1 : ( event.button & 2 ? 3 : ( event.button & 4 ? 2 : 0 ) ));
        }

        return event;
    }

    function commonHandle(event) {
        event = fixEvent(event);

        var handlers = this.events[event.type];
        let keys = Object.keys(handlers);
        for (let i = 0; i < keys.length; i++) {
            let ret = handlers[keys[i]].call(this, event);
            if (ret === false) {
                event.preventDefault();
                event.stopPropagation();
                return;
            }
        }
    }

    function getWheelEventType() {
        if (document.addEventListener) {
            if ('onwheel' in document) {
                return 'wheel';
            } else if ('onmousewheel' in document) {
                return 'mousewheel';
            } else {
                return 'MozMousePixelScroll';
            }
        }
    }

    /**
     * Returns cross-browser consistent value of wheel rolling direction (-1 or 1).
     * @param {Event} e
     * @returns {number}
     */
    ev.getWheelDirection = function (e) {
        var wheelData = (e.detail ? e.detail * -1 : e.wheelDelta / 40) || (e.deltaY * -1);
        if (wheelData > 0) {
            wheelData = 1;
        } else if (wheelData < 0) {
            wheelData = -1;
        }
        return wheelData;
    };

    /**
     * Returns offset of a mouse event relative to the target element
     * @param {HTMLElement} target
     * @param {MouseEvent} e
     * @returns {{x: Number, y: Number}}
     */
    ev.getMouseOffset = function (target, e) {
        var docPos = ev.getPosition(target);
        return {x: e.pageX - docPos.x, y: e.pageY - docPos.y};
    };

    /**
     * Returns offset of an element relative to the viewport
     * @param {HTMLElement} e
     * @returns {{x: Number, y: Number}}
     */
    ev.getPosition = function (e) {
        var clientRect = e.getBoundingClientRect(),
            x = (window.pageXOffset !== undefined) ? window.pageXOffset : (document.documentElement || document.body.parentNode || document.body).scrollLeft,
            y = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
        return {x: clientRect.left + x, y: clientRect.top + y};
    };

    return ev;
});
sGis.module('EventHandler', [
    'utils'
], function(utils) {
    'use strict';

    /**
     * Base of all sGis library events
     * @name sGisEvent
     * @mixin
     * @type {Object}
     * @prop {String} eventType - name of the event
     * @prop {Object} sourceObject - object that triggered the event
     * @prop {Function} stopPropagation - prevents event to be handled by any further handlers
     * @prop {Function} isCanceled - returns true if the .stopPropagation() method was called
     */
    
    /**
     * Provides methods for handling events.
     * @alias sGis.EventHandler
     */
    class EventHandler {
        /**
         * Triggers event with the given parameters. It is supposed to be used to transfer event from one object to another (for example, from layer to a feature).
         * @param {Object} sGisEvent - event object of the original event
         */
        forwardEvent (sGisEvent) {
            if (this._prohibitedEvents && this._prohibitedEvents.indexOf(sGisEvent.eventType) !== -1) return;
            var eventType = sGisEvent.eventType;
            if (this._eventHandlers && this._eventHandlers[eventType]) {
                var handlerList = utils.copyArray(this._eventHandlers[eventType]); //This is needed in case one of the handlers is deleted in the process of handling
                for (var i = 0, len = handlerList.length; i < len; i++) {
                    if (handlerList[i].oneTime) {
                        var currentIndex = this._eventHandlers[eventType].indexOf(handlerList[i]);
                        this._eventHandlers[eventType].splice(currentIndex, 1);
                    }
                    handlerList[i].handler.call(this, sGisEvent);
                    if (sGisEvent._cancelPropagation) break;
                }
            }
        }

        /**
         * Triggers the event of the given type. Each handler will be triggered one by one in the order they were added.
         * @param {String} eventType - exact name of the event to be triggered.
         * @param {Object} [parameters] - parameters to be transferred to the event object.
         * @returns {Object} - event object
         */
        fire (eventType, parameters) {
            if (this._prohibitedEvents && this._prohibitedEvents.indexOf(eventType) !== -1) return null;

            var sGisEvent = {};
            if (parameters) utils.extend(sGisEvent, parameters);

            var types = getTypes(eventType);
            if (types.length !== 1) utils.error('Exactly on type of event can be fired at a time, but ' + types.length + ' is given');

            sGisEvent.sourceObject = this;
            sGisEvent.eventType = types[0];
            sGisEvent.stopPropagation = function() {sGisEvent._cancelPropagation = true;};
            sGisEvent.preventDefault = function() {sGisEvent._cancelDefault = true;};
            sGisEvent.isCanceled = function() { return sGisEvent._cancelPropagation === true; };

            this.forwardEvent(sGisEvent);
            
            return sGisEvent;
        }

        /**
         * Sets a listener for the given event type.
         * @param {String} description - description of the event. Can contain any number of type names and namespaces (namespaces start with .), but must have at least one of either..
         * @param {Function} handler - handler to be executed. The handler is called in the event source object context.
         */
        addListener (description, handler) {
            if (!(handler instanceof Function)) utils.error('Function is expected but got ' + handler + ' instead');
            if (!utils.isString(description)) utils.error('String is expected but got ' + description + ' instead');

            var types = getTypes(description);
            if (types.length < 1) utils.error('No event type is specified');

            var namespaces = getNamespaces(description);
            if (!this._eventHandlers) this._setHandlerList();

            for (var i = 0; i < types.length; i++) {
                if (!this._eventHandlers[types[i]]) this._eventHandlers[types[i]] = [];
                this._eventHandlers[types[i]].push({handler: handler, namespaces: namespaces});
            }
        }

        /**
         * Sets a one time handler for the given event. This handler is removed from the list of handlers just before it is called.
         * @param {String} description - description of the event. Can contain <s>ONLY ONE EVENT TYPE</s> and any number of namespaces (namespaces start with .).
         * @param {Function} handler - handler to be executed. The handler is called in the event source object context.
         */
        once (description, handler) {
            if (!(handler instanceof Function)) utils.error('Function is expected but got ' + handler + ' instead');
            if (!utils.isString(description)) utils.error('String is expected but got ' + description + ' instead');

            var types = getTypes(description);
            if (types.length !== 1) utils.error('Only one event type can be specified with .once() method');
            var namespaces = getNamespaces(description);
            if (!this._eventHandlers) this._setHandlerList();

            if (!this._eventHandlers) this._setHandlerList();
            if (!this._eventHandlers[types[0]]) this._eventHandlers[types[0]] = [];
            this._eventHandlers[types[0]].push({handler: handler, namespaces: namespaces, oneTime: true});
        }

        /**
         * Removes the given handlers from the event listener list.
         * @param {String} description - description of the event. Can contain any number of type names and namespaces, but must have at least one of either.
         * @param {Function} [handler] - handler to be removed. If no handler is specified, all handlers from the given namespaces will be removed. If no handler and namespace are specified, error will be thrown.
         */
        removeListener (description, handler) {
            if (!utils.isString(description)) utils.error('Expected the name of the event and handler function, but got (' + description + ', ' + handler + ') instead');

            var types = getTypes(description);
            var namespaces = getNamespaces(description);

            if (namespaces.length === 0) {
                if (types.length === 0) utils.error('At least one event type or namespace must be specified');
                if (!handler) utils.error('To remove all listeners of the given type use the .removeAllListeners() method');
            }

            if (!this._eventHandlers) return;
            if (types.length === 0) types = Object.keys(this._eventHandlers);

            for (var i = 0; i < types.length; i++) {
                if (this._eventHandlers[types[i]]) {
                    for (var j = this._eventHandlers[types[i]].length-1; j >=0; j--) {
                        if ((namespaces === null || namespaces.length === 0 || utils.arrayIntersect(this._eventHandlers[types[i]][j].namespaces, namespaces)) &&
                            (!handler || this._eventHandlers[types[i]][j].handler === handler)) {
                            this._eventHandlers[types[i]].splice(j, 1);
                        }
                    }
                }
            }
        }

        /**
         * Prohibits triggering of the event. The prohibitions are stacked - if the same event is prohibited N times, you need to allow it N times to make it work.
         * @param {String} type - name of the event to be prohibited.
         */
        prohibitEvent (type) {
            if (!this._prohibitedEvents) this._prohibitedEvents = [];
            this._prohibitedEvents.push(type);
        }

        /**
         * Allows a previously prohibited event. The prohibitions are stacked - if the same event is prohibited N times, you need to allow it N times to make it work. If no prohibitions were set for the event, the operation is ignored.
         * @param {String} type - name of the event to be allowed.
         */
        allowEvent (type) {
            if (!this._prohibitedEvents) return;
            var index = this._prohibitedEvents.indexOf(type);
            if (index !== -1) this._prohibitedEvents.splice(index, 1);
        }

        /**
         * Checks if the object has the handler for the given event type.
         * @param {String} type - name of the event.
         * @param {Function} handler - handler to be checked
         * @returns {boolean}
         */
        hasListener (type, handler) {
            if (!utils.isString(type) || !utils.isFunction(handler)) utils.error('Expected the name of the event and handler function, but got (' + type + ', ' + handler + ') instead');

            if (this._eventHandlers && this._eventHandlers[type]) {
                for (var i = 0; i < this._eventHandlers[type].length; i++) {
                    if (this._eventHandlers[type][i].handler === handler) return true;
                }
            }

            return false;
        }

        /**
         * Checks if the object has any handlers corresponding to the following description.
         * @param {String} description - description of the event. Can contain any number of type names and namespaces (namespaces start with .), but must have at least one of either.
         * @returns {boolean} - true if the object has at least one handler of the given types with the given namespaces. If no event type is given, checks if there are any handlers in the given namespaces exist. If no namespace is given, the namespace check is ignored.
         */
        hasListeners (description) {
            if (!utils.isString(description)) utils.error('Expected the name of the event, but got ' + description + ' instead');
            if (!this._eventHandlers) return false;

            var types = getTypes(description);
            var namespaces = getNamespaces(description);

            if (types.length === 0) types = Object.keys(this._eventHandlers);

            for (var i = 0; i < types.length; i++) {
                if (this._eventHandlers[types[i]] && this._eventHandlers[types[i]].length > 0) {
                    if (namespaces.length > 0) {
                        for (var j = 0; j < this._eventHandlers[types[i]].length; j++) {
                            if (utils.arrayIntersect(this._eventHandlers[types[i]][j].namespaces, namespaces)) {
                                return true;
                            }
                        }
                    } else {
                        return true;
                    }
                }
            }
            return false;
        }

        /**
         * Returns the list of the event handler description in format { handler: Func, namespaces: ['.ns1, ...], oneTime: ifTheHandlerOneTimeHandler }.
         * @param {String} type - name of the event.
         * @returns {Array}
         */
        getHandlers (type) {
            if (!utils.isString(type)) utils.error('Expected the name of the e*vent, but got ' + type + ' instead');
            if (this._eventHandlers && this._eventHandlers[type]) {
                return utils.copyObject(this._eventHandlers[type]);
            }
            return [];
        }

        /**
         * Removes all event listeners from the object.
         */
        removeAllListeners () {
            delete this._eventHandlers;
        }

        _setHandlerList () {
            Object.defineProperty(this, '_eventHandlers', { value: {}, configurable: true });
        }

        /**
         * @see sGis.EventHandler#addListener
         */
        on() { this.addListener.apply(this, arguments); }
        /**
         * @see sGis.EventHandler#removeListener
         */
        off() { this.removeListener.apply(this, arguments); }
    }

    function getTypes(string) {
        return string.replace(/\.[A-Za-z0-9_-]+/g, '').match(/[A-Za-z0-9_-]+/g) || [];
    }

    function getNamespaces(/** String */ string) {
        return string.match(/\.[A-Za-z0-9_-]+/g) || [];
    }

    return EventHandler;
    
});

sGis.module('FeatureLayer', [
    'utils',
    'Layer'
], function(utils, Layer) {
    'use strict';

    /**
     * A layer that contains arbitrary set of vector objects 
     * @alias sGis.FeatureLayer
     */
    class FeatureLayer extends Layer {
        /**
         * @param {Object} [properties] - key-value set of properties to be assigned to the instance
         */
        constructor(properties = {}) {
            if (properties.features) {
                var features = properties.features;
                delete properties.features;
            }
            super(properties);

            /**
             * @type {sGis.Feature[]}
             * @private
             */
            this._features = features || [];
        }

        getFeatures(bbox, resolution) {
            if (!this.checkVisibility(resolution)) return [];

            var obj = [];
            this._features.forEach(feature => {
                if (feature.crs.canProjectTo(bbox.crs) && feature.bbox.intersects(bbox)) obj.push(feature);
            });

            return obj;
        }

        /**
         * Adds a feature or an array of features to the layer
         * @param {sGis.Feature|sGis.Feature[]} features - features to add
         * @fires sGis.FeatureLayer#featureAdd - for each feature to be added
         */
        add(features) {
            if (Array.isArray(features)) {
                features.forEach(feature => {
                    this.add(feature);
                });
            } else {
                this._features.push(features);
                this.fire('featureAdd', {feature: features});
                this.redraw();
            }
        }

        /**
         * Removes a feature from the layer
         * @param {sGis.Feature} feature - feature to be removed
         * @throws if the feature is not in the layer
         * @fires sGis.FeatureLayer#featureRemove
         */
        remove(feature) {
            var index = this._features.indexOf(feature);
            if (index === -1) utils.error('The feature does not belong to the layer');
            this._features.splice(index, 1);
            this.fire('featureRemove', {feature: feature});
            this.redraw();
        }

        /**
         * Returns true if the given feature is in the layer
         * @param {sGis.Feature} feature
         * @returns {boolean}
         */
        has(feature) {
            return this._features.indexOf(feature) !== -1;
        }

        /**
         * Moves the given feature to the top of the layer (end of the list). If the feature is not in the layer, the command is ignored
         * @param {sGis.Feature} feature
         */
        moveToTop(feature) {
            var index = this._features.indexOf(feature);
            if (index !== -1) {
                this._features.splice(index, 1);
                this._features.push(feature);
                this.redraw();
            }
        }

        /**
         * List of features in the layer. If assigned, it removes all features and add new ones, firing all the respective events.
         * @type {sGis.Feature[]}
         * @default []
         * @fires sGis.FeatureLayer#featureAdd
         * @fires sGis.FeatureLayer#featureRemove
         */
        get features() { return this._features.slice(); }
        set features(/** sGis.Feature[] */ features) {
            this.prohibitEvent('propertyChange');
            var currFeatures = this.features;
            for (var i = 0; i < currFeatures.length; i++) {
                this.remove(currFeatures[i]);
            }

            this.add(features);
            this.allowEvent('propertyChange');
            
            this.redraw();
        }
    }

    /**
     * @default true
     */
    FeatureLayer.prototype.delayedUpdate = true;

    return FeatureLayer;

    /**
     * A feature has been added to the layer
     * @event sGis.FeatureLayer#featureAdd
     * @type {Object}
     * @mixes sGisEvent
     * @prop {sGis.Feature} feature - feature that is added to the layer
     */

    /**
     * A feature has been removed from the layer
     * @event sGis.FeatureLayer#featureRemove
     * @type {Object}
     * @mixes sGisEvent
     * @prop {sGis.Feature} feature - feature that is removed from the layer
     */

});

sGis.module('geotools', [
    'math',
    'utils',
    'CRS',
    'Point'
], function(math, utils, CRS, Point) {
    'use strict';

    /**
     * @namespace
     * @alias sGis.geotools
     */
    let geotools = {};

    /**
     * Finds distance between two geographical points. If the coordinate system of the points can be projected to the
     * wgs84 crs, the distance will be calculated on a sphere with radius 6,371,009 meters (mean radius of the Earth).
     * @param {sGis.IPoint} a
     * @param {sGis.IPoint} b
     * @returns {Number}
     */
    geotools.distance = function (a, b) {
        let l;
        if (a.crs.canProjectTo(CRS.wgs84)) {
            let p1 = a.projectTo(CRS.wgs84);
            let p2 = b.projectTo(CRS.wgs84);
            let lat1 = math.degToRad(p1.y);
            let lat2 = math.degToRad(p2.y);
            let dLat = lat2 - lat1;
            let dLon = math.degToRad(p2.x - p1.x);

            let d = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon/2) * Math.sin(dLon/2);
            let c = 2 * Math.atan2(Math.sqrt(d), Math.sqrt(1-d));
            let R = 6371009;

            l = R * c;
        } else {
            l = Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
        }

        return l;
    };

    /**
     * Finds geographical length of the polyline or polygon. If the coordinates cannot be projected to wgs84 crs,
     * simple geometrical length will be returned.
     * @param {Position[][]} rings - the set of coordinates
     * @param {sGis.Crs} crs - coordinate system
     * @param {Boolean} [enclose=false] - if set to true, the geometry is treated as polygon, meaning that the result
     *                                    will also include the distance between first and last point of every contour
     * @returns {Number}
     */
    geotools.length = function(rings, crs, enclose = false) {
        let length = 0;
        let ringTemp;

        for (let ring = 0, l = rings.length; ring < l; ring++) {
            ringTemp = [].concat(rings[ring]);
            if (enclose) ringTemp.push(ringTemp[0]);

            for (let i = 0, m = ringTemp.length - 1; i < m; i++) {
                length += geotools.distance(new Point(ringTemp[i], crs), new Point(ringTemp[i + 1], crs));
            }
        }

        return length;
    };

    /**
     * Finds geographical area of the polygon. If the coordinates cannot be projected to wgs84 crs, simple geometrical
     * area will be returned.
     * @param {Position[][]} rings - coordinates of the polygon
     * @param {sGis.Crs} crs - coordinate system
     * @returns {Number}
     */
    geotools.area = function (rings, crs) {
        let projected;
        if (crs.canProjectTo(CRS.cylindricalEqualArea)) {
            projected = geotools.projectRings(rings, crs, CRS.cylindricalEqualArea);
        } else {
            projected = rings;
        }

        let area = 0;
        projected.forEach(ring => area += polygonArea(ring));
        return area;
    };

    /**
     * Projects the set of coordinates from one coordinate system to another.
     * If the coordinates cannot be projected, exception will be thrown.
     * @param {Position[][]} rings - coordinates
     * @param {sGis.Crs} fromCrs - source coordinate system
     * @param {sGis.Crs} toCrs - target coordinate system
     * @returns {Position[][]} - new array with projected coordinates
     */
    geotools.projectRings = function(rings, fromCrs, toCrs) {
        let projection = fromCrs.projectionTo(toCrs);
        let result = [];
        rings.forEach(ring => {
            let projectedRing = [];
            ring.forEach(position => {
                projectedRing.push(projection(position));
            });
            result.push(projectedRing);
        });
        return result;
    };

    geotools.projectPoints = function(ring, fromCrs, toCrs) {
        let projection = fromCrs.projectionTo(toCrs);
        let projectedRing = [];
        ring.forEach(position => {
            projectedRing.push(projection(position));
        });
        return projectedRing;
    };

    function polygonArea(coord) {
        coord = coord.concat([coord[0]]);

        let area = 0;
        for (let i = 0, l = coord.length - 1; i < l; i++) {
            area += (coord[i][0] + coord[i + 1][0]) * (coord[i][1] - coord[i + 1][1]);
        }
        return Math.abs(area / 2);
    }

    /**
     * Returns a point on the line, closest to the given point
     * @param {Position} point
     * @param {Position[]} line - line coordinates in the form [[x1, y1], [x2, y2]]
     * @returns {Position}
     */
    geotools.pointToLineProjection = function (point, line) {
        if (line[0][0] === line[1][0]) {
            return [line[0][0], point[1]];
        } else if (line[0][1] === line[1][1]) {
            return [point[0], line[0][1]];
        } else {
            let lx = line[1][0] - line[0][0];
            let ly = line[1][1] - line[0][1];
            let dx = line[0][0] - point[0];
            let dy = line[0][1] - point[1];
            let t = -(dx * lx + dy * ly) / (lx * lx + ly * ly);
            let x = line[0][0] + t * lx;
            let y = line[0][1] + t * ly;
            return [x, y];
        }
    };

    /**
     * Checks if a point is located inside a polygon.
     * @param {Number[]} polygon - coordinates of polygon in format [[[x11, y11], [x12, y12], ...], [x21, y21], [x22, y22], ...], ...]. If there is only one counter outer array can be omitted.
     * @param {number[]} point - coordinates of the point [x, y]
     * @param {Number} [tolerance=0] - the tolerance of check. If the point is out of the polygon, but is closer then tolerance, the returned result will be true.
     * @returns {boolean|Array} - true, if the point is inside of polygon, [ring, index] - index of vertex if the point is closer then 'tolerance' to one of the sides of polygon, false otherwise
     */
    geotools.contains = function (polygon, point, tolerance) {
        tolerance = tolerance || 0;
        let intersectionCount = 0;

        let polygonCoord = polygon[0][0][0] === undefined ? [polygon] : polygon;
        for (let ring = 0, l = polygonCoord.length; ring < l; ring++) {
            let points = polygonCoord[ring].concat([polygonCoord[ring][0]]);
            let prevD = points[0][0] > point[0];
            let prevH = points[0][1] > point[1];

            for (let i = 1; i < points.length; i++) {
                if (geotools.pointToLineDistance(point, [points[i - 1], points[i]]) <= tolerance) {
                    return [ring, i - 1];
                }

                let D = points[i][0] > point[0];
                let H = points[i][1] > point[1];

                if (H !== prevH //otherwise line does not intersect horizontal line
                    && (D > 0 || prevD > 0) //line is to the left from the point, but we look to the right
                ) {
                    if (!(point[1] === points[i][1] && point[1] === points[i - 1][1])) { //checks if line is horizontal and has same Y with point
                        if (geotools.intersects([[points[i][0], points[i][1]], [points[i - 1][0], points[i - 1][1]]], [point, [Math.max(points[i][0], points[i - 1][0]), point[1]]])) {
                            intersectionCount++;
                        }
                    }
                }
                prevD = D;
                prevH = H;
            }
        }
        return intersectionCount % 2 === 1;
    };

    /**
     * Returns the minimum distance between the given point and line.
     * @param {Position} point
     * @param {Position[]} line - line coordinates in the form [[x1, y1], [x2, y2]]
     * @returns {Number}
     */
    geotools.pointToLineDistance = function (point, line) {
        let lx = line[1][0] - line[0][0];
        let ly = line[1][1] - line[0][1];
        let dx = line[0][0] - point[0];
        let dy = line[0][1] - point[1];
        let t = 0 - (dx * lx + dy * ly) / (lx * lx + ly * ly);

        t = t < 0 ? 0 : t > 1 ? 1 : t;
        return Math.sqrt(Math.pow(lx * t + dx, 2) + Math.pow(ly * t + dy, 2));
    };

    /**
     * Returns true if the given lines have at least one common point.
     * @param {Position[]} line1 - line coordinates in the form [[x1, y1], [x2, y2]]
     * @param {Position[]} line2 - line coordinates in the form [[x1, y1], [x2, y2]]
     * @returns {Boolean}
     */
    geotools.intersects = function (line1, line2) {
        if (line1[0][0] === line1[1][0]) {
            return line1[0][0] > line2[0][0];
        } else {
            let k = (line1[0][1] - line1[1][1]) / (line1[0][0] - line1[1][0]);
            let b = line1[0][1] - k * line1[0][0];
            let x = (line2[0][1] - b) / k;

            return x > line2[0][0];
        }
    };

    /**
     * Returns the angle of line relative to horizon in radians. The value can be from -PI to PI, first point is considered base point for rotation.
     * @param {Position[]} line - line coordinates in the form [[x1, y1], [x2, y2]]
     * @return {Number}
     */
    geotools.getLineAngle = function (line) {
        if (line[0][0] === line[1][0] && line[0][1] === line[1][1]) return NaN;
        let x = line[1][0] - line[0][0];
        let y = line[1][1] - line[0][1];
        let cos = x / Math.sqrt(x * x + y * y);
        return y >= 0 ? Math.acos(cos) : -Math.acos(cos);
    };

    /**
     * Returns a point at the specified distance and angle relative to horizon from origin point
     * @param {Position} point - origin point
     * @param {Number} angle - angle in radians
     * @param {Number} distance - distance
     * @returns {Position}
     */
    geotools.getPointFromAngleAndDistance = function (point, angle, distance) {
        return [point[0] + Math.cos(angle) * distance, point[1] + Math.sin(angle) * distance];
    };

    /**
     * Returns false if polygon has self-intersection, segments of zero length or contours with less then 3 points
     * @param {sGis.feature.Polygon|Position[][]} polygon  - polygon feature or coordinates
     * @returns {Boolean}
     */
    geotools.isPolygonValid = function (polygon) {
        let coordinates = polygon.rings ? polygon.rings : polygon;
        if (coordinates.length === 0) return false;

        for (let ring = 0; ring < coordinates.length; ring++) {
            if (coordinates[ring].length <= 2) return false;

            for (let i = 0; i < coordinates[ring].length; i++) {
                let p1 = coordinates[ring][i];
                let p2 = coordinates[ring][i + 1] || coordinates[ring][0];

                if (p1[0] == p2[0] && p1[1] === p2[1]) return false;

                if (hasIntersection(coordinates, [p1, p2], [ring, i])) return false;
            }
        }

        return true;
    };

    function hasIntersection(coordinates, line, exc) {
        for (let ring = 0; ring < coordinates.length; ring++) {
            for (let i = 0; i < coordinates[ring].length; i++) {
                if (ring === exc[0] && (Math.abs(i - exc[1]) < 2 || exc[1] === 0 && i === coordinates[ring].length - 1 || i === 0 && exc[1] === coordinates[ring].length - 1)) continue;

                if (intersects([coordinates[ring][i], coordinates[ring][i + 1] || coordinates[ring][0]], line)) return true;
            }
        }
        return false;
    }

    function intersects(l1, l2) {
        let o1 = orient(l1[0], l1[1], l2[0]);
        let o2 = orient(l1[0], l1[1], l2[1]);
        let o3 = orient(l2[0], l2[1], l1[0]);
        let o4 = orient(l2[0], l2[1], l1[1]);

        if (o1 !== o2 && o3 !== o4) return true;

        if (o1 === 0 && onSegment(l1[0], l2[0], l1[1])) return true;
        if (o2 === 0 && onSegment(l1[0], l2[1], l1[1])) return true;
        if (o3 === 0 && onSegment(l2[1], l1[0], l2[1])) return true;
        if (o4 === 0 && onSegment(l2[1], l1[1], l2[1])) return true;

        return false;
    }

    function orient(p, q, r) {
        let val = (q[1] - p[1]) * (r[0] - q[0]) - (q[0] - p[0]) * (r[1] - q[1]);
        if (Math.abs(val) < 0.000001) return 0;
        return val > 0 ? 1 : 2;
    }

    function onSegment(p, q, r) {
        return (q[0] <= Math.max(p[0], r[0]) && q[0] >= Math.min(p[0], r[0])) &&
            (q[1] <= Math.max(p[1], r[1]) && q[1] >= Math.min(p[1], r[1]));
    }

    /**
     * Applies matrix transformation on each feature in the set
     * @param {sGis.Feature[]} features
     * @param {Number[][]} matrix - transformation matrix
     * @param {IPoint|Position} center - the center of transformation
     * @param {sGis.Crs} [mapCrs] - coordinate system of transformation. If not specified, transformation will be preformed
     * on the coordinates as is. This will result in errors with any non-cartesian coordinates (like lat/lon).
     */
    geotools.transform = function(features, matrix, center, mapCrs = null) {
        if (Array.isArray(features)) {
            features.forEach(feature => transformFeature(feature, matrix, center, mapCrs));
        } else {
            transformFeature(features, matrix, center, mapCrs);
        }
    };

    /**
     * Rotates the features around given point
     * @param {sGis.Feature[]} features
     * @param {Number} angle - rotation angle in radians. Positive values stand for counterclockwise rotation.
     * @param {IPoint|Position} center - rotation center
     * @param {sGis.Crs} [mapCrs] - coordinate system of transformation. If not specified, transformation will be preformed
     * on the coordinates as is. This will result in errors with any non-cartesian coordinates (like lat/lon).
     */
    geotools.rotate = function(features, angle, center, mapCrs = null) {
        let sin = Math.sin(angle);
        let cos = Math.cos(angle);

        geotools.transform(features, [[cos, sin, 0], [-sin, cos, 0], [0, 0, 1]], center, mapCrs);
    };

    /**
     * Scales the features
     * @param {sGis.Feature[]} features
     * @param {Number} scale - the magnitude of scaling. E.g. value of 2 means that the size of features will be increased 2 times.
     * @param {Position} center - center of scaling
     * @param {sGis.Crs} [mapCrs] - coordinate system of transformation. If not specified, transformation will be preformed
     * on the coordinates as is. This will result in errors with any non-cartesian coordinates (like lat/lon).
     */
    geotools.scale = function(features, scale, center, mapCrs = null) {
        geotools.transform(features, [[scale[0], 0, 0], [0, scale[1], 0], [0, 0, 1]], center, mapCrs);
    };

    /**
     * Moves the features
     * @param {sGis.Feature[]} features
     * @param {Number[]} translate - moving values in form [dx, dy]
     * @param {sGis.Crs} [mapCrs] - coordinate system of transformation. If not specified, transformation will be preformed
     * on the coordinates as is. This will result in errors with any non-cartesian coordinates (like lat/lon).
     */
    geotools.move = function(features, translate, mapCrs = null) {
        geotools.transform(features, [[1, 0 ,0], [0, 1, 1], [translate[0], translate[1], 1]], [0, 0], mapCrs);
    };
    
    function transformFeature(feature, matrix, center, mapCrs = null) {
        let targetCrs = mapCrs || feature.crs;
        let base = center.crs ? center.projectTo(targetCrs).position : center;

        if (feature.rings) {
            let rings = feature.rings;
            if (targetCrs !== feature.crs) {
                rings = geotools.projectRings(rings, feature.crs, targetCrs);
            }
            transformRings(rings, matrix, base);

            if (targetCrs !== feature.crs) {
                rings = geotools.projectRings(rings, targetCrs, feature.crs);
            }

            feature.rings = rings;
        } else if (feature.points) {
            let points = feature.points;
            if (targetCrs !== feature.crs) {
                points = geotools.projectRings(points, feature.crs, targetCrs);
            }
            points = transformRing(points, matrix, base);

            if (targetCrs !== feature.crs) {
                points = geotools.projectRings(points, targetCrs, feature.crs);
            }
            feature.points = points;
        } else if (feature.position) {
            let points = [feature.position];
            if (targetCrs !== feature.crs) {
                points = geotools.projectRings(points, feature.crs, targetCrs);
            }
            points = transformRing(points, matrix, base);

            if (targetCrs !== feature.crs) {
                points = geotools.projectRings(points, targetCrs, feature.crs);
            }
            feature.position = points[0];
        }
    }
    
    function transformRings(rings, matrix, base) {
        rings.forEach((ring, index) => {
            rings[index] = transformRing(ring, matrix, base);
        });
    }
    
    function transformRing(ring, matrix, base) {
        math.extendCoordinates(ring, base);
        let transformed = math.multiplyMatrix(ring, matrix);
        math.collapseCoordinates(transformed, base);
        return transformed;
    }
    
    return geotools;
});

sGis.module('init', [
    'sGis',
    'Map',
    'painter.DomPainter'
], (sGis, Map, Painter) => {

    'use strict';

    function init({ position, resolution, crs, layers, wrapper, plugins = []}) {
        let map = new Map({crs, position, resolution, layers});
        let painter = new Painter(map, {wrapper});


        plugins = plugins.map(pluginDefinition => {
            let name = pluginDefinition.name;
            if (!sGis.plugins || !sGis.plugins[name]) {
                throw new Error(`Plugin ${name} is not available.`);
            }

            return new sGis.plugins[name](map, painter, pluginDefinition.properties);
        });

        return { map, painter, plugins };
    }

    return init;

});
sGis.module('Layer', [
    'utils',
    'EventHandler'
], function(utils, EventHandler) {
    'use strict';

    var defaults = {
        _isDisplayed: true,
        _opacity: 1.0,
        _resolutionLimits: [-1, -1]
    };

    /**
     * Base class for all map layers.
     * @alias sGis.Layer
     * @extends sGis.EventHandler
     */
    class Layer extends EventHandler {
        /**
         * @constructor
         * @param {Object} [properties] - key-value list of the properties to be assigned to the instance
         */
        constructor(properties) {
            super();
            utils.init(this, properties);
        }
        
        /**
         * Returns the array of features to be drawn for given parameters.
         * @param {sGis.Bbox} bbox - bounding box of the area to get features from
         * @param {Number} resolution - current resolution 
         * @returns {sGis.Feature[]}
         */
        getFeatures(bbox, resolution) {
            return [];
        }
        
        /**
         * Whether the layer is drawn to map
         * @type Boolean
         * @default true
         * @fires sGis.Layer#propertyChange
         */
        get isDisplayed() { return this._isDisplayed; }
        set isDisplayed(/** Boolean */ bool) {
            this._isDisplayed = bool;
            //this.fire('propertyChange', {property: 'display'});
            this.fire('visibilityChange');
        }

        /**
         * Return true if the layer is displayed and the resolution is inside the limits
         * @param resolution
         * @returns {Boolean|*|boolean}
         */
        checkVisibility(resolution) {
            return this._isDisplayed && (this.resolutionLimits[0] < 0 || resolution >= this.resolutionLimits[0]) && (this.resolutionLimits[1] < 0 || resolution <= this.resolutionLimits[1]);
        }

        /**
         * Makes the layer visible
         * @fires sGis.Layer#propertyChange
         */
        show() {
            this.isDisplayed = true;
        }

        /**
         * Makes the layer invisible
         * @fires sGis.Layer#propertyChange
         */
        hide() {
            this.isDisplayed = false;
        }

        /**
         * Opacity of the layer. It sets the opacity of all objects in this layer. Valid values: [0..1].
         * @type Number
         * @default 1
         * @fires sGis.Layer#propertyChange
         */
        get opacity() { return this.getOpacity(); }
        set opacity(/** Number */ opacity) { this.setOpacity(opacity); }
        
        getOpacity() { return this._opacity; }
        setOpacity(opacity) {
            opacity = opacity < 0 ? 0 : opacity > 1 ? 1 : opacity;
            this._opacity = opacity;
            this.fire('propertyChange', {property: 'opacity'});
        }

        /**
         * Min and max resolution between which the layer will be displayed. Must be in [min, max] format. Negative values are treated as no limit.
         * @type Number[]
         * @default [-1, -1]
         * @fires sGis.Layer#propertyChange
         * @fires sGis.Layer#propertyChange
         */
        get resolutionLimits() { return this._resolutionLimits; }
        set resolutionLimits(/** Number[] */ limits) {
            this._resolutionLimits = limits;
            this.fire('propertyChange', {property: 'resolutionLimits'});
        }

        /**
         * Forces redrawing of the layer
         * @fires sGis.Layer#propertyChange
         */
        redraw() {
            this.fire('propertyChange', {property: 'content'});
        }
    }

    /**
     * If set to true, the layer will be updated only after map position change has ended (e.g. pan or zoom end). If set to true, the layer will be redrawn on every change.
     * @member {Boolean} delayedUpdate
     * @memberof sGis.Layer
     * @instance
     * @default false
     */
    Layer.prototype.delayedUpdate = false;

    /**
     * If set to true, the layer rendering will not be updated (though the feature lists will be requested as needed). This is intended for lazy object update without "jumping" effect.
     * @type {boolean}
     */
    Layer.prototype.updateProhibited = false;

    utils.extend(Layer.prototype, defaults);

    return Layer;

    /**
     * A property of the layer has changed. Fired when redrawing is required.
     * @event sGis.Layer#propertyChange
     * @type {Object}
     * @mixes sGisEvent
     * @prop {String} property - the name of the property that has been changed
     */

    /**
     * @typedef {function(Object)} sGis.Layer.constructor
     * @returns sGis.Layer
     */
});

sGis.module('LayerGroup', [
    'utils',
    'EventHandler'
], function(utils, EventHandler) {

    'use strict';

    /**
     * Ordered list of layers and nested layer groups.
     * @alias sGis.LayerGroup
     * @extends sGis.EventHandler
     */
    class LayerGroup extends EventHandler {
        /**
         * @param {sGis.Layer[]} [layers=[]] - initial list of layers in the group
         */
        constructor (layers = []) {
            super();
            this._layers = [];
            this._forwardEvent = (sGisEvent) => { this.fire(sGisEvent.eventType, sGisEvent); };
            this._fireContentChange = () => { this.fire('contentsChange'); };

            this.layers = layers || [];
        }

        /**
         * Adds a layer to the end of the list
         * @param {sGis.Layer|sGis.LayerGroup} layer - layer to add
         * @fires sGis.LayerGroup#layerAdd
         * @fires sGis.LayerGroup#contentsChange
         * @throws if the layer is already in the group, or in any of the child groups
         */
        addLayer (layer) {
            if (layer === this) utils.error('Cannot add self to the group');
            if (this.getLayers(true).indexOf(layer) !== -1) {
                utils.error('Cannot add layer to the group: the layer is already in the group');
            }

            this._layers.push(layer);
            this._setChildListeners(layer);

            if (layer instanceof LayerGroup) {
                this._setForwardListeners(layer);
            }

            this.fire('layerAdd', {layer: layer});
            this.fire('contentsChange');
        }

        /**
         * Removes the layer from the group
         * @param {sGis.Layer|sGis.LayerGroup} layer - layer to remove
         * @param {Boolean} [recurse=false] - remove the layer from the child groups
         * @fires sGis.LayerGroup#layerRemove
         * @fires sGis.LayerGroup#contentsChange
         * @throws if the layer not in the group
         */
        removeLayer (layer, recurse) {
            var index = this._layers.indexOf(layer);
            if (index !== -1) {
                this._layers.splice(index, 1);
                this._removeChildListeners(layer);
                if (layer instanceof LayerGroup) {
                    this._removeForwardListeners(layer);
                }
                this.fire('layerRemove', {layer: layer});
                this.fire('contentsChange');
                return;
            } else if (recurse) {
                for (var i = 0, l = this._layers.length; i < l; i++) {
                    if (this._layers[i] instanceof LayerGroup && this._layers[i].contains(layer)) {
                        this._layers[i].removeLayer(layer, true);
                        return;
                    }
                }
            }
    
            utils.error('The layer is not in the group');
        }

        _setChildListeners(layer) {
            layer.on('visibilityChange', this._fireContentChange);
        }

        _removeChildListeners(layer) {
            layer.off('visibilityChange', this._fireContentChange);
        }

        _setForwardListeners (layerGroup) {
            layerGroup.on('layerAdd layerRemove layerOrderChange contentsChange', this._forwardEvent);
        }

        _removeForwardListeners (layerGroup) {
            layerGroup.off('layerAdd layerRemove layerOrderChange contentsChange', this._forwardEvent);
        }

        /**
         * Returns true if the group or any of the child groups (recursively) contains the given layer
         * @param {sGis.Layer|sGis.LayerGroup} layer
         * @returns {boolean}
         */
        contains (layer) {
            for (var i = 0, l = this._layers.length; i < l; i++) {
                if (this._layers[i] instanceof LayerGroup && this._layers[i].contains(layer) || this._layers[i] === layer) {
                    return true;
                }
            }
            return false;
        }

        /**
         * Returns index of a layer in the group
         * @param {sGis.Layer|sGis.LayerGroup} layer
         * @returns {number}
         */
        indexOf (layer) {
            return this._layers.indexOf(layer);
        }

        /**
         * Inserts the layer to the given position. If the layer is already in the group, moves the layer so that new index of the layer equals the specified index.
         * If the index is negative, layer is added to the beginning of the list. If the index is larger than number of the layers in the group, layer will be added to the end of the list.
         * @param {sGis.Layer|sGis.LayerGroup} layer - layer to insert
         * @param {Number} index - integer position of the layer after insertion
         * @fires sGis.LayerGroup#layerAdd
         * @fires sGis.LayerGroup#layerOrderChange
         * @fires sGis.LayerGroup#contentsChange
         * @throws if the given layer cannot be added to the group
         */
        insertLayer (layer, index) {
            var currIndex = this._layers.indexOf(layer);
    
            if (currIndex === -1) {
                this.prohibitEvent('layerAdd');
                this.addLayer(layer);
                this.allowEvent('layerAdd');
                currIndex = this._layers.length - 1;
                var added = true;
            }
    
            var length = this._layers.length;
            index = index > length ? length : index < 0 && index < -length ? -length : index;
            if (index < 0) index = length + index;
    
            this._layers.splice(currIndex, 1);
            this._layers.splice(index, 0, layer);
            var event = added ? 'layerAdd' : 'layerOrderChange';
            this.fire(event, {layer: layer});
            this.fire('contentsChange');

        }
        
        moveLayerToTop(layer) {
            this.insertLayer(layer, -1);
        }

        /**
         * Returns the list of the layers in the group without child LayerGroup's
         * @param {Boolean} [recurse=false] - weather to include layers from the child groups
         * @param {Boolean} [excludeInactive=false] - if set to true, layers with isDisplayed=false and all their children will not be included
         * @returns {sGis.Layer[]} - ordered list of the layers
         */
        getLayers(recurse, excludeInactive) {
            let layers = [];
            this._layers.forEach(layer => {
                if (excludeInactive && !layer.isDisplayed) return;

                if (recurse && layer instanceof LayerGroup) {
                    layers = layers.concat(layer.getLayers(recurse, excludeInactive));
                } else {
                    layers.push(layer);
                }
            });
            return layers;
        }

        /**
         * The list of the layers and child groups in the group. If assigned, all the layers will be removed from the group, and then new layers will be added (firing all the events).
         * @type Array<sGis.Layer|sGis.LayerGroup>
         * @default []
         */
        get layers() { return [].concat(this._layers); }
        set layers(/** Array<sGis.Layer|sGis.LayerGroup> */ layers) {
            var list = this.layers;
            for (var i = 0; i < list.length; i++) {
                this.removeLayer(list[i]);
            }

            for (i = 0; i < layers.length; i++) {
                this.addLayer(layers[i]);
            }
        }

        get isDisplayed() { return this._isDisplayed; }
        set isDisplayed(bool) {
            if (this._isDisplayed !== bool) {
                this._isDisplayed = bool;
                this.fire('visibilityChange');
            }
        }

        show() { this.isDisplayed = true; }
        hide() { this.isDisplayed = false; }
    }

    LayerGroup.prototype.isDisplayed = true;

    return LayerGroup;

    /**
     * A layer is added to the group, or to any of the child groups (recursive)
     * @event sGis.LayerGroup#layerAdd
     * @mixes sGisEvent
     * @type {Object}
     * @property {sGis.Layer} layer - added layer
     */

    /**
     * A layer is removed from the group, or from any of the child groups (recursive)
     * @event sGis.LayerGroup#layerRemove
     * @mixes sGisEvent
     * @type {Object}
     * @property {sGis.Layer} layer - removed layer
     */

    /**
     * Position of one of the layers in the group is changed
     * @event sGis.LayerGroup#layerOrderChange
     * @mixes sGisEvent
     * @type {Object}
     * @property {sGis.Layer} layer - the layer that was moved
     */

    /**
     * One of the child layers (recursive) is added, removed, moved to other index or changed isDisplayed property
     * @event sGis.LayerGroup#contentsChange
     * @mixes sGisEvent
     * @type {Object}
     */
});

sGis.module('Map', [
    'utils',
    'CRS',
    'Point',
    'Bbox',
    'LayerGroup',
    'TileScheme'
], function(utils, CRS, Point, Bbox, LayerGroup, TileScheme) {
    'use strict';

    /**
     * Map object with set of layers, specified position, resolution, coordinate system.
     * @alias sGis.Map
     * @extends sGis.LayerGroup
     */
    class Map extends LayerGroup {
        /**
         * @constructor
         * @param {Object} [properties] - key-value set of properties to be set to the instance
         */
        constructor(properties = {}) {
            super();
            if (properties.crs) this.crs = properties.crs;
            this.position = properties.position || [this.position[0], this.position[1]];
            utils.extend(this, properties, true);

            this._listenForBboxChange();
        }

        _listenForBboxChange () {
            this.on('bboxChange', () => {
                if (this._changeTimer) clearTimeout(this._changeTimer);
                this._changeTimer = setTimeout(() => {
                    this._changeTimer = null;
                    this.fire('bboxChangeEnd');
                }, this.changeEndDelay);
            });
        }

        /**
         * Moves the map position by the specified offset
         * @param {Number} dx - Offset along X axis in map coordinates, positive direction is right
         * @param {Number} dy - Offset along Y axis in map coordinates, positive direction is down
         */
        move (dx, dy) {
            this._position[0] += dx;
            this._position[1] += dy;
            this.fire('bboxChange');
        }

        /**
         * Changes the scale of map by scalingK
         * @param {Number} scalingK - Coefficient of scaling (Ex. 5 -> 5 times zoom in)
         * @param {sGis.Point} [basePoint] - Base point of zooming
         * @param {Boolean} [doNotAdjust=false] - do not adjust resolution to the round ones
         */
        changeScale (scalingK, basePoint, doNotAdjust) {
            let resolution = this.resolution;
            this.setResolution(resolution * scalingK, basePoint, doNotAdjust);
        }

        /**
         * Changes the scale of map by scalingK with animation
         * @param {float} scalingK - Coefficient of scaling (Ex. 5 -> 5 times zoom in)
         * @param {sGis.Point} [basePoint] - Base point of zooming
         */
        animateChangeScale (scalingK, basePoint) {
            this.animateSetResolution(this.resolution * scalingK, basePoint);
        }

        /**
         * Changes resolution of the map by k zoom levels. Positive values represent zoom in.
         * @param {Number} k - number of levels to zoom
         * @param {sGis.Point} [basePoint] - zooming base point
         */
        zoom (k, basePoint) {
            let tileScheme = this.tileScheme;
            let currResolution = this._animationTarget ? this._animationTarget[1] : this.resolution;

            let resolution;
            if (tileScheme) {
                let level = tileScheme.getLevel(currResolution) + (k > 0 ? -1 : 1);
                resolution = tileScheme.levels[level] ? tileScheme.levels[level].resolution : currResolution;
            } else {
                resolution = currResolution * Math.pow(2, -k);
            }

            resolution = Math.min(Math.max(resolution, this.minResolution || 0), this.maxResolution || Number.MAX_VALUE);
            this.animateSetResolution(resolution, basePoint);
        }

        /**
         * Changes resolution of the map so that the new resolution corresponds to an even tile scheme level. Resolution is changed with animation.
         * @param {Boolean} [direction=false] - if false will adjust to smaller resolution, if true - to larger
         */
        adjustResolution (direction = false) {
            let resolution = this.resolution;
            let newResolution = this.getAdjustedResolution(resolution, direction);
            let ratio = newResolution / resolution;
            if (ratio > 1.1 || ratio < 0.9) {
                this.animateSetResolution(newResolution);
            } else if (ratio > 1.0001 || ratio < 0.9999) {
                this.setResolution(newResolution);
            }
        }

        /**
         * Returns closest resolution to the given one that corresponds to an even tile scheme level.
         * @param {Number} resolution - target resolution
         * @param {Boolean} [direction=false] - if false will adjust to smaller resolution, if true - to larger
         * @returns {Number}
         */
        getAdjustedResolution (resolution, direction = false) {
            if (!this.tileScheme) return resolution;
            return this.tileScheme.getAdjustedResolution(resolution, direction);
        }

        /**
         * Sets new resolution to the map with animation
         * @param {Number} resolution
         * @param {sGis.Point} [basePoint] - Base point of zooming
         * @returns {undefined}
         */
        animateSetResolution (resolution, basePoint) {
            let adjustedResolution = this.getAdjustedResolution(resolution);
            let newPosition = this._getScaledPosition(adjustedResolution, basePoint);
            this.animateTo(newPosition, adjustedResolution);
        }

        /**
         * Changes position and resolution of the map with animation
         * @param {sGis.IPoint} point - target center point of the map
         * @param {Number} resolution - target resolution;
         */
        animateTo (point, resolution) {
            this.stopAnimation();

            this.fire('animationStart');
            let originalPosition = this.centerPoint;
            let originalResolution = this.resolution;
            let dx = point.x - originalPosition.x;
            let dy = point.y - originalPosition.y;
            let dr = resolution - originalResolution;
            let startTime = Date.now();
            this._animationStopped = false;
            this._animationTarget = [point, resolution];

            let self = this;
            this.animationTimer = setInterval(function() {
                let time = Date.now() - startTime;
                if (time >= self.animationTime || self._animationStopped) {
                    self.setPosition(point, resolution);
                    self.stopAnimation();
                    self.fire('animationEnd');
                } else {
                    let x = self._easeFunction(time, originalPosition.x, dx, self.animationTime);
                    let y = self._easeFunction(time, originalPosition.y, dy, self.animationTime);
                    let r = self._easeFunction(time, originalResolution, dr, self.animationTime);
                    self.setPosition(new Point([x, y], self.crs), r);
                }
            }, 1000 / 60);
        }

        _getScaledPosition (newResolution, basePoint) {
            let position = this.centerPoint;
            basePoint = basePoint ? basePoint.projectTo(this.crs) : position;
            let resolution = this.resolution;
            let scalingK = newResolution / resolution;
            return new Point([(position.x - basePoint.x) * scalingK + basePoint.x, (position.y - basePoint.y) * scalingK + basePoint.y], position.crs);
        }

        /**
         * Stops all animations of the map
         */
        stopAnimation () {
            this._animationStopped = true;
            this._animationTarget = null;
            clearInterval(this.animationTimer);
        }

        _easeFunction (t, b, c, d) {
            return b + c * t / d;
        }

        /**
         * Sets new position and resolution to the map
         * @param {sGis.Point} point - new center point of the map
         * @param {Number} resolution - new resolution of the map
         */
        setPosition (point, resolution) {
            this.prohibitEvent('bboxChange');
            this.centerPoint = point;
            if (resolution) this.resolution = resolution;
            this.allowEvent('bboxChange');
            this.fire('bboxChange');
        }

        /**
         * Sets new resolution to the map
         * @param {Number} resolution
         * @param {sGis.Point} [basePoint] - Base point of zooming
         * @param {Boolean} [doNotAdjust=false] - do not adjust resolution to the round ones
         */
        setResolution (resolution, basePoint, doNotAdjust) {
            this.setPosition(this._getScaledPosition(resolution, basePoint), doNotAdjust ? resolution : this.getAdjustedResolution(resolution));
        }

        /**
         * Geographical position of the center of the map given in map coordinate system
         * @type {Position}
         */
        get position() { return this._position; }
        set position(/** Position */ position) {
            this._position = position;
            this.fire('bboxChange');
        }

        /**
         * Center point of the map
         * @type {sGis.Point}
         */
        get centerPoint() { return new Point(this.position, this.crs); }
        set centerPoint(/** sGis.Point */ point) {
            this.position = point.projectTo(this.crs).position;
        }

        /**
         * Coordinate system of the map. If the value is set and old crs cannot be projected to the new one, position of the map is set to [0, 0].
         * Otherwise position is projected to the new crs.
         * @type {sGis.Crs}
         */
        get crs() { return this._crs; }
        set crs(/** sGis.Crs */ crs) {
            let projection = this._crs.projectionTo(crs);
            this._crs = crs;
            if (projection) {
                this.position = projection(this.position);
            } else {
                this.position = [0, 0];
            }
        }

        /**
         * Resolution of the map. Can be any positive number.
         * @type {Number}
         */
        get resolution() { return this._resolution; }
        set resolution(/** Number */ resolution) {
            this._resolution = resolution;
            this.fire('bboxChange');
        }

        /**
         * Minimum allowed resolution of the map. If not set, the minimum value from the map tile scheme will be used. Must be smaller then max resolution.
         * If current resolution is smaller that the newly assigned minResolution, the current resolution will be adjusted accordingly.
         * @type {Number}
         */
        get minResolution() { return this._minResolution || this.tileScheme && this.tileScheme.minResolution; }
        set minResolution(/** Number */ resolution) {
            if (resolution !== null) {
                let maxResolution = this.maxResolution;
                if (resolution > maxResolution) utils.error('maxResolution cannot be less then minResolution');
            }
            this._minResolution = resolution;
            if (this.resolution < this.minResolution) this.resolution = resolution;
        }

        /**
         * Maximum allowed resolution of the map. If not set, the maximum value from the map tile scheme will be used. Must be larger then min resolution.
         * If current resolution is larger that the newly assigned maxResolution, the current resolution will be adjusted accordingly.
         * @type {Number}
         */
        get maxResolution() { return this._maxResolution || this.tileScheme && this.tileScheme.maxResolution; }
        set maxResolution(/** Number */ resolution) {
            if (resolution !== null) {
                let minResolution = this.minResolution;
                if (resolution < minResolution) utils.error('maxResolution cannot be less then minResolution');
            }
            this._maxResolution = resolution;
            if (this.resolution > this.maxResolution) this.resolution = resolution;
        }
    }

    Object.assign(Map.prototype, {
        _crs: CRS.webMercator,
        _position: new Point([55.755831, 37.617673]).projectTo(CRS.webMercator).position,
        _resolution: 611.4962262812505 / 2,

        /**
         * Tile scheme of the map
         * @member {sGis.TileScheme} sGis.Map.tileScheme
         * @default TileScheme.default
         */
        tileScheme: TileScheme.default,

        /**
         * Length of the map animations in milliseconds. Set higher values for slower animations.
         * @member {Number} sGis.Map.animationTime
         * @default 300
         */
        animationTime: 300,

        /**
         * Delay value before bboxChangeEnd event is fired.
         * @member {Number} sGis.Map.changeEndDelay
         * @default 300
         */
        changeEndDelay: 300
    });

    return Map;

});

sGis.module('Point', [
    'utils',
    'CRS'
], function(/**sGis.utils*/ utils, /**sGis.CRS*/ CRS) {
    'use strict';

    var defaults = {
        position: [0,0],
        
        /**
         * Coordinate system of the point
         * @type sGis.Crs
         * @memberof sGis.Point
         * @internal
         */
        _crs: CRS.geo
    };
    
    /**
     * Simple geographical point
     * @class
     * @alias sGis.Point
     * @implements sGis.IPoint
     */
    class Point {
        /**
         * @constructor
         * @param position
         * @param {sGis.Crs} [crs=sGis.CRS.geo]
         */
        constructor(position, crs) {
            if (crs !== undefined) this._crs = crs;
            this.position = position;
        }

        /**
         * Returns a new point with same position in new crs
         * @param {sGis.Crs} newCrs - target coordinate system
         * @returns {sGis.Point}
         * @throws Cannot project to specified crs.
         */
        projectTo(newCrs) {
            var projection = this.crs.projectionTo(newCrs);
            if (projection === null) utils.error("Cannot project point to crs: " + newCrs.stringDescription);

            return new Point(projection(this.position), newCrs);
        }
        
        get position() { return [].concat(this._position); }
        set position(position) { this._position = position; }

        /**
         * Returns a copy of the point
         * @returns {sGis.Point}
         */
        clone() {
            return new Point(this.position, this.crs);
        }
        
        get point() { return this.clone(); }
        set point(point) { this.position = point.projectTo(this.crs).position; }
        
        get x() { return this._position[0]; }
        set x(x) { this._position[0] = x; }
        
        get y() { return this._position[1]; }
        set y(y) { this._position[1] = y; }

        /**
         * Coordinate system of the point
         * @type sGis.Crs
         */
        get crs() { return this._crs; }

        /**
         * Returns true if the target point has the same position and crs as the current one
         * @param {sGis.Point} point - target point for comparison
         * @returns {boolean}
         */
        equals(point) {
            return utils.softEquals(point.x, this.x) && utils.softEquals(point.y, this.y) && point.crs.equals(this.crs);
        }

        get coordinates() { return this.position.slice(); }
        set coordinates(position) { this.position = position.slice(); }
    }

    utils.extend(Point.prototype, defaults);

    /**
     * @typedef {function(Number, Number, {sGis.Crs})} sGis.Point.constructor
     * @returns sGis.Point
     */
    
    return Point;
});
sGis.module('TileLayer', [
    'utils',
    'TileScheme',
    'Layer',
    'Point',
    'Bbox',
    'feature.Image',
    'CRS',
    'symbol.image.Image'
], function(utils, TileScheme, Layer, Point, Bbox, ImageF, CRS, ImageSymbol) {
    'use strict';

    var defaults = {
        /**
         * Layer's tile scheme.
         * @type sGis.TileScheme
         * @memberof sGis.TileLayer
         * @default sGis.TileScheme.default
         */
        tileScheme: TileScheme.default,
        /**
         * Layer's coordinate system.
         * @type sGis.Crs
         * @memberof sGis.TileLayer.
         * @default sGis.CRS.webMercator
         */
        crs: CRS.webMercator,
        /**
         * Whether to repeat the tiles along x axis. Creates the effect of continuous map when sliding horizontally.
         * @type boolean
         * @memberof sGis.TileLayer
         * @default
         */
        cycleX: true,
        /**
         * Whether to repeat the tiles along y axis. Creates the effect of continuous map when sliding vertically.
         * @type boolean
         * @memberof sGis.TileLayer
         * @default
         */
        cycleY: false,
        /**
         * If this value is grater then 0, the tiles will appear with css opacity transition effect. Specified in milliseconds.
         * @type number
         * @memberof sGis.TileLayer
         * @default
         */
        _transitionTime: 200,
        _cacheSize: 256
    };

    /**
     * @alias sGis.TileLayer
     * @extends sGis.Layer
     */
    class TileLayer extends Layer {
        /**
         * @constructor
         * @param {String} tileSource - Url of the source for tiles in format http(s)://...../..{x}..{y}..{z} - where x an y are indexes of tiles for the scale level z
         * @param {Object} [options] - Set of properties to override
         */
        constructor(tileSource, options) {
            super(options);
            this._updateSymbol();

            this._source = tileSource;
            this._tiles = {};
        }

        /**
         * Returns url of a tile
         * @param {Number} xIndex - Index of tile along x axis
         * @param {Number} yIndex - Index of tile along y axis
         * @param {Number} scale - Scale level of the tile
         * @returns {string}
         */
        getTileUrl(xIndex, yIndex, scale) {
            var url = this._source;
            return url.replace('{x}', xIndex).replace('{y}', yIndex).replace('{z}', scale);
        }

        getFeatures(bbox, resolution) {
            let ownCrs = this.crs || bbox.crs;
            if (!ownCrs.canProjectTo(bbox.crs)) return [];
            if (!this.checkVisibility(resolution)) return [];

            let level = this.tileScheme.getLevel(resolution);
            if (level < 0) return [];

            bbox = bbox.projectTo(ownCrs);
            let trimmedBbox = this._getTrimmedBbox(bbox);
            if (trimmedBbox.width === 0 || trimmedBbox.height === 0) return [];

            let layerResolution = this.tileScheme.levels[level].resolution;
            if (layerResolution * 2 < resolution) return [];
            
            let xStartIndex = Math.floor((trimmedBbox.xMin - this.tileScheme.origin[0]) / this.tileWidth / layerResolution);
            let xEndIndex = Math.ceil((trimmedBbox.xMax - this.tileScheme.origin[0]) / this.tileWidth / layerResolution);

            let yStartIndex, yEndIndex;
            if (this.tileScheme.reversedY) {
                yStartIndex = Math.floor((trimmedBbox.yMin - this.tileScheme.origin[0]) / this.tileHeight / layerResolution);
                yEndIndex = Math.ceil((trimmedBbox.yMax - this.tileScheme.origin[0]) / this.tileHeight / layerResolution);
            } else {
                yStartIndex = Math.floor((this.tileScheme.origin[1] - trimmedBbox.yMax) / this.tileHeight / layerResolution);
                yEndIndex = Math.ceil((this.tileScheme.origin[1] - trimmedBbox.yMin) / this.tileHeight / layerResolution);
            }

            let tiles = this._tiles;
            let features = [];
            for (var xIndex = xStartIndex; xIndex < xEndIndex; xIndex++) {
                var xIndexAdj = this.cycleX ? this._getAdjustedIndex(xIndex, level) : xIndex;

                for (var yIndex = yStartIndex; yIndex < yEndIndex; yIndex++) {
                    var yIndexAdj = this.cycleY ? this._getAdjustedIndex(yIndex, level) : yIndex;
                    var tileId = TileLayer.getTileId(this.tileScheme.levels[level].zIndex, xIndex, yIndex);

                    if (!tiles[tileId]) {
                        var imageBbox = this._getTileBbox(level, xIndex, yIndex);
                        var tileUrl = this.getTileUrl(xIndexAdj, yIndexAdj, this.tileScheme.levels[level].zIndex);
                        tiles[tileId] = new ImageF(imageBbox, { src: tileUrl, symbol: this._symbol, crs: this.crs });
                    }

                    features.push(tiles[tileId]);
                }
            }

            this._cutCache();
            return features;
        }

        _getTileBbox(level, xIndex, yIndex) {
            let resolution = this.tileScheme.levels[level].resolution;

            let minY = this.tileScheme.reversedY ? yIndex * this.tileHeight * resolution + this.tileScheme.origin[1] : -(yIndex + 1) * this.tileHeight * resolution + this.tileScheme.origin[1];
            let startPoint = new Point([xIndex * this.tileWidth * resolution + this.tileScheme.origin[0], minY], this.crs);

            let maxY = this.tileScheme.reversedY ? (yIndex + 1) * this.tileHeight * resolution + this.tileScheme.origin[1] : -yIndex * this.tileHeight * resolution + this.tileScheme.origin[1];
            let endPoint = new Point([(xIndex + 1) * this.tileWidth * resolution + this.tileScheme.origin[0], maxY], this.crs);

            return new Bbox(startPoint.position, endPoint.position, this.crs);
        }

        static getTileId(level, xIndex, yIndex) {
            return [level, xIndex, yIndex].join(',');
        }

        _getAdjustedIndex(index, level) {
            var desc = this.tileScheme.levels[level];
            if (!desc.indexCount || desc.indexCount <= 0 || (index >= 0 && index < desc.indexCount)) return index;
            while (index < 0) index += desc.indexCount;
            return index % desc.indexCount;
        }

        _cutCache() {
            var keys = Object.keys(this._tiles);
            if (keys.length > this._cacheSize) {
                var forDeletion = keys.slice(0, keys.length - this._cacheSize);
                forDeletion.forEach((key) => {
                    delete this._tiles[key];
                });
            }
        }

        /**
         * Width of the tiles in px
         * @type {number}
         */
        get tileWidth() { return this.tileScheme.tileWidth; }

        /**
         * Height of the tiles in px
         * @type {number}
         */
        get tileHeight() { return this.tileScheme.tileHeight; }

        get opacity() { return this._opacity; }
        set opacity(opacity) {
            opacity = opacity < 0 ? 0 : opacity > 1 ? 1 : opacity;
            this._opacity = opacity;
            this._symbol.opacity = opacity;

            this._updateFeatures();

            this.fire('propertyChange', {property: 'opacity'});
        }

        _updateSymbol() {
            this._symbol = new ImageSymbol({opacity: this.opacity, transitionTime: this.transitionTime})
        }

        /**
         * Time of fade in animation for the tiles
         * @type {Number}
         * @default 200
         */
        get transitionTime() { return this._transitionTime; }
        set transitionTime(/** Number */ time) {
            this._transitionTime = this._symbol.transitionTime = time;
            this._updateFeatures();

            this.fire('propertyChange', {property: 'transitionTime'});
        }

        _clearFeaturesCache() {
            Object.keys(this._tiles).forEach((key) => {
                this._tiles[key].redraw();
            });
        }

        _updateFeatures() {
            Object.keys(this._tiles).forEach(key => {
                let cache = this._tiles[key].getRenderCache();
                if (!cache || !cache.renders || !cache.renders[0]) return;
                let image = cache.renders[0].getCache();
                if (image) image.style.opacity = this._symbol.opacity;
            });
        }

        _getTrimmedBbox(bbox) {
            if (!this.tileScheme.limits) return bbox;

            let limits = this.tileScheme.limits;
            let xMin = Math.max(bbox.xMin, limits[0]);
            let yMin = Math.max(bbox.yMin, limits[1]);
            let xMax = Math.min(bbox.xMax, limits[2]);
            let yMax = Math.min(bbox.yMax, limits[3]);

            if (xMax < xMin) xMax = xMin;
            if (yMax < yMin) yMax = yMin;

            return new Bbox([xMin, yMin], [xMax, yMax], bbox.crs);
        }
    }

    utils.extend(TileLayer.prototype, defaults);

    return TileLayer;

});

sGis.module('TileScheme', [
    'utils'
], function(utils) {

    const TOLERANCE = 0.001;

    /**
     * Tile scheme used by tile layers to calculate indexes and coordinates of the tiles. The properties .levels and .origin must me set to a valid value before tile scheme can be used.
     * @alias sGis.TileScheme
     */
    class TileScheme {
        /**
         * @param {Object} parameters - key-value set of properties to be set to the instance
         */
        constructor(parameters = {}) {
            utils.init(this, parameters, true);
        }

        /**
         * Array of level definitions of the tile scheme
         * @type {sGis.TileScheme.LevelDefinition[]} 
         */
        get levels() { return this._levels; }
        set levels(/** sGis.TileScheme.LevelDefinition[] */ levels) {
            this._levels = levels.sort((a, b) => a.resolution - b.resolution);
        }

        /**
         * Returns resolution of the closest level in the tile scheme in the given direction. If no such level is found, returns smallest or largest possible resolution.
         * @param {Number} resolution - resolution that will be used as a base for search
         * @param {Boolean} [direction=false] - if false, will return resolution smaller then given, if true, will return resolution larger then given
         * @returns {Number}
         */
        getAdjustedResolution(resolution, direction = false) {
            return this.levels[this.getLevel(resolution, direction)].resolution;
        }

        /**
         * Returns closest level index in the tile scheme that has resolution in the given direction. If no such level is found, returns the last level index.
         * @param {Number} resolution - resolution that will be used as a base for search
         * @param {Boolean} [direction=false] - if false, resolution level with smaller resolution will be returned. If true, resolution level with larger resolution will be returned.
         * @returns {Number}
         */
        getLevel(resolution, direction = false) {
            if (!this.levels ||this.levels.length === 0) utils.error('Tile scheme levels are not set');

            let i;
            for (i = 0; i < this.levels.length; i++) {
                if (resolution <= this.levels[i].resolution + TOLERANCE) {
                    if (direction) {
                        return i === 0 ? i : i - 1;
                    }
                    return i;
                }
            }
            return i-1;
        }

        /**
         * Returns maximum resolution in the scheme
         * @returns {Number}
         */
        get maxResolution() {
            return this.levels[this.levels.length - 1].resolution;
        }

        /**
         * Returns minimum resolution in the scheme
         * @return {Number}
         */
        get minResolution() {
            return this.levels[0].resolution;
        }

        /**
         * Left top coordinate of the tile scheme. Used as a base for tile coordinates calculation.
         * @type {Position}
         */
        get origin() { return this._origin; }
        set origin(/** Position */ origin) { this._origin = origin; }
    }

    let defaultLevels = [{
        resolution: 156543.03392800014,
        scale: 591657527.591555,
        indexCount: 1,
        zIndex: 0
    }];

    for (let i = 1; i < 18; i ++) {
        defaultLevels[i] = {
            resolution: defaultLevels[i-1].resolution / 2,
            scale: defaultLevels[i-1].scale / 2,
            indexCount: defaultLevels[i-1] * 2,
            zIndex: i
        };
    }

    /**
     * Default tile scheme used for Mercator projections.
     * @type {TileScheme}
     */
    TileScheme.default = new TileScheme({
        tileWidth: 256,
        tileHeight: 256,
        origin: [-20037508.342787, 20037508.342787],
        levels: defaultLevels,
        reversedY: false,
        limits: [-Infinity, -20037508.342787, Infinity, 20037508.342787]
    });

    return TileScheme;

    /**
     * @typedef {Object} sGis.TileScheme.LevelDefinition
     * @prop {Number} resolution
     * @prop {Number} zIndex
     * @prop {Number} indexCount
     */
    
});
sGis.module('controls.Circle', [
    'controls.PolyDrag',
    'feature.Polygon'
], function(PolyDrag, Polygon) {

    'use strict';

    /**
     * Control for drawing circles by dragging from center to the radius.
     * @alias sGis.controls.Circle
     * @extends sGis.controls.PolyDrag
     */
    class Circle extends PolyDrag {
        _startNewFeature(point) {
            this._centerPoint = point.position;
            this._activeFeature = new Polygon([[]], { crs: point.crs, symbol: this.symbol });
            this.tempLayer.add(this._activeFeature);
        }

        _updateFeature(point) {
            let radius = Math.sqrt(Math.pow(this._centerPoint[0] - point.position[0], 2) + Math.pow(this._centerPoint[1] - point.position[1], 2));
            let angleStep = 2 * Math.PI / this.segmentNo;

            let coordinates = [];
            for (var i = 0; i < this.segmentNo; i++) {
                coordinates.push([
                    this._centerPoint[0] + radius * Math.sin(angleStep * i),
                    this._centerPoint[1] + radius * Math.cos(angleStep * i)
                ]);
            }

            this._activeFeature.rings = [coordinates];
        }
    }

    /**
     * The number of segments of the circle. The higher this number is the smoother the circle will be.
     * @member {Number} sGis.controls.Circle#segmentNo
     */
    Circle.prototype.segmentNo = 36;

    return Circle;

});

sGis.module('Control', [
    'utils',
    'EventHandler'
], function(/** sGis.utils */ utils, /** sGis.EventHandler */ EventHandler) {

    'use strict';

    /**
     * Base class of all controls. Controls are objects that provide methods for setting interactions between user and map.
     * @alias sGis.Control
     * @extends sGis.EventHandler
     */
    class Control extends EventHandler {
        /**
         * @param {sGis.Map} map
         * @param {Object} properties - key-value set of properties to be set to the instance
         */
        constructor(map, properties) {
            super();
            utils.init(this, properties, true);
            this._map = map;
        }

        /**
         * Makes the control active, setting event handlers on the map
         */
        activate() {
            this.isActive = true;
        }

        /**
         * Makes the control inactive, removing all event handlers and removing any temp objects
         */
        deactivate() {
            this.isActive = false;
        }
        
        _activate() {
            // abstract method, must be implemented in child
        }

        _deactivate() {
            // abstract method, must be implemented in child
        }

        /**
         * Vector layer the control will work with. Some controls do not require active layer to be set.
         * @type {sGis.FeatureLayer}
         */
        get activeLayer() { return this._activeLayer; }
        set activeLayer(/** sGis.FeatureLayer */ layer) { this._activeLayer = layer; }

        /**
         * Active status of the control.
         * @type {Boolean}
         * @default false
         */
        get isActive() { return this._isActive; }
        set isActive(/** Boolean */ bool) {
            if (!this._map) return;
            bool = !!bool;
            if (this._isActive === bool) return;
            this._isActive = bool;

            if (bool) {
                this._activate();
            } else {
                this._deactivate();
            }

        }

        /**
         * Map the control works with.
         * @type {sGis.Map}
         * @readonly
         */
        get map() { return this._map; }
    }

    Control.prototype._isActive = false;

    return Control;

});

sGis.module('controls.Editor', [
    'utils',
    'Control',
    'symbol.Editor',
    'controls.PointEditor',
    'controls.PolyEditor',
    'controls.PolyTransform',
    'utils.StateManager',
    'event'
], function(
    /** sGis.utils */ utils, 
    /** function(new:sGis.Control) */ Control, 
    /** function(new:sGis.symbol.Editor) */ EditorSymbol, 
    /** function(new:sGis.controls.PointEditor) */ PointEditor, 
    /** function(new:sGis.controls.PolyEditor) */ PolyEditor, 
    /** function(new:sGis.controls.PolyTransform) */ PolyTransform, 
    /** function(new:sGis.utils.StateManager */ StateManager, 
    /** sGis.event */ event) {
    
    'use strict';

    const modes = ['vertex', 'rotate', 'scale', 'drag'];

    /**
     * Control for editing points, polylines and polygons. It uses PointEditor, PolyEditor, PolyTransform and Snapping classes for editing corresponding features.
     * @alias sGis.controls.Editor
     * @extends sGis.Control
     * @fires sGis.controls.Editor#featureSelect
     * @fires sGis.controls.Editor#featureDeselect
     * @fires sGis.controls.Editor#featureRemove
     */
    class Editor extends Control {
        /**
         * @param {sGis.Map} map - map object the control will work with
         * @param {Object} [options] - key-value set of properties to be set to the instance
         */
        constructor(map, options = {}) {
            super(map, options);

            this._ns = '.' + utils.getGuid();
            this._setListener = this._setListener.bind(this);
            this._removeListener = this._removeListener.bind(this);
            this._onEdit = this._onEdit.bind(this);
            this._setEditors();

            this._states = new StateManager();

            this._deselect = this._deselect.bind(this);
            this.setMode(modes);

            this._handleFeatureAdd = this._handleFeatureAdd.bind(this);
            this._handleFeatureRemove = this._handleFeatureRemove.bind(this);

            this._handleKeyDown = this._handleKeyDown.bind(this);

            this.isActive = options.isActive;
        }

        _setEditors() {
            this._pointEditor = new PointEditor(this.map);
            this._pointEditor.on('edit', this._onEdit);

            this._polyEditor = new PolyEditor(this.map, { onFeatureRemove: this._delete.bind(this) });
            this._polyEditor.on('edit', this._onEdit);
            this._polyEditor.on('change', this._updateTransformControl.bind(this));

            this._polyTransform = new PolyTransform(this.map);
            this._polyTransform.on('rotationEnd scalingEnd', this._onEdit);
        }

        _onEdit() {
            this.fire('edit');
            this._saveState();
        }

        _activate() {
            if (!this.activeLayer) return;
            this.activeLayer.features.forEach(this._setListener, this);
            this.activeLayer.on('featureAdd', this._handleFeatureAdd);
            this.activeLayer.on('featureRemove', this._handleFeatureRemove);
            this.activeLayer.redraw();
            this.map.on('click', this._onMapClick.bind(this));

            event.add(document, 'keydown', this._handleKeyDown);
        }

        _handleFeatureAdd(sGisEvent) {
            this._setListener(sGisEvent.feature);
        }

        _handleFeatureRemove(sGisEvent) {
            this._removeListener(sGisEvent.feature);
        }

        _setListener(feature) {
            feature.on('click' + this._ns, this._handleFeatureClick.bind(this, feature));
        }

        _removeListener(feature) {
            feature.off('click' + this._ns);
        }
        
        _onMapClick() {
            if (!this.ignoreEvents) this._deselect();
        }

        _deactivate() {
            this._deselect();
            this.activeLayer.features.forEach(this._removeListener, this);
            this.activeLayer.off('featureAdd', this._handleFeatureAdd);
            this.activeLayer.off('featureRemove', this._handleFeatureRemove);
            this.map.off('click', this._deselect);

            event.remove(document, 'keydown', this._handleKeyDown);
        }

        /**
         * Selects a given feature if it is in the active layer.
         * @param {sGis.Feature} feature
         */
        select(feature) { this.activeFeature = feature; }

        /**
         * Clears selection if any.
         */
        deselect() { this.activeFeature = null; }

        /**
         * Currently selected for editing feature.
         * @type {sGis.Feature}
         */
        get activeFeature() { return this._activeFeature; }
        set activeFeature(/** sGis.Feature */ feature) {
            if (feature) this.activate();
            this._select(feature);
        }

        _handleFeatureClick(feature, sGisEvent) {
            if (this.ignoreEvents) return;
            sGisEvent.stopPropagation();
            this._select(feature);
        }

        _select(feature) {
            if (this._activeFeature === feature) return;
            this._deselect();

            this._activeFeature = feature;
            if (!feature) return;

            feature.setTempSymbol(new EditorSymbol({ baseSymbol: feature.symbol }));
            if (feature.position) {
                this._pointEditor.activeLayer = this.activeLayer;
                this._pointEditor.activeFeature = feature;
            } else if (feature.rings) {
                this._activatePolyControls(feature);
            }
            this.activeLayer.redraw();

            this._saveState();

            this.fire('featureSelect', { feature: feature })
        }

        _activatePolyControls(feature) {
            this._polyEditor.featureDragAllowed = this._dragging;
            this._polyEditor.vertexChangeAllowed = this._vertexEditing;
            this._polyEditor.activeLayer = this.activeLayer;
            this._polyEditor.activeFeature = feature;

            this._polyTransform.enableRotation = this._rotation;
            this._polyTransform.enableScaling = this._scaling;
            this._polyTransform.activeLayer = this.activeLayer;
            this._polyTransform.activeFeature = feature
        }

        _deselect() {
            if (!this._activeFeature || !this._deselectAllowed) return;

            this._pointEditor.deactivate();
            this._polyEditor.deactivate();
            this._polyTransform.deactivate();

            let feature = this._activeFeature;
            
            this._activeFeature.clearTempSymbol();
            this._activeFeature = null;
            this.activeLayer.redraw();
            
            this.fire('featureDeselect', { feature: feature })
        }

        _updateTransformControl() {
            if (this._polyTransform.isActive) this._polyTransform.update();
        }

        /**
         * Sets the editing mode. Available modes are:<br>
         *     * vertex - editing vertexes of polygons and polylines.
         *     * rotate - rotation of polygons and polylines
         *     * drag - dragging of whole features
         *     * scale - scaling of polygons and polylines
         *     * all - all modes are active
         * @param {string[]|string} mode - can be coma separated list or array of mode names
         */
        setMode(mode) {
            if (mode === 'all') mode = modes;
            if (!Array.isArray(mode)) mode = mode.split(',').map(x => x.trim());

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
                this.prohibitEvent('featureDeselect');
                this._deselect();
                this.allowEvent('featureDeselect');
                this.activeLayer.remove(feature);

                this._saveState();
                this.fire('featureRemove', { feature: feature });
            }
        }

        _handleKeyDown(event) {
            switch (event.which) {
                case 27: this._deselect(); return false; // esc
                case 46: this._delete(); return false; // del
                case 90: if (event.ctrlKey) { this.undo(); return false; } break; // ctrl+z
                case 89: if (event.ctrlKey) { this.redo(); return false; } break; // ctrl+y
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
            if (!state) return this._deselect();

            if (!state.coordinates && this.activeLayer.features.indexOf(state.feature) >= 0) {
                this.activeFeature = null;
                this.activeLayer.remove(state.feature);
            } else if (state.coordinates && this.activeLayer.features.indexOf(state.feature) < 0) {
                state.feature.coordinates = state.coordinates;
                this.activeLayer.add(state.feature);
                this.activeFeature = state.feature;
            } else if (state.coordinates) {
                state.feature.coordinates = state.coordinates;
                this.activeFeature = state.feature;
            }

            this._updateTransformControl();
            this.activeLayer.redraw();
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

    Editor.prototype._deselectAllowed = true;

    /**
     * If set to true the feature will be deleted in one of two cases:<br>
     *     1) User removes last point of polyline or polygon.
     *     2) User presses "del" button
     * @member {Boolean} sGis.controls.Editor#allowDeletion
     */
    Editor.prototype.allowDeletion = true;

    return Editor;

    /**
     * Feature was selected by user.
     * @event sGis.controls.Editor#featureSelect
     * @type {Object}
     * @prop {sGis.Feature} feature - feature that was selected
     * @mixes sGisEvent
     */

    /**
     * Feature was deselected by user.
     * @event sGis.controls.Editor#featureDeselect
     * @type {Object}
     * @prop {sGis.Feature} feature - feature that was deselected
     * @mixes sGisEvent
     */

    /**
     * Feature was deleted by user.
     * @event sGis.controls.Editor#featureRemove
     * @type {Object}
     * @prop {sGis.Feature} feature - feature that was deselected
     * @mixes sGisEvent
     */

});

sGis.module('controls.MultiPoint', [
    'utils',
    'Control',
    'FeatureLayer',
    'symbol.point.Point',
    'feature.MultiPoint'
], function(utils, Control, FeatureLayer, PointSymbol, MultiPointFeature) {

    'use strict';

    /**
     * Control for creating multipoints. When active, every click on the map will add a new point to the current multipoint.
     * Double click will finish drawing of current multipoint and start a new one.<br><br>
     *
     * When control is activated, a temporary feature layer is created and added to the map. Feature is drawn on that temp
     * layer. After drawing is finished, if .activeLayer is set, the created feature is removed from the temp layer and
     * added to the active layer.
     *
     * @alias sGis.controls.MultiPoint
     * @extends sGis.Control
     * @fires sGis.controls.MultiPoint#drawingBegin
     * @fires sGis.controls.MultiPoint#pointAdd
     * @fires sGis.controls.MultiPoint#drawingFinish
     */
    class MultiPoint extends Control {
        /**
         * @param {sGis.Map} map - map the control will work with
         * @param {Object} [properties] - key-value set of properties to be set to the instance
         */
        constructor(map, properties = {}) {
            super(map, properties);
            this._handleClick = this._handleClick.bind(this);
            this._handleDblclick = this._handleDblclick.bind(this);

            this.isActive = properties.isActive;
        }

        _activate() {
            this._tempLayer = new FeatureLayer();
            this.map.addLayer(this._tempLayer);

            this.map.on('click', this._handleClick);
        }

        _deactivate() {
            this.cancelDrawing();
            this.map.removeLayer(this._tempLayer);
            this._tempLayer = null;
            this.map.off('click', this._handleClick);
        }

        _handleClick(sGisEvent) {
            setTimeout(() => {
                if (Date.now() - this._dblClickTime < this.dblClickTimeout) return;
                if (this._activeFeature) {
                    this._activeFeature.addPoint(sGisEvent.point);
                } else {
                    this.startNewFeature(sGisEvent.point);
                    this.fire('drawingBegin');
                }
                this.fire('pointAdd');

                this._tempLayer.redraw();
            }, 10);

            sGisEvent.stopPropagation();
        }

        /**
         * Starts a new feature with the first point at given position. If the control was not active, this method will set it active.
         * @param {sGis.IPoint} point
         */
        startNewFeature(point) {
            this.activate();
            this.cancelDrawing();

            this._activeFeature = new MultiPointFeature([point.position], { crs: this.map.crs, symbol: this.symbol });
            this._tempLayer.add(this._activeFeature);

            this._setHandlers();
        }

        _setHandlers() {
            this.map.addListener('dblclick', this._handleDblclick);
        }

        /**
         * Cancels drawing of the current feature, removes the feature and the temp layer. No events are fired.
         */
        cancelDrawing() {
            if (!this._activeFeature) return;

            this.map.removeListener('dblclick', this._handleDblclick);

            if (this._tempLayer.has(this._activeFeature)) this._tempLayer.remove(this._activeFeature);
            this._activeFeature = null;
        }

        _handleDblclick(sGisEvent) {
            let feature = this._activeFeature;
            this.finishDrawing(self, sGisEvent);
            sGisEvent.stopPropagation();
            this._dblClickTime = Date.now();
            this.fire('drawingFinish', { feature: feature, browserEvent: sGisEvent.browserEvent });
        }

        /**
         * Finishes drawing of the current feature and moves it to the active layer (if set).
         */
        finishDrawing() {
            let feature = this._activeFeature;
            this.cancelDrawing();
            if (this.activeLayer) this.activeLayer.add(feature);
        }

        /**
         * The active drawing feature.
         * @type {sGis.feature.MultiPoint}
         */
        get activeFeature() { return this._activeFeature; }
        set activeFeature(/** sGis.feature.MultiPoint */ feature) {
            if (!this._isActive) return;
            this.cancelDrawing();

            this._activeFeature = feature;
            this._setHandlers();
        }
    }

    MultiPoint.prototype.dblClickTimeout = 30;
    MultiPoint.prototype.symbol = new PointSymbol();

    return MultiPoint;

    /**
     * The drawing of a new feature is started by clicking on the map.
     * @event sGis.controls.MultiPoint#drawingBegin
     * @type {Object}
     * @mixes sGisEvent
     */

    /**
     * A new point is added to the feature by clicking on the map.
     * @event sGis.controls.MultiPoint#pointAdd
     * @type {Object}
     * @mixes sGisEvent
     */

    /**
     * Drawing of the feature is finished by double click and the feature is moved to the active layer (if set).
     * @event sGis.controls.MultiPoint#drawingFinish
     * @type {Object}
     * @mixes sGisEvent
     * @prop {sGis.feature.MultiPoint} feature - feature that was created
     */

});

sGis.module('controls.Point', [
    'Control',
    'feature.Point',
    'symbol.point.Point'
], function(/** sGis.Control */ Control, PointFeature, PointSymbol) {
    'use strict';

    /**
     * Control for creating point features. When active, any click on the map will create a new point feature and add it
     * to the active layer. If active layer is not set, the point feature will be given through 'drawingFinish' event.
     * @alias sGis.controls.Point
     * @extends sGis.Control
     * @fires sGis.controls.Point#drawingFinish
     */
    class PointControl extends Control {
        /**
         * @param {sGis.Map} map
         * @param {Object} properties - key-value set of properties to be set to the instance
         */
        constructor(map, properties = {}) {
            super(map, properties);
            this._handleClick = this._handleClick.bind(this);
            this.isActive = properties.isActive;
        }

        _activate() {
            this.map.addListener('click', this._handleClick);
        }

        _deactivate() {
            this.map.removeListener('click', this._handleClick);
        }

        _handleClick(sGisEvent) {
            sGisEvent.stopPropagation();

            let point = sGisEvent.point.projectTo(this.map.crs);
            var feature = new PointFeature(point.position, {crs: this.map.crs, symbol: this.symbol});

            if (this.activeLayer) this.activeLayer.add(feature);
            this.fire('drawingFinish', { feature: feature });
        }
    }

    /**
     * Symbol of the points that are created by the control.
     * @member {sGis.Symbol} sGis.controls.Point#symbol
     * @default new sGis.symbol.point.Point()
     */
    PointControl.prototype.symbol = new PointSymbol();
    
    return PointControl;

    /**
     * A point is drawn and is added to the active layer (if set).
     * @event sGis.controls.Point#drawingFinish
     * @type {Object}
     * @mixes sGisEvent
     * @prop {sGis.feature.Point} feature - point that was created.
     */
    
});

sGis.module('controls.PointEditor', [
    'Control',
    'controls.Snapping'
], (Control, Snapping) => {

    'use strict';

    /**
     * Control for editing point features. When activeFeature is set, the feature is becoming draggable.
     * @alias sGis.controls.PointEditor
     * @extends sGis.Control
     * @fires sGis.controls.PointEditor#edit
     */
    class PointEditor extends Control {
        /**
         * @param {sGis.Map} map - map object the control will work with
         * @param {Object} [options] - key-value set of properties to be set to the instance 
         */
        constructor(map, options = {}) {
            super(map, options);
            this._handleDragStart = this._handleDragStart.bind(this);
            this._handleDrag = this._handleDrag.bind(this);
            this._handleDragEnd = this._handleDragEnd.bind(this);

            this._snapping = new Snapping(map);
            this.isActive = options.isActive;
        }

        _activate() {
            if (!this._activeFeature) return;

            if (this.snappingTypes && this.snappingTypes.length > 0) {
                this._snapping.snappingTypes = this.snappingTypes;
                this._snapping.activeLayer = this.activeLayer;
                this._snapping.activeFeature = this._activeFeature;
            }

            this._activeFeature.on('dragStart', this._handleDragStart);
            this._activeFeature.on('drag', this._handleDrag);
            this._activeFeature.on('dragEnd', this._handleDragEnd);
        }

        _deactivate() {
            if (!this._activeFeature) return;

            this._snapping.deactivate();

            this._activeFeature.off('dragStart', this._handleDragStart);
            this._activeFeature.off('drag', this._handleDrag);
            this._activeFeature.off('dragEnd', this._handleDragEnd);
        }

        /**
         * Point to drag. If set to null, the control is deactivated.
         * @type {sGis.feature.Point}
         */
        get activeFeature() { return this._activeFeature; }
        set activeFeature(/** sGis.feature.Point */ feature) {
            this.deactivate();

            this._activeFeature = feature;
            if (feature) this.activate();
        }

        _handleDragStart(sGisEvent) {
            if (this.ignoreEvents) return;
            
            sGisEvent.draggingObject = this._activeFeature;
            sGisEvent.stopPropagation();

            this._snapping.activate();
        }

        _handleDrag(sGisEvent) {
            this._activeFeature.position = this._snapping.position || sGisEvent.point.projectTo(this._activeFeature.crs).position;
            if (this.activeLayer) this.activeLayer.redraw();
        }

        _handleDragEnd() {
            this._snapping.deactivate();
            this.fire('edit');
        }
    }

    /**
     * Specifies which snapping functions to use. See {sGis.controls.Snapping#snappingTypes}.
     * @member {String[]} sGis.controls.PointEditor#snappingTypes
     * @default ['vertex', 'midpoint', 'line']
     */
    PointEditor.prototype.snappingTypes = ['vertex', 'midpoint', 'line'];
    PointEditor.prototype.ignoreEvents = false;

    return PointEditor;

        /**
         * Dragging of the point if finished and the feature is released.
         * @event sGis.controls.PointEditor#edit
         * @type {Object}
         * @mixes sGisEvent
         */
});
sGis.module('controls.Poly', [
    'utils',
    'Control',
    'FeatureLayer'
], function(utils, Control, FeatureLayer) {
    'use strict';

    /**
     * Base class for polyline and polygon controls. When active, click on the map will start a new feature, then
     * every next click adds a new point to the feature. If ctrl is held during click, new point is added and then new
     * ring drawing starts. Feature is completed by double click.<br><br>
     *
     * When control is activated, a temporary feature layer is created and added to the map. Feature is drawn on that temp
     * layer. After drawing is finished, if .activeLayer is set, the created feature is removed from the temp layer and
     * added to the active layer.
     *
     * @alias sGis.controls.Poly
     * @extends sGis.Control
     * @fires sGis.controls.Poly#drawingBegin
     * @fires sGis.controls.Poly#pointAdd
     * @fires sGis.controls.Poly#drawingFinish
     */
    class PolyControl extends Control {
        /**
         * @param {sGis.feature.Poly.constructor} FeatureClass - class of the feature to be created (Polyline or Polygon)
         * @param {sGis.Symbol} symbol - symbol of the feature
         * @param {sGis.Map} map - map the control will work with
         * @param {Object} properties - key-value set of properties to be set to the instance
         */
        constructor(FeatureClass, symbol, map, properties = {}) {
            super(map, properties);

            if (!this.symbol) this.symbol = symbol;
            this._getNewFeature = function(rings, options) {
                return new FeatureClass(rings, options);
            };

            this._handleClick = this._handleClick.bind(this);
            this._handleMousemove = this._handleMousemove.bind(this);
            this._handleDblclick = this._handleDblclick.bind(this);

            this.isActive = properties.isActive;
        }

        _activate() {
            this._tempLayer = new FeatureLayer();
            this.map.addLayer(this._tempLayer);
            this.map.on('click', this._handleClick);
        }

        _deactivate() {
            this.cancelDrawing();
            this.map.removeLayer(this._tempLayer);
            this._tempLayer = null;
            this.map.off('click', this._handleClick);
        }

        _handleClick(sGisEvent) {
            setTimeout(() => {
                if (Date.now() - this._dblClickTime < 30) return;
                if (this._activeFeature) {
                    if (sGisEvent.ctrlKey) {
                        this.startNewRing();
                    } else {
                        this._activeFeature.addPoint(sGisEvent.point, this._activeFeature.rings.length - 1);
                    }
                } else {
                    this.startNewFeature(sGisEvent.point);
                    this.fire('drawingBegin');
                }
                this.fire('pointAdd');

                this._tempLayer.redraw();
            }, 10);

            sGisEvent.stopPropagation();
        }

        /**
         * Starts a new feature with the first point at given position. If the control was not active, this method will set it active.
         * @param {sGis.IPoint} point
         */
        startNewFeature(point) {
            this.activate();
            this.cancelDrawing();

            this._activeFeature = this._getNewFeature([point.position, point.position], { crs: this.map.crs, symbol: this.symbol });
            this._tempLayer.add(this._activeFeature);

            this._setHandlers();
        }

        _setHandlers() {
            this.map.addListener('mousemove', this._handleMousemove);
            this.map.addListener('dblclick', this._handleDblclick);
        }

        _handleMousemove(sGisEvent) {
            let ringIndex = this._activeFeature.rings.length - 1;
            let pointIndex = this._activeFeature.rings[ringIndex].length - 1;

            this._activeFeature.rings[ringIndex][pointIndex] = sGisEvent.point.position;
            this._activeFeature.redraw();
            this._tempLayer.redraw();

            this.fire('mousemove');
        }

        _handleDblclick(sGisEvent) {
            let feature = this._activeFeature;
            this.finishDrawing(self, sGisEvent);
            sGisEvent.stopPropagation();
            this._dblClickTime = Date.now();
            this.fire('drawingFinish', { feature: feature, browserEvent: sGisEvent.browserEvent });
        }

        /**
         * Cancels drawing of the current feature, removes the feature and the temp layer. No events are fired.
         */
        cancelDrawing() {
            if (!this._activeFeature) return;

            this.map.removeListener('mousemove', this._handleMousemove);
            this.map.removeListener('dblclick', this._handleDblclick);

            if (this._tempLayer.has(this._activeFeature)) this._tempLayer.remove(this._activeFeature);
            this._activeFeature = null;
        }

        /**
         * Finishes drawing of the current feature and moves it to the active layer (if set). If the current ring has less
         * then two points, the ring is removed. If the feature has no rings, the feature is not added to the active layer.
         */
        finishDrawing() {
            let feature = this._activeFeature;
            let ringIndex = feature.rings.length - 1;

            this.cancelDrawing();
            if (ringIndex === 0 && feature.rings[ringIndex].length < 3) return;

            feature.removePoint(ringIndex, feature.rings[ringIndex].length - 1);

            if (this.activeLayer) this.activeLayer.add(feature);
        }

        /**
         * Start drawing of a new ring of the feature.
         */
        startNewRing() {
            let rings = this._activeFeature.rings;
            let ringIndex = rings.length;
            let point = rings[ringIndex-1][rings[ringIndex-1].length-1];
            this._activeFeature.setRing(ringIndex, [point]);
        }

        /**
         * The active drawing feature.
         * @type {sGis.feature.Poly}
         */
        get activeFeature() { return this._activeFeature; }
        set activeFeature(/** sGis.feature.Poly */ feature) {
            if (!this._isActive) return;
            this.cancelDrawing();

            this._activeFeature = feature;
            this._setHandlers();
        }
    }
    
    return PolyControl;

    /**
    * The drawing of a new feature is started by clicking on the map.
    * @event sGis.controls.Poly#drawingBegin
    * @type {Object}
    * @mixes sGisEvent
    */

    /**
     * A new point is added to the feature by clicking on the map.
     * @event sGis.controls.Poly#pointAdd
     * @type {Object}
     * @mixes sGisEvent
     */

    /**
     * Drawing of the feature is finished by double click and the feature is moved to the active layer (if set).
     * @event sGis.controls.Poly#drawingFinish
     * @type {Object}
     * @mixes sGisEvent
     * @prop {sGis.feature.Poly} feature - feature that was created
     */
});

sGis.module('controls.PolyDrag', [
    'Control',
    'FeatureLayer',
    'symbol.polygon.Simple'
], function(Control, FeatureLayer, PolygonSymbol) {

    'use strict';

    /**
     * Base class for controls that create polygon feature by dragging some area on the map. When the control is activated,
     * a new temporary layer is created and added to the map. The feature is drawn on that temp layer. After drawing is
     * finished, if the .activeLayer property is set, the feature is moved to the active layer.
     * @alias sGis.controls.PolyDrag
     * @extends sGis.Control
     * @fires sGis.controls.PolyDrag#drawingBegin
     * @fires sGis.controls.PolyDrag#drawingFinish
     */
    class PolyDrag extends Control {
        /**
         * @param {sGis.Map} map - map the control will work with
         * @param {Object} [properties] - key-value set of properties to be set to the instance
         */
        constructor(map, properties = {}) {
            super(map, properties);

            if (!this.symbol) this.symbol = new PolygonSymbol();

            this._handleDragStart = this._handleDragStart.bind(this);
            this._handleDrag = this._handleDrag.bind(this);
            this._handleDragEnd = this._handleDragEnd.bind(this);

            this.isActive = properties.isActive;
        }

        _activate() {
            this.map.on('dragStart', this._handleDragStart);
            this._tempLayer = new FeatureLayer();
            this.map.addLayer(this._tempLayer);
        }

        _deactivate() {
            this.map.removeLayer(this._tempLayer);
            this._tempLayer = null;
            this._activeFeature = null;
            this._removeDragListeners();
            this.map.off('dragStart', this._handleDragStart);
        }

        _handleDragStart(sGisEvent) {
            this._startNewFeature(sGisEvent.point);
            this.map.on('drag', this._handleDrag);
            this.map.on('dragEnd', this._handleDragEnd);

            this.fire('drawingBegin');
        }

        _handleDrag(sGisEvent) {
            this._updateFeature(sGisEvent.point);
            this._tempLayer.redraw();
            sGisEvent.stopPropagation();
        }

        _handleDragEnd(sGisEvent) {
            let feature = this._activeFeature;
            this._activeFeature = null;
            this._tempLayer.features = [];
            this._removeDragListeners();

            if (this.activeLayer) this.activeLayer.add(feature);
            this.fire('drawingFinish', { feature: feature, browserEvent: sGisEvent.browserEvent });
        }

        _removeDragListeners() {
            this.map.off('drag', this._handleDrag);
            this.map.off('dragEnd', this._handleDragEnd);
        }

        _startNewFeature(point) {
            // Abstract method, must be set in a child class
        }

        _updateFeature(point) {
            // Abstract method, must be set in a child class
        }

        /**
         * The feature being drawn.
         * @type sGis.feature.Polygon
         * @readonly
         */
        get activeFeature() { return this._activeFeature; }

        /**
         * Temporary layer for feature drawing
         * @type sGis.FeatureLayer
         * @readonly
         */
        get tempLayer() { return this._tempLayer; }
    }

    /**
     * Symbol of the created features
     * @member {sGis.Symbol} sGis.controls.PolyDrag#symbol
     * @default new sGis.symbol.polygon.Simple()
     */

    return PolyDrag;

    /**
     * Drawing of a new feature is started by starting a drag of the map.
     * @event sGis.controls.PolyDrag#drawingBegin
     * @type {Object}
     * @mixes sGisEvent
     */

    /**
     * Drawing is finished by finishing the drag and the feature is added to the active layer (if set).
     * @event sGis.controls.PolyDrag#drawingFinish
     * @type {Object}
     * @mixes sGisEvent
     * @prop {sGis.feature.Polygon} feature - created feature
     */

});

sGis.module('controls.PolyEditor', [
    'Control',
    'controls.Snapping',
    'geotools',
    'symbol.point.Point',
    'FeatureLayer',
    'feature.Point'
], (Control, Snapping, geotools, PointSymbol, FeatureLayer, Point) => {

    'use strict';

    /**
     * Control for editing polyline and polygon features. When activeFeature is set, the feature becomes draggable.
     * If a vertex is dragged, the vertex position is changed. If a side is dragged, a new point is added to the side and
     * then being dragged. If inside area of the polygon is dragged, the whole polygon will change position.
     * @alias sGis.controls.PolyEditor
     * @extends sGis.Control
     * @fires sGis.controls.PolyEditor#change
     * @fires sGis.controls.PolyEditor#edit
     */
    class PolyEditor extends Control {
        /**
         * @param {sGis.Map} map - map object the control will work with
         * @param {Object} [options] - key-value set of properties to be set to the instance
         */
        constructor(map, options = {}) {
            super(map, options);

            this._snapping = new Snapping(map);

            this._handleMousemove = this._handleMousemove.bind(this);
            this._handleDragStart = this._handleDragStart.bind(this);
            this._handleDrag = this._handleDrag.bind(this);
            this._handleDragEnd = this._handleDragEnd.bind(this);
            this._handleDblClick = this._handleDblClick.bind(this);

            this.isActive = options.isActive;
        }

        _activate() {
            if (!this._activeFeature) return;
            this._setTempLayer();

            this._activeFeature.on('mousemove mouseout', this._handleMousemove);
            this._activeFeature.on('dragStart', this._handleDragStart);
            this._activeFeature.on('drag', this._handleDrag);
            this._activeFeature.on('dragEnd', this._handleDragEnd);
            this._activeFeature.on('dblclick', this._handleDblClick);
        }

        _deactivate() {
            if (!this._activeFeature) return;
            this._removeTempLayer();

            this._activeFeature.off('mousemove mouseout', this._handleMousemove);
            this._activeFeature.off('dragStart', this._handleDragStart);
            this._activeFeature.off('drag', this._handleDrag);
            this._activeFeature.off('dragEnd', this._handleDragEnd);
            this._activeFeature.off('dblclick', this._handleDblClick);
        }

        _setTempLayer() {
            this._tempLayer = new FeatureLayer();
            this.map.addLayer(this._tempLayer);
        }

        _removeTempLayer() {
            if (!this._tempLayer) return;
            this.map.removeLayer(this._tempLayer);
            this._tempLayer = null;
        }

        /**
         * Feature to edit. If set to null, the control is deactivated.
         * @type {sGis.feature.Poly}
         */
        get activeFeature() { return this._activeFeature; }
        set activeFeature(/** sGis.feature.Poly */ feature) {
            this.deactivate();
            this._activeFeature = feature;
            this.activate();
        }

        _handleMousemove(sGisEvent) {
            if (this.ignoreEvents || !this.vertexChangeAllowed || this._activeRing !== null || this._activeIndex !== null || sGisEvent.eventType === 'mouseout') {
                this._tempLayer.features = [];
            }

            let intersection = sGisEvent.intersectionType;
            if (!Array.isArray(intersection)) return;

            let activeRing = intersection[0];
            let activeIndex = intersection[1];

            let ring = this._activeFeature.rings[activeRing];
            let firstPoint = this._getProjectedPoint(ring[activeIndex], this._activeFeature.crs);
            let evPoint = sGisEvent.point.position;

            let symbol = this.vertexHoverSymbol;

            let targetDist = this.vertexSize * this.map.resolution;
            let point = firstPoint;
            let currDist = distance(point, evPoint);
            if (currDist > targetDist) {
                let nextIndex = (activeIndex+1) % ring.length;
                point = this._getProjectedPoint(ring[nextIndex], this._activeFeature.crs);
                let nextDist = distance(point, evPoint);
                if (nextDist > targetDist) {
                    symbol = this.sideHoverSymbol;
                    point = geotools.pointToLineProjection(evPoint, [firstPoint, point]);
                }
            }

            let feature = new Point(point, {crs: this.map.crs, symbol: symbol});
            this._tempLayer.features = [feature];
        }

        _getProjectedPoint(position, fromCrs) {
            return new sGis.Point(position, fromCrs).projectTo(this.map.crs).position;
        }
        
        _handleDragStart(sGisEvent) {
            if (this.ignoreEvents || !this.vertexChangeAllowed && !this.featureDragAllowed) return;

            let intersection = sGisEvent.intersectionType;
            if (Array.isArray(intersection) && this.vertexChangeAllowed) {
                let ring = this._activeFeature.rings[intersection[0]];
                let point = this._getProjectedPoint(ring[intersection[1]], this._activeFeature.crs);
                let evPoint = sGisEvent.point.position;

                this._activeRing = intersection[0];

                let targetDist = this.vertexSize * this.map.resolution;
                let currDist = distance(point, evPoint);
                if (currDist < targetDist) {
                    this._activeIndex = intersection[1];
                } else {
                    let nextIndex = (intersection[1]+1) % ring.length;
                    point = this._getProjectedPoint(ring[nextIndex], this._activeFeature.crs);
                    let nextDist = distance(point, evPoint);
                    if (nextDist < targetDist) {
                        this._activeIndex = nextIndex;
                    } else {
                        this._activeFeature.insertPoint(intersection[0], intersection[1]+1, evPoint);
                        this._activeIndex = intersection[1]+1;
                    }
                }
            } else {
                this._activeRing = this._activeIndex = null;
            }

            if (this._activeRing !== null || this.featureDragAllowed) {
                sGisEvent.draggingObject = this._activeFeature;
                sGisEvent.stopPropagation();
            }

            this._setSnapping();
        }

        _setSnapping() {
            if (this._activeRing === null || !this.snappingTypes) return;

            this._snapping.activeLayer = this.activeLayer;
            this._snapping.snappingTypes = this.snappingTypes;
            this._snapping.activeFeature = this._activeFeature;
            this._snapping.activeRingIndex = this._activeRing;
            this._snapping.activePointIndex = this._activeIndex;

            this._snapping.activate();
        }
        
        _handleDrag(sGisEvent) {
            if (this._activeRing === null) return this._handleFeatureDrag(sGisEvent);

            this._activeFeature.setPoint(this._activeRing, this._activeIndex, this._snapping.position || sGisEvent.point.projectTo(this._activeFeature.crs).position);
            this._activeFeature.redraw();
            if (this.activeLayer) this.activeLayer.redraw();
            this.fire('change', { ringIndex: this._activeRing, pointIndex: this._activeIndex });
        }

        _handleDragEnd() {
            this._snapping.deactivate();
            this._activeRing = null;
            this._activeIndex = null;

            this.fire('edit');
        }

        _handleFeatureDrag(sGisEvent) {
            geotools.move([this._activeFeature], [-sGisEvent.offset.x, -sGisEvent.offset.y], this.map.crs);
            this._activeFeature.redraw();
            if (this.activeLayer) this.activeLayer.redraw();

            this.fire('change');
        }

        _handleDblClick(sGisEvent) {
            if (this.ignoreEvents || !Array.isArray(sGisEvent.intersectionType)) return;

            let ringIndex = sGisEvent.intersectionType[0];
            let ring = this._activeFeature.rings[ringIndex];

            let index = sGisEvent.intersectionType[1];
            let evPoint = sGisEvent.point.projectTo(this._activeFeature.crs).position;
            let d1 = distance(evPoint, ring[index]);

            let nextIndex = (index+1)%ring.length;
            let d2 = distance(evPoint, ring[nextIndex]);

            if (d2 < d1) index = nextIndex;

            if (ring.length > 2) {
                this._activeFeature.removePoint(ringIndex, index);
                this.fire('edit', { ringIndex: ringIndex, pointIndex: index });
            } else if (this._activeFeature.rings.length > 1) {
                this._activeFeature.removeRing(ringIndex);
                this.fire('edit', { ringIndex: ringIndex, pointIndex: index });
            } else if (this.onFeatureRemove) {
                this.onFeatureRemove();
            }
            
            if (this.activeLayer) this.activeLayer.redraw();
            sGisEvent.stopPropagation();
        }
    }

    /**
     * Distance from a vertex in pixels that will be considered as inside of the vertex. If the cursor is in this range from
     * a vertex then the vertex will be dragged.
     * @member {Number} sGis.controls.PolyEditor#vertexSize
     * @default 7
     */
    PolyEditor.prototype.vertexSize = 7;

    /**
     * If user tries to remove the last point of the feature, the control will not remove it but will call this callback
     * function instead. The function is called without any arguments.
     * @member {Function} sGis.controls.PolyEditor#onFeatureRemove
     * @default null
     */
    PolyEditor.prototype.onFeatureRemove = null;

    /**
     * Specifies which snapping functions to use. See {sGis.controls.Snapping#snappingTypes}.
     * @member {String[]} sGis.controls.PolyEditor#snappingTypes
     * @default ['vertex', 'midpoint', 'line', 'axis', 'orthogonal']
     */
    PolyEditor.prototype.snappingTypes = ['vertex', 'midpoint', 'line', 'axis', 'orthogonal'];

    /**
     * If set to false it will be not possible to change the shape of the feature.
     * @member {Boolean} sGis.controls.PolyEditor#vertexChangeAllowed
     * @default true
     */
    PolyEditor.prototype.vertexChangeAllowed = true;

    /**
     * If set to false it will be not possible to move the feature as whole.
     * @member {Boolean} sGis.controls.PolyEditor#featureDragAllowed
     * @default true
     */
    PolyEditor.prototype.featureDragAllowed = true;
    
    PolyEditor.prototype.ignoreEvents = false;

    PolyEditor.prototype.vertexHoverSymbol = new PointSymbol({ size: 7 });

    PolyEditor.prototype.sideHoverSymbol = new PointSymbol({});

    function distance(p1, p2) {
        return Math.sqrt((p1[0] - p2[0])*(p1[0] - p2[0]) + (p1[1] - p2[1])*(p1[1] - p2[1]));
    }

    return PolyEditor;

    /**
     * The feature is being dragged (one or more points is changed due to user interaction).
     * @event sGis.controls.PolyEditor#change
     * @type {Object}
     * @mixes sGisEvent
     */

    /**
     * Dragging of the feature if finished and the feature is released.
     * @event sGis.controls.PolyEditor#edit
     * @type {Object}
     * @mixes sGisEvent
     */

});
sGis.module('controls.Polygon', [
    'controls.Poly',
    'feature.Polygon',
    'symbol.polygon.Simple'
], function(Poly, Polygon, PolygonSymbol) {
    
    'use strict';

    /**
     * Control for drawing polygon features.
     * @alias sGis.control.Polyline
     * @extends sGis.controls.Poly
     */
    class PolygonControl extends Poly {
        /**
         * @param {sGis.Map} map - map the control will work with
         * @param {Object} [properties] - key-value set of properties to be set to the instance
         */
        constructor(map, properties) {
            super(Polygon, new PolygonSymbol(), map, properties);
        }
    }

    /**
     * Symbol of the created features
     * @member {sGis.Symbol} sGis.controls.Polyline#symbol
     * @default new sGis.symbol.polygon.Simple()
     */
    
    return PolygonControl;

});




sGis.module('controls.Polyline', [
    'controls.Poly',
    'feature.Polyline',
    'symbol.polyline.Simple'
], function(Poly, Polyline, PolylineSymbol) {
    
    'use strict';

    /**
     * Control for drawing polyline features.
     * @alias sGis.controls.Polyline
     * @extends sGis.controls.Poly
     */
    class PolylineControl extends Poly {
        /**
         * @param {sGis.Map} map - map the control will work with
         * @param {Object} [properties] - key-value set of properties to be set to the instance
         */
        constructor(map, properties) {
            super(Polyline, new PolylineSymbol(), map, properties);
        }
    }

    /**
     * Symbol of the created features
     * @member {sGis.Symbol} sGis.controls.Polyline#symbol
     * @default new sGis.symbol.polyline.Simple()
     */

    return PolylineControl;

});



sGis.module('controls.PolyTransform', [
    'Control',
    'FeatureLayer',
    'feature.Point',
    'symbol.point.Point',
    'symbol.point.Square',
    'geotools'
], (
    /** function(new:sGis.Control) */ Control,
    /** function(new:sGis.FeatureLayer) */ FeatureLayer, 
    /** function(new:sGis.feature.Point) */ PointFeature, 
    /** function(new:sGis.symbol.point.Point) */ PointSymbol, 
    /** function(new:sGis.symbol.point.Square) */ SquareSymbol, 
    /** sGis.geotools */ geotools) => {
    
    'use strict';

    /**
     * Control for modifying polylines or polygons as whole. When activeFeature is set, it shows points around the feature
     * dragging which one can scale or rotate the feature.
     * @alias sGis.controls.PolyTransform
     * @extends sGis.Control
     * @fires sGis.controls.PolyTransform#rotationStart
     * @fires sGis.controls.PolyTransform#rotationEnd
     * @fires sGis.controls.PolyTransform#scalingStart
     * @fires sGis.controls.PolyTransform#scalingEnd
     */
    class PolyTransform extends Control {
        /**
         * @param {sGis.Map} map - map object the control will work with
         * @param {Object} [options] - key-value set of properties to be set to the instance
         */
        constructor(map, options = {}) {
            super(map, options);

            this._handleRotationStart = this._handleRotationStart.bind(this);
            this._handleRotation = this._handleRotation.bind(this);
            this._handleRotationEnd = this._handleRotationEnd.bind(this);
            
            this._handleScalingEnd = this._handleScalingEnd.bind(this);

            this.isActive = options.isActive;
        }

        /**
         * Feature to edit. If set to null, the control is deactivated.
         * @type {sGis.feature.Poly}
         */
        get activeFeature() { return this._activeFeature; }
        set activeFeature(/** sGis.feature.Poly */ feature) {
            this.deactivate();
            this._activeFeature = feature;
            this.activate();
        }

        /**
         * Updates position of the editor handles.
         */
        update() { if (this._activeFeature) this._updateHandles(); }
        
        _activate() {
            if (!this._activeFeature) return;
            
            this._tempLayer = new FeatureLayer();
            this._setHandles();
            this.map.addLayer(this._tempLayer);
        }
        
        _deactivate() {
            if (!this._activeFeature) return;
            this.map.removeLayer(this._tempLayer);
            this._tempLayer = null;
        }
        
        _setHandles() {
            if (this.enableRotation) this._setRotationHandle();
            if (this.enableScaling) this._setScaleHandles();
        }
        
        _setRotationHandle() {
            this._rotationHandle = new PointFeature([0, 0], {crs: this.map.crs, symbol: this.rotationHandleSymbol});
            this._updateRotationHandle();
            this._rotationHandle.on('dragStart', this._handleRotationStart);
            this._rotationHandle.on('drag', this._handleRotation);
            this._rotationHandle.on('dragEnd', this._handleRotationEnd);
            this._tempLayer.add(this._rotationHandle);
        }
        
        _setScaleHandles() {
            this._scaleHandles = [];
            for (let i = 0; i < 9; i++) {
                if (i === 4) continue;

                let symbol = this.scaleHandleSymbol.clone();
                let xk = i % 3 - 1;
                let yk = 1- Math.floor(i/3);
                symbol.offset = { x: this.scaleHandleOffset * xk, y: this.scaleHandleOffset * yk };

                this._scaleHandles[i] = new PointFeature([0, 0], {symbol: symbol, crs: this.map.crs});
                this._scaleHandles[i].on('dragStart', this._handleScalingStart.bind(this, i));
                this._scaleHandles[i].on('drag', this._handleScaling.bind(this, i));
                this._scaleHandles[i].on('dragEnd', this._handleScalingEnd);
            }
            
            this._tempLayer.add(this._scaleHandles);
            this._updateScaleHandles();
        }

        _handleRotationStart(sGisEvent) {
            if (this.ignoreEvents) return;

            this._rotationBase = this._activeFeature.bbox.center.projectTo(this.map.crs).position;
            sGisEvent.draggingObject = this._rotationHandle;
            sGisEvent.stopPropagation();

            this.fire('rotationStart');
        }

        _handleRotation(sGisEvent) {
            let xPrev = sGisEvent.point.x + sGisEvent.offset.x;
            let yPrev = sGisEvent.point.y + sGisEvent.offset.y;

            let alpha1 = xPrev === this._rotationBase[0] ? Math.PI / 2 : Math.atan2(yPrev - this._rotationBase[1], xPrev - this._rotationBase[0]);
            let alpha2 = sGisEvent.point.x === this._rotationBase[0] ? Math.PI / 2 : Math.atan2(sGisEvent.point.y - this._rotationBase[1], sGisEvent.point.x - this._rotationBase[0]);
            let angle = alpha2 - alpha1;

            geotools.rotate(this._activeFeature, angle, this._rotationBase, this.map.crs);
            if (this.activeLayer) this.activeLayer.redraw();
            this._updateHandles();
        }
        
        _handleRotationEnd() {
            this.fire('rotationEnd');
        }

        _updateHandles() {
            if (this.enableRotation) this._updateRotationHandle();
            if (this.enableScaling) this._updateScaleHandles();

            this._tempLayer.redraw();
        }

        _updateRotationHandle() {
            let bbox = this._activeFeature.bbox.projectTo(this.map.crs);
            this._rotationHandle.position = [(bbox.xMin + bbox.xMax)/2, bbox.yMax];
        }

        _updateScaleHandles() {
            let bbox = this._activeFeature.bbox.projectTo(this.map.crs);
            let xs = [bbox.xMin, (bbox.xMin + bbox.xMax)/2, bbox.xMax];
            let ys = [bbox.yMin, (bbox.yMin + bbox.yMax)/2, bbox.yMax];

            for (let i = 0; i < 9; i++) {
                if (i === 4) continue;
                this._scaleHandles[i].position = [xs[i%3], ys[Math.floor(i/3)]];
            }
        }

        _handleScalingStart(index, sGisEvent) {
            if (this.ignoreEvents) return;
            
            sGisEvent.draggingObject = this._scaleHandles[index];
            sGisEvent.stopPropagation();
            
            this.fire('scalingStart');
        }

        _handleScaling(index, sGisEvent) {
            const MIN_SIZE = 10;
            let xIndex = index % 3;
            let yIndex = Math.floor(index / 3);

            let baseX = xIndex === 0 ? 2 : xIndex === 2 ? 0 : 1;
            let baseY = yIndex === 0 ? 2 : yIndex === 2 ? 0 : 1;
            let basePoint = this._scaleHandles[baseX + 3 * baseY].position;

            let bbox = this._activeFeature.bbox.projectTo(this.map.crs);
            let resolution = this.map.resolution;
            let tolerance = MIN_SIZE * resolution;
            let width = bbox.width;
            let xScale = baseX === 1 ? 1 : (width + (baseX - 1) * sGisEvent.offset.x) / width;
            if (width < tolerance && xScale < 1) xScale = 1;
            let height = bbox.height;
            let yScale = baseY === 1 ? 1 : (height + (baseY - 1) * sGisEvent.offset.y) / height;
            if (height < tolerance && yScale < 1) yScale = 1;

            geotools.scale(this._activeFeature, [xScale, yScale], basePoint, this.map.crs);
            if (this.activeLayer) this.activeLayer.redraw();
            this._updateHandles();
        }

        _handleScalingEnd() {
            this.fire('scalingEnd');
        }
    }

    /**
     * Symbol of the rotation handle.
     * @member {sGis.Symbol} sGis.controls.PolyTransform#rotationHandleSymbol
     * @default new PointSymbol({offset: {x: 0, y: -30}})
     */
    PolyTransform.prototype.rotationHandleSymbol = new PointSymbol({offset: {x: 0, y: -30}});

    /**
     * Symbol of the scaling handles.
     * @member {sGis.Symbol} sGis.controls.PolyTransform#scaleHandleSymbol
     * #default new SquareSymbol({ fillColor: 'transparent', strokeColor: 'black', strokeWidth: 2, size: 7 })
     */
    PolyTransform.prototype.scaleHandleSymbol = new SquareSymbol({ fillColor: 'transparent', strokeColor: 'black', strokeWidth: 2, size: 7 });

    /**
     * Distance in pixels between scaling handles and feature bbox.
     * @member {Number} sGis.controls.PolyTransform#scaleHandleOffset
     * @default 12
     */
    PolyTransform.prototype.scaleHandleOffset = 12;

    /**
     * If set to false the rotation handle will not be displayed.
     * @member {Boolean} sGis.controls.PolyTransform#enableRotation
     * @default true
     */
    PolyTransform.prototype.enableRotation = true;

    /**
     * If set to false the scaling handle will not be displayed.
     * @member {Boolean} sGis.controls.PolyTransform#enableScaling
     * @default true
     */
    PolyTransform.prototype.enableScaling = true;

    PolyTransform.prototype.ignoreEvents = false;
    
    return PolyTransform;

    /**
     * Rotation has started.
     * @event sGis.controls.PolyTransform#rotationStart
     * @type {Object}
     * @mixes sGisEvent
     */

    /**
     * Rotation has ended.
     * @event sGis.controls.PolyTransform#rotationEnd
     * @type {Object}
     * @mixes sGisEvent
     */

    /**
     * Scaling has started.
     * @event sGis.controls.PolyTransform#scalingStart
     * @type {Object}
     * @mixes sGisEvent
     */

    /**
     * Scaling has ended.
     * @event sGis.controls.PolyTransform#scalingEnd
     * @type {Object}
     * @mixes sGisEvent
     */

});
sGis.module('controls.Rectangle', [
    'controls.PolyDrag',
    'feature.Polygon'
], function(PolyDrag, Polygon) {

    'use strict';

    /**
     * Control for drawing rectangles by dragging from corner to corner.
     * @alias sGis.controls.Rectangle
     * @extends sGis.controls.PolyDrag
     */
    class Rectangle extends PolyDrag {
        _startNewFeature(point) {
            let position = point.position;
            this._activeFeature = new Polygon([[position, position, position, position]], { crs: point.crs, symbol: this.symbol });
            this.tempLayer.add(this._activeFeature);
        }

        _updateFeature(point) {
            let coord = this._activeFeature.rings[0];
            let pointCoord = point.position;

            coord = [[coord[0], [coord[1][0], pointCoord[1]], pointCoord, [pointCoord[0], coord[3][1]]]];

            this._activeFeature.rings = coord;
        }
    }

    return Rectangle;
    
});

sGis.module('controls.Snapping', [
    'Control',
    'FeatureLayer',
    'feature.Point',
    'symbol.point.Point',
    'Bbox',
    'geotools'
], (
    /** function(new:sGis.Control) */ Control,
    /** function(new:sGis.FeatureLayer) */ FeatureLayer,
    /** function(new:sGis.feature.Point) */ PointFeature,
    /** function(new:sGis.symbol.point.Point) */ PointSymbol,
    /** function(new:sGis.Bbox) */ Bbox,
    /** sGis.geotools */ geotools) => {

    'use strict';

    /**
     * Control for finding snapping points inside a layer during editing with other controls. When active it will watch
     * mousemove events and draw a little point whenever it can find an appropriate snapping.
     * @alias sGis.controls.Snapping
     * @extends sGis.Control
     */
    class Snapping extends Control {
        /**
         * @param {sGis.Map} map - map object the control will work with
         * @param {Object} [options] - key-value set of properties to be set to the instance
         */
        constructor(map, options = {}) {
            super(map, options);

            this._onMouseMove = this._onMouseMove.bind(this);
            this.isActive = options.isActive;
        }

        _activate() {
            this._tempLayer = new FeatureLayer();
            this.map.addLayer(this._tempLayer);
            this._setListeners();
        }

        _setListeners() {
            this.map.on('mousemove', this._onMouseMove);
        }

        _deactivate() {
            this._removeListeners();
            this.map.removeLayer(this._tempLayer);
            this._tempLayer = null;
            this._snapping = null;
        }

        _removeListeners() {
            this.map.off('mousemove', this._onMouseMove);
        }

        _onMouseMove(sGisEvent) {
            let point = sGisEvent.point;
            let snapping = this.getSnapping(point);

            this._tempLayer.features = snapping ? [ new PointFeature(snapping.position, {crs: point.crs, symbol: this.symbol}) ] : [];

            this._snapping = snapping;
        }

        /**
         * Returns snapping result for given point. If no snapping is found, null is returned.
         * @param {sGis.IPoint} point
         * @returns {sGis.controls.Snapping.SnappingResult|null}
         */
        getSnapping(point) {
            let distance = this.map.resolution * this.snappingDistance;
            for (var i = 0; i < this.snappingTypes.length; i++) {
                let snappingResult = snapping[this.snappingTypes[i]](point, this.activeLayer, distance, this.activeFeature, this.activeRingIndex, this.activePointIndex);
                if (snappingResult) return snappingResult;
            }
            return null;
        }

        /**
         * Position of the current snapping point.
         * @returns {sGis.controls.Snapping.SnappingResult|null}
         */
        get position() { return this._snapping && this._snapping.position; }
    }

    /**
     * The types of snapping to use. The priority of snapping is given by the order in this list (earlier in the list is more important). Possible values are:<br>
     *     * vertex - snaps to any point in the active layer. This includes point features and vertexes of polylines and polygons.<br>
     *     * midpoint - snaps to middle points of sides of polylines and polygons.<br>
     *     * line - snaps to any point on sides of polylines and polygons.<br>
     *     * axis - if activeFeature, activeRingIndex and activePointIndex properties are set, snaps to position on the plane so that the current point would make a vertical or horizontal line with its neighbours.<br>
     *     * orthogonal - if activeFeature, activeRingIndex and activePointIndex properties are set, snaps to position on the plane so that the current point would make a 90deg angle with its neighbours.
     * @member {String[]} sGis.controls.Snapping#snappingTypes
     * @default ['vertex', 'midpoint', 'line', 'axis', 'orthogonal']
     */
    Snapping.prototype.snappingTypes = ['vertex', 'midpoint', 'line', 'axis', 'orthogonal'];

    /**
     * Symbol of the snapping point
     * @member {sGis.Symbol} sGis.controls.Snapping#symbol
     * #default new PointSymbol({fillColor: 'red', size: 5})
     */
    Snapping.prototype.symbol = new PointSymbol({fillColor: 'red', size: 5});

    /**
     * Maximum distance in pixels from current point to the snapping point.
     * @member {Number} sGis.controls.Snapping#snappingDistance
     * #default 7
     */
    Snapping.prototype.snappingDistance = 7;

    /**
     * The feature that is being edited currently. Setting this property is necessary to prevent snapping to self, and to calculate certain types of snapping.
     * @member {sGis.Feature} sGis.controls.Snapping#activeFeature
     */
    Snapping.prototype.activeFeature = null;

    /**
     * If the feature that is being edited is a polyline or polygon, represents the contour index that is being edited currently.
     * @member {Number} sGis.controls.Snapping#activeRingIndex
     */
    Snapping.prototype.activeRingIndex = null;

    /**
     * If the feature that is being edited is a polyline or polygon, represents the point index in the contour that is being edited currently.
     * @member {Number} sGis.controls.Snapping#activePointIndex
     */
    Snapping.prototype.activePointIndex = null;

    var snapping = {
        vertex: function(point, layer, distance, activeFeature, activeRing, activeIndex) {
            let bbox = new Bbox([point.x - distance, point.y - distance], [point.x + distance, point.y + distance], point.crs);
            let features = layer.getFeatures(bbox);

            for (let i = 0; i < features.length; i++) {
                let feature = features[i].crs.equals(point.crs) ? features[i] : features[i].projectTo(point.crs);

                if (feature.position) {
                    if (features[i] === activeFeature) continue;
                    if (Math.abs(feature.x - point.x) < distance && Math.abs(feature.y - point.y) < distance) {
                        return { position: feature.position, feature: features[i] };
                    }
                } else if (feature.rings) {
                    let rings = feature.rings;
                    for (let ring = 0; ring < rings.length; ring++) {
                        for (let j = 0; j < rings[ring].length; j++) {
                            if (features[i] === activeFeature && ring === activeRing && (Math.abs(j - activeIndex) < 2 || Math.abs(j - activeIndex) === rings[ring].length - 1)) continue;

                            if (Math.abs(rings[ring][j][0] - point.x) < distance && Math.abs(rings[ring][j][1] - point.y) < distance) {
                                return { position: rings[ring][j], feature: features[i], ring: ring, index: j };
                            }
                        }
                    }
                }
            }
        },

        midpoint: function(point, layer, distance, activeFeature, activeRing, activeIndex) {
            let bbox = new Bbox([point.x - distance, point.y - distance], [point.x + distance, point.y + distance], point.crs);
            let features = layer.getFeatures(bbox);

            for (let  i = 0; i < features.length; i++) {
                if (!features[i].rings) continue;
                let feature = features[i].crs.equals(point.crs) ? features[i] : features[i].projectTo(point.crs);
                let rings = feature.rings;

                for (let ringIndex = 0; ringIndex < rings.length; ringIndex++) {
                    let ring = feature.isEnclosed ? rings[ringIndex].concat([rings[ringIndex][0]]) : rings[ringIndex];

                    for (let j = 1; j < ring.length; j++) {
                        if (features[i] === activeFeature && ringIndex === activeRing && (j === activeIndex || j-1 === activeIndex || activeIndex === 0 && j === ring.length-1)) continue;

                        let midPointX = (ring[j][0] + ring[j-1][0]) / 2;
                        let midPointY = (ring[j][1] + ring[j-1][1]) / 2;

                        if (Math.abs(midPointX - point.x) < distance && Math.abs(midPointY - point.y) < distance) {
                            return { position: [midPointX, midPointY], feature: features[i], ring: ringIndex, index: j };
                        }
                    }
                }
            }
        },

        line: function(point, layer, distance, activeFeature, activeRing, activeIndex) {
            let bbox = new Bbox([point.x - distance, point.y - distance], [point.x + distance, point.y + distance], point.crs);
            let features = layer.getFeatures(bbox);

            for (let i = 0; i < features.length; i++) {
                if (!features[i].rings) continue;

                let feature = features[i].crs.equals(point.crs) ? features[i] : features[i].projectTo(point.crs);
                let rings = feature.rings;

                for (let ringIndex = 0; ringIndex < rings.length; ringIndex++) {
                    let ring = feature.isEnclosed ? rings[ringIndex].concat([rings[ringIndex][0]]) : rings[ringIndex];

                    for (let j = 1; j < ring.length; j++) {
                        if (features[i] === activeFeature && ringIndex === activeRing && (j === activeIndex || j-1 === activeIndex || activeIndex === 0 && j === ring.length-1)) continue;

                        let projection = geotools.pointToLineProjection(point.position, [ring[j-1], ring[j]]);

                        let minX = Math.min(ring[j-1][0], ring[j][0]);
                        let maxX = Math.max(ring[j-1][0], ring[j][0]);
                        if (projection[0] >= minX && projection[0] <= maxX && Math.abs(projection[0] - point.x) < distance && Math.abs(projection[1] - point.y) < distance) {
                            return { position: projection, feature: features[i], ring: ringIndex, index: j-1 };
                        }
                    }
                }
            }
        },

        axis: function(point, layer, distance, activeFeature, activeRing = null, activeIndex = null) {
            if (!activeFeature || activeRing === null || activeIndex === null) return null;

            let lines = [];
            let ring = activeFeature.rings[activeRing].slice();
            if (activeFeature.isEnclosed) ring.push(ring[0]);

            if (activeIndex < ring.length - 1) {
                lines.push([ring[activeIndex], ring[activeIndex + 1]]);
            }
            if (activeIndex === 0) {
                if (activeFeature.isEnclosed) lines.push([ring[activeIndex], ring[ring.length - 2]]);
            } else {
                lines.push([ring[activeIndex], ring[activeIndex - 1]]);
            }

            var basePoint = [];
            for (let i = 0; i < lines.length; i++) {
                for (let axis = 0; axis < 2; axis++) {
                    let projection = [lines[i][axis][0], lines[i][(axis + 1)%2][1]];
                    if (Math.abs(projection[0] - point.x) < distance && Math.abs(projection[1] - point.y) < distance) {
                        basePoint[(axis+1)%2] = lines[i][1][(axis+1)%2];
                        break;
                    }
                }
            }

            if (basePoint.length > 0) {
                let position = [basePoint[0] === undefined ? point.x : basePoint[0], basePoint[1] === undefined ? point.y : basePoint[1]];
                return { position: position, feature: activeFeature, ring: activeRing, index: activeIndex };
            }
        },

        orthogonal: function(point, layer, distance, activeFeature, activeRing = null, activeIndex = null) {
            if (!activeFeature || activeRing === null || activeIndex === null) return null;
            
            let lines = [];
            let ring = activeFeature.rings[activeRing].slice();
            if (activeFeature.isEnclosed) {
                var n = ring.length;
                lines.push([ring[(activeIndex+1) % n], ring[(activeIndex+2) % n]]);
                lines.push([ring[(n + activeIndex - 1) % n], ring[(n + activeIndex - 2) % n]]);
            } else {
                if (ring[activeIndex+2]) {
                    lines.push([ring[activeIndex+1], ring[activeIndex+2]]);
                }
                if (ring[activeIndex-2]) {
                    lines.push([ring[activeIndex-1], ring[activeIndex-2]]);
                }
            }

            for (let i = 0; i < lines.length; i++) {
                let projection = geotools.pointToLineProjection(point.position, lines[i]);
                let dx = projection[0] - lines[i][0][0];
                let dy = projection[1] - lines[i][0][1];
                if (Math.abs(dx) < distance && Math.abs(dy) < distance) {
                    let basePoint = [point.x - dx, point.y - dy];
                    let direction = i === 0 ? 1 : -1;
                    let nextPoint = n ? ring[(n + activeIndex + direction) % n] : ring[activeIndex + direction];
                    let prevPoint = n ? ring[(n + activeIndex - direction) % n] : ring[activeIndex - direction];
                    if (nextPoint && prevPoint) {
                        projection = geotools.pointToLineProjection(prevPoint, [ring[activeIndex], nextPoint]);
                        if (Math.abs(projection[0] - point.x) < distance && Math.abs(projection[1] - point.y) < distance) {
                            basePoint = projection;
                        }
                    }
                    return { position: basePoint, feature: activeFeature, ring: activeRing, index: activeIndex };
                }
            }
        }
    };

    return Snapping;

    /**
     * @typedef {Object} sGis.controls.Snapping.SnappingResult
     * @prop {Position} position - position of the snapping point
     * @prop {sGis.Feature} feature - feature that the snapping snapped to
     * @prop {Number} ring - if the feature is sGis.feature.Poly instance, this property will contain the contour index which triggered snapping
     * @prop {Number} index - if the feature is sGis.feature.Poly instance, this property will contain the index of vertex in contour which is followed by snapping point.
     *                        E.g. if the point snapped to the [i, i+1] side of the ring, i will be set as the value of this property.
     */

});
sGis.module('Feature', [
    'utils',
    'CRS',
    'Bbox',
    'EventHandler'
], function(utils, CRS, Bbox, EventHandler) {

    'use strict';

    /**
     * @namespace sGis.feature
     */

    var defaults = {
        _crs: CRS.geo,
        _symbol: null,
        _hidden: false
    };

    /**
     * Abstract feature object without any geometry. All other features inherit from this class. It can be used to store attributes in the way compatible with other features.
     * @alias sGis.Feature
     * @extends sGis.EventHandler
     */
    class Feature extends EventHandler {
        /**
         * Sets default coordinate system for all features.<br><br>
         *     <strong>
         *     NOTE: This method affects all already created features that do not have explicitly specified crs.
         *     You should use this function only when initializing library.
         *     </strong>
         * @param {sGis.Crs} crs
         * @static
         */
        static setDefaultCrs(crs) {
            Feature.prototype._crs = crs;
        }

        /**
         * @constructor
         * @param {Object} [properties] - key-value list of the properties to be assigned to the instance
         */
        constructor(properties = {}) {
            super();
            var copy = utils.extend({}, properties);
            if (copy.crs){
                this._crs = copy.crs;
                delete copy.crs;
            }

            utils.init(this, copy, true);
        }

        /**
         * Renders the feature with the given parameters.
         * @param {Number} resolution
         * @param {sGis.Crs} crs
         * @returns {sGis.IRender[]}
         */
        render(resolution, crs) {
            if (this._hidden || !this.symbol) return [];
            if (!this._needToRender(resolution, crs)) return this._rendered.renders;

            /**
             * @type {{resolution: Number, crs: sGis.Crs, renders: sGis.IRender[]}}
             * @private
             */
            this._rendered = {
                resolution: resolution,
                crs: crs,
                renders: this.symbol.renderFunction(this, resolution, crs)
            };

            return this._rendered.renders;
        }

        _needToRender(resolution, crs) {
            return !this._rendered || this._rendered.resolution !== resolution || this._rendered.crs !== crs;
        }

        /**
         * Returns the cached render of the feature.
         * @returns {{resolution: Number, crs: sGis.Crs, renders: sGis.IRender[]}}
         */
        getRenderCache() {
            return this._rendered;
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
        set symbol(/** sGis.Symbol */ symbol) {
            this._symbol = symbol;
            this.redraw();
        }

        /**
         * Specifies weather the feature is hidden by .hide() method.
         * @type Boolean
         * @readonly
         */
        get hidden() { return this._hidden; }

        /**
         * Bounding box of the feature.
         * @type {sGis.Bbox}
         * @readonly
         */
        get bbox() { return new Bbox([Math.MIN_VALUE, Math.MIN_VALUE], [Math.MAX_VALUE, Math.MAX_VALUE], this.crs); }
    }

    utils.extend(Feature.prototype, defaults);


    return Feature;

    /**
     * @typedef {function(Object)} sGis.Feature.constructor
     * @returns sGis.Feature
     */

});

sGis.module('feature.Image', [
    'utils',
    'Feature',
    'symbol.image.Image'
], function(utils, Feature, ImageSymbol) {

    'use strict';

    var defaults = {
        _src: null,
        _symbol: new ImageSymbol()
    };

    /**
     * @alias sGis.feature.Image
     * @extends sGis.Feature
     */
    class ImageF extends Feature {
        /**
         * @constructor
         * @param {sGis.Bbox} bbox - bbox that the image will fit
         * @param {Object} [properties] - key-value list of the properties to be assigned to the instance
         */
        constructor(bbox, properties) {
            super(properties);
            this.bbox = bbox;
        }

        /**
         * @override
         * @private
         */
        _needToRender(resolution, crs) {
            return !this.getRenderCache();
        }

        /**
         * Source of the image. Can be html address or data:url string.
         * @type String
         * @default null
         */
        get src() { return this._src; }
        set src(/** String */ src) {
            this._src = src;
            this.redraw();
        }

        /**
         * Bbox that the image will fit
         * @type sGis.Bbox
         */
        get bbox() { return this._bbox; }
        set bbox(/** sGis.Bbox */ bbox) {
            this._bbox = bbox.projectTo(this.crs);
            this.redraw();
        }
    }

    /**
     * Current symbol of the feature. If temporary symbol is set, the value will be the temporary symbol.
     * @member symbol
     * @memberof sGis.feature.Image
     * @type sGis.Symbol
     * @instance
     * @default new sGis.symbol.image.Image()
     */

    utils.extend(ImageF.prototype, defaults);

    return ImageF;

});

sGis.module('feature.Label', [
    'utils',
    'Feature',
    'symbol.label.Label',
    'Bbox',
    'Point'
], function(utils, Feature, LabelSymbol, Bbox, Point) {
    'use strict';

    var defaults = {
        _content: '',
        _symbol: new LabelSymbol()
    };

    /**
     * Text label on the map.
     * @alias sGis.feature.Label
     * @extends sGis.Feature
     */
    class Label extends Feature {
        /**
         * @constructor
         * @param {Number[]|sGis.Point} position - anchor point of the label. Array is in [x,y] format.
         * @param {Object} [properties] - key-value list of the properties to be assigned to the instance
         */
        constructor(position, properties) {
            super(properties);
            this.coordinates = position;
        }

        get position() { return this._position; }
        set position(position) {
            this._position = position;
            this.redraw();
        }

        /**
         * Position of the label
         * @type {sGis.Point}
         */
        get point() { return new Point(this.position, this.crs); }
        set point(/** sGis.Point */ point) {
            this.position  = point.projectTo(this.crs).position;
        }

        /**
         * Position of the label
         * @type {Number[]}
         */
        get coordinates() { return this._position.slice(); }
        set coordinates(/** Number[] */ point) {
            this.position = point.slice();
        }

        /**
         * Text of the label. Can be any html string.
         * @type String
         */
        get content() { return this._content; }
        set content(/** String */ content) {
            this._content = content;
            this.redraw();
        }

        get bbox() {
            return new Bbox(this.position, this.position, this.crs);
        }
    }

    /**
     * Current symbol of the feature. If temporary symbol is set, the value will be the temporary symbol.
     * @member symbol
     * @memberof sGis.feature.Label
     * @type sGis.Symbol
     * @instance
     * @default new sGis.symbol.label.Label()
     */

    utils.extend(Label.prototype, defaults);

    return Label;

});

sGis.module('feature.Maptip', [
    'Feature',
    'Point',
    'Bbox',
    'symbol.maptip.Simple'
], function(Feature, Point, Bbox, MaptipSymbol) {

    'use strict';

    /**
     * Information box on the map
     * @alias sGis.feature.Maptip
     * @extends sGis.Feature
     * @implements sGis.IPoint
     */
    class Maptip extends Feature {
        /**
         * @constructor
         * @param {Position} position - reference point of the information box
         * @param {Object} properties - key-value set of properties to be assigned to the instance
         */
        constructor(position, properties) {
            super(properties);
            this._position = position;
        }

        /**
         * HTML content of the infobox.
         * @type {String}
         */
        get content() { return this._content; }
        set content(/** String */ content) {
            this._content = content;
            this.redraw();
        }

        /**
         * Reference point of the information box. The box arrow will point to this position.
         * @type {Position}
         */
        get position() { return this._position; }
        set position(/** Position */ position) {
            this._position = position;
            this.redraw();
        }

        /**
         * Returns new maptip with position projected to the specified coordinate system.
         * @param {sGis.Crs} crs - target coordinate system
         * @returns {sGis.feature.Maptip}
         */
        projectTo(crs) {
            let projected = this.point.projectTo(crs);
            return new Maptip(projected.position, { crs: crs, content: this.content });
        }

        /**
         * Reference point of the information box.
         * @type {sGis.Point}
         * @readonly
         */
        get point() {
            return new Point(this.position, this.crs);
        }

        /**
         * X coordinate of the reference point.
         * @type {Number}
         * @readonly
         */
        get x() {
            return this.position[0];
        }

        /**
         * Y coordinate of the reference point.
         * @type {Number}
         * @readonly
         */
        get y() {
            return this.position[1];
        }

        /**
         * Bounding box of the feature.
         * @type {sGis.Bbox}
         * @readonly
         */
        get bbox() { return new Bbox(this._position, this._position, this.crs); }
    }

    /**
     * Current symbol of the feature. If temporary symbol is set, the value will be the temporary symbol.
     * @member symbol
     * @memberof sGis.feature.Maptip
     * @type sGis.Symbol
     * @instance
     * @default new sGis.symbol.Maptip()
     */
    Maptip.prototype._symbol = new MaptipSymbol();


    return Maptip;

});

sGis.module('feature.MultiPoint', [
    'Feature',
    'Point',
    'Bbox',
    'feature.Point',
    'symbol.point.Point'
], function(Feature, Point, Bbox, PointF, PointSymbol) {
    'use strict';

    /**
     * Represents a set of points on a map that behave as one feature: have same symbol, can be added, transformed or removed as one.
     * @alias sGis.feature.MultiPoint
     * @extends sGis.Feature
     */
    class MultiPoint extends Feature {
        /**
         * @param {Position[]} points - set of the points' coordinates
         * @param {Object} properties - key-value set of properties to be set to the instance
         */
        constructor(points = [], properties = {}) {
            super(properties);
            this._points = points;
        }

        /**
         * Set of points' coordinates
         * @type {Position[]}
         * @default []
         */
        get points() { return this._points; }
        set points(/** Position[] */ points) {
            this._points = points.slice();
            this._update();
        }

        /**
         * Returns a copy of the feature, projected into the given coordinate system. Only generic properties are copied to the projected feature.
         * @param {sGis.Crs} crs - target coordinate system.
         * @returns {sGis.feature.MultiPoint}
         */
        projectTo(crs) {
            var projected = [];
            this._points.forEach(point => {
                projected.push(new Point(point, this.crs).projectTo(crs).coordinates);
            });

            return new MultiPoint(projected, {symbol: this.symbol, crs: crs});
        }

        /**
         * Returns a copy of the feature. Only generic properties are copied.
         * @returns {sGis.feature.MultiPoint}
         */
        clone() {
            return this.projectTo(this.crs);
        }

        /**
         * Adds a point to the end of the coordinates' list
         * @param {sGis.IPoint|Position} point - if sGis.IPoint instance is given, it will be automatically projected to the multipoint coordinate system.
         */
        addPoint(point) {
            if (point.position && point.crs) {
                this._points.push(point.projectTo(this.crs).position);
            } else {
                this._points.push([point[0], point[1]]);
            }
            this._update();
        }

        _update() {
            this._bbox = null;
            this.redraw();
        }

        render(resolution, crs) {
            if (this.hidden || !this.symbol) return [];
            if (!this._needToRender(resolution, crs)) return this._rendered.renders;

            var renders = [];
            this._points.forEach(point => {
                var f = new PointF(point, {crs: this.crs, symbol: this.symbol});
                renders = renders.concat(f.render(resolution, crs));
            });

            this._rendered = {
                resolution: resolution,
                crs: crs,
                renders: renders
            };

            return this._rendered.renders;
        }

        get bbox() {
            if (this._bbox) return this._bbox;
            let xMin = Number.MAX_VALUE;
            let yMin = Number.MAX_VALUE;
            let xMax = Number.MIN_VALUE;
            let yMax = Number.MIN_VALUE;

            this._points.forEach(point => {
                xMin = Math.min(xMin, point[0]);
                yMin = Math.min(yMin, point[1]);
                xMax = Math.max(xMax, point[0]);
                yMax = Math.max(yMax, point[1]);
            });

            this._bbox = new Bbox([xMin, yMin], [xMax, yMax], this.crs);
            return this._bbox;
        }

        /**
         * @deprecated 
         */
        get coordinates() { return this._points.slice(); }
        set coordinates(points) { this.points = points; }
    }

    /**
     * Current symbol of the feature. If temporary symbol is set, the value will be the temporary symbol.
     * @member symbol
     * @memberof sGis.feature.MultiPoint
     * @type {sGis.Symbol}
     * @instance
     * @default new sGis.symbol.point.Point()
     */
    MultiPoint.prototype._symbol = new PointSymbol();

    return MultiPoint;

});

sGis.module('feature.Point', [
    'utils',
    'Feature',
    'Crs',
    'Point',
    'Bbox',
    'symbol.point.Point'
], function(utils, Feature, Crs, Point, Bbox, PointSymbol) {

    'use strict';

    /**
     * Simple geographical point.
     * @alias sGis.feature.Point
     * @extends sGis.Feature
     * @implements sGis.IPoint
     */
    class PointF extends Feature {
        /**
         * @param {Position} position - coordinates of the point
         * @param {Object} properties - key-value set of properties to be set to the instance
         */
        constructor(position, properties) {
            super(properties);
            this._position = position;
        }

        projectTo(crs) {
            var projected = Point.prototype.projectTo.call(this, crs);
            return new PointF(projected.position, { crs: crs, symbol: this.symbol });
        }

        /**
         * Returns a copy of the point. The copy will include all sGis.Point properties, but will not copy of user defined properties or event listeners.
         */
        clone() {
            return this.projectTo(this.crs);
        }

        get bbox() { return new Bbox(this._position, this._position, this.crs); }

        get position() { return [].concat(this._position); }
        set position(position) {
            this._position = position;
            this.redraw();
        }
        
        get point() { return new Point(this.position, this.crs); }
        set point(point) { this.position = point.projectTo(this.crs).position; }

        get x() { return this._position[0]; }
        set x(x) {
            this._position[0] = x;
            this.redraw();
        }

        get y() { return this._position[1]; }
        set y(y) {
            this._position[1] = y;
            this.redraw();
        }

        get coordinates() { return this.position.slice(); }
        set coordinates(position) { this.position = position.slice(); }
    }

    /**
    * Current symbol of the feature. If temporary symbol is set, the value will be the temporary symbol.
    * @member symbol
    * @memberof sGis.feature.Point
    * @type {sGis.Symbol}
    * @instance
    * @default new sGis.symbol.point.Point()
    */

    PointF.prototype._symbol = new PointSymbol(); 

    return PointF;

});

sGis.module('feature.Poly', [
    'utils',
    'Feature',
    'Bbox',
    'geotools'
], function(utils, /** sGis.Feature */ Feature, Bbox, geotools) {

    'use strict';

    /**
     * Base class for polylines and polygons.
     * @alias sGis.feature.Poly
     * @extends sGis.Feature
     */
    class Poly extends Feature {
        /**
         * @param {Position[][]} rings - coordinates of the feature
         * @param {Object} properties - key-value set of properties to be set to the instance
         */
        constructor(rings, properties) {
            super(properties);
            if (rings && rings.length > 0) {
                if (rings[0].length > 0 && !Array.isArray(rings[0][0])) rings = [rings];
                this.rings = utils.copyArray(rings);
            } else {
                this._rings = [[]];
            }
        }

        /**
         * Array of contours of coordinates. The contours must be not-enclosed for both polylines and polygons (first and last points of a contour must not be same)
         * @type {Position[][]}
         * @default [[]] 
         */
        get rings() { return this._rings; }
        set rings(/** Position[][] */ rings) {
            this._rings = rings;
            this._update();
        }

        /**
         * Adds a point to the end of the specified contour (ring).
         * @param {sGis.Point|Position} point - point to be added. If sGis.Point is given, the point will be automatically projected to the feature coordinate system. 
         * @param {Number} [ringN] - number of the ring the point will be added to. If not specified, the point will be added to the last ring.
         */
        addPoint(point, ringN) {
            if (!ringN) ringN = this._rings.length - 1;
            this.setPoint(ringN, this._rings[ringN].length, point);
        }

        /**
         * Removes a point from the feature.
         * @param {Number} ringN - index of the ring (contour) the point will be removed from.
         * @param {Number} index - index of the point in the ring.
         */
        removePoint(ringN, index) {
            this._rings[ringN].splice(index, 1);
            if (this._rings[ringN].length === 0) {
                this.removeRing(ringN);
            }
            this._update();
        }

        /**
         * Removes a ring (contour) from the feature.
         * @param {Number} ringN - index of the ring to be removed.
         */
        removeRing(ringN) {
            this._rings.splice(ringN, 1);
            this._update();
        }

        _update() {
            this._bbox = null;
            this.redraw();
        }

        /**
         * Returns a copy of the feature. Only generic properties are copied.
         * @returns {sGis.feature.Poly}
         */
        clone() {
            return new Poly(this.rings, { crs: this.crs });
        }

        /**
         * Returns a copy of the feature, projected into the given coordinate system. Only generic properties are copied to the projected feature.
         * @param {sGis.Crs} crs - target coordinate system.
         * @returns {sGis.feature.Poly}
         */
        projectTo(crs) {
            let projected = geotools.projectRings(this.rings, this.crs, crs);
            return new Poly(projected, { crs: crs, symbol: this.symbol });
        }

        /**
         * Sets new coordinates for a contour.
         * @param {Number} ringN - index of the contour to be set. If the index is larger then the number of rings of the feature, new ring will be appended to the ring list.
         * @param {Position[]} ring - coordinate set of the contour.
         */
        setRing(ringN, ring) {
            ringN = Math.min(ringN, this._rings.length);
            this._rings[ringN] = ring;
            this._update();
        }

        /**
         * Sets a new value for a point in the feature.
         * @param {Number} ringN - index of the contour of the point.
         * @param {Number} pointN - index of the point in the contour.
         * @param {Position|sGis.IPoint} point - new coordinates
         */
        setPoint(ringN, pointN, point) {
            pointN = Math.min(pointN, this._rings[ringN].length);
            this._rings[ringN][pointN] = point.position && point.projectTo ? point.projectTo(this.crs).position : point;
            this._update();
        }

        /**
         * Inserts a new point to the given position.
         * @param {Number} ringN - index of the contour the point will be inserted into.
         * @param {Number} pointN - index of the point to insert to.
         * @param {Position|sGis.IPoint} point - point to be inserted
         */
        insertPoint(ringN, pointN, point) {
            pointN = Math.min(pointN, this._rings[ringN].length);
            this._rings[ringN].splice(pointN, 0, [0, 0]);
            this.setPoint(ringN, pointN, point);
        }

        /**
         * Bounding box of the feature
         * @type {sGis.Bbox}
         */
        get bbox() {
            if (this._bbox) return this._bbox;
            let xMin = Number.MAX_VALUE;
            let yMin = Number.MAX_VALUE;
            let xMax = -Number.MAX_VALUE;
            let yMax = -Number.MAX_VALUE;

            this._rings.forEach(ring => {
                ring.forEach(point => {
                    xMin = Math.min(xMin, point[0]);
                    yMin = Math.min(yMin, point[1]);
                    xMax = Math.max(xMax, point[0]);
                    yMax = Math.max(yMax, point[1]);
                });
            });

            this._bbox = new Bbox([xMin, yMin], [xMax, yMax], this.crs);
            return this._bbox;
        }

        /**
         * Center of the feature. At the point it's the middle point of feature's bounding box.
         * @type {Position}
         */ 
        get centroid() {
            let bbox = this.bbox;
            let x = (bbox.xMin + bbox.xMax) / 2;
            let y = (bbox.yMin + bbox.yMax) / 2;
            return [x, y];
        }

        /**
         * @deprecated
         */
        get coordinates() { return utils.copyArray(this._rings); }
        set coordinates(rings) { this.rings = utils.copyArray(rings); }
    }

    return Poly;

    /**
     * @typedef {function(Position[][], Object)} sGis.feature.Poly.constructor
     * @returns sGis.feature.Poly
     */
});

sGis.module('feature.Polygon', [
    'feature.Poly',
    'symbol.polygon.Simple'
], function(Poly, PolygonSymbol) {
    
    'use strict';

    /**
     * Polygon with one or more contours (rings). Coordinates in the contours must not be enclosed (first and last points must not be same).
     * @alias sGis.feature.Polygon
     * @extends sGis.feature.Poly
     */
    class Polygon extends Poly {
        /**
         * Returns a copy of the feature. Only generic properties are copied.
         * @returns {sGis.feature.Polygon}
         */
        clone() {
            return new Polygon(this.rings, {crs: this.crs, symbol: this.originalSymbol});
        }
    }

    /**
     * Current symbol of the feature. If temporary symbol is set, the value will be the temporary symbol.
     * @member symbol
     * @memberof sGis.feature.Polygon
     * @type {sGis.Symbol}
     * @instance
     * @default new sGis.symbol.polygon.Simple()
     */
    Polygon.prototype._symbol = new PolygonSymbol();
    
    Polygon.prototype.isEnclosed = true;

    return Polygon;

});

sGis.module('feature.Polyline', [
    'feature.Poly',
    'symbol.polyline.Simple'
], function(Poly, PolylineSymbol) {

    'use strict';

    /**
     * A line or a set of geographical lines.
     * @alias sGis.feature.Polyline
     * @extends sGis.feature.Poly
     */
    class Polyline extends Poly {
        /**
         * Returns a copy of the feature. Only generic properties are copied.
         * @returns {sGis.feature.Polyline}
         */
        clone() {
            return new Polyline(this.rings, {crs: this.crs, symbol: this.originalSymbol});
        }
    }

    /**
     * Current symbol of the feature. If temporary symbol is set, the value will be the temporary symbol.
     * @member symbol
     * @memberof sGis.feature.Polyline
     * @type {sGis.Symbol}
     * @instance
     * @default new sGis.symbol.polyline.Simple()
     */
    Polyline.prototype._symbol = new PolylineSymbol();

    return Polyline;

});

/**
 * @interface sGis.IPoint
 */

/**
 * Position of the point given in object's own coordinate system in [x, y] format.
 * @member {Position} sGis.IPoint#position
 */

/**
 * Object's coordinate system.
 * @member {sGis.Crs} sGis.IPoint#crs
 */

/**
 * Returns a copy of the object, projected to the specified coordinate system.
 * @method
 * @name sGis.IPoint#projectTo
 * @returns {sGis.IPoint}
 */

/**
 * Position of the point with specified coordinate system.
 * @member {sGis.Point} sGis.IPoint#point
 */

/**
 * X coordinate
 * @member {Number} sGis.IPoint#x
 */

/**
 * Y coordinate
 * @member {Number} sGis.IPoint#y
 */


/**
 * @typedef Position
 * @type {Array}
 * @prop {Number} 0 - first (X) coordinate
 * @prop {Number} 1 - second (Y) coordinate
 */
/**
 * @interface sGis.IRender
 */

/**
 * Returns true if 'position' is inside the rendered arc.
 * @method
 * @name sGis.IRender#contains
 * @param {Object} position - position in the rendered (px) coordinates in {x: X, y: Y} format.
 * @returns {boolean}
 */

/**
 * Specifies whether the render is vector or dom
 * @member {Boolean} sGis.IRender#isVector
 * @readonly
 */

/**
 * @namespace sGis.render
 */
sGis.module('render.Arc', [
], function() {
    
    'use strict';

    var defaults = {
        /**
         * The center of the arc in [x, y] format
         * @member {Position} sGis.render.Arc#center
         */
        center: null,

        /**
         * The radius of the arc
         * @member {Number} sGis.render.Arc#radius
         * @default 5
         */
        radius: 5,

        /**
         * The stroke color of the arc (outline color). The value can be any valid css color string.
         * @member {String} sGis.render.Arc#strokeColor
         * @default "black"
         */
        strokeColor: 'black',

        /**
         * The stroke width of the arc.
         * @member {Number} sGis.render.Arc#strokeWidth
         * @default 1
         */
        strokeWidth: 1,

        /**
         * The fill color of the arc. The value can be any valid css color string.
         * @member {String} sGis.render.Arc#fillColor
         * @default "transparent"
         */
        fillColor: 'transparent',

        /**
         * Specifies whether this render can catch mouse events. If true, this render will be transparent for any pointer events.
         * @member {Boolean} sGis.render.Arc#ignoreEvents
         * @default false
         */
        ignoreEvents: false,

        /**
         * Start angle of the sector.
         * @member {Number} sGis.render.Arc#startAngle
         * @default 0
         */
        startAngle: 0,

        /**
         * End angle of the sector.
         * @member {Number} sGis.render.Arc#endAngle
         * @default 2 * Math.PI
         */
        endAngle: 2 * Math.PI,

        /**
         * Shows whether the arc is a sector of a circle rather then simple arc. Set to false if you need to draw a circle, for sector has all its boundaries outlined.
         * @member {Boolean} sGis.render.Arc#isSector
         * @default false
         */
        isSector: false,

        /**
         * Direction of the arc.
         * @member {Boolean} sGis.render.Arc#clockwise
         * @default true
         */
        clockwise: true
    };

    /**
     * Rendered arc (circle) on a map.
     * @alias sGis.render.Arc
     * @implements sGis.IRender
     */
    class Arc {
        /**
         * @param {Position} center - the center of the arc, in the [x, y] format.
         * @param {Object} [options] - key-value options of any Arc parameters
         */
        constructor(center, options) {
            Object.assign(this, options);
            this.center = center;
        }

        contains(position) {
            var dx = position[0] - this.center[0];
            var dy = position[1] - this.center[1];
            var distance2 = dx * dx + dy * dy;

            return distance2 < (this.radius + 2)*(this.radius + 2);
        }

        get isVector() { return true; }
    }

    Object.assign(Arc.prototype, defaults);
    
    return Arc;
    
});
sGis.module('render.HtmlElement', [
], () => {
    
    'use strict';

    /**
     * Custom HTML element on the map.
     * @alias sGis.render.HtmlElement
     * @implements sGis.IRender
     */
    class HtmlElement {
        /**
         * @constructor
         * @param {String} htmlText - the inner html value of html element
         * @param {Position} position - projected position of render in [x, y] format
         * @param {Function} [onAfterDisplayed] - callback function that will be called after a render node is drawn to the DOM
         * @param offset
         */
        constructor(htmlText, position, onAfterDisplayed, offset) {
            this._htmlText = htmlText;
            this._position = position;
            this.onAfterDisplayed = onAfterDisplayed;
            this.offset = offset;
        }

        static get isVector() { return false; }

        /**
         * Returns HTML div element as the second parameter to callback function 
         * @param {Function} callback - callback function that will be called after node is ready
         */
        getNode(callback) {
            var node = document.createElement('div');
            node.innerHTML = this._htmlText;
            this._lastNode = node;
            callback(null, node);
        }

        /**
         * Position of the render in [x, y] format
         * @type Position
         * @readonly
         */
        get position() { return this._position; }

        contains(position) {
            let width = this._lastNode.clientWidth || this._lastNode.offsetWidth || 0;
            let height = this._lastNode.clientHeight || this._lastNode.offsetHeight || 0;

            let x = this._position[0] + (this.offset && this.offset[0] || 0);
            let y = this._position[1] + (this.offset && this.offset[1] || 0);

            return x < position[0] && y < position[1] && x + width > position[0] && y + height > position[1];
        }
    }

    return HtmlElement;

});
sGis.module('render.HtmlNode', [
], () => {

    'use strict';

    /**
     * Custom HTML element on the map.
     * @alias sGis.render.HtmlNode
     * @implements sGis.IRender
     */
    class HtmlNode {
        /**
         * @constructor
         * @param {HTMLElement} node - content node
         * @param {Position} position - projected position of render in [x, y] format
         * @param {Function} [onAfterDisplayed] - callback function that will be called after a render node is drawn to the DOM
         * @param offset
         */
        constructor(node, position, onAfterDisplayed, offset) {
            this._node = node;
            this._position = position;
            this.onAfterDisplayed = onAfterDisplayed;
            this.offset = offset;
        }

        static get isVector() { return false; }

        /**
         * Returns HTML element as the second parameter to callback function
         * @param {Function} callback - callback function that will be called after node is ready
         */
        getNode(callback) {
            callback(null, this._node);
        }

        /**
         * Position of the render in [x, y] format
         * @type Position
         * @readonly
         */
        get position() { return this._position; }

        contains(position) {
            let width = this._node.clientWidth || this._node.offsetWidth || 0;
            let height = this._node.clientHeight || this._node.offsetHeight || 0;

            let x = this._position[0] + (this.offset && this.offset[0] || 0);
            let y = this._position[1] + (this.offset && this.offset[1] || 0);

            return x < position[0] && y < position[1] && x + width > position[0] && y + height > position[1];
        }
    }

    return HtmlNode;

});
sGis.module('render.Image', [
    'Point'
], (Point) => {

    'use strict';
    
    /**
     * Rendered image on a map.
     * @alias sGis.render.ImageRender
     * @implements sGis.IRender
     */
    class ImageRender {
        /**
         * @constructor
         * @param {String} src - the source of the image.
         * @param {sGis.Bbox} bbox - bbox that will contain image. The rendered image will be adjusted to fit the given bbox.
         * @param {Function} [onAfterDisplayed] - callback function that will be called after a render node is drawn to the DOM.
         */
        constructor(src, bbox, onAfterDisplayed) {
            this._src = src;
            this._bbox = bbox;
            this.onAfterDisplayed = onAfterDisplayed;
        }

        static get isVector() { return false; }

        /**
         * Returns HTML img element as the second parameter to callback function
         * @param {Function} callback - callback function that will be called after node is ready
         */
        getNode(callback) {
            let node = new Image();
            node.style.opacity = this.opacity;
            node.onload = function() { callback(null, node); };
            node.onerror = function() { callback('Failed to load image', null); };
            
            node.src = this._src;
            
            this._node = node;
        }

        /**
         * Bbox that will contain image.
         * @type sGis.Bbox
         * @readonly
         */
        get bbox() { return this._bbox; }

        contains(/*position*/) {
            // TODO: Contains method works with pixel position, but Image render does not know about pixels. Should change its operation from bbox to px.
            return false;
        }
        
        getCache() { return this._node; }
    }

    /**
     * Opacity of the image
     * @instance
     * @member {Number} opacity
     * @memberof sGis.render.ImageRender
     * @default 1
     */
    ImageRender.prototype.opacity = 1;
    
    return ImageRender;
    
});
sGis.module('render.Point', [], () => {

    'use strict';

    /**
     * Point geometry rendered to the screen coordinates for drawing.
     * @alias sGis.render.Point
     * @implements sGis.IRender
     */
    class Point {
        /**
         * @param {Number[]} coordinates - the rendered (px) coordinates of the point in [x, y] format.
         * @param {Object} [properties] - key-value list of any sGis.render.Point properties.
         */
        constructor(coordinates, properties) {
            this._coord = coordinates;
            Object.assign(this, properties);
        }

        get isVector() { return true; }
        
        contains(position) {
            var dx = position.x - this._coord[0],
                dy = position.y - this._coord[1],
                distance2 = dx * dx + dy * dy;
            return Math.sqrt(distance2) < 2;
        }

        /**
         *  The rendered (px) coordinates of the point in [x, y] format
         *  @type Number[]
         *  @readonly
         */
        get coordinates() { return this._coord; }
    }
    /**
     * The color of the point. Can be any valid css color string.
     * @member {String} sGis.render.Point#color
     * @default "black"
     */
    Point.prototype.color = 'black';

    /**
     * Specifies whether this render can catch mouse events. If true, this render will be transparent for any pointer events.
     * @member {Boolean} sGis.render.Point#ignoreEvents
     * @default false
     */
    Point.prototype.ignoreEvents = false;

    return Point;

});

sGis.module('render.Polygon', [
    'utils',
    'geotools'
], function(utils, geotools) {
    
    'use strict';
    
    var defaults = {
        /**
         * Fill style of the polygon. Possible values: "color", "image".
         * @type String
         * @memberof sGis.render.Polygon
         * @instance
         * @default "color"
         */
        fillStyle: 'color',

        /**
         * Fill color of the polygon. Can be any valid css color string.
         * @type String
         * @memberof sGis.render.Polygon
         * @instance
         * @default "transparent"
         */
        fillColor: 'transparent',

        /**
         * Fill image of the polygon
         * @type HTMLImageElement
         * @memberof sGis.render.Polygon
         * @instance
         * @default null
         */
        fillImage: null,

        /**
         * Stroke color of the polygon. Can be any valid css color string.
         * @type String
         * @memberof sGis.render.Polygon
         * @instance
         * @default "black"
         */
        strokeColor: 'black',

        /**
         * Stroke width of the polygon.
         * @type Number
         * @memberof sGis.render.Polygon
         * @instance
         * @default 1
         */
        strokeWidth: 1,

        /**
         * Specifies whether this render can catch mouse events. If true, this render will be transparent for any pointer events.
         * @type Boolean
         * @instance
         * @memberof sGis.render.Arc
         * @default false
         */
        ignoreEvents: false,

        /**
         * The distance (px) from the drawn line inside which the event is still considered to be inside the line.
         * @type Number
         * @instance
         * @memberof sGis.render.Polygon
         * @default 2
         */
        lineContainsTolerance: 2,

        /**
         * Dash pattern for the line as specified in HTML CanvasRenderingContext2D.setLineDash() specification
         * @member {Number[]} sGis.render.Polyline#lineDash
         * @default []
         */
        lineDash: []
    };

    /**
     * Rendered polygon
     * @alias sGis.render.Polygon
     * @implements sGis.IRender
     */
    class Polygon {
        /**
         * @constructor
         * @param {Number[][][]} coordinates - the coordinates of the polygon: [[[x11, y11], [x12, y12], ...], [[x21, y21], [x22, y22], ...]].
         * @param {Object} [options] - key-value list of any properties of sGis.render.Polygon
         */
        constructor(coordinates, options) {
            if (!coordinates) coordinates = [];
            if (!utils.isArray(coordinates[0])) coordinates = [coordinates];
            if (!utils.isArray(coordinates[0][0])) coordinates = [coordinates];
            
            utils.init(this, options);
            this.coordinates = coordinates;
        }
        
        get isVector() { return true; }

        contains(position) {
            return geotools.contains(this.coordinates, position, this.strokeWidth / 2 + this.lineContainsTolerance);
        }
    }
    
    utils.extend(Polygon.prototype, defaults);

    return Polygon;
    
});

sGis.module('render.Polyline', [
    'utils',
    'geotools'
], function(utils, geotools) {

    'use strict';

    var defaults = {
        /**
         * Stroke color of the polygon. Can be any valid css color string.
         * @type String
         * @memberof sGis.render.Polygon
         * @instance
         * @default "black"
         */
        strokeColor: 'black',

        /**
         * Stroke width of the polygon.
         * @type Number
         * @memberof sGis.render.Polygon
         * @instance
         * @default 1
         */
        strokeWidth: 1,

        /**
         * Specifies whether this render can catch mouse events. If true, this render will be transparent for any pointer events.
         * @type Boolean
         * @instance
         * @memberof sGis.render.Arc
         * @default false
         */
        ignoreEvents: false,

        /**
         * The distance (px) from the drawn line inside which the event is still considered to be inside the line.
         * @type Number
         * @instance
         * @memberof sGis.render.Polygon
         * @default 2
         */
        lineContainsTolerance: 4,

        /**
         * Dash pattern for the line as specified in HTML CanvasRenderingContext2D.setLineDash() specification
         * @member {Number[]} sGis.render.Polyline#lineDash
         * @default []
         */
        lineDash: []
    };

    /**
     * Rendered polyline.
     * @alias sGis.render.Polyline
     * @implements sGis.IRender
     */
    class Polyline {
        /**
         * @constructor
         * @param {Number[][][]} coordinates - the coordinates of the polyline: [[[x11, y11], [x12, y12], ...], [[x21, y21], [x22, y22], ...]].
         * @param {Object} [options] - key-value list of any properties of sGis.render.Polyline
         */
        constructor(coordinates, options) {
            if (!coordinates) coordinates = [];
            if (!utils.isArray(coordinates[0])) coordinates = [coordinates];
            if (!utils.isArray(coordinates[0][0])) coordinates = [coordinates];
            
            utils.init(this, options);
            this.coordinates = coordinates;
        }

        get isVector() { return true; }

        /**
         * Returns true if 'position' is inside the rendered polygon.
         * @param {Object} position - position in the rendered (px) coordinates in {x: X, y: Y} format.
         * @returns {boolean}
         */
        contains(position) {
            for (var ring = 0, l = this.coordinates.length; ring < l; ring++) {
                for (var i = 1, m = this.coordinates[ring].length; i < m; i++) {
                    if (geotools.pointToLineDistance(position, [this.coordinates[ring][i-1], this.coordinates[ring][i]]) < this.strokeWidth / 2 + this.lineContainsTolerance) return [ring, i - 1];
                }
            }
            return false;
        }
    }
    
    utils.extend(Polyline.prototype, defaults);
    
    return Polyline;

});

sGis.module('render.VectorImage', {

}, () => {

    'use strict';

    /**
     * @implements sGis.IRender
     */
    class VectorImage {
        constructor(imageNode, position, properties) {
            this._node = imageNode;
            this._position = position;
            Object.assign(this, properties);
        }

        get node() { return this._node; }

        get isVector() { return true; }

        get origin() { return [this._position[0] + this.offset[0], this._position[1] + this.offset[1]]; }

        contains(position) {
             let [x, y] = this.origin;
             return position[0] >= x && position[0] <= x + this._node.width && position[1] >= y && position[1] <= y + this._node.height;
        }
    }

    Object.assign(VectorImage.prototype, {
        offset: [0, 0]
    });

    return VectorImage;

});
sGis.module('render.VectorLabel', [
    'render.VectorImage'
], (VectorImage) => {

    'use strict';

    class VectorLabel extends VectorImage {
        constructor(position, text, properties) {
            let canvas = document.createElement('canvas');
            canvas.width = canvas.height = 0;
            super(canvas, position, properties);
            this._text = text;
            this._render();
        }

        _render() {
            let ctx = this.node.getContext('2d');
            ctx.font = this.font;
            let measure = ctx.measureText(this._text);

            this.node.width = Math.ceil(measure.width);

            let fontSize = parseInt(this.font) || 10;
            this.node.height = Math.ceil(fontSize * 1.6);

            let vAlign = this.vAlign;
            let dy = 0;
            if (vAlign === 1) {
                ctx.textBaseline = 'bottom';
                dy = this.node.height;
            } else if (vAlign === 0) {
                ctx.textBaseline = 'middle';
                dy = this.node.height / 2;
            } else {
                ctx.textBaseLine = 'top';
            }

            if (this.isFilled) {
                ctx.fillText(this._text, 0, dy);
            } else {
                ctx.strokeText(this._text, 0, dy);
            }

            this._setOffset();
        }

        get hAlign() { return this.align.indexOf('right') >= 0 ? 1 : this.align.indexOf('center') >= 0 ? 0 : -1; }
        get vAlign() { return this.align.indexOf('bottom') >= 0 ? 1 : this.align.indexOf('middle') >= 0 ? 0 : -1; }

        _setOffset() {
            let dx = 0;
            let dy = 0;

            if (this.hAlign === 1) {
                dx = -this.node.width;
            } else if (this.hAlign === 0) {
                dx = -this.node.width / 2;
            }

            if (this.vAlign === 1) {
                dy = -this.node.height;
            } else if (this.vAlign === 0) {
                dy = -this.node.height / 2;
            }

            this.offset = [dx, dy];
        }
    }

    Object.assign(VectorLabel.prototype, {
        font: '10px arial',
        align: 'center middle',
        isFilled: true
    });

    return VectorLabel;

});
sGis.module('serializer.symbolSerializer', [
    'utils',
    'utils.Color'
], (utils, Color) => {
    
    'use strict';

    /**
     * @namespace sGis.serializer
     */
    
    let symbolDescriptions = {};

    /**
     * @alias sGis.serializer.symbolSerializer
     */
    return {
        registerSymbol: (constructor, description, properties) => {
            symbolDescriptions[description] = {Constructor: constructor, properties: properties};
        },

        serialize: (symbol, colorsFormat = null) => {
            let keys = Object.keys(symbolDescriptions);
            for (let i = 0; i < keys.length; i++) {
                let desc = symbolDescriptions[keys[i]];

                if (symbol instanceof desc.Constructor) {
                    let serialized = {symbolName: keys[i]};
                    desc.properties.forEach(prop => {
                        let value = symbol[prop];
                        if (colorsFormat) {
                            let color = new Color(value);
                            if (color.isValid) value = color.toString(colorsFormat);
                        }
                        serialized[prop] = value;
                    });
                    return serialized;
                }
            }

            utils.error('Unknown type of symbol.');
        },
        
        deserialize: (desc, colorsFormat = null) => {
            if (!symbolDescriptions[desc.symbolName]) utils.error('Unknown type of symbol.');
            let symbol = new symbolDescriptions[desc.symbolName].Constructor();
            symbolDescriptions[desc.symbolName].properties.forEach(prop => {
                let val = desc[prop];
                if (colorsFormat) {
                    let color = new Color(val);
                    if (color.isValid && color.format === colorsFormat) val = color.toString('rgba');
                }

                symbol[prop] = val;
            });
            
            return symbol;
        }
    };
    
});
sGis.module('symbol.Editor', [
    'Symbol',
    'symbol.point.Point',
    'symbol.point.Image',
    'symbol.point.MaskedImage',
    'render.Point',
    'render.Polyline',
    'render.Polygon',
    'render.Arc'
], function(Symbol, PointSymbol, PointImageSymbol, PointMaskedImageSymbol, PointRender, PolylineRender, PolygonRender, ArcRender) {
    
    'use strict';

    /**
     * Symbol of a highlighted feature for editor.
     * @alias sGis.symbol.Editor
     * @extends sGis.Symbol
     */
    class EditorSymbol extends Symbol {
        /**
         * @constructor
         * @param {Object} [properties] - key-value list of properties to be assigned to the instance.
         */
        constructor(properties) {
            super(properties);
        }

        renderFunction(feature, resolution, crs) {
            var baseRender = this.baseSymbol.renderFunction(feature, resolution, crs);
            var halo;
            for (var i = 0; i < baseRender.length; i++) {
                if (baseRender[i] instanceof ArcRender) {
                    halo = new ArcRender(baseRender[i].center, {
                        fillColor: this.color,
                        radius: parseFloat(baseRender[i].radius) + this.haloSize,
                        strokeColor: 'transparent'
                    });
                    break;
                } else if (baseRender[i] instanceof PolygonRender) {
                    halo = new PolygonRender(baseRender[i].coordinates, {
                        strokeColor: this.color,
                        fillColor: this.color,
                        strokeWidth: parseFloat(baseRender[i].strokeWidth) + 2 * this.haloSize
                    });
                    break;
                } else if (baseRender[i] instanceof PolylineRender) {
                    halo = new PolylineRender(baseRender[i].coordinates, {
                        strokeColor: this.color,
                        strokeWidth: parseFloat(baseRender[i].strokeWidth) + 2 * this.haloSize
                    });
                    break;
                } else if (this.baseSymbol instanceof PointImageSymbol || this.baseSymbol instanceof PointMaskedImageSymbol) {
                    halo = new ArcRender(
                        [
                            baseRender[i].position[0] - (+this.baseSymbol.anchorPoint.x) + this.baseSymbol.width / 2,
                            baseRender[i].position[1] - (+this.baseSymbol.anchorPoint.x) + this.baseSymbol.width / 2,
                        ],
                        {
                            fillColor: this.color,
                            radius: this.baseSymbol.width / 2 + this.haloSize,
                            strokeColor: 'transparent'}
                    );
                    break;
                }
            }

            if (halo) baseRender.unshift(halo);
            return baseRender;
        }
    }

    /**
     * Base symbol of the feature. Used to render original feature with the highlight.
     * @member {sGis.Symbol} baseSymbol
     * @memberof sGis.symbol.Editor
     * @instance
     * @default new sGis.symbol.point.Point()
     */
    EditorSymbol.prototype.baseSymbol = new PointSymbol();

    /**
     * Color of the halo (highlight). Can be any valid css color string.
     * @member {String} color
     * @memberof sGis.symbol.Editor
     * @instance
     * @default "rgba(97,239,255,0.5)"
     */
    EditorSymbol.prototype.color = 'rgba(97,239,255,0.5)';

    /**
     * Size of the halo around the feature.
     * @member {Number} haloSize
     * @memberof sGis.symbol.Editor
     * @instance
     * @default
     */
    EditorSymbol.prototype.haloSize = 5;
    
    return EditorSymbol;
    
});

sGis.module('symbol.image.Image', [
    'Symbol',
    'render.Image',
    'serializer.symbolSerializer'
], (Symbol, ImageRender, symbolSerializer) => {

    'use strict';

    /**
     * Symbol for image with size bound by feature bbox.
     * @alias sGis.symbol.image.Image
     * @extends sGis.Symbol
     */
    class ImageSymbol extends Symbol {
        /**
         * @constructor
         * @param {Object} properties - key-value list of the properties to be assigned to the instance.
         */
        constructor(properties) {
            super(properties);
        }

        renderFunction(/** sGis.feature.Image */ feature, resolution, crs) {
            let bbox = feature.bbox.projectTo(crs);
            let render = new ImageRender(feature.src, bbox);

            if (this.transitionTime > 0) {
                render.opacity = 0;
                render.onAfterDisplayed = (node) => {
                    setTimeout(() => {
                        node.style.transition = 'opacity ' + this.transitionTime / 1000 + 's linear';
                        node.style.opacity = this.opacity;
                    }, 0);
                }
            } else {
                render.opacity = this.opacity;
            }

            return [render];
        }
    }

    /**
     * Transition (fade in) time of the image node in ms.
     * @member {Number} sGis.symbol.image.Image#transitionTime
     * @default 0
     */
    ImageSymbol.prototype.transitionTime = 0;

    /**
     * Opacity of the image.
     * @member {Number} sGis.symbol.image.Image#transitionTime
     * @default 1
     */
    ImageSymbol.prototype.opacity = 1;

    symbolSerializer.registerSymbol(ImageSymbol, 'image.Image', ['transitionTime', 'opacity']);

    return ImageSymbol;
    
});
sGis.module('symbol.label.Label', [
    'utils',
    'Symbol',
    'render.HtmlElement'
], function(utils, Symbol, HtmlElement) {
    
    'use strict';

    /**
     * @namespace sGis.symbol.label
     */

    /**
     * Symbol of simple html text label.
     * @alias sGis.symbol.label.Label
     * @extends sGis.Symbol
     */
    class Label extends Symbol {
        /**
         * @constructor
         * @param {Object} properties - key-value list of the properties to be assigned to the instance.
         */
        constructor(properties) {
            super(properties);
        }

        renderFunction(/** sGis.feature.Label */ feature, resolution, crs) {
            var html = '<div' +  (this.css ? ' class="' + this.css + '"' : '') + '>' + feature.content + '</div>';
            var point = feature.point.projectTo(crs);
            var position = [point.x / resolution, -point.y / resolution];

            return [new HtmlElement(html, position)];
        }
    }
    
    /**
     * Css class to be added to the label node.
     * @member {String} css
     * @memberof sGis.symbol.label.Label
     * @instance
     * @default "sGis-symbol-label-center-top"
     */
    Label.prototype.css = 'sGis-symbol-label-center-top';
    
    utils.setCssClasses({
        'sGis-symbol-label-left-top': 'transform:translate(-120%,-120%);',
        'sGis-symbol-label-left-middle': 'transform:translate(-120%,-50%);',
        'sGis-symbol-label-left-bottom': 'transform:translate(-120%,20%);',
        'sGis-symbol-label-center-top': 'transform:translate(-50%,-120%);',
        'sGis-symbol-label-center-middle': 'transform:translate(-50%,-50%);',
        'sGis-symbol-label-center-bottom': 'transform:translate(-50%,20%);',
        'sGis-symbol-label-right-top': 'transform:translate(20%,-120%);',
        'sGis-symbol-label-right-middle': 'transform:translate(20%,-50%);',
        'sGis-symbol-label-right-bottom': 'transform:translate(20%,20%);'
    });

    return Label
    
});

sGis.module('symbol.maptip.Simple', [
    'utils',
    'Symbol',
    'render.Polygon',
    'render.HtmlElement'
], function(utils, Symbol, PolygonRender, HtmlElement) {

    'use strict';

    /**
     * @namespace sGis.symbol.maptip
     */

    /**
     * Balloon over a map with html content.
     * @alias sGis.symbol.maptip.Simple
     * @extends sGis.Symbol
     */
    class MaptipSymbol extends Symbol {
        /**
         * @constructor
         * @param {Object} [properties] - key-value list of properties to be assigned to the instance.
         */
        constructor(properties) {
            super(properties);
        }

        renderFunction(feature, resolution, crs) {
            let position = feature.point.projectTo(crs).position;
            let pxPosition = [position[0]/resolution, position[1]/resolution];
            let render = new HtmlElement(`<div class="sGis-maptip-outerContainer"><div class="sGis-maptip-innerContainer">${feature.content}</div></div>`, pxPosition);

            return [render];
        }
    }

    utils._setStyleNode(`

        .sGis-maptip-outerContainer {
            transform: translate(-50%, -100%);
        }
        
        .sGis-maptip-innerContainer {
            background-color: white;
            transform: translate(0, -16px);
            padding: 8px;
            border-radius: 5px;
            position: relative;
            box-shadow: 0 0 6px #B2B2B2;
        }
        
        .sGis-maptip-innerContainer:after {
            content: ' ';
            position: absolute;
            display: block;
            background: white;
            top: 100%;
            left: 50%;
            height: 20px;
            width: 20px;
            transform: translate(-50%, -10px) rotate(45deg);
            box-shadow: 2px 2px 2px 0 rgba( 178, 178, 178, .4 );
        }

    `);

    return MaptipSymbol;
    
});
sGis.module('symbol.polyline.Simple', [
    'utils',
    'math',
    'Symbol',
    'render.Polyline',
    'serializer.symbolSerializer'
], function(utils, math, Symbol, Polyline, symbolSerializer) {
    
    'use strict';

    /**
     * @namespace sGis.symbol.polyline
     */

    /**
     * Symbol of polyline drawn as simple line
     * @alias sGis.symbol.polyline.Simple
     * @extends sGis.Symbol
     */
    class PolylineSymbol extends Symbol {
        /**
         * @constructor
         * @param {Object} properties - key-value list of the properties to be assigned to the instance.
         */
        constructor(properties) {
            super(properties);
        }

        renderFunction(/** sGis.feature.Polyline */ feature, resolution, crs) {
            var coordinates = PolylineSymbol._getRenderedCoordinates(feature, resolution, crs);
            if (!coordinates) return [];
            return [new Polyline(coordinates, { strokeColor: this.strokeColor, strokeWidth: this.strokeWidth, lineDash: this.lineDash })];
        }

        static _getRenderedCoordinates(feature, resolution, crs) {
            if (!feature.coordinates || !utils.isArray(feature.coordinates) || !utils.isArray(feature.coordinates[0])) return null;
            var projected = feature.crs.equals(crs) ? feature.rings : feature.projectTo(crs).rings;
            
            return math.simplifyCoordinates(projected.map(ring => {
                return ring.map(point => {
                    return [point[0] / resolution, point[1] / -resolution];
                });
            }), 1);
        }
    }

    /**
     * Stroke color of the line. Can be any valid css color string.
     * @member {String} sGis.symbol.polyline.Simple#strokeColor
     * @default "black"
     */
    PolylineSymbol.prototype.strokeColor = 'black';

    /**
     * Stroke width of the line.
     * @member {Number} sGis.symbol.polyline.Simple#strokeWidth
     * @default 1
     */
    PolylineSymbol.prototype.strokeWidth = 1;

    /**
     * Dash pattern for the line as specified in HTML CanvasRenderingContext2D.setLineDash() specification
     * @member {Number[]} sGis.symbol.polyline.Simple#lineDash
     * @default []
     */
    PolylineSymbol.prototype.lineDash = [];

    symbolSerializer.registerSymbol(PolylineSymbol, 'polyline.Simple', ['strokeColor', 'strokeWidth']);

    return PolylineSymbol;
    
});

sGis.module('Symbol', [
    'utils',
    'serializer.symbolSerializer'
], function(utils, symbolSerializer) {

    'use strict';

    /**
     * @namespace sGis.symbol
     */

    /**
     * Empty symbol, base class for all other symbol classes. If this symbol is assigned to a feature, the feature will not be rendered.
     * @alias sGis.Symbol
     */
    class Symbol {
        /**
         * @constructor
         * @param {Object} [properties] - key-value list of properties to be assigned to the instance.
         */
        constructor(properties) {
            utils.init(this, properties, true);
        }

        /**
         * This function will be called every time the feature has to be drawn. It returns an array of renders that will actually be displayed on the map.
         * If the symbol cannot render provided feature, empty array is returned.
         * @param {sGis.Feature} feature - feature to be drawn.
         * @param {Number} resolution - resolution of the render.
         * @param {sGis.Crs} crs - target coordinate system of the render.
         * @returns {sGis.IRender[]}
         */
        renderFunction(feature, resolution, crs) {
            return [];
        }

        /**
         * Returns a copy of the symbol. Only essential properties are copied.
         * @returns {sGis.Symbol}
         */
        clone() {
            var desc = symbolSerializer.serialize(this);
            return symbolSerializer.deserialize(desc);
        }
    }

    return Symbol;
    
});

sGis.module('utils.Color', [
    'utils'
], (utils) => {

    'use strict';

    /**
     * Utility class for working with different representations of colors in browsers
     * @alias sGis.utils.Color
     */
    class Color {
        /**
         * @param {String} string - any valid css color string
         */
        constructor(string) {
            this._original = string;

            if (!utils.isString(string)) string = string.toString();

            this._color = string && string.trim() || 'transparent';
            this._setChannels();
        }

        _setChannels() {
            var format = this.format;
            if (format && formats[format]) {
                this._channels = formats[format](this._color);
            } else {
                this._channels = {};
            }
        }

        /**
         * Returns the color as a string in the requested format
         * @param {String} [format="rgba"] - target format. Available values: "hex" - #AARRGGBB, "rgb" - "rgb(r, g, b)", "rgba" - "rgba(r, g, b, a)"
         * @returns {string}
         */
        toString(format) {
            if (format === 'hex') {
                return '#' + decToHex(this.a) + decToHex(this.r) + decToHex(this.g) + decToHex(this.b);
            } else if (format === 'rgb') {
                return 'rgb(' + this.r + ',' + this.g + ',' + this.b + ')';
            } else {
                return 'rgba(' + this.r + ',' + this.g + ',' + this.b + ',' + (this.a / 255).toFixed(2).replace(/\.*0+$/, '') + ')';
            }
        }

        /**
         * Returns the string given to the constructor of the instance
         * @type {String}
         */
        get original() { return this._original; }

        /**
         * Returns true if the instance represents a valid color, i.e. that after parsing of the string given to the constructor,
         * the format is recognized and values of all channels are resolved to valid numbers.
         * @returns {Boolean}
         */
        get isValid() { return !!(utils.isNumber(this._channels.a) && utils.isNumber(this._channels.r) && utils.isNumber(this._channels.g) && utils.isNumber(this._channels.b)); }

        /**
         * Returns the format of the input color sting. Possible values: hex3, hex6, hex4, hex8, rgb, rgba, name.
         * (name is the named css color values like "white")
         * @returns {String}
         */
        get format() {
            if (this._color.substr(0, 1) === '#' && this._color.search(/[^#0-9a-fA-F]/) === -1) {
                if (this._color.length === 4) {
                    return 'hex3';
                } else if (this._color.length === 7) {
                    return 'hex6';
                } else if (this._color.length === 5) {
                    return 'hex4';
                } else if (this._color.length === 9) {
                    return 'hex8';
                }
            } else if (this._color.substr(0, 4) === 'rgb(') {
                return 'rgb';
            } else if (this._color.substr(0, 5) === 'rgba(') {
                return 'rgba';
            } else if (this._color in Color.names) {
                return 'name';
            }
        }

        /**
         * Returns red channel value as integer from 0 to 255.
         * @type {Number}
         */
        get r() { return this._channels.r; }
        set r(/** Number */ v) { this._channels.r = v; }

        /**
         * Returns green channel value as integer from 0 to 255.
         * @type {Number}
         */
        get g() { return this._channels.g; }
        set g(/** Number */ v) { this._channels.g = v; }

        /**
         * Returns blue channel value as integer from 0 to 255.
         * @type {Number}
         */
        get b() { return this._channels.b; }
        set b(/** Number */ v) { this._channels.b = v; }

        /**
         * Returns opacity channel value as integer from 0 to 255.
         * @type {Number}
         */
        get a() { return this._channels.a; }
        set a(/** Number */ v) { this._channels.a = v; }

        /**
         * Returns values of the channels as integers from 0 to 255. Format is { r: r, g: g, b: b, a: a }.
         * @type {Object}
         */
        get channels() { return Object.assign({}, this._channels); }
    }

    function decToHex(dec) {
        var hex = Math.floor(dec).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }

    var formats = {
        hex3: function(/** String */ string) {
            return {
                r: parseInt(string.substr(1,1) + string.substr(1,1), 16),
                g: parseInt(string.substr(2,1) + string.substr(2,1), 16),
                b: parseInt(string.substr(3,1) + string.substr(3,1), 16),
                a: 255
            }
        },
        hex6: function(/** String */ string) {
            return {
                r: parseInt(string.substr(1,2), 16),
                g: parseInt(string.substr(3,2), 16),
                b: parseInt(string.substr(5,2), 16),
                a: 255
            }
        },
        hex4: function(/** String */ string) {
            return {
                r: parseInt(string.substr(2,1) + string.substr(2,1), 16),
                g: parseInt(string.substr(3,1) + string.substr(3,1), 16),
                b: parseInt(string.substr(4,1) + string.substr(4,1), 16),
                a: parseInt(string.substr(1,1) + string.substr(1,1), 16)
            }
        },
        hex8: function(/** String */ string) {
            return {
                r: parseInt(string.substr(3,2), 16),
                g: parseInt(string.substr(5,2), 16),
                b: parseInt(string.substr(7,2), 16),
                a:  parseInt(string.substr(1,2), 16)
            }
        },
        rgb: function(/** String */ string) {
            var percents = string.match(/%/g);
            if (!percents || percents.length === 3) {
                var channels = string.substring(string.search(/\(/) + 1, string.length - 1).split(',');
                for (var i = 0; i < 3; i++) {
                    if (channels[i]) {
                        channels[i] = channels[i].trim();
                        var percent = channels[i].match(/[\.\d\-]+%/);
                        if (percent) {
                            var points = channels[i].match(/\./g);
                            channels[i] = channels[i].search(/[^\d\.\-%]/) === -1 && (!points || points.length < 2) ? parseFloat(percent[0]) : NaN;
                            if (channels[i] < 0) {
                                channels[i] = 0;
                            } else if (channels[i] > 100) {
                                channels[i] = 100;
                            }
                            channels[i] = Math.floor(channels[i] * 255  / 100);
                        } else {
                            channels[i] = channels[i] && (channels[i].match(/[^ \-0-9]/) === null) && channels[i].match(/[0-9]+/g).length === 1 ? parseInt(channels[i]) : NaN;
                            if (channels[i] < 0) {
                                channels[i] = 0;
                            } else if (channels[i] > 255) {
                                channels[i] = 255;
                            }
                        }
                    }
                }
            } else {
                channels = [];
            }
            return {
                r: channels[0],
                g: channels[1],
                b: channels[2],
                a: 255
            };
        },

        rgba: function(/** String */ string) {
            var channels = formats.rgb(string);
            channels.a = undefined;

            var match = string.match(/[\-0-9\.]+/g);
            if (match && match[3]) {
                var points = match[3].match(/\./g);
                if (!points || points.length === 1) {
                    channels.a = parseFloat(match[3]);
                    if (channels.a < 0) {
                        channels.a = 0;
                    } else if (channels.a > 1) {
                        channels.a = 1;
                    }
                    channels.a = Math.round(channels.a * 255);
                }
            }
            return channels;
        },
        name: function(/** String */ string) {
            var color = new Color('#' + Color.names[string]);
            return color.channels;
        }
    };


    // Big List of Colors
    // ------------------
    // <http://www.w3.org/TR/css3-color/#svg-color>
    //noinspection SpellCheckingInspection
    Color.names = {
        aliceblue: "f0f8ff",
        antiquewhite: "faebd7",
        aqua: "0ff",
        aquamarine: "7fffd4",
        azure: "f0ffff",
        beige: "f5f5dc",
        bisque: "ffe4c4",
        black: "000",
        blanchedalmond: "ffebcd",
        blue: "00f",
        blueviolet: "8a2be2",
        brown: "a52a2a",
        burlywood: "deb887",
        burntsienna: "ea7e5d",
        cadetblue: "5f9ea0",
        chartreuse: "7fff00",
        chocolate: "d2691e",
        coral: "ff7f50",
        cornflowerblue: "6495ed",
        cornsilk: "fff8dc",
        crimson: "dc143c",
        cyan: "0ff",
        darkblue: "00008b",
        darkcyan: "008b8b",
        darkgoldenrod: "b8860b",
        darkgray: "a9a9a9",
        darkgreen: "006400",
        darkgrey: "a9a9a9",
        darkkhaki: "bdb76b",
        darkmagenta: "8b008b",
        darkolivegreen: "556b2f",
        darkorange: "ff8c00",
        darkorchid: "9932cc",
        darkred: "8b0000",
        darksalmon: "e9967a",
        darkseagreen: "8fbc8f",
        darkslateblue: "483d8b",
        darkslategray: "2f4f4f",
        darkslategrey: "2f4f4f",
        darkturquoise: "00ced1",
        darkviolet: "9400d3",
        deeppink: "ff1493",
        deepskyblue: "00bfff",
        dimgray: "696969",
        dimgrey: "696969",
        dodgerblue: "1e90ff",
        firebrick: "b22222",
        floralwhite: "fffaf0",
        forestgreen: "228b22",
        fuchsia: "f0f",
        gainsboro: "dcdcdc",
        ghostwhite: "f8f8ff",
        gold: "ffd700",
        goldenrod: "daa520",
        gray: "808080",
        green: "008000",
        greenyellow: "adff2f",
        grey: "808080",
        honeydew: "f0fff0",
        hotpink: "ff69b4",
        indianred: "cd5c5c",
        indigo: "4b0082",
        ivory: "fffff0",
        khaki: "f0e68c",
        lavender: "e6e6fa",
        lavenderblush: "fff0f5",
        lawngreen: "7cfc00",
        lemonchiffon: "fffacd",
        lightblue: "add8e6",
        lightcoral: "f08080",
        lightcyan: "e0ffff",
        lightgoldenrodyellow: "fafad2",
        lightgray: "d3d3d3",
        lightgreen: "90ee90",
        lightgrey: "d3d3d3",
        lightpink: "ffb6c1",
        lightsalmon: "ffa07a",
        lightseagreen: "20b2aa",
        lightskyblue: "87cefa",
        lightslategray: "789",
        lightslategrey: "789",
        lightsteelblue: "b0c4de",
        lightyellow: "ffffe0",
        lime: "0f0",
        limegreen: "32cd32",
        linen: "faf0e6",
        magenta: "f0f",
        maroon: "800000",
        mediumaquamarine: "66cdaa",
        mediumblue: "0000cd",
        mediumorchid: "ba55d3",
        mediumpurple: "9370db",
        mediumseagreen: "3cb371",
        mediumslateblue: "7b68ee",
        mediumspringgreen: "00fa9a",
        mediumturquoise: "48d1cc",
        mediumvioletred: "c71585",
        midnightblue: "191970",
        mintcream: "f5fffa",
        mistyrose: "ffe4e1",
        moccasin: "ffe4b5",
        navajowhite: "ffdead",
        navy: "000080",
        oldlace: "fdf5e6",
        olive: "808000",
        olivedrab: "6b8e23",
        orange: "ffa500",
        orangered: "ff4500",
        orchid: "da70d6",
        palegoldenrod: "eee8aa",
        palegreen: "98fb98",
        paleturquoise: "afeeee",
        palevioletred: "db7093",
        papayawhip: "ffefd5",
        peachpuff: "ffdab9",
        peru: "cd853f",
        pink: "ffc0cb",
        plum: "dda0dd",
        powderblue: "b0e0e6",
        purple: "800080",
        rebeccapurple: "663399",
        red: "f00",
        rosybrown: "bc8f8f",
        royalblue: "4169e1",
        saddlebrown: "8b4513",
        salmon: "fa8072",
        sandybrown: "f4a460",
        seagreen: "2e8b57",
        seashell: "fff5ee",
        sienna: "a0522d",
        silver: "c0c0c0",
        skyblue: "87ceeb",
        slateblue: "6a5acd",
        slategray: "708090",
        slategrey: "708090",
        snow: "fffafa",
        springgreen: "00ff7f",
        steelblue: "4682b4",
        tan: "d2b48c",
        teal: "008080",
        thistle: "d8bfd8",
        tomato: "ff6347",
        turquoise: "40e0d0",
        violet: "ee82ee",
        wheat: "f5deb3",
        white: "fff",
        whitesmoke: "f5f5f5",
        yellow: "ff0",
        yellowgreen: "9acd32",
        transparent: '0000'
    };

    return Color;

});
sGis.module('math', [], function() {
    'use strict';

    /**
     * @namespace
     * @memberof sGis
     */
    var math = {
        /**
         * Converts degrees to radians
         * @param {number} d - degrees
         * @returns {number}
         */
        degToRad: function (d) {
            return d / 180 * Math.PI;
        },

        /**
         * Converts radians to degrees
         * @param {number} r - radians
         * @returns {number}
         */
        radToDeg: function (r) {
            return r / Math.PI * 180;
        },

        /**
         * Returns true if a and b differ less then one millionth of a, otherwise false
         * @param {Number} a
         * @param {Number} b
         * @returns {boolean}
         */
        softEquals: function softEquals(a, b) {
            return Math.abs(a - b) < math.tolerance * a;
        },

        tolerance: 0.000001,

        /**
         * Prepares the set of coordinates for matrix operations
         * @param {Position[]} coord
         * @param {Position} center - the center of the operation
         */
        extendCoordinates: function(coord, center) {
            coord.forEach(point => {
                point[0] = point[0] - center[0];
                point[1] = point[1] - center[1];
                point[2] = 1;
            });
        },

        /**
         * Takes extended coordinates and make them plain again
         * @param {Position[]} coord
         * @param {Position} center - the center of the operation
         */
        collapseCoordinates: function(coord, center) {
            coord.forEach(point => {
                point[0] = point[0] + center[0];
                point[1] = point[1] + center[1];
                point.splice(2, 1);
            });
        },


        /**
         * Returns a new array with simplified coordinates
         * @param {Position[][]} rings - array of coordinate contours
         * @param tolerance - the tolerance of simplification. Points that are overflow other points or lines with given tolerance will be excluded from the result
         * @returns {Position[][]}
         */
        simplifyCoordinates: function(rings, tolerance) {
            var result = [];

            for (var ring = 0, l = rings.length; ring < l; ring++) {
                var simplified = [rings[ring][0]];
                for (var i = 1, len = rings[ring].length - 1; i < len; i++) {
                    if (rings[ring][i].length === 0 || simplified[simplified.length - 1].length === 0 || Math.abs(rings[ring][i][0] - simplified[simplified.length - 1][0]) > tolerance || Math.abs(rings[ring][i][1] - simplified[simplified.length - 1][1]) > tolerance) {
                        simplified.push(rings[ring][i]);
                    }
                }
                if (simplified[simplified.length - 1] !== rings[ring][rings[ring].length - 1]) simplified.push(rings[ring][rings[ring].length - 1]);
                result[ring] = simplified;
            }

            return result;
        },

        /**
         * Multiplies matrix a by matrix b
         * @param a
         * @param b
         * @returns {Array}
         */
        multiplyMatrix: function(a, b) {
            var c = [];
            for (var i = 0, m = a.length; i < m; i++) {
                c[i] = [];
                for (var j = 0, q = b[0].length; j < q; j++) {
                    c[i][j] = 0;
                    for (var r = 0, n = b.length; r < n; r++) {
                        c[i][j] += a[i][r] * b[r][j];
                    }
                }
            }

            return c;
        }
    };

    return math;

});
sGis.module('utils.StateManager', [
    'utils'
], (/** sGis.utils */ utils) => {

    'use strict';

    /**
     * Utility class to save and restore sets of states. Used for undo/redo functions.
     */
    class StateManager {
        /**
         * @param {Number} [maxStates=256] - max number of stored states
         */
        constructor(maxStates = 256) {
            if (!utils.isNumber(maxStates) || maxStates < 0) utils.error("Incorrect value for number of states: " + maxStates);
            this._maxStates = maxStates;
            this.clear();
        }

        /**
         * Clears all stored states.
         */
        clear() {
            this._states = [];
            this._activeState = -1;
        }

        /**
         * Saves the given state and makes it active.
         * @param {*} state
         */
        setState(state) {
            let index = this._activeState + 1;

            this._states[index] = state;
            this._states.splice(index+1, this._states.length);

            this._trimStates();
            this._activeState = this._states.length - 1;
        }

        /**
         * Returns current state.
         * @returns {*}
         */
        getCurrentState() {
            return this._states[this._activeState];
        }

        /**
         * Returns previous state and makes it active. If there is no previous state, returns null.
         * @returns {*}
         */
        undo() {
            if (this._activeState <= 0) return null;
            return this._states[--this._activeState];
        }

        /**
         * Returns next state and makes it active. If there is no next state, returns null.
         * @returns {*}
         */
        redo() {
            if (this._activeState === this._states.length - 1) return null;
            return this._states[++this._activeState];
        }

        _trimStates() {
            while (this._states.length > this._maxStates) {
                this._states.shift();
            }
        }
    }

    return StateManager;

});
sGis.module('utils', [
    'event'
], function(ev) {
    'use strict';

    /**
     * @namespace
     * @alias sGis.utils
     */
    var utils = {
        /**
         * Throws an exception with given message. If you need to handle all errors in one place, redefined this method to your needed handler.
         * @param message
         */
        error: function(message) {
            throw new Error(message);
        },

        warn: function(exeption) {
            // eslint-disable-next-line no-console
            if (typeof console === 'object') console.warn(exeption);
        },

        /**
         * Sets the values of the properties in 'options' to the 'object'.
         * Calls utils.error() in case of exception. It only sets the properties that already exist in the object if not setUndefined parameter is given
         * @param {Object} object
         * @param {Object} options
         * @param {Boolean} [setUndefined]
         */
        init: function(object, options, setUndefined) {
            if (!options) return;

            var keys = Object.keys(options);
            keys.forEach(function(key) {
                if ((setUndefined || object[key] !== undefined) && options[key] !== undefined) {
                    try {
                        object[key] = options[key];
                    } catch (e) {
                        if (!(e instanceof TypeError)) utils.error(e);
                    }
                }
            });
        },

        /**
         * Calls window.requestAnimationFrame or its friends if available or uses timeout to simulate their behavior
         * @param {Function} callback - callback function
         * @param {HTMLElement} [element] - the target of rendering
         */
        requestAnimationFrame: function(callback, element) {
            var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

            if (requestAnimationFrame) {
                requestAnimationFrame(callback, element);
            } else {
                setTimeout(function() {
                    callback();
                }, 1000/30);
            }
        },

        /**
         * Debounce function calls
         * @param {Function} func - callback function
         * @param {number} ms - interval
         * @return {Function}
         */
        debounce(func, ms) {

            var state = null;

            var COOLDOWN = 1;

            return function () {
                if (state) return;

                func.apply(this, arguments);

                state = COOLDOWN;

                setTimeout(function () {
                    state = null
                }, ms);
            }

        },
        /**
         * Throttle function calls
         * @param {Function} func - callback function
         * @param {number} ms - interval
         * @return {Function}
         */
        throttle(func, ms) {

            var isThrottled = false,
                savedArgs,
                savedThis;

            function wrapper () {

                if (isThrottled) {
                    savedArgs = arguments;
                    savedThis = this;
                    return;
                }

                func.apply(this, arguments);

                isThrottled = true;

                setTimeout(function () {
                    isThrottled = false;
                    if (savedArgs) {
                        wrapper.apply(savedThis, savedArgs);
                        savedArgs = savedThis = null;
                    }
                }, ms);
            }

            return wrapper;
        },

        /**
         * Copies the own properties of source to target, ignoring the properties already existing in target. Only one-level copy.
         * @param {Object} target
         * @param {Object} source
         * @param {Boolean} [ignoreUndefined=false] - if set to true, properties in the source that have the value of undefined will be ignored
         */
        extend: function(target, source, ignoreUndefined = false) {
            let keys = Object.keys(source);
            keys.forEach(function(key) {
                if (ignoreUndefined && source[key] === undefined) return;
                target[key] = source[key];
            });
            return target;
        },

        mixin: function(target, source) {
            Object.getOwnPropertyNames(source).forEach(key => {
                if (key === 'constructor') return;
                Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
            });
        },

        /**
         * Returns true if a and b differ less then one millionth of a, otherwise false
         * @param {Number} a
         * @param {Number} b
         * @returns {boolean}
         */
        softEquals: function(a, b) {
            return (Math.abs(a - b) < 0.000001 * Math.max(a, 1));
        },

        /**
         * Returns true is obj is Array, otherwise false
         * @param {Any} obj
         * @returns {boolean}
         */
        isArray: function(obj) {
            return Array.isArray(obj);
        },

        /**
         * Returns true if n is a finite number, otherwise false
         * @param {Any} n
         * @returns {boolean}
         */
        isNumber: function(n) {
            return typeof n === 'number' && isFinite(n);
        },

        /**
         * Returns true if n is an integer number, otherwise false
         * @param {Any} n
         * @returns {boolean}
         */
        isInteger: function(n) {
            return utils.isNumber(n) && Math.round(n) === n;
        },

        /**
         * Returns true if s is a string, otherwise false
         * @param {Any} s
         * @returns {boolean}
         */
        isString: function(s) {
            return typeof s === 'string';
        },

        /**
         * Returns true if f is a function, otherwise false
         * @param {Any} f
         * @returns {boolean}
         */
        isFunction: function(f) {
            return typeof f === 'function';
        },

        /**
         * Returns true if o is a HTML node
         * @param {Any} o
         * @returns {boolean}
         */
        isNode: function(o) {
            return !!o.nodeType;
        },

        /**
         * Returns true if o is a HTML img element
         * @param {Any} o
         * @returns {boolean}
         */
        isImage: function(o) {
            return utils.browser.indexOf('Opera') !== 0 && o instanceof Image || o instanceof HTMLImageElement
        },

        /**
         * Throws an exception if s is not a string
         * @param {Any} s
         */
        validateString: function(s) {
            if (!utils.isString(s)) utils.error('String is expected but got ' + s + ' instead');
        },

        /**
         * Throws an exception if v is not one of the allowed values
         * @param {Any} v
         * @param {Array} allowed
         */
        validateValue: function(v, allowed) {
            if (allowed.indexOf(v) === -1) utils.error('Invalid value of the argument: ' + v);
        },

        /**
         * Throws an exception if n is not a number
         * @param {Any} n
         */
        validateNumber: function(n) {
            if (!utils.isNumber(n)) utils.error('Number is expected but got ' + n + ' instead');
        },

        /**
         * Throws an exception if n is not a positive number
         * @param n
         */
        validatePositiveNumber: function(n) {
            if (!utils.isNumber(n) || n <= 0) utils.error('Positive number is expected but got ' + n + ' instead');
        },

        /**
         * Throws an exception if b is not a boolean value
         * @param b
         */
        validateBool: function(b) {
            if (b !== true && b !== false) utils.error('Boolean is expected but got ' + b + ' instead');
        },


        /**
         * Returns a random GUID
         * @returns {string}
         */
        getGuid: function() {
            //noinspection SpellCheckingInspection
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {var r = Math.random()*16|0,v=c=='x'?r:r&0x3|0x8;return v.toString(16);});
        },

        /**
         * Sets the innerHTML property to element. It will escape the issue with table inserting as innerHTML.
         * @param {HTMLElement} element
         * @param {String} html
         */
        html: function(element, html) {
            try {
                element.innerHTML = html;
            } catch(e) {
                var tempElement = document.createElement('div');
                tempElement.innerHTML = html;
                for (var i = tempElement.childNodes.length - 1; i >=0; i--) {
                    element.insertBefore(tempElement.childNodes[i], tempElement.childNodes[i+1]);
                }
            }
        },

        /**
         * Returns true if at least one element of arr1 also exists in arr2
         * @param {Array} arr1
         * @param {Array} arr2
         * @returns {boolean}
         * TODO: check if it should work backwards also
         */
        arrayIntersect: function(arr1, arr2) {
            for (var i = 0; i < arr1.length; i++) {
                if (arr2.indexOf(arr1[i]) !== -1) {
                    return true;
                }
            }
            return false;
        },

        /**
         * Makes a deep copy af the array
         * @param {Array} arr
         * @returns {Array}
         */
        copyArray: function(arr) {
            var copy = [];
            for (var i = 0, l = arr.length; i < l; i++) {
                if (utils.isArray(arr[i])) {
                    copy[i] = utils.copyArray(arr[i]);
                } else {
                    copy[i] = arr[i];
                }
            }
            return copy;
        },

        /**
         * Makes a deep copy of an object
         * @param {Object} obj
         * @returns {*}
         * TODO: this will not copy the inner arrays properly
         */
        copyObject: function(obj) {
            if (!(obj instanceof Function) && obj instanceof Object) {
                var copy = utils.isArray(obj) ? [] : {};
                var keys = Object.keys(obj);
                for (var i = 0; i < keys.length; i++) {
                    copy[keys[i]] = utils.copyObject(obj[keys[i]]);
                }
                return copy;
            } else {
                return obj;
            }
        },
        
        setCssClasses: function(desc) {
            var classes = Object.keys(desc).map(key => {return utils._getCssText(key, desc[key]);});
            utils._setStyleNode(classes.join('\n'));
        },
        
        _getCssText: function(className, styles) {
            return '.' + className + '{' + styles + '}';
        },
        
        _setStyleNode: function(text) {
            var node = document.createElement('style');
            node.type = 'text/css';
            if (node.styleSheet) {
                node.styleSheet.cssText = text;
            } else {
                node.appendChild(document.createTextNode(text));
            }

            document.head.appendChild(node);
        },

        browser: (function() {
            let ua= navigator.userAgent,
                tem,
                M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
            if (/trident/i.test(M[1])) {
                tem=  /\brv[ :]+(\d+)/g.exec(ua) || [];
                return 'IE '+(tem[1] || '');
            }
            if (M[1] === 'Chrome') {
                tem= ua.match(/\bOPR\/(\d+)/);
                if (tem != null) return 'Opera ' + tem[1];
            }
            M = M[2] ? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
            if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
            return M.join(' ');
        })(),

        createNode: function(nodeName, cssClass, properties = {}, children = []) {
            let node = document.createElement(nodeName);
            node.className = cssClass;
            utils.extend(node, properties);
            children.forEach(child => node.appendChild(child));
            return node;
        }
    };

    utils.isIE = utils.browser.search('IE') !== -1;
    utils.isTouch = 'ontouchstart' in document.documentElement;

    if (document.body) {
        setCssRules();
    } else {
        ev.add(document, 'DOMContentLoaded', setCssRules);
    }

    function setCssRules() {
        /**
         * Contains prefixed css properties for transition, transform and transformOrigin
         * @type {{transition: {func: string, rule: string}, transform: {func: string, rule: string}, transformOrigin: {func: string, rule: string}}}
         */
        utils.css = {
            transition: document.body.style.transition !== undefined ? {func: 'transition', rule: 'transition'} :
                document.body.style.webkitTransition !== undefined ? {func: 'webkitTransition', rule: '-webkit-transition'} :
                    document.body.style.msTransition !== undefined ? {func: 'msTransition', rule: '-ms-transition'} :
                        document.body.style.OTransition !== undefined ? {func: 'OTransition', rule: '-o-transition'} :
                            null,
            transform:  document.body.style.transform !== undefined ? {func: 'transform', rule: 'transform'} :
                document.body.style.webkitTransform !== undefined ? {func: 'webkitTransform', rule: '-webkit-transform'} :
                    document.body.style.OTransform !== undefined ? {func: 'OTransform', rule: '-o-transform'} :
                        document.body.style.msTransform !== undefined ? {func: 'msTransform', rule: '-ms-transform'} : null,
            transformOrigin: document.body.style.transformOrigin !== undefined ? {func: 'transformOrigin', rule: 'transform-origin'} :
                document.body.style.webkitTransformOrigin !== undefined ? {func: 'webkitTransformOrigin', rule: '-webkit-transform-origin'} :
                    document.body.style.OTransformOrigin !== undefined ? {func: 'OTransformOrigin', rule: '-o-transform-origin'} :
                        document.body.style.msTransformOrigin !== undefined ? {func: 'msTransformOrigin', rule: '-ms-transform-origin'} : null
        };
    }

    // TODO: remove these functions after change to ES6 classes

    if (!Object.defineProperty) {
        Object.defineProperty = function(obj, key, desc) {
            if (desc.value) {
                obj[key] = desc.value;
            } else {
                if (desc.get) {
                    obj.__defineGetter__(key, desc.get);
                }
                if (desc.set) {
                    obj.__defineSetter__(key, desc.set);
                }
            }
        };
    }

    if (!Object.defineProperties) {
        Object.defineProperties = function(obj, desc) {
            for (var key in desc) {
                Object.defineProperty(obj, key, desc[key]);
            }
        };
    }

    return utils;
    
});

sGis.module('painter.domPainter.Canvas', [
    'render.Arc',
    'render.Point',
    'render.Polygon',
    'render.Polyline',
    'render.VectorImage',
    'utils'
], (Arc, Point, Polygon, Polyline, VectorImage, utils) => {

    'use strict';

    /**
     * @alias sGis.painter.domPainter.Canvas
     * @ignore
     */
    class Canvas {
        constructor() {
            this._setNode();
        }
        
        _setNode() {
            this._canvasNode = document.createElement('canvas');
            this._canvasNode.style.pointerEvents = 'none';
            this._ctx = this._canvasNode.getContext('2d');
        }
        
        reset(bbox, resolution, width, height) {
            this._ctx.clearRect(0, 0, this._canvasNode.width, this._canvasNode.height);

            this._canvasNode.width = width;
            this._canvasNode.height = height;
            this._isEmpty = true;
            
            this._ctx.translate(Math.round(-bbox.xMin / resolution), Math.round(bbox.yMax / resolution));
        }
        
        get width() { return this._canvasNode.width; }
        get height() { return this._canvasNode.height; }
        
        draw(render) {
            if (render instanceof Arc) {
                this._drawArc(render);
            } else if (render instanceof Point) {
                this._drawPoint(render);
            } else if (render instanceof Polyline || render instanceof Polygon) {
                this._drawPoly(render);
            } else if (render instanceof VectorImage) {
                this._drawImage(render);
            } else {
                utils.error('Unknown vector geometry type.');
            }
            
            this._isEmpty = false;
        }
        
        setIndex(index) {
            this._canvasNode.style.zIndex = index;
        }

        _drawArc(render) {
            var center = render.center;

            this._ctx.beginPath();
            this._ctx.lineWidth = render.strokeWidth;
            this._ctx.strokeStyle = render.strokeColor;
            this._ctx.fillStyle = render.fillColor;

            if (render.isSector) {
                this._ctx.moveTo(center[0], center[1]);
            }
            this._ctx.arc(center[0], center[1], render.radius, render.startAngle, render.endAngle, !render.clockwise);
            if (render.isSector) {
                this._ctx.lineTo(center[0], center[1]);
            }
            this._ctx.fill();
            this._ctx.stroke();
        }

        _drawPoint(render) {
            this._ctx.strokeStyle = this._ctx.fillStyle = render.color;
            this._ctx.fillRect(render.coordinates[0], render.coordinates[1], 1, 1);
        }

        _drawImage(render) {
            let [x, y] = render.origin;
            this._ctx.drawImage(render.node, Math.round(x), Math.round(y));
        }

        _drawPoly(render) {
            var coordinates = render.coordinates;

            this._ctx.beginPath();
            this._ctx.lineCap = 'round';
            this._ctx.lineJoin = 'round';
            this._ctx.lineWidth = render.strokeWidth;
            this._ctx.strokeStyle = render.strokeColor;
            this._ctx.setLineDash(render.lineDash || []);

            for (var ring = 0, ringsCount = coordinates.length; ring < ringsCount; ring++) {
                this._ctx.moveTo(coordinates[ring][0][0], coordinates[ring][0][1]);
                for (var i = 1, len = coordinates[ring].length; i < len; i++) {
                    this._ctx.lineTo(coordinates[ring][i][0], coordinates[ring][i][1]);
                }

                if (render instanceof Polygon) {
                    this._ctx.closePath();
                }
            }

            if (render instanceof Polygon) {
                if (render.fillStyle === 'color') {
                    this._ctx.fillStyle = render.fillColor;
                } else if (render.fillStyle === 'image') {
                    this._ctx.fillStyle = this._ctx.createPattern(render.fillImage, 'repeat');
                    var patternOffsetX = (coordinates[0][0][0]) % render.fillImage.width,
                        patternOffsetY = (coordinates[0][0][1]) % render.fillImage.height;
                    this._ctx.translate(patternOffsetX, patternOffsetY);
                }
                this._ctx.fill();

                this._ctx.translate(-patternOffsetX, -patternOffsetY);
            }

            this._ctx.stroke();
        }
        
        get isEmpty() { return this._isEmpty; }
        
        get node() { return this._canvasNode; }
    }
    
    return Canvas;
    
});
sGis.module('painter.domPainter.Container', [
    'utils'
], (utils) => {

    let containerStyle = 'width: 100%; height: 100%; transform-origin: left top; position: absolute;';

    /**
     * @alias sGis.painter.domPainter.Container
     */
    class Container {
        constructor(wrapper, bbox, resolution, onEmpty) {
            this._onEmpty = onEmpty;
            this._bbox = bbox;
            this._resolution = resolution;

            this._setContainer(wrapper);
        }

        _setContainer(wrapper) {
            this._container = document.createElement('div');
            this._container.style.cssText = containerStyle;
            wrapper.appendChild(this._container);
        }
        
        remove() {
            this._container.innerHTML = '';
            if (this._container.parentNode) this._container.parentNode.removeChild(this._container);
        }
        
        get isEmpty() { return this._container.childElementCount === 0; }
        get scale() { return this._scale; }
        get crs() { return this._bbox.crs; }

        updateTransform(parentBbox, parentResolution) {
            if (parentBbox.crs !== this._bbox.crs) parentBbox = parentBbox.projectTo(this._bbox.crs);
            this._scale = this._resolution / parentResolution;
            setNodeTransform(
                this._container,
                this._scale,
                (this._bbox.xMin - parentBbox.xMin) / parentResolution,
                (parentBbox.yMax - this._bbox.yMax) / parentResolution
            );
        }

        addNode(node, width, height, bbox) {
            if (bbox.crs !== this._bbox.crs) {
                if (!bbox.crs.canProjectTo(this._bbox.crs)) return;
                bbox = bbox.projectTo(this._bbox.crs);
            }
            Container._setNodeStyle(node);
            setNodeTransform(
                node,
                bbox.width / width / this._resolution,
                (bbox.xMin - this._bbox.xMin) / this._resolution,
                (this._bbox.yMax - bbox.yMax) / this._resolution
            );

            this._container.appendChild(node);
        }

        addFixedSizeNode(node, position, offset = [0, 0]) {
            Container._setNodeStyle(node);
            setNodeTransform(
                node,
                1,
                position[0] + offset[0] - this._bbox.xMin / this._resolution,
                position[1] + offset[1] + this._bbox.yMax / this._resolution
            );

            this._container.appendChild(node);
        }

        get resolution() { return this._resolution; }

        static _setNodeStyle(node) {
            node.style.position = 'absolute';
            node.style.transformOrigin = 'left top';
        }
        
        removeNode(node) {
            if (node.parentNode === this._container) {
                this._container.removeChild(node);
                if (this._container.childElementCount === 0) {
                    this._onEmpty();
                }
            }
        }
    }

    function setNodeTransform(node, scale, tx, ty) {
        tx = browserAdj(normalize(tx));
        ty = browserAdj(normalize(ty));
        scale = normalize(scale);
        node.style.transform = 'translate3d(' + tx + 'px,' + ty + 'px,0px) scale(' + scale.toPrecision(6) + ',' + scale.toPrecision(6) + ')';
    }

    function normalize(n) {
        return Math.abs(n - Math.round(n)) < 0.001 ? Math.round(n) : n;
    }

    function browserAdj(n) {
        if (!utils.isIE) {
            return Math.round(n);
        }
        return n;
    }

    return Container;
    
});
sGis.module('painter.DomPainter', [
    'painter.domPainter.LayerRenderer',
    'painter.domPainter.Container',
    'painter.domPainter.EventDispatcher',
    'EventHandler',
    'Point',
    'Bbox',
    'utils'
], (/** sGis.painter.domPainter.LayerRenderer */ LayerRenderer,
    /** sGis.painter.domPainter.Container */ Container,
    /** sGis.painter.domPainter.EventDispatcher */ EventDispatcher,
    EventHandler,
    /** sGis.Point */ Point,
    /** sGis.Bbox */ Bbox,
    /** sGis.utils */ utils) => {
    
    'use strict';
    
    /**
     * @namespace sGis.painter.domPainter
     */

    let innerWrapperStyle = 'position: relative; overflow: hidden; width: 100%; height: 100%;';
    let layerWrapperStyle = 'position: absolute; width: 100%; height: 100%; z-index: 0;';

    /**
     * @alias sGis.painter.DomPainter
     */
    class DomRenderer extends EventHandler {
        /**
         * @constructor
         * @param {sGis.Map} map - the map to be drawn.
         * @param {Object} options - key-value list of properties to be assigned to the instance.
         */
        constructor(map, options) {
            super();
            this._map = map;
            utils.init(this, options, true);

            this._layerRenderers = new Map();
            this._containers = [];

            this._position = new Point([Infinity, Infinity]);
            this._resolution = Infinity;

            this._needUpdate = true;
            this._updateAllowed = true;
            
            this._updateLayerList();
            this._setEventListeners();

            this._repaintBound = this._repaint.bind(this);
            this._repaint();
        }

        /**
         * DOM element, inside of which the map will be drawn. If null is given, the map will not be drawn. If string is given, an element with given id will be searched.
         * @type HTMLElement|String
         */
        get wrapper() { return this._wrapper; }
        set wrapper(/** HTMLElement|String */ node) {
            if (this._wrapper) this._clearDOM();
            if (node) {
                this._initDOM(node);
                this._eventDispatcher = new EventDispatcher(this._layerWrapper, this);
                this._needUpdate = true;
                this._redrawNeeded = true;
            }

            this.fire('wrapperChange');
        }

        get layerRenderers() { return Array.from(this._layerRenderers.values()); }

        /**
         * Sets position and resolution of the map to show the full bounding box in the center of the map
         * @param {sGis.Bbox} bbox
         * @param {Boolean} [animate=true] - if set to true, the position will be changed gradually with animation.
         */
        show(bbox, animate = true) {
            let projected = bbox.projectTo(this.map.crs);
            let xResolution = projected.width / this.width;
            let yResolution = projected.height / this.height;

            let method = animate ? 'animateTo' : 'setPosition';

            let center = projected.center;
            this.map[method](center, this.map.getAdjustedResolution(Math.max(xResolution, yResolution)));

            return new Bbox([center.x - this.width * xResolution, center.y - this.height * yResolution],
                            [center.x + this.width * xResolution, center.y + this.height * yResolution], this.map.crs);
        }
        
        _updateLayerList() {
            let mapLayers = this._map.getLayers(true, true);
            for (let layer of this._layerRenderers.keys()) {
                if (mapLayers.indexOf(layer) < 0) this._removeLayer(layer);
            }

            mapLayers.forEach((layer, index) => {
                let renderer = this._layerRenderers.get(layer);
                if (renderer) {
                    renderer.setIndex(index);
                } else {
                    this._addLayer(layer, index);
                }
            });
        }

        _addLayer(layer, index) {
            this._layerRenderers.set(layer, new LayerRenderer(this, layer, index));
        }

        _removeLayer(layer) {
            this._layerRenderers.get(layer).clear();
            this._layerRenderers.delete(layer);
        }
        
        _setEventListeners() {
            this._map.on('contentsChange', this._updateLayerList.bind(this));
            this._map.on('drag', this._onMapDrag.bind(this));
            this._map.on('dblclick', this._onMapDblClick.bind(this));
            this._map.on('animationStart', this.forbidUpdate.bind(this));
            this._map.on('animationEnd', this.allowUpdate.bind(this));
        }

        /**
         * Prevents the map to be redrawn.
         */
        forbidUpdate() {
            this._updateAllowed = false;
        }

        /**
         * Allows redrawing of the map again after .forbidUpdate() has been called.
         */
        allowUpdate() {
            this._updateAllowed = true;
        }
        
        _repaint() {
            this._updateSize();

            if (this.isDisplayed) {
                if (this._needUpdate && this._updateAllowed) {
                    this._setNewContainer();
                    this._needUpdate = false;
                }

                this._updateBbox();

                if (this._updateAllowed) {
                    this._map.getLayers(true, true).reverse().forEach(layer => {
                        let renderer = this._layerRenderers.get(layer);
                        if (this._redrawNeeded || renderer.updateNeeded) {
                            try {
                                renderer.update();
                            } catch (e) {
                                utils.warn(e);
                                renderer.updateNeeded = false;
                            }
                        }
                    });

                    this._redrawNeeded = false;
                }
            }

            utils.requestAnimationFrame(this._repaintBound);
        }
        
        _setNewContainer() {
            this._containers.push(new Container(this._layerWrapper, this.bbox, this._map.resolution, this._removeEmptyContainers.bind(this)));
        }

        _removeEmptyContainers() {
            // Check all containers except the last one, for we never remove it
            for (let i = this._containers.length - 2; i >= 0; i--) {
                if (this._containers[i].isEmpty) {
                    this._removeContainer(i);
                }
            }
        }

        _removeContainer(i) {
            this._containers[i].remove();
            this._containers.splice(i, 1);
        }

        _updateSize() {
            this._width = this._wrapper ? this._wrapper.clientWidth || this._wrapper.offsetWidth : 0;
            this._height = this._wrapper ? this._wrapper.clientHeight || this._wrapper.offsetHeight : 0;
        }

        /**
         * Returns true is the map is currently displayed in the DOM>
         * @type Boolean
         * @readonly
         */
        get isDisplayed() { return this._width && this._height; }
        
        _updateBbox() {
            let mapPosition = this._map.position;
            if (this._position[0] !== mapPosition[0] || this._position[1] !== mapPosition[1] || !utils.softEquals(this._map.resolution, this._resolution) || this._bboxWidth !== this._width || this._bboxHeight !== this._height) {
                this._position = [mapPosition[0], mapPosition[1]];
                this._resolution = this._map.resolution;

                let dx = this._width * this._resolution / 2;
                let dy = this._height * this._resolution / 2;
                
                this._bbox = new Bbox([mapPosition[0] - dx, mapPosition[1] - dy], [mapPosition[0] + dx, mapPosition[1] + dy], this._map.crs);

                this._containers.forEach(container => {
                    if (container.crs.canProjectTo(this._map.crs)) {
                        container.updateTransform(this._bbox, this._resolution);
                    } else {
                        this._removeContainer(this._containers.indexOf(container));
                        if (this._containers.length === 0) this._setNewContainer();
                    }
                });
                
                if (this._containers.length > 0 && this._containers[this._containers.length - 1].scale !== 1) this._needUpdate = true;

                this._bboxWidth = this._width;
                this._bboxHeight = this._height;

                this._redrawNeeded = true;
            }
        }

        /**
         * Current bbox of the map drawn by this painter.
         * @type sGis.Bbox
         * @readonly
         */
        get bbox() {
            if (!this._bbox) this._updateBbox();
            return this._bbox;
        }

        /**
         * The map this painter draws.
         * @type sGis.Map
         * @readonly
         */
        get map() { return this._map; }

        get currContainer() { return this._containers[this._containers.length - 1]}

        /**
         * Width of the map on the screen in pixels.
         * @type Number
         * @readonly
         */
        get width() { return this._width; }

        /**
         * Height of the map on the screen in pixels.
         * @type Number
         * @readonly
         */
        get height() { return this._height; }

        _initDOM(node) {
            let wrapper = node instanceof HTMLElement ? node : document.getElementById(node);
            if (!wrapper) utils.error('The element with ID "' + node + '" is not found.');

            this._innerWrapper = document.createElement('div');
            this._innerWrapper.style.cssText = innerWrapperStyle;
            wrapper.appendChild(this._innerWrapper);
            
            this._layerWrapper = document.createElement('div');
            this._layerWrapper.style.cssText = layerWrapperStyle;
            this._innerWrapper.appendChild(this._layerWrapper);
            
            this._wrapper = wrapper;
        }
        
        _clearDOM() {
            if (this._innerWrapper.parentNode) this._innerWrapper.parentNode.removeChild(this._innerWrapper);
            this._innerWrapper = null;
            this._layerWrapper = null;
            this._wrapper = null;
            
            this._eventDispatcher.remove();
            this._eventDispatcher = null;

            this._clearContainers();
        }

        _clearContainers() {
            this._containers.forEach((container, i) => {
                this._removeContainer(i);
            });
            this._map.getLayers(true, true).reverse().forEach(layer => {
                let renderer = this._layerRenderers.get(layer);
                renderer.clear();
            });
        }
        
        get innerWrapper() { return this._innerWrapper; }

        resolveLayerOverlay() {
            let prevContainerIndex = 0;
            this._map.getLayers(true, true).forEach(layer => {
                let renderer = this._layerRenderers.get(layer);
                if (!renderer) return;
                
                let containerIndex = this._containers.indexOf(renderer.currentContainer);
                if (containerIndex < prevContainerIndex) {
                    renderer.moveToLastContainer();
                    prevContainerIndex = this._containers.length - 1;
                } else {
                    prevContainerIndex = containerIndex;
                }
            });

            this._removeEmptyContainers();
        }

        /**
         * Returns the point in map coordinates, that is located at the given offset from the left top corner of the map.
         * @param {Number} x
         * @param {Number} y
         * @returns {sGis.Point}
         */
        getPointFromPxPosition(x, y) {
            let resolution = this._map.resolution;
            let bbox = this.bbox;
            return new Point([
                bbox.xMin + x * resolution,
                bbox.yMax - y * resolution],
                bbox.crs
            );
        }

        /**
         * For the given point, returns the px offset on the screen from the left top corner of the map.
         * @param {Number[]} position - point in the map coordinates [x, y]
         * @returns {{x: number, y: number}}
         */
        getPxPosition(position) {
            return {
                x: (position[0] - this.bbox.xMin) / this._map.resolution,
                y: (this.bbox.yMax - position[1]) / this._map.resolution
            };
        }

        _onMapDrag(sGisEvent) {
            setTimeout(() => {
                if (sGisEvent.isCanceled()) return;
                this._map.move(sGisEvent.offset.x, sGisEvent.offset.y);
            }, 0);
        }

        _onMapDblClick(sGisEvent) {
            setTimeout(() => {
                if (sGisEvent.isCanceled()) return;
                this._map.animateSetResolution(this._map.resolution/2, sGisEvent.point);
            }, 0);
        }
    }

    return DomRenderer;

});
sGis.module('painter.domPainter.EventDispatcher', [
    'event',
    'utils'
], (ev, utils) => {

    'use strict';

    const MIN_WHEEL_DELAY = 50;

    var defaults = {
        objectEvents: ['click', 'dblclick', 'dragStart', 'mousemove']
    };

    /**
     * @alias sGis.painter.domPainter.EventDispatcher
     */
    class EventDispatcher {
        constructor(baseNode, master) {
            this._master = master;
            this._setListeners(baseNode);

            this._onDocumentMousemove = this._onDocumentMousemove.bind(this);
            this._onDocumentMouseup = this._onDocumentMouseup.bind(this);

            this._wheelTimer = 0;
            this._touchHandler = {dragPrevPosition: []};
        }
        
        _dispatchEvent(name, data) {
            var sGisEvent;

            var topObject = this._master.map;
            if (data.position) {
                var layerRenderers = this._master.layerRenderers;
                for (var i = layerRenderers.length - 1; i >= 0; i--) {
                    var details = {};
                    var targetObject = layerRenderers[i].getEventCatcher(name, [data.position.x, data.position.y], details);

                    if (name === 'mousemove' && !targetObject) {
                        targetObject = layerRenderers[i].getEventCatcher('mouseover', [data.position.x, data.position.y], details);
                    }

                    if (targetObject) {
                        data.intersectionType = details.intersectionType;
                        sGisEvent = targetObject.fire(name, data);
                        topObject = targetObject;
                        if (sGisEvent && sGisEvent.isCanceled()) return sGisEvent;
                        break;
                    }
                }
            }

            if (name === 'mousemove' && topObject !== this._hoverObject) {
                if (this._hoverObject && this._hoverObject !== this._master.map) {
                    this._hoverObject.fire('mouseout', data);
                }

                topObject.fire('mouseover', data);
                this._hoverObject = topObject;
            }
                
            if (sGisEvent) {
                this._master.map.forwardEvent(sGisEvent);
                return sGisEvent;
            } else {
                return this._master.map.fire(name, data);
            }
        }

        _setListeners(baseNode) {
            ev.add(baseNode, 'mousedown', this._onmousedown.bind(this));
            ev.add(baseNode, 'wheel', this._onwheel.bind(this));
            ev.add(baseNode, 'click', this._onclick.bind(this));
            ev.add(baseNode, 'dblclick', this._ondblclick.bind(this));
            ev.add(baseNode, 'mousemove', this._onmousemove.bind(this));
            ev.add(baseNode, 'mouseout', this._onmouseout.bind(this));
            ev.add(baseNode, 'contextmenu', this._oncontextmenu.bind(this));

            ev.add(baseNode, 'touchstart', this._ontouchstart.bind(this));
            ev.add(baseNode, 'touchmove', this._ontouchmove.bind(this));
            ev.add(baseNode, 'touchend', this._ontouchend.bind(this));
        }

        _onmousedown(event) {
            if (!isFormElement(event.target)) {
                this._clickCatcher = true;
                if (event.which === 1) {
                    this._dragPosition = ev.getMouseOffset(event.currentTarget, event);

                    ev.add(document, 'mousemove', this._onDocumentMousemove);
                    ev.add(document, 'mouseup', this._onDocumentMouseup);

                    document.ondragstart = function() {return false;};
                    document.body.onselectstart = function() {return false;};
                }
                return false;
            }
        }

        _onDocumentMousemove(event) {
            var map = this._master.map;
            var mousePosition = ev.getMouseOffset(this._master.wrapper, event);
            var dxPx = this._dragPosition.x - mousePosition.x;
            var dyPx = this._dragPosition.y - mousePosition.y;
            var resolution = map.resolution;
            var point = this._master.getPointFromPxPosition(mousePosition.x, mousePosition.y);
            var position = {x: point.x / resolution, y: - point.y / resolution}; // TODO: remove this property

            if (Math.abs(dxPx) > 2 || Math.abs(dyPx) > 2 || !this._clickCatcher) {
                this._lastDrag = {x: dxPx * resolution, y: -dyPx * resolution};

                if (this._clickCatcher) {
                    this._clickCatcher = null;
                    var originalPoint = this._master.getPointFromPxPosition(this._dragPosition.x, this._dragPosition.y);
                    var originalPosition = {x: originalPoint.x / resolution, y: - originalPoint.y / resolution};
                    var sGisEvent = this._dispatchEvent('dragStart', {map: map, mouseOffset: mousePosition, position: originalPosition, point: originalPoint, ctrlKey: event.ctrlKey, offset: {xPx: dxPx, yPx: dyPx, x: this._lastDrag.x, y: this._lastDrag.y}, browserEvent: event});
                    this._draggingObject = sGisEvent.draggingObject || this._master.map;
                }

                this._dragPosition = mousePosition;
                this._draggingObject.fire('drag', {map: map, mouseOffset: mousePosition, position: position, point: point, ctrlKey: event.ctrlKey, offset: {xPx: dxPx, yPx: dyPx, x: this._lastDrag.x, y: this._lastDrag.y}, browserEvent: event});
            }
        }

        _onDocumentMouseup(event) {
            this._clearDocumentListeners();
            if (this._draggingObject) this._draggingObject.fire('dragEnd', {browserEvent: event});

            this._draggingObject = null;
            this._lastDrag = null;
        }

        remove() {
            this._clearDocumentListeners();
        }

        _clearDocumentListeners() {
            ev.remove(document, 'mousemove', this._onDocumentMousemove);
            ev.remove(document, 'mouseup', this._onDocumentMouseup);
            document.ondragstart = null;
            document.body.onselectstart = null;
        }

        _onwheel(event) {
            var time = Date.now();
            if (time - this._wheelTimer > MIN_WHEEL_DELAY) {
                this._wheelTimer = time;
                var map = this._master.map;
                var wheelDirection = ev.getWheelDirection(event);
                var mouseOffset = ev.getMouseOffset(event.currentTarget, event);

                map.zoom(wheelDirection, this._master.getPointFromPxPosition(mouseOffset.x, mouseOffset.y));
            }
            event.preventDefault();
            return false;
        }

        _getMouseEventDescription(event) {
            var map = this._master.map;
            var mouseOffset = ev.getMouseOffset(event.currentTarget, event);
            var point = this._master.getPointFromPxPosition(mouseOffset.x, mouseOffset.y);
            var position = {x: point.x / map.resolution, y: - point.y / map.resolution};
            return {map: map, mouseOffset: mouseOffset, ctrlKey: event.ctrlKey, point: point, position: position, browserEvent: event};
        }

        _onclick(event) {
            if (this._clickCatcher && !isFormElement(event.target)) {
                this._dispatchEvent('click', this._getMouseEventDescription(event));
            }
        }

        _ondblclick(event) {
            if (!isFormElement(event.target)) {
                this._clickCatcher = null;
                this._dispatchEvent('dblclick', this._getMouseEventDescription(event));
            }
        }

        _onmousemove(event) {
            this._dispatchEvent('mousemove', this._getMouseEventDescription(event));
        }

        _onmouseout(event) {
            this._dispatchEvent('mouseout', this._getMouseEventDescription(event));
        }

        _oncontextmenu(event) {
            this._dispatchEvent('contextmenu', this._getMouseEventDescription(event));
        }

        _ontouchstart(event) {
            if (!this._touches) this._touches = [];

            for (let  i = 0; i < event.changedTouches.length; i++) {
                let touch = event.changedTouches[i];
                if (!this._touches.some(t => t.id === touch.identifier)) this._touches.push({ id: touch.identifier, position: [touch.pageX, touch.pageY] });
            }

            this._touchHandler.lastDrag = {x: 0, y: 0};

            if (event.touches.length > 1) event.preventDefault();
        }

        _ontouchmove(event) {
            this._clearTouches(event);
            let touches = Array.prototype.slice.apply(event.touches);

            let map = this._master.map;
            if (touches.length === 1 && this._touchHandler.lastDrag) {
                let touch = event.targetTouches[0];
                let [prevX, prevY] = this._touches[0].position;
                let dxPx = prevX - touch.pageX;
                let dyPx = prevY - touch.pageY;
                let resolution = map.resolution;
                let touchOffset = ev.getMouseOffset(event.currentTarget, touch);
                let point = this._master.getPointFromPxPosition(touchOffset.x, touchOffset.y);
                let position = {x: point.x / resolution, y: 0 - point.y / resolution};

                if (this._touchHandler.lastDrag.x === 0 && this._touchHandler.lastDrag.y === 0) {
                    let sGisEvent = this._dispatchEvent('dragStart', {point: point, position: position, offset: {xPx: dxPx, yPx: dyPx, x: this._touchHandler.lastDrag.x, y: this._touchHandler.lastDrag.y}});
                    this._draggingObject = sGisEvent.draggingObject || map;
                }

                this._touchHandler.lastDrag = {x: dxPx * resolution, y: 0 - dyPx * resolution};
                this._draggingObject.fire('drag', {point: point, position: position, offset: {xPx: dxPx, yPx: dyPx, x: this._touchHandler.lastDrag.x, y: this._touchHandler.lastDrag.y}});

                this._touches[0].position = [touch.pageX, touch.pageY];
            } else if (touches.length > 1) {
                this._master.forbidUpdate();
                this._touchHandler.lastDrag = null;
                this._touchHandler.scaleChanged = true;

                let t1 = touches.find(t => t.identifier === this._touches[0].id);
                let t2 = touches.find(t => t.identifier === this._touches[1].id);

                let [x11, y11] = this._touches[0].position;
                let [x12, y12] = [t1.pageX, t1.pageY];
                let [x21, y21] = this._touches[1].position;
                let [x22, y22] = [t2.pageX, t2.pageY];

                let c1 = [(x11 + x21) / 2, (y11 + y21) / 2];
                let c2 = [(x12 + x22) / 2, (y12 + y22) / 2];

                let base = [(c1[0] + c2[0]) / 2, (c1[1] + c2[1]) / 2];

                let len1 = Math.sqrt(Math.pow(x11 - x21, 2) + Math.pow(y11 - y21, 2));
                let len2 = Math.sqrt(Math.pow(x12 - x22, 2) + Math.pow(y12 - y22, 2));

                let basePoint = this._master.getPointFromPxPosition(base[0], base[1]);
                let dc = [c1[0] - c2[0], c2[1] - c1[1]];

                let zoomK = len1 / len2;
                if (len1 !== len2 && len2 !== 0) map.changeScale(zoomK, basePoint, true);
                map.move(dc[0]*map.resolution, dc[1]*map.resolution);

                this._touches[0].position = [x12, y12];
                this._touches[1].position = [x22, y22];

                this._touchHandler.lastZoomDirection = zoomK < 1;
            }
            event.preventDefault();
        }

        _ontouchend(event) {
            this._clearTouches(event);

            for (let i = 0; i < event.changedTouches.length; i++) {
                let index = this._touches.findIndex(touch => touch.id === event.changedTouches[i].identifier);
                if (index >= 0) this._touches.splice(index, 1);
            }

            this._touchHandler.lastDrag = null;


            if (this._touchHandler.scaleChanged) {
                this._master.allowUpdate();
                this._master.map.adjustResolution(this._touchHandler.lastZoomDirection);
                this._touchHandler.scaleChanged = false;
            } else {
                if (this._draggingObject) {
                    this._draggingObject.fire('dragEnd');
                    this._draggingObject = null;
                }
            }
        }

        _clearTouches(event) {
            let touches = Array.prototype.slice.apply(event.touches);

            for (let i = this._touches.length - 1; i >= 0; i--) {
                if (!touches.some(touch => touch.identifier === this._touches[i].id)) this._touches.splice(i, 1);
            }
        }
    }

    function isFormElement(e) {
        var formElements = ['BUTTON', 'INPUT', 'LABEL', 'OPTION', 'SELECT', 'TEXTAREA'];
        for (var i = 0; i < formElements.length; i++) {
            if (e.tagName === formElements[i]) return true;
        }
        return false;
    }
    
    utils.extend(EventDispatcher.prototype, defaults);
    
    return EventDispatcher;

});
sGis.module('painter.domPainter.LayerRenderer', [
    'Bbox',
    'painter.domPainter.Canvas',
    'painter.domPainter.SvgRender',
    'utils'
], (/** sGis.Bbox */ Bbox,
    /** sGis.painter.domPainter.Canvas */ Canvas,
    /** sGis.painter.domPainter.SvgRender */ SvgRender,
    /** sGis.utils */ utils) => {

    'use strict';

    var defaults = {
        /** @memberof sGis.painter.domPainter.LayerRenderer */
        delayedUpdateTime: 500,

        listensFor: ['click', 'dblclick', 'dragStart', 'mousemove', 'mouseover']
    };

    /**
     * @alias sGis.painter.domPainter.LayerRenderer
     * @ignore
     */
    class LayerRenderer {
        /**
         * @constructor
         * @alias sGis.renderers.domRenderer.LayerRenderer.constructor
         * @param master
         * @param layer
         * @param index
         * @param useCanvas
         */
        constructor(master, layer, index, useCanvas = true) {
            this._master = master;
            this._layer = layer;
            this._useCanvas = useCanvas;
            this._canvas = new Canvas();
            
            this._bbox = new Bbox([Infinity, Infinity], [Infinity, Infinity]);
            this._featureRenders = new Map();
            this._loadingRenders = new Map();
            this._renderNodeMap = new Map();
            this._renderContainerMap = new Map();

            this._outdatedFeatureRenders = new Map();
            this._rendersForRemoval = new Map();

            this._setEventCatcherMaps();

            this._setListeners();
            this.setIndex(index);
            
            this._forceUpdate();
        }
        
        get layer() { return this._layer; }
        
        _setListeners() {
            this._layer.on('propertyChange', () => {
                this._forceUpdate();
            });
        }

        _setEventCatcherMaps() {
            this._eventCatchers = {};
            this.listensFor.forEach(eventName => {
               this._eventCatchers[eventName] = new Map();
            });
        }
        
        _forceUpdate() {
            this.updateNeeded = true;
        }
        
        setIndex(index) {
            if (index === this._index) return;

            let zIndex = index*2+1;
            for (let renders of this._featureRenders.values()) {
                renders.forEach(render => {
                    let node = this._renderNodeMap.get(render);
                    if (node) node.style.zIndex = zIndex;
                });
            }

            for (let renders of this._outdatedFeatureRenders.values()) {
                renders.forEach(render => {
                    let node = this._renderNodeMap.get(render);
                    if (node) node.style.zIndex = zIndex;
                });
            }
            
            this._canvas.setIndex(index*2);

            this._index = index;
            this._zIndex = zIndex;
        }
        
        clear() {
            for (let render of this._loadingRenders.keys()) {
                this._removeRender(render);
            }

            for (let feature of this._outdatedFeatureRenders.keys()) {
                this._clean(feature);
            }

            for (let feature of this._featureRenders.keys()) {
                this._removeRenders(feature);
            }

            for (let render of this._renderNodeMap.keys()) {
                this._removeRender(render);
            }

            if (this._canvasContainer) this._canvasContainer.removeNode(this._canvas.node);
            if (this._updateTimer) clearTimeout(this._updateTimer);
        }

        update() {
            if (this._layer.delayedUpdate) {
                if (this._updateTimer) clearTimeout(this._updateTimer);

                if (this.updateNeeded) {
                    this._rerender();
                } else {
                    this._updateTimer = setTimeout(() => { this._rerender(); }, this.delayedUpdateTime);
                }
            } else {
                this._rerender();
            }
            
            this.updateNeeded = false;
        }

        _rerender() {
            let bbox = this._master.bbox;

            let newFeatures = this._layer.getFeatures(bbox, this._master.map.resolution);
            if (this._layer.updateProhibited) return;

            for (let feature of this._featureRenders.keys()) {
                if (newFeatures.indexOf(feature) < 0) this._markForRemoval(feature);
            }

            this._bbox = bbox;
            this._resetCanvas(bbox);

            newFeatures.forEach(feature => {
                this._draw(feature);
            });

            if (this._canvas.isEmpty) {
                if (this._canvasContainer) this._canvasContainer.removeNode(this._canvas.node);
                this._canvasContainer = null;
            } else {
                if (this._canvasContainer) this._canvasContainer.removeNode(this._canvas.node);
                this._master.currContainer.addNode(this._canvas.node, this._master.width, this._master.height, this._bbox);
                this.currentContainer = this._master.currContainer;
                this._canvasContainer = this._master.currContainer;
            }

            this._clean();
        }

        _resetCanvas(bbox) {
            this._canvas.reset(bbox, this._master.map.resolution, this._master.width, this._master.height);
        }

        _featureIsLoading(feature) {
            let renders = this._featureRenders.get(feature);
            if (!renders) return false;

            for (let i = 0; i < renders.length; i++) {
                if (this._loadingRenders.has(renders[i])) return true;
            }

            return false;
        }

        _draw(feature) {
            if (this._featureIsLoading(feature)) return;
            this._removeForRemoval(feature);

            this._currentResolution = this._master.map.resolution;

            let renders = feature.render(this._currentResolution, this._master.map.crs);

            let isMixedRender = false;
            var canvasIsUsed = this._useCanvas && renders[0] && renders[0].isVector;
            for (let i = 1; i < renders.length; i++) {
                if (this._useCanvas && renders[i] && renders[i].isVector) canvasIsUsed = true;
                if (renders[i].isVector !== renders[i-1].isVector) {
                    isMixedRender = true;
                    break;
                }
            }
            if (isMixedRender) canvasIsUsed = false;

            let prevRenders = this._featureRenders.get(feature);
            if (!canvasIsUsed && prevRenders === renders) return;

            if (prevRenders !== renders) this._markAsOutdated(feature);
            this._featureRenders.set(feature, renders);

            for (let i = 0; i < renders.length; i++) {
                if (renders[i].isVector) {
                    if (this._useCanvas && !isMixedRender) {
                        this._canvas.draw(renders[i]);
                    } else {
                        this._drawNodeRender(renders[i], feature);
                    }
                } else {
                    this._drawNodeRender(renders[i], feature);
                }
                this._setFeatureListeners(feature, renders[i]);
            }

            if (canvasIsUsed || renders.length === 0) this._clean(feature);
        }

        _setFeatureListeners(feature, render) {
            this.listensFor.forEach(eventName => {
                if (!feature.hasListeners(eventName) || render.ignoreEvents) return;

                this._eventCatchers[eventName].set(render, feature);
            });
        }
        
        _drawNodeRender(render, feature) {
            if (this._loadingRenders.has(render)) return;

            this._loadingRenders.set(render, 1);

            var callback = (error, node) => {
                this._loadingRenders.delete(render);

                if (error) {
                    return this._clean(feature);
                }

                if (!this._featureRenders.has(feature)
                    || !render.baseRender && this._featureRenders.get(feature).indexOf(render) < 0
                    || render.baseRender && this._featureRenders.get(feature).indexOf(render.baseRender) < 0
                    || this._outdatedFeatureRenders.has(render) || this._rendersForRemoval.has(render)) return;

                node.style.zIndex = this._zIndex;

                let container = this._master.currContainer;
                if (render.bbox) {
                    container.addNode(node, render.width || node.width, render.height || node.height, render.bbox);
                } else if (render.position || svgRender.position) {
                    let k = this._currentResolution / container.resolution;
                    let position = render.position || svgRender.position;
                    container.addFixedSizeNode(node, [position[0]*k, position[1]*k], render.offset);
                }

                this._renderNodeMap.set(render, node);

                this._renderContainerMap.set(render, container);
                this.currentContainer = container;

                if (render.onAfterDisplayed) render.onAfterDisplayed(node);

                this._clean(feature);
            };

            if (render.getNode) {
                render.getNode(callback);
            } else {
                var svgRender = new SvgRender(render);
                svgRender.getNode(callback);
            }
        }

        get currentContainer() { return this._currentContainer; }
        set currentContainer(container) {
            if (this._currentContainer !== container) {
                this._currentContainer = container;
                this._master.resolveLayerOverlay();
            }
        }

        _clean(feature) {
            var outdated = this._outdatedFeatureRenders.get(feature);
            if (outdated) {
                outdated.forEach(render => {
                    this._removeRender(render);
                });

                this._outdatedFeatureRenders.delete(feature);
            }

            if (this._loadingRenders.size > 0) return;

            setTimeout(() => {
                for (var renders of this._rendersForRemoval.values()) {
                    renders.forEach(render => {
                        this._removeRender(render);
                    });
                }
                this._rendersForRemoval.clear();
            }, this._layer.transitionTime || 0);
        }

        _markForRemoval(feature) {
            var forRemoval = this._rendersForRemoval.get(feature) || [];

            var renders = this._featureRenders.get(feature);
            renders.forEach(render => {
                forRemoval.push(render);
            });

            this._rendersForRemoval.set(feature, forRemoval);
            this._featureRenders.delete(feature);
        }

        _removeForRemoval(feature) {
            let renders = this._rendersForRemoval.get(feature);
            if (renders && !this._featureRenders.has(feature)) {
                renders.forEach(render => { this._removeRender(render); });
                this._rendersForRemoval.delete(feature);
            }
        }

        _markAsOutdated(feature) {
            var renders = this._featureRenders.get(feature);
            if (!renders) return;

            var outdated = this._outdatedFeatureRenders.get(feature) || [];
            renders.forEach(render => {
                outdated.push(render);
            });

            this._outdatedFeatureRenders.set(feature, outdated);
            this._featureRenders.delete(feature);

        }

        _removeRenders(feature) {
            let renders = this._featureRenders.get(feature);

            if (renders) {
                renders.forEach(render => {
                    this._removeRender(render);
                });
                this._featureRenders.delete(feature);
            }

            let outdated = this._outdatedFeatureRenders.get(feature);
            if (outdated) {
                outdated.forEach(render => {
                    this._removeRender(render);
                });
                this._outdatedFeatureRenders.delete(feature);
            }
        }

        _removeRender(render) {
            this.listensFor.forEach(eventName => {
                this._eventCatchers[eventName].delete(render);
            });

            let node = this._renderNodeMap.get(render);
            if (node === undefined) return;

            let container = this._renderContainerMap.get(render);
            if (container) {
                if (node) container.removeNode(node);
                this._renderContainerMap.delete(render);
            }

            this._renderNodeMap.delete(render);
        }

        moveToLastContainer() {
            for (let renders of this._outdatedFeatureRenders.values()) {
                this._moveRendersToLastContainer(renders);
            }

            for (let renders of this._featureRenders.values()) {
                this._moveRendersToLastContainer(renders);
            }
            
            if (this._canvas.node.parentNode) {
                this._master.currContainer.addNode(this._canvas.node, this._canvas.width, this._canvas.height, this._bbox);
                this._canvasContainer = this._master.currContainer;
            }
        }

        _moveRendersToLastContainer(renders) {
            var lastContainer = this._master.currContainer;
            renders.forEach(render => {
                let node = this._renderNodeMap.get(render);
                let container = this._renderContainerMap.get(render);
                if (node && container) {
                    if (container !== lastContainer) {
                        if (render.bbox) {
                            lastContainer.addNode(node, render.width || node.width, render.height || node.height, render.bbox);
                        } else if (render.position) {
                            let k = this._currentResolution / lastContainer.resolution;
                            lastContainer.addFixedSizeNode(node, [render.position[0] * k, render.position[1] * k], render.offset);
                        } else {
                            let svgRender = new SvgRender(render, container.resolution / lastContainer.resolution);
                            svgRender.getNode((err, newNode) => {
                                if (!svgRender.position || !this._renderNodeMap.has(render)) return;
                                container.removeNode(node);
                                this._renderNodeMap.set(render, newNode);
                                lastContainer.addFixedSizeNode(newNode, svgRender.position);
                            });
                        }
                        this._renderContainerMap.set(render, lastContainer);
                    }
                }
            });
        }

        getEventCatcher(eventName, pxPosition, data) {
            if (!this._eventCatchers[eventName]) return;

            for (var render of this._eventCatchers[eventName].keys()) {
                var intersectionType = render.contains && render.contains(pxPosition);
                if (intersectionType) {
                    data.intersectionType = intersectionType;
                    return this._eventCatchers[eventName].get(render);
                }
            }
        }
    }

    utils.extend(LayerRenderer.prototype, defaults);

    return LayerRenderer;
    
});
sGis.module('painter.domPainter.SvgRender', [
    'render.Arc',
    'render.Point',
    'render.Polyline',
    'render.Polygon',
    'utils.Color',
    'utils'
], (Arc, Point, Polyline, Polygon, Color, utils) => {
    
    'use strict';
   
    var NS = 'http://www.w3.org/2000/svg';

    /**
     * @alias sGis.painter.domPainter.SvgRender
     */
    class SvgRender{
        constructor(render, adjK) {
            this._baseRender = render;
            this._adjK = adjK || 1;
        }
        
        getNode(callback) {
            if (!this._node) this._setNode();
            callback(null, this._node);
        }

        get baseRender() { return this._baseRender; }
        get position() { return this._position; }
        
        _setNode() {
            if (this._baseRender instanceof Arc) {
                if (this._baseRender.startAngle == 0 || this._baseRender.endAngle == 2*Math.PI) {
                    this._setArcNode();
                } else {
                    this._setSegmentNode();
                }
            } else if (this._baseRender instanceof Polygon) {
                this._setPolygonNode();
            } else if (this._baseRender instanceof Polyline) {
                this._setPolylineNode();
            }
        }
        
        _setPolygonNode() {
            var path = this._getSvgPath();
            path.d += ' Z';
            path.d = path.d.replace(/ M/g, ' Z M');

            this._node = this._getPathNode({
                stroke: this._baseRender.strokeColor,
                'stroke-dasharray': this._baseRender.lineDash && this._baseRender.lineDash.length > 0 ? this._baseRender.lineDash.join(',') : undefined,
                'stroke-width': this._baseRender.strokeWidth,
                fill: this._baseRender.fillStyle === 'color' ? this._baseRender.fillColor : undefined,
                fillImage: this._baseRender.fillStyle === 'image' ? this._baseRender.fillImage : undefined,
                width: path.width,
                height: path.height,
                x: path.x,
                y: path.y,
                viewBox: [path.x, path.y, path.width, path.height].join(' '),
                d: path.d
            });

            this._position = [path.x, path.y];
        }
        
        _setPolylineNode() {
            var path = this._getSvgPath();
            this._node = this._getPathNode({
                stroke: this._baseRender.strokeColor,
                'stroke-dasharray': this._baseRender.lineDash && this._baseRender.lineDash.length > 0 ? this._baseRender.lineDash.join(',') : undefined,
                'stroke-width': this._baseRender.strokeWidth,
                fill: 'transparent',
                width: path.width,
                height: path.height,
                x: path.x,
                y: path.y,
                viewBox: [path.x, path.y, path.width, path.height].join(' '),
                d: path.d
            });

            this._position = [path.x, path.y];
        }
        
        _getPathNode(properties) {
            if (properties.fillImage) {
                var defs = document.createElementNS(NS, 'defs');
                var pattern = document.createElementNS(NS, 'pattern');
                var id = utils.getGuid();
                pattern.setAttribute('id', id);
                pattern.setAttribute('patternUnits', 'userSpaceOnUse');
                pattern.setAttribute('x', properties.x);
                pattern.setAttribute('y', properties.y);
                pattern.setAttribute('width', properties.fillImage.width);
                pattern.setAttribute('height', properties.fillImage.height);

                var image = document.createElementNS(NS, 'image');
                image.setAttributeNS("http://www.w3.org/1999/xlink", 'xlink:href', properties.fillImage.src);
                image.setAttribute('width', properties.fillImage.width);
                image.setAttribute('height', properties.fillImage.height);

                pattern.appendChild(image);
                defs.appendChild(pattern);
            }

            var path = document.createElementNS(NS, 'path');
            var svgAttributes = setAttributes(path, properties);
            var svg = this._getSvgBase(svgAttributes);

            if (properties.fillImage) {
                svg.setAttribute('xmlns', NS);
                svg.setAttribute('xmlns:xlink', "http://www.w3.org/1999/xlink");

                path.setAttribute('fill', 'url(#' + id + ')');
                svg.appendChild(defs);
            }

            svg.appendChild(path);

            return svg;
        }

        _setSegmentNode() {
            var path = this._getSegment();
            this._node = this._getPathNode({
                stroke: this._baseRender.strokeColor,
                'stroke-width': this._baseRender.strokeWidth,
                fill: this._baseRender.fillColor,
                width: path.width,
                height: path.height,
                x: path.x,
                y: path.y,
                viewBox: [path.x, path.y, path.width, path.height].join(' '),
                d: path.d
            });

            this._position = [path.x, path.y];
        }
        
        _getSegment() {
            var r = this._baseRender.radius;
            var r2 = r * 2 + this._baseRender.strokeWidth;
            var x = this._baseRender.center[0];
            var y = this._baseRender.center[1];

            var x1 = x + r * Math.cos(this._baseRender.startAngle);
            var y1 = y + r * Math.sin(this._baseRender.startAngle);

            var x2 = x + r * Math.cos(this._baseRender.endAngle);
            var y2 = y + r * Math.sin(this._baseRender.endAngle);

            var largeFlag = Math.abs(this._baseRender.endAngle - this._baseRender.startAngle) % (Math.PI * 2) > Math.PI ? 1 : 0;

            var path = `M ${x},${y} L ${x1},${y1} A ${r},${r} 0 ${largeFlag} 1 ${x2},${y2}`;
            var x0 = x - r - this._baseRender.strokeWidth / 2;
            var y0 = y - r - this._baseRender.strokeWidth / 2;

            return {x: x0, y: y0, width: r2, height: r2, d: path};
        }

        _setArcNode() {
            var r2 = this._baseRender.radius * 2 + this._baseRender.strokeWidth;
            var x = this._baseRender.center[0] * this._adjK - this._baseRender.radius - this._baseRender.strokeWidth / 2;
            var y = this._baseRender.center[1] * this._adjK - this._baseRender.radius - this._baseRender.strokeWidth / 2;

            this._node = this._getCircle({
                r: this._baseRender.radius,
                cx: this._baseRender.center[0] * this._adjK,
                cy: this._baseRender.center[1] * this._adjK,
                stroke: this._baseRender.strokeColor,
                'stroke-width': this._baseRender.strokeWidth,
                fill: this._baseRender.fillColor,

                width: r2,
                height: r2,
                viewBox: [x, y, r2, r2].join(' ')
            });

            this._position = [x, y];
        }

        _getCircle(properties) {
            var circle = document.createElementNS(NS, 'circle');
            var svgAttributes = setAttributes(circle, properties);
            var svg = this._getSvgBase(svgAttributes);

            svg.appendChild(circle);

            return svg;
        }

        _getSvgBase(properties) {
            var svg = document.createElementNS(NS, 'svg');
            setAttributes(svg, properties);
            svg.setAttribute('style', 'pointerEvents: none;');

            return svg;
        }
        
        _getSvgPath() {
            var d = '';
            var coordinates = this._baseRender.coordinates;
            var x = coordinates[0][0][0] * this._adjK;
            var y = coordinates[0][0][1] * this._adjK;
            var xMax = x;
            var yMax = y;

            for (var ring = 0; ring < coordinates.length; ring++) {
                d += 'M' + this._adj(coordinates[ring][0]).join(' ') + ' ';
                for (var i = 1; i < coordinates[ring].length; i++) {
                    d += 'L' + this._adj(coordinates[ring][i]).join(' ') + ' ';
                    x = Math.min(x, coordinates[ring][i][0] * this._adjK);
                    y = Math.min(y, coordinates[ring][i][1] * this._adjK);
                    xMax = Math.max(xMax, coordinates[ring][i][0] * this._adjK);
                    yMax = Math.max(yMax, coordinates[ring][i][1] * this._adjK);
                }
            }

            var width = xMax - x + this._baseRender.strokeWidth;
            var height = yMax - y + this._baseRender.strokeWidth;
            x -= this._baseRender.strokeWidth / 2;
            y -= this._baseRender.strokeWidth / 2;
            d = d.trim();

            return {width: width, height: height, x: x, y: y, d: d};
        }

        _adj(position) {
            return [position[0] * this._adjK, position[1] * this._adjK];
        }
    }

    var svgAttributes = ['width', 'height', 'viewBox'];
    function setAttributes(element, attributes) {
        var isSvg = element instanceof SVGSVGElement;
        var notSet = {};
        for (var i in attributes) {
            if (attributes.hasOwnProperty(i) && i !== 'fillImage' && attributes[i] !== undefined) {
                if (!isSvg && svgAttributes.indexOf(i) !== -1) {
                    notSet[i] = attributes[i];
                    continue;
                }

                if (i === 'stroke' || i === 'fill') {
                    var color = new Color(attributes[i]);
                    if (color.a < 255 || color.format === 'rgba') {
                        element.setAttribute(i, color.toString('rgb'));
                        if (color.a < 255) element.setAttribute(i + '-opacity', color.a / 255);
                        continue;
                    }
                }
                element.setAttribute(i, attributes[i]);
            }
        }

        return notSet;
    }

    return SvgRender;
    
});
sGis.module('symbol.point.Image', [
    'Symbol',
    'render.HtmlElement',
    'serializer.symbolSerializer'
], (Symbol, HtmlElement, symbolSerializer) => {

    'use strict';

    /**
     * Symbol of point drawn as circle with outline.
     * @alias sGis.symbol.point.Image
     * @extends sGis.Symbol
     */
    class ImageSymbol extends Symbol {
        /**
         * @constructor
         * @param {Object} properties - key-value list of the properties to be assigned to the instance.
         */
        constructor(properties) {
            super(properties);
        }

        renderFunction(/** sGis.feature.Point */ feature, resolution, crs) {
            if (feature.position === undefined) return [];

            var position = feature.projectTo(crs).position;
            var pxPosition = [position[0] / resolution, - position[1] / resolution];
            var renderPosition = [pxPosition[0], pxPosition[1]];

            var html = '<img src="' + this.source + '"' + (this.width > 0 ? ' width="' + this.width + '"' : '') + (this.height > 0 ? ' height="' + this.height + '"' : '') + '>';
            return [new HtmlElement(html, renderPosition, null, [-this.anchorPoint.x, -this.anchorPoint.y])];
        }
    }

    /**
     * Width of the image. If not set, image will be automatically resized according to height. If both width and height are not set, original image size will be used.
     * @member {Number} sGis.symbol.point.Image#width
     * @default 10
     */
    ImageSymbol.prototype.width = 32;

    /**
     * Height of the image. If not set, image will be automatically resized according to width. If both width and height are not set, original image size will be used.
     * @member {Number} sGis.symbol.point.Image#height
     * @default 32
     */
    ImageSymbol.prototype.height = 32;

    /**
     * Anchor point of the image in the {x: dx, y: dy} format. If set to {x: 0, y: 0}, image's left top corner will be at the feature position.<br>
     *     Anchor point does not scale with width and height parameters.  
     * @member {Object} sGis.symbol.point.Image#anchorPoint
     * @default {x: 16, y: 32}
     */
    ImageSymbol.prototype.anchorPoint = {x: 16, y: 32};

    //noinspection SpellCheckingInspection
    /**
     * Source of the image. Can be url or data:url string.
     * @member {String} sGis.symbol.point.Image#source
     * @default <img src="data:image/png;base64,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">
     */
    ImageSymbol.prototype.source = 'data:image/png;base64,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';

    symbolSerializer.registerSymbol(ImageSymbol, 'point.Image', ['width', 'height', 'anchorPoint', 'source']);

    return ImageSymbol;

});
sGis.module('symbol.point.MaskedImage', [
    'Symbol',
    'render.HtmlElement',
    'utils.Color',
    'serializer.symbolSerializer'
], (Symbol, HtmlElement, Color, symbolSerializer) => {

    'use strict';

    /**
     * Symbol of point drawn as masked image.
     * @alias sGis.symbol.point.MaskedImage
     * @extends sGis.Symbol
     */
    class MaskedImage extends Symbol {
        /**
         * @constructor
         * @param {Object} properties - key-value list of the properties to be assigned to the instance.
         */
        constructor(properties) {
            super(properties);

            if (!this._image) this.imageSource = this._imageSource;
            if (!this._mask) this.maskSource = this._maskSource;

            this._updateMasked();
        }

        renderFunction(/** sGis.feature.Point */ feature, resolution, crs) {
            if (feature.position === undefined) return [];

            if (!this._isLoaded()) return [];

            var position = feature.projectTo(crs).position;
            var pxPosition = [position[0] / resolution, - position[1] / resolution];
            var renderPosition = [pxPosition[0], pxPosition[1]];

            var html = '<img src="' + this._maskedSrc + '"' + (this.width > 0 ? ' width="' + this.width + '"' : '') + (this.height > 0 ? ' height="' + this.height + '"' : '') + '>';
            return [new HtmlElement(html, renderPosition, null, [-this.anchorPoint.x, -this.anchorPoint.y])];
        }

        //noinspection SpellCheckingInspection
        /**
         * Source of the base image. Can be url or data:url string.
         * @type String
         * @default <img src="data:image/png;base64,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">
         */
        get imageSource() { return this._imageSource; }
        set imageSource(/** String */ source) {
            this._imageSource = source;

            this._image = new Image();
            this._image.onload = this._updateMasked.bind(this);
            this._image.src = source;
        }

        //noinspection SpellCheckingInspection
        /**
         * Source of the mask image. Can be url or data:url string.
         * @type String
         * @default <img src="data:image/png;base64,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">
         */
        get maskSource() { return this._maskSource; }
        set maskSource(/** String */ source) {
            this._maskSource = source;

            this._mask  = new Image();
            this._mask.onload = this._updateMasked.bind(this);
            this._mask.src = source;
        }

        /**
         * Color of the mask. Can be any valid css color string.
         * @type String
         * @default "#9bdb00"
         */
        get maskColor() { return this._maskColor; }
        set maskColor(/** String */ color) {
            this._maskColor = color;
            this._updateMasked();
        }

        _isLoaded() { return this._image.complete && this._mask.complete; }

        _updateMasked() {
            if (!this._mask | !this._image || !this._isLoaded()) return;

            var canvas = document.createElement('canvas');
            canvas.width = this._mask.width;
            canvas.height = this._mask.height;

            var ctx = canvas.getContext('2d');
            ctx.drawImage(this._mask, 0, 0);

            var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            this._recolorMask(imageData);
            ctx.putImageData(imageData, 0, 0);

            var resultCanvas = document.createElement('canvas');
            resultCanvas.width = this._image.width;
            resultCanvas.height = this._image.height;
            
            var resultCtx = resultCanvas.getContext('2d');
            resultCtx.drawImage(this._image, 0, 0);
            resultCtx.drawImage(canvas, 0, 0);

            this._maskedSrc = resultCanvas.toDataURL(0, 0, this._image.width, this._image.height);
        }
        
        _recolorMask(imageData) {
            var maskColor = new Color(this.maskColor);
            var alphaNormalizer = 65025;

            var d = imageData.data;
            for (var i = 0; i < d.length; i += 4) {
                var r = d[i];
                var a = d[i+3];
                var srcA = a * maskColor.a / alphaNormalizer;
                d[i+3] = + Math.round(Math.min(1, srcA) * 255);
                d[i] = maskColor.r * r / 255;
                d[i+1] = maskColor.g * r / 255;
                d[i+2] = maskColor.b * r / 255;
            }
        }
    }

    /**
     * Width of the image. If not set, image will be automatically resized according to height. If both width and height are not set, original image size will be used.
     * @member {Number} sGis.symbol.point.MaskedImage#width
     * @default 10
     */
    MaskedImage.prototype.width = 32;

    /**
     * Height of the image. If not set, image will be automatically resized according to width. If both width and height are not set, original image size will be used.
     * @member {Number} sGis.symbol.point.MaskedImage#height
     * @default 32
     */
    MaskedImage.prototype.height = 32;

    /**
     * Anchor point of the image in the {x: dx, y: dy} format. If set to {x: 0, y: 0}, image's left top corner will be at the feature position.<br>
     *     Anchor point does not scale with width and height parameters.
     * @member {Object} sGis.symbol.point.MaskedImage#anchorPoint
     * @default {x: 16, y: 32}
     */
    MaskedImage.prototype.anchorPoint = {x: 16, y: 32};

    //noinspection SpellCheckingInspection
    MaskedImage.prototype._imageSource = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEQAAABECAYAAAA4E5OyAAAACXBIWXMAABYlAAAWJQFJUiTwAAAKT2lDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjanVNnVFPpFj333vRCS4iAlEtvUhUIIFJCi4AUkSYqIQkQSoghodkVUcERRUUEG8igiAOOjoCMFVEsDIoK2AfkIaKOg6OIisr74Xuja9a89+bN/rXXPues852zzwfACAyWSDNRNYAMqUIeEeCDx8TG4eQuQIEKJHAAEAizZCFz/SMBAPh+PDwrIsAHvgABeNMLCADATZvAMByH/w/qQplcAYCEAcB0kThLCIAUAEB6jkKmAEBGAYCdmCZTAKAEAGDLY2LjAFAtAGAnf+bTAICd+Jl7AQBblCEVAaCRACATZYhEAGg7AKzPVopFAFgwABRmS8Q5ANgtADBJV2ZIALC3AMDOEAuyAAgMADBRiIUpAAR7AGDIIyN4AISZABRG8lc88SuuEOcqAAB4mbI8uSQ5RYFbCC1xB1dXLh4ozkkXKxQ2YQJhmkAuwnmZGTKBNA/g88wAAKCRFRHgg/P9eM4Ors7ONo62Dl8t6r8G/yJiYuP+5c+rcEAAAOF0ftH+LC+zGoA7BoBt/qIl7gRoXgugdfeLZrIPQLUAoOnaV/Nw+H48PEWhkLnZ2eXk5NhKxEJbYcpXff5nwl/AV/1s+X48/Pf14L7iJIEyXYFHBPjgwsz0TKUcz5IJhGLc5o9H/LcL//wd0yLESWK5WCoU41EScY5EmozzMqUiiUKSKcUl0v9k4t8s+wM+3zUAsGo+AXuRLahdYwP2SycQWHTA4vcAAPK7b8HUKAgDgGiD4c93/+8//UegJQCAZkmScQAAXkQkLlTKsz/HCAAARKCBKrBBG/TBGCzABhzBBdzBC/xgNoRCJMTCQhBCCmSAHHJgKayCQiiGzbAdKmAv1EAdNMBRaIaTcA4uwlW4Dj1wD/phCJ7BKLyBCQRByAgTYSHaiAFiilgjjggXmYX4IcFIBBKLJCDJiBRRIkuRNUgxUopUIFVIHfI9cgI5h1xGupE7yAAygvyGvEcxlIGyUT3UDLVDuag3GoRGogvQZHQxmo8WoJvQcrQaPYw2oefQq2gP2o8+Q8cwwOgYBzPEbDAuxsNCsTgsCZNjy7EirAyrxhqwVqwDu4n1Y8+xdwQSgUXACTYEd0IgYR5BSFhMWE7YSKggHCQ0EdoJNwkDhFHCJyKTqEu0JroR+cQYYjIxh1hILCPWEo8TLxB7iEPENyQSiUMyJ7mQAkmxpFTSEtJG0m5SI+ksqZs0SBojk8naZGuyBzmULCAryIXkneTD5DPkG+Qh8lsKnWJAcaT4U+IoUspqShnlEOU05QZlmDJBVaOaUt2ooVQRNY9aQq2htlKvUYeoEzR1mjnNgxZJS6WtopXTGmgXaPdpr+h0uhHdlR5Ol9BX0svpR+iX6AP0dwwNhhWDx4hnKBmbGAcYZxl3GK+YTKYZ04sZx1QwNzHrmOeZD5lvVVgqtip8FZHKCpVKlSaVGyovVKmqpqreqgtV81XLVI+pXlN9rkZVM1PjqQnUlqtVqp1Q61MbU2epO6iHqmeob1Q/pH5Z/YkGWcNMw09DpFGgsV/jvMYgC2MZs3gsIWsNq4Z1gTXEJrHN2Xx2KruY/R27iz2qqaE5QzNKM1ezUvOUZj8H45hx+Jx0TgnnKKeX836K3hTvKeIpG6Y0TLkxZVxrqpaXllirSKtRq0frvTau7aedpr1Fu1n7gQ5Bx0onXCdHZ4/OBZ3nU9lT3acKpxZNPTr1ri6qa6UbobtEd79up+6Ynr5egJ5Mb6feeb3n+hx9L/1U/W36p/VHDFgGswwkBtsMzhg8xTVxbzwdL8fb8VFDXcNAQ6VhlWGX4YSRudE8o9VGjUYPjGnGXOMk423GbcajJgYmISZLTepN7ppSTbmmKaY7TDtMx83MzaLN1pk1mz0x1zLnm+eb15vft2BaeFostqi2uGVJsuRaplnutrxuhVo5WaVYVVpds0atna0l1rutu6cRp7lOk06rntZnw7Dxtsm2qbcZsOXYBtuutm22fWFnYhdnt8Wuw+6TvZN9un2N/T0HDYfZDqsdWh1+c7RyFDpWOt6azpzuP33F9JbpL2dYzxDP2DPjthPLKcRpnVOb00dnF2e5c4PziIuJS4LLLpc+Lpsbxt3IveRKdPVxXeF60vWdm7Obwu2o26/uNu5p7ofcn8w0nymeWTNz0MPIQ+BR5dE/C5+VMGvfrH5PQ0+BZ7XnIy9jL5FXrdewt6V3qvdh7xc+9j5yn+M+4zw33jLeWV/MN8C3yLfLT8Nvnl+F30N/I/9k/3r/0QCngCUBZwOJgUGBWwL7+Hp8Ib+OPzrbZfay2e1BjKC5QRVBj4KtguXBrSFoyOyQrSH355jOkc5pDoVQfujW0Adh5mGLw34MJ4WHhVeGP45wiFga0TGXNXfR3ENz30T6RJZE3ptnMU85ry1KNSo+qi5qPNo3ujS6P8YuZlnM1VidWElsSxw5LiquNm5svt/87fOH4p3iC+N7F5gvyF1weaHOwvSFpxapLhIsOpZATIhOOJTwQRAqqBaMJfITdyWOCnnCHcJnIi/RNtGI2ENcKh5O8kgqTXqS7JG8NXkkxTOlLOW5hCepkLxMDUzdmzqeFpp2IG0yPTq9MYOSkZBxQqohTZO2Z+pn5mZ2y6xlhbL+xW6Lty8elQfJa7OQrAVZLQq2QqboVFoo1yoHsmdlV2a/zYnKOZarnivN7cyzytuQN5zvn//tEsIS4ZK2pYZLVy0dWOa9rGo5sjxxedsK4xUFK4ZWBqw8uIq2Km3VT6vtV5eufr0mek1rgV7ByoLBtQFr6wtVCuWFfevc1+1dT1gvWd+1YfqGnRs+FYmKrhTbF5cVf9go3HjlG4dvyr+Z3JS0qavEuWTPZtJm6ebeLZ5bDpaql+aXDm4N2dq0Dd9WtO319kXbL5fNKNu7g7ZDuaO/PLi8ZafJzs07P1SkVPRU+lQ27tLdtWHX+G7R7ht7vPY07NXbW7z3/T7JvttVAVVN1WbVZftJ+7P3P66Jqun4lvttXa1ObXHtxwPSA/0HIw6217nU1R3SPVRSj9Yr60cOxx++/p3vdy0NNg1VjZzG4iNwRHnk6fcJ3/ceDTradox7rOEH0x92HWcdL2pCmvKaRptTmvtbYlu6T8w+0dbq3nr8R9sfD5w0PFl5SvNUyWna6YLTk2fyz4ydlZ19fi753GDborZ752PO32oPb++6EHTh0kX/i+c7vDvOXPK4dPKy2+UTV7hXmq86X23qdOo8/pPTT8e7nLuarrlca7nuer21e2b36RueN87d9L158Rb/1tWeOT3dvfN6b/fF9/XfFt1+cif9zsu72Xcn7q28T7xf9EDtQdlD3YfVP1v+3Njv3H9qwHeg89HcR/cGhYPP/pH1jw9DBY+Zj8uGDYbrnjg+OTniP3L96fynQ89kzyaeF/6i/suuFxYvfvjV69fO0ZjRoZfyl5O/bXyl/erA6xmv28bCxh6+yXgzMV70VvvtwXfcdx3vo98PT+R8IH8o/2j5sfVT0Kf7kxmTk/8EA5jz/GMzLdsAAAAgY0hSTQAAeiUAAICDAAD5/wAAgOkAAHUwAADqYAAAOpgAABdvkl/FRgAAB7lJREFUeNrsnH9QVNcVx793Xdhll44GUbEzKNoWzQI6/go4ExHTGujYRg1MYtOpzsQ/mkAaK4nB/6haZ5pO80eTOGxmMmOaTuM/TabSzDBaBIV1tJUxbEQKnSWY8kcMYQwICyzD8u0fvkeXLOze3XcfvExyZt7M7tt7zj3nw333x7nvIkjiW/m/2GP9KIRQVhFJJ4BCAI8C8ADIBZADwA0gTSs2BiAI4A6A/wDoBNAK4F9CiHGFvsT+ca5LQcUukgdI1pMcZ/IyTvK8ZsulAsicMZsBhOQKkqdJfkn18qVme4XlgZBMI3mC5BjNlzGSvyGZZkkgJHeT/JTzL5+S3G0ZICRTSP6e5BQXTqY0H1KMAhGxAo83ypBcDOCvAH5kkVGzEUCFEGIo2VEmaSBap3YBwEaLTSX8AB4XQvTPGxCtZfgA5Ft0ftUB4NG5WkqsmG1JTrAarAYjHA7jxImT6OnpgeZbA0mH2jF59vJeWkwmJyf5i4OHmJLq4OqcNezr69N/8po6ypB8xmowQqEQ9z9ZzpRUx/T1SGERx8amp0I/MwUIyUySA1aDsW//kzNg6FdlVZVebIDkUjOAvG0lGMFgkHv37psVhn41NTfrxd9WCoSkZ4EnXlEwdu9+PCaMlFQH8ws2MBQK6RM3jwwQ2VHmOABhhdFkdHQU+/btx+UrV+KW7e7uxjvv/Ama7zUy9uPOQ0iuBNAHYJHq4O7du4eBgQGMjo4CAFwuFzIzM5GRkTGnTmdnJ4p3luD+/ftSdaxduxYdtz6G3W4PA8gWQnxmKB9C8pjqjvDNM2foycufs6l78vL55pkzenOPkgsXLzLV4Yz7yOhXfX29rnrMcB9Csl0VDL/fz4ING6UDKdiwkX6/f1Zbr7xSI23nqacP6GrthoCQzFIFo6WllRlLM6WD0K+HMpaypaU1yt7IyAhXrc6RsuFO/w6DwaCummWkU92loq/o7e1FeUUFhoeHE9YdGRlBeUUFent7Z9x3u92orj4qZWNiYgLXrl/Xv5bEKhsPSJEKIJWVVRgcHExaf3BwEJWVVVH3Dx08CIdDbrnia/XpH7cbAbLOKAyf7youNTUZhnqpqQk+39UZ95YsWYIfPvaY3PL39m2pmOIByTUayLt/flfZMD2brR3FO6R0A4GAVEzxgGQYDaKlpVUZkNlsrV+/Xkr37t3PpGKKB2Sxig5Vlcxm67srV0p2zkGpmGwwUVRteMWyZ7PJhRAKhaTKmQpECCE9CsiIw+GISmuGQhNSuk6nUwmQIaNB5OXlKQPi8Xii7t25I/dIulwuqZjiARkwGkRZaakyID8uK4tOsfs/ltLNysqSiikekP8aDeLw4WeRkpJiGIbdbsfhw89G3f9HY6OU/upVq6RiigfE8BCRnZ2NyuefNwykqrIS2dnZUfmO9vZ2Kf3c3FypmOIBuamiqZ86dRJbtmxJWn/z5s04depk1P3X33gjARub5GKKs9otUrXa7e//goVF2xNe7RYWbWd//xdR9rq7u+lyp0vb6enp0VWLjCz/7SSHlL2/MDbG6uqX6ExzxQ3AmeZidfVLkdsJM/ZhSnbtkoaxbv3DuuqQFpOhBNEHqpPEgUCANTXHmZdfEOV8Xn4Ba2qOMxAIzKmfSHIoJdXBo0erddUPVGTMDpmZQQ+HwwyFQgyFQgyHw3HL/+7VVxN+7K5du66rH1QBJJ1k0AqbUi++eCRhGA978qZ3L0imG96GEEKMAHh/Ibce2trasKN4J+q83oR1n3vul/rH97VYjG92k9w6768ETU3R57vKp54+kFCGPfJatnwFh4eHdZNbZWK2Sy7S2kheAbDTrFZw48YNDA4N4ZOeT3Dzo5tobLyEvr4+QzZ/9cILSE9PB4DLQog2JRtVEVRLADSbBSTV4VRqb/myZejq+rcOpEQIcSWyhRhe/gshLuPBizJfC6mtrdVhNETCUNZCNLL5AD4C5B61hWohRUWFuNzcDJvNNglgkxCi46v9ppIEkWb4NSu3jNTUVHjr6vRM2mtfhWFGxuwkgIBVgZw+/Vs9kRQAcCLhLF+SbyEW4sFbiHYrPTJlpaU4f/5vEEJM4sFbiP+ca6qhNKeqVVRrpZaRk5ODs2fP6n/E2rlgmNJCNMo2APUA9ix0C3G73fC1tuj52w8B7BVCTMWajCrPumsVPgOgeyFbht1ux3vv/UWH0Q3g57FgmLoNIYS4D+CnKpLRycpbXq+efB4A8BPNp+RFxfEQktuMroiTWavU1XkjV7LblMSs8LxMGcmJ+QLi9b6lq06QLFXWCBSfqHoiWSgGYDyh9KlQfeZOgxIyA4jLnc5z585N54ySgTHvQLQKdyWanJZ51+zCxYuRyeISU/pNs46pktxEsl8FkO99/we8devW9I4GyU2mDSQmn9tdQ7LTCJAdxcW8+/nnerHbJNco8GthgGiVLybZkAyQI0d+HfnyboN2kgtfayCaA4tI/kEWyOIlD0V2ntR0Fyn0Z2GBRDhSTnI4FpCt2x5hV1eXfnuYZLkJflgDiObMOpL+2YC8/PIxjo9P/4sAP8l1JvlgHSCaQ06Sr0cC6ejoiPz6R+2wI74RQCIc20Mycmu/n+SeeajXmkA051aQ/JDk30kun6c6kzvq/k0U27cIZsr/BgDbzNoD8uJVDwAAAABJRU5ErkJggg==';
    //noinspection SpellCheckingInspection
    MaskedImage.prototype._maskSource = 'data:image/png;base64,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';
    MaskedImage.prototype._maskColor = '#9bdb00';
    
    symbolSerializer.registerSymbol(MaskedImage, 'point.MaskedImage', ['width', 'height', 'anchorPoint', 'imageSource', 'maskSource', 'maskColor']);

    return MaskedImage;

});
sGis.module('symbol.point.Point', [
    'Symbol',
    'render.Arc',
    'serializer.symbolSerializer'
], (Symbol, ArcRender, symbolSerializer) => {

    'use strict';

    /**
     * @namespace sGis.symbol.point
     */

    /**
     * Symbol of point drawn as circle with outline.
     * @alias sGis.symbol.point.Point
     * @extends sGis.Symbol
     */
    class PointSymbol extends Symbol {
        /**
         * @constructor
         * @param {Object} properties - key-value list of the properties to be assigned to the instance.
         */
        constructor(properties) {
            super(properties);
        }

        renderFunction(/** sGis.feature.Point */ feature, resolution, crs) {
            if (feature.position === undefined) return [];
            
            var position = feature.projectTo(crs).position;
            var pxPosition = [position[0] / resolution + this.offset.x, - position[1] / resolution + this.offset.y];

            var point = new ArcRender(pxPosition, { fillColor: this.fillColor, strokeColor: this.strokeColor, strokeWidth: this.strokeWidth, radius: this.size / 2 });
            return [point];
        }
    }

    /**
     * Diameter of the circle.
     * @member {Number} sGis.symbol.point.Point#size
     * @default 10
     */
    PointSymbol.prototype.size = 10;

    /**
     * Offset of the point from the feature position in {x: dx, y: dy} format. If set to {x:0, y:0}, center of the circle will be at the position of the feature.
     * @member {Object} sGis.symbol.point.Point#offset
     * @default {x: 0, y: 0}
     */
    PointSymbol.prototype.offset = {x: 0, y: 0};

    /**
     * Color of the inner part of the circle. Can be any valid css color string.
     * @member {String} sGis.symbol.point.Point#fillColor
     * @default "black"
     */
    PointSymbol.prototype.fillColor = 'black';

    /**
     * Color of the outline of the circle. Can be any valid css color string.
     * @member {String} sGis.symbol.point.Point#strokeColor
     * @default "transparent"
     */
    PointSymbol.prototype.strokeColor = 'transparent';

    /**
     * Width of the outline.
     * @member {Number} sGis.symbol.point.Point#strokeWidth
     * @default 1
     */
    PointSymbol.prototype.strokeWidth = 1;

    symbolSerializer.registerSymbol(PointSymbol, 'point.Point', ['size', 'offset', 'fillColor', 'strokeColor', 'strokeWidth']);

    return PointSymbol;

});
sGis.module('symbol.point.Square', [
    'Symbol',
    'render.Polygon',
    'serializer.symbolSerializer'
], (Symbol, PolygonRender, symbolSerializer) => {

    'use strict';

    /**
     * Symbol of point drawn as a square.
     * @alias sGis.symbol.point.Square
     * @extends sGis.Symbol
     */
    class SquareSymbol extends Symbol {
        /**
         * @constructor
         * @param {Object} properties - key-value list of the properties to be assigned to the instance.
         */
        constructor(properties) {
            super(properties);
        }

        renderFunction(/** sGis.feature.Point */ feature, resolution, crs) {
            if (feature.position === undefined) return [];

            var position = feature.projectTo(crs).position;
            var pxPosition = [position[0] / resolution, - position[1] / resolution];
            var halfSize = this.size / 2;
            var offset = this.offset;
            var coordinates = [
                [pxPosition[0] - halfSize + offset.x, pxPosition[1] - halfSize + offset.y],
                [pxPosition[0] - halfSize + offset.x, pxPosition[1] + halfSize + offset.y],
                [pxPosition[0] + halfSize + offset.x, pxPosition[1] + halfSize + offset.y],
                [pxPosition[0] + halfSize + offset.x, pxPosition[1] - halfSize + offset.y]
            ];

            return [new PolygonRender(coordinates, {fillColor: this.fillColor, strokeColor: this.strokeColor, strokeWidth: this.strokeWidth})];
        }
    }

    /**
     * Size of the square.
     * @member {Number} sGis.symbol.point.Square#size
     * @default 10
     */
    SquareSymbol.prototype.size = 10;

    /**
     * Offset of the point from the feature position in {x: dx, y: dy} format. If set to {x:0, y:0}, center of the square will be at the position of the feature.
     * @member {Object} sGis.symbol.point.Square#offset
     * @default {x: 0, y: 0}
     */
    SquareSymbol.prototype.offset = {x: 0, y: 0};

    /**
     * Color of the inner part of the square. Can be any valid css color string.
     * @member {String} sGis.symbol.point.Square#fillColor
     * @default "black"
     */
    SquareSymbol.prototype.fillColor = 'black';

    /**
     * Color of the outline of the square. Can be any valid css color string.
     * @member {String} sGis.symbol.point.Square#strokeColor
     * @default "transparent"
     */
    SquareSymbol.prototype.strokeColor = 'transparent';

    /**
     * Width of the outline.
     * @member {Number} sGis.symbol.point.Square#strokeWidth
     * @default 1
     */
    SquareSymbol.prototype.strokeWidth = 1;

    symbolSerializer.registerSymbol(SquareSymbol, 'point.Square', ['size', 'offset', 'fillColor', 'strokeColor', 'strokeWidth']);

    return SquareSymbol;

});
sGis.module('symbol.polygon.BrushFill', [
    'Symbol',
    'symbol.polyline.Simple',
    'render.Polygon',
    'utils.Color',
    'serializer.symbolSerializer'
], function(Symbol, PolylineSymbol, PolygonRender, Color, symbolSerializer) {

    'use strict';

    var ALPHA_NORMALIZER = 65025;

    /**
     * Symbol of polygon with brush filling.
     * @alias sGis.symbol.polygon.BrushFill
     * @extends sGis.Symbol
     */
    class PolygonSymbol extends Symbol {
        /**
         * @constructor
         * @param {Object} properties - key-value list of the properties to be assigned to the instance.
         */
        constructor(properties) {
            super(properties);
            this._updateBrush();
        }

        renderFunction(/** sGis.feature.Polygon */ feature, resolution, crs) {
            var coordinates = PolylineSymbol._getRenderedCoordinates(feature, resolution, crs);
            if (!coordinates) return [];
            return [new PolygonRender(coordinates, { strokeColor: this.strokeColor, strokeWidth: this.strokeWidth, fillStyle: 'image', fillImage: this._brush, lineDash: this.lineDash })];
        }

        /**
         * Brush pattern for filling.
         * @type Number[][]
         */
        get fillBrush() { return this._fillBrush; }
        set fillBrush(/** Number[][] */ brush) {
            this._fillBrush = brush;
            this._updateBrush();
        }

        /**
         * Brush background color. Can be any valid css color string.
         * @type String
         * @default "transparent"
         */
        get fillBackground() { return this._fillBackground; }
        set fillBackground(/** String */ color) {
            this._fillBackground = color;
            this._updateBrush();
        }

        /**
         * Brush foreground color. Can be any valid css color string.
         * @type String
         * @default "black"
         */
        get fillForeground() { return this._fillForeground; }
        set fillForeground(/** String */ color) {
            this._fillForegroudn = color;
            this._updateBrush();
        }

        _updateBrush() {
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');
            var brush = this.fillBrush;
            var foreground = new Color(this.fillForeground);
            var background = new Color(this.fillBackground);

            canvas.height = brush.length;
            canvas.width = brush[0].length;

            for (var i = 0, l = brush.length; i < l; i++) {
                for (var j = 0, m = brush[i].length; j < m; j++) {
                    var srcA = brush[i][j] * foreground.a / ALPHA_NORMALIZER,
                        dstA = background.a / 255 * (1 - srcA),
                        a = + Math.min(1, (srcA + dstA)).toFixed(2),
                        r = Math.round(Math.min(255, background.r * dstA + foreground.r * srcA)),
                        g = Math.round(Math.min(255, background.g * dstA + foreground.g * srcA)),
                        b = Math.round(Math.min(255, background.b * dstA + foreground.b * srcA));

                    ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
                    ctx.fillRect(j,i,1,1);
                }
            }

            this._brush = new Image();
            this._brush.src = canvas.toDataURL();
        }
    }

    PolygonSymbol.prototype._fillBrush =
       [[255, 255, 0, 0, 0, 0, 0, 0, 255, 255],
        [255, 255, 255, 0, 0, 0, 0, 0, 0, 255],
        [255, 255, 255, 255, 0, 0, 0, 0, 0, 0],
        [0, 255, 255, 255, 255, 0, 0, 0, 0, 0],
        [0, 0, 255, 255, 255, 255, 0, 0, 0, 0],
        [0, 0, 0, 255, 255, 255, 255, 0, 0, 0],
        [0, 0, 0, 0, 255, 255, 255, 255, 0, 0],
        [0, 0, 0, 0, 0, 255, 255, 255, 255, 0],
        [0, 0, 0, 0, 0, 0, 255, 255, 255, 255],
        [255, 0, 0, 0, 0, 0, 0, 255, 255, 255]];

    PolygonSymbol.prototype._fillBackground = 'transparent';
    PolygonSymbol.prototype._fillForeground = 'black';

    /**
     * Stroke color of the outline. Can be any valid css color string.
     * @member {String} sGis.symbol.polygon.BrushFill#strokeColor
     * @default "black"
     */
    PolygonSymbol.prototype.strokeColor = 'black';

    /**
     * Stroke width of the outline.
     * @member {Number} sGis.symbol.polygon.BrushFill#strokeWidth
     * @default 1
     */
    PolygonSymbol.prototype.strokeWidth = 1;

    /**
     * Dash pattern for the line as specified in HTML CanvasRenderingContext2D.setLineDash() specification
     * @member {Number[]} sGis.symbol.polygon.BrushFill#lineDash
     * @default []
     */
    PolygonSymbol.prototype.lineDash = [];

    symbolSerializer.registerSymbol(PolygonSymbol, 'polygon.BrushFill', ['fillBrush', 'fillBackground', 'fillForeground', 'strokeColor', 'strokeWidth']);

    return PolygonSymbol;

});

sGis.module('symbol.polygon.ImageFill', [
    'Symbol',
    'symbol.polyline.Simple',
    'render.Polygon',
    'serializer.symbolSerializer'
], function(Symbol, PolylineSymbol, PolygonRender, symbolSerializer) {

    'use strict';

    /**
     * Symbol of polygon with brush filling.
     * @alias sGis.symbol.polygon.ImageFill
     * @extends sGis.Symbol
     */
    class PolygonSymbol extends Symbol {
        /**
         * @constructor
         * @param {Object} properties - key-value list of the properties to be assigned to the instance.
         */
        constructor(properties) {
            super(properties);
            if (!this._image) this.src = this._src;
        }

        renderFunction(/** sGis.feature.Polygon */ feature, resolution, crs) {
            if (!this._image.complete) {
                this._image.onload = feature.redraw.bind(feature);
                return [];
            }
            var coordinates = PolylineSymbol._getRenderedCoordinates(feature, resolution, crs);
            if (!coordinates) return [];
            return [new PolygonRender(coordinates, { strokeColor: this.strokeColor, strokeWidth: this.strokeWidth, fillStyle: 'image', fillImage: this._image, lineDash: this.lineDash })];
        }

        /**
         * Source for the filling image. Can be url or data:url string.
         * @type String
         * @default /an empty image/
         */
        get src() { return this._src; }
        set src(/** String */ src) {
            this._src = src;
            this._image = new Image();
            this._image.src = src;
        }
    }

    //noinspection SpellCheckingInspection
    PolygonSymbol.prototype._src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

    /**
     * Stroke color of the outline. Can be any valid css color string.
     * @member {String} sGis.symbol.polygon.ImageFill#strokeColor
     * @default "black"
     */
    PolygonSymbol.prototype.strokeColor = 'black';

    /**
     * Stroke width of the outline.
     * @member {Number} sGis.symbol.polygon.ImageFill#strokeWidth
     * @default 1
     */
    PolygonSymbol.prototype.strokeWidth = 1;

    /**
     * Dash pattern for the line as specified in HTML CanvasRenderingContext2D.setLineDash() specification
     * @member {Number[]} sGis.symbol.polygon.ImageFill#lineDash
     * @default []
     */
    PolygonSymbol.prototype.lineDash = [];

    symbolSerializer.registerSymbol(PolygonSymbol, 'polygon.ImageFill', ['src', 'strokeColor', 'strokeWidth']);

    return PolygonSymbol;

});

sGis.module('symbol.polygon.Simple', [
    'Symbol',
    'symbol.polyline.Simple',
    'render.Polygon',
    'serializer.symbolSerializer'
], function(Symbol, PolylineSymbol, PolygonRender, symbolSerializer) {

    'use strict';

    /**
     * @namespace sGis.symbol.polygon
     */

    /**
     * Symbol of polygon with one color filling.
     * @alias sGis.symbol.polygon.Simple
     * @extends sGis.Symbol
     */
    class PolygonSymbol extends Symbol {
        /**
         * @constructor
         * @param {Object} properties - key-value list of the properties to be assigned to the instance.
         */
        constructor(properties) {
            super(properties);
        }

        renderFunction(/** sGis.feature.Polygon */ feature, resolution, crs) {
            var coordinates = PolylineSymbol._getRenderedCoordinates(feature, resolution, crs);
            if (!coordinates) return [];
            return [new PolygonRender(coordinates, { strokeColor: this.strokeColor, strokeWidth: this.strokeWidth, fillColor: this.fillColor, lineDash: this.lineDash })];
        }
    }

    /**
     * Fill color of the polygon. Can be any valid css color string.
     * @member {String} sGis.symbol.polygon.Simple#fillColor
     * @default "transparent"
     */
    PolygonSymbol.prototype.fillColor = 'transparent';

    /**
     * Stroke color of the outline. Can be any valid css color string.
     * @member {String} sGis.symbol.polygon.Simple#strokeColor
     * @default "black"
     */
    PolygonSymbol.prototype.strokeColor = 'black';

    /**
     * Stroke width of the outline.
     * @member {Number} sGis.symbol.polygon.Simple#strokeWidth
     * @default 1
     */
    PolygonSymbol.prototype.strokeWidth = 1;

    /**
     * Dash pattern for the line as specified in HTML CanvasRenderingContext2D.setLineDash() specification
     * @member {Number[]} sGis.symbol.polygon.Simple#lineDash
     * @default []
     */
    PolygonSymbol.prototype.lineDash = [];

    symbolSerializer.registerSymbol(PolygonSymbol, 'polygon.Simple', ['fillColor', 'strokeColor', 'strokeWidth']);

    return PolygonSymbol;

});

'use strict';

sGis.module('controls.BaseLayerSwitch', ['utils', 'Control', 'Map', 'Layer', 'event', 'utils.proto'], function (utils, Control, Map, Layer, ev, proto) {
    'use strict';

    var BaseLayerSwitch = function BaseLayerSwitch(painter, options) {
        var map = painter.map;

        if (!(map instanceof sGis.Map)) sGis.utils.error('sGis.Map instance is expected but got ' + map + ' instead');
        this._map = map;
        this._painter = painter;

        sGis.utils.init(this, options);
        this._container = this._getNewControlContainer();

        this._layerDescriptions = [];
        if (options && options.layerDescriptions) this.layerDescriptions = options.layerDescriptions;
    };

    BaseLayerSwitch.prototype = {
        _xAlign: 'right',
        _yAlign: 'bottom',
        _xOffset: 32,
        _yOffset: 32,
        _width: 64,
        _height: 64,
        _inactiveWidth: 56,
        _inactiveHeight: 56,
        _margin: 8,
        _imageWidth: 75,

        activate: function activate() {
            this.isActive = true;
        },

        deactivate: function deactivate() {
            this.isActive = false;
        },

        addLayer: function addLayer(layer, imageSrc) {
            if (!(layer instanceof sGis.Layer)) sGis.utils.error('sGis.Layer instance is expected but got ' + layer + ' instead');
            if (!layer.tileScheme) sGis.utils.error('A layer without tile scheme cannot be interpreted as base layer');
            if (this.getLayerIndex(layer) !== -1) sGis.utils.error('The layer is already in the list');

            this._layerDescriptions.push({ layer: layer, imageSrc: imageSrc });
            this._addLayerToImageBox(layer);

            if (this._map.indexOf(layer) !== -1) {
                this.activeLayer = layer;
            }

            this.isActive = this._isActive;

            this.fire('layerAdd', { layer: layer });
        },

        removeLayer: function removeLayer(layer) {
            if (this._activeLayer === layer) {
                if (this._layerDescriptions.length === 1) {
                    this.deactivate();
                } else {
                    var layerIndex = this.getLayerIndex(layer);
                    this.activeLayer = this._layerDescriptions[layerIndex === 0 ? 1 : layerIndex - 1];
                }
            }

            this._removeLayerFromImageBox(layer);
            this._layerDescriptions.splice(this.getLayerIndex(layer), 1);
        },

        _addLayerToImageBox: function _addLayerToImageBox(layer) {
            if (!this._inactiveLayerBox) {
                this._inactiveLayerBox = this._getNewInactiveLayerBox();
                this._scrollContainer = document.createElement("div");
                this._scrollContainer.className = this.pickerContainerCss + "-scroll";
                this._scrollContainer.appendChild(this._inactiveLayerBox);
                this._container.appendChild(this._scrollContainer);
                this._createScroll();
            }

            var index = this.getLayerIndex(layer);
            if (!this._layerDescriptions[index].image) {
                this._layerDescriptions[index].image = this._getLayerImageObject(layer);
            }

            if (index < this._inactiveLayerBox.children.length) {
                this._inactiveLayerBox.insertBefore(this._layerDescriptions[index].image, this._inactiveLayerBox.children[index]);
            } else {
                this._inactiveLayerBox.appendChild(this._layerDescriptions[index].image);
            }

            //this._updateImagePositions();
        },

        _createScroll: function _createScroll() {
            this._next = document.createElement("div");
            this._prev = document.createElement("div");

            this._next.className = "button everGis-navigation-button everGis-navigation-forward scrollButton";
            this._prev.className = "button everGis-navigation-button everGis-navigation-back scrollButton";
            this._next.onclick = this._scrollNext.bind(this);
            this._prev.onclick = this._scrollPrev.bind(this);
            this._scrollContainer.onwheel = this._scrollWheel.bind(this);
            this._container.appendChild(this._next);
            this._container.appendChild(this._prev);
        },

        _updateScroll: function _updateScroll() {
            if (!this._scrollContainer) return;
            var maxSize = +getComputedStyle(this._scrollContainer).width.replace("px", ""),
                listSize = this._layerDescriptions.length * 75;
            if (maxSize < listSize) {
                this._showScroll();
            } else {
                this._hideScroll();
            }

            this._scrollNextLimit = Math.round(maxSize / this._imageWidth);
        },

        _showScroll: function _showScroll() {
            this._next.style.display = "block";
            this._prev.style.display = "block";
        },

        _hideScroll: function _hideScroll() {
            this._next.style.display = "none";
            this._prev.style.display = "none";
        },

        _scrollWheel: function _scrollWheel(e) {
            var delta = e.deltaY || e.detail || e.wheelDelta;
            if (delta > 0) {
                this._scrollNext();
            } else if (delta < 0) {
                this._scrollPrev();
            }
            e.stopPropagation();
        },

        _scrollNext: function _scrollNext(e) {
            var count = this._layerDescriptions.length,
                width = this._imageWidth,
                scrollLimit = this._scrollNextLimit,
                currentPosition = this._currentPosition | 0,
                position = Math.max(currentPosition - width, -width * (count - scrollLimit));
            this._inactiveLayerBox.style.marginLeft = position + 'px';
            this._currentPosition = position;
            e && e.stopPropagation();
        },
        _scrollPrev: function _scrollPrev(e) {
            var width = this._imageWidth,
                currentPosition = this._currentPosition | 0,
                position = Math.min(currentPosition + width, 0);
            this._inactiveLayerBox.style.marginLeft = position + 'px';
            this._currentPosition = position;
            e && e.stopPropagation();
        },

        _updateImagePositions: function _updateImagePositions() {
            var top = this._height - this._inactiveHeight;
            for (var i = 0, len = this._layerDescriptions.length; i < len; i++) {
                this._layerDescriptions[i].image.style.top = top + 'px';
                this._layerDescriptions[i].image.style.left = i * (this._inactiveWidth + this._margin) + 'px';
            }
        },

        _getLayerImageObject: function _getLayerImageObject(layer) {
            var image = new Image();
            image.src = this._layerDescriptions[this.getLayerIndex(layer)].imageSrc;
            image.className = this.pickerCss;

            var self = this;
            image.onclick = function (event) {
                if (self.activeLayer !== layer) {
                    self.activeLayer = layer;
                    event.stopPropagation();
                }
            };

            var label = document.createElement('span');
            label.innerHTML = layer.name;

            var container = document.createElement('div');
            container.className = 'sGis-control-baseLayerSwitch-imageContainer';
            container.appendChild(image);
            container.appendChild(label);

            return container;
        },

        _getNewInactiveLayerBox: function _getNewInactiveLayerBox() {
            var box = document.createElement('div');
            box.className = this.pickerContainerCss;

            if (this.useToggle) box.style.maxWidth = '0px';

            return box;
        },

        _removeLayerFromImageBox: function _removeLayerFromImageBox(layer) {
            this._inactiveLayerBox.removeChild(this._layerDescriptions[this.getLayerIndex(layer)].image);
        },

        getLayerIndex: function getLayerIndex(layer) {
            for (var i = 0, len = this._layerDescriptions.length; i < len; i++) {
                if (this._layerDescriptions[i].layer === layer) return i;
            }
            return -1;
        },

        _setActiveLayerImage: function _setActiveLayerImage() {
            if (!this._activeLayerImageContainer) {
                this._activeLayerImageContainer = this._getNewActiveLayerImageContainer();
                this._container.appendChild(this._activeLayerImageContainer);
            }

            if (this._activeLayerImageContainer.children.length > 0) {
                this._activeLayerImageContainer.removeChild(this._activeLayerImageContainer.children[0]);
            }

            var index = this.getLayerIndex(this._activeLayer);
            if (!this._layerDescriptions[index].image) {
                this._layerDescriptions[index].image = this._getLayerImageObject(this._activeLayer);
            }

            var images = this._layerDescriptions[index].image.getElementsByTagName('img');

            if (images && images[0]) {
                this._activeLayerImageContainer.style.backgroundImage = 'url(' + images[0].src + ')';
            }
        },

        _getNewActiveLayerImageContainer: function _getNewActiveLayerImageContainer() {
            var container = document.createElement('div');
            container.className = this.activeCss;

            var self = this;
            ev.add(container, 'click', function (event) {
                if (self.useToggle) {
                    if (self._inactiveLayerBox.style.maxWidth === '0px') {
                        self._showInactiveLayerBox();
                    } else {
                        self._hideInactiveLayerBox();
                    }
                    event.stopPropagation();
                }
            });

            return container;
        },

        _getNewControlContainer: function _getNewControlContainer() {
            var container = document.createElement('div');
            container.className = this.containerCss;

            ev.add(container, 'dblclick', function (event) {
                event.stopPropagation();
            });

            return container;
        },

        _showInactiveLayerBox: function _showInactiveLayerBox() {
            var layerCount = this._layerDescriptions.length;
            this._inactiveLayerBox.style.maxWidth = '1024px';
        },

        _hideInactiveLayerBox: function _hideInactiveLayerBox() {
            this._inactiveLayerBox.style.maxWidth = '0px';
        },

        _updateInactiveLayersDecoration: function _updateInactiveLayersDecoration() {
            var activeLayer = this.activeLayer;
            for (var i = 0, len = this._layerDescriptions.length; i < len; i++) {
                var image = this._layerDescriptions[i].image;
                var index = image.className.indexOf(this.pickerActiveCss);
                var isActive = this.activeLayer === this._layerDescriptions[i].layer;

                if (index === -1 && isActive) {
                    image.className += ' ' + this.pickerActiveCss;
                } else if (index !== -1 && !isActive) {
                    image.className = image.className.substr(0, index - 1) + image.className.substr(index + this.pickerActiveCss.length);
                }
            }
        }
    };

    Object.defineProperties(BaseLayerSwitch.prototype, {
        xAlign: {
            get: function get() {
                return this._xAlign;
            },
            set: function set(align) {
                sGis.utils.validateValue(align, ['left', 'right']);
                this._xAlign = align;
            }
        },

        yAlign: {
            get: function get() {
                return this._yAlign;
            },
            set: function set(align) {
                sGis.utils.validateValue(align, ['top', 'bottom']);
                this._yAlign = align;
            }
        },

        xOffset: {
            get: function get() {
                return this._xOffset;
            },
            set: function set(offset) {
                sGis.utils.validateNumber(offset);
                this._xOffset = offset;
            }
        },

        yOffset: {
            get: function get() {
                return this._yOffset;
            },
            set: function set(offset) {
                sGis.utils.validateNumber(offset);
                this._yOffset = offset;
            }
        },

        width: {
            get: function get() {
                return this._width;
            },
            set: function set(width) {
                sGis.utils.validatePositiveNumber(width);
                this._width = width;
            }
        },

        height: {
            get: function get() {
                return this._height;
            },
            set: function set(height) {
                sGis.utils.validatePositiveNumber(height);
                this._height = height;
            }
        },

        inactiveWidth: {
            get: function get() {
                return this._inactiveWidth;
            },
            set: function set(width) {
                sGis.utils.validatePositiveNumber(width);
                this._inactiveWidth = width;
            }
        },

        inactiveHeight: {
            get: function get() {
                return this._inactiveHeight;
            },
            set: function set(height) {
                sGis.utils.validatePositiveNumber(height);
                this._inactiveHeight = height;
            }
        }
    });

    sGis.utils.proto.setProperties(BaseLayerSwitch.prototype, {
        layerDescriptions: {
            get: function get() {
                return this._layerDescriptions;
            },
            set: function set(descriptions) {
                if (this._layerDescriptions.length > 0) {
                    for (var i = 0, len = this._layerDescriptions; i < len; i++) {
                        this.removeLayer(this._layerDescriptions[i]);
                    }
                }
                for (var i = 0, len = descriptions.length; i < len; i++) {
                    this.addLayer(descriptions[i].layer, descriptions[i].imageSrc);
                }
            }
        },

        activeLayer: {
            get: function get() {
                return this._activeLayer;
            },
            set: function set(layer) {
                if (layer !== this._activeLayer) {
                    var indexInList = this.getLayerIndex(layer),
                        indexOnMap = 0;
                    if (indexInList === -1) sGis.utils.error('The layer is not in the list');

                    if (this._activeLayer) {
                        indexOnMap = this._map.indexOf(this._activeLayer);
                        this._map.removeLayer(this._activeLayer);
                    }

                    this._map.insertLayer(layer, indexOnMap);
                    this._activeLayer = layer;

                    this._setActiveLayerImage();
                    this._updateInactiveLayersDecoration();

                    this.fire('activeLayerChange');
                }
            }
        },

        useToggle: {
            default: true,
            set: function set(bool) {
                if (this._inactiveLayerBox) {
                    if (bool) {
                        this._inactiveLayerBox.style.maxWidth = '0px';
                    } else {
                        this._inactiveLayerBox.style.maxWidth = '';
                    }
                }
                this._useToggle = bool;
            }
        },

        isActive: {
            default: true,
            set: function set(bool) {
                if (bool) {
                    if (this._painter.innerWrapper) this._painter.innerWrapper.appendChild(this._container);
                    this._isActive = true;
                    this.fire('activate');
                } else {
                    if (this._painter.innerWrapper && this._container.parentNode) this._painter.innerWrapper.removeChild(this._container);
                    this._isActive = false;
                    this.fire('deactivate');
                }
            }
        },

        containerCss: {
            default: 'sGis-control-baseLayerSwitch-container',
            set: function set(css) {
                if (this._container) this._container.className = css;
                this._containerCss = css;
            }
        },
        activeCss: {
            default: 'sGis-control-baseLayerSwitch-active',
            set: function set(css) {
                if (this._activeLayerImageContainer) this._activeLayerImageContainer.className = css;
                this._activeCss = css;
            }
        },
        pickerCss: {
            default: 'sGis-control-baseLayerSwitch-picker',
            set: function set(css) {
                if (this._inactiveLayerBox) {
                    var images = this._inactiveLayerBox.childNodes;
                    for (var i = 0; i < images.length; i++) {
                        images.className = css;
                    }
                }

                this._pickerCss = css;

                this._updateInactiveLayersDecoration();
            }
        },
        pickerActiveCss: {
            default: 'sGis-control-baseLayerSwitch-pickerActive',
            set: function set(css) {
                this._pickerActiveCss = css;
                this.pickerCss = this._pickerCss;
            }
        },
        pickerContainerCss: {
            default: 'sGis-control-baseLayerSwitch-pickerContainer',
            set: function set(css) {
                if (this._inactiveLayerBox) this._inactiveLayerBox.className = css;
                this._pickerContainerCss = css;
            }
        },
        container: {
            default: null,
            get: function get() {
                return this._container;
            },
            set: null
        }
    });

    var defaultCss = '.sGis-control-baseLayerSwitch-container {position: absolute; right: 32px; bottom: 32px; width: 64px; height: 64px;} ' + '.sGis-control-baseLayerSwitch-active {position: absolute; right: 0px; top: 0px; width: 64px; height: 64px; border: 1px solid black; background-size: 100%; cursor: pointer;}' + '.sGis-control-baseLayerSwitch-picker {cursor: pointer; border: 1px solid gray;} ' + '.sGis-control-baseLayerSwitch-pickerActive {border: 2px solid DarkViolet;} ' + '.sGis-control-baseLayerSwitch-pickerContainer {transition: max-width 0.5s, max-height 0.5s; -webkit-transition: max-width 0.5s, max-height 0.5s; overflow: hidden; position: absolute; right: 70px; white-space: nowrap;} ' + '.sGis-control-baseLayerSwitch-pickerContainer img {width: 56px; height: 56px; margin: 5px;}' + '.sGis-control-baseLayerSwitch-imageContainer { display: inline-block; }' + '.sGis-control-baseLayerSwitch-imageContainer span { display: none; }',
        buttonStyle = document.createElement('style');
    buttonStyle.type = 'text/css';
    if (buttonStyle.styleSheet) {
        buttonStyle.styleSheet.cssText = defaultCss;
    } else {
        buttonStyle.appendChild(document.createTextNode(defaultCss));
    }

    document.head.appendChild(buttonStyle);

    return BaseLayerSwitch;
});
'use strict';

sGis.module('controls.Area', ['Control', 'controls.Polygon', 'Map', 'feature.Label', 'geotools', 'utils.proto'], function (Control, PolygonControl, Map, Label, geotools, proto) {
    'use strict';

    var Area = function Area(map, options) {
        if (!(map instanceof sGis.Map)) sGis.utils.error('sGis.Map instance is expected but got ' + map + ' instead');
        this._map = map;

        this._polygonControl = new sGis.controls.Polygon(map, { activeLayer: options && options.activeLayer, style: { strokeWidth: 2, strokeColor: 'red', fillColor: 'rgba(100, 100, 100, 0.5)' } });
        sGis.utils.init(this, options);

        this._polygonControl.addListener('drawingBegin', function () {
            if (this.activeLayer.features.length > 1) this.activeLayer.features = [this.activeLayer.features[this.activeLayer.features.length - 1]];

            var feature = this._activeLayer.features[this._activeLayer.features.length - 1],
                label = new sGis.feature.Label(feature.centroid, { content: '', crs: feature.crs, style: { css: 'sGis-distanceLabel', offset: { x: -50, y: -10 }, width: 120 } });

            this.activeLayer.add(label);

            map.addListener('mousemove.areaMeasureControl', function () {
                label.coordinates = feature.centroid;
                label.content = formatNumber(sGis.geotools.area(feature));
            });
        });

        this._polygonControl.addListener('drawingFinish', function () {
            map.removeListener('mousemove.areaMeasureControl');
        });
    };

    Area.prototype = new sGis.Control({
        _setActiveStatus: function _setActiveStatus(bool) {
            this._polygonControl.isActive = bool;
            this._active = bool;
        }
    });

    sGis.utils.proto.setProperties(Area.prototype, {
        activeLayer: {
            get: function get() {
                return this._polygonControl.activeLayer;
            },
            set: function set(layer) {
                this._polygonControl.activeLayer = layer;
            }
        },

        isActive: {
            get: function get() {
                return this._active;
            },
            set: function set(bool) {
                this._setActiveStatus(bool);
            }
        }
    });

    function formatNumber(n) {
        var s;
        if (n < 10000) {
            s = '' + n.toFixed(2) + 'м²';
        } else if (n < 10000000) {
            s = '' + (n / 10000).toFixed(2) + 'га';
        } else {
            s = '' + (n / 1000000).toFixed(2) + 'км²';
            if (s.length > 10) {
                for (var i = s.length - 9; i > 0; i -= 3) {
                    s = s.substr(0, i) + ' ' + s.substr(i);
                }
            }
        }
        return s.replace('.', ',');
    }

    return Area;
});
'use strict';

sGis.module('controls.Distance', ['utils', 'utils.proto', 'Map', 'controls.Polyline', 'geotools', 'Control'], function (utils, proto, Map, Polyline, geotools, Control) {
    'use strict';

    var Distance = function Distance(map, options) {
        if (!(map instanceof sGis.Map)) sGis.utils.error('sGis.Map instance is expected but got ' + map + ' instead');
        this._map = map;

        this._polylineControl = new sGis.controls.Polyline(map, { activeLayer: options && options.activeLayer, style: { strokeWidth: 2, strokeColor: 'red' } });
        sGis.utils.init(this, options);

        this._polylineControl.addListener('drawingBegin', function () {
            if (this.activeLayer.features.length > 1) this.activeLayer.features = [this.activeLayer.features[this.activeLayer.features.length - 1]];

            var feature = this.activeLayer.features[this.activeLayer.features.length - 1],
                coord = feature.rings[0],
                label = new sGis.feature.Label(coord[1], { symbol: new sGis.symbol.label.Label({ css: 'sGis-symbol-label-center-top sGis-distanceLabel' }), crs: map.crs });

            this.activeLayer.add(label);

            map.addListener('mousemove.distanceMeasureControl', function () {
                label.coordinates = feature.rings[0][feature.coordinates[0].length - 1];
                label.content = formatNumber(sGis.geotools.length(feature));
            });
        });

        this._polylineControl.addListener('drawingFinish', function () {
            map.removeListener('mousemove.distanceMeasureControl');
        });
    };

    Distance.prototype = new sGis.Control({
        _setActiveStatus: function _setActiveStatus(bool) {
            this._polylineControl.isActive = bool;
            this._active = bool;
        }
    });

    sGis.utils.proto.setProperties(Distance.prototype, {
        activeLayer: {
            get: function get() {
                return this._polylineControl.activeLayer;
            },
            set: function set(layer) {
                this._polylineControl.activeLayer = layer;
            }
        },

        isActive: {
            get: function get() {
                return this._active;
            },
            set: function set(bool) {
                this._setActiveStatus(bool);
            }
        }
    });

    function formatNumber(n) {
        var s;
        if (n > 10000) {
            s = '' + (n / 1000).toFixed(2) + 'км';
        } else {
            s = '' + n.toFixed(2) + 'м';
        }
        return s.replace('.', ',');
    }

    function addStyleSheet() {
        var styleSheet = document.createElement('style');
        styleSheet.type = 'text/css';
        styleSheet.innerHTML = '.sGis-distanceLabel {font-family: "PT Sans",Tahoma; font-size: 15px; background-color: rgba(200, 200, 255, 0.8);border: 1px solid black;border-radius: 5px; color: black;}';
        document.head.appendChild(styleSheet);
    }

    addStyleSheet();

    return Distance;
});
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

sGis.module('decorations.ScaleSlider', ['utils', 'utils.proto', 'EventHandler'], function (utils, proto, EventHandler) {
    'use strict';

    var defaults = {
        _gridCss: 'sGis-decorations-scaleSlider-grid',
        _gridWidth: 8,
        _gridHeight: 120,
        _gridTop: 50,
        _gridLeft: 50,
        _sliderCss: 'sGis-decorations-scaleSlider-slider',
        _sliderWidth: 25,
        _sliderHeight: 10,
        _eventNamespace: '.sGis-decorations-scaleSlider'
    };

    var ScaleSlider = function (_EventHandler) {
        _inherits(ScaleSlider, _EventHandler);

        function ScaleSlider(map, options) {
            _classCallCheck(this, ScaleSlider);

            var _this = _possibleConstructorReturn(this, (ScaleSlider.__proto__ || Object.getPrototypeOf(ScaleSlider)).call(this));

            _this._map = map;
            _this._createGrid();
            _this._createSlider();

            sGis.utils.init(_this, options);
            _this.updateDisplay();
            _this._setListeners();
            return _this;
        }

        _createClass(ScaleSlider, [{
            key: 'updateDisplay',
            value: function updateDisplay() {
                var wrapper = this._map.innerWrapper;
                if (wrapper) {
                    wrapper.appendChild(this._grid);
                    wrapper.appendChild(this._slider);
                } else if (this._grid.parentNode) {
                    this._grid.parentNode.removeChild(this._grid);
                    this._slider.parentNode.removeChild(this._grid);
                }
            }
        }, {
            key: '_setListeners',
            value: function _setListeners() {
                this._map.on('wrapperSet', this.updateDisplay.bind(this));

                this.on('drag', function () {
                    this._moveSlider(sGisEvent.offset.yPx);
                });

                this.on('dragEnd', function () {
                    this._map.painter.allowUpdate();
                    this._map.adjustResolution();
                });
            }
        }, {
            key: '_createGrid',
            value: function _createGrid() {
                var grid = document.createElement('div');
                grid.style.position = 'absolute';
                grid.style.width = this._gridWidth + 'px';
                grid.style.height = this._gridHeight + 'px';
                grid.style.top = this._gridTop + 'px';
                grid.style.left = this._gridLeft + 'px';
                grid.className = this._gridCss;

                this._grid = grid;
            }
        }, {
            key: '_createSlider',
            value: function _createSlider() {
                var slider = document.createElement('div');

                slider.style.position = 'absolute';
                slider.style.width = this._sliderWidth + 'px';
                slider.style.height = this._sliderHeight + 'px';
                slider.style.top = this._getSliderPosition() + 'px';
                slider.style.left = this._getSliderLeft() + 'px';
                slider.className = this._sliderCss;

                this._slider = slider;
                this._setSliderEvents();
            }
        }, {
            key: '_getSliderLeft',
            value: function _getSliderLeft() {
                return this._gridLeft + (this._gridWidth - this._sliderWidth) / 2;
            }
        }, {
            key: '_getSliderPosition',
            value: function _getSliderPosition() {
                var height = this._gridHeight - this._sliderHeight;
                var maxResolution = this._map.maxResolution;
                var minResolution = this._map.minResolution;
                var curResolution = this._map.resolution;

                var offset = height * Math.log2(curResolution / minResolution) / Math.log2(maxResolution / minResolution);
                if (sGis.utils.is.number(offset)) {
                    return offset + this._gridTop;
                } else {
                    return this._gridTop;
                }
            }
        }, {
            key: '_setSliderEvents',
            value: function _setSliderEvents() {
                var self = this;
                this._map.addListener('dragStart' + this._eventNamespace, function (sGisEvent) {
                    if (sGisEvent.browserEvent.target === self._slider) {
                        sGisEvent.draggingObject = self;
                        self._map.painter.prohibitUpdate();
                        sGisEvent.stopPropagation();
                    }
                });

                this._map.addListener('layerAdd layerRemove bboxChangeEnd', this._updateSliderPosition.bind(this));
            }
        }, {
            key: '_updateSliderPosition',
            value: function _updateSliderPosition() {
                this._slider.style.top = this._getSliderPosition() + 'px';
            }
        }, {
            key: '_moveSlider',
            value: function _moveSlider(delta) {
                var offset = parseInt(this._slider.style.top) - this._gridTop;
                offset -= delta;
                if (offset < 0) {
                    offset = 0;
                } else if (offset > this._gridHeight - this._sliderHeight) {
                    offset = this._gridHeight - this._sliderHeight;
                }

                this._slider.style.top = this._gridTop + offset + 'px';

                var height = this._gridHeight - this._sliderHeight;
                var maxResolution = this._map.maxResolution;
                var minResolution = this._map.minResolution;

                this._map.resolution = minResolution * Math.pow(2, offset * Math.log2(maxResolution / minResolution) / height);
            }
        }]);

        return ScaleSlider;
    }(EventHandler);

    utils.extend(ScaleSlider.prototype, defaults);

    Object.defineProperties(ScaleSlider.prototype, {
        map: {
            get: function get() {
                return this._map;
            }
        },

        gridCss: {
            get: function get() {
                return this._gridCss;
            },
            set: function set(css) {
                sGis.utils.validate(css, 'string');
                this._gridCss = css;
                this._grid.className = css;
            }
        },

        gridWidth: {
            get: function get() {
                return this._gridWidth;
            },
            set: function set(w) {
                sGis.utils.validate(w, 'number');
                this._gridWidth = w;

                this._grid.style.width = w + 'px';
            }
        },

        gridHeight: {
            get: function get() {
                return this._gridHeight;
            },
            set: function set(h) {
                sGis.utils.validate(h, 'number');
                this._gridHeight = h;

                this._grid.style.height = h + 'px';
            }
        },

        gridTop: {
            get: function get() {
                return this._gridTop;
            },
            set: function set(n) {
                sGis.utils.validate(n, 'number');
                this._gridTop = n;
                this._grid.style.top = n + 'px';
            }
        },

        gridLeft: {
            get: function get() {
                return this._gridLeft;
            },
            set: function set(n) {
                sGis.utils.validate(n, 'number');
                this._gridLeft = n;
                this._grid.style.left = n + 'px';
            }
        },

        sliderCss: {
            get: function get() {
                return this._sliderCss;
            },
            set: function set(css) {
                sGis.utils.validate(css, 'string');
                this._sliderCss = css;
                this._slider.className = css;
            }
        },

        sliderWidth: {
            get: function get() {
                return this._sliderWidth;
            },
            set: function set(w) {
                sGis.utils.validate(w, 'number');
                this._sliderWidth = w;

                this._slider.style.width = w + 'px';
                this._slider.style.left = this._getSliderLeft() + 'px';
            }
        },

        sliderHeight: {
            get: function get() {
                return this._sliderHeight;
            },
            set: function set(h) {
                sGis.utils.validate(h, 'number');
                this._sliderHeight = h;

                this._slider.style.height = h + 'px';
            }
        }
    });

    var defaultCss = '.sGis-decorations-scaleSlider-grid {' + 'border: 1px solid gray; ' + 'background-color: #CCCCCC; ' + 'border-radius: 5px;} ' + '.sGis-decorations-scaleSlider-slider {' + 'border: 1px solid gray;' + 'background-color: white;' + 'border-radius: 5px;' + 'cursor: pointer;}',
        styles = document.createElement('style');
    styles.type = 'text/css';
    if (styles.styleSheet) {
        styles.styleSheet.cssText = defaultCss;
    } else {
        styles.appendChild(document.createTextNode(defaultCss));
    }

    document.head.appendChild(styles);

    return ScaleSlider;
});
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

sGis.module('plugins.ZoomButtons', ['utils'], function (utils) {

    "use strict";

    var TOP_CLASS = 'sGis-top';
    var BOTTOM_CLASS = 'sGis-bottom';
    var LEFT_CLASS = 'sGis-left';
    var RIGHT_CLASS = 'sGis-right';

    var WRAPPER_CLASS = 'sGis-zoomButtons';
    var ZOOM_IN_CLASS = 'sGis-zoomButtons-zoomIn';
    var ZOOM_OUT_CLASS = 'sGis-zoomButtons-zoomOut';

    var ZoomButtons = function () {
        function ZoomButtons(map, painter, properties) {
            _classCallCheck(this, ZoomButtons);

            this._map = map;
            this._painter = painter;

            var wrapper = void 0;
            // TODO: providing wrapper directly is depricated
            if (painter instanceof HTMLElement) {
                wrapper = painter;
            } else {
                wrapper = painter.innerWrapper;
            }

            this._setDom();

            if (wrapper) this._addToWrapper(wrapper);
            if (properties) Object.assign(this, properties);

            if (painter.on) {
                painter.on('wrapperChange', this._changeWrapper.bind(this));
            }
        }

        _createClass(ZoomButtons, [{
            key: '_changeWrapper',
            value: function _changeWrapper() {
                if (this._container.parentNode) this._removeFromWrapper();
                if (this._painter.innerWrapper) this._addToWrapper(this._painter.innerWrapper);
            }
        }, {
            key: '_removeFromWrapper',
            value: function _removeFromWrapper() {
                this._container.parentNode.removeChild(this._container);
            }
        }, {
            key: '_setDom',
            value: function _setDom() {
                var container = utils.createNode('div', this.wrapperClass, {}, [utils.createNode('div', ZOOM_IN_CLASS, { onclick: this._zoomIn.bind(this) }), utils.createNode('div', ZOOM_OUT_CLASS, { onclick: this._zoomOut.bind(this) })]);

                this._container = container;
            }
        }, {
            key: '_addToWrapper',
            value: function _addToWrapper(wrapper) {
                wrapper.appendChild(this._container);
            }
        }, {
            key: '_zoomIn',
            value: function _zoomIn() {
                this._map.zoom(1);
            }
        }, {
            key: '_zoomOut',
            value: function _zoomOut() {
                this._map.zoom(-1);
            }
        }, {
            key: '_updateContainerClass',
            value: function _updateContainerClass() {
                this._container.className = this.wrapperClass;
            }
        }, {
            key: 'position',
            get: function get() {
                return this._position;
            },
            set: function set(position) {
                this._position = position;
                this._updateContainerClass();
            }
        }, {
            key: 'wrapperClass',
            get: function get() {
                var className = WRAPPER_CLASS;
                className += ' ' + (this._position.indexOf('right') >= 0 ? RIGHT_CLASS : LEFT_CLASS);
                className += ' ' + (this._position.indexOf('bottom') >= 0 ? BOTTOM_CLASS : TOP_CLASS);
                return className;
            }
        }]);

        return ZoomButtons;
    }();

    ZoomButtons.prototype._position = 'top left';

    return ZoomButtons;
});
sGis.module('sp.Api', [
    'utils',
    'sp.serializers.JsonSerializer'
], function(utils, JsonSerializer) {

    'use strict';

    class Api {
        constructor(connector, adminUrl) {
            this._connector = connector;
            this._url = connector.url + 'api/';
            this.adminUrl = adminUrl || connector.url + 'Admin/';

            this._frame = document.createElement('iframe');
            this._frame.style.display = 'none';
            this._frame.id = 'sGis-downloadFrame';
            document.body.appendChild(this._frame);
        }

        get url() { return this._url; }

        downloadBinary(id, name) {
            name = name || 'sp_binary_file';
            this.downloadFile(this._getOperationUrl('page/getBinary/' + name, {id: id}));
        }

        getServiceCatalog(properties) {
            return this._operation('serviceCatalog/list', {
                filter: properties.filter,
                jsfilter: properties.jsfilter,
                serviceTypes: properties.serviceTypes,
                owners: properties.owners,
                startFrom: properties.startFrom,
                take: properties.take
            });
        }

        getEfsFileUrl(path) {
            return this._getOperationUrl('efs/file', {path: path});
        }

        /**
         *
         * @param {Object} options
         * @param {String} options.path
         * @param {String} options.type - possible values: Json, Text
         * @param {Function} [options.success]
         * @param {Function} [options.error]
         */
        getEfsFile(options) {
            this._operation('efs/file', {path: options.path, media_type: options.type, success: options.success, error: options.error});
        }

        getJsonFile(options) {
            this.getEfsFile({path: options.path, type: 'Json', success: successHandler, error: options.error});

            function successHandler(response) {
                try {
                    var data = JSON.parse(response);
                    if (options.success) options.success(data);
                } catch (e) {
                    if (options.error) options.error(e);
                }
            }
        }

        getTextFile(options) {
            this.getEfsFile({path: options.path, type: 'Text', success: options.success, error: options.error});
        }

        getEfsObjects(options) {
            this._operation('efs/objects', {path: options.path, success: successHandler, error: options.error});

            function successHandler(response) {
                try {
                    var data = sGis.utils.parseJSON(response);
                } catch (e) {
                    if (options.error) options.error('Server responded with: ' + response);
                }

                if (data.Success === true) {
                    if (options.success) options.success(data.Items);
                } else if (data.Error) {
                    if (options.error) options.error(data);
                }
            }
        }

        getEfsFiles(options) {
            var pathList = {Items: options.paths};
            var string = JSON.stringify(pathList);

            this._operation('efs/files', {success: successHandler, error: options.error}, string);

            function successHandler(response) {
                try {
                    var data = sGis.utils.parseJSON(response);
                } catch (e) {
                    if (options.error) options.error('Server responded with: ' + response);
                }

                if (data.Error) {
                    if (options.error) options.error(data);
                } else {
                    if (options.success) options.success(data);
                }
            }
        }

        getUserSettings(options) {
            this._operation('workspace/settings/load', {
                success:function(data) {
                    if (options.success) {
                        try {
                            var settings = JSON.parse(data);
                            options.success(settings);
                        } catch (e) {
                            if (options.error) options.error('Failed to load user settings, unexpected response from server: ' + data);
                        }
                    }
                }
            });
        }

        saveUserSettings(settings, options) {
            var data = JSON.stringify(settings);
            this._operation('workspace/settings/save', options, data);
        }

        downloadFile(url) {
            this._frame.src = url;
        }
        
        operation(name, parameters, data) {
            return this._operation(name, parameters, data);
        }

        _operation(name, parameters, data, admin) {
            return sGis.utils.ajaxp({
                        url: this._getOperationUrl(name, parameters, admin),
                        type: data ? 'POST' : 'GET',
                        data: data,
                        contentType: admin ? 'application/json' : ''
                    }).then(([response]) => {
                        try {
                            var data = sGis.utils.parseJSON(response);
                        } catch (e) {
                            throw Error('cannot parse response')
                        }

                        if (data.Success === false) throw Error(data.Message);
                        if (data.Error) throw Error(JSON.stringify(data.Error));
                        return data;
                    });
        }

        _getOperationUrl(name, parameters, admin) {
            var textParam = '';
            var keys = Object.keys(parameters);
            for (var i = 0; i < keys.length; i++) {
                if (keys[i] === 'success' || keys[i] === 'error' || parameters[keys[i]] === undefined) continue;
                textParam += '&' + keys[i] + '=';

                if (parameters[keys[i]] instanceof Object) {
                    textParam += encodeURIComponent(JSON.stringify(parameters[keys[i]]));
                } else {
                    textParam += encodeURIComponent(parameters[keys[i]]);
                }
            }

            textParam = textParam.substr(1);

            if (this._connector.sessionId) {
                if (textParam.length > 0) textParam += '&';
                textParam += '_sb=' + this._connector.sessionId;
            }

            return (admin ? this.adminUrl : this._url) + name + '?' + textParam;
        }

        setDataFilter(serviceName, filterDescription) {
            return this._operation('storage/meta/set', {
                type: 'dataFilter',
                serviceName: serviceName
            }, filterDescription);
        }

        symbolize(options) {
            this._operation('storage/meta/set', {
                storageId: options.storageId,
                type: options.type,
                success: successHandler,
                error: options.error
            }, options.data);

            function successHandler(response) {
                try {
                    var data = sGis.utils.parseJSON(response);
                } catch (e) {
                    if (options.error) options.error('Server responded with: ' + response);
                }

                if (data.Error) {
                    if (options.error) options.error(data);
                } else {
                    if (options.success) options.success(data);
                }
            }
        }

        getJsonLog(options) {
            this._operation('logger/json', {
                logLevel: 3,
                success: successHandler,
                error: options.error
            }, options.data);

            function successHandler(response) {
                try {
                    var data = sGis.utils.parseJSON(response);
                } catch (e) {
                    if (options.error) options.error('Server responded with: ' + response);
                }

                if (data.Error) {
                    if (options.error) options.error(data);
                } else {
                    if (options.success) options.success(data);
                }
            }
        }

        setStorageLabels(storageId, description) {
            this.setStorageMeta('labeling', storageId, description);
        }

        setStorageMeta(type, storageId, description) {
            this._operation('storage/meta/set', {storageId: storageId, type: type}, JSON.stringify(description));
        }

        _publishService(type, params) {
            if (!params.Name) throw new Error("Name is not set");
            if (params.Name.length > 63) throw new Error("Name is not long. It cannot be longer then 63 symbols.");

            return this._operation('admin/Services/Create', {serviceType: type}, JSON.stringify(params));
        }

        publishDataView({name, alias, description, filter, isShared, preview, dataSourceName, attributeDefinition}) {
            return this._publishService('DataView', {
                Name: name,
                Alias: alias,
                Description: description,
                IsShared: isShared,
                Preview: preview,
                Filter: filter,
                DataSourceName: dataSourceName,
                AttributesDefinition: attributeDefinition
            });
        }

        publishDataSource({name, alias, description, preview, isShared, srid, geometryType, attributeDefinition}) {
            return this._publishService('DataSourceService', {
                Name: name,
                Alias: alias,
                Description: description,
                IsShared: isShared,
                Preview: preview,
                AttributesDefinition: attributeDefinition,
                Srid: srid,
                GeometryType: geometryType
            });
        }

        publishServiceGroup({name, alias, description, isShared, children, preview}) {
            return this._publishService('LayerGroup', {
                Name: name,
                Alias: alias,
                Description: description,
                IsShared: isShared,
                Preview: preview,
                Children: children
            });
        }

        publishLayer({name, alias, description, isShared, preview, attributeDefinition, srid, geometryType}) {
            let dataSourceName = `${name}_source`;
            if (dataSourceName.length > 63) dataSourceName = dataSourceName.substr(dataSourceName.length - 62);

            return this.publishDataSource({name: dataSourceName, isShared, srid, geometryType, attributeDefinition})
                .then((response) => {
                    if (!response || !response.Success) throw new Error("Failed to publish service " + name);
                    return this.publishDataView({name, alias, description, isShared, preview, dataSourceName, attributeDefinition});
                });
        }

        deleteService(description) {
            return this._operation('admin/Services/Delete', { success: description.success, error: description.error, serviceName: description.serviceName }, JSON.stringify([description.serviceName]));
        }

        deleteServices(description) {
            return this._operation('admin/Services/Delete', {}, JSON.stringify(description.names));
        }

        /**
         * @param {Object} options
         * @param {String} options.serviceName - name of the service to update
         * @param {String} [options.description] - new description of the service
         * @param {String} [options.alias] - new alias of the service
         * @param {Boolean} [options.isShared]
         * @param {Object} [options.attributesDefinition]
         * @returns {*}
         */
        changeDataSourceConfiguration(options) {
            var props = {
                Description: options.description,
                Alias: options.alias,
                IsShared: options.isShared,
                AttributesDefinition: options.attributesDefinition
            };

            return this._operation('admin/Services/Update', { name: options.serviceName }, JSON.stringify(props));
        }

        /**
         * @param {Object} options
         * @param {String} options.serviceName - name of the service to update
         * @param {String} [options.description] - new description of the service
         * @param {String} [options.alias] - new alias of the service
         * @param {Boolean} [options.isShared]
         * @param {Object} [options.filter]
         * @param {String} [options.preview]
         * @param {String} [options.dataSourceServiceName]
         * @param {String} [options.attributesDefinition]
         * @returns {*}
         */
        changeDataViewConfiguration(options) {
            var props = {
                Description: options.description,
                Alias: options.alias,
                IsShared: options.isShared,
                Filter: options.filter,
                Preview: options.preview,
                DataSourceServiceName: options.dataSourceServiceName,
                AttributesDefinition: options.attributesDefinition
            };

            return this._operation('admin/Services/Update', { name: options.serviceName }, JSON.stringify(props));
        }

        changeServiceGroupConfiguration({name, alias, description, isShared, children, preview}) {
            return this._operation('admin/Services/Update', { name: name }, JSON.stringify({
                Alias: alias,
                Description: description,
                IsShared: isShared,
                Preview: preview,
                Children: children
            }));
        }

        getObjects({serviceName, startIndex, count, getAttributes, getGeometry, srid, condition, orderBy}) {
            const params = {
                serviceName,
                startIndex,
                count,
                getAttributes,
                getGeometry,
                srid,
                condition,
                orderBy
            };

            return this._operation('data/get', params);
        }

        pickByGeometry({ services, geometry, resolution}) {
            return this._operation('data/pickByGeometry', { services, geom: JSON.stringify(JsonSerializer.serializeGeometry(geometry)), res: resolution}).then(response => {
                return response.map(x => JsonSerializer.deserializeFeature(x, geometry.crs));
            });
        }

        getFunctionList({ targetServiceName }) {
            return this._operation('functions/list', { targetServiceName });
        }

        validateExpression({ targetServiceName, expression, resultType }) {
            return this._operation('functions/validateExpression', { targetServiceName, expression, resultType });
        }

        getServiceDependencies ({name}) {
            return this._operation('serviceCatalog/dependencies', {name})
        }

        /**
         * Given an address returns coordinates of points that correspond to that address.
         * @param {String} query
         * @param {String[]} providers
         * @param {sGis.Crs} [crs=sGis.CRS.wgs84]
         * @returns {Promise.<AddressSearchResult[]>}
         */
        geocode(query, providers, crs = sGis.CRS.wgs84) {
            let requestCRS = crs === sGis.CRS.geo ? sGis.CRS.wgs84 : crs;

            let sr = requestCRS.toString();
            return this._operation('geocode', {sr, providers: JSON.stringify(providers), query }).then((response) => {
                if (!Array.isArray(response)) throw new Exception('Search failed');

                return response.map(item => {
                    if (crs === sGis.CRS.geo) {
                        let position = [item.Geometry[1], item.Geometry[0]];
                        return { address: item.Address, source: item.Source, score: item.Score, position: position, point: new sGis.Point(position, crs)};
                    } else {
                        return { address: item.Address, source: item.Source, score: item.Score, position: item.Geometry, point: new sGis.Point(item.Geometry, crs)};
                    }
                });
            });
        }
    }

    return Api;

});

/**
 * @typedef AddressSearchResult
 * @type Object
 * @prop {String} address
 * @prop {String} source
 * @prop {Number} score
 * @prop {Position} position
 * @prop {sGis.Point} point
 */

sGis.module('sp.ClusteringService', [
    'utils',
    'FeatureLayer',
    'feature.Point',
    'Map'
], function(utils, FeatureLayer, Point, Map) {
    'use strict';

    /* DEPRECATED - WILL NOT WORK BECAUSE OF MAP BBOX */

    var ClusteringService = function(serverConnector, name, options) {
        this._serverConnector = serverConnector;
        this._url = serverConnector.url + name + '/';
        this._id = sGis.utils.getGuid();

        sGis.utils.init(this, options);
    };

    ClusteringService.prototype = {
        _map: null,
        _layer: null,
        _storageId: null,
        _click: null,
        _minSize: 6,
        _maxSize: 31,

        getClusters: function(options) {
            // options: {storageId, bbox, resolution, [success, requested, error]}
            var bbox = options.bbox,
                bboxString = [bbox.p[0].x, bbox.p[0].y, bbox.p[1].x, bbox.p[1].y].join(','),
                sizeString = Math.round(bbox.width / options.resolution) + ',' + Math.round(bbox.height / options.resolution);

            sGis.utils.ajax({
                url: this._url + options.storageId + '/?bbox=' + encodeURIComponent(bboxString) + '&size=' + encodeURIComponent(sizeString) + this._serverConnector.sessionSuffix,
                cache: false,
                success: function(response) {
                    var clusters = sGis.utils.parseJSON(response);
                    if (options.success) options.success(clusters);
                },
                requested: options.requested,
                error: options.error
            });
        },

        updateClusters: function() {
            if (this._layer && this._map && this._storageId) {
                var self = this;
                this.getClusters({
                    storageId: this._storageId,
                    bbox: this._map.bbox,
                    resolution: this._map.resolution,
                    success: function(clusters) {
                        self._layer.features = [];

                        var maxSize = 15;
                        clusters.forEach(function(cluster) {
                            maxSize = Math.max(cluster.Items.length, maxSize);
                        });

                        clusters.forEach(function(cluster) {
                            var size = self._minSize + Math.round((self._maxSize - self._minSize) * (cluster.Items.length / maxSize));
                            var point = new sGis.feature.Point([cluster.X, cluster.Y], { crs: self._map.crs, size: size, color: 'red' });
                            point.items = cluster.Items;
                            if (self._click) point.addListener('click', self._click);
                            self._layer.add(point);
                        });

                        self._layer.redraw();
                    }
                });
            }
        }
    };

    Object.defineProperties(ClusteringService.prototype, {
        map: {
            get: function() {
                return this._map;
            },
            set: function(map) {
                if (!(map instanceof sGis.Map)) sGis.utils.error('sGis.Map instance is expected but got ' + map + ' instead');

                if (this._map) {
                    this._map.removeListener('.sGis-clusteringService-' + this._id);
                    if (this._layer) this._map.removeLayer(this._layer);
                }

                if (this._layer && map.indexOf(this._layer === -1)) map.addLayer(this._layer);

                var self = this;
                map.addListener('bboxChangeEnd.sGis-clusteringService-' + this._id, function() {
                    self.updateClusters();
                });
                this._map = map;
            }
        },

        layer: {
            get: function() {
                return this._layer;
            },
            set: function(layer) {
                if (!(layer instanceof sGis.FeatureLayer)) sGis.utils.error('sGis.FeatureLayer instance is expected but got ' + layer + ' instead');

                if (this._map) {
                    if (this._layer) {
                        this._map.removeLayer(this._layer);
                    }
                    if (this._map.indexOf(layer) === -1) {
                        this._map.addLayer(layer);
                    }
                }

                this._layer = layer;
                this.updateClusters();
            }
        },

        storageId: {
            get: function() {
                return this._storageId;
            },
            set: function(id) {
                if (!sGis.utils.isString(id)) sGis.utils.error('String is expected but got ' + id + ' instead');

                this._storageId = id;
                this.updateClusters();
            }
        },

        click: {
            get: function() {
                return this._click;
            },
            set: function(handler) {
                if (!(handler instanceof Function)) sGis.utils.error('Function is expected but got ' + handler + ' instead');
                this._click = handler;
            }
        }
    });

    return ClusteringService;
    
});

sGis.module('sp.ClusterLayer', [
    'Point',
    'feature.Point',
    'feature.Polygon',
    'sp.ClusterSymbol',
    'Layer',
    'utils'
], function(Point, PointF, Polygon, ClusterSymbol, /** {sGis.Layer} */ Layer, /** {sGis.utils} */ utils) {

    var defaults = {
        sessionId: null,
        clusterSize: 100,
        algorithm: 'grid',
        delayedUpdate: true,
        aggregationParameters: []
    };

    /**
     * @class sGis.sp.ClusterLayer
     * @extends sGis.Layer
     */
    class ClusterLayer extends Layer {
        constructor(serviceUrl, sessionId, symbol = new ClusterSymbol()) {
            super();

            this._serviceUrl = serviceUrl;
            this.sessionId = sessionId;
            this._features = [];
            this._symbol = symbol;
        }

        getFeatures(bbox, resolution) {
            if (!this.checkVisibility(resolution)) return [];

            this._update(bbox, resolution);

            var features = [];
            this._features.forEach((feature) => {
                if (!feature.crs.projectionTo(bbox.crs)) return;

                var featureBbox = feature.bbox;
                if (!featureBbox || !bbox.intersects(featureBbox)) return;

                features.push(feature);
            });

            return features;
        }

        _update(bbox, resolution) {
            if (this._currentBbox && bbox.equals(this._currentBbox)) return;

            this.updateProhibited = true;
            if (this._xhr) {
                this._updateRequest = [bbox, resolution];
                return;
            }

            var url = this._getUrl(bbox, resolution);
            this._xhr = utils.ajax({
                url: url,
                type: 'GET',
                success: (response) => {
                    try {
                        var clusters = JSON.parse(response);
                        this._setFeatures(clusters, bbox.crs);
                        this._currentBbox = bbox;
                    } catch(e) {
                        this._xhr = null;
                        return;
                    }

                    this.updateProhibited = false;

                    if (this._updateRequest) {
                        this._update(this._updateRequest[0], this._updateRequest[1]);
                    }

                    this._xhr = null;
                },
                error: () => {
                    this._xhr = null;
                }
            });

            this._updateRequest = null;
        }

        _getUrl(bbox, resolution) {
            return this._serviceUrl + 'clusters?' +
                    'resolution=' + resolution +
                    '&clusterSize=' + this.clusterSize +
                    '&bbox=' + bbox.coordinates.join('%2C') +
                    '&algorithm=' + this.algorithm +
                    '&aggregationParameters=' + encodeURIComponent(JSON.stringify(this.aggregationParameters)) +
                    (this.sessionId ? '&_sb=' + this.sessionId : '');
        }

        _setFeatures(clusters, crs) {
            var features = [];
            clusters.forEach((cluster) => {
                features.push(new PointF(cluster.Center, {
                    crs: crs,
                    symbol: this._symbol,
                    objectCount: cluster.ObjectCount,
                    aggregations: cluster.Aggregations,
                    setNo: cluster.SetNo,
                    ids: cluster.Ids,
                    boundingPolygon: new Polygon(cluster.BoundingGeometry, {crs: crs} )}
                    )
                );
            });

            this._features = features;
            this.fire('propertyChange', { property: 'features' });
        }

        get symbol() { return this._symbol; }
        set symbol(symbol) {
            this._symbol = symbol;
            this._features.forEach((feature) => { feature.symbol = symbol; });
        }

        redraw() {
           delete this._currentBbox;
           this.fire('propertyChange');
        }
    }

    utils.extend(ClusterLayer.prototype, defaults);

    return ClusterLayer;
});

sGis.module('sp.ClusterSymbol', [
    'utils',
    'Symbol',
    'symbol.point.Point',
    'render.Arc',
    'render.VectorLabel',
    'serializer.symbolSerializer'
], function(utils, Symbol, PointSymbol, Arc, VectorLabel, symbolSerializer) {

    class ClusterSymbol extends PointSymbol {
        renderFunction(feature, resolution, crs) {
            if (this.singleObjectSymbol && feature.objectCount === 1) return this.singleObjectSymbol.renderFunction(feature, resolution, crs);

            let renders = super.renderFunction.call(this, feature, resolution, crs);
            this._applySizeClassifier(renders[0], feature);

            if (this.pieAggregationIndex >= 0) {
                let pieChart = this._applyChartClassifier(feature, renders[0].center, renders[0].radius);
                if (pieChart && pieChart.length > 0) {
                    renders[0].radius -= this.clusterSize;
                    renders = pieChart.concat(renders);
                }
            }

            if (this.labelText) renders.push(this._renderLabel(renders[0].center, feature));

            return renders;
        }

        _renderLabel(position, feature) {
            let text = this.labelText.replace('{__qty}', feature.objectCount || '');
            return new VectorLabel(position, text, {});
        }

        _applySizeClassifier(circleRender, feature) {
            if (feature.objectCount === undefined || !this.minSize || !this.maxSize || !this.sizeAggregationMaxValue) return;

            let minSize = this.minSize;
            let maxSize = this.maxSize;
            let maxCount = this.sizeAggregationMaxValue;
            let value = this.sizeAggregationIndex <= 0 ? feature.objectCount : feature.aggregations[this.sizeAggregationIndex].value;
            let size = Math.min(this.maxSize, (minSize + value / maxCount * (maxSize - minSize)));
            circleRender.radius = size / 2;
        }

        _applyChartClassifier(feature, center, radius) {
            if (!feature.aggregations || !feature.aggregations[this.pieAggregationIndex]) return;
            let aggr = feature.aggregations[this.pieAggregationIndex];
            if (!aggr) return;

            let totalCount = aggr.reduce((sum, item) => sum + item.count, 0);
            if (!totalCount) return;

            let startAngle = -Math.PI / 2;
            let pies = aggr.filter(x => x.count > 0).map(x => {
                let angle = x.count / totalCount * Math.PI * 2;
                let fillColor = this._pieGroups[x.value] || this.fillColor;

                let arc = new Arc(center, {
                    fillColor: fillColor,
                    strokeColor: this.strokeColor,
                    strokeWidth: this.strokeWidth,
                    radius: radius,
                    startAngle: startAngle,
                    endAngle: startAngle + angle,
                    isSector: true
                });

                startAngle += angle;
                return arc;
            });

            return pies;
        }

        resetClassification() {
            this.sizeAggregationIndex = -1;
            this.sizeAggregationMaxValue = 1;
            this.pieAggregationIndex = -1;
            this._pieGroups = {};
        }

        addPieGroup(attributeValue, color) {
            this._pieGroups[attributeValue] = color;
        }

        clone() {
            return new ClusterSymbol(this.serialize());
        }

        serialize() {
            return {
                size: this.size,
                fillColor: this.fillColor,
                strokeColor: this.strokeColor,
                strokeWidth: this.strokeWidth,
                clusterSize: this.clusterSize,
                minSize: this.minSize,
                maxSize: this.maxSize,
                sizeAggregationIndex: this.sizeAggregationIndex,
                sizeAggregationMaxValue: this.sizeAggregationMaxValue,
                pieAggregationIndex: this.pieAggregationIndex,
                _pieGroups: this._pieGroups,
                labelText: this.labelText,
                singleObjectSymbol: this.singleObjectSymbol && (this.singleObjectSymbol.serialize && this.singleObjectSymbol.serialize() || symbolSerializer.serialize(this.singleObjectSymbol)),
                gridSize: this.gridSize
            };
        }

        get singleObjectSymbol() { return this._singleObjectSymbol; }
        set singleObjectSymbol(symbol) {
            if (!symbol || symbol instanceof Symbol) {
                this._singleObjectSymbol = symbol;
            } else {
                this._singleObjectSymbol = symbolSerializer.deserialize(symbol);
            }
        }
    }

    Object.assign(ClusterSymbol.prototype, {
        size: 50,

        fillColor: 'rgba(0, 183, 255, 1)',
        strokeColor: 'white',
        strokeWidth: 2,

        clusterSize: 10,

        minSize: 50,
        maxSize: 50,
        sizeAggregationIndex: -1,
        sizeAggregationMaxValue: 0,

        pieAggregationIndex: -1,
        _pieGroups: {},

        labelText: null,
        _singleObjectSymbol: null,
        gridSize: 100
    });

    return ClusterSymbol;

});

sGis.module('sp.Connector', [
    'utils',
    'EventHandler',
    'sp.Api',
    'sp.serializers.xmlSerializer'
], function(utils, EventHandler, Api, xmlSerializer) {
    'use strict';

    class Connector extends EventHandler {
        constructor (url, authServiceUrl, { login, password, sessionId }) {
            super();

            this._url = url;
            this.apiLoginUrl = authServiceUrl;

            this._notificationListners = {};
            this._objectSelectorListeners = [];
            this._operationList = {};
            // this._rootMapItem = rootMapItem;
            this._failedNotificationRequests = 0;

            this.initializeSession({ login, password, sessionId });
            
            this.api = new Api(this);
        }
    }

    let ext = {
        apiLoginUrl: '%sp%Strategis.JsClient/ApiLogin.aspx',

        addNotificationListner: function(tag, string, callback) {
            if (!this._notificationListners[tag]) this._notificationListners[tag] = {};
            this._notificationListners[tag][string] = callback;
        },

        removeNotificationListner: function(tag, string) {
            if (this._notificationListners[tag] && this._notificationListners[tag][string]) delete this._notificationListners[string];
        },

        addObjectSelectorListener: function(f) {
            this._objectSelectorListeners.push(f);
        },

        removeObjectSelectorListener: function(f) {
            var index = ths._objectSelectorListeners.indexOf(f);
            if (index !== -1) this._objectSelectorListeners.splice(index, 1);
        },

        initializeSession: function({ login, password, sessionId }) {
            this.initializationPromise = new Promise((resolve, reject) => {
                var self = this;
                if (login && password) {
                    var spUrl = this._url.substr(-4, 4) === 'IIS/' ? this._url.substr(0, this._url.length - 4) : this._url,
                        url = this.apiLoginUrl.replace(/%sp%/, spUrl) + '?userName=' + login + '&password=' + encodeURIComponent(password) + '&ts=' + new Date().getTime();
                    sGis.utils.ajax({
                        url: url,
                        success: function (data, textStatus) {
                            if (data === '') {
                                sGis.utils.message('Could not get session ID');
                            } else {
                                var response = JSON.parse(data);

                                if (response.Success && response.Message) {
                                    initialize(response.Message);

                                    self.fire('sessionInitialized');
                                } else {
                                    reject('Could not get session. Server responded with: ' + data);
                                    sGis.utils.error('Could not get session. Server responded with: ' + data);
                                }
                            }
                        },

                        error: function () {
                            sGis.utils.message('Could not get session ID');
                            reject('Could not get session ID');
                        }
                    });
                } else {
                    initialize(sessionId);
                }

                function initialize(id) {
                    self._sessionId = encodeURIComponent(id);

                    if (id) self.requestNotifications();

                    escapePrintMethod(self);
                    resolve(id);
                }
            });
        },

        requestNotifications: function() {
            this._aborted = false;
            var self = this,
                xhr = sGis.utils.ajax({
                    url: self._url + 'ClientNotification/?f=json&_sb=' + self._sessionId + '&ts=' + new Date().getTime(),
                    success: function(stringData, textStatus) {
                        try {
                            var data = JSON.parse(stringData);
                        } catch (e) {
                            self.connectionLostError();
                            return;
                        }
                        if (data && data.Notifications) {
                            for (var i in data.Notifications) {
                                if (notificationProcessors[data.Notifications[i].tag]) {
                                    notificationProcessors[data.Notifications[i].tag](self, data.Notifications[i].data, data.Notifications[i].type);
                                } else {
                                    sGis.utils.message(data.Notifications[i].tag);
                                }
                            }
                            // if (self._synchronized !== false) {
                                self.requestNotifications();
                            // } else {
                            //     self.addListener('synchronize.self', function() {self.removeListener('.self'); self.requestNotifications();});
                            // }

                            self._failedNotificationRequests = 0;
                        } else {
                            self.connectionLostError();
                        }
                    },
                    error: function(stringData, textStatus) {
                        if (self._aborted) return;
                        self._failedNotificationRequests += 1;
                        if (self._failedNotificationRequests > 5) {
                            self.connectionLostError();
                        } else {
                            setTimeout(self.requestNotifications.bind(self), self._failedNotificationRequests * 1000);
                        }
                    }
                });
            this._notificationRequestObject = xhr;
        },

        connectionLostError: function(){
            this.fire('connectionLost');
            sGis.utils.error('The connection to the server is lost');
        },

        cancelNotificationRequest: function() {
            this._aborted = true;
            if (this._notificationRequestObject) this._notificationRequestObject.abort();
        },

        registerOperation: function(operationId, callback, progressCallback) {
            if (this._latestOperationNotification && (this._latestOperationNotification.operation.id === operationId)) {
                callback(this._latestOperationNotification);
                this._latestOperationNotification = null;
            } else {
                this._operationList[operationId] = { finalCallback: callback, progressCallback: progressCallback };
            }
        }
    };

    Object.defineProperties(Connector.prototype, {
        sid: {
            get: function() {
                return decodeURIComponent(this.sessionId);
            }
        },

        sessionId: {
            get: function() {
                return this._sessionId;
            }
        },

        sessionSuffix: {
            get: function() {
                return this._sessionId ? '&_sb=' + this._sessionId : '';
            }
        },

        url: {
            get: function() {
                return this._url;
            }
        },

        synchronized: {
            get: function() {
                return true;
            }
        },

        login: {
            get: function() {
                return this._login;
            }
        }
    });

    utils.extend(Connector.prototype, ext);

    let notificationProcessors = {
        'dynamic layer': function(connector, data, type) {
            if (connector._notificationListners['dynamic layer'] && connector._notificationListners['dynamic layer'][data]) {
                connector._notificationListners['dynamic layer'][data]();
            }
        },

        'DAS': function(connector, data, type) {
            var response = xmlSerializer.deserialize(data);
            if (connector._operationList[response.operation.id]) {
                if ( response.operation.status === 'Running') {
                    if (connector._operationList[response.operation.id].progressCallback) connector._operationList[response.operation.id].progressCallback(response);
                } else {
                    connector._operationList[response.operation.id].finalCallback(response);
                    delete connector._operationList[response.operation.id];
                }
            } else {
                connector._latestOperationNotification = response;
            }
        },

        'trolling': function(connector, data, type) {
            for (var i = 0; i < connector._objectSelectorListeners.length; i++) {
                connector._objectSelectorListeners[i](data);
            }
        },

        'symbols': function(connector, data, type) {
            if (connector._notificationListners['symbols'] && connector._notificationListners['symbols'][data]) {
                connector._notificationListners['symbols'][data]();
            }
        }
    };

    function escapePrintMethod(connector) {
        var print = window.print;
        window.print = function() {
            connector.cancelNotificationRequest();
            print();
            connector.requestNotifications();
        };
    }

    return Connector;
    
});

sGis.module('sp.ControllerManager', [
    'utils',
    'LayerGroup',
    'sp.controllers.ViewableController'
], (utils, LayerGroup, ViewableController) => {
    
    let registry = {};
    
    class ControllerManager {
        constructor(connector, map) {
            this._controllers = {};
            this._connector = connector;
            this._map = map;

            this._layerGroup = new LayerGroup();
            this._map.addLayer(this._layerGroup);
        }
        
        static registerController(name, constructor) {
            if (registry[name]) utils.error('Conflicting controller registration: ' + name);
            registry[name] = constructor;
        }
        
        getController(name) {
            if (!this._controllers[name]) this._controllers[name] = this.createController(name);
            return this._controllers[name];
        }
        
        createController(name) {
            if (!registry[name]) utils.error('Unknown controller: ' + name);
            let controller = new registry[name](this._connector, {map: this._map});

            if (controller instanceof ViewableController) {
                controller.updateView().then(() => {
                    this._layerGroup.addLayer(controller.service.layer);
                });
            }

            return controller;
        }
    }
    
    return ControllerManager;
    
});
sGis.module('sp.DataFilter', [
    'serializer.symbolSerializer',
    'sp.Labeling',
    'sp.ClusterSymbol',
    'utils'
], (serializer, LabelingConst, ClusterSymbol, utils) => {

    'use strict';

    class DataFilter {
        constructor(options = {}) {
            Object.assign(this, options);
        }

        static deserialize({ Title, Symbol, Condition, Labeling, MaxResolution, MinResolution, ChildFilters, SerializationData}) {
            let serializationData = {};
            try {
                serializationData = utils.parseJSON(SerializationData) || {};
            } catch (e) {}

            let result = new DataFilter({
                condition: Condition,
                minResolution: MinResolution,
                maxResolution: MaxResolution,
                symbol: Symbol && serializer.deserialize(Symbol, 'hex8'),
                labeling: Labeling && new LabelingConst(Labeling) || new LabelingConst(),
                title: Title,
                childFilters: ChildFilters && ChildFilters.map(x => DataFilter.deserialize(x)) || [],
                serializationData: serializationData.serializationData || {}
            });

            if (serializationData.clusterSymbol) {
                result.symbol = new ClusterSymbol(serializationData.clusterSymbol);
                result.labeling = serializationData.clusterLabel;
                result.aggregations = serializationData.aggregations;
            }

            return result;
        }

        serialize() {
            let serialized = {
                Title: this.title,
                Symbol: null,
                Condition: this.condition,
                Labeling: null,
                MaxResolution: this.maxResolution,
                MinResolution: this.minResolution,
                ChildFilters: null,
                SerializationData: { serializationData: this.serializationData }
            };

            if (this.symbol instanceof ClusterSymbol) {
                serialized.SerializationData.clusterSymbol = this.symbol.serialize();
                serialized.SerializationData.clusterLabel = this.labeling && this.labeling.serialize();
                serialized.SerializationData.aggregations = this.aggregations;
            } else {
                serialized.Symbol = this.symbol && serializer.serialize(this.symbol, 'hex');
                serialized.Labeling = this.labeling && this.labeling.serialize();
            }

            serialized.ChildFilters = this._serializeChildren();

            serialized.SerializationData = JSON.stringify(serialized.SerializationData);

            return serialized;
        }

        _serializeChildren() {
            if (!this.childFilters) return null;
            return this.childFilters.map(child => child.serialize());
        }

        clone() {
            return new DataFilter({
                title: this.title,
                condition: this.condition,
                minResolution: this.minResolution,
                maxResolution: this.maxResolution,
                symbol: this.symbol && this.symbol.clone(),
                labeling: this.labeling && this.labeling.clone() || new LabelingConst(),
                childFilters: this.childFilters.map(x => x.clone()),

                aggregations: this.aggregations && this.aggregations.slice(),

                serializationData: {}
            });
        }
    }

    Object.assign(DataFilter.prototype, {
        condition: null,
        minResolution: -1,
        maxResolution: -1,
        symbol: null,
        labeling: null,
        childFilters: [],
        title: null,

        aggregations: null,

        serializationData: null
    });

    return DataFilter;

});

sGis.module('sp.Labeling', ['utils'], (utils) => {

    class Labeling {
        constructor(options = {}) {
            Object.assign(this, options);
            if (options.fieldFormat) this.isActive = true;
            if (options.offset && utils.isString(options.offset)) {
                let arr = options.offset.split(' ');
                if (arr.length === 2) this.offset = arr;
            }
        }

        clone() {
            let copy = new Labeling();
            Object.keys(defaultLabeling).forEach(key => {
                copy[key] = this[key];
                if (key === 'border') copy[key] = {
                    Brush: this.border.Brush,
                    Thickness: this.border.Thickness
                };
            });
            return copy;
        }

        serialize() {
            if (!this.isActive) return null;

            let result = {};
            Object.keys(defaultLabeling).forEach(key => {
                result[key] = this[key];
                if (key === 'border') result[key] = {
                    Brush: this.border.Brush,
                    Thickness: this.border.Thickness
                };
            });

            return result;
        }
    }

    let defaultLabeling = {
        fieldFormat: 'Текст подписи',
        attributes: [],
        fontName: 'Arial',
        fontSize: 10,
        fontStyle: null,
        fontWeight: 300,
        fontColor: '#ff000000',
        background: '#ffffffff',
        border: {
            Brush: '#ffffffff',
            Thickness: 1
        },
        borderRadius: 0,
        showBox: true,
        boxMaxWidth: 128,
        boxMargin: 3,
        horizontalAlignment: 'Center',
        verticalAlignment: 'Bottom',
        offset: [3,3],
        offsetFromSymbol: true,
        isActive: false,
        isBoxDisplayed: true
    };

    Object.assign(Labeling.prototype, defaultLabeling);

    return Labeling;
});
sGis.module('sp.DataOperation', [
    'sp.utils',
    'EventHandler'
], (utils, EventHandler) => {

    'use strict';

    class DataOperation {
        constructor(connector, controller, operationName, properties) {
            this._connector = connector;
            this._promise = new Promise((resolve, reject) => {
                controller.initializationPromise.then(() => {
                    let url  = `${connector.url}${controller.name}/${operationName}`;
                    let params = Object.assign({'_sb': connector.sid}, properties);
                    let paramsStrings = Object.keys(params).filter(key => params[key] !== null && params[key] !== undefined).map(key => {
                        let value = params[key] instanceof Object ? JSON.stringify(params[key]) : params[key];
                        if (typeof value === 'string') value = encodeURIComponent(value);
                        return `${key}=${value}`;
                    });

                    this.resolve = resolve;
                    this.reject = reject;

                    utils.ajaxp({
                        url,
                        type: 'POST',
                        data: paramsStrings.join('&')
                    }).then(data => {
                        let response = parseOperationResponse(data[0]);
                        if (!response || response.status !== 'success') reject(`Unexpected response from server for ${this._controller.name}/${this._operationName} operation`);
                        this.id = response.operationId;
                        connector.registerOperation(response.operationId, this._finalHandler.bind(this), this._progressHandler.bind(this));
                        this.fire('requested');
                    }).catch(response => {
                        reject(response);
                    });
                }).catch(() => {
                    reject(`Controller ${controller.type} failed to initialize. Operation ${operationName} is cancelled.`);
                });
            });

            this._controller = controller;
            this._operationName = operationName;
        }

        then(func) {
            return this._promise.then(func);
        }

        catch() {
            return this._promise.catch(func);
        }

        /**
         * This inserts middleware resolve processing function and returns the operation object itself. It is used to
         * preprocess the operation result before returning it to the caller function.
         * @important It does not create a new DataOperation instance, but returns self instead;
         * @param {Function} func - operation result processor
         * @return {sGis.sp.DataOperation}
         */
        internalThen(func) {
            this._promise = this._promise.then(func);
            return this;
        }

        _finalHandler({ operation, content }) {
            if (operation.status === 'Success') {
                this.resolve(content);
            } else {
                this.reject({ operation: this._operationName, status: operation.status});
            }
        }

        _progressHandler(data) {
            this.fire('progressUpdate', { progress: data.content });
        }

        cancel() {
            if (!this.id) this.once('requested', () => this.cancel.bind(this));
            utils.ajaxp({ url: `${this._connector.url}${this._controller.name}?cancel=${this.id}&_sb=${this._connector.sid}` });
        }
    }

    utils.mixin(DataOperation.prototype, EventHandler.prototype);

    function parseOperationResponse(data) {
        if (data.charAt(0) === '{') {
            return parseOperationError(data);
        } else {
            return parseOperationSuccess(data);
        }
    }

    function parseOperationError(data) {
        let response;
        try {
            response = JSON.parse(data);
        } catch (e) {
            response = data;
        } finally {
            response.status = 'error';
        }
        return response;
    }

    function parseOperationSuccess(data) {
        let parser = new DOMParser(),
            xml = parser.parseFromString(data, 'text/xml'),
            attributes = xml.getElementsByTagName('Defered')[0].attributes,
            initDataNode = xml.getElementsByTagName('InitializationData')[0],
            response = {
                status: 'success'
            };

        for (let i in attributes) {
            if (attributes[i].nodeName === 'Id') {
                response.operationId = attributes[i].nodeValue;
            } else if (attributes[i].nodeName === 'Name') {
                response.operationName = attributes[i].nodeValue;
            }
        }

        if (initDataNode) {
            response.initializationData = JSON.parse(initDataNode.childNodes[0].nodeValue);
        }

        return response;
    }

    return DataOperation;

});
// EMPTY FILE
sGis.module('sp.LayerManager', [
    'sp.ServiceGroup',
    'sp.Project',
    'sp.services.ServiceContainer',
    'sp.DataFilter',
    'utils'
], function (ServiceGroup, Project, ServiceContainer, DataFilter, utils) {

    /**
     * @alias sGis.sp.LayerManager
     */
    class LayerManager extends ServiceGroup {
        constructor(connector, map) {
            super('__root');
            this._map = map;
            this._connector = connector;
            this._map.addLayer(this.layer);

            this.ready = new Promise((resolve) => this._resolveReady = resolve);
        }

        init(services = []) {
            Promise.all(services.map(name => new Promise(resolve => this.loadWithPromise(name).then(resolve).catch(resolve))))
                .then(this._resolveReady);
        }

        loadService(name, index = -1, parent = null) {
            if (this.getServiceContainer(name, true)) throw new Error(`Service ${name} is already in the list`);

            let container = new ServiceContainer(this._connector, name);
            if (parent) {
                parent.insertService(container, index);
            } else {
                this.insertService(container, index);
            }

            return container;
        }

        loadWithPromise(name, parent) {
            return new Promise((resolve, reject) => {
                let container = this.loadService(name, -1, parent);
                container.on('stateUpdate', () => {
                    if (container.service) {
                        resolve(container);
                    } else {
                        reject();
                    }
                });
            });
        }

        updateService(name) {
            let container = this.getServiceContainer(name, true);
            if (!container) utils.error('Service is not in the group');

            let parent = this.getParent(container);
            let index = parent.children.indexOf(container);
            parent.removeService(container);

            this.loadService(name, index, parent);
        }

        replaceService(oldName, newName) {
            let current = this.getServiceContainer(oldName, true);
            if (!current) utils.error('Service is not in the group');

            let parent = this.getParent(current);
            let index = parent.children.indexOf(current);
            parent.removeService(current);

            this.loadService(newName, index, parent);
        }
    }

    Project.registerCustomDataItem('services', ({layerManager}) => {
        if (!layerManager) return;
        return layerManager.children.map(container => saveContainer(container));
    }, (descriptions, {layerManager}) => {
        if (!layerManager || !descriptions) return;


        descriptions.forEach(serviceDesc => {
            let container = layerManager.getServiceContainer(serviceDesc.serviceName, false);
            if (container) return restoreServiceParameters(container, serviceDesc, layerManager);

            restoreService(layerManager, serviceDesc);
        });
    });

    function restoreService(layerManager, serviceDesc, parent) {
        if (serviceDesc.isFolder) {
            let service = new ServiceGroup(serviceDesc.serviceName, { alias: serviceDesc.alias });
            let container = new ServiceContainer(layerManager._connector, serviceDesc.serviceName, { service });
            (parent || layerManager).insertService(container);
            return restoreServiceParameters(container, serviceDesc, layerManager);
        }

        layerManager.loadWithPromise(serviceDesc.serviceName, parent)
            .then(service => {
                restoreServiceParameters(service, serviceDesc, layerManager);
            })
            .catch(() => {});
    }

    function restoreServiceParameters (container, desc, layerManager) {
        let service = container.service;
        let view = service && service.view || service;

        if (desc.opacity !== undefined) container.layer.opacity = desc.opacity;
        if (desc.resolutionLimits) container.layer.resolutionLimits = desc.resolutionLimits;
        if (desc.isDisplayed !== undefined && container.service) container.service.isDisplayed = desc.isDisplayed;
        if (desc.filter && view && view.setDataFilter)  {
            view.setDataFilter(DataFilter.deserialize(desc.filter));
        } else if (desc.customFilter && view && view.setCustomFilter) {
            view.setCustomFilter(desc.customFilter);
        }
        if (desc.meta && container.service) container.service.meta = desc.meta;

        if (desc.isFolder && desc.children) {
            desc.children.forEach(child => {
                restoreService(layerManager, child, container.service);
            });
        } else if (desc.children && container.service && container.service.children) {
            container.service.children.forEach(child => {
                let childDesc = desc.children.find(x => x.serviceName === child.name);
                if (childDesc) restoreServiceParameters(child, childDesc);
            });
        }
    }

    function saveContainer(container) {
        return {
            serviceName: container.name,
            isFolder: container.service && container.service instanceof ServiceGroup,
            alias: container.service && container.service.alias,
            opacity: container.layer && container.layer.opacity,
            resolutionLimits: container.layer && container.layer.resolutionLimits,
            isDisplayed: container.service && container.service.isDisplayed,
            filter: container.service && (
                (container.service.tempFilterApplied && container.service.dataFilter && container.service.dataFilter.serialize()) ||
                (container.service.view && container.service.view.tempFilterApplied && container.service.view.dataFilter && container.service.view.dataFilter.serialize())
            ),
            customFilter: container.service && (
                container.service.customFilter ||
                container.service.view && container.service.view.customFilter
            ),
            meta: container.service && container.service.meta,
            children: saveChildren(container.service)
        };
    }

    function saveChildren(service) {
        if (!service || !service.children) return;
        return service.children.map(container => saveContainer(container));
    }


    return LayerManager;

});
sGis.module('sp.Printer', [
    'sp.utils'
], function(utils) {
    'use strict';

    var defaults = {
        dpi: 96,
        paperSize: {
            width: 210,
            height: 297
        },
        margin: {
            left: 10,
            top: 10,
            right: 10,
            bottom: 10
        }
    };

    var Printer = function(map, connector) {
        this._serverConnector = connector;
        this._map = map;
    };

    Printer.prototype = {
        getTemplates: function() {
            return this._serverConnector.initializationPromise.then(() => utils.ajaxp({
                url: this._serverConnector.url + 'export/templates/' + (this._serverConnector.sessionId ? '?_sb=' + this._serverConnector.sessionId : ''),
                cache: false
            })).then(([data]) => utils.parseJSON(data));
        },

        getPreview: function(properties) {
            return this.__store(properties)
                .then(() => {
                    return this._serverConnector.url + 'export/preview/?noHeader=true&f=binary' + this._serverConnector.sessionSuffix + '&ts=' + Date.now();
                });
        },

        getImage: function(properties) {
            return this.__store(properties)
                .then(() => {
                    let link = this._serverConnector.url + 'export/print/?noHeader=true&f=' + (properties.useApi ? 'json' : 'binary') + this._serverConnector.sessionSuffix + '&ts=' + Date.now() + (properties.useApi ? '&asLink=true' : '');
                    if (properties.useApi) {
                        return utils.ajaxp({url: link}).then(([id]) => id);
                    } else {
                        return link;
                    }
                });
        },

        __store: function(properties) {
            var description = {
                ServiceStateDefinition: [],
                MapCenter: {
                    X: properties.position ? properties.position.x : this._map.centerPoint.x,
                    Y: properties.position ? properties.position.y : this._map.centerPoint.y
                },
                SpatialReference: this._map.crs.toString(),
                Dpi: properties.dpi || defaults.dpi,
                Resolution: properties.resolution || this._map.resolution,
                PaperSize: {
                    Width: properties.paperSize && properties.paperSize.width || defaults.paperSize.width,
                    Height: properties.paperSize && properties.paperSize.height || defaults.paperSize.height
                },
                Margin: {
                    Left: properties.margin && properties.margin.left || defaults.margin.left,
                    Top: properties.margin && properties.margin.top || defaults.margin.top,
                    Right: properties.margin && properties.margin.right || defaults.margin.right,
                    Bottom: properties.margin && properties.margin.bottom || defaults.margin.bottom
                },
                PrintingTemplateName: properties.template.Name,
                Parameters: []
            };

            for (var i = 0, len = properties.template.BindingGroups.length; i < len; i++) {
                description.Parameters = description.Parameters.concat(properties.template.BindingGroups[i].Parameters);
            }

            var services = properties.services;
            for (var i = 0, len = services.length; i < len; i++) {
                let service = services[i];
                description.ServiceStateDefinition.push({
                    UniqueName: service.name || service.id,
                    Opactiy: service.layer.opacity,
                    IsVisible: service.isDisplayed,
                    Title: service.name,
                    CustomParameters: {},
                    Layers: [{ LayerId: -1, LegendItemId: -1, Children: [] }]
                });
            }

            description.Legend = {
                LayerId: -1,
                LegendItemId: -1,
                Children: services.filter(x => x.hasLegend).map(x => {
                    return {
                        Name: x.alias || x.name,
                        ServiceFullName: x.name
                    };
                })
            };

            return utils.ajaxp({
                url: this._serverConnector.url + 'export/store/' + (this._serverConnector.sessionId ? '?_sb=' + this._serverConnector.sessionId : ''),
                type: 'POST',
                data: 'exportDefinition=' + encodeURIComponent(JSON.stringify(description)) + '&f=json',
                cache: false
            });
        }
    };

    return Printer;
    
});

sGis.module('sp.Project', [
    'utils'
], (utils) => {
    
    'use strict';
    
    class Project {
        constructor(api) {
            this._name = utils.getGuid();

            this._api = api;
            this._data = {};
            this._context = {};
            this._isLoading = false;
        }
        
        load(name) {
            this._isLoading = true;
            return this._api.operation('projects/load', { name: name })
                .then((response) => {
                    this._isLoading = false;
                    this._name = name;
                    this.alias = response.alias;
                    this.description = response.description;

                    this._isLoaded = true;
                    this._data = JSON.parse(response.data) || {};
                    
                    this.apply();
                })
                .catch(() => {
                    this._isLoading = false;
                });
        }

        get isLoading() { return this._isLoading; }
        
        setContext(key, context) {
            if (this._context[key]) utils.error('Context conflict: ' + key);
            this._context[key] = context;
        }

        apply() {
            Object.keys(dataRegister).forEach(this.applyKey, this);
        }

        applyKey(key) {
            if (dataRegister[key]) dataRegister[key].apply(this._data[key], this._context);
        }

        getStoredValue(key) {
            return this._data[key];
        }

        update() {
            this._data = {};
            Object.keys(dataRegister).forEach(key => {
                this._data[key] = dataRegister[key].update(this._context);
            });
        }

        save(isShared) {
            let operation = this._isLoaded ? 'projects/update' : 'projects/create';
            return this._api.operation(operation, {
                name: this.name,
                alias: this.alias,
                description: this.description,
                isShared: !!isShared
            }, JSON.stringify(this._data));
        }

        get name() { return this._name; }
        
        static registerCustomDataItem(key, updateHandler, applyHandler) {
            if (dataRegister[key]) utils.error('Custom data key conflict: ' + key);
            dataRegister[key] = { update: updateHandler, apply: applyHandler };
        }
    }
    
    var dataRegister = {};

    Project.prototype.alias = null;
    Project.prototype.description = null;

    return Project;

});
sGis.module('sp.ServiceGroup', [
    'utils',
    'LayerGroup',
    'EventHandler'
], (utils, LayerGroup, EventHandler) => {
    'use strict';

    class ServiceGroup extends EventHandler {
        constructor(name, options = {}) {
            super();
            this._name = name;
            this._children = options.children || [];

            this.alias = options.alias;

            this._isDisplayed = true;
            this._layer = new LayerGroup();

            this._forwardEvent = this.forwardEvent.bind(this);
            this._onStateUpdate = this._onStateUpdate.bind(this);

            this._children.forEach(container => this._setListeners(container));
        }

        get name() { return this._name}
        get layer() { return this._layer; }

        get children() { return this._children; }

        get isDisplayed() { return this._layer.isDisplayed; }
        set isDisplayed(bool) {
            if (this._layer.isDisplayed !== bool) {
                this._layer.isDisplayed = bool;
                this.fire('visibilityChange');
            }
        }

        insertService(container, index = -1) {
            if (index < 0 || index > this._children.length) index = this._children.length;

            let currIndex = this._children.indexOf(container);
            if (currIndex >= 0) {
                if (currIndex === index || currIndex + 1 === index) return;
                this._children.splice(currIndex, 1);
                if (index > currIndex) index--;
            }

            this._children.splice(index, 0, container);
            this._updateChildLayers();

            if (currIndex === -1) this._setListeners(container);
            this.fire('contentChange');
        }

        _setListeners(container) {
            container.on('stateUpdate contentChange', this._onStateUpdate);
        }

        _removeListeners(container) {
            container.off('stateUpdate contentChange', this._onStateUpdate);
        }

        _onStateUpdate(e) {
            this._updateChildLayers();
            this._forwardEvent(e);
        }

        removeService(container) {
            let index = this._children.indexOf(container);
            if (index === -1) utils.error('Service is not in the group.');

            this._children.splice(index, 1);
            this._updateChildLayers();
            this._removeListeners(container);
            this.fire('contentChange', {deleted: container});
        }

        _updateChildLayers() {
            let layers = this._children
                .filter(container => container.service && container.service.layer)
                .map(container => container.service.layer);

            layers.forEach((layer, index) => {
                if (this._layer.layers[index] !== layer) this._layer.insertLayer(layer, index);
            });

            while (this._layer.layers.length > layers.length) {
                this._layer.removeLayer(this._layer.layers[this._layer.layers.length-1]);
            }
        }

        getService(serviceName, recurse = true) {
            let container = this.getServiceContainer(serviceName, recurse);
            return container && container.service || null;
        }

        getServiceContainer(serviceName, recurse = true) {
            if (!serviceName) return null;

            for (let i = 0; i < this._children.length; i++) {
                if (this._children[i].name === serviceName || this._children[i].localName === serviceName) return this._children[i];
                if (recurse && this._children[i].service && this._children[i].service.children) {
                    let found = this._children[i].service.getServiceContainer(serviceName, true);
                    if (found) return found;
                }
            }

            return null;
        }

        getServices(recurse) {
            let children = [];
  
            this._children.forEach(c => {
                if (!c.service) return;
                children.push(c.service);
                if (recurse && c.service.getServices) children = children.concat(c.service.getServices(true));
            });

            return children;
        }

        getDisplayedServices(recurse = true) {
            let children = [];
            
            if (this.isDisplayed) {
                this._children.forEach(c => {
                    if (!c.service || !c.service.isDisplayed) return;
                    
                    if (recurse && c.service.getServices) {
                        children = children.concat(c.service.getDisplayedServices(true));
                    } else {
                        children.push(c.service);
                    }
                });
            }

            return children;
        }

        contains(container, recurse = true) {
            let isContain = false;
            this._children.forEach(child => {
                if (child === container ||
                    (recurse && child.service && child.service.children && child.service.contains(container))
                ) {
                    isContain = true;
                }
            });

            return isContain;
        }

        getParent(container) {
            if (this._children.includes(container)) return this;
            let groups = this.children.filter(x => x.service && x.service instanceof ServiceGroup);
            for (let i = 0; i < groups.length; i++) {
                let parent = groups[i].service.getParent(container);
                if (parent) return parent;
            }
            return null;
        }
    }

    return ServiceGroup;

});
sGis.module('SpatialProcessor', [
    'utils',
    'Point',
    'Map',
    'painter.DomPainter',
    'sp.Connector',
    'sp.LayerManager',
    'sp.controllers.DataAccessService',
    'EventHandler',
    'sp.ControllerManager',
    'sp.Project',
    'sp.services.MapService',
    'sp.services.ServiceContainer',
    'sp.services.TileService'
], function(utils, Point, Map, DomRenderer, Connector, LayerManager, DataAccessService, EventHandler, ControllerManager, Project, MapService, ServiceContainer, TileService) {
    'use strict';
    
    class SpatialProcessor {
        /**
         * @constructor
         * @param {Object} properties
         * @param {String} [properties.sessionId]
         * @param {String} properties.url
         * @param {String} [properties.login]
         * @param {String} [properties.password]
         * @param {Position} [properties.position]
         * @param {Number} [properties.resolution]
         * @param {String} [properties.mapWrapper]
         * @param {String[]} [properties.services]
         * @param {String} [properties.projectName]
         * @param {String} [properties.baseService]
         * @param {sGis.IPoint} [properties.centerPoint]
         */
        constructor(properties) {
            let { sessionId, url, login, password, position, resolution, mapWrapper, services, projectName, baseService, centerPoint, authServiceUrl } = properties;

            if (!authServiceUrl) authServiceUrl = this._guessAuthServiceUrl(url);

            if (sessionId) {
                this._connector = new Connector(url, authServiceUrl, {sessionId});
            } else {
                this._connector = new Connector(url, authServiceUrl, {login, password});
            }

            this._map = new Map();
            this._painter = new DomRenderer(this._map);

            if (!baseService) this._initMapParams({ position, resolution, mapWrapper, centerPoint });

            this.api = this._connector.api;
            this.layerManager = new LayerManager(this.connector, this.map);
            this.controllerManager = new ControllerManager(this.connector, this.map);
            this._login = properties.login;

            this.project = new Project(this.api);

            if (this._connector.sessionId || !login) {
                this._init({ services, projectName, baseService, position, resolution, mapWrapper, centerPoint });
            } else {
                this._connector.once('sessionInitialized', this._init.bind(this, { services, projectName, baseService, position, resolution, mapWrapper, centerPoint }));
            }

            this._dataAccessService = new DataAccessService(this._connector, 'DataAccess');
        }

        _init({ services, projectName, baseService, position, resolution, mapWrapper, centerPoint }) {
            if (baseService) {
                this._baseServiceContainer = new ServiceContainer(this._connector, baseService);
                this._baseServiceContainer.once('stateUpdate', this._onBaseServiceInit.bind(this, { position, resolution, mapWrapper, centerPoint }));
            }

            this.layerManager.init(services);

            this.project.setContext('map', this._map);
            this.project.setContext('layerManager', this.layerManager);

            if (projectName) {
                this.project.load(projectName);
            }
        }

        get map() { return this._map; }
        get painter() { return this._painter; }
        get login() { return this._login; }
        get connector() { return this._connector; }
        get dataAccessService() { return this._dataAccessService; }

        _initMapParams({ position, resolution, mapWrapper, centerPoint }) {
            if (position) {
                this._map.position = position;
            } else if (centerPoint) {
                this._map.centerPoint = centerPoint;
            }

            if (resolution) this._map.resolution = resolution;
            if (mapWrapper) this._painter.wrapper = mapWrapper;
        }

        get baseService() { return this._baseServiceContainer && this._baseServiceContainer.service; }

        _onBaseServiceInit(params) {
            if (!this._baseServiceContainer.service) {
                console.error('Base service initialization failed. Error: ' + this._baseServiceContainer.error);
            } else if (!(this._baseServiceContainer.service instanceof TileService)) {
                console.error('Base service must be a tile service, but loaded service does not support tile rendering.');
            } else {
                this._map.crs = this.baseService.crs;
                this._map.tileScheme = this.baseService.tileScheme;
                this._map.insertLayer(this.baseService.layer, 0);
            }

            this._initMapParams(params);
        }

        _guessAuthServiceUrl(spUrl) {
            return spUrl.replace('SpatialProcessor/IIS/', 'Strategis.Server.Authorization/Authorize.svc/Login');
        }
    }

    Project.registerCustomDataItem('map', ({map}) => {
        if (!map) return;
        return { position: map.position, resolution: map.resolution, crsCode: map.crs.toString() };
    }, ({position, resolution, crsCode}, {map}) => {
        if (!map) return;
        if (crsCode) map.crs = MapService.parseCrs(crsCode);
        if (position) map.position = position;
        if (resolution) map.resolution = resolution;
    });

    SpatialProcessor.version = "0.3.0";
    SpatialProcessor.releaseDate = "02.10.2017";

    sGis.spatialProcessor = sGis.sp;

    return SpatialProcessor;
    
});

sGis.module('sp.utils', [
    'utils'
], function(utils) {
    'use strict';

    sGis.utils.parseXmlJsonNode = function(node) {
        var string = '';
        for (var i = 0, len = node.childNodes.length; i < len; i++) {
            string += node.childNodes[i].nodeValue;
        }
        return sGis.utils.parseJSON(string);
    };

    sGis.utils.parseJSON = function(string) {
        try {
            var json = JSON.parse(string);
        } catch (e) {
            var changed = string.replace(/\\"/g, '\\"').replace(/NaN/g, '"NaN"').replace(/:-Infinity/g, ':"-Infinity"').replace(/:Infinity/g, ':"Infinity"');
            json = JSON.parse(changed);
        }
        return json;
    };

    sGis.utils.message = function(mes) {
        if (window.console) {
            console.log(mes);
        }
    };

    sGis.utils.ajax = function(properties) {
        var requestType = properties.type ? properties.type : 'GET';
        if (properties.cache === false) properties.url += '&ts=' + new Date().getTime();
        if (sGis.utils.browser === 'MSIE 9') {
            var xdr = new XDomainRequest();
            xdr.onload = function() {
                if (properties.success) properties.success(xdr.responseText);
            };
            xdr.onerror = function() {if (properties.error) properties.error(xdr.responseText);};
            xdr.onprogress = function() {};
            xdr.timeout = 30000;
            xdr.open(requestType, properties.url);
            xdr.send(properties.data ? properties.data : null);
        } else {
            var XMLHttpRequest = window.XMLHttpRequest || window.ActiveXObject && function() {return new ActiveXObject('Msxml2.XMLHTTP');},
                xhr = new XMLHttpRequest();

            xhr.open(requestType, properties.url);

            if (properties.contentType) xhr.setRequestHeader('Content-Type', properties.contentType);

            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        if (properties.success) properties.success(xhr.responseText, xhr.statusText);
                    } else {
                        if (properties.error) properties.error(xhr.responseText, xhr.statusText);
                    }
                }
            };
            xhr.timeout = 30000;
            xhr.send(properties.data ? properties.data : null);

            return xhr;
        }
    };

    sGis.utils.ajaxp = function(properties) {
        return new Promise((resolve, reject) => {
            var prop = {
                success: (response, status) => { resolve([response, status, reject]); },
                error: (response, status) => { reject([response, status, reject]); }
            };
            prop = Object.assign(prop, properties);
            sGis.utils.ajax(prop);
        });
    };

    sGis.utils.arrayMove = function (array, from, to) {
        const newArray = array.slice();
        newArray.splice((to < 0 ? newArray.length + to : to), 0, newArray.splice(from, 1)[0]);
        return newArray;
    };

    return utils;
    
});

sGis.module('sp.controllers.Controller', [
    'sp.utils',
    'sp.controllers.DataAccessBase'
], function(utils, DataAccessBase) {
    'use strict';

    class Controller extends DataAccessBase {
        constructor(type, connector, properties = {}) {
            super(connector);
            Object.assign(this, properties);

            this._type = type;
            this._initialize();
        }

        _initialize() {
            if (this.connector.sessionId) {
                this.init(this._createController());
                return;
            }

            this.init(new Promise((resolve, reject) => {
                this.connector.on('sessionInitialized', () => {
                    this._createController().then(resolve).catch(reject);
                });
            }));
        }

        _createController() {
            return utils.ajaxp({
                url: `${this._connector.url}${this.controllerServiceName}/?_sb=${this._connector.sessionId}`,
                type: 'POST',
                data: `create=${this._type}`
            }).then(([response, status, reject]) => {
                this._initData = JSON.parse(response);
                let ServiceId = this._initData.ServiceId;
                if (!ServiceId) throw new Error('Server did not return controller id');
                this._id = ServiceId;

                return this.name;
            })
        }

        get name() { return `${this.controllerServiceName}/${this._id}`; }
        get type() { return this._type; }
        get initData() { return this._initData; }

        remove() {
            Promise.reject(this.initializationPromise);
            if (!this._id) return;

            return utils.axajp({
                url: `${this._connector.url}${this.controllerServiceName}/?_sb=${this._connector.sessionId}`,
                type: 'POST',
                data: `delete=${this._id}`
            });
        }
    }

    Controller.prototype.controllerServiceName = 'ControllerService';


    return Controller;
    
});

sGis.module('sp.controllers.DataAccessBase', [
    'EventHandler',
    'sp.DataOperation',
    'sp.serializers.xmlSerializer'
], function(EventHandler, DataOperation, xmlSerializer) {
    'use strict';

    class DataAccessBase extends EventHandler {
        constructor(connector) {
            super();
            this._connector = connector;
        }

        get name() { return this._name; }
        get connector() { return this._connector; }

        init(initializationPromise) {
            this.initializationPromise = initializationPromise.then(name => this._name = name);
        }

        operation(operationName, params, expectsFeatures = false) {
            let operation = new DataOperation(this._connector, this, operationName, params);
            if (expectsFeatures) {
                return operation.internalThen(response => xmlSerializer.deserializeFeatures(response));
            }
            return operation;
        }
    }

    return DataAccessBase;

});
sGis.module('sp.controllers.DataAccessService', [
    'sp.controllers.DataAccessBase',
    'sp.serializers.JsonSerializer',
    'sp.serializers.xmlSerializer'
], function(DataAccessBase, JsonSerializer, xmlSerializer) {
    'use strict';

    class DataAccessService extends DataAccessBase {
        constructor(connector, { serviceName = 'DataAccess' }) {
            super(connector, serviceName);
            this.init(new Promise(resolve => resolve(serviceName)));
        }

        /**
         * Function for export data from a layer (or filtered data) into one of the following formats: excel, shape, geojson.
         * Returns document identifier. Identifier have to used for download export document
         * @param {Object} properties
         * @param {String} properties.serviceName - name of the service with source geometries
         * @param {String} properties.exportType - type of export expected types: excel, shape, geojson
         * @param {String} [properties.query] - query for data filter. Query example: select {id}, {geometry}, attr1 where attr1 == 'value';
         * @returns {sGis.sp.DataOperation} document identifier
         */
        exportData(properties) {
            let { serviceName, exportType, query } = properties;
            return this.operation('exportData', { serviceName, exportType, query }, false);
        }

        queryById(properties) {
            let { serviceName, objectIds } = properties;
            return this.operation('queryById', { serviceName, objectIds }, true);
        }

        queryByGeometry(properties) {
            let { serviceName, geometry, resolution } = properties;
            let serialized = JsonSerializer.serializeGeometry(geometry);
            return this.operation('queryByGeometry', { serviceName, geometry: serialized, resolution }, true);
        }

        updateFeatures(properties) {
            let { features, serviceName } = properties;
            let serialized = xmlSerializer.serializeGeometryEdit({ updated: features }, false, true);
            return this.operation('edit', { action: 'edit', edit: serialized, serviceName });
        }

        saveEdit(properties) {
            let { added, updated, serviceName } = properties;
            let serialized = xmlSerializer.serializeGeometryEdit({ added, updated }, false, true);
            return this.operation('edit', { action: 'edit', edit: serialized, serviceName });
        }

        deleteFeatures(properties) {
            let { ids, serviceName } = properties;
            let serialized = xmlSerializer.serializeGeometryEdit({ deleted: ids }, false, true);
            return this.operation('edit', { action: 'edit', edit: serialized, serviceName });
        }

        createFeature(properties) {
            let { serviceName, geometry, attributes = null } = properties;
            let serialized = JsonSerializer.serializeGeometry(geometry);
            return this.operation('createVisualObject', { geometry: serialized, serviceName, attributes });
        }

        autoComplete(properties) {
            let { serviceName, line, ids } = properties;
            let serialized = JsonSerializer.serializeGeometry(line);
            return this.operation('autoComplete', { serviceName, line: [serialized], ids });
        }

        reshape(properties) {
            let { serviceName, line, ids } = properties;
            let serialized = JsonSerializer.serializeGeometry(line);
            return this.operation('reshape', { serviceName, line: [serialized], ids });
        }

        cut(properties) {
            let { serviceName, line, ids } = properties;
            let serialized = JsonSerializer.serializeGeometry(line);
            return this.operation('cut', { serviceName, line: [serialized], ids });
        }

        projectGeometry(properties) {
            let { features, sourceSr, destinationSr } = properties;
            let geometry = features.map(JsonSerializer.serializeGeometry);
            return this.operation('gcProject', { sourceGeom: geometry, sourceSr, destSr: destinationSr });
        }

        getScalarValue(properties) {
            let { serviceName, query } = properties;
            return this.operation('selectScalarValue', { serviceName, query });
        }

        copyFeatures(properties) {
            let { sourceServiceName, targetServiceName, objectIds = null } = properties;
            return this.operation('copy', { sourceServiceName, targetServiceName, objectIds });
        }

        aggregate(properties) {
            let { geometrySourceServiceName, dataSourceServiceName, targetServiceName, aggregations } = properties;
            return this.operation('aggregate', { geometrySourceServiceName, dataSourceServiceName, targetServiceName, aggregations });
        }

        batchEdit(properties) {
            let { serviceName, attribute, expression, condition } = properties;
            return this.operation('batchFuncEdit', { serviceName, attribute, expression, condition });
        }

        geocode(properties) {
            let { query, crs, providers } = properties;
            return this.operation('geocode', { query, crs: crs.toString(), providers });
        }

        /**
         * Calculates the buffers and displays them in the controller mapServer
         * @param {Object} properties
         * @param {Number|String[]} properties.distances - an array of buffer radiuses or attribute names, which should be used as a value for radius.
         * @param {Boolean} properties.unionResults - whether to unite buffers into one object.
         * @param {Boolean} properties.subtractObject - whether to subtract the source object from the resulting buffer.
         * @param {Number} [properties.processDelay] - server processes objects in batches of 200. This parameter is a sleep time in ms between batches. Use smaller value for quicker process.
         * @param {Boolean} properties.subtractInnerBuffer - whether to subtract inner buffer from outer buffer. This option has no effect if "unionResult" is true.
         * @param {String} properties.sourceServiceName - name of the service with source geometries
         * @param {String} properties.targetServiceName - name of the service to which to write calculated buffers
         * @param {Function} properties.requested
         * @param {Function} properties.success
         * @param {Function} properties.error
         */
        calculateBuffers(properties) {
            let { distances, unionResults = false, subtractObject = false, processDelay = null, subtractInnerBuffer = false, sourceServiceName, targetServiceName } = properties;
            return this.operation('buffer', { distances, unionResults, subtractInnerBuffer, subtractObject, processDelay, sourceServiceName, targetServiceName });
        }

        /**
         * Build isochrone from the center of every object in the given storage
         * @param {Object} properties
         * @param {Number} properties.duration - time in seconds for isochrone limit
         * @param {String} properties.solver - name of the route builder backend
         * @param {String} properties.sourceServiceName - name of the service of the source geometries
         * @param {String} properties.targetServiceName - name of the service the isochrones will be saved to
         * @param {Number} [properties.resolutionK] - the resolution coefficient of isochrone. 0.1 would mean, that 20x20 grid will be used, 0.5 -> 4x4.
         * @param {Boolean} [properties.uniteResults] - whether to unite the isochrones from different objects
         * @param {Function} properties.requested
         * @param {Function} properties.success
         * @param {Function} properties.error
         */
        buildIsochroneByStorage(properties) {
            let { duration, solver, sourceServiceName, targetServiceName, resolutionK = null, uniteResults = false } = properties;
            return this.operation('isochroneByStorage', { duration, solver, sourceServiceName, targetServiceName, resolutionK, uniteResults });
        }
    }
    
    return DataAccessService;
    
});

sGis.module('sp.controller.DitIntegration', [
    'sp.Controller'
], function(Controller) {
    'use strict';

    var DitIntegration = function(spatialProcessor, options) {
        this._map = options.map;

        var self = this;
        this.__initialize(spatialProcessor, {}, function() {
            self._mapServer = options.sp.addService('VisualObjectsRendering/' + this._mapServiceId);
            self._layer = self._mapServer;

            self.initialized = true;
            self.fire('initialize');
        });
    };

    DitIntegration.prototype = new sGis.sp.Controller({
        _type: 'integrationLayer',

        loadLayerData: function(properties) {
            this.__operation(function() {
                return {
                    operation: 'loadLayerData',
                    dataParameters: 'layerId=' + encodeURIComponent(properties.layerId),
                    success: properties.success,
                    error: properties.error,
                    requested: properties.requested
                };
            });
        },

        disintegrate: function(properties) {
            var self = this;
            this.__operation(function() {
                var param = 'layerId=' + encodeURIComponent(properties.layerId) + '&moduleId=' + encodeURIComponent(properties.moduleId) + '&shitId=' + encodeURIComponent(properties.queryId);
                return {operation: 'disintegrate',
                    dataParameters: param,
                    requested: properties.requested,

                    success: function() {
//                        everGis.addMapItem(self._mapItem);
                        if (properties.success) {
                            properties.success();
                        }
                    },
                    error: properties.error
                };
            });
        },

        fullyDisintegrate: function(properties) {
            var self = this;
            this.__operation(function() {
                var param = 'layerId=' + encodeURIComponent(properties.layerId) + '&moduleId=' + encodeURIComponent(properties.moduleId) + '&shitId=' + encodeURIComponent(properties.queryId);
                return {operation: 'fullyDisintegrate',
                    dataParameters: param,
                    requested: properties.requested,

                    success: function() {
//                        everGis.addMapItem(self._mapItem);
                        if (properties.success) {
                            properties.success();
                        }
                    },
                    error: properties.error
                };
            });
        }
    });

    Object.defineProperties(DitIntegration.prototype, {
        tree: {
            get: function() {
                return this._tree;
            }
        },

        isActive: {
            get: function() {
                return this._layer.map === null;
            }
        },

        mapServer: {
            get: function() {
                return this._mapServer;
            }
        }
    });

    return DitIntegration;
    
});

sGis.module('sp.controllers.ImportData', [
    'sp.controllers.Controller',
    'sp.ControllerManager'
], function(Controller, ControllerManager) {
    'use strict';

    class ImportData extends Controller {
        constructor(connector, properties) {
            super('importData', connector, properties);
        }

        load(properties) {
            let { fileId, configuration } = properties;
            return this.operation('load', { uploadSlot: fileId, configuration });
        }

        import(properties) {
            let { serviceName, attributeMapping, configuration } = properties;
            return this.operation('import', {serviceName, attributeMapping, configuration});
        }
    }

    ControllerManager.registerController('importData', ImportData);

    return ImportData;

});

sGis.module('sp.controllers.ObjectSelector', [
    'sp.controllers.ViewableController',
    'sp.ControllerManager',
    'sp.serializers.JsonSerializer'
], function(ViewableController, ControllerManager, JsonSerializer) {
    'use strict';

    class ObjectSelector extends ViewableController {
        constructor(connector, properties) {
            super('objectSelector', connector, properties);
            this.map = properties.map;
            this._setNotificationListener();
        }

        _setNotificationListener() {
            this.connector.addObjectSelectorListener(data => {
                this.fire('update', { data });
            });
        }

        select(properties) {
            let { geometry, mode = 0, services } = properties;
            let serialized = JsonSerializer.serializeGeometry(geometry);

            return this.operation('select', { geom: serialized, res: this.map && this.map.resolution, mode, services, sr: this.map && this.map.crs.toString() });
        }

        pickByGeometry(properties) {
            let { geometry, services } = properties;
            let serialized = JsonSerializer.serializeGeometry(geometry);

            return this.operation('pick', { geom: serialized, res: this.map && this.map.resolution, services, sr: this.map && this.map.crs.toString() }, true);
        }

        pickById(properties) {
            let { ids, serviceName, mode = 0 } = properties;
            return this.operation('pickById', { ids: [{ ServiceName: serviceName, ObjectIds: ids }], mode }, true);
        }

        /**
         * Selection of objects by the geometry in specified storage
         * @param {Object} properties
         * @param {String} properties.geometryStorageId - storage id with the geometry to be used for selection
         * @param {String[]} [properties.searchStorageIds] - the list of storage is, in which search will be performed
         * @param {Number} [properties.mode} - mode of search. 0 - clear search tree before search, 1 - add to selection, 2 - remove from selection
         * @param {String} [properties.operation] - "contains" to find only objects, completely contained by search geometry.
         */
        selectByStorage(properties) {
            let { geometryService, services, mode = 0, operation = null } = properties;
            return this.operation('selectByStorage', { geometryService, res: this.map && this.map.resolution, services, mode, operation });
        }

        search(properties) {
            let { string, services } = properties;
            return this.operation('search', {query: string, services});
        }

        clear() {
            return this.operation('clear', {});
        }
    }

    ControllerManager.registerController('objectSelector', ObjectSelector);

    return ObjectSelector;
    
});

sGis.module('sp.controller.Routing', [
    'sp.Controller',
    'sp.ControllerManager'
], function(Controller, ControllerManager) {
    'use strict';

    var Routing = function(connector, options) {
        this._map = options.map;
        this.__initialize(connector, {sync: true}, function() {
            this.initialized = true;
            this.fire('initialize');
        });
    };

    Routing.prototype = new sGis.sp.Controller({
        _type: 'route',

        buildRoute: function(properties) {
            this.__operation(function() {
                var startPoint = 'startPoint=' + encodeURIComponent(JSON.stringify({x: properties.startPoint.x, y: properties.startPoint.y, spatialReference: this._map.crs.getWkidString()}));
                var endPoint = 'endPoint=' + encodeURIComponent(JSON.stringify({x: properties.endPoint.x, y: properties.endPoint.y, spatialReference: this._map.crs.getWkidString()}));
                var sr = 'spatialReference=' + encodeURIComponent(JSON.stringify(this._map.crs.getWkidString()));
                var solver = 'solver=' + properties.solver;
                var param = [startPoint, endPoint, sr, solver].join('&');
                var self = this;
                return {
                    operation: 'buildRoute',
                    dataParameters: param,
                    success: !properties.success ? undefined : function(response) {
                        properties.success(self._createFeatures(response, properties.crs || properties.startPoint && properties.startPoint.crs || self._map && self._map.crs));
                    },
                    error: properties.error,
                    requested: properties.requested
                };
            });
        },

        /**
         * Build isochrone from the center of given geometry object
         * @param {Object} properties
         * @param {Number} properties.duration - time in seconds for isochrone limit
         * @param {String} properties.solver - name of the route builder backend
         * @param {sGis.Feature} properties.geometry - base geometry from which isochrone will be build
         * @param {Number} [properties.resolutionK] - the resolution coefficient of isochrone. 0.1 would mean, that 20x20 grid will be used, 0.5 -> 4x4.
         * @param {Function} properties.requested
         * @param {Function} properties.success
         * @param {Function} properties.error
         */
        // buildIsochrone: function(properties) {
        //     this.__operation(function() {
        //         var duration = 'duration=' + properties.duration;
        //         var solver = 'solver=' + properties.solver;
        //         var geometry = 'geom=' + this._serializeGeometry(properties.geometry);
        //         var resolutionK = 'resolutionK=' + properties.resolutionK;
        //
        //         var param = [duration, solver, geometry, resolutionK].join('&');
        //         return {
        //             operation: 'isochrone',
        //             dataParameters: param,
        //             success: properties.success,
        //             error: properties.error,
        //             requested: properties.requested
        //         };
        //     });
        // }
    });

    ControllerManager.registerController('routing', Routing);

    return Routing;

});

sGis.module('sp.controllers.TempView', [
    'sp.controllers.ViewableController',
    'sp.ControllerManager',
    'sp.services.ServiceContainer'
], function(ViewableController, ControllerManager, ServiceContainer) {
    'use strict';

    class TempView extends ViewableController {
        constructor(connector, localName) {
            super('tempView', connector);
            this._localName = localName;
        }

        resetView(properties) {
            let { sourceServiceName } = properties;
            return this.operation('resetView', { sourceServiceName }).then(this.updateView.bind(this));
        }
    }

    ControllerManager.registerController('tempView', TempView);

    return TempView;

});

sGis.module('sp.controllers.ViewableController', [
    'sp.controllers.Controller',
    'sp.services.ServiceContainer'
], (Controller, ServiceContainer) => {
    'use strict';

    class ViewableController extends Controller {
        constructor(type, connector, properties) {
            super(type, connector, properties);
            this.initializationPromise.then(this._checkInitialization.bind(this));
        }

        _checkInitialization() {
            if (!this.initData.DataViewServiceName) throw new Error(`Controller ${this.type} initialization failed: server did not return view name.`);
        }

        updateView() {
            return new Promise((resolve, reject) => {
                this.initializationPromise.then(() => {
                    let viewName = this.initData.DataViewServiceName;
                    let container = new ServiceContainer(this.connector, viewName);

                    container.once('stateUpdate', () => {
                        if (container.service && container.service.layer) {
                            this._service = container.service;
                            resolve();
                        } else {
                            reject(`Controller ${this.type} update failed: failed to update view.`);
                        }
                    });
                });
            });
        }

        get service() { return this._service; }
    }

    return ViewableController;

});
sGis.module('sp.layers.DataViewLayer', [
    'Layer',
    'sp.ClusterLayer',
    'DynamicLayer',
    'sp.ClusterSymbol'
], (Layer, ClusterLayer, DynamicLayer, ClusterSymbol) => {

    'use strict';

    class DataViewLayer extends Layer {
        constructor(service) {
            super();
            this._service = service;

            this._dynamicLayer = new DynamicLayer(this.getImageUrl.bind(this));

            service.on('dataFilterChange', this._updateDataFilter.bind(this));
            this._updateDataFilter();

            this.redraw = this.redraw.bind(this);
        }

        _updateDataFilter() {
            this._resolutionGroups = [];
            let filter = this._service.dataFilter;

            if (filter) this._fillResolutionGroups(filter);
            this.redraw();
        }

        _fillResolutionGroups(filter) {
            if (filter.childFilters && filter.childFilters.length > 0) {
                filter.childFilters.forEach(x => this._fillResolutionGroups(x));
                return;
            }

            if (filter.symbol && filter.symbol instanceof ClusterSymbol) {
                let layer = new ClusterLayer(this._service.url, this._service.connector.sessionId, filter.symbol);
                layer.aggregationParameters = [{ filters: filter.condition, aggregations: filter.aggregations && filter.aggregations.join(',')}];
                if (filter.symbol.gridSize) layer.clusterSize = filter.symbol.gridSize;
                layer.algorithm = 'adjustedGrid';
                layer.on('propertyChange', () => {
                    this.redraw();
                });
                this._resolutionGroups.push({ minResolution: filter.minResolution, maxResolution: filter.maxResolution, layer: layer });
            } else {
                this._resolutionGroups.push({ minResolution: filter.minResolution, maxResolution: filter.maxResolution, layer: this._dynamicLayer });
            }
        }

        getFeatures(bbox, resolution) {
            if (!this.checkVisibility(resolution)) return [];

            if (this._resolutionGroups.length === 0) return this._dynamicLayer.getFeatures(bbox, resolution);

            let dynamicLayerUsed = false;
            let features = [];
            this._resolutionGroups.forEach(group => {
                if (group.minResolution > 0 && group.minResolution > resolution || group.maxResolution > 0 && group.maxResolution < resolution) return;

                features = features.concat(group.layer.getFeatures(bbox, resolution));
            });

            return features;
        }

        getImageUrl(bbox, resolution) {
            let imgWidth = Math.round((bbox.xMax - bbox.xMin) / resolution);
            let imgHeight = Math.round((bbox.yMax - bbox.yMin) / resolution);
            let sr = bbox.crs.toString();

            return this._service.url + 'export?' +
                'dpi=96&' +
                'transparent=true&' +
                'bbox=' +
                bbox.xMin + '%2C' +
                bbox.yMin + '%2C' +
                bbox.xMax + '%2C' +
                bbox.yMax + '&' +
                'bboxSR=' + sr + '&' +
                'imageSR=' + sr + '&' +
                'size=' + imgWidth + '%2C' + imgHeight + '&' +
                'f=image' + this._service.connector.sessionSuffix;
        }

        get opacity() { return this._dynamicLayer.opacity; }
        set opacity(opacity) {
            this._dynamicLayer.opacity = opacity;
            this.fire('propertyChange', {property: 'opacity'});
        }

        forceUpdate() { this._dynamicLayer.forceUpdate(); }

        get updateProhibited() {
            for (let i = 0; i < this._resolutionGroups.length; i++) {
                if (this._resolutionGroups[i].layer.updateProhibited) return true;
            }
            return false;
        }

        get childLayers() {
            return this._resolutionGroups.map(group => group.layer);
        }
    }

    DataViewLayer.prototype.delayedUpdate = true;

    return DataViewLayer;

});
sGis.module('sp.serializers.JsonSerializer', [
    'utils',
    'Crs',
    'feature.Point',
    'feature.Polyline',
    'feature.Polygon',
    'symbol.point.Point',
    'symbol.polyline.Simple',
    'symbol.polygon.Simple'
], (utils, Crs, Point, Polyline, Polygon, PointSymbol, PolylineSymbol, PolygonSymbol) => {

    let geometryTypeMap = { 'point': Point, 'polyline': Polyline, 'polygon': Polygon };

    let defaultSymbols = {
        'point': new PointSymbol({ fillColor: 'transparent' }),
        'polyline': new PolylineSymbol({ strokeColor: 'transparent' }),
        'polygon': new PolygonSymbol({ strokeColor: 'transparent' })
    };

    return {
        serializeGeometry(geometry) {
            let crs = geometry.crs;
            if (geometry instanceof sGis.feature.Polygon) {
                return {rings: geometry.coordinates, spatialReference: crs && crs.toString()};
            } else if (geometry instanceof sGis.feature.Point || geometry instanceof sGis.Point) {
                return {x: geometry.x, y: geometry.y, spatialReference: crs && crs.toString()};
            } else if (geometry instanceof sGis.feature.Polyline) {
                return {paths: geometry.coordinates, spatialReference: crs && crs.toString()};
            } else if (geometry instanceof sGis.Bbox) {
                return {xmin: geometry.xMin, xmax: geometry.xMax, ymin: geometry.yMin, ymax: geometry.yMax, spatialReference: crs && crs.toString()};
            } else {
                utils.error('Unknown geometry type');
            }
        },

        deserializeFeature(obj, crs) {
            let Constructor = geometryTypeMap[obj.geometryType];
            if (!Constructor) utils.error('Unknown geometry type');

            return new Constructor(obj.geometry, { crs: crs, attributes: obj.attributes, sourceName: obj.sourceName, id: obj.id, symbol: defaultSymbols[obj.geometryType] });
        }
    };

});
sGis.module('sp.serializers.xmlSerializer', [
    'feature.Point',
    'feature.Polyline',
    'feature.Polygon',
    'utils.Color',
    'CRS'
], function(Point, Polyline, Polygon, Color, CRS) {
    'use strict';

    let xmlSerializer = {};

    xmlSerializer.deserializeFeatures = function(response) {
        return createFeatures(response);
    };

    const DEFAULT_VD = {
        point: {
            shape: 'Circle',
            size: 10,
            fill: '#00000000',
            color: '#00000000',
            strokeThickness: 1
        },
        polyline: {
            color: '#00000000',
            strokeThickness: 1
        },
        polygon: {
            fill: '#00000000',
            color: '#00000000',
            strokeThickness: 1
        }
    };

    function parseCrs(desc) {
        if (desc && crsMapping[desc]) {
            return crsMapping[desc];
        } else if (desc && desc.wkid && crsMapping[desc.wkid]) {
            return crsMapping[desc.wkid];
        } else if (desc && desc.wkid === 0) {
            return null;
        } else {
            return new sGis.Crs(desc);
        }
    }

    let crsMapping = {
        '102100': CRS.webMercator,
        '102113': CRS.webMercator,
        '3857': CRS.webMercator,
        '3395': CRS.ellipticalMercator,
        '84': CRS.wgs84,
        '4326': CRS.geo
    };

    function createFeatures(response) {
        var features = [];
        if (response.objects) {
            for (var i in response.objects) {
                var object = response.objects[i];
                let visualDefinition = object.visualDefinition || object.geometry && DEFAULT_VD[object.geometry.data.type];
                if (object.geometry && visualDefinition) {
                    var geometry = object.geometry.data,
                        points = geometry.coordinates,
                        attributes = object.attributes,
                        color = visualDefinition.stroke ? parseColor(visualDefinition.stroke) : undefined,
                        fillColor = visualDefinition.fill ? visualDefinition.fill : undefined;

                    var serverCrs = object.geometry.data.crs;
                    var crs = parseCrs(serverCrs);

                    var idAttribute = response.attributesDefinitions[object.attributesDefinition]._identity;
                    var id = parseInt(object.attributes[idAttribute].value);

                    if (geometry.type === 'polygon') {
                        var feature = new sGis.feature.Polygon(points, {id: id, attributes: attributes, crs: crs, color: color, width: visualDefinition.strokeThickness});
                        if (fillColor && fillColor.brush) {
                            feature.symbol = new sGis.symbol.polygon.BrushFill({
                                strokeWidth: parseFloat(visualDefinition.strokeThickness),
                                strokeColor: color,
                                fillBrush: fillColor.brush,
                                fillForeground: parseColor(fillColor.foreground),
                                fillBackground: parseColor(fillColor.background)
                            });
                        } else {
                            feature.symbol = new sGis.symbol.polygon.Simple({
                                strokeWidth: parseFloat(visualDefinition.strokeThickness),
                                strokeColor: color,
                                fillColor: fillColor ? parseColor(fillColor) : 'transparent'
                            });
                        }
                    } else if (geometry.type === 'polyline') {
                        let symbol = new sGis.symbol.polyline.Simple({ strokeColor: color, strokeWidth: parseFloat(visualDefinition.strokeThickness)});
                        feature = new sGis.feature.Polyline(points, {id: id, attributes: attributes, crs: crs, symbol: symbol });
                    } else if (geometry.type === 'point' || geometry.type === 'multipoint') {
                        var symbol;
                        
                        if (visualDefinition.maskSrc) {
                            symbol = new sGis.symbol.point.MaskedImage({
                                imageSource: visualDefinition.imageSrc,
                                maskSource: visualDefinition.maskSrc,
                                width: parseFloat(visualDefinition.size),
                                height: null,
                                anchorPoint: visualDefinition.anchorPoint
                            });
                        } else if (visualDefinition.imageSrc) {
                            symbol = new sGis.symbol.point.Image({
                                source: visualDefinition.imageSrc,
                                width: parseFloat(visualDefinition.size),
                                height: null,
                                anchorPoint: visualDefinition.anchorPoint
                            });
                        } else if (visualDefinition.shape === 'Circle') {
                            symbol = new sGis.symbol.point.Point({
                                size: parseFloat(visualDefinition.size),
                                fillColor: fillColor ? parseColor(fillColor) : 'transparent',
                                strokeColor: color,
                                strokeWidth: parseFloat(visualDefinition.strokeThickness)
                            });
                        } else {
                            symbol = new sGis.symbol.point.Square({
                                size: parseFloat(visualDefinition.size),
                                strokeWidth: parseFloat(visualDefinition.strokeThickness),
                                strokeColor: color,
                                fillColor: fillColor ? parseColor(fillColor) : 'transparent'
                            });
                        }

                        var featureClass = geometry.type === 'point' ? sGis.feature.Point : sGis.feature.MultiPoint;
                        if (geometry.type === 'multipoint') points = points[0];
                        feature = new featureClass(points, {id: id, attributes: attributes, crs: crs, symbol: symbol});
                    }
                }

                if (feature && response.attributesDefinitions && object.attributesDefinition) {
                    feature.displayField = response.attributesDefinitions[object.attributesDefinition]._display;
                    feature.visualDefinitionId = object.visualDefinitionId;
                    feature.generatorId = object.generatorId;
                    features.push(feature);
                }
            }
        }

        return features;
    }

    function parseColor(color) {
        var c = new sGis.utils.Color(color);
        return c.toString();
    }

    xmlSerializer.deserialize = function(xml) {
        var parser = new DOMParser(),
            nodes = parser.parseFromString(xml, 'text/xml'),
            parsed = {};

        serialize(nodes, parsed);

        return parsed;
    };

    function serialize(nodes, parsed, reference) {
        for (var i in nodes.childNodes) {
            var tagName = nodes.childNodes[i].tagName;
            if (serializer[tagName]) {
                serializer[tagName](nodes.childNodes[i], parsed, reference);
            }
        }
    }

    var serializer = {
        State: function(node, parsed) {
            var names = {
                Id: 'id',
                Name: 'name',
                Status: 'status'
            };

            parsed.operation = {};
            for (var i in node.attributes) {
                var att = node.attributes[i];
                if (typeof att === 'object') parsed.operation[names[att.name]] = att.nodeValue;
            }

            serialize(node, parsed);
        },

        Content: function(node, parsed) {
            var attributes = getNodeAttributes(node);
            if (attributes.ContentType === 'Visuals') {
                parsed.content = {};
                serialize(node, parsed.content);
            } else if (attributes.ContentType === 'JSON') {
                parsed.content = sGis.utils.parseXmlJsonNode(node);
            } else if (attributes.ContentType === 'Text') {
                parsed.content = node.innerHTML || node.textContent;
            }
        },

        Data: function(node, parsed) {
            serialize(node, parsed);
        },

        SerializerSettings: function(node, parsed) {
            var attributes = getNodeAttributes(node);

            if (attributes.Type === 'Geometric' && attributes.GeometryVersion === '2') {
                parsed.geometryType = 'json';
            }
        },

        Resources: function(node, parsed) {
            serialize(node, parsed);
        },

        AttributesDefinition: function(node, parsed) {
            var attributesDefinition = {},
                names = {
                    Name: 'name',
                    Alias: 'alias',
                    Type: 'type',
                    Size: 'size',
                    Editable: 'isEditable'
                };

            var parameters = getNodeAttributes(node);
            attributesDefinition._identity = parameters.Identity;
            attributesDefinition._display = parameters.Display;

            for (var i in node.childNodes) {
                var attributeInfo = node.childNodes[i];
                if (!attributeInfo.attributes) continue;

                var fields = {};

                for (var j in attributeInfo.attributes) {
                    var att = attributeInfo.attributes[j];
                    if (typeof att === 'object') fields[names[att.name]] = att.nodeValue;
                }
                attributesDefinition[fields.name] = fields;

                if (attributeInfo.childNodes.length > 0 && attributeInfo.childNodes[0].nodeName === 'Domain') {
                    attributesDefinition[fields.name].domain = getDomainDescription(attributeInfo);
                }
            }

            for (var i in node.attributes) {
                if (node.attributes[i].name === 'Key') {
                    var key = node.attributes[i].nodeValue;
                }
            }

            if (!key) debugger;

            if (!parsed.attributesDefinitions) parsed.attributesDefinitions = {};

            parsed.attributesDefinitions[key] = attributesDefinition;
        },

        SolidBrush: function(node, parsed) {
            if (!parsed.brush) parsed.brush = {};

            var attributes = getNodeAttributes(node);
            parsed.brush[attributes.Key] = {color: attributes.Color};
        },

        ByteArray: function(node, parsed) {
            if (!parsed.image) parsed.image = {};
            var attributes = getNodeAttributes(node);
            parsed.image[attributes.Key] = {dataUrl: 'data:image/png;base64,' + node.childNodes[0].nodeValue};
        },

        HatchBrush: function(node, parsed) {
            if (!parsed.brush) parsed.brush = {};
            var attributes = getNodeAttributes(node),
                brushString = atob(node.childNodes[0].nodeValue),
                brushArray = [];

            for (var i = 0, l = brushString.length; i < l; i++) {
                brushArray[i] = brushString.charCodeAt(i);
            }

            var width = brushArray[0] + (brushArray[1] * 2 << 7) + (brushArray[2] * 2 << 15) + (brushArray[3] * 2 << 23),
                height = brushArray[4] + (brushArray[5] * 2 << 7) + (brushArray[6] * 2 << 15) + (brushArray[7] * 2 << 23),
                brush = [];

            for (var i = 0; i < height; i++) {
                brush[i] = brushArray.slice(8 + i * width, 8 + (i + 1) * width);
            }

            parsed.brush[attributes.Key] = {
                background: attributes.Background,
                foreground: attributes.Foreground,
                brush: brush
            };
        },

        SimplePolygonSymbol: function(node, parsed) {
            if (!parsed.symbol) parsed.symbol = {};

            var attributes = getNodeAttributes(node);
            parsed.symbol[attributes.Key] = {
                symbol: 'SimplePolygonSymbol',
                strokeThickness: attributes.StrokeThickness,
                opacity: attributes.Opacity,
                fill: parsed.brush[attributes.Fill] ? parsed.brush[attributes.Fill].color || parsed.brush[attributes.Fill] : undefined,
                stroke: parsed.brush[attributes.Stroke] ? parsed.brush[attributes.Stroke].color || 'FF000000' : undefined
            };
        },

        SimplePolylineSymbol: function(node, parsed) {
            if (!parsed.symbol) parsed.symbol = {};

            var attributes = getNodeAttributes(node);
            parsed.symbol[attributes.Key] = {
                symbol: 'SimplePolylineSymbol',
                strokeThickness: attributes.StrokeThickness,
                opacity: attributes.Opacity,
                stroke: parsed.brush[attributes.Stroke].color
            };
        },

        SimplePointSymbol: function(node, parsed) {
            if (!parsed.symbol) parsed.symbol = {};

            var attributes = getNodeAttributes(node);
            parsed.symbol[attributes.Key] = {
                symbol: 'SimplePointSymbol',
                size: attributes.Size === '0' ? 10 : attributes.Size,
                strokeThickness: attributes.StrokeThickness,
                fill: parsed.brush[attributes.Fill].color,
                stroke: parsed.brush[attributes.Stroke] ? parsed.brush[attributes.Stroke].color : 'transparent',
                shape: attributes.Shape
            };
        },

        ImagePointSymbol: function(node, parsed) {
            if (!parsed.symbol) parsed.symbol = {};

            var attributes = getNodeAttributes(node);
            
            const maskSrc = parsed.image[attributes.MaskPixels];
            
            parsed.symbol[attributes.Key] = {
                symbol: 'ImagePointSymbol',
                size: attributes.Size === '0' ? 10 : attributes.Size,
                color: attributes.Color,
                anchorPoint: {x: attributes.AnchorPointX, y: attributes.AnchorPointY},
                imageSrc: parsed.image[attributes.Pixels].dataUrl,
                maskSrc: maskSrc && maskSrc.dataUrl
            };
        },

        VisualObjects: function(node, parsed) {
            if (!parsed.objects) {
                parsed.objects = {};
                parsed.orderedIds = [];
            }
            serialize(node, parsed);
        },

        Geometric: function(node, parsed) {
            var nodeAttributes = getNodeAttributes(node);
            parsed.objects[nodeAttributes.Id] = {
                generatorId: nodeAttributes.GeneratorId,
                visualDefinitionId: nodeAttributes.VisualDefinitionId,
                visualDefinition: parsed.symbol && parsed.symbol[nodeAttributes.VisualDefinition] ? parsed.symbol[nodeAttributes.VisualDefinition] : null,
                attributesDefinition: nodeAttributes.AttributesDefinition
            };

            parsed.orderedIds.push(nodeAttributes.Id);

            serialize(node, parsed, parsed.objects[nodeAttributes.Id]);
        },

        Attributes: function(node, parsed, parentObject) {
            serialize(node, parsed, parentObject);
        },

        Attribute: function(node, parsed, parentObject) {
            var nodeAttributes = getNodeAttributes(node);
            if (!parentObject.attributes) parentObject.attributes = {};

            if (!parsed.attributesDefinitions[parentObject.attributesDefinition]) debugger;

            var attributeDefinition = parsed.attributesDefinitions[parentObject.attributesDefinition][nodeAttributes.Name];
            if (!attributeDefinition) return;

            let value;
            if (attributeDefinition.type === 'System.DateTime' && nodeAttributes.Value) {
                value = new Date(parseInt(nodeAttributes.Value));
                if (isNaN(value.getTime())) value = null;
            } else {
                value = nodeAttributes.Value;
            }

            parentObject.attributes[nodeAttributes.Name] = {
                title: attributeDefinition.alias || nodeAttributes.Name,
                value: value,
                type: attributeDefinition.type,
                size: attributeDefinition.size || 0,
                domain: attributeDefinition.domain,
                isEditable: attributeDefinition.isEditable === 'True'
            };
        },

        Geometry: function(node, parsed, parentObject) {
            if (parsed.geometryType === 'json') {
                var attributes = getNodeAttributes(node),
                    jsonData = sGis.utils.parseXmlJsonNode(node),
                    coordinates = jsonData.type === 'point' ? [jsonData.x, jsonData.y] : jsonData.v;
                parentObject.geometry = {type: attributes.Type, data: {type: jsonData.type, crs: jsonData.sr, coordinates: coordinates}};
            }
        },

        VisualDefinitions: function(node, parsed) {
            if (!parsed.visualDefinitions) parsed.visualDefinitions = {};
            serialize(node, parsed);
        },

        VisualDefinition: function(node, parsed) {
            var attributes = getNodeAttributes(node);
            parsed.visualDefinitions[attributes.Key] = attributes.Id;
        }
    };

    function getNodeAttributes(node) {
        var keys = Object.keys(node.attributes),
            attributes = {};
        for (var i in keys) {
            if (typeof node.attributes[keys[i]] === 'object') attributes[node.attributes[keys[i]].name] = node.attributes[keys[i]].nodeValue;
        }
        return attributes;
    }

    function getDomainDescription(node) {
        var domainNode = node.childNodes[0];
        var attributes = getNodeAttributes(domainNode);

        var desc = {
            name: attributes.Name,
            type: attributes.Type,
            options: []
        };
        for (var i = 0; i < domainNode.childNodes.length; i++) {
            var option = getNodeAttributes(domainNode.childNodes[i]);
            desc.options.push({
                name: option.Name,
                type: option.Type,
                code: option.Code
            });
        }

        return desc;
    }

    /*
     * SERIALIZER
     */

    if (!sGis.sp) sGis.sp = {};
    let tempId = -1;

    sGis.sp.serializeGeometry = function(features) {
        var formatedData = getFormatedData(features);
        return getXML(formatedData);
    };

    xmlSerializer.serializeGeometryEdit = function(editDescription, attributesOnly, ignoreSymbol) {
        tempId = -1;
        var featureList = [];
        for (var i in editDescription) {
            if (sGis.utils.isArray(editDescription[i]) && i !== 'deleted') featureList = featureList.concat(editDescription[i]);
        }

        var formatedData = getFormatedData(featureList, attributesOnly);
        return addTitle(getXML(formatedData, editDescription, attributesOnly, ignoreSymbol));
    };

    function addTitle(xml) {
        return '<?xml version="1.0" encoding="utf-8"?>' + xml;
    }

    sGis.sp.serializeSymbols = function(symbols) {
        var features = [];
        for (var i = 0, len = symbols.length; i < len; i++) {
            features.push(new featureClasses[symbols[i].type]([], { symbol: symbols[i] }));
        }

        var formatedData = getFormatedData(features);
        var xml = getNewXMLDocument(),
            dataNode = xml.getElementsByTagName('Data')[0];

        dataNode.appendChild(getSerializerGeometricSettingsNode(xml));
        dataNode.appendChild(getResourcesNode(formatedData, xml));
        dataNode.appendChild(getVisualDefinitionsNode(formatedData, xml));

        var text = new XMLSerializer().serializeToString(xml);
        return text;
    };

    sGis.sp.serializeAttributes = function(attributes) {
        var data = {
            resources: {
                attributesDefinitions: {},
                lastKey: -1
            },
            visualObjects: []
        };

        for (var i in attributes) {
            if (attributes.hasOwnProperty(i)) {
                var attributesIndex = getAttributesDefinitionIndex(attributes[i], data.resources);
                data.visualObjects[i] = {attributesIndex: attributesIndex, feature: {id: i, attributes: attributes[i]}};
            }
        }

        return getXML(data);
    };

    var featureClasses = {
        point: sGis.feature.Point,
        polyline: sGis.feature.Polyline,
        polygon: sGis.feature.Polygon
    };

    function getXML(data, editDescription, attributesOnly, ignoreSymbol) {
        var xml = getNewXMLDocument(),
            dataNode = xml.getElementsByTagName('Data')[0];

        dataNode.appendChild(getSerializerGeometricSettingsNode(xml));
        dataNode.appendChild(getSerializerCalloutSettingsNode(xml));
        dataNode.appendChild(getResourcesNode(data, xml, attributesOnly, ignoreSymbol));
        dataNode.appendChild(getVisualObjectsNode(data, xml, attributesOnly, ignoreSymbol));
        if (editDescription) dataNode.appendChild(getEditCommandsNode(editDescription, xml, attributesOnly));

        var text = new XMLSerializer().serializeToString(xml);
        return text;
    }

    function getNewXMLDocument() {
        var parser = new DOMParser();

        return parser.parseFromString('<Data />', 'text/xml');
    }

    function getEditCommandsNode(editDescription, xml, attributesOnly) {
        var node = xml.createElement('EditCommands');
        if (sGis.utils.isArray(editDescription.added)) {
            for (var i in editDescription.added) {
                node.appendChild(getAddObjectNode(editDescription.added[i], xml));
            }
        }
        if (sGis.utils.isArray(editDescription.updated)) {
            for (var i in editDescription.updated) {
                node.appendChild(getUpdateObjectNode(editDescription.updated[i], xml, attributesOnly));
            }
        }
        if (sGis.utils.isArray(editDescription.deleted)) {
            for (var i in editDescription.deleted) {
                node.appendChild(getDeleteObjectNode(editDescription.deleted[i], xml));
            }
        }
        return node;
    }

    function getAddObjectNode(feature, xml) {
        var node = xml.createElement('AddObject');
        setNodeAttributes(node, {
            Id: feature.id
        });
        return node;
    }

    function getUpdateObjectNode(feature, xml, attributesOnly) {
        var node = xml.createElement('UpdateObject');
        setNodeAttributes(node, {
            Id: feature.id,
            OnlyAttributes: attributesOnly || "False"
        });
        return node;
    }

    function getDeleteObjectNode(id, xml) {
        var node = xml.createElement('DeleteObject');
        setNodeAttributes(node, {
            Id: id
        });
        return node;
    }

    function getSerializerGeometricSettingsNode(xml) {
        var node = xml.createElement('SerializerSettings');
        setNodeAttributes(node, {
            Type: 'Geometric',
            //Version: '0',
            GeometryVersion: '2'
        });

        return node;
    }

    function getSerializerCalloutSettingsNode(xml) {
        var node = xml.createElement('SerializerSettings');
        setNodeAttributes(node, {
            Type: 'Callout',
            Version: '0',
            GeometryVersion: '2'
        });

        return node;
    }

    function getResourcesNode(data, xml, attributesOnly, ignoreSymbol) {
        var node = xml.createElement('Resources');
        for (var i in data.resources.attributesDefinitions) {
            node.appendChild(getAttributesDefinitionNode(data.resources.attributesDefinitions[i], i, xml));
        }

        if (!attributesOnly && !ignoreSymbol) {
            for (var i in data.resources.brushes) {
                node.appendChild(getBrushNode(data.resources.brushes[i], i, xml));
            }

            for (var i in data.resources.images) {
                node.appendChild(getByteArrayNode(data.resources.images[i], i, xml));
            }

            for (var i in data.resources.symbols) {
                node.appendChild(getSymbolNode(data.resources.symbols[i], i, xml));
            }
        }

        return node;
    }

    function getAttributesDefinitionNode(attributeDefinition, key, xml) {
        var node = xml.createElement('AttributesDefinition');

        for (var i in attributeDefinition) {
            if (attributeDefinition[i].type === 'Strategis.Server.SpatialProcessor.Core.ObjectId') {
                var identity = i;
            }
        }

        var attributes = {Key: key, Display: 'Name'};
        if (identity) attributes.Identity = identity;

        setNodeAttributes(node, attributes);

        for (var i in attributeDefinition) {
            node.appendChild(getAttributeInfoNode(attributeDefinition[i], i, xml));
        }

        return node;
    }

    function getAttributeInfoNode(attribute, name, xml) {
        var node = xml.createElement('AttributeInfo');
        setNodeAttributes(node, {
            Name: name,
            Alias: attribute.title,
            Type: attribute.type,
            Size: attribute.size
        });

        if (attribute.domain) {
            node.appendChild(getDomainNode(attribute.domain, xml));
        }

        return node;
    }

    function getDomainNode(domain, xml) {
        var node = xml.createElement('Domain');
        setNodeAttributes(node, {
            Name: domain.name,
            Type: domain.type
        });

        for (var i = 0; i < domain.options.length; i++) {
            node.appendChild(getDomainValueNode(domain.options[i], xml));
        }

        return node;
    }

    function getDomainValueNode(option, xml) {
        var node = xml.createElement('DomainValue');
        setNodeAttributes(node, {
            Name: option.name,
            Type: option.type,
            Code: option.code
        });

        return node;
    }

    function getBrushNode(brush, key, xml) {
        if (brush instanceof Object) {
            return getHatchBrushNode(brush, key, xml);
        } else {
            return getSolidBrushNode(brush, key, xml);
        }
    }

    function getHatchBrushNode(brush, key, xml) {
        var node = xml.createElement('HatchBrush');
        setNodeAttributes(node, {
            Key: key,
            Background: colorToHex(brush.background),
            Foreground: colorToHex(brush.foreground)
        });

        var value = xml.createTextNode(brush.brushString);
        node.appendChild(value);

        return node;
    }

    function getSolidBrushNode(brush, key, xml) {
        var node = xml.createElement('SolidBrush');
        setNodeAttributes(node, {
            Key: key,
            Color: colorToHex(brush)
        });

        return node;
    }

    function getByteArrayNode(image, key, xml) {
        var node = xml.createElement('ByteArray'),
            text = image.match(/data.*,(.*)/)[1],
            textNode = xml.createTextNode(text);
        setNodeAttributes(node, {
            Key: key
        });
        node.appendChild(textNode);
        return node;
    }

    function getSymbolNode(symbol, key, xml) {
        var node = xml.createElement(symbol.type),
            attributes = {
                Key: key,
                StrokeThickness: symbol.StrokeThickness,
                Opacity: symbol.Opacity,
                Fill: symbol.Fill,
                Stroke: symbol.Stroke,
                AnchorPointX: symbol.AnchorPointX,
                AnchorPointY: symbol.AnchorPointY,
                Pixels: symbol.Pixels,
                Color: symbol.Color,
                Size: symbol.Size,
                Shape: symbol.Shape
            };

        setNodeAttributes(node, attributes);

        return node;
    }

    function getVisualDefinitionsNode(data, xml) {
        var node = xml.createElement('VisualDefinitions');
        for (var i in data.resources.symbols) {
            node.appendChild(getVisualDefinitionNode(i, xml));
        }

        return node;
    }

    function getVisualDefinitionNode(key, xml) {
        var node = xml.createElement('VisualDefinition');
        setNodeAttributes(node, {
            Key: key,
            Id: sGis.utils.getGuid()
        });

        return node;
    }

    function getVisualObjectsNode(data, xml, attributesOnly, ignoreSymbol) {
        var node = xml.createElement('VisualObjects');
        for (var i in data.visualObjects) {
            if (data.visualObjects.hasOwnProperty(i)) {
                node.appendChild(getGeometricNode(data.visualObjects[i], xml, attributesOnly, ignoreSymbol));
            }
        }

        return node;
    }

    function getGeometricNode(visualObject, xml, attributesOnly, ignoreSymbol) {
        var node = xml.createElement('Geometric');

        if (visualObject.feature.id === undefined) visualObject.feature.id = tempId--;

        var nodeAttributes = {
            Id: visualObject.feature.id,
            AttributesDefinition: visualObject.attributesIndex
        };

        if (!attributesOnly && !ignoreSymbol) {
            nodeAttributes.VisualDefinition = visualObject.symbolIndex;
            nodeAttributes.VisualDefinitionId = visualObject.feature.visualDefinitionId ? visualObject.feature.visualDefinitionId : visualObject.feature.visualDefinitionId === undefined ? undefined : '00000000-0000-0000-0000-000000000000';
            nodeAttributes.GeneratorId = visualObject.feature.generatorId ? visualObject.feature.generatorId : visualObject.feature.generatorId === undefined ? undefined : '00000000-0000-0000-0000-000000000000';
        }

        setNodeAttributes(node, nodeAttributes);
        node.appendChild(getAttributesNode(visualObject, xml));
        if (!attributesOnly) {
            node.appendChild(getGeometryNode(visualObject.feature, xml));
        }

        return node;
    }

    function getGeometryNode(feature, xml) {
        var node = xml.createElement('Geometry');
        var type = getGeometryType(feature);
        setNodeAttributes(node, {Type: type});

        var geometryJSON = {
            type: getCoordinatesType(feature),
            sr: feature.crs.toString()
        };

        if (feature instanceof sGis.feature.Point) {
            geometryJSON.x = feature.x;
            geometryJSON.y = feature.y;
        } else if (feature instanceof sGis.feature.MultiPoint) {
            geometryJSON.v = [feature.coordinates];
        } else {
            geometryJSON.v = feature.rings;
        }

        var text = JSON.stringify(geometryJSON),
            textNode = xml.createTextNode(text);
        node.appendChild(textNode);
        return node;
    }

    function getGeometryType(feature) {
        if (feature instanceof sGis.feature.MultiPoint) return 'MultiPoint';
        if (feature instanceof sGis.feature.Point) return 'Point';
        if (feature instanceof sGis.feature.Polyline) return 'Line';
        if (feature instanceof sGis.feature.Polygon) return 'Poly';
    }

    function getCoordinatesType(feature) {
        if (feature instanceof sGis.feature.MultiPoint) return 'multipoint';
        if (feature instanceof sGis.feature.Point) return 'point';
        if (feature instanceof sGis.feature.Polyline) return 'polyline';
        if (feature instanceof sGis.feature.Polygon) return 'polygon';
    }

    function getAttributesNode(visualObject, xml) {
        var node = xml.createElement('Attributes');
        for (var i in visualObject.feature.attributes) {
            node.appendChild(getAttributeNode(visualObject.feature.attributes[i], i, xml));
        }

        return node;
    }

    function getAttributeNode(attribute, name, xml) {
        var node = xml.createElement('Attribute'),
            attributes = {Name: name};

        if (attribute.value instanceof Date) {
            attributes.Value = attribute.value.getTime();
        } else if (attribute.value !== undefined) {
            attributes.Value = attribute.value;
        }


        setNodeAttributes(node, attributes);

        return node;
    }

    function setNodeAttributes(node, attributes) {
        for (var i in attributes) {
            if (attributes[i] !== "" && attributes[i] !== undefined) node.setAttribute(i, attributes[i]);
        }
    }

    function getFormatedData(features, attributesOnly) {
        var data = {
            resources: {
                attributesDefinitions: {},
                brushes: {},
                images: {},
                symbols: {},
                lastKey: -1
            },
            visualObjects: []
        };
        for (var i in features) {
            var feature = features[i];
            var attributesIndex = getAttributesDefinitionIndex(feature.attributes, data.resources);

            if (!attributesOnly && features[i].symbol) {
                var symbolIndex = getSymbolIndex(feature, data.resources);
            }

            data.visualObjects[i] = {
                feature: feature,
                attributesIndex: attributesIndex,
                symbolIndex: symbolIndex
            };
        }

        return data;
    }

    function getSymbolIndex(feature, resources) {
        var newSymbol;
        var symbol = feature.originalSymbol;

        if (feature.type === 'point') {
            if ((symbol instanceof sGis.symbol.point.Image)) {
                newSymbol = {
                    Pixels: getImageIndex(symbol.source, resources),
                    AnchorPointX: symbol.anchorPoint.x,
                    AnchorPointY: symbol.anchorPoint.y,
                    Size: symbol.size,
                    Color: '#7f64c800',
                    MaskPixels: '-1',
                    type: 'ImagePointSymbol'
                };
            } else if (symbol instanceof sGis.symbol.point.Point) {
                newSymbol = {
                    Opacity: 1,
                    Size: symbol.size,
                    Fill: getBrushIndex(symbol.color, resources),
                    Stroke: getBrushIndex(symbol.strokeColor, resources),
                    StrokeThickness: symbol.strokeWidth,
                    Shape: 'Circle',
                    type: symbolTypes[feature.type]
                };
            } else {
                newSymbol = {
                    Opacity: 1,
                    Size: symbol.size,
                    Fill: getBrushIndex(symbol.fillColor, resources),
                    Stroke: getBrushIndex(symbol.strokeColor, resources),
                    StrokeThickness: symbol.strokeWidth,
                    Shpae: 'Square',
                    type: symbolTypes[feature.type]
                };
            }
        } else if (symbol instanceof sGis.symbol.polygon.BrushFill) {
            newSymbol = {
                StrokeThickness: symbol.strokeWidth,
                Opacity: 1,
                Fill: getHatchBrushIndex(symbol, resources),
                Stroke: getBrushIndex(symbol.strokeColor, resources),
                type: symbolTypes[feature.type]
            };
        } else if (symbol instanceof sGis.symbol.polyline.Simple) {
            newSymbol = {
                StrokeThickness: symbol.strokeWidth ? symbol.strokeWidth : 1,
                Opacity: 1,
                Stroke: getBrushIndex(symbol.strokeColor, resources),
                type: symbolTypes[feature.type]
            };
        } else {
            newSymbol = {
                StrokeThickness: symbol.strokeWidth ? symbol.strokeWidth : 1,
                Opacity: 1,
                Fill: getBrushIndex(symbol.fillColor ? symbol.fillColor : feature.strokeColor, resources),
                Stroke: getBrushIndex(symbol.strokeColor, resources),
                type: symbolTypes[feature.type]
            };
        }

        for (var i in resources.symbols) {
            var symbol = resources.symbols[i],
                same = true;

            for (var j in symbol) {
                if (symbol[j] !== newSymbol[j]) same = false;
            }
            if (same) return i;
        }

        resources.lastKey++;
        resources.symbols[resources.lastKey] = newSymbol;
        return resources.lastKey;
    }

    function getHatchBrushIndex(style, resources) {
        var brushString = getBrushString(style.fillBrush);

        for (var i in resources.brushes) {
            if (resources.brushes[i] instanceof Object && resources.brushes[i].brushString === brushString && resources.brushes[i].background === style.fillBackground && resources.brushes[i].foreground === style.fillForeground) {
                return i;
            }
        }

        resources.lastKey++;
        resources.brushes[resources.lastKey] = {
            brushString: brushString,
            background: style.fillBackground,
            foreground: style.fillForeground
        };
        return resources.lastKey;
    }

    function getBrushString(brush) {
        var height = brush.length,
            width = brush[0].length,
            heightStr = byteArrayToString(intToArray(height)),
            widthStr = byteArrayToString(intToArray(width)),
            brushString = heightStr + widthStr;

        for (var i = 0; i < height; i++) {
            brushString += byteArrayToString(brush[i]);
        }
        return btoa(brushString);
    }

    function byteArrayToString(array) {
        var string = '';
        for (var i = 0, l = array.length; i < l; i++) {
            string += String.fromCharCode(array[i]);
        }
        return string;
    }

    function intToArray(int) {
        var arr = [];

        for (var i = 0; i < 4; i++) {
            arr[i] = (int / Math.pow(2, i * 8) | 0) % ((2 << 7 + 8 * i) || 1);
        }

        return arr;
    }

    function getBrushIndex(color, resources) {
        for (var i in resources.brushes) {
            if (resources.brushes[i] === color) return i;
        }

        resources.lastKey++;
        resources.brushes[resources.lastKey] = color;
        if (color === undefined) debugger;
        return resources.lastKey;
    }

    function getImageIndex(imageSrc, resources) {
        for (var i = 0, l = resources.images.length; i < l; i++) {
            if (resources.images[i] === imageSrc) return i;
        }

        resources.lastKey++;
        resources.images[resources.lastKey] = imageSrc;
        return resources.lastKey;
    }

    function getAttributesDefinitionIndex(attributes, resources) {
        var attributesDefinitions = resources.attributesDefinitions;
        for (var i in attributesDefinitions) {
            var same = true;
            for (var j in attributes) {
                if (!attributes.type || !attributes.title || !attributes.size) continue;
                if (attributes[j].title !== attributesDefinitions[i][j].title ||
                    attributes[j].type !== attributesDefinitions[i][j].type) same = false;
            }

            if (same) {
                return i;
            }
        }

        resources.lastKey++;
        attributesDefinitions[resources.lastKey] = attributes;
        return resources.lastKey;
    }

    var symbolTypes = {
        point: 'SimplePointSymbol',
        polyline: 'SimplePolylineSymbol',
        polygon: 'SimplePolygonSymbol'
    };

    function colorToHex(color) {
        var c = new sGis.utils.Color(color);
        return c.toString('hex');
    }

    return xmlSerializer;

});

sGis.module('sp.services.DataSourceService', [
    'EventHandler',
    'sp.controllers.TempView',
    'sp.services.ServiceContainer'
], (EventHandler, TempView, ServiceContainer) => {

    'use strict';

    class DataSourceService extends EventHandler {
        constructor(name, connector, serviceInfo) {
            super();

            this._name = name;
            this._connector = connector;
            this._serviceInfo = serviceInfo;

            this._initialize();
        }

        _initialize() {
            this._tempViewController = new TempView(this._connector, this.name);
            this._initializationPromise = this._tempViewController.resetView({ sourceServiceName: this._name }).then(() => {
                this._setForwardListeners();
                this.view.isDisplayed = this._isDisplayed;
                this.fire('stateUpdate');
            });
        }

        get initializationPromise() { return this._initializationPromise; }

        get name() { return this._name; }
        get alias() { return this.serviceInfo && this.serviceInfo.alias; }
        get description() { return this.serviceInfo && this.serviceInfo.description; }
        get view() { return this._tempViewController.service; }

        get isDisplayed() { return this.view ? this.view.isDisplayed : this._isDisplayed; }
        set isDisplayed(bool) {
            if (this.view) {
                this.view.isDisplayed = bool;
            } else {
                this._isDisplayed = bool;
            }
        }

        _setForwardListeners() {
            this._tempViewController.service.on('visibilityChange legendUpdate layerChange', this.forwardEvent.bind(this));
        }

        get crs() { return this.view && this.view.crs; }
        get layer() { return this.view && this.view.layer; }
        get hasLegend() { return this.view && this.view.hasLegend; }
        updateLegend() { this.view && this.view.updateLegend(); }
        get attributesDefinition() { return this.view && this.view.attributesDefinition; }

        setMeta() { return this.view && this.view.setMeta.apply(this.view, arguments); }
        getMeta() { return this.view && this.view.getMeta.apply(this.view, arguments); }

        get geometryType() { return this.view && this.view.geometryType; }

        get fullExtent() { return this.view && this.view.fullExtent; }
        get initialExtent() { return this.view && this.view.initialExtent; }

        get serviceInfo() { return this._serviceInfo; }
        get isEditable() { return this.permissions.indexOf('Write') !== -1; }
        get isFilterable() { return this.view && this.view.isFilterable; }

        get filter() { return this.view && this.view.filter; }
        set filter(filter) { this.view.filter = filter; }

        setCustomFilter() { return this.view.setCustomFilter.apply(this.view, arguments); }

        updateExtent() { return this.view && this.view.updateExtent(); }

        get localName() { return this.view && this.view.name; }

        get permissions() { return this.serviceInfo.permissions; }
    }

    DataSourceService.prototype._isDisplayed = true;

    //ServiceContainer.register(serviceInfo => serviceInfo.serviceType === 'DataSourceService', DataSourceService);

    return DataSourceService;

});
sGis.module('sp.services.DataViewService', [
    'sp.utils',
    'sp.services.MapService',
    'sp.ClusterLayer',
    'sp.services.ServiceContainer',
    'sp.DataFilter',
    'sp.layers.DataViewLayer'
], (utils, MapService, ClusterLayer, ServiceContainer, DataFilter, DataViewLayer) => {

    'use strict';

    class DataViewService extends MapService {
        constructor(name, connector, serviceInfo) {
            super(name, connector, serviceInfo);
            if (serviceInfo.dataFilter) this._dataFilter = this._originalFilter = DataFilter.deserialize(serviceInfo.dataFilter);
            this._setLayer();
            if (connector.sessionId) this.subscribeForNotifications()
        }

        kill() {
            if (this.connector.sessionId) this.unsubscribeFromNotifications();
            if (this.tempFilterApplied) this.setDataFilter(null, false);
        }

        _setLayer() {
            this._layer = new DataViewLayer(this);
        }

        get dataSource() {
            return this._serviceInfo.dataSourceServiceName;
        }
        
        get dataSourceInfo() {
            return this._serviceInfo.sourceServiceInfo;
        }
        
        get isEditable() {
            return this.serviceInfo.isEditable;
        }
        get isFilterable() { return this.serviceInfo.capabilities && this.serviceInfo.capabilities.indexOf('setTempDataFilter') !== -1; }

        get dataFilter() { return this._dataFilter || this._originalFilter; }
        get tempFilterApplied() { return this._dataFilter && this._dataFilter !== this._originalFilter; }

        setDataFilter(filter, updateLegend = true) {
            this._dataFilter = filter;

            let data = filter ? 'filterDescription=' + encodeURIComponent(JSON.stringify(filter.serialize())) : '';
            let promise = utils.ajaxp({
                url: `${this.url}setTempDataFilter?_sb=${this.connector.sessionId}`,
                type: 'POST',
                data: data
            });

            if (updateLegend) promise.then(() => this.updateLegend());

            this.fire('dataFilterChange');

            return promise;
        }
        
        get customFilter() { return this._customFilter; }

        get filter() { return this.customFilter || this.serviceInfo.filter; }
        set filter(filter) {
            this.setCustomFilter(filter);
        }

        /**
         * @deprecated
         */
        setCustomFilter(filter) {
            this._dataFilter = null;
            this._customFilter = filter;
            return utils.ajaxp({
                url: `${this.url}setTempDataFilter?_sb=${this.connector.sessionId}`,
                type: 'POST',
                data: 'filterDescription=' + encodeURIComponent(JSON.stringify(filter))
            }).then(() => this.updateLegend());
        }
        
        get allowsClustering() { return true; }
        
        get showAsClusters() { return this._showAsClusters; }
        set showAsClusters(bool) {
            bool = !!bool;
            if (bool === this._showAsClusters) return;
            
            this.clusterLayer.isDisplayed = this.dynamicLayer.isDisplayed = this._isDisplayed;
            this._showAsClusters = bool;
            this.fire('layerChange', { prevLayer: bool ? this.dynamicLayer : this.clusterLayer });
        }
        
        get clusterLayer() {
            if (!this._clusterLayer) this._setClusterLayer();
            return this._clusterLayer;
        }
        
        get layer() { return this._showAsClusters ? this.clusterLayer : this.dynamicLayer; }
        get dynamicLayer() { return this._layer; }
        
        _setClusterLayer() {
            this._clusterLayer = new ClusterLayer(this.url, this.connector.sessionId);
        }
    }
    
    DataViewService.prototype._showAsClusters = false;

    ServiceContainer.register(serviceInfo => serviceInfo.serviceType === 'DataView' && serviceInfo.capabilities.indexOf('tile') === -1 || serviceInfo.serviceType === 'DataSourceService', DataViewService);

    return DataViewService;

});
sGis.module('sp.services.MapService', [
    'utils',
    'CRS',
    'EventHandler',
    'Bbox'
], (utils, CRS, EventHandler, Bbox) => {

    'use strict';

    class MapService extends EventHandler {
        constructor(name, connector, serviceInfo) {
            super();
            this._connector = connector;
            this._meta = {};
            this._name = name;
            this.serviceInfo = serviceInfo;
        }

        subscribeForNotifications() {
            utils.ajaxp({url: this.url + 'subscribe?_sb=' + this._connector.sessionId})
                .then(() => {
                    this._connector.addNotificationListner('dynamic layer', this._name, this._redraw.bind(this));
                    this._connector.addNotificationListner('symbols', this._name, this.updateLegend.bind(this));
                });
        }

        unsubscribeFromNotifications() {
            utils.ajaxp({ url: `${this.url}subscribe?_sb=${this._connector.sessionId}`})
                .then(() => {
                    this._connector.removeNotificationListner('dynamic layer', this._name, this._redraw.bind(this));
                    this._connector.removeNotificationListner('symbols', this._name, this.updateLegend.bind(this));
                });
        }

        _redraw() {
            if (this._layer) {
                this._layer.forceUpdate();
                this._layer.redraw();
            }
        }

        get url() {
            return this._connector.url + this._name + '/';
        }

        get serviceInfo() { return this._serviceInfo; }
        set serviceInfo(val) {
            this._crs = MapService.parseCrs(val.spatialReference);
            this._serviceInfo = val;
        }

        get crs() { return this._crs; }
        get layer() { return this._layer; }
        get connector() { return this._connector; }
        get name() { return this._name; }
        get alias() { return this.serviceInfo && this.serviceInfo.alias; }
        get description() { return this.serviceInfo && this.serviceInfo.description; }

        get isDisplayed() { return this._isDisplayed; }
        set isDisplayed(bool) {
            if (this._isDisplayed !== bool) {
                this._isDisplayed = bool;
                if (this.layer) this.layer.isDisplayed = bool;
                this.fire('visibilityChange');
            }
        }

        get hasLegend() { return this.serviceInfo && this.serviceInfo.capabilities && this.serviceInfo.capabilities.indexOf('legend') >= 0; }

        updateLegend() {
            if (this.hasLegend) return this._requestLegend().then(legend => {
                try {
                    this.legend = utils.parseJSON(legend[0]);
                } catch (e) {
                    this.legend = [];
                }
                this.fire('legendUpdate');
            });

            return new Promise((resolve, reject) => {
                reject("The service does not support legend rendering.");
            });
        }

        _requestLegend() {
            return utils.ajaxp({ url: this.url + 'legend' + (this._connector.sessionId ? '?_sb=' + this._connector.sessionId : '') });
        }

        get attributesDefinition() {
            return this.serviceInfo && this.serviceInfo.attributesDefinition;
        }
        
        setMeta(key, value) {
            this._meta[key] = value;
        }
        
        getMeta(key) {
            return this._meta[key];
        }
        
        get meta() { return this._meta; }
        set meta(meta) { this._meta = meta; }

        get geometryType() { return this.serviceInfo.geometryType; }

        get permissions() { return this.serviceInfo.permissions; }
        
        static parseCrs(desc) {
            if (desc && crsMapping[desc]) {
                return crsMapping[desc];
            } else if (desc && desc.wkid && crsMapping[desc.wkid]) {
                return crsMapping[desc.wkid];
            } else if (desc && desc.wkid === 0) {
                return null;
            } else {
                return new sGis.Crs(desc);
            }
        }

        get fullExtent() {
            if (this._fullExtent) return this._fullExtent;

            if (!this.serviceInfo.fullExtent || this.serviceInfo.fullExtent.xmin === this.serviceInfo.fullExtent.xmax) return null;
            return new Bbox([this.serviceInfo.fullExtent.xmin, this.serviceInfo.fullExtent.ymin], [this.serviceInfo.fullExtent.xmax, this.serviceInfo.fullExtent.ymax], this.crs);
        }

        get initialExtent() {
            if (!this.serviceInfo.initialExtent || this.serviceInfo.initialExtent.xmin === this.serviceInfo.initialExtent.xmax) return null;
            return new Bbox([this.serviceInfo.initialExtent.xmin, this.serviceInfo.initialExtent.ymin], [this.serviceInfo.initialExtent.xmax, this.serviceInfo.initialExtent.ymax], this.crs);
        }

        updateExtent() {
            if (this.serviceInfo.capabilities.indexOf('extent') >= 0) {
                return utils.ajaxp({ url: this.url + 'extent' + (this._connector.sessionId ? '?_sb=' + this._connector.sessionId : '') })
                    .then(response => {
                        try {
                            let ext = JSON.parse(response[0]);
                            if (ext.XMin !== undefined && ext.XMin !== ext.XMax) {
                                this._fullExtent = new Bbox([ext.XMin, ext.YMin], [ext.XMax, ext.YMax], this.crs);
                            } else {
                                this._fullExtent = null;
                            }
                        } catch (e) {}
                    });
            }

            return new Promise(resolve => resolve());
        }

        get initializationPromise() { return null; }
    }

    MapService.prototype._isDisplayed = true;
    
    let crsMapping = {
        '102100': CRS.webMercator,
        '102113': CRS.webMercator,
        '3857': CRS.webMercator,
        '3395': CRS.ellipticalMercator,
        '84': CRS.wgs84,
        '4326': CRS.geo
    };

    return MapService;

});
sGis.module('sp.services.ServiceContainer', [
    'FeatureLayer',
    'EventHandler',
    'utils',
    'sp.utils',
], (FeatureLayer, EventHandler, utils) => {

    'use strict';

    let serviceTypeRegistry = [];

    class ServiceContainer extends EventHandler {
        constructor(connector, serviceName, {serviceInfo, service, isDisplayed=true}={}) {
            super();

            this._connector = connector;
            this._name = serviceName;
            this._emptyLayer = new FeatureLayer();
            this._emptyLayer.isDisplayed = isDisplayed;

            if (service) {
                this._initWithService(service);
            } else {
                this._init(serviceInfo);
            }
        }

        get url() { return this._connector.url + this._name; }
        get name() { return this._name; }

        get localName() { return this._service && this._service.localName; }

        _initWithService(service) {
            this._service = service;
            this._setListeners(service);
        }

        _setListeners(service) {
            service.on('visibilityChange childUpdate layerChange', this._fireUpdate.bind(this));
            service.on('stateUpdate contentChange', this.forwardEvent.bind(this));
        }

        _init(serviceInfo) {
            let promise = serviceInfo ? Promise.resolve(serviceInfo) : this._loadServiceInfo();

            promise.then(serviceInfo => {
                    serviceInfo.name = name;

                    if (serviceInfo.error) throw new Error(serviceInfo.error.message);
                    return this._createService(serviceInfo);
                })
                .catch(error => {
                    this._failInitialization(error.message || 'Unknown error');
                })
                .then(() => {
                    this.fire('stateUpdate');
                });
        }

        _loadServiceInfo() {
            const url = this.url + '/' + (this._connector.sessionId ? '?_sb=' + this._connector.sessionId : '');

            return this._connector.initializationPromise.then(utils.ajaxp.bind(utils, {url}))
                .then(([response]) => {
                    return utils.parseJSON(response);
                });
        }

        _failInitialization(error) {
            console.error(error);
            this._error = error;
            this.fire('stateUpdate');
        }

        _createService(serviceInfo) {
            for (let i = 0; i < serviceTypeRegistry.length; i++) {
                if (serviceTypeRegistry[i].condition(serviceInfo)) {
                    this._service = new serviceTypeRegistry[i].constructor(this._name, this._connector, serviceInfo);
                    this._setListeners(this._service);
                    if (this._service.layer) {
                        this._service.layer.opacity = this._emptyLayer.opacity;
                        this._service.layer.resolutionLimits = this._emptyLayer.resolutionLimits;
                        this._service.isDisplayed = this._emptyLayer.isDisplayed;
                    }
                    return this._service.initializationPromise;
                }
            }

            this._failInitialization('Unknown service configuration');
        }

        _fireUpdate() {
            this.fire('stateUpdate');
        }

        get error() { return this._error; }
        get service() { return this._service; }

        static register(condition, constructor) {
            serviceTypeRegistry.push({ condition, constructor });
        }

        get layer() { return this._service && this._service.layer || this._emptyLayer; }
    }

    return ServiceContainer;

});
sGis.module('sp.services.ServiceGroup', [
    'sp.ServiceGroup',
    'sp.services.ServiceContainer'
], (ServiceGroup, ServiceContainer) => {
    'use strict';

    class ServiceGroupService extends ServiceGroup {
        constructor(name, connector, serviceInfo) {
            let children = serviceInfo.childrenInfo
                .map(info => new ServiceContainer(connector, info.name, {
                    serviceInfo: info,
                    isDisplayed: serviceInfo.contents.find(({name})=>name === info.name).isVisible
                }));
            super(name, { children, alias: serviceInfo.alias });

            this._serviceInfo = serviceInfo;

            this._initializationPromise = new Promise((resolve, reject) => {
                setTimeout(() => {
                    this._updateChildLayers();
                    resolve();
                }, 0);
            });
        }

        get serviceInfo() { return this._serviceInfo; }

        get initializationPromise() {
            return this._initializationPromise;
        }

        get permissions() { return this.serviceInfo.permissions; }
    }

    ServiceContainer.register(serviceInfo => serviceInfo.serviceType === 'LayerGroup', ServiceGroupService);

    return ServiceGroupService;

});
sGis.module('sp.services.StaticSourceService', [
    'sp.utils',
    'sp.services.ServiceContainer',
    'EventHandler'
], (utils, ServiceContainer, EventHandler) => {

    'use strict';

    class StaticSourceService extends EventHandler {
        constructor(name, connector, serviceInfo) {
            super();

            this._seviceInfo = serviceInfo;
            this._connector = connector;
            this._name = name;
            this._url = `${this._connector.url + this._name}/`;
        }

        get url(){
           return this._url
        }
    
        /**
         * Get url path to file by filename
         * @param {string} fileName
         * @return {string}
         */
        getSourceUrl(fileName) {
            if(!fileName){
                utils.error('Invalid parameters');
            }
            
            return `${this.url}download/${fileName}?${this._connector.sessionSuffix}`
        }

        upload(fileName, file){

            if(!fileName || !file){
                utils.error('Invalid parameters');
            }

            var data = new FormData();
            data.append('file', file);

            let self = this;
            return utils.ajaxp({

                url: `${this._url}upload?fileName=${fileName}${this._connector.sessionSuffix}`,
                type: 'POST',
                data: data,
                contentType: 'super-binary',
            }).then(response => {
                let respObject = JSON.parse(response[0]);
                if (respObject.success){
                    return `${ self._url}download/${fileName}${self._connector.sessionSuffix}`;
                } else if(respObject.error){
                    utils.error(respObject.error.message);
                } else {
                    utils.error(response[0]);
                }
            }).catch(error=>{
                utils.error(error)
            });
        }

        delete(fileName){

            if(!fileName){
               utils.error("File name not set");
            }

            return utils.ajaxp({url:`${this._url}delete?fileName=${fileName}${this._connector.sessionSuffix}`}).then(response=>{
                let respObject = JSON.parse(response[0]);
                if(respObject.success){
                    return respObject.success
                } else if(respObject.error){
                    utils.error(respObject.error.message);
                } else {
                    utils.error(response[0]);
                }
            }).catch(error=>{
                utils.error(error)
            });
        }

        describe({ fileName = null, startFrom = null, take = null, orderBy = null}){

            let params = Object.assign(arguments[0], {_sb: this._connector.sessionId});
            let paramsString = Object.keys(params).filter(key => params[key] !== null && params[key] !== undefined).map(key => `${key}=${encodeURIComponent(params[key])}`).join('&');

            return utils.ajaxp({

                 url:`${this._url}describe?${paramsString ? this._url + paramsString : this._url}`

                }).then(response => {
                        let respObject = JSON.parse(response[0]);

                        if(respObject.filesInfo){
                            return respObject.filesInfo;
                        } else if(respObject.error){
                            utils.error(respObject.error.message);
                        } else {
                            utils.error(response[0]);
                        }
                });
        }
    }

    ServiceContainer.register(serviceInfo => serviceInfo.serviceType == 'StaticStorage', StaticSourceService);

    return StaticSourceService

})
sGis.module('sp.services.TileService', [
    'sp.services.MapService',
    'TileLayer',
    'TileScheme',
    'sp.services.ServiceContainer'
], (MapService, TileLayer, TileScheme, ServiceContainer) => {

    'use strict';

    class TileService extends MapService {
        constructor(name, connector, serviceInfo) {
            super(name, connector, serviceInfo);
            this._setLayer();
        }
        
        _setLayer() {
            if (this.serviceInfo.tileInfo) {
                var tileScheme = getTileScheme(this.serviceInfo.tileInfo, this.crs);
            }

            this._tileScheme = tileScheme;
            this._layer = new TileLayer(this._getUrl(), { tileScheme: tileScheme, crs: this.crs, isDisplayed: this.isDisplayed });
        }

        get tileScheme() { return this._tileScheme; }

        _getUrl() {
            if (this.serviceInfo.sourceUrl) {
                return this.serviceInfo.sourceUrl.replace(/^https?:/, '');
            } else {
                return this.url + 'tile/{z}/{y}/{x}' + (this.connector.sessionId ? '?_sb=' + this.connector.sessionId : '');
            }
        }
    }

    function getTileScheme(tileInfo, crs) {
        let scheme = {
            tileWidth: tileInfo.rows,
            tileHeight: tileInfo.cols,
            dpi: tileInfo.dpi,
            origin: [tileInfo.origin.x, tileInfo.origin.y],
            reversedY: tileInfo.reversedY,
            levels: []
        };

        if (tileInfo.boundingRectangle) {
            let {MinX, MinY, MaxX, MaxY} = tileInfo.boundingRectangle;
            if (MinX !== MaxX && MinY !== MaxY) scheme.limits = [MinX, MinY, MaxX, MaxY];
        }

        let projection = sGis.CRS.wgs84.projectionTo(crs);
        if (projection && scheme.tileWidth) {
            let point1 = new sGis.Point([0, -180]).projectTo(crs);
            let point2 = new sGis.Point([0, 180]).projectTo(crs);
            var fullWidth = point2.x - point1.x;
        }
        for (let i = 0, len = tileInfo.lods.length; i < len; i++) {
            let resolution = tileInfo.lods[i].resolution;
            scheme.levels[i] = {
                resolution: resolution,
                scale: tileInfo.lods[i].scale,
                indexCount: Math.round(fullWidth / resolution / scheme.tileWidth),
                zIndex: tileInfo.lods[i].level
            };
        }

        return new TileScheme(scheme);
    }

    ServiceContainer.register(serviceInfo => serviceInfo.serviceType === 'DataView' && serviceInfo.capabilities.indexOf('tile') !== -1, TileService);

    return TileService;

});