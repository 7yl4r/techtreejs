
// the main techtree module
techtree = {
    _dismissedTooltip: undefined,
    drawTree: function(){
        // initial draw of the tree
        console.log('techtree module:\n', techtree);
        var width = treeConfig.treeWidth,
            height = treeConfig.treeHeight;
            
        var txtSize = 16;
        var leftMargin = 250;  // TODO: figure this out dynamically
        
        var tree = d3.layout.tree()
            .size([height, width - leftMargin]);

        var diagonal = d3.svg.diagonal()
            .projection(function(d) { return [d.y, d.x]; });

        techtree.treeSVG = d3.select("#tech-tree").append("svg")
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
                .attr("class", "link-dflt")
                .attr("d", diagonal);

          var node = techtree.treeSVG.selectAll("g.node")
              .data(nodes)
            .enter().append("g")
              .attr("class", "node")
              .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
              .attr(treeConfig.openTooltip, function(d){ return "techtree.showTooltip('"+d.name+"','"+d.text+"',"+d.x+","+d.y+","+d.depth+")"; });

          techtree._drawNodeBoxes(node);


          node.append("text")
              .attr("dx", 10) // function(d) { return d.children ? -12 : 12; })
              .attr("dy", 3)
              .attr("text-anchor", "start") // function(d) { return d.children ? "end" : "start"; })
              .attr('font-size',txtSize)
              .text(treeConfig.showNodeNames ? (function(d) { return d.name; }) : undefined);
        });

        d3.select(self.frameElement).style("height", height + "px");
        
        // set up classes for transitions
        techtree.tpl_link_available = d3.select('body').append('div').attr('class', 'link-available').style('display', 'none');
        techtree.tpl_link_complete = d3.select('body').append('div').attr('class', 'link-complete').style('display', 'none');

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
    
    _drawNodeBoxes: function(node){
        var NODE_SIZE = treeConfig.nodeSize;
        
        if (treeConfig.showImages){
          // add the pattern for each node picture
          node.append('svg:pattern')
          .attr('id', function(d){return d.name+'_img'})  
          .attr('patternUnits', 'userSpaceOnUse')
          .attr('width', NODE_SIZE)
          .attr('height', NODE_SIZE)
          .attr('x',NODE_SIZE/2)
          .attr('y',NODE_SIZE/2)
          .append('svg:image')
            .attr('xlink:href', function(d){return treeConfig.imgDir+d.name+'.png'})
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', NODE_SIZE)
            .attr('height', NODE_SIZE);

           // add the node rect using image patterns
           node.append("rect")
                 .attr("id",function(d) { return d.name+"_circle"; })
                 .attr("rx", NODE_SIZE/4)
                 .attr("ry", NODE_SIZE/4)
                 .attr("y", -NODE_SIZE/2)
                 .attr("x", -NODE_SIZE/2)
                 .attr("width", NODE_SIZE)
                 .attr("height", NODE_SIZE)
                 .style("stroke","gray")
                 .style("fill", function(d) {return "url(#"+d.name+'_img)' });
        } else {
           node.append("rect")
                 .attr("id",function(d) { return d.name+"_circle"; })
                 .attr("rx", NODE_SIZE/4)
                 .attr("ry", NODE_SIZE/4)
                 .attr("y", -NODE_SIZE/2)
                 .attr("x", -NODE_SIZE/2)
                 .attr("width", NODE_SIZE)
                 .attr("height", NODE_SIZE)
                 .style("stroke","gray")
                 .style("fill", "blue");
        }
        
        if (treeConfig.futureTechFog == 'aesthetic'){
           node.append("rect")
                 .attr("id",function(d) { return d.name+"_fog"; })
                 .attr("rx", NODE_SIZE/4)
                 .attr("ry", NODE_SIZE/4)
                 .attr("y", -NODE_SIZE/2)
                 .attr("x", -NODE_SIZE/2)
                 .attr("width", NODE_SIZE)
                 .attr("height", NODE_SIZE)
                 .style("stroke","white")
                 .style("fill", function(d){ return techtree._isEnabled(d.depth,d.name) ? "rgba(0,0,0,0)" : "rgba(200,200,200,0.8)"});
        }
    },

    _completeNode: function(nodename){
        // changes the node to display research completed
        var DUR = 3000;  //duration of transition in ms 

        if (treeConfig.showImages){
		     d3.select('#'+nodename+'_circle').transition()
		         .duration(DUR)
		         .style('stroke', 'green')
        } else {
             d3.select('#'+nodename+'_circle').transition()
		         .duration(DUR)
		         .style('fill', 'lime')
		         .style('stroke', 'green')
        }
        // recolor all edges coming from parents (completed connections)
        d3.selectAll('[tgt='+nodename+']').transition()
            .duration(DUR/3)
            .style('stroke',techtree.tpl_link_complete.style('stroke'));
            
        // recolor all edges going to children (set as enabled paths)
        var children = d3.selectAll('[src='+nodename+']')
        children.transition()
            .duration(DUR)
            .style('stroke',techtree.tpl_link_available.style('stroke'));
        children.each(function(d){ d.enabled = 'true'});
        
        // remove the fog over children
        children.each(function(d){ d3.select('#'+d.target.name+'_fog').remove() });
    },
    
    canAfford: function(nodename){
        // Returns true if user can afford to research the given node, else returns false
        // This method should be overloaded by your game engine to interface with your game state.
        if (confirm("Click ok if you can afford to research "+nodename+", and cancel if you cannot.\nYou should overload techtree.canAfford(nodename) to connect this function to your game state.") == true) {
            return true;
        } else {
            return false;
        }
        return false;

    },
    
    selectNode: function(nodename){
        // this is called when node is selected for research
        
        if (techtree.canAfford(nodename)){
            techtree._completeNode(nodename);
            techtree.unshowTooltip(nodename);
         } else {
            console.log("user can't afford "+nodename);
            //"you can't afford this" animation...
            var TIM = 100
            d3.select('#'+nodename+'_tooltip_box').transition(TIM)
                .style('fill','#DF3A01')
                .style('opacity',0.8);
            d3.select('#'+nodename+'_tooltip_box').transition(TIM)
                .delay(TIM)
                .style('fill','rgb(150,150,150)')
                .style('opacity',0.8);
            d3.select('#'+nodename+'_tooltip_box').transition(TIM)
                .delay(2*TIM)
                .style('fill','#DF3A01')
                .style('opacity',0.8);
            d3.select('#'+nodename+'_tooltip_box').transition(TIM)
                .delay(3*TIM)
                .style('fill','rgb(150,150,150)')
                .style('opacity',0.8);
        }
    },

    showTooltip: function(name, desc, x, y, depth){
        // shows a tooltip for the given node, unless the node has been dismissed
        if (techtree._dismissedTooltip != name){
            var W = treeConfig.tooltipW;
            var H = treeConfig.tooltipH;
            var X = y-W/2;  // yes, x and y are switched here... don't ask me why, they just are.
            var Y = x-H/2;
            var title_H = H/8;
            var txt_H = H/treeConfig.tooltipTextLineCount;
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
                .style('fill','rgb(150,150,150)')
                .style('opacity',0.8);
                  
            var title = techtree.treeSVG.append('text')
                .attr('id',name+'_tooltip_title')
                .attr('x',X+PAD)
                .attr('y',Y+title_H)
                .attr('font-size',title_H)
                .attr('fill', 'rgb(80,80,80)')
                .text(name);
                
            var imgH = 100,
                imgW = 100;
            var img = techtree.treeSVG.append('image')
                .attr('id',name+'_tooltip_img')
                .attr('xlink:href', treeConfig.imgDir+name+'.png')
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
                .attr('fill', 'rgb(40,40,40)');

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
                .text(enabled ? 'click to research' : 'not yet available');
                

            
            // draw UI "button" on top of everything in the tooltip (this should be after all text, but before buttons)
            var UI_rect = techtree.treeSVG.append('rect')
                .attr('id',name+'_tooltip_UI')
                .attr('x',X)
                .attr('y',Y)
                .attr('width',W)
                .attr('height',H)
                .attr('fill','rgba(0,0,0,0)')
                .attr("onmouseout" ,(treeConfig.closeTooltip == 'onmouseout') 
                                     ? function(d){ return "techtree.unshowTooltip('"+name+"')" }
                                     : undefined)
                .attr("onclick"    ,function(d){ return "(techtree._isEnabled("+depth+",'"+name+"') == true) ? techtree.selectNode('"+name+"') : console.log('"+name+"','disabled')"; });
                
            // BUTTONS (these should be last):
            if (treeConfig.closeTooltip == 'x-button'){ 
                var closeButSize = title_H/2;
                var closeBut = techtree.treeSVG.append('text')
                    .attr('id',name+'_tooltip_closeBut')
                    .attr('x', X+W-PAD-closeButSize)
                    .attr('y', Y+PAD+closeButSize)
                    .attr('font-size', closeButSize)
                    .attr('fill', 'rgb(100,10,10)')
                    .attr('onclick', function(d){ return "techtree.unshowTooltip('"+name+"'); techtree._dismissedTooltip='"+name+"'; return false;"; })
                    .text('X');
            }
        }
    },
    
    unshowTooltip: function(nodename){
        // removes the given node's tooltip
        d3.select('#'+nodename+'_tooltip_UI').remove();
        d3.select('#'+nodename+'_tooltip_box').remove();
        d3.select('#'+nodename+'_tooltip_txt').remove();
        d3.select('#'+nodename+'_tooltip_footTxt').remove();
        d3.select('#'+nodename+'_tooltip_title').remove();
        d3.select('#'+nodename+'_tooltip_img').remove();
        if (treeConfig.closeTooltip == 'x-button')
            d3.select('#'+nodename+'_tooltip_closeBut').remove();                  
    }
};
