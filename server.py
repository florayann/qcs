from flask import Flask, request
from flask_restful import Resource, Api
from flask_restful import reqparse
from flask_restful.inputs import boolean
import json
import time
import os

app = Flask(__name__, static_url_path='', static_folder='build')
app.add_url_rule('/', 'root', lambda: app.send_static_file('index.html'))
api = Api(app)

testdata = [
    {
	"name":"Flora",
	"room": "216",
	"question": "Mp4",
	"id": "f19",
    "answer": False,
    },
    {
	"name":"Thomas",
	"room": "218",
	"question": "Lab 2",
	"id": "t2",
    "answer": False,
    },
    {
	"name":"Dummy",
	"room": "Lost",
	"question": "sldksd",
	"id": "dum21",
    "answer": False,
    },
    {
	"name":"Flask",
	"room": "React",
	"question": "web programming",
	"id": "flask11",
    "answer": False,
    }
]


class HelloWorld(Resource):
    def __init__(self):
        self.data = testdata
        self.password = "password"
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('name', type=str, required=True,
            help='No name provided')
        self.reqparse.add_argument('room', type=str, required=True,
            help='No room provided')
        self.reqparse.add_argument('question', type=str, required=True,
            help='No question provided')
        self.reqparse.add_argument('id', type=str, required=True,
            help='No id provided')
        self.reqparse.add_argument('answer', type=boolean)
        self.reqparse.add_argument('password', type=str)
        
        self.delete_reqparse = reqparse.RequestParser()
        self.delete_reqparse.add_argument('id', type=str, required=True,
            help='No name provided')
        self.delete_reqparse.add_argument('password', type=str, required=True,
            help='No password provided')

        self.get_reqparse = reqparse.RequestParser()
        self.get_reqparse.add_argument('force', type=str)

        self.put_reqparse = reqparse.RequestParser()
        self.put_reqparse.add_argument('data', type=str, required=True, help='No list provided')
        self.put_reqparse.add_argument('password', type=str, required=True, help='No password provided')
        
        super().__init__()
        
    def get(self):
        if self.get_reqparse.parse_args()["force"]:
            return self.data
        
        h = hash(str(self.data))
        
        while h == hash(str(self.data)):
            time.sleep(1.0)

        return self.data
        
    def post(self):
        newkid = self.reqparse.parse_args()

        if newkid["answer"]:
            if newkid["password"] and newkid["password"] == self.password:
                for i, kid in enumerate(self.data):
                    if kid["id"] == newkid["id"]:
                        del newkid["password"]
                        self.data[i] = newkid
                        continue
                    if kid["answer"]:
                        kid["answer"] = False
                return self.data
            else:
                return {"message": "Incorrect password"}, 409

        del newkid["password"]
                
        for i, kid in enumerate(self.data):
            if kid["id"] == newkid["id"]:
                self.data[i] = newkid
                return self.data
        self.data.append(newkid)
        return self.data

    def delete(self):
        kid = self.delete_reqparse.parse_args()
        
        if kid["password"] != self.password:
            return {"message": "Incorrect password"}, 409
        for i, kids in enumerate(self.data):
            if kids["id"] == kid["id"]:
                del self.data[i]
                break
        return self.data

    def put(self):
        args = self.put_reqparse.parse_args()
        kids = json.loads(args["data"])
        password = args["password"]
        
        if password != self.password:
            return {"message": "Incorrect password: {}".format(password)}, 409

        self.data = kids
        
        return self.data
        

api.add_resource(HelloWorld, '/hello')

if __name__ == '__main__':
    app.run(debug=True, port=int(os.environ.get("PORT", 3001)), threaded=True)
