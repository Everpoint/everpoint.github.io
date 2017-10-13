<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>JSDoc: Class: Arc</title>

    <script src="scripts/prettify/prettify.js"> </script>
    <script src="scripts/prettify/lang-css.js"> </script>
    <!--[if lt IE 9]>
      <script src="//html5shiv.googlecode.com/svn/trunk/html5.js"></script>
    <![endif]-->
    <link type="text/css" rel="stylesheet" href="styles/prettify-tomorrow.css">
    <link type="text/css" rel="stylesheet" href="styles/jsdoc-default.css">
</head>

<body>

<div id="main">

    <h1 class="page-title">Class: Arc</h1>

    




<section>

<header>
    
        <h2>
            <span class="ancestors"><a href="sGis.html">sGis</a><a href="sGis.render.html">.render</a>.</span>Arc</h2>
        
            <div class="class-description">Rendered arc (circle) on a map.</div>
        
    
</header>

<article>
    <div class="container-overview">
    
        

    
    <h2>Constructor</h2>
    

    <h4 class="name" id=".Arc"><span class="type-signature"></span>new Arc<span class="signature">(center, options<span class="signature-attributes">opt</span>)</span><span class="type-signature"></span></h4>

    











    <h5>Parameters:</h5>
    

<table class="params">
    <thead>
    <tr>
        
        <th>Name</th>
        

        <th>Type</th>

        
        <th>Attributes</th>
        

        

        <th class="last">Description</th>
    </tr>
    </thead>

    <tbody>
    

        <tr>
            
                <td class="name"><code>center</code></td>
            

            <td class="type">
            
                
<span class="param-type">Array.&lt;Number></span>


            
            </td>

            
                <td class="attributes">
                

                

                
                </td>
            

            

            <td class="description last">the center of the arc, in the [x, y] format.</td>
        </tr>

    

        <tr>
            
                <td class="name"><code>options</code></td>
            

            <td class="type">
            
                
<span class="param-type">Object</span>


            
            </td>

            
                <td class="attributes">
                
                    &lt;optional><br>
                

                

                
                </td>
            

            

            <td class="description last">key-value options of any Arc parameters</td>
        </tr>

    
    </tbody>
</table>






<dl class="details">

    

    

    

    

    

    

    

    

    

    

    

    

    
    <dt class="tag-source">Source:</dt>
    <dd class="tag-source"><ul class="dummy"><li>
        <a href="renders_Arc.js.html">renders/Arc.js</a>, <a href="renders_Arc.js.html#line83">line 83</a>
    </li></ul></dd>
    

    

    

    
</dl>
















    
    </div>

    

    

    

     

    

    
        <h3 class="subsection-title">Members</h3>

        
            
<h4 class="name" id="clockwise"><span class="type-signature"></span>clockwise<span class="type-signature"> :Boolean</span></h4>




<div class="description">
    Direction of the arc.
</div>



    <h5>Type:</h5>
    <ul>
        <li>
            
<span class="param-type">Boolean</span>


        </li>
    </ul>





<dl class="details">

    

    

    

    

    

    

    

    

    

    

    

    
    <dt class="tag-default">Default Value:</dt>
    <dd class="tag-default"><ul class="dummy">
            <li>true</li>
        </ul></dd>
    

    
    <dt class="tag-source">Source:</dt>
    <dd class="tag-source"><ul class="dummy"><li>
        <a href="renders_Arc.js.html">renders/Arc.js</a>, <a href="renders_Arc.js.html#line70">line 70</a>
    </li></ul></dd>
    

    

    

    
</dl>






        
            
<h4 class="name" id="endAngle"><span class="type-signature"></span>endAngle<span class="type-signature"> :Number</span></h4>




<div class="description">
    End angle of the sector.
</div>



    <h5>Type:</h5>
    <ul>
        <li>
            
<span class="param-type">Number</span>


        </li>
    </ul>





<dl class="details">

    

    

    

    

    

    

    

    

    

    

    

    
    <dt class="tag-default">Default Value:</dt>
    <dd class="tag-default"><ul class="dummy">
            <li>2 * Math.PI</li>
        </ul></dd>
    

    
    <dt class="tag-source">Source:</dt>
    <dd class="tag-source"><ul class="dummy"><li>
        <a href="renders_Arc.js.html">renders/Arc.js</a>, <a href="renders_Arc.js.html#line56">line 56</a>
    </li></ul></dd>
    

    

    

    
</dl>






        
            
<h4 class="name" id="fillColor"><span class="type-signature"></span>fillColor<span class="type-signature"> :String</span></h4>




<div class="description">
    The fill color of the arc. The value can be any valid css color string.
</div>



    <h5>Type:</h5>
    <ul>
        <li>
            
<span class="param-type">String</span>


        </li>
    </ul>





<dl class="details">

    

    

    

    

    

    

    

    

    

    

    

    
    <dt class="tag-default">Default Value:</dt>
    <dd class="tag-default"><ul class="dummy">
            <li>"transparent"</li>
        </ul></dd>
    

    
    <dt class="tag-source">Source:</dt>
    <dd class="tag-source"><ul class="dummy"><li>
        <a href="renders_Arc.js.html">renders/Arc.js</a>, <a href="renders_Arc.js.html#line35">line 35</a>
    </li></ul></dd>
    

    

    

    
</dl>






        
            
<h4 class="name" id="ignoreEvents"><span class="type-signature"></span>ignoreEvents<span class="type-signature"> :Boolean</span></h4>




<div class="description">
    Specifies whether this render can catch mouse events. If true, this render will be transparent for any pointer events.
</div>



    <h5>Type:</h5>
    <ul>
        <li>
            
<span class="param-type">Boolean</span>


        </li>
    </ul>





<dl class="details">

    

    

    

    

    

    

    

    

    

    

    

    
    <dt class="tag-default">Default Value:</dt>
    <dd class="tag-default"><ul class="dummy">
            <li>false</li>
        </ul></dd>
    

    
    <dt class="tag-source">Source:</dt>
    <dd class="tag-source"><ul class="dummy"><li>
        <a href="renders_Arc.js.html">renders/Arc.js</a>, <a href="renders_Arc.js.html#line42">line 42</a>
    </li></ul></dd>
    

    

    

    
</dl>






        
            
<h4 class="name" id="ignoreEvents"><span class="type-signature"></span>ignoreEvents<span class="type-signature"> :Boolean</span></h4>




<div class="description">
    Specifies whether this render can catch mouse events. If true, this render will be transparent for any pointer events.
</div>



    <h5>Type:</h5>
    <ul>
        <li>
            
<span class="param-type">Boolean</span>


        </li>
    </ul>





<dl class="details">

    

    

    

    

    

    

    

    

    

    

    

    
    <dt class="tag-default">Default Value:</dt>
    <dd class="tag-default"><ul class="dummy">
            <li>false</li>
        </ul></dd>
    

    
    <dt class="tag-source">Source:</dt>
    <dd class="tag-source"><ul class="dummy"><li>
        <a href="renders_Polyline.js.html">renders/Polyline.js</a>, <a href="renders_Polyline.js.html#line34">line 34</a>
    </li></ul></dd>
    

    

    

    
</dl>






        
            
<h4 class="name" id="ignoreEvents"><span class="type-signature"></span>ignoreEvents<span class="type-signature"> :Boolean</span></h4>




<div class="description">
    Specifies whether this render can catch mouse events. If true, this render will be transparent for any pointer events.
</div>



    <h5>Type:</h5>
    <ul>
        <li>
            
<span class="param-type">Boolean</span>


        </li>
    </ul>





<dl class="details">

    

    

    

    

    

    

    

    

    

    

    

    
    <dt class="tag-default">Default Value:</dt>
    <dd class="tag-default"><ul class="dummy">
            <li>false</li>
        </ul></dd>
    

    
    <dt class="tag-source">Source:</dt>
    <dd class="tag-source"><ul class="dummy"><li>
        <a href="renders_Polygon.js.html">renders/Polygon.js</a>, <a href="renders_Polygon.js.html#line61">line 61</a>
    </li></ul></dd>
    

    

    

    
</dl>






        
            
<h4 class="name" id="isSector"><span class="type-signature"></span>isSector<span class="type-signature"> :Boolean</span></h4>




<div class="description">
    Shows whether the arc is a sector of a circle rather then simple arc. Set to false if you need to draw a circle, for sector has all its boundaries outlined.
</div>



    <h5>Type:</h5>
    <ul>
        <li>
            
<span class="param-type">Boolean</span>


        </li>
    </ul>





<dl class="details">

    

    

    

    

    

    

    

    

    

    

    

    
    <dt class="tag-default">Default Value:</dt>
    <dd class="tag-default"><ul class="dummy">
            <li>false</li>
        </ul></dd>
    

    
    <dt class="tag-source">Source:</dt>
    <dd class="tag-source"><ul class="dummy"><li>
        <a href="renders_Arc.js.html">renders/Arc.js</a>, <a href="renders_Arc.js.html#line63">line 63</a>
    </li></ul></dd>
    

    

    

    
</dl>






        
            
<h4 class="name" id="radius"><span class="type-signature"></span>radius<span class="type-signature"> :Number</span></h4>




<div class="description">
    The radius of the arc
</div>



    <h5>Type:</h5>
    <ul>
        <li>
            
<span class="param-type">Number</span>


        </li>
    </ul>





<dl class="details">

    

    

    

    

    

    

    

    

    

    

    

    
    <dt class="tag-default">Default Value:</dt>
    <dd class="tag-default"><ul class="dummy">
            <li>5</li>
        </ul></dd>
    

    
    <dt class="tag-source">Source:</dt>
    <dd class="tag-source"><ul class="dummy"><li>
        <a href="renders_Arc.js.html">renders/Arc.js</a>, <a href="renders_Arc.js.html#line14">line 14</a>
    </li></ul></dd>
    

    

    

    
</dl>






        
            
<h4 class="name" id="startAngle"><span class="type-signature"></span>startAngle<span class="type-signature"> :Number</span></h4>




<div class="description">
    Start angle of the sector.
</div>



    <h5>Type:</h5>
    <ul>
        <li>
            
<span class="param-type">Number</span>


        </li>
    </ul>





<dl class="details">

    

    

    

    

    

    

    

    

    

    

    

    
    <dt class="tag-default">Default Value:</dt>
    <dd class="tag-default"><ul class="dummy">
            <li>0</li>
        </ul></dd>
    

    
    <dt class="tag-source">Source:</dt>
    <dd class="tag-source"><ul class="dummy"><li>
        <a href="renders_Arc.js.html">renders/Arc.js</a>, <a href="renders_Arc.js.html#line49">line 49</a>
    </li></ul></dd>
    

    

    

    
</dl>






        
            
<h4 class="name" id="strokeColor"><span class="type-signature"></span>strokeColor<span class="type-signature"> :String</span></h4>




<div class="description">
    The stroke color of the arc (outline color). The value can be any valid css color string.
</div>



    <h5>Type:</h5>
    <ul>
        <li>
            
<span class="param-type">String</span>


        </li>
    </ul>





<dl class="details">

    

    

    

    

    

    

    

    

    

    

    

    
    <dt class="tag-default">Default Value:</dt>
    <dd class="tag-default"><ul class="dummy">
            <li>"black"</li>
        </ul></dd>
    

    
    <dt class="tag-source">Source:</dt>
    <dd class="tag-source"><ul class="dummy"><li>
        <a href="renders_Arc.js.html">renders/Arc.js</a>, <a href="renders_Arc.js.html#line21">line 21</a>
    </li></ul></dd>
    

    

    

    
</dl>






        
            
<h4 class="name" id="strokeWidth"><span class="type-signature"></span>strokeWidth<span class="type-signature"> :Number</span></h4>




<div class="description">
    The stroke width of the arc.
</div>



    <h5>Type:</h5>
    <ul>
        <li>
            
<span class="param-type">Number</span>


        </li>
    </ul>





<dl class="details">

    

    

    

    

    

    

    

    

    

    

    

    
    <dt class="tag-default">Default Value:</dt>
    <dd class="tag-default"><ul class="dummy">
            <li>1</li>
        </ul></dd>
    

    
    <dt class="tag-source">Source:</dt>
    <dd class="tag-source"><ul class="dummy"><li>
        <a href="renders_Arc.js.html">renders/Arc.js</a>, <a href="renders_Arc.js.html#line28">line 28</a>
    </li></ul></dd>
    

    

    

    
</dl>






        
    

    
        <h3 class="subsection-title">Methods</h3>

        
            

    

    <h4 class="name" id="contains"><span class="type-signature"></span>contains<span class="signature">(position)</span><span class="type-signature"> &rarr; {boolean}</span></h4>

    



<div class="description">
    Returns true if 'position' is inside the rendered arc.
</div>









    <h5>Parameters:</h5>
    

<table class="params">
    <thead>
    <tr>
        
        <th>Name</th>
        

        <th>Type</th>

        

        

        <th class="last">Description</th>
    </tr>
    </thead>

    <tbody>
    

        <tr>
            
                <td class="name"><code>position</code></td>
            

            <td class="type">
            
                
<span class="param-type">Array.&lt;Number></span>


            
            </td>

            

            

            <td class="description last">position in the rendered (px) coordinates in [x,y] format.</td>
        </tr>

    
    </tbody>
</table>






<dl class="details">

    

    

    

    

    

    

    

    

    

    

    

    

    
    <dt class="tag-source">Source:</dt>
    <dd class="tag-source"><ul class="dummy"><li>
        <a href="renders_Arc.js.html">renders/Arc.js</a>, <a href="renders_Arc.js.html#line98">line 98</a>
    </li></ul></dd>
    

    

    

    
</dl>













<h5>Returns:</h5>

        


<dl>
    <dt>
        Type
    </dt>
    <dd>
        
<span class="param-type">boolean</span>


    </dd>
</dl>

    



        
    

    

    
</article>

</section>




</div>

<nav>
    <h2><a href="index.html">Home</a></h2><h3>Classes</h3><ul><li><a href="Polyline.html">Polyline</a></li><li><a href="sGis.Bbox.html">sGis.Bbox</a></li><li><a href="sGis.Control.html">sGis.Control</a></li><li><a href="sGis.control.Polyline.html">sGis.control.Polyline</a></li><li><a href="sGis.controls.Circle.html">sGis.controls.Circle</a></li><li><a href="sGis.controls.Point.html">sGis.controls.Point</a></li><li><a href="sGis.controls.Poly.html">sGis.controls.Poly</a></li><li><a href="sGis.controls.PolyDrag.html">sGis.controls.PolyDrag</a></li><li><a href="sGis.controls.Rectangle.html">sGis.controls.Rectangle</a></li><li><a href="sGis.Crs.html">sGis.Crs</a></li><li><a href="sGis.CRS.AlbersEqualArea.html">sGis.CRS.AlbersEqualArea</a></li><li><a href="sGis.DynamicLayer.html">sGis.DynamicLayer</a></li><li><a href="sGis.EventHandler.html">sGis.EventHandler</a></li><li><a href="sGis.Feature.html">sGis.Feature</a></li><li><a href="sGis.feature.Image.html">sGis.feature.Image</a></li><li><a href="sGis.feature.Label.html">sGis.feature.Label</a></li><li><a href="sGis.feature.Maptip.html">sGis.feature.Maptip</a></li><li><a href="sGis.feature.MultiPoint.html">sGis.feature.MultiPoint</a></li><li><a href="sGis.feature.Point.html">sGis.feature.Point</a></li><li><a href="sGis.feature.Poly.html">sGis.feature.Poly</a></li><li><a href="sGis.feature.Polygon.html">sGis.feature.Polygon</a></li><li><a href="sGis.feature.Polyline.html">sGis.feature.Polyline</a></li><li><a href="sGis.FeatureLayer.html">sGis.FeatureLayer</a></li><li><a href="sGis.Layer.html">sGis.Layer</a></li><li><a href="sGis.LayerGroup.html">sGis.LayerGroup</a></li><li><a href="sGis.Map.html">sGis.Map</a></li><li><a href="sGis.painter.DomPainter.html">sGis.painter.DomPainter</a></li><li><a href="sGis.Point.html">sGis.Point</a></li><li><a href="sGis.render.html#.Arc">sGis.render.Arc</a></li><li><a href="sGis.render.ImageRender.html">sGis.render.ImageRender</a></li><li><a href="sGis.render.Point.html">sGis.render.Point</a></li><li><a href="sGis.render.Polygon.html">sGis.render.Polygon</a></li><li><a href="sGis.renders.HtmlElement.html">sGis.renders.HtmlElement</a></li><li><a href="sGis.Symbol.html">sGis.Symbol</a></li><li><a href="sGis.symbol.Editor.html">sGis.symbol.Editor</a></li><li><a href="sGis.symbol.image.Image.html">sGis.symbol.image.Image</a></li><li><a href="sGis.symbol.label.Label.html">sGis.symbol.label.Label</a></li><li><a href="sGis.symbol.maptip.Simple.html">sGis.symbol.maptip.Simple</a></li><li><a href="sGis.symbol.point.Image.html">sGis.symbol.point.Image</a></li><li><a href="sGis.symbol.point.MaskedImage.html">sGis.symbol.point.MaskedImage</a></li><li><a href="sGis.symbol.point.Point.html">sGis.symbol.point.Point</a></li><li><a href="sGis.symbol.point.Square.html">sGis.symbol.point.Square</a></li><li><a href="sGis.symbol.polygon.BrushFill.html">sGis.symbol.polygon.BrushFill</a></li><li><a href="sGis.symbol.polygon.ImageFill.html">sGis.symbol.polygon.ImageFill</a></li><li><a href="sGis.symbol.polygon.Simple.html">sGis.symbol.polygon.Simple</a></li><li><a href="sGis.symbol.polyline.Simple.html">sGis.symbol.polyline.Simple</a></li><li><a href="sGis.TileLayer.html">sGis.TileLayer</a></li><li><a href="sGis.TileScheme.html">sGis.TileScheme</a></li><li><a href="sGis.utils.Color.html">sGis.utils.Color</a></li></ul><h3>Events</h3><ul><li><a href="sGis.control.Polyline.html#event:drawingBegin">sGis.control.Polyline#drawingBegin</a></li><li><a href="sGis.control.Polyline.html#event:drawingFinish">sGis.control.Polyline#drawingFinish</a></li><li><a href="sGis.control.Polyline.html#event:pointAdd">sGis.control.Polyline#pointAdd</a></li><li><a href="sGis.controls.Circle.html#event:drawingBegin">sGis.controls.Circle#drawingBegin</a></li><li><a href="sGis.controls.Circle.html#event:drawingFinish">sGis.controls.Circle#drawingFinish</a></li><li><a href="sGis.controls.Point.html#event:drawingFinish">sGis.controls.Point#drawingFinish</a></li><li><a href="sGis.controls.Poly.html#event:drawingBegin">sGis.controls.Poly#drawingBegin</a></li><li><a href="sGis.controls.Poly.html#event:drawingFinish">sGis.controls.Poly#drawingFinish</a></li><li><a href="sGis.controls.Poly.html#event:pointAdd">sGis.controls.Poly#pointAdd</a></li><li><a href="sGis.controls.PolyDrag.html#event:drawingBegin">sGis.controls.PolyDrag#drawingBegin</a></li><li><a href="sGis.controls.PolyDrag.html#event:drawingFinish">sGis.controls.PolyDrag#drawingFinish</a></li><li><a href="sGis.controls.Rectangle.html#event:drawingBegin">sGis.controls.Rectangle#drawingBegin</a></li><li><a href="sGis.controls.Rectangle.html#event:drawingFinish">sGis.controls.Rectangle#drawingFinish</a></li><li><a href="sGis.DynamicLayer.html#event:propertyChange">sGis.DynamicLayer#propertyChange</a></li><li><a href="sGis.FeatureLayer.html#event:featureAdd">sGis.FeatureLayer#featureAdd</a></li><li><a href="sGis.FeatureLayer.html#event:featureRemove">sGis.FeatureLayer#featureRemove</a></li><li><a href="sGis.Layer.html#event:propertyChange">sGis.Layer#propertyChange</a></li><li><a href="sGis.LayerGroup.html#event:layerAdd">sGis.LayerGroup#layerAdd</a></li><li><a href="sGis.LayerGroup.html#event:layerOrderChange">sGis.LayerGroup#layerOrderChange</a></li><li><a href="sGis.LayerGroup.html#event:layerRemove">sGis.LayerGroup#layerRemove</a></li><li><a href="sGis.Map.html#event:layerAdd">sGis.Map#layerAdd</a></li><li><a href="sGis.Map.html#event:layerOrderChange">sGis.Map#layerOrderChange</a></li><li><a href="sGis.Map.html#event:layerRemove">sGis.Map#layerRemove</a></li><li><a href="sGis.TileLayer.html#event:propertyChange">sGis.TileLayer#propertyChange</a></li></ul><h3>Namespaces</h3><ul><li><a href="sGis.html">sGis</a></li><li><a href="sGis.CRS_.html">sGis.CRS</a></li><li><a href="sGis.event.html">sGis.event</a></li><li><a href="sGis.feature_.html">sGis.feature</a></li><li><a href="sGis.math.html">sGis.math</a></li><li><a href="sGis.painter.domPainter_.html">sGis.painter.domPainter</a></li><li><a href="sGis.render.html">sGis.render</a></li><li><a href="sGis.serializer.html">sGis.serializer</a></li><li><a href="sGis.symbol_.html">sGis.symbol</a></li><li><a href="sGis.symbol.label.html">sGis.symbol.label</a></li><li><a href="sGis.symbol.maptip.html">sGis.symbol.maptip</a></li><li><a href="sGis.symbol.point.html">sGis.symbol.point</a></li><li><a href="sGis.symbol.polygon.html">sGis.symbol.polygon</a></li><li><a href="sGis.symbol.polyline.html">sGis.symbol.polyline</a></li><li><a href="sGis.utils.html">sGis.utils</a></li></ul><h3>Mixins</h3><ul><li><a href="sGisEvent.html">sGisEvent</a></li></ul><h3>Interfaces</h3><ul><li><a href="sGis.IPoint.html">sGis.IPoint</a></li><li><a href="sGis.IRender.html">sGis.IRender</a></li></ul><h3>Global</h3><ul><li><a href="global.html#activeFeature">activeFeature</a></li><li><a href="global.html#crs">crs</a></li><li><a href="global.html#maxResolution">maxResolution</a></li><li><a href="global.html#position">position</a></li><li><a href="global.html#resolution">resolution</a></li><li><a href="global.html#tileScheme">tileScheme</a></li></ul>
</nav>

<br class="clear">

<footer>
    Documentation generated by <a href="https://github.com/jsdoc3/jsdoc">JSDoc 3.4.0</a> on Fri Oct 07 2016 17:06:45 GMT+0300 (Russia TZ 2 Standard Time)
</footer>

<script> prettyPrint(); </script>
<script src="scripts/linenumber.js"> </script>
</body>
</html>