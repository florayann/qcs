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
        revision = self.get_queue_revision(queue_id)

        if not revision:
            return [], [], 0

        question_data = self.dr.zrange("queue:{}:qs".format(queue_id),
                                       0,
                                       -1,
                                       withscores=True)
        if not question_data:
            return [], [], revision

        question_ids, scores = zip(*question_data)

        pipe = self.dr.pipeline()

        for question_id in question_ids:
            pipe.hgetall("queue:{}:qs:{}".format(queue_id, question_id))

        result = pipe.execute()

        return self.strict_kid_schema.load(result, many=True).data, scores, revision

    def get_queues(self, class_id):
        queue_ids = [int(i) for i in self.r.smembers("class:{}:queues".format(class_id))]
        pipe = self.dr.pipeline()
        
        for queue_id in queue_ids:
            pipe.get("queue:{}:name".format(queue_id))

        queue_names = pipe.execute()
        
        return dict(zip(queue_ids, queue_names))
        
    def add_queue(self, class_id, queue_name):
        queue_id = int(self.r.incr("next_queue_id"))
        pipe = self.r.pipeline()
        pipe.sadd("class:{}:queues".format(class_id), queue_id)
        pipe.set("queue:{}:name".format(queue_id), queue_name)
        pipe.set("queue:{}:class".format(queue_id), class_id)
        pipe.set("queue:{}:paused".format(queue_id), 0)
        pipe.incr("queue:{}:rev".format(queue_id))
        pipe.execute()

    def remove_queue(self, class_id, queue_id):
        self.remove_all_questions(queue_id)
        pipe = self.r.pipeline()
        pipe.srem("class:{}:queues".format(class_id), queue_id)
        pipe.delete("queue:{}:name".format(queue_id))
        pipe.delete("queue:{}:class".format(queue_id))
        pipe.delete("queue:{}:rev".format(queue_id))
        pipe.delete("queue:{}:qs".format(queue_id))
        pipe.delete("queue:{}:paused".format(queue_id))
        pipe.delete("queue:{}:announce".format(queue_id))
        pipe.delete("queue:{}".format(queue_id))
        pipe.execute()

    def pause_queue(self, queue_id):
        pipe = self.r.pipeline()
        pipe.set("queue:{}:paused".format(queue_id), 1)
        pipe.incr("queue:{}:rev".format(queue_id))
        pipe.execute()

    def resume_queue(self, queue_id):
        pipe = self.r.pipeline()
        pipe.set("queue:{}:paused".format(queue_id), 0)
        pipe.incr("queue:{}:rev".format(queue_id))
        pipe.execute()

    def is_queue_paused(self, queue_id):
        try:
            return int(self.r.get("queue:{}:paused".format(queue_id))) == 1
        except TypeError:
            return False

    def add_question(self, queue_id, question, question_id):
        if self.r.zrank("queue:{}:qs".format(queue_id), question_id) is None:
            self.r.zadd("queue:{}:qs".format(queue_id),
                        int(time.time() * 1000),
                        question_id)
        pipe = self.r.pipeline()
        pipe.hmset("queue:{}:qs:{}".format(queue_id, question_id), question)
        pipe.incr("queue:{}:rev".format(queue_id))
        pipe.execute()

    def remove_question(self, queue_id, question_id):
        pipe = self.r.pipeline()
        pipe.zrem("queue:{}:qs".format(queue_id), question_id)
        pipe.delete("queue:{}:qs:{}".format(queue_id, question_id))
        pipe.incr("queue:{}:rev".format(queue_id))
        pipe.execute()

    def remove_all_questions(self, queue_id):
        question_ids = self.dr.zrange("queue:{}:qs".format(queue_id), 0, -1)
        pipe = self.r.pipeline()

        for question_id in question_ids:
            pipe.zrem("queue:{}:qs".format(queue_id), question_id)
            pipe.delete("queue:{}:qs:{}".format(queue_id, question_id))

        pipe.incr("queue:{}:rev".format(queue_id))
        pipe.execute()

    def add_announcement(self, queue_id, message):
        pipe = self.r.pipeline()
        pipe.set("queue:{}:announce".format(queue_id), message)
        pipe.incr("queue:{}:rev".format(queue_id))
        pipe.execute()

    def get_announcement(self, queue_id):
        return self.dr.get("queue:{}:announce".format(queue_id))

    def remove_announcement(self, queue_id):
        pipe = self.r.pipeline()
        pipe.delete("queue:{}:announce".format(queue_id))
        pipe.incr("queue:{}:rev".format(queue_id))
        pipe.execute()

    def get_queue_revision(self, queue_id):
        rev = self.r.get("queue:{}:rev".format(queue_id))
        if rev is None:
            return None
        return int(rev)

    def is_kid_answer(self, queue_id, question_id):
        return self.dr.hmget("queue:{}:qs:{}".format(queue_id, question_id),
                             "answer")[0] in ["True", "true", "1"]
