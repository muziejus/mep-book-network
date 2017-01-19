d3.queue(1)
  .defer(prepareBookNodes)
  .defer(prepareBookLinks)
  .await(function(error, books, bookLinks) {

    var width = $("#book_graph").width();
    var height = $("#book_graph").height();

    var svg = d3.select("#books_svg")
      .attr("width", width)
      .attr("height", height);

    var simulation = d3.forceSimulation()
      .force("link", d3.forceLink().id(function(d) { return d.id; }).distance(300))
      .force("charge", d3.forceManyBody().strength(-30))
      .force("center", d3.forceCenter(width / 2, height / 2));

    var link = svg.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(bookLinks)
      .enter().append("line")
        .attr("stroke-width", function(d) { return d.value; });

    var node = svg.append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(books)
      .enter().append("circle")
        .attr("r", 5)
        .attr("fill", d3.schemeCategory20c[0])
        .call(d3.drag()
              .on("start", dragstarted)
              .on("drag", dragged)
              .on("end", dragended));

    node.append("title")
      .text(function(d) { return d.title; });

    simulation
      .nodes(books)
      .on("tick", ticked);

    simulation.force("link")
      .links(bookLinks);

    function ticked() {
      link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

      node
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
    }

    function dragstarted(d) {
      if (!d3.event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }

    function dragended(d) {
      if (!d3.event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

  }); // end d3.queue()


function prepareBookNodes(callback){
  d3.json("books.json", function(error, books) {
    if (error) {throw error; }
    callback(null, books);
  });
}

function prepareBookLinks(callback){
  d3.json("book_links.json", function(error, book_links) {
    if (error) {throw error; }
    callback(null, book_links);
  });
}

