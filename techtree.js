
var test_node = {
  parent: 0,
  label: 'test'
};

// the main techtree module
techtree = {
    drawTree: function(){
        console.log('techtree module:\n', techtree);
        // use to draw the tree
        var width = 960,
            height = 2000;

        var tree = d3.layout.tree()
            .size([height, width - 160]);

        var diagonal = d3.svg.diagonal()
            .projection(function(d) { return [d.y, d.x]; });

        techtree.treeSVG = d3.select("body").append("svg")
            .attr("width", width)
            .attr("height", height)
          .append("g")
            .attr("transform", "translate(40,0)");

        d3.json(treeConfig.jsonSrc, function(error, json) {
          var nodes = tree.nodes(json),
              links = tree.links(nodes);
              
              console.log(links);

          var link = techtree.treeSVG.selectAll("path.link")
                .data(links)
            .enter().append("path")
                .attr("src",function(d) { return d.source.name; })
                .attr("tgt",function(d) { return d.target.name; })
                .attr("class", "link")
                .attr("d", diagonal);

          var node = techtree.treeSVG.selectAll("g.node")
              .data(nodes)
            .enter().append("g")
              .attr("class", "node")
              .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
              .attr("onmouseover",function(d){ return "techtree.showTooltip('"+d.name+"','"+d.text+"',"+d.x+","+d.y+")"; })
              .attr("onmouseout" ,function(d){ return "techtree.unshowTooltip('"+d.name+"')"; })
              .attr("onclick"    ,function(d){ return "techtree.selectNode('"+d.name+"')"; })

          node.append("circle")
                .attr("id",function(d) { return d.name+"_circle"; })
                .attr("r", 10)
                .style("stroke","blue");

          node.append("text")
              .attr("dx", function(d) { return d.children ? -8 : 8; })
              .attr("dy", 3)
              .attr("text-anchor", function(d) { return d.children ? "end" : "start"; })
              .text(function(d) { return d.name; });
        });

        d3.select(self.frameElement).style("height", height + "px");
    },
    
    selectNode: function(nodename){
        var DUR = 750;  //duration of transition in ms 
        d3.select('#'+nodename+'_circle').transition()
            .duration(DUR)
            .style('fill', 'lime')
            .style('stroke', 'green')
            .attr('r',25);
        
        // recolor all edges coming from parents
        d3.selectAll('[tgt='+nodename+']').transition()
            .duration(DUR)
            .style('stroke','green');
            
        // recolor all edges going to children
        d3.selectAll('[src='+nodename+']').transition()
            .duration(DUR)
            .style('stroke','blue');

    },
    showTooltip: function(name, desc, x, y){
        // shows a tooltip for the given node
        var X = y;  // yes, x and y are switched here... don't ask me why, they just are.
        var Y = x;
        var W = 500;
        var H = 100;
        var txt_H = H/3;
        console.log('drawing tooltip for:', name,' @ (',X,',',Y,')');
        var box = techtree.treeSVG.append('rect')
                                    .attr('id',name+'_tooltip_box')
                                    .attr('x',X)
                                    .attr('y',Y)
                                    .attr('width',W)
                                    .attr('height',H)
                                    .attr('fill','rgba(200,200,200,0.3)');
              
        var text = techtree.treeSVG.append('text')
                                    .attr('id',name+'_tooltip_txt')
                                    .attr('x',X)
                                    .attr('y',Y+txt_H)
                                    .attr('font-size',txt_H)
                                    .text(desc);

    },
    unshowTooltip: function(nodename){
        d3.select('#'+nodename+'_tooltip_box').remove();
        d3.select('#'+nodename+'_tooltip_txt').remove();
    }
};