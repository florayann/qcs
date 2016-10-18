from marshmallow import Schema, fields, post_load


class AuthModel():
    def __init__(self, username):
        self.username = username
    
    
class AuthSchema(Schema):
    username = fields.String(required=True)

    @post_load
    def load_auth(self, data):
        return AuthModel(**data)
    
