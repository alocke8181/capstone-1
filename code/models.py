from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from datetime import datetime


db = SQLAlchemy()
bcrypt = Bcrypt()

def connect_db(app):
    db.app = app
    db.init_app(app)
#####################################################################################
class User(db.Model):
    """User"""
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(20), unique=True, nullable=False)
    password = db.Column(db.Text, nullable=False)
    email = db.Column(db.String(50), unique=True, nullable=False)
    pic_url = db.Column(db.Text, default='/static/default-user-icon.png')
    desc = db.Column(db.String(300), default='No description.')
    favorites = db.relationship('Palette', secondary='favorites', backref='favorited_by')
    palettes = db.relationship('Palette', secondary='users_palettes', backref='user')

    @classmethod
    def register(cls, username, password, email, pic_url):
        """Register a user.
        Hashes their password and adds the user to the system"""
        hashed_pw = bcrypt.generate_password_hash(password).decode('UTF-8')
        user = User(
            username = username,
            password = hashed_pw,
            email = email,
            pic_url = pic_url
            )
        db.session.add(user)
        return user

    @classmethod
    def authenticate(cls, username, password):
        """Find user with matching name and password
        Returns False if none is found"""
        user = cls.query.filter_by(username=username).first()
        if user:
            auth = bcrypt.check_password_hash(user.password, password)
            if auth:
                return user
        return False
#####################################################################################
class Palette(db.Model):
    """Palette"""
    __tablename__ = 'palettes'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(20), nullable=False)
    desc = db.Column(db.String(200), default='No description.')
    date_created = db.Column(db.DateTime, nullable=False, default=datetime.utcnow())
    tags = db.relationship('Tag', secondary='palettes_tags', backref='palettes_tagged')
    main = db.Column(db.Text, nullable=False)
    light_c = db.Column(db.Text, nullable=False)
    light_a = db.Column(db.Text, nullable=False)
    dark_c = db.Column(db.Text, nullable=False)
    dark_a = db.Column(db.Text, nullable=False)

    def partial_serialize(self):
        return {
            'name': self.name,
            'id':self.id,
            'user_id':self.user[0].id,
            'user': self.user[0].username,
            'timestamp':self.date_created,
            'main': self.main,
            'light_c':self.light_c,
            'light_a':self.light_a,
            'dark_c':self.dark_c,
            'dark_a':self.dark_a,
        }

#####################################################################################
class Tag(db.Model):
    """Tag"""
    __tablename__ = 'tags'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.Text, nullable=False)
#####################################################################################
class Favorite(db.Model):
    """Favorite
    Connecting table between users and palettes for their favorites."""
    __tablename__ = 'favorites'

    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='cascade'), primary_key=True)
    palette_id = db.Column(db.Integer, db.ForeignKey('palettes.id', ondelete='cascade'), primary_key=True)
#####################################################################################
class User_Palette(db.Model):
    """User_Palette
    Connecting table betweeen users and palettes for their own palettes"""
    __tablename__ = 'users_palettes'

    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='cascade'), primary_key=True)
    palette_id = db.Column(db.Integer, db.ForeignKey('palettes.id', ondelete='cascade'), primary_key=True)
#####################################################################################
class Palette_Tag(db.Model):
    """Palette_Tag
    Connecting table betweeen palettes and tags"""
    __tablename__ = 'palettes_tags'

    palette_id = db.Column(db.Integer, db.ForeignKey('palettes.id', ondelete='cascade'), primary_key=True)
    tag_id = db.Column(db.Integer, db.ForeignKey('tags.id', ondelete='cascade'), primary_key=True)
    