#!/usr/bin/python
import os
from bottle import Bottle, run, static_file, response

basepath = os.path.dirname(os.path.realpath(__file__))

app = Bottle()

@app.route('/')
def index():
   response.set_header('Cache-Control', 'no-cache');
   return static_file('flowchart_builder.html', root=basepath)

@app.route('/<filename:path>')
def load_anything(filename):
   response.set_header('Cache-Control', 'no-cache');
   return static_file(filename, root=basepath)

@app.route('/js/<javascript_file:path>')
def load_script(javascript_file):
   response.set_header('Cache-Control', 'no-cache');
   return static_file(javascript_file, root=basepath + 'js/', mimetype='text/javascript')

@app.route('/css/<css_file:path>')
def load_css(css_file):
   response.set_header('Cache-Control', 'no-cache');
   return static_file(css_file, root=basepath + 'css/', mimetype='text/css')

run(app, host='localhost', port=8080)
