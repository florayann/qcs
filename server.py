from flask import Flask
from flask_restful import Resource, Api
import os

app = Flask(__name__, static_url_path='', static_folder='build')
app.add_url_rule('/', 'root', lambda: app.send_static_file('index.html'))
api = Api(app)

class HelloWorld(Resource):
    def get(self):
        return {'hello': 'world'}

api.add_resource(HelloWorld, '/hello')

if __name__ == '__main__':
    app.run(debug=True, port=int(os.environ.get("PORT", 3000)))
