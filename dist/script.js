const url =
"https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";

const containerHeight = 420,
width = 1700,
height = 400,
padding = 20,
legendWidth = 500,
legendHeight = 120,
legendBarHeight = 30;

const colorRange = [
"#a50026",
"#d73027",
"#f46d43",
"#fdae61",
"#fee090",
"#ffffbf",
"#e0f3f8",
"#abd9e9",
"#74add1",
"#4575b4",
"#313695"];


d3.json(url, function (error, data) {
  if (error) {
    alert("Error from server");
  } else {
    const heading = d3.select("#container").append("heading");

    heading.
    append("h1").
    attr("id", "title").
    text("Monthly Global Land-Surface Temperature");

    heading.
    append("h3").
    attr("id", "description").
    html(
    data.monthlyVariance[0].year +
    " - " +
    data.monthlyVariance[data.monthlyVariance.length - 1].year +
    ": base temperature " +
    data.baseTemperature +
    "&#8451;");


    heading.append("h5").attr("id", "author").
    html(`<p>Coded & Designed by<br><a href="https://sngkr.netlify.app/" target="_blank">
          Sangkara
        </a></p>`);

    const tooltip = d3.
    select("#container").
    append("div").
    attr("id", "tooltip").
    style("opacity", 0);

    const svgDiv = d3.
    select("#container").
    append("div").
    attr("id", "svgDiv")
    // .attr("width", "100%")
    .attr("height", containerHeight + padding * 2);

    const scrollBox = d3.
    select("#svgDiv").
    append("div").
    attr("id", "scrollBox").
    attr("width", width + padding * 3).
    attr("height", containerHeight + padding * 2);

    const svgContainer = d3.
    select("#scrollBox").
    append("svg").
    attr("width", width + padding * 3).
    attr("height", containerHeight + padding * 2);

    svgContainer.
    append("text").
    attr("class", "y-legend").
    attr("transform", "rotate(-90)").
    attr("x", -240).
    attr("y", 30).
    text("Months");

    svgContainer.
    append("text").
    attr("class", "x-legend").
    attr("x", 860).
    attr("y", 450).
    text("Years");

    const months = data.monthlyVariance.map((val, i) => {
      val.month -= 1;
      return val.month;
    });

    const years = data.monthlyVariance.map((val, i) => {
      return val.year;
    });

    const yScale = d3.
    scaleBand().
    domain(months).
    range([0, height]).
    round(false).
    paddingOuter(0).
    paddingInner(0);

    const xScale = d3.
    scaleBand().
    domain(years).
    range([0, width - padding * 4]).
    paddingOuter(1).
    paddingInner(0);

    const yAxis = d3.
    axisLeft(yScale).
    tickFormat(function (month) {
      let date = new Date();
      date.setUTCMonth(month);
      return d3.timeFormat("%B")(date);
    }).
    tickSizeInner(7).
    tickSizeOuter(0).
    tickPadding([7]);

    const xAxis = d3.
    axisBottom(xScale).
    tickValues(
    xScale.domain().filter(function (year) {
      return year % 10 === 0;
    })).

    tickFormat(function (year) {
      var date = new Date(0);
      date.setUTCFullYear(year);
      return d3.timeFormat("%Y")(date);
    }).
    tickSizeInner(7).
    tickSizeOuter(0).
    tickPadding([7]);

    svgContainer.
    append("g").
    attr("transform", "translate(" + padding * 7 + ", 0)").
    attr("y", 0).
    attr("x", 0).
    attr("id", "y-axis").
    call(yAxis);

    svgContainer.
    append("g").
    attr("transform", "translate(" + padding * 7 + ", " + height + ")").
    attr("y", 0).
    attr("x", 0).
    attr("id", "x-axis").
    call(xAxis);

    const variance = data.monthlyVariance.map((val, i) => val.variance);

    const minTemp = parseFloat(
    (data.baseTemperature + d3.min(variance)).toFixed(1));

    const maxTemp = parseFloat(
    (data.baseTemperature + d3.max(variance)).toFixed(1));


    const thresholdDomain = () => {
      let array = [];
      let step = (maxTemp - minTemp) / colorRange.length;
      let base = minTemp;
      for (let i = 1; i < colorRange.length; i++) {
        array.push(base + i * step);
      }
      return array;
    };

    const legendThreshold = d3.
    scaleThreshold().
    domain(thresholdDomain()).
    range(colorRange.reverse());

    svgContainer.
    selectAll(".cell").
    data(data.monthlyVariance).
    enter().
    append("rect").
    classed("cell", true).
    attr("data-month", d => d.month).
    attr("data-year", d => d.year).
    attr("data-temp", d => data.baseTemperature + d.variance).
    attr("x", (d, i) => xScale(d.year) + padding * 7).
    attr("y", (d, i) => yScale(d.month)).
    attr("width", (d, i) => xScale.bandwidth(d.year)).
    attr("height", (d, i) => yScale.bandwidth(d.month)).
    style("fill", (d, i) =>
    legendThreshold(data.baseTemperature + d.variance)).

    on("mouseover", function (d, i) {
      let date = new Date(d.year, d.month);
      let dateFormat = d3.timeFormat("%Y - %B")(date);

      let temp = d3.format(".1f")(data.baseTemperature + d.variance);

      tooltip.
      attr("id", "tooltip").
      attr("data-year", datum => d.year).
      style("top", padding * 3 + yScale(d.month) + "px").
      style("left", padding * 4 + xScale(d.year) + "px").
      style("opacity", 0.8).
      html(
      dateFormat +
      "<br>" +
      temp +
      "&#8451; <br>" +
      d3.format("+.1f")(d.variance) +
      "&#8451;");


      d3.select(this).style("stroke", "black").style("stroke-width", 2);
    }).
    on("mouseout", function (d, i) {
      tooltip.style("opacity", 0);

      d3.select(this).style("stroke", "none");
    });

    const legendContainer = d3.
    select("#container").
    append("div").
    attr("id", "legendContainer").
    attr("width", legendWidth).
    attr("height", legendHeight);

    const legend = d3.
    select("#legendContainer").
    append("svg").
    attr("id", "legend").
    attr("width", legendWidth).
    attr("height", legendHeight);

    const legendXScale = d3.
    scaleLinear().
    domain([minTemp, maxTemp]).
    range([padding, legendWidth - padding]);

    const legendAxis = d3.
    axisBottom(legendXScale).
    tickValues(thresholdDomain()).
    tickFormat(d3.format(".1f")).
    tickSizeOuter([0]).
    tickPadding([10]);

    const legendBarWidth = (legendWidth - padding * 2) / colorRange.length;

    legend.
    append("g").
    attr("transform", "translate(0, " + (padding + legendBarHeight) + ")").
    attr("y", 0).
    attr("x", 0).
    attr("id", "legendAxis").
    call(legendAxis);

    legend.
    selectAll(".legendCell").
    data(legendThreshold.range()).
    enter().
    append("rect").
    classed("legendCell", true).
    attr("x", (d, i) => {
      return padding + legendBarWidth * i;
    }).
    attr("y", padding).
    attr("width", (d, i) => legendBarWidth).
    attr("height", legendBarHeight).
    style("fill", (d, i) => d).
    style("stroke", "black");

    legend.
    append("text").
    attr("class", "x-legend").
    attr("x", legendWidth / 2 - 50).
    attr("y", legendHeight - 10).
    html("Celcius(&#8451;)").
    style("text-align", "center");
  }
});