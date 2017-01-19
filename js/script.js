d3.queue(1)
  .defer(prepareBookNodes)
  .defer(prepareBookLinks)
  .defer(prepareMemberNodes)
  .defer(prepareMemberLinks)
  .await(function(error, books, bookLinks, members, memberLinks) {

    var bookwidth = $("#book_graph").width();
    var bookheight = $("#book_graph").height();
    var memberwidth = $("#member_graph").width();
    var memberheight = $("#member_graph").height();
    var booksvg = d3.select("#books_svg")
      .attr("width", bookwidth)
      .attr("height", bookheight);
    var membersvg = d3.select("#members_svg")
      .attr("width", memberwidth)
      .attr("height", memberheight);
    var booksimulation = d3.forceSimulation()
      .force("link", d3.forceLink().id(function(d) { return d.id; }).distance(300))
      .force("charge", d3.forceManyBody().strength(-30))
      .force("center", d3.forceCenter(bookwidth / 2, bookheight / 2));
    var membersimulation = d3.forceSimulation()
      .force("link", d3.forceLink().id(function(d) { return d.id; }).distance(300))
      .force("charge", d3.forceManyBody().strength(-30))
      .force("center", d3.forceCenter(memberwidth / 2, memberheight / 2));

    var booklink = booksvg.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(bookLinks)
      .enter().append("line")
        .attr("id", function (d) { return d.id; })
        .attr("stroke-width", function(d) { return d.value; })
        .on("click", lightUp);
    var booknode = booksvg.append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(books)
      .enter().append("circle")
        .attr("id", function(d) { return d.id; })
        .attr("r", 5)
        .attr("fill", d3.schemeCategory20c[0])
        .call(d3.drag()
              .on("start", bookdragstarted)
              .on("drag", bookdragged)
              .on("end", bookdragended));

    var memberlink = membersvg.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(memberLinks)
      .enter().append("line")
        .attr("id", function (d) { return d.id; })
        .attr("stroke-width", function(d) { return d.value; })
        .on("click", lightUp);
    var membernode = membersvg.append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(members)
      .enter().append("circle")
        .attr("id", function(d) { return d.id; })
        .attr("r", 5)
        .attr("fill", d3.schemeCategory20c[0])
        .call(d3.drag()
              .on("start", memberdragstarted)
              .on("drag", memberdragged)
              .on("end", memberdragended));

    booknode.append("title")
      .text(function(d) { return d.title; });
    membernode.append("title")
      .text(function(d) { return d.name; });

    booksimulation
      .nodes(books)
      .on("tick", bookticked);
    membersimulation
      .nodes(members)
      .on("tick", memberticked);

    booksimulation.force("link")
      .links(bookLinks);
    membersimulation.force("link")
      .links(memberLinks);

    function bookticked() {
      booklink
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });
      booknode
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
    }
    function memberticked() {
      memberlink
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });
      membernode
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
    }

    function bookdragstarted(d) {
      if (!d3.event.active) { booksimulation.alphaTarget(0.3).restart(); }
      d.fx = d.x;
      d.fy = d.y;
    }
    function bookdragged(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }
    function bookdragended(d) {
      if (!d3.event.active) { booksimulation.alphaTarget(0); }
      d.fx = null;
      d.fy = null;
    }
    function memberdragstarted(d) {
      if (!d3.event.active) { membersimulation.alphaTarget(0.3).restart(); }
      d.fx = d.x;
      d.fy = d.y;
    }
    function memberdragged(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }
    function memberdragended(d) {
      if (!d3.event.active) { membersimulation.alphaTarget(0); }
      d.fx = null;
      d.fy = null;
    }
  }); // end d3.queue()


function prepareMemberNodes(callback){
  d3.json("members.json", function(error, members) {
    if (error) {throw error; }
    callback(null, members);
  });
}

function prepareMemberLinks(callback){
  d3.json("member_links.json", function(error, member_links) {
    if (error) {throw error; }
    callback(null, member_links);
  });
}

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

function lightUp(d) {
  d3.selectAll(".litupline")
    .style("stroke", "#999")
    .classed("litupline", false);

  d3.selectAll(".litupdot")
    .attr("fill", d3.schemeCategory20c[0])
    .classed("litupdot", false);

  d3.select("#" + d.id)
    .classed("litupline", true)
    .style("stroke", "#0f0");

  console.log(d.nodes);

  d.nodes.forEach(function(node) {
    d3.select("#" + node)
      .classed("litupdot", true)
      .attr("fill", "#0f0");
  });
}

