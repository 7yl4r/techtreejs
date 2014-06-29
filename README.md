techtreejs
==========

a generalizable, customizable js library for displaying your game's tech tree. View a web-demo at [7yl4r.github.io/techtreejs](http://7yl4r.github.io/techtreejs/).

## getting started ##
* `git clone https://github.com/7yl4r/techtreejs` - clone the repo
* `cd techtreejs` - cd into your local copy

### Test Out the Library on Your Local Machine ###
* `python serve_demo.py` - start up the demo server
* open your browser to http://localhost:8080/demo.html

## Using techtree.js on your game ##
See /demo/ for the implmentation of techtree.js that powers the [web-demo 7yl4r.github.io/techtreejs](http://7yl4r.github.io/techtreejs/).

###Basic usage###

```html
    <!-- load techtree dependencies: -->
    <script src="http://d3js.org/d3.v3.min.js"></script>
    
    <!-- load your treeConfig script -->
    <script src="/demo/tree_config.js"></script>
    
    <!-- load the tech tree script -->
    <script src="/techtree.js"></script>
    
    <!-- init the tree -->
    <div id='tech-tree' onload="techtree.drawTree()">
        your tree appears here (TODO: make this work rather than appending to document)
    </div>
```

### Customizing the Tree ###
#### Tree Data ###
The "jsonSrc" var set in your tree config determines where the data tree data comes from, and this file can take any form sufficiently similar to the demo file. Images used for the tree must be .png files stored in the /demo_tree/ directory and must have the same name as the node they represent.

#### Tree Style ###
The tree display can take many different forms based on the treeConfig provided. It is recommended that you modify the treeConfig /demo/ to suit your needs because all options must be specified. The treeConfig can be modified from javascript (as shown in demo/index.html), but this requires reloading of the tree.

### Connecting the Tree to Player Data ###
The state of the research tree is represented in the tree JSON retrieved. The node attribute "enabled" can be set to true/false and defaults to false if not set. 

When a node is selected for research techtree.js calls the dummy method techtree.canAfford("nodeName") and responds according to true/false return value. Simply override this function by setting techtree.canAfford=function(nodestr){ } to connect to your player's data.

Similarly, when techtree.canAfford returns true, techtree.js calls the dummy method techtree.selectNode("nodeName"), which you can override to update the player database.

## License ##
Code is open-source under the Creative Commons Attribution 4.0 International (CC BY 4.0) See LICENSE file for full text.
