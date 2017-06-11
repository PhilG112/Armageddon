//$.ajax({
//    url: "/api/meteorites",
//    dataType: "JSON",
//    method: "GET"
//}).done(function(d) {
//    console.log(d);
//});


$(function() {
    d3.json("StaticFiles/world.geojson", createMap);
    function createMap(countries) {
        var aProjection = d3.geoMercator();
        var geoPath = d3.geoPath().projection(aProjection);
        d3.select("svg").selectAll("path").data(countries.features)
            .enter()
            .append("path")
            .atrt("d", geoPath)
            .attr("class", "countries");
    }
});


    

