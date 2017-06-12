$(function () {
    var promiseWrapper = (xhr, d) => new Promise(resolve => xhr(d, (p) => resolve(p)));
    Promise.all([
        promiseWrapper(d3.json, "StaticFiles/world.geojson"),
        promiseWrapper(d3.json, "/api/meteorites")
    ]).then(resolve => {
        console.log(resolve[0], resolve[1]);
        createMap(resolve[0], resolve[1]);
    });

    var margin = { top: 20, right: 20, bottom: 30, left: 50 },
        width = 1200 - margin.left - margin.right,
        height = 800 - margin.top - margin.bottom;

    function createMap(countries, cities) {
        var aProjection = d3.geoMercator()
            .scale(135)
            .translate([580, 380]);

        var geoPath = d3.geoPath().projection(aProjection);

        d3.select("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .selectAll("path").data(countries.features)
            .enter()
            .append("path")
            .attr("class", "countries")
            .attr("d", geoPath);
        d3.select("svg")
            .selectAll("circle").data(cities)
            .enter()
            .append("circle")
            .attr("class", "cities")
            .attr("r", 3)
            .attr("cx", d => aProjection([parseFloat(d.Longitude), parseFloat(d.Latitude)])[0])
            .attr("cy", d => aProjection([parseFloat(d.Longitude), parseFloat(d.Latitude)])[1]);
    }
});


    

