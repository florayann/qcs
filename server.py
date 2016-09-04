from flask import Flask, request
from flask_restful import Resource, Api
from flask.ext.restful import reqparse
import os

app = Flask(__name__, static_url_path='', static_folder='build')
app.add_url_rule('/', 'root', lambda: app.send_static_file('index.html'))
api = Api(app)

testdata = [
    {
	"name":"Flora",
	"room": "216",
	"question": "Mp4",
	"id": "f19"
    },
    {
	"name":"Thomas",
	"room": "218",
	"question": "Lab 2",
	"id": "t2"
    },
    {
	"name":"Dummy",
	"room": "Lost",
	"question": "sldksd",
	"id": "dum21"
    }
]


class HelloWorld(Resource):
    def __init__(self):
        self.data = testdata
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('name', type=str, required=True,
            help='No name provided')
        self.reqparse.add_argument('room', type=str, required=True,
            help='No room provided')
        self.reqparse.add_argument('question', type=str, required=True,
            help='No question provided')
        self.reqparse.add_argument('id', type=str, required=True,
            help='No id provided')
        super().__init__()
        
    def get(self):
        return self.data
    
    def post(self):
        newkid = self.reqparse.parse_args()
        for i, kid in enumerate(self.data):
            if kid["id"] == newkid["id"]:
                self.data[i] = newkid
                return self.data
        self.data.append(newkid)
        return self.data

api.add_resource(HelloWorld, '/hello')

if __name__ == '__main__':
    app.run(debug=True, port=int(os.environ.get("PORT", 3001)))
