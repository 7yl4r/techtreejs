echo 'compiling less css...'
./node_modules/.bin/lessc ./css/techtree.less > ./techtree-default.css

#echo 'transpiling .coffee into .js...'
#./node_modules/.bin/coffee --output js/coffee --compile coffee

#echo 'browserify-ing module dependencies...'
#./node_modules/.bin/browserify -t coffeeify app.coffee -o bundle.js

echo 'starting localhost server for testing...'
python -m SimpleHTTPServer
