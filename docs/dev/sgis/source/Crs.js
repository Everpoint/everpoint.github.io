define(["require", "exports", "./utils/math"], function (require, exports, math) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let identityProjection = ([x, y]) => [x, y];
    /**
     * @alias sGis.Crs
     */
    class Crs {
        /**
         * @constructor
         * @param description - properties describing crs. If given, the values will be set to the corresponding fields of the crs instance.
         * @param projectionMap - set of projections to different coordinate systems. If not specified, .setProjectionTo() method
         *                        must be used in order to enable projecting to a needed crs.
         */
        constructor(description, projectionMap) {
            this._projections = new Map();
            this._discoveryMode = false;
            if (description)
                Object.assign(this, description);
            if (projectionMap)
                this._projections = projectionMap;
        }
        /**
         * Returns string definition of the crs.<br>
         *     If .wkid is set, returning value will be wkid string;<br>
         *     Else if .wkt is set, returning value will be wkt;<br>
         *     Otherwise .details property will be returned.
         */
        toString() {
            if (this.wkid)
                return this.wkid.toString();
            if (this.wkt)
                return this.wkt;
            return this.details || 'Unknown crs';
        }
        /**
         * Returns true if given crs represents the same spatial reference system. The objects are compared by wkid or by wkt text.
         * In case neither is specified, true will be returned only if both this and 'crs' represent same JS object.
         */
        equals(crs) {
            if (this === crs)
                return true;
            if (this.wkid && this.wkid === crs.wkid)
                return true;
            return !!this.wkt && this.wkt === crs.wkt;
        }
        /**
         * Returns projection function from the current coordinate system to the specified one. If it is possible to
         * project current crs to the target through another crs, returning function will apply this route.<br>
         * E.g. if trying to project from WebMercator to EllipticalMercator, the returned Projection function will
         * first project from WebMercator to Lat/Lon, and then project the result to EllipticalMercator.
         */
        projectionTo(crs) {
            return this._projections.get(crs) || this._discoverProjectionTo(crs);
        }
        /**
         * Returns true if the current coordinate system can be projected to the given crs. Projections through other coordinate
         * systems are also considered if discovered.
         */
        canProjectTo(crs) {
            return this.projectionTo(crs) !== null;
        }
        /**
         * Sets the projection function from current crs to the given one.
         */
        setProjectionTo(crs, projection) {
            this._projections.set(crs, projection);
        }
        _discoverProjectionTo(crs) {
            if (this._discoveryMode)
                return null;
            if (this.equals(crs))
                return identityProjection;
            this._discoveryMode = true;
            for (let [ownCrs, func] of this._projections) {
                if (ownCrs.equals(crs)) {
                    this._projections.set(crs, func);
                    break;
                }
                const innerProjection = ownCrs._discoverProjectionTo(crs);
                if (innerProjection) {
                    let result = function ([x, y]) {
                        return innerProjection(func([x, y]));
                    };
                    this._projections.set(crs, result);
                    break;
                }
            }
            this._discoveryMode = false;
            return this._projections.get(crs) || null;
        }
    }
    exports.Crs = Crs;
    /**
     * Plain euclidean coordinate system. This projection cannot be projected to any other projection.
     * @alias sGis.CRS.plain
     */
    exports.plain = new Crs({ details: 'Plain crs without any projection functions' });
    const OCG84_WKT = 'GEOGCS["GCS_WGS_1984",DATUM["D_WGS_1984",SPHEROID["WGS_1984",6378137,298.257223563]],' +
        'PRIMEM["Greenwich",0],UNIT["Degree",0.017453292519943295]]';
    /**
     * Geographic coordinate system on WGS84 datum, which has longitude set as first coordinate, and latitude as second coordinate.<br>
     * <b>NOTE:</b> A lot of GIS software incorrectly implement EPSG:4326 as this longitude/latitude coordinate system. If you
     * are used to using such systems as OpenLayers or PostGIS, you want to use this crs instead of 4326 in those system.
     * @alias sGis.CRS.wgs84
     */
    exports.wgs84 = new Crs({
        wkid: 84,
        authority: 'OCG',
        wkt: OCG84_WKT
    });
    const EPSG4326_WKT = `GEODCRS["WGS 84",
  DATUM["World Geodetic System 1984",
    ELLIPSOID["WGS 84",6378137,298.257223563,LENGTHUNIT["metre",1.0]]],
  CS[ellipsoidal,2],
    AXIS["latitude",north,ORDER[1]],
    AXIS["longitude",east,ORDER[2]],
    ANGLEUNIT["degree",0.01745329252],
  ID["EPSG",4326]]`;
    /**
     * Geographic coordinate system on WGS84 datum with latitude being first coordinate, and longitude as second coordinate.<br>
     * <b>NOTE:</b> This coordinate system is registered by EPSG as EPSG:4326, but a lot of GIS software implements 4326 as
     * longitude/latitude. If you are used to that coordinate order use wgs84 crs instead of this one.
     * @alias sGis.CRS.geo
     */
    exports.geo = new Crs({
        wkid: 4326,
        authority: 'EPSG',
        wkt: EPSG4326_WKT
    });
    exports.geo.setProjectionTo(exports.wgs84, ([x, y]) => [y, x]);
    exports.wgs84.setProjectionTo(exports.geo, ([x, y]) => [y, x]);
    const EPSG3857_WKT = 'PROJCS["WGS 84 / Pseudo-Mercator",GEOGCS["GCS_WGS_1984",' +
        'DATUM["D_WGS_1984",SPHEROID["WGS_1984",6378137,298.257223563]],PRIMEM["Greenwich",0],' +
        'UNIT["Degree",0.017453292519943295]],PROJECTION["Mercator"],PARAMETER["central_meridian",0],' +
        'PARAMETER["scale_factor",1],PARAMETER["false_easting",0],PARAMETER["false_northing",0],UNIT["Meter",1]]';
    /**
     * Coordinate system used by many gis web applications. The coordinates are given in meters, as projected by Mercator projection
     * using WGS84 datum assuming that the Earth is a sphere. Has high distortions near the poles.
     * @alias sGis.CRS.webMercator
     */
    exports.webMercator = new Crs({
        wkid: 3857,
        authority: 'EPSG',
        wkt: EPSG3857_WKT
    });
    {
        const a = 6378137;
        exports.webMercator.setProjectionTo(exports.wgs84, ([x, y]) => {
            let rLat = Math.PI / 2 - 2 * Math.atan(Math.exp(-y / a));
            let rLong = x / a;
            let lon = math.radToDeg(rLong);
            let lat = math.radToDeg(rLat);
            return [lon, lat];
        });
        exports.wgs84.setProjectionTo(exports.webMercator, ([x, y]) => {
            let rLon = math.degToRad(x);
            let rLat = math.degToRad(y);
            let X = a * rLon;
            let Y = a * Math.log(Math.tan(Math.PI / 4 + rLat / 2));
            return [X, Y];
        });
    }
    const EPSG3395_WKT = 'PROJCS["WGS 84 / World Mercator",GEOGCS["GCS_WGS_1984",DATUM["D_WGS_1984",' +
        'SPHEROID["WGS_1984",6378137,298.257223563]],PRIMEM["Greenwich",0],UNIT["Degree",0.017453292519943295]],' +
        'PROJECTION["Mercator"],PARAMETER["central_meridian",0],PARAMETER["scale_factor",1],' +
        'PARAMETER["false_easting",0],PARAMETER["false_northing",0],UNIT["Meter",1]]';
    /**
     * Mercator projection from WGS84 datum. This crs considers the fact that the Earth is not a sphere. Coordinates are in meters.
     * @alias sGis.CRS.ellipticalMercator
     */
    exports.ellipticalMercator = new Crs({
        wkid: 3395,
        authority: 'EPSG',
        wkt: EPSG3395_WKT
    });
    {
        const a = 6378137;
        const b = 6356752.3142451793;
        const e = Math.sqrt(1 - b * b / a / a);
        const eh = e / 2;
        const pih = Math.PI / 2;
        exports.ellipticalMercator.setProjectionTo(exports.wgs84, ([x, y]) => {
            let ts = Math.exp(-y / a);
            let phi = pih - 2 * Math.atan(ts);
            let i = 0;
            let dphi = 1;
            while (Math.abs(dphi) > 0.000000001 && i++ < 15) {
                let con = e * Math.sin(phi);
                dphi = pih - 2 * Math.atan(ts * Math.pow((1 - con) / (1 + con), eh)) - phi;
                phi += dphi;
            }
            let rLong = x / a, rLat = phi, lon = math.radToDeg(rLong), lat = math.radToDeg(rLat);
            return [lon, lat];
        });
        exports.wgs84.setProjectionTo(exports.ellipticalMercator, ([x, y]) => {
            let rLat = math.degToRad(y);
            let rLon = math.degToRad(x);
            let X = a * rLon;
            let Y = a * Math.log(Math.tan(Math.PI / 4 + rLat / 2) * Math.pow((1 - e * Math.sin(rLat)) / (1 + e * Math.sin(rLat)), (e / 2)));
            return [X, Y];
        });
    }
    //http://mathworld.wolfram.com/AlbersEqual-AreaConicProjection.html
    /**
     * Class constructor of <a href="https://en.wikipedia.org/wiki/Albers_projection">Alber's equal area projections</a> from wgs84 datum.
     * @alias sGis.CRS.AlbersEqualArea
     */
    class AlbersEqualArea extends Crs {
        /**
         * @param lat0 - latitude of origin
         * @param lon0 - longitude of origin
         * @param stLat1 - first standard parallel
         * @param stLat2 - second standard parallel
         */
        constructor(lat0, lon0, stLat1, stLat2) {
            super({
                details: 'Albers Equal-Area Conic Projection: ' + lat0 + ',' + lon0 + ',' + stLat1 + ',' + stLat2
            });
            this.R = 6372795;
            let _lat0 = math.degToRad(lat0);
            let _lon0 = math.degToRad(lon0);
            let _stLat1 = math.degToRad(stLat1);
            let _stLat2 = math.degToRad(stLat2);
            let _n = (Math.sin(_stLat1) + Math.sin(_stLat2)) / 2;
            let _c = Math.pow(Math.cos(_stLat1), 2) + 2 * _n * Math.sin(_stLat1);
            let _ro0 = Math.sqrt(_c - 2 * _n * Math.sin(_lat0)) / _n;
            this.setProjectionTo(exports.wgs84, ([x, y]) => {
                let xRad = x / this.R;
                let yRad = y / this.R;
                let th = Math.atan(xRad / (_ro0 - yRad));
                let ro = xRad / Math.sin(th);
                let rLat = Math.asin((_c - ro * ro * _n * _n) / 2 / _n);
                let rLon = _lon0 + th / _n;
                let lat = math.radToDeg(rLat);
                let lon = math.radToDeg(rLon);
                return [lon, lat];
            });
            exports.wgs84.setProjectionTo(this, ([lon, lat]) => {
                let rLon = math.degToRad(lon), rLat = math.degToRad(lat), th = _n * (rLon - _lon0), ro = Math.sqrt(_c - 2 * _n * Math.sin(rLat)) / _n, x = ro * Math.sin(th) * this.R, y = (_ro0 - ro * Math.cos(th)) * this.R;
                return [x, y];
            });
        }
    }
    exports.AlbersEqualArea = AlbersEqualArea;
    /**
     * Alber's equal area projection with parameters 0, 180, 60, 50. Used internally for precise geographic area calculations.
     * @alias sGis.CRS.conicEqualArea
     */
    exports.conicEqualArea = new AlbersEqualArea(0, 180, 60, 50);
});
