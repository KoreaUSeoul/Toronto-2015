var Network = function(divName, attributes) {
  // divName indicates tag for insertion of network. attributes goes into svg tag.
  //private variables
  var private = {
      svg: null,    //the <svg> tag class:body
      network: null,  //the <g> tag class:network
      nodes: null,     //all node elements class:node under <g> class:nodes
      links: null,    //all link elements class:link under <g> class:nodes
      attributes: attributes,
      pathways: [],
      nodesSet: [], //array of nodes data
      linkSet: [], //array of links data

  }

  init(divName, attributes);

  function init(divName, attributes){
      // Create necessary tags/containers and initiate force
      //Append svg tag
      private.svg = d3.select(divName).append('svg').attr("class", "body");
      //Assign attributes to svg tag
      var keys = Object.keys(attributes);
      for(var i = 0; i < keys.length; i++)
        private.svg.attr(keys[i], attributes[keys[i]]);
      //Create 2 <g> containers for nodes and links in the network <g> container
      private.network = private.svg.append("g").attr("class", "network");
      private.network.append("g").attr("class", "nodes").selectAll("node");
      private.network.append("g").attr("class", "links").selectAll("link");
      private.links = private.network.select(".links").selectAll(".link");
      private.nodes = private.network.select(".nodes").selectAll(".node");
      // initiate force: thinking of assigning assign value to variables and move them to a variables.js
      private.force = d3.layout.force()
                          .nodes(private.nodesSet)
                          .links(private.linkSet)
                          .charge(function(d){if(d.type == "m"){return -1000}else{return -500}})
                          .linkStrength(2)
                          .linkDistance(50)
                          .size([private.attributes.width, private.attributes.height])
                          .on("tick", tick);
  };
  function draw(path){
    path.draw()
    private.links.enter().insert("line")
                .attr("class", "link")
                .attr("id", function(d){return d.id})
                .attr("stroke", palette.linktest)
                .attr("fill", "none")
                .attr("opacity", 1)
                .attr("stroke-width", 2)
                .attr("marker-end", function(d){if(d.source.type == "r"){return "url(#triangle)"}})

  }
  function addSpecie(specie){

      var path = new Pathway({height: private.attributes.height,
                                        width: private.attributes.width,
                                        divName: divName}, specie);

      private.pathways.push(path);
      private.nodesSet = private.nodesSet.concat(path.nodesSet);
      private.linkSet = private.linkSet.concat(path.linkSet);
      //Shit below is temporary.
      private.links = private.network
      .select(".links").selectAll(".link");

      //nodes selected
     private.nodes = private.network
      .select(".nodes").selectAll(".node")

      private.force = d3.layout.force()
                    .nodes(private.nodesSet)
                    .links(private.linkSet)
                    .charge(function(d){if(d.type == "m"){return -1000}else{return -500}})
                    .linkStrength(2)
                    .linkDistance(50)
                    .size([private.attributes.width, private.attributes.height])
                    .on("tick", tick);

      private.nodes = private.nodes.data(private.nodesSet);
      private.links = private.links.data(private.linkSet);


      draw(path);
      //console.log(private.linkSet)
      private.force.start();

    }
  function tick(){
    private.nodes.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
    private.links.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });
  }
  function changeDimensions(width, height) {
    private.attributes.width = width;
    private.attributes.height = height;
    //  that.force
    //.size([inst.traits.w, inst.traits.h]).start();
  }
      return {
        addSpecie: function(specie){
            addSpecie(specie);
        },
        changeDimensions: function(width, height) {
            changeDimensions(width, height);
        }
      }
}
