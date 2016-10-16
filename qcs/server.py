from flask import Flask, request
from flask_restful import Resource, Api
from flask_restful import reqparse
from flask_restful.inputs import boolean
import json
import time
import os
import redis

app = Flask(__name__, static_url_path='', static_folder='build')
app.add_url_rule('/', 'root', lambda: app.send_static_file('index.html'))
api = Api(app)

class QDataBase():
    r = redis.StrictRedis(host='192.168.247.129',
                          port=6379,
                          db=0)
    dr = redis.StrictRedis(host='192.168.247.129',
                           port=6379,
                           db=0,
                           decode_responses=True)
    
    def get_queue(self, queue_id):
        question_ids = self.dr.zrange("queue:{}:qs".format(queue_id), 0, -1)
        pipe = self.dr.pipeline()
        
        for question_id in question_ids:
            pipe.hgetall("queue:{}:qs:{}".format(queue_id, question_id))

        result = pipe.execute()
        
        for question in result:
            question["answer"] = question["answer"] in ["True", "true", "1"]

        return result

    def add_queue(self, class_id, queue_name):
        queue_id = int(self.r.incr("next_queue_id".format(class_id)))
        self.r.sadd("class:{}:queues".format(class_id), queue_id)
        self.set("queue:{}:name".format(queue_id), queue_name)

    def remove_queue(self, class_id, queue_id):
        self.r.srem("class:{}:queues".format(class_id), queue_id)
        self.r.delete("queue:{}:*".format(queue_id))
        self.r.delete("queue:{}".format(queue_id))

    def add_question(self, queue_id, question, question_id):
        self.r.incr("queue:{}:rev".format(queue_id))
        if self.r.zrank("queue:{}:qs".format(queue_id), question_id) is None:
            self.r.zadd("queue:{}:qs".format(queue_id),
                        int(time.time() * 1000),
                        question_id)
        self.r.hmset("queue:{}:qs:{}".format(queue_id, question_id), question)

    def remove_question(self, queue_id, question_id):
        self.r.incr("queue:{}:rev".format(queue_id))
        self.r.zrem("queue:{}:qs".format(queue_id), question_id)
        self.r.delete("queue:{}:qs:{}".format(queue_id, question_id))

    def get_queue_revision(self, queue_id):
        return int(self.r.get("queue:{}:rev".format(queue_id)))

    def is_kid_answer(self, queue_id, question_id):
        return self.dr.hmget("queue:{}:qs:{}".format(queue_id, question_id),
                             "answer")[0] in ["True", "true", "1"]

class Queue(Resource):
    def __init__(self):
        self.qdb = QDataBase()
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
        
        while q_revision == self.qdb.get_queue_revision(queue_id):
            time.sleep(1.0)

        return self.qdb.get_queue(queue_id)
        
    def post(self, queue_id):
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
        

api.add_resource(Queue, "/queue/<int:queue_id>")

if __name__ == '__main__':
    app.run(debug=True, port=int(os.environ.get("PORT", 3001)), threaded=True)
