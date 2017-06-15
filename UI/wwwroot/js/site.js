$(function () {
    //-------------------
    // GLOBAL VARIABLES
    //-------------------
    var width = window.innerWidth,
        height = window.innerHeight;

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
    var choice = null;
    $("#mollweide-map").on("click", () => {
        createMapRequest("mollweide");
        choice = "mollweide";
    });

    $("#orthographic-map").on("click", () => {
        createMapRequest("orthographic");
        choice = "orthographic";
    });

    //------------------
    // GET AND USE DATA
    //------------------
    function createMapRequest(projection) {
        var promiseWrapper = (xhr, d) => new Promise(resolve => xhr(d, (p) => resolve(p)));
        Promise.all([
            promiseWrapper(d3.json, "StaticFiles/world.geojson")
        ]).then(resolve => {
            if (projection === "orthographic") {
                drawMap(resolve[0], orthographicProjection);
                startZoom(projection);
            } else {
                drawMap(resolve[0], mollweideProjection);
                startZoom(projection);
            }
        });
    }

    //-------------------
    //   DRAW WORLD MAP
    //-------------------
    function drawMap(countries, projection) {

        $("svg > *").remove();

        geoPath = d3.geoPath().projection(projection);

        svg.selectAll("path").data(countries.features)
            .enter()
            .insert("path")
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
        drawMeteoritesStatically();
    }

    //------------
    //  ZOOMING
    //------------
    function startZoom(p) {
        var mapZoom = d3.zoom()
            .scaleExtent([150, 800])
            .on("zoom", p === "orthographic" ? orthographicZoom : mollweideZoom);

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
            .rotate([currentRotate, e.transform.y])
            .scale(e.transform.k);
        d3.selectAll("path.graticule").attr("d", geoPath);
        d3.selectAll("path.countries").attr("d", geoPath);

        d3.selectAll("circle.meteorites")
            .each(function (d, i) {
                var projectedPoint = orthographicProjection([d.Longitude, d.Latitude]);
                var x = parseFloat(d.Longitude);
                var display = x + currentRotate < 90 && x + currentRotate > 90 ||
                    (x + currentRotate < -270 && x + currentRotate > -450) ||
                    (x + currentRotate > 270 && x + currentRotate < 450)
                    ? "block" : "none";
                
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
            let y = e.transform.y;
            if (e.transform.y < lowerLimitY) {
                y = lowerLimitY;
            } else if (e.transform.y > upperLimitY) {
                y = upperLimitY;
            }

            let x = e.transform.x;
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
    // COUNTRY TOOLTIP
    //----------------------

    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

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
            .duration(200)
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
    $(window).on("resize", redraw);
    function redraw() {
        svg.attr("width", window.innerWidth)
           .attr("height", window.innerHeight);
    }
    
    //-----------------
    // LOAD METEORITES
    //-----------------
    var userLoadedMeteorites = 0;
    var isComplete = true;
    var pageNumber = 1;
    $("#load-meteorites").on("click", () => {
        var pageSize = $("input").val();
        var $p = $("#amount-loaded");
        if (isComplete) {
            isComplete = false;
            $.getJSON(`api/meteorites?pageNumber=${pageNumber++}&pageSize=${pageSize || 100}`).done((d) => {
                userLoadedMeteorites += d.length;
                d.forEach((meteorite, index) => {
                    drawMeteoritesDynamically(meteorite, index);
                });
                $p.text(userLoadedMeteorites);
                isComplete = true;
            });
        } else {
            $("#request-notice").fadeIn();
            $("#request-notice").fadeOut();
        }
    });

    function drawMeteoritesDynamically(meteorite, index) {
        var transitions = [8, 2];
        meteorites.push(meteorite);
            window.setTimeout(() => {
                var m = svg.data([meteorite])
                    .append("circle")
                    .attr("class", "meteorites")
                    .attr("r", 20)
                    .attr("cx", d => choice === "orthographic" ? orthographicProjection([d.Longitude, d.Latitude])[0]
                                                               : mollweideProjection([d.Longitude, d.Latitude])[0])
                    .attr("cy", d => choice === "orthographic" ? orthographicProjection([d.Longitude, d.Latitude])[1]
                                                               : mollweideProjection([d.Longitude, d.Latitude])[1])
                    .on("mouseover", meteoriteName)
                    .on("mouseout", clearMeteoriteName)
                    .on("click", meteoriteModal);
                transitions.forEach((n, i) => {
                    m.transition().duration(100).delay(i * 100).attr("r", n);
                });
        }, index * 100);
        
    }

    function drawMeteoritesStatically() {
        if (meteorites.length > 0) {
            console.log(meteorites);
            for (let i = 0; i < meteorites.length; i ++) {
                svg.data([meteorites[i]])
                    .insert("circle")
                    .attr("class", "meteorites")
                    .attr("r", 2)
                    .attr("cx", d => choice === "orthographic" ? orthographicProjection([d.Longitude, d.Latitude])[0]
                                                               : mollweideProjection([d.Longitude, d.Latitude])[0])
                    .attr("cy", d => choice === "orthographic" ? orthographicProjection([d.Longitude, d.Latitude])[1]
                                                               : mollweideProjection([d.Longitude, d.Latitude])[1])
                    .on("mouseover", meteoriteName)
                    .on("mouseout", clearMeteoriteName)
                    .on("click", meteoriteModal);
            }            
        } else {
            return;
        }
    }

    //----------
    // UI STUFF
    //----------
    $(window).on("load", () => {
        $(".splash").fadeIn(4000);
        $(".splash").delay(500).fadeOut(2000, () => {
            $(".instructions").fadeIn(4000);
        });
    });

    $("#start").on("click", () => {
        $(".instructions").fadeOut(2000, () => {
            $(".controls").fadeIn(4000);
        });
    });
});