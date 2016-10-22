from flask import Flask, session
from flask_restful import Resource, Api
from flask_restful import reqparse, request
from flask_restful.inputs import boolean
from functools import wraps
from marshmallow import ValidationError
from qcs.database import QDataBase
from qcs.schemas import *
import json
import time
import os
import base64

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
        if self.qdb.is_queue_instructor(queue_id, session["username"]):
            return function(self, queue_id, *args, **kwargs)

        return {"message": "You're not an instructor for this queue."}, 403
    
    return wrapper


def instructor_required_classop(function):
    @wraps(function)
    def wrapper(self, class_id, *args, **kwargs):
        if self.qdb.is_class_instructor(class_id, session["username"]):
            return function(self, class_id, *args, **kwargs)

        return {"message": "You're not an instructor for this class."}, 403
    
    return wrapper


def queue_required(function):
    @wraps(function)
    def wrapper(self, queue_id, *args, **kwargs):
        q_revision = self.qdb.get_queue_revision(queue_id)

        if q_revision is None:
            return {"message": "Queue not found"}, 410

        return function(self, queue_id, *args, **kwargs)

    return wrapper


def validation_required(function):
    @wraps(function)
    def wrapper(*args, **kwargs):
        try:
            return function(*args, **kwargs)
        except ValidationError as err:
            return err.messages, 400

    return wrapper


class Auth(Resource):
    def __init__(self):
        self.qdb = QDataBase(app.config["DBHOST"])
        
    @login_required
    def get(self):
        return session["username"]

    def post(self):
        json_data = request.get_json()

        data, errors = AuthSchema().load(json_data)

        if errors:
            return errors, 400

        if any([self.qdb.is_class_instructor(c, data.username)
                for c in self.qdb.get_classes()]):
            session["username"] = data.username
        else:
            session["username"] = base64.b64encode(os.urandom(24)).decode("utf-8")

        return AuthSchema().dump(session)

    def delete(self):
        session.pop("username", None)
        return {"message": "Logged out."}


class Queue(Resource):
    def __init__(self):
        self.qdb = QDataBase(app.config["DBHOST"])

        self.delete_reqparse = reqparse.RequestParser()
        self.delete_reqparse.add_argument('id', type=str, required=True,
            help='No name provided')

        self.get_reqparse = reqparse.RequestParser()
        self.get_reqparse.add_argument('force', type=str)
        
        super().__init__()

    def get_queue(self, queue_id):
        queue = self.qdb.get_queue(queue_id).data
        message = self.qdb.get_announcement(queue_id)

        return {"queue": queue, "announcement": message}

    @queue_required
    def get(self, queue_id):
        if self.get_reqparse.parse_args()["force"]:
            return self.get_queue(queue_id)

        q_revision = self.qdb.get_queue_revision(queue_id)
        
        while q_revision == self.qdb.get_queue_revision(queue_id):
            time.sleep(1.0)

        return self.get_queue(queue_id)

    @login_required
    @queue_required
    @validation_required
    def post(self, queue_id):
        if self.qdb.is_queue_paused(queue_id):
            return {"message": "Queue not accepting further questions."}, 409
        json_data = request.get_json()
        newkid = KidSchema(strict=True).load(json_data, partial=("id", "answer")).data
        newkid["id"] = session["username"]
        newkid["answer"] = False
        self.qdb.add_question(queue_id, newkid, newkid["id"])

        return self.get_queue(queue_id)

    @login_required
    @queue_required
    def delete(self, queue_id):
        self.qdb.remove_question(queue_id, session["username"])
        
        return self.get_queue(queue_id)


class InstructorQueue(Queue):
    def __init__(self):
        super().__init__()

    @login_required
    @queue_required
    @instructor_required_queueop
    def get(self, queue_id):
        return {"message": "Instructor confirmed."}

    @login_required
    @queue_required
    @instructor_required_queueop
    @validation_required
    def post(self, queue_id):
        json_data = request.get_json()
        newkid = KidSchema(strict=True).load(json_data,
                                             partial=("id", "answer")).data

        newkid["id"] = newkid.get("id", session["username"])
        newkid["answer"] = newkid.get("answer", False)

        self.qdb.add_question(queue_id, newkid, newkid["id"])

        return self.get_queue(queue_id)

    @login_required
    @queue_required
    @instructor_required_queueop
    def delete(self, queue_id):
        kid = self.delete_reqparse.parse_args()

        self.qdb.remove_question(queue_id, kid["id"])

        return self.get_queue(queue_id)
    
    @login_required
    @queue_required
    @instructor_required_queueop
    @validation_required
    def put(self, queue_id):
        json_data = request.get_json()
        
        message = AnnouncementSchema(strict=True).load(json_data).data["message"]

        if not message:
            self.qdb.remove_announcement(queue_id)
        else:
            self.qdb.add_announcement(queue_id, message)

        return self.get_queue(queue_id)


class QueueInfo(Resource):
    def __init__(self):
        self.qdb = QDataBase(app.config["DBHOST"])

    def get(self, queue_id):
        return self.qdb.get_queue_info(queue_id)

    @login_required
    @queue_required
    @instructor_required_queueop
    def post(self, queue_id):
        self.qdb.resume_queue(queue_id)
        return self.qdb.get_queue_info(queue_id)

    @login_required
    @queue_required
    @instructor_required_queueop
    def delete(self, queue_id):
        self.qdb.pause_queue(queue_id)
        return self.qdb.get_queue_info(queue_id)


class Classes(Resource):
    def __init__(self):
        self.qdb = QDataBase(app.config["DBHOST"])

    def get(self):
        return self.qdb.get_classes()


class QClass(Resource):
    post_schema = QClassPostSchema(strict=True)
    delete_schema = QClassDeleteSchema(strict=True)
    
    def __init__(self):
        self.qdb = QDataBase(app.config["DBHOST"])

    def get(self, class_id):
        return self.qdb.get_queues(class_id)

    @login_required
    @instructor_required_classop
    @validation_required
    def post(self, class_id):
        json_data = request.get_json()
        name = self.post_schema.load(json_data).data["name"]

        if name:
            self.qdb.add_queue(class_id, name)

        return self.qdb.get_queues(class_id)

    @login_required
    @instructor_required_classop
    @validation_required
    def delete(self, class_id):
        json_data = request.get_json()
        queue_id = self.delete_schema.load(json_data).data["id"]

        self.qdb.remove_queue(class_id, queue_id)

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
