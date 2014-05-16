
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
              .attr("onmouseover",function(d){ return "techtree.showTooltip('"+d.name+"','"+d.text+"',"+d.x+","+d.y+","+d.depth+")"; })
          node.append("circle")
                .attr("id",function(d) { return d.name+"_circle"; })
                .attr("r", 10)
                .style("stroke","gray");
          node.append("text")
              .attr("dx", function(d) { return d.children ? -8 : 8; })
              .attr("dy", 3)
              .attr("text-anchor", function(d) { return d.children ? "end" : "start"; })
              .text(function(d) { return d.name; });
        });

        d3.select(self.frameElement).style("height", height + "px");
    },
    
    _isEnabled: function(nodeDepth, nodeName){
        // returns true if node is enabled, else false
        var previousResearchesCompleted = true;
        d3.selectAll('[tgt='+nodeName+']')
            .each( function(d){
                if( d.enabled == "true" ) {} else {     // "true" must be in quotes here... it's weird, but it works.
                    previousResearchesCompleted = false;
                }
            });
        
        if (nodeDepth == 0){
            return true;
        } else if( previousResearchesCompleted ){
            return true;
        } else {
            return false;
        }
    },

    selectNode: function(nodename){
        var DUR = 3000;  //duration of transition in ms 
        d3.select('#'+nodename+'_circle').transition()
            .duration(DUR)
            .style('fill', 'lime')
            .style('stroke', 'green')
            .attr('r',25);
        
        // recolor all edges coming from parents
        d3.selectAll('[tgt='+nodename+']').transition()
            .duration(DUR/3)
            .style('stroke','green');
            
        // recolor all edges going to children, set as enabled paths
        var children = d3.selectAll('[src='+nodename+']')
        children.transition()
            .duration(DUR)
            .style('stroke','blue');
        children.each(function(d){ d.enabled = 'true'});
        
    },

    showTooltip: function(name, desc, x, y, depth){
        // shows a tooltip for the given node if tooltip not already being shown
        var W = 500;
        var H = 100;
        var X = y-W/2;  // yes, x and y are switched here... don't ask me why, they just are.
        var Y = x-H/2;
        var txt_H = H/3;
        console.log('drawing tooltip for:', name,' @ (',X,',',Y,')');
        var box = techtree.treeSVG.append('rect')
                                    .attr('id',name+'_tooltip_box')
                                    .attr('x',X)
                                    .attr('y',Y)
                                    .attr('width',W)
                                    .attr('height',H)
                                    .attr('fill','rgba(200,200,200,0.3)')
                                    .attr("onmouseout" ,function(d){ return "techtree.unshowTooltip('"+name+"')"; })
                                    .attr("onclick"    ,function(d){ return "(techtree._isEnabled("+depth+",'"+name+"') == true) ? techtree.selectNode('"+name+"') : console.log('"+name+"','disabled')"; })
;
              
        var text = techtree.treeSVG.append('text')
                                    .attr('id',name+'_tooltip_txt')
                                    .attr('x',X)
                                    .attr('y',Y+txt_H)
                                    .attr('font-size',txt_H)
                                    .text(desc);
    },
    
    unshowTooltip: function(nodename){
        // removes the given node's tooltip
        d3.select('#'+nodename+'_tooltip_box').remove();
        d3.select('#'+nodename+'_tooltip_txt').remove();
    }
};
