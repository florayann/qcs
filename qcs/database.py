import redis
import time
from qcs.schemas import *

class QDataBase():
    def __init__(self, host):
        self.r = redis.StrictRedis(host=host,
                              port=6379,
                              db=0)
        self.dr = redis.StrictRedis(host=host,
                               port=6379,
                               db=0,
                               decode_responses=True)

        self.strict_kid_schema = KidSchema(strict=True)

    def get_classes(self):
        class_ids = [int(i) for i in self.r.smembers("class")]
        pipe = self.dr.pipeline()
        for class_id in class_ids:
            pipe.get("class:{}:name".format(class_id))
        class_names = pipe.execute()
        return dict(zip(class_ids, class_names))

    def add_class(self, name):
        class_id = int(self.r.incr("next_class_id".format(class_id)))
        self.r.set("class:{}:name".format(class_id), name)

    def add_instructor(self, class_id, netid):
        self.r.sadd("class:{}:ins".format(class_id), netid)

    def is_queue_instructor(self, queue_id, netid):
        class_id = self.get_queue_info(queue_id)["class_id"]
        return self.is_class_instructor(class_id, netid)

    def is_class_instructor(self, class_id, netid):
        return self.r.sismember("class:{}:ins".format(class_id), netid)
        
    def get_queue_info(self, queue_id):
        name = self.dr.get("queue:{}:name".format(queue_id))
        class_id = int(self.r.get("queue:{}:class".format(queue_id)))
        paused = bool(int(self.is_queue_paused(queue_id)))
        return {"name": name,
                "class_id": class_id,
                "paused": paused,
                }
    
    def get_queue(self, queue_id):
        question_ids = self.dr.zrange("queue:{}:qs".format(queue_id), 0, -1)
        pipe = self.dr.pipeline()
        
        for question_id in question_ids:
            pipe.hgetall("queue:{}:qs:{}".format(queue_id, question_id))

        result = pipe.execute()
        
        return self.strict_kid_schema.load(result, many=True)

    def get_queues(self, class_id):
        queue_ids = [int(i) for i in self.r.smembers("class:{}:queues".format(class_id))]
        pipe = self.dr.pipeline()
        
        for queue_id in queue_ids:
            pipe.get("queue:{}:name".format(queue_id))

        queue_names = pipe.execute()
        
        return dict(zip(queue_ids, queue_names))
        
    def add_queue(self, class_id, queue_name):
        queue_id = int(self.r.incr("next_queue_id"))
        self.r.sadd("class:{}:queues".format(class_id), queue_id)
        self.r.set("queue:{}:name".format(queue_id), queue_name)
        self.r.set("queue:{}:class".format(queue_id), class_id)
        self.r.set("queue:{}:paused".format(queue_id), 0)
        self.r.incr("queue:{}:rev".format(queue_id))

    def remove_queue(self, class_id, queue_id):
        self.r.srem("class:{}:queues".format(class_id), queue_id)
        self.r.delete("queue:{}:name".format(queue_id))
        self.r.delete("queue:{}:class".format(queue_id))
        self.r.delete("queue:{}:rev".format(queue_id))
        self.r.delete("queue:{}:qs".format(queue_id))
        self.r.delete("queue:{}:paused".format(queue_id))
        self.r.delete("queue:{}".format(queue_id))

    def pause_queue(self, queue_id):
        self.r.set("queue:{}:paused".format(queue_id), 1)

    def resume_queue(self, queue_id):
        self.r.set("queue:{}:paused".format(queue_id), 0)

    def is_queue_paused(self, queue_id):
        return int(self.r.get("queue:{}:paused".format(queue_id))) == 1

    def add_question(self, queue_id, question, question_id):
        self.r.incr("queue:{}:rev".format(queue_id))
        if self.r.zrank("queue:{}:qs".format(queue_id), question_id) is None:
            self.r.zadd("queue:{}:qs".format(queue_id),
                        int(time.time() * 1000),
                        question_id)
        self.r.hmset("queue:{}:qs:{}".format(queue_id, question_id), question)
        self.r.expire("queue:{}:qs:{}".format(queue_id, question_id), 86400)

    def remove_question(self, queue_id, question_id):
        self.r.incr("queue:{}:rev".format(queue_id))
        self.r.zrem("queue:{}:qs".format(queue_id), question_id)
        self.r.delete("queue:{}:qs:{}".format(queue_id, question_id))

    def get_queue_revision(self, queue_id):
        rev = self.r.get("queue:{}:rev".format(queue_id))
        if rev is None:
            return None
        return int(rev)

    def is_kid_answer(self, queue_id, question_id):
        return self.dr.hmget("queue:{}:qs:{}".format(queue_id, question_id),
                             "answer")[0] in ["True", "true", "1"]
