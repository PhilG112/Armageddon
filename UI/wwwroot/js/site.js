$(function () {
    //-------------------
    // GLOBAL VARIABLES
    //-------------------
    var margin = { top: 20, right: 20, bottom: 20, left: 20 },
        width = window.innerWidth,// - margin.left - margin.right,
        height = window.innerHeight;//- margin.top - margin.bottom;

    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    var svg = d3.select("svg")
        .attr("width", width)
        .attr("height", height);

    var geoPath = null;

    var orthographicProjection = d3.geoOrthographic()
        .center([0, 0])
        .scale(300)
        .translate([width / 2, height / 2]);

    var mollweideProjection = d3.geoMollweide()
        .scale(300)
        .translate([width / 2, height / 2]);

    //------------
    // CHOOSE MAP
    //------------
    $("#mollweide-map").on("click", (e) => {
        createMapRequest(e);
    });

    $("#orthographic-map").on("click", (e) => {
        createMapRequest(e);
    });

    //------------------
    // GET AND USE DATA
    //------------------
    function createMapRequest(map) {
        var promiseWrapper = (xhr, d) => new Promise(resolve => xhr(d, (p) => resolve(p)));
        Promise.all([
            promiseWrapper(d3.json, "StaticFiles/world.geojson")
        ]).then(resolve => {
            if (map.target === $("#orthographic-map")) {
                drawMap(resolve[0], orthographicProjection);
            } else {
                drawMap(resolve[0], mollweideProjection);
            }
        });
    }

    //-------------------
    //   DRAW WORLD MAP
    //-------------------
    function drawMap(countries, projection) {

        // CLEAR MAP BEFORE DRAWING

        geoPath = d3.geoPath().projection(projection);

        svg.selectAll("path").data(countries.features)
            .enter()
            .append("path")
            .attr("class", "countries")
            .attr("d", geoPath);

        d3.selectAll("path.countries")
            .on("mouseover", countryName)
            .on("mouseout", clearCountryName);

        var graticule = d3.geoGraticule();
        d3.select("svg").insert("path", "path.countries")
            .datum(graticule)
            .attr("class", "graticule line")
            .attr("d", geoPath);
        d3.select("svg").insert("path", "path.countries")
            .datum(graticule.outline)
            .attr("class", "graticule outline")
            .attr("d", geoPath);
        startZoom();
    }

    //------------
    //  ZOOMING
    //------------
    function startZoom() {
        var mapZoom = d3.zoom()
            .scaleExtent([150, 800])
            .on("zoom", mollweideZoom);

        var zoomSettings = d3.zoomIdentity
            .translate(width / 2, height / 2)
            .scale(300);

        d3.select("svg").call(mapZoom).call(mapZoom.transform, zoomSettings);
    }

    // Orthographic Zoom
    function orthographicZoom() {
        var e = d3.event;

        var rotateScale = d3.scaleLinear()
            .domain([-500, 0, 500])
            .range([-180, 0, 180]);

        var currentRotate = rotateScale(e.transform.x) % 360;

        orthographicProjection
            .rotate([currentRotate, 0])
            .scale(e.transform.k);
        d3.selectAll("path.graticule").attr("d", geoPath);
        d3.selectAll("path.countries").attr("d", geoPath);

        d3.selectAll("circle.meteorites")
            .each(function (d, i) {
                var projectedPoint = orthographicProjection([d.Longitude, d.Latitude]);
                var x = parseFloat(d.Longitude);
                var display = x + currentRotate < 90 && x + currentRotate > 90 ||
                    (x + currentRotate < -270 && x + currentRotate > -360) ||
                    (x + currentRotate > 270 && x + currentRotate < 360)
                    ? "block"
                    : "none";
                d3.select(this)
                    .attr("cx", parseFloat(projectedPoint[0]))
                    .attr("cy", parseFloat(projectedPoint[1]))
                    .style("display", display);
            });
    }

    // Mollweide Zoom
    function mollweideZoom() {
        var e = d3.event;

        var path = document.querySelector("path.graticule.line");

        var graticuleHalfHeight = path.getBoundingClientRect().height / 2;
        var lowerLimitY = graticuleHalfHeight;
        var upperLimitY = height - graticuleHalfHeight;

        var graticuleHalfWidth = path.getBoundingClientRect().width / 2;
        var lowerLimitX = width / 2 - graticuleHalfWidth;
        var upperLimitX = width / 2 + graticuleHalfWidth;

        if (path.getBoundingClientRect().height < height) {
            var y = e.transform.y;
            if (e.transform.y < lowerLimitY) {
                y = lowerLimitY;
            } else if (e.transform.y > upperLimitY) {
                y = upperLimitY;
            }

            var x = e.transform.x;
            if (e.transform.x < lowerLimitX) {
                x = lowerLimitX;
            } else if (e.transform.x > upperLimitX) {
                x = upperLimitX;
            }

            mollweideProjection
                .translate([x, y])
                .scale(e.transform.k);

        } else {
            mollweideProjection
                .translate([e.transform.x, e.transform.y])
                .scale(e.transform.k);
        }
        d3.selectAll("path.graticule").attr("d", geoPath);
        d3.selectAll("path.countries").attr("d", geoPath);
        d3.selectAll("circle.meteorites")
            .attr("cx", d => mollweideProjection([d.Longitude, d.Latitude])[0])
            .attr("cy", d => mollweideProjection([d.Longitude, d.Latitude])[1]);
    }

    //----------------------
    // COUNTRY NAME TOOLTIP
    //----------------------
    var meteorites = [];
    function countryName(d) {
        var numOfCountries = [];
        meteorites.forEach(m => {
            if (m.Country === d.properties.name) {
                numOfCountries.push(m.Country);
            }
        });
        tooltip.transition()
            .duration(200)
            .style("opacity", .9);
        tooltip.html(d.properties.name + " has " + numOfCountries.length + " meteorites")
            .style("left", d3.event.pageX + 28 + "px")
            .style("top", d3.event.pageY + 28 + "px");
    }

    function clearCountryName() {
        tooltip.transition()
            .duration(500)
            .style("opacity", 0);
    }

    //--------------------
    // METEORITE TOOLTIP
    //--------------------
    function meteoriteName(d) {
        tooltip.transition()
            .duration(200)
            .style("opacity", .9);
        tooltip.html("Meteorite Name: " + d.Name)
            .style("left", d3.event.pageX + 28 + "px")
            .style("top", d3.event.pageY + 28 + "px");
    }

    function clearMeteoriteName() {
        tooltip.transition()
            .duration(500)
            .style("opacity", 0);
    }

    function meteoriteModal(d) {
        $(".modal-content").html("");

        var $modal = $("#myModal");
        var $span = $(".close");

        $.map(d, (v, k) => {
            var $p = $("<p>");
            $p.text(`${k}: ${v}`);
            $p.appendTo($(".modal > .modal-content"));
        });

        $modal.css({ display: "block" });

        $span.on("click", () => {
            $modal.css({ display: "none" });
        });

        $(window).on("click", e => {
            // Check why this wasn't working with $modal with jack
            if (e.target.id === "myModal") {
                $modal.css({ display: "none" });
            }
        });
    }

    //----------------
    // RESPONSIVE SVG
    //----------------
    function redraw() {
        svg.attr("width", window.innerWidth)
           .attr("height", window.innerHeight);
    }
    $(window).on("resize", redraw);

    //-----------------
    // LOAD METEORITES
    //-----------------
    var userLoadedMeteorites = 0;
    var isComplete = true;
    var pageNumber = 1;
    $("#load-meteorites").on("click", () => {
        var pageSize = $("input").val();
        var $p = $(".controls > p");        
        if (isComplete) {
            isComplete = false;
            $.getJSON(`api/meteorites?pageNumber=${pageNumber++}&pageSize=${pageSize || 100}`).done((d) => {
                userLoadedMeteorites += d.length;
                d.forEach((meteorite, index) => {
                    meteorites.push(meteorite);
                    window.setTimeout(() => {
                        svg.data([meteorite])
                            .append("circle")
                            .attr("class", "meteorites")
                            .attr("r", 2.5)
                            .attr("cx", d => orthographicProjection([d.Longitude, d.Latitude])[0])
                            .attr("cy", d => orthographicProjection([d.Longitude, d.Latitude])[1])
                            .on("mouseover", meteoriteName)
                            .on("mouseout", clearMeteoriteName)
                            .on("click", meteoriteModal);
                    },index * 100);
                });

                $p.text(userLoadedMeteorites);
                isComplete = true;  
            });
        } else {
            // Fade message in and out;
            $("#request-notice").fadeIn();
        }
    });
});