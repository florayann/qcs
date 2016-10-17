import redis

class QDataBase():
    r = redis.StrictRedis(host=app.config["DBHOST"],
                          port=6379,
                          db=0)
    dr = redis.StrictRedis(host=app.config["DBHOST"],
                           port=6379,
                           db=0,
                           decode_responses=True)

    def get_classes(self):
        class_ids = [int(i) for i in self.r.smembers("class")]
        pipe = self.dr.pipeline()
        for class_id in class_ids:
            pipe.get("class:{}:name".format(class_id))
        class_names = pipe.execute()
        return dict(zip(class_ids, class_names))

    def add_class(self):
        class_id = int(self.r.incr("next_class_id".format(class_id)))
        
    def get_queue_info(self, queue_id):
        name = self.dr.get("queue:{}:name".format(queue_id))
        return {"name": name}
    
    def get_queue(self, queue_id):
        question_ids = self.dr.zrange("queue:{}:qs".format(queue_id), 0, -1)
        pipe = self.dr.pipeline()
        
        for question_id in question_ids:
            pipe.hgetall("queue:{}:qs:{}".format(queue_id, question_id))

        result = pipe.execute()
        
        for question in result:
            question["answer"] = question["answer"] in ["True", "true", "1"]

        return result

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
        rev = self.r.get("queue:{}:rev".format(queue_id))
        if rev is None:
            return None
        return int(rev)

    def is_kid_answer(self, queue_id, question_id):
        return self.dr.hmget("queue:{}:qs:{}".format(queue_id, question_id),
                             "answer")[0] in ["True", "true", "1"]
