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


def instructor_required_queueop(function):
    @wraps(function)
    def wrapper(self, queue_id, *args, **kwargs):
        if queue_id in session.get("instructing_queues", set()):
            return function(self, queue_id, *args, **kwargs)
        
        if self.qdb.is_queue_instructor(queue_id, session["username"]):
            if not session.get("instructing_queues", None):
                session["instructing_queues"] = set()
            session["instructing_queues"].add(queue_id)
            return function(self, queue_id, *args, **kwargs)

        return {"message": "You're not an instructor for this queue."}, 403
    
    return wrapper


def queue_required(function):
    @wraps(function)
    def wrapper(self, queue_id, *args, **kwargs):
        q_revision = self.qdb.get_queue_revision(queue_id)

        if q_revision is None:
            return {"message": "Queue not found"}, 410

        return function(self, queue_id, *args, **kwargs)

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

        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('name', type=str, required=True,
            help='No name provided')
        self.reqparse.add_argument('room', type=str, required=True,
            help='No room provided')
        self.reqparse.add_argument('question', type=str, required=True,
            help='No question provided')
        self.reqparse.add_argument('answer', type=boolean)

        self.delete_reqparse = reqparse.RequestParser()
        self.delete_reqparse.add_argument('id', type=str, required=True,
            help='No name provided')

        self.get_reqparse = reqparse.RequestParser()
        self.get_reqparse.add_argument('force', type=str)
        
        super().__init__()

    @queue_required
    def get(self, queue_id):
        if self.get_reqparse.parse_args()["force"]:
            return self.qdb.get_queue(queue_id)

        q_revision = self.qdb.get_queue_revision(queue_id)
        
        while q_revision == self.qdb.get_queue_revision(queue_id):
            time.sleep(1.0)

        return self.qdb.get_queue(queue_id)

    @login_required
    @queue_required
    def post(self, queue_id):
        newkid = self.reqparse.parse_args()
        newkid["id"] = session["username"]
        newkid["answer"] = False
        self.qdb.add_question(queue_id, newkid, newkid["id"])

        return self.qdb.get_queue(queue_id)

    @login_required
    @queue_required
    def delete(self, queue_id):
        self.qdb.remove_question(queue_id, session["username"])
        
        return self.qdb.get_queue(queue_id)


class InstructorQueue(Queue):
    def __init__(self):
        super().__init__()

    @login_required
    @instructor_required_queueop
    @queue_required
    def post(self, queue_id):
        newkid = self.reqparse.parse_args()
        newkid["id"] = session["username"]
        self.qdb.add_question(queue_id, newkid, newkid["id"])

        return self.qdb.get_queue(queue_id)

    @login_required
    @instructor_required_queueop
    @queue_required
    def delete(self, queue_id):
        kid = self.delete_reqparse.parse_args()

        self.qdb.remove_question(queue_id, kid["id"])

        return self.qdb.get_queue(queue_id)


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
api.add_resource(InstructorQueue, "/instructor/queue/<int:queue_id>")
api.add_resource(QueueInfo, "/queue/info/<int:queue_id>")
api.add_resource(Classes, "/classes")
api.add_resource(QClass, "/class/<int:class_id>")

if (app.config["FAKEAUTH"]):
    api.add_resource(Auth, "/auth")

if __name__ == '__main__':
    app.run(debug=True, port=int(os.environ.get("PORT", 3001)), threaded=True)
