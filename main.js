var width = window.innerWidth,
  height = window.innerHeight,
  margin = { top: 0, bottom: 0, left: 0, right: 0 };

var svg = d3
  .select("#map-wrapper")
  .append("svg")
  .attr("width", width - margin.left - margin.right)
  .attr("height", height - margin.top - margin.bottom);

var states = svg
  .append("g")
  .attr("id", "states")
  .selectAll("path");

var projection = d3.geo
  .albers()
  .origin([79.375986, 23.368801])
  .scale(1000);

var topology, geometries, carto_features;

var pop_data = d3.map();

var carto = d3
  .cartogram()
  .projection(projection)
  .properties(function(d) {
    // this adds the "properties" properties to the geometries
    return d.properties;
  });

d3.csv("data.csv", function(data) {
  data.forEach(function(d) {
    pop_data.set(d.state_ut, [d.population_2011, d.sex_ratio]);
  });
});

d3.json("geo.json", function(data) {
  topology = data;
  geometries = topology.objects["india_state"].geometries;

  var features = carto.features(topology, geometries),
    path = d3.geo.path().projection(projection);

  states = states
    .data(features)
    .enter()
    .append("path")
    .attr("class", "state")
    .attr("id", function(d) {
      return slugify(d.properties.ST_NM);
    })
    .attr("fill", "#bcd6ff")
    .attr("d", path)
    .attr("stroke", "black");
});

function do_update() {
  d3.select("#click_to_run").text("thinking...");
  setTimeout(function() {
    carto.value(function(d) {
      var ret = +pop_data.get(d.properties["ST_NM"])[0];
      return ret;
    });

    if (carto_features == undefined)
      carto_features = carto(topology, geometries).features;

    states.data(carto_features).text(function(d) {
      return d.properties.ST_NM;
    });

    states
      .transition()
      .duration(3000)
      .each("end", function() {
        d3.select("#click_to_run").text("View by Population");
      })
      .attr("d", carto.path);
  }, 10);
}

function do_normal() {
  d3.select("#click_to_normal").text("thinking...");
  setTimeout(function() {
    var features = carto.features(topology, geometries),
      path = d3.geo.path().projection(projection);

    states
      .data(features)
      .transition()
      .duration(3000)
      .each("end", function() {
        d3.select("#click_to_normal").text("View Normal");
      })
      .attr("d", path);
  }, 10);
}

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}
