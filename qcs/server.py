from flask import Flask, session
from flask_restful import Resource, Api
from flask_restful import reqparse, request
from flask_restful.inputs import boolean
from functools import wraps
from qcs.database import QDataBase
from qcs.schemas import *
import json
import time
import os

app = Flask(__name__, static_url_path='', static_folder='build')
app.config.from_object("qcs.default_settings")
app.config.from_envvar("QCS_SETTINGS", silent=True)
app.add_url_rule('/', 'root', lambda: app.send_static_file('index.html'))
api = Api(app)

def login_required(function):
    @wraps(function)
    def wrapper(*args, **kwargs):
        if "username" in session:
            return function(*args, **kwargs)
        return {"message": "Authorization required."}, 401
    return wrapper


class Auth(Resource):
    @login_required
    def get(self):
        return session["username"]

    def post(self):
        json_data = request.get_json()

        data, errors = AuthSchema().load(json_data)

        if errors:
            return errors, 400

        session["username"] = data.username

        return AuthSchema().dump(session)

    def delete(self):
        session.pop("username", None)
        return {"message": "Logged out."}


class Queue(Resource):
    def __init__(self):
        self.qdb = QDataBase(app.config["DBHOST"])
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
        self.put_reqparse.add_argument('data',
                                       type=str,
                                       required=True,
                                       help='No list provided')
        self.put_reqparse.add_argument('password',
                                       type=str,
                                       required=True,
                                       help='No password provided')
        
        super().__init__()
        
    def get(self, queue_id):
        if self.get_reqparse.parse_args()["force"]:
            return self.qdb.get_queue(queue_id)
        
        q_revision = self.qdb.get_queue_revision(queue_id)

        if q_revision is None:
            return {"message": "Queue not found"}, 400
        
        while q_revision == self.qdb.get_queue_revision(queue_id):
            time.sleep(1.0)

        return self.qdb.get_queue(queue_id)
        
    def post(self, queue_id):
        q_revision = self.qdb.get_queue_revision(queue_id)

        if q_revision is None:
            return {"message": "Queue not found"}, 400
        
        newkid = self.reqparse.parse_args()

        if (newkid["answer"] is not None and
            newkid["answer"] != self.qdb.is_kid_answer(queue_id, newkid["id"])):
            if newkid["password"] and newkid["password"] == self.password:
                del newkid["password"]
                self.qdb.add_question(queue_id, newkid, newkid["id"])
                return self.qdb.get_queue(queue_id)
            else:
                return {"message": "Incorrect password"}, 403

        del newkid["password"]

        self.qdb.add_question(queue_id, newkid, newkid["id"])

        return self.qdb.get_queue(queue_id)

    def delete(self, queue_id):
        q_revision = self.qdb.get_queue_revision(queue_id)

        if q_revision is None:
            return {"message": "Queue not found"}, 400
        
        kid = self.delete_reqparse.parse_args()
        
        if kid["password"] != self.password:
            return {"message": "Incorrect password"}, 403

        self.qdb.remove_question(queue_id, kid["id"])
        
        return self.qdb.get_queue(queue_id)

    def put(self, queue_id):
        args = self.put_reqparse.parse_args()
        kids = json.loads(args["data"])
        password = args["password"]
        
        if password != self.password:
            return {"message": "Incorrect password: {}".format(password)}, 403

        self.data = kids
        
        return self.data


class QueueInfo(Resource):
    def __init__(self):
        self.qdb = QDataBase(app.config["DBHOST"])

    def get(self, queue_id):
        return self.qdb.get_queue_info(queue_id)


class Classes(Resource):
    def __init__(self):
        self.qdb = QDataBase(app.config["DBHOST"])

    def get(self):
        return self.qdb.get_classes()


class QClass(Resource):
    def __init__(self):
        self.qdb = QDataBase(app.config["DBHOST"])

    def get(self, class_id):
        return self.qdb.get_queues(class_id)


api.add_resource(Queue, "/queue/<int:queue_id>")
api.add_resource(QueueInfo, "/queue/info/<int:queue_id>")
api.add_resource(Classes, "/classes")
api.add_resource(QClass, "/class/<int:class_id>")

if (app.config["FAKEAUTH"]):
    api.add_resource(Auth, "/auth")

if __name__ == '__main__':
    app.run(debug=True, port=int(os.environ.get("PORT", 3001)), threaded=True)
