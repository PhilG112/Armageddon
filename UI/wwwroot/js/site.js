$.ajax({
    url: "/api/meteorites",
    dataType: "JSON",
    method: "GET"
}).done(function(d) {
    console.log(d);
});