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
    id = fields.String(validate=validate.Length(min=1,
                                                max=255))
    
    name = fields.String(validate=validate.Length(min=1,
                                                  max=255))
    room = fields.String(validate=validate.Length(min=1,
                                                  max=255))
    question = fields.String(validate=validate.Length(min=1,
                                                      max=255))
    answer = fields.Boolean(truthy=[])
