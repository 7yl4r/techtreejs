techtreejs
==========

a generalizable, customizable js library for displaying your game's tech tree. View a web-demo at [7yl4r.github.io/techtreejs](http://7yl4r.github.io/techtreejs/).

## getting started ##
* `git clone https://github.com/7yl4r/techtreejs` - clone the repo
* `cd techtreejs` - cd into your local copy

### Test Out the Library on Your Local Machine ###
* `python serve_demo.py` - start up the demo server
* open your browser to http://localhost:8000/demo.html

### Using techtree.js on your game ###
It is recommended that you modify the files in the /demo/ to suit your needs. Customization of the tree can take place through:
* a tree.svg file which defines the basic visual layout of your techtree. This file must have:
  * node groups - Each node is a group and must have the label "node_\*", where "*" describes the node. Each node must have objects with the following tags:
    * 'img' 
    * 'box' 
    * 'title' 
    * 'desc'
    * (optional) 'edge1', 'edge2'...'edge#'
* tree_config.js file which specifies tree configuration options

## License ##
Code is open-source under the Creative Commons Attribution 4.0 International (CC BY 4.0) See LICENSE file for full text.
