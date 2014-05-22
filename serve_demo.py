'''
Sets up a simple http server so you can view demo.html in your browser at `localhost:8000`
'''

import SimpleHTTPServer
import SocketServer

PORT = 8000

Handler = SimpleHTTPServer.SimpleHTTPRequestHandler

httpd = SocketServer.TCPServer(("", PORT), Handler)

print "serving at port", PORT
print 'open your web browser to http://localhost:8000/demo/ to view,\n\tpress ctrl+c to stop.'
httpd.serve_forever()
