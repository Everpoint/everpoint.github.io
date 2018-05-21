define(["require", "exports", "./controls/PolyControl", "./Map", "./controls/Circle", "./controls/Editor", "./features/MultiPoint", "./controls/PointControl", "./controls/PointEditor", "./features/Poly", "./controls/PolyDrag", "./controls/PolyEditor", "./features/Polyline", "./controls/PolylineControl", "./controls/PolygonControl", "./controls/PolyTransform", "./controls/Rectangle", "./Crs", "./layers/DynamicLayer", "./EventHandler", "./features/Feature", "./features/PointFeature", "./features/Polygon", "./layers/FeatureLayer", "./layers/Layer", "./LayerGroup", "./painters/DomPainter/DomPainter", "./painters/DomPainter/Container", "./painters/DomPainter/EventDispatcher", "./painters/DomPainter/SvgRender", "./painters/DomPainter/LayerRenderer", "./painters/DomPainter/Canvas", "./Point", "./renders/Arc", "./renders/Point", "./renders/Poly", "./symbols/Symbol", "./symbols/point/StaticImageSymbol", "./symbols/point/MaskedImage", "./symbols/point/Point", "./symbols/point/Square", "./symbols/polygon/BrushFill", "./symbols/polygon/ImageFill", "./symbols/polygon/Simple", "./symbols/PolylineSymbol", "./layers/TileLayer", "./TileScheme", "./utils/utils", "./utils/Color", "./utils/math", "./geotools", "./serializers/symbolSerializer", "./utils/domEvent", "./symbols/EditorSymbol", "./controls/snapping/CombinedSnappingProvider", "./features/Label", "./features/Balloon", "./symbols/label/DynamicLabelSymbol", "./symbols/label/StaticLabelSymbol", "./symbols/BalloonSymbol", "./controls/BalloonControl", "./Bbox", "./controls/Control", "./init"], function (require, exports, PolyControl_1, Map_1, Circle_1, Editor_1, MultiPoint_1, PointControl_1, PointEditor_1, Poly_1, PolyDrag_1, PolyEditor_1, Polyline_1, PolylineControl_1, PolygonControl_1, PolyTransform_1, Rectangle_1, CrsModule, DynamicLayer_1, EventHandler_1, Feature_1, PointFeature_1, Polygon_1, FeatureLayer_1, Layer_1, LayerGroup_1, DomPainter_1, Container_1, EventDispatcher_1, SvgRender_1, LayerRenderer_1, Canvas_1, Point_1, Arc_1, Point_2, Poly_2, Symbol_1, StaticImageSymbol_1, MaskedImage_1, Point_3, Square_1, BrushFill_1, ImageFill_1, Simple_1, PolylineSymbol_1, TileLayer_1, TileScheme_1, utilsModule, Color_1, mathModule, geotoolsModule, symbolSerializer, eventModule, EditorSymbol_1, CombinedSnappingProvider_1, Label_1, Balloon_1, DynamicLabelSymbol_1, StaticLabelSymbol_1, BalloonSymbol_1, BalloonControl_1, Bbox_1, Control_1, init_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Map = Map_1.Map;
    exports.DynamicLayer = DynamicLayer_1.DynamicLayer;
    exports.EventHandler = EventHandler_1.EventHandler;
    exports.Feature = Feature_1.Feature;
    exports.FeatureLayer = FeatureLayer_1.FeatureLayer;
    exports.Layer = Layer_1.Layer;
    exports.LayerGroup = LayerGroup_1.LayerGroup;
    exports.Point = Point_1.Point;
    exports.Symbol = Symbol_1.Symbol;
    exports.TileLayer = TileLayer_1.TileLayer;
    exports.TileScheme = TileScheme_1.TileScheme;
    exports.math = mathModule;
    exports.geotools = geotoolsModule;
    exports.event = eventModule;
    exports.Bbox = Bbox_1.Bbox;
    exports.Control = Control_1.Control;
    exports.version = "0.4.0";
    exports.releaseDate = "21.05.2018";
    let utilsModulesExt = {};
    Object.assign(utilsModulesExt, utilsModule, { Color: Color_1.Color });
    exports.controls = {
        Circle: Circle_1.Circle,
        Editor: Editor_1.Editor,
        MultiPoint: MultiPoint_1.MultiPoint,
        Point: PointControl_1.PointControl,
        PointEditor: PointEditor_1.PointEditor,
        Poly: PolyControl_1.PolyControl,
        PolyDrag: PolyDrag_1.PolyDrag,
        PolyEditor: PolyEditor_1.PolyEditor,
        Polyline: PolylineControl_1.PolylineControl,
        Polygon: PolygonControl_1.PolygonControl,
        PolyTransform: PolyTransform_1.PolyTransform,
        Rectangle: Rectangle_1.Rectangle,
        snapping: {
            CombinedSnappingProvider: CombinedSnappingProvider_1.CombinedSnappingProvider
        },
        BalloonControl: BalloonControl_1.BalloonControl
    };
    exports.Crs = CrsModule.Crs;
    exports.CRS = CrsModule;
    exports.feature = {
        MultiPoint: MultiPoint_1.MultiPoint,
        Point: PointFeature_1.PointFeature,
        Poly: Poly_1.Poly,
        Polygon: Polygon_1.Polygon,
        Polyline: Polyline_1.Polyline,
        Label: Label_1.LabelFeature,
        Balloon: Balloon_1.Balloon
    };
    exports.painter = {
        DomPainter: DomPainter_1.DomPainter,
        domPainter: {
            Container: Container_1.Container,
            EventDispatcher: EventDispatcher_1.EventDispatcher,
            SvgRender: SvgRender_1.SvgRender,
            LayerRenderer: LayerRenderer_1.LayerRenderer,
            Canvas: Canvas_1.Canvas
        }
    };
    exports.render = {
        Arc: Arc_1.Arc,
        HtmlElement: HTMLElement,
        Point: Point_2.Point,
        Polygon: Poly_2.PolyRender
    };
    exports.symbol = {
        point: {
            Image: StaticImageSymbol_1.StaticImageSymbol,
            MaskedImage: MaskedImage_1.MaskedImage,
            Point: Point_3.PointSymbol,
            Square: Square_1.SquareSymbol
        },
        polygon: {
            BrushFill: BrushFill_1.BrushFill,
            ImageFill: ImageFill_1.ImageFill,
            Simple: Simple_1.PolygonSymbol
        },
        polyline: { Simple: PolylineSymbol_1.PolylineSymbol },
        Editor: EditorSymbol_1.EditorSymbol,
        label: {
            DynamicLabelSymbol: DynamicLabelSymbol_1.DynamicLabelSymbol,
            StaticLabelSymbol: StaticLabelSymbol_1.StaticLabelSymbol
        },
        Balloon: BalloonSymbol_1.BalloonSymbol
    };
    exports.utils = utilsModulesExt;
    exports.serializer = {
        symbolSerializer: symbolSerializer
    };
    exports.init = init_1.init;
});
