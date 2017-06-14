﻿$(function () {

    //------------------
    // GET AND USE DATA
    //------------------
    var promiseWrapper = (xhr, d) => new Promise(resolve => xhr(d, (p) => resolve(p))); 
    var pageNumber = 1;
    var meteoriteCounter = 0;
    var meteorites = null;
    Promise.all([
        promiseWrapper(d3.json, "StaticFiles/world.geojson"),
        promiseWrapper(d3.json, "api/meteorites?pageNumber=1&pageSize=100")
    ]).then(resolve => {
        createMap(resolve[0]);
        meteorites = resolve[1];
        //addMeteorites(resolve[1]);
        meteoriteCounter += resolve[1].length;
    });

    //-------------------
    // GLOBAL VARIABLES
    //-------------------
    var margin = { top: 20, right: 20, bottom: 20, left: 20 },
        width = window.innerWidth,// - margin.left - margin.right,
        height = window.innerHeight;//- margin.top - margin.bottom;

    var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    var aProjection = d3.geoOrthographic() // d3.geoMercator() OR d3.geoOrthographic() OR d3.geoMollweide()
    .center([0, 0]) // => used for globe
    .scale(300)
    .translate([width / 2, height / 2]);

    var geoPath = d3.geoPath().projection(aProjection);

    //-------------------
    //   DRAW WORLD MAP
    //-------------------
    function createMap(countries) {
        d3.select("svg")
            .attr("width", width)
            .attr("height", height)
            .selectAll("path").data(countries.features)
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

    //----------------------
    // COUNTRY NAME TOOLTIP
    //----------------------
    function countryName(d) {
        var numOfCountries = [];
        meteorites.forEach(m => {
            if (m.Country === d.properties.name) {
                numOfCountries.push(m.Country);
            }
        });
        div.transition()
            .duration(200)
            .style("opacity", .9);
        div.html(d.properties.name + " has " + numOfCountries.length + " meteorites")
            .style("left", d3.event.pageX + 28 + "px")
            .style("top", d3.event.pageY + 28 + "px");
    }

    function clearCountryName() {
        div.transition()
            .duration(500)
            .style("opacity", 0);
    }

    //-------------------
    //   ADD METEORITES INITIALLY (CURRENTLY NOT IN USE)
    //-------------------
    function addMeteorites(meteorites) {
        d3.select("svg")
            .selectAll("circle")
            .data(meteorites)
            .enter()
            .append("circle")
            .attr("class", "meteorites")
            .attr("r", 1.5)
            .attr("cx", d => aProjection([parseFloat(d.Longitude), parseFloat(d.Latitude)])[0])
            .attr("cy", d => aProjection([parseFloat(d.Longitude), parseFloat(d.Latitude)])[1]);
        d3.selectAll("circle.meteorites")
            .on("mouseover", meteoriteName)
            .on("mouseout", clearMeteoriteName)
            .on("click", meteoriteModal);
    }

    //--------------------
    // METEORITE TOOLTIP
    //--------------------
    function meteoriteName(d) {
        div.transition()
            .duration(200)
            .style("opacity", .9);
        div.html("Meteorite Name: " + d.Name)
            .style("left", d3.event.pageX + 28 + "px")
            .style("top", d3.event.pageY + 28 + "px");
    }

    function clearMeteoriteName() {
        div.transition()
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

    //------------
    //  ZOOMING
    //------------
    function startZoom() {
        var mapZoom = d3.zoom()
            .scaleExtent([150, 2000])
            .on("zoom", zoomed);

        var zoomSettings = d3.zoomIdentity
            .translate(width / 2, height / 2)
            .scale(300); // OR => .translate(0, 0) (for a globe)

        // Use for when rendering a globe
        

        d3.select("svg").call(mapZoom).call(mapZoom.transform, zoomSettings);
    }

    function zoomed2() {
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

            aProjection
                //.translate([width / 2, height / 2])
                .translate([x, y])
                .scale(e.transform.k);

        } else {
            aProjection
                //.translate([width / 2, height / 2])
                .translate([e.transform.x, e.transform.y])
                .scale(e.transform.k);
        }
        d3.selectAll("path.graticule").attr("d", geoPath);
        d3.selectAll("path.countries").attr("d", geoPath);
        d3.selectAll("circle.meteorites")
            .attr("cx", d => aProjection([d.Longitude, d.Latitude])[0])
            .attr("cy", d => aProjection([d.Longitude, d.Latitude])[1]);
    }

    function redraw() {
        console.log("alsjnajsn");
        d3.select("svg").attr("width", window.innerWidth)
           .attr("height", window.innerHeight);
    }
    $(window).on("resize", redraw);

    var userLoadedMeteorites = 0;
    var isComplete = true;
    $("button").on("click", () => {
        console.log("sfs");
        var pageSize = $("input").val();
        var $p = $(".controls > p");        
        if (isComplete) {
            isComplete = false;
            $.getJSON(`api/meteorites?pageNumber=${pageNumber++}&pageSize=${pageSize || 100}`).done((d) => {
                userLoadedMeteorites += d.length;

                d.forEach((meteorite, index) => {
                    window.setTimeout(() => {
                        d3.select("svg").data([meteorite])
                            .append("circle")
                            .attr("class", "meteorites")
                            .attr("r", 4)
                            .attr("cx", d => aProjection([d.Longitude, d.Latitude])[0])
                            .attr("cy", d => aProjection([d.Longitude, d.Latitude])[1])
                            .on("mouseover", meteoriteName)
                            .on("mouseout", clearMeteoriteName)
                            .on("click", meteoriteModal);
                    },index * 100);
                });

                $p.text(userLoadedMeteorites);
                isComplete = true;  
            });
        } else {
            console.log("Wait for previous request to finish");
        }
    });

    var rotateScale = d3.scaleLinear()
        .domain([-500, 0, 500])
        .range([-180, 0, 180]);


    // Below is what is needed to create globe rotation put this in the createMap() function
    function zoomed() {
        var e = d3.event;
        var currentRotate = rotateScale(e.transform.x) % 360;
        aProjection
            .rotate([currentRotate, 0])
            .scale(e.transform.k);
        d3.selectAll("path.graticule").attr("d", geoPath);
        d3.selectAll("path.countries").attr("d", geoPath);

        d3.selectAll("circle.meteorites")
            .each(function (d, i) {
                var projectedPoint = aProjection([d.Longitude, d.Latitude]);
                var x = parseFloat(d.Longitude);
                var display = x + currentRotate < 90 && x + currentRotate > 90 ||
                    (x + currentRotate < -270 && x + currentRotate > -600) ||
                    (x + currentRotate > 270 && x + currentRotate < 600)
                    ? "block"
                    : "none";
                d3.select(this)
                    .attr("cx", parseFloat(projectedPoint[0]))
                    .attr("cy", parseFloat(projectedPoint[1]))
                    .style("display", display);
            });
    }
});