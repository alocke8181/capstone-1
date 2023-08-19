from flask import Flask, request, render_template, redirect, flash
from flask_debugtoolbar import DebugToolbarExtension
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from models import db, connect_db, User, Palette, Tag

bcrypt = Bcrypt()

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql:///'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ECHO'] = True
app.config['SECRET_KEY'] = 'secret'
app.config['DEBUG_TB_INTERCEPT_REDIRECTS'] = False

connect_db(app)

#####################################################################################
#App Routes



#####################################################################################
#Helper functions
def generate_tags():
    """Helper function to pre-generate all of the tags.
    Tags are pregenerated to avoid duplicates.
    This function only needs to be called once from iPython."""

    tag_names = ['Black','Dark Grey','Grey','Light Gray','White','Off-White','Silver','Slate',
    'Red','Brown','Maroon','Salmon','Pink','Crimson',
    'Orange','Orange Red''Chocolate','Peach','Dark Orange','Goldenrod',
    'Yellow','Gold','Lemon','Beige',
    'Green','Lime','Olive','Dark Green','Sea Green','Mint','Forest Green',
    'Blue','Blue Green','Aqua','Cyan','Sky Blue','Navy','Turquoise',
    'Purple','Indigo','Violet','Plum','Magenta','Orchid',
    'Warm','Hot','Cool','Cold','Neutral','Neon', 'Pastel'
    'Bright','Dark','High Contrast','Low Contrast'
    ]
    tags = []
    for tag_name in tag_names:
        tag = Tag(name=tag_name)
        tags.append(tag)
    db.session.add_all(tags)
    db.session.commit()