
var test_node = {
  parent: 0,
  label: 'test'
};

// the main techtree module
techtree = {
    _dismissedTooltip: undefined,
    drawTree: function(){
        // initial draw of the tree
        console.log('techtree module:\n', techtree);
        var width = treeConfig.treeWidth,
            height = treeConfig.treeHeight;
            
        var txtSize = 16;

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
              .attr("dx", 10) // function(d) { return d.children ? -12 : 12; })
              .attr("dy", 3)
              .attr("text-anchor", "start") // function(d) { return d.children ? "end" : "start"; })
              .attr('font-size',txtSize)
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

    _completeNode: function(nodename){
        // changes the node to display research completed
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
    
    selectNode: function(nodename){
        // this is called when node is selected for research
        var canAfford = true;  // TODO: send research request to game, get this info back
        
        if (canAfford){
            techtree._completeNode(nodename);
        } else {
            console.log("user can't afford "+nodename);
        }
    },

    showTooltip: function(name, desc, x, y, depth){
        // shows a tooltip for the given node, unless the node has been dismissed
        if (techtree._dismissedTooltip != name){
            var W = 400;
            var H = 200;
            var X = y-W/2;  // yes, x and y are switched here... don't ask me why, they just are.
            var Y = x-H/2;
            var title_H = H/6;
            var txt_H = H/7;
            var PAD = 10;  // space between edges and text
            console.log('drawing tooltip for:', name,' @ (',X,',',Y,')');
            
            // check that tooltip is inside canvas
            if (X < 0){
                X = 0;
            } else if (X+W > treeConfig.treeWidth){
                X = treeConfig.treeWidth - W;
            }
            if (Y < 0){
                Y = 0
            } else if (Y+H > treeConfig.treeHeight){
                Y = treeConfig.treeHeight - H
            }
            
            var enabled = techtree._isEnabled(depth,name);
                
            var box = techtree.treeSVG.append('rect')
                .attr('id',name+'_tooltip_box')
                .attr('x',X)
                .attr('y',Y)
                .attr('width',W)
                .attr('height',H)
                .attr('fill','rgba(150,150,150,0.8)')
                .attr("onmouseout" ,function(d){ return "techtree.unshowTooltip('"+name+"')"; })
                .attr("onclick"    ,function(d){ return "(techtree._isEnabled("+depth+",'"+name+"') == true) ? techtree.selectNode('"+name+"') : console.log('"+name+"','disabled')"; })
                .attr('oncontextmenu', function(d){ return "techtree.unshowTooltip('"+name+"'); techtree._dismissedTooltip='"+name+"'; return false;"; });
                  
            var title = techtree.treeSVG.append('text')
                .attr('id',name+'_tooltip_title')
                .attr('x',X+PAD)
                .attr('y',Y+title_H)
                .attr('font-size',title_H)
                .attr('fill', 'rgb(0,0,0)')
                .text(name);
                
            var imgH = 100,
                imgW = 100;
            var img = techtree.treeSVG.append('image')
                .attr('id',name+'_tooltip_img')
                .attr('xlink:href','./demo_tree/'+name+'.png')
                .attr('x', X+PAD)
                .attr('y', Y+title_H+PAD)
                .attr('width', imgW)
                .attr('height', imgH);
                
            var txtID = name+'_tooltip_txt';
            var txtX = X+PAD+imgW+PAD;
            var txtW = W-(txtX-X)-PAD;
            var text = techtree.treeSVG.append('text')
                .attr('id',txtID)
                .attr('x',txtX)
                .attr('y',Y+title_H)
                .attr('font-size',txt_H)
                .attr('fill', 'rgb(100,100,100)');

            addTextLines = function(element, txt, width, txt_x){
                // adds lines of given "width" with text from "txt" to "element"
                // TODO: fix the "global" vars used in here
                var words = txt.split(' ');
                var lstr = words[0];  // line string

                // add the first line with the 1st word
                line = text.append('tspan')
                    .attr('dx', 0)
                    .attr('dy', txt_H)
                    .text(lstr);

                for (var i = 1; i < words.length; i++) {  // for the rest of the words
                    lstr+=' '+words[i];
                    line.text(lstr);
                    if (line.node().getComputedTextLength() < txtW){ 
                        continue;
                    } else { // over line size limit
                        // remove offending word from last line
                        var lstr = lstr.substring(0, lstr.lastIndexOf(" "));
                        line.text(lstr);
                        // start new line with word
                        lstr = words[i];
                        line = text.append('tspan')
                            .attr('x', txt_x)
                            .attr('dy', txt_H)
                            .text(lstr);
                    }
                }
            };

            addTextLines(text, desc, txtW, txtX);
                                        
            var footTxt = techtree.treeSVG.append('text')
                .attr('id',name+'_tooltip_footTxt')
                .attr('x', X+PAD)
                .attr('y', Y+H-txt_H/2)
                .attr('font-size', txt_H/2)
                .attr('fill', 'rgb(0,50,200)')
                .text((enabled ? 'click to research' : 'not yet available') + '   |   right click to dismiss');
        }
    },
    
    unshowTooltip: function(nodename){
        // removes the given node's tooltip
        d3.select('#'+nodename+'_tooltip_box').remove();
        d3.select('#'+nodename+'_tooltip_txt').remove();
        d3.select('#'+nodename+'_tooltip_footTxt').remove();
        d3.select('#'+nodename+'_tooltip_title').remove();
        d3.select('#'+nodename+'_tooltip_img').remove();
    }
};
