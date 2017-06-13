$(function () {
    var promiseWrapper = (xhr, d) => new Promise(resolve => xhr(d, (p) => resolve(p)));
    Promise.all([
        promiseWrapper(d3.json, "StaticFiles/world.geojson"),
        promiseWrapper(d3.json, "api/meteorites")
    ]).then(resolve => {
        createMap(resolve[0], resolve[1]);
    });

    var margin = { top: 20, right: 20, bottom: 20, left: 20 },
        width = window.innerWidth - margin.left - margin.right,
        height = window.innerHeight - margin.top - margin.bottom;

    function createMap(countries, meteorites) {
        var aProjection = d3.geoMollweide() // d3.getMercator() OR d3.geoOrthographic() OR d3.geoMollweide()
             //.center([0, 0]) // => used for globe
            // Overridden by room settings downn below
            //.scale(250)
            //.translate([width / 2, height / 2]);

        var geoPath = d3.geoPath().projection(aProjection);

        /* This is to color the countries based on their size
        var featureSize = d3.extent(countries.features, d => geoPath.area(d));
        var countryColor = d3.scaleQuantize()
            .domain(featureSize).range(colorbrewer.Greens[7]);
        */

        d3.select("svg")
            .attr("width", width)
            .attr("height", height)
            .selectAll("path").data(countries.features)
            .enter()
            .append("path")
            .attr("class", "countries")
            //.style("fill", d => countryColor(geoPath.area(d))) => uncomment this to color countries based on their size.
            .attr("d", geoPath);

        d3.select("svg")
            .selectAll("circle")
            .data(meteorites)
            .enter()
            .append("circle")
            .attr("class", "meteorites")
            .attr("r", 3);
            //.attr("cx", d => aProjection([parseFloat(d.Longitude), parseFloat(d.Latitude)])[0])
            //.attr("cy", d => aProjection([parseFloat(d.Longitude), parseFloat(d.Latitude)])[1]);

        d3.selectAll("path.countries")
            .on("mouseover", countryName) // OR centerBounds
            .on("mouseout", clearCountryName); // OR clearCenterBounds

        // centerBounds() and clearCenterBounds() puts a box around the size of the country as well as dot in its center
        function centerBounds(d) {
            var thisBounds = geoPath.bounds(d);
            var thisCenter = geoPath.centroid(d);
            // console.log(thisBounds, thisCenter); => see what the above variables contain
            d3.select("svg")
                .append("rect")
                .attr("class", "bbox")
                .attr("x", thisBounds[0][0])
                .attr("y", thisBounds[0][1]);
                // Uncomment the below 2 lines to also see the box around the country
                //.attr("width", thisBounds[1][0] - thisBounds[0][0])
                //.attr("height", thisBounds[1][1] - thisBounds[0][1]);
            d3.select("svg")
                .append("circle")
                .attr("class", "centroid")
                .attr("r", 5)
                .attr("cx", parseInt(thisCenter[0])).attr("cy", parseInt(thisCenter[1]));
        }

        function clearCenterBounds() {
            d3.selectAll("circle.centroid").remove();
            d3.selectAll("rect.bbox").remove();
        }

        var div = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

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
            div.html(d.properties.name + " has "+ numOfCountries.length + " meteorites" )
                .style("left", d3.event.pageX + "px")
                .style("top", d3.event.pageY + "px");
        }

        function clearCountryName(d) {
            div.transition()
                .duration(500)
                .style("opacity", 0);
        }

        
        // ADDING GRATICULE LINES
        var graticule = d3.geoGraticule();
        d3.select("svg").insert("path", "path.countries")
            .datum(graticule)
            .attr("class", "graticule line")
            .attr("d", geoPath);
        d3.select("svg").insert("path", "path.countries")
            .datum(graticule.outline)
            .attr("class", "graticule outline")
            .attr("d", geoPath);

        // ZOOMING
        var mapZoom = d3.zoom()
            .scaleExtent([150, 800])
            //.translateExtent([[-0.1, -0.1], [0.10, 0.10]])
            .on("zoom", zoomed);

        var zoomSettings = d3.zoomIdentity
            .translate(width / 2, height / 2)
            .scale(150); // OR => .translate(0, 0) (for a globe)

        // When rendering a globe
        //var rotateScale = d3.scaleLinear()
        //    .domain([-500, 0, 500])
        //    .range([-180, 0, 180]);

        d3.select("svg").call(mapZoom).call(mapZoom.transform, zoomSettings);

        function zoomed() {
            var e = d3.event;

            var path = document.querySelector("path.graticule.line");
            var graticuleHalfWidth = path.getBoundingClientRect().width / 2;
            var graticuleHalfHeight = path.getBoundingClientRect().height / 2;

            var lowerLimitY = graticuleHalfHeight;
            var upperLimitY = height - graticuleHalfHeight;
            var y = e.transform.y;
            if (e.transform.y < lowerLimitY) {
                y = lowerLimitY;
            } else if (e.transform.y > upperLimitY) {
                y = upperLimitY;
            }

            var lowerLimitX = width / 2 - graticuleHalfWidth;
            var upperLimitX = width / 2 + graticuleHalfWidth;
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

            d3.selectAll("path.graticule").attr("d", geoPath);
            d3.selectAll("path.countries").attr("d", geoPath);
            d3.selectAll("circle.meteorites")
                .attr("cx", d => aProjection([d.Longitude, d.Latitude])[0])
                .attr("cy", d => aProjection([d.Longitude, d.Latitude])[1]);
        }

        // Below is what is needed to create globe rotation
        //function zoomed() {
        //    var e = d3.event;
        //    var currentRotate = rotateScale(e.transform.x) % 360;
        //    aProjection
        //        .rotate([currentRotate, 0])
        //        .scale(e.transform.k);
        //    d3.selectAll("path.graticule").attr("d", geoPath);
        //    d3.selectAll("path.countries").attr("d", geoPath);

        //    d3.selectAll("circle.meteorites")
        //        .each(function(d, i) {
        //            var projectedPoint = aProjection([d.Longitude, d.Latitude]);
        //            var x = parseFloat(d.Longitude);
        //            var display = x + currentRotate < 90 && x + currentRotate > 90 ||
        //                (x + currentRotate < -270 && x + currentRotate > -600) ||
        //                (x + currentRotate > 270 && x + currentRotate < 600)
        //                ? "block"
        //                : "none";
        //            d3.select(this)
        //                .attr("cx", parseFloat(projectedPoint[0]))
        //                .attr("cy", parseFloat(projectedPoint[1]))
        //                .style("display", display);
        //        });
        //}
    }
});


    

