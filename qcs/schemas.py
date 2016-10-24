from marshmallow import Schema, fields, post_load, validate


class AuthModel():
    def __init__(self, username):
        self.username = username
    
    
class AuthSchema(Schema):
    username = fields.String(required=True)

    @post_load
    def load_auth(self, data):
        return AuthModel(**data)
    

class KidModel():
    def __init__(self, id, name, room, question, answer):
        self.id = id
        self.name = name
        self.room = room
        self.question = question
        self.answer = answer


class KidSchema(Schema):
    id = fields.String(validate=validate.Length(min=1,max=255),
                       required=True)

    name = fields.String(validate=validate.Length(min=1, max=255),
                         required=True)

    room = fields.String(validate=validate.Length(min=1, max=255),
                         required=True)

    question = fields.String(validate=validate.Length(min=1, max=255),
                             required=True)

    answer = fields.Boolean(truthy=[],
                            required=True)


class QueueGetSchema(Schema):
    rev = fields.Integer()


class QClassPostSchema(Schema):
    name = fields.String(validate=validate.Length(min=0, max=255),
                         required=True)


class QClassDeleteSchema(Schema):
    id = fields.Integer(required=True)


class AnnouncementSchema(Schema):
    message = fields.String(validate=validate.Length(max=255),
                            required=True)
