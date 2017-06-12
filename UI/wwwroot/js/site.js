//$.ajax({
//    url: "/api/meteorites",
//    dataType: "JSON",
//    method: "GET"
//}).done(function(d) {
//    console.log(d);
//});


$(function () {
    var margin = { top: 20, right: 20, bottom: 30, left: 50 },
        width = 1200 - margin.left - margin.right,
        height = 800 - margin.top - margin.bottom;


    d3.json("StaticFiles/world.geojson", createMap);
    function createMap(countries) {
        var aProjection = d3.geoMercator()
            .scale(135)
            .translate([500, 380]);
        var geoPath = d3.geoPath().projection(aProjection);
        d3.select("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .selectAll("path").data(countries.features)
            .enter()
            .append("path")
            .attr("d", geoPath)
            .attr("d", geoPath)
            .attr("class", "countries");
    }
});


    

