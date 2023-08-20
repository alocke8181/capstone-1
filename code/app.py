from flask import Flask, request, render_template, redirect, flash, session, g
from flask_debugtoolbar import DebugToolbarExtension
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from models import db, connect_db, User, Palette, Tag
from forms import RegisterForm
from sqlalchemy.exc import IntegrityError

bcrypt = Bcrypt()

CURR_USER = 'curr_user'

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql:///capstone1'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ECHO'] = True
app.config['SECRET_KEY'] = 'secret'
app.config['DEBUG_TB_INTERCEPT_REDIRECTS'] = False

connect_db(app)

#####################################################################################
#Home Route

@app.route('/')
def show_home():
    """Show the home page"""
    return render_template('home.html')

#####################################################################################
#Login, Logout, and Register

@app.before_request
def add_global_user():
    """If logged in, add the current user to global"""
    if CURR_USER in session:
        g.user = User.query.get(session[CURR_USER])
    else:
        g.user = None

@app.route('/users/register', methods=['GET','POST'])
def register():
    """Handle user registration.
    Create a new user, add to DB, redirect to their page."""
    form = RegisterForm()
    if form.validate_on_submit():
        try:
            user = User.signup(
                username = form.username.data,
                password = form.password.data,
                email = form.email.data,
                pic_url = form.pic_url.data or User.pic_url.default.arg)
        except IntegrityError:
            flash('Username already taken','error')
            return render_template('users/register.html', form=form)
        login_user(user)
        return redirect(f'/users/{user.id}')

@app.route('/users/login', methods=['GET','POST'])
def login():
    """Handle user logins and authentication"""
    form = LoginForm()
    if form.validate_on_submit():
        user = User.authenticate(form.username.data, form.password.data)
        if user:
            login_user(user)
            flash('Login successful.','good')
            return redirect(f'/users/{user.id}')
        else:
            flash('Invalid login!','error')
    return render_template('users/login.html',form=form)

@app.route('/users/logout')
def logout():
    """Handle logouts"""
    logout_user()
    flash('Logout successful.','good')
    return redirect('/')


#####################################################################################
#Helper functions
def generate_tags():
    """Helper function to pre-generate all of the tags.
    See Readme for explanaition of pre-generated tags.
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

def login_user(user):
    """Login the user"""
    session[CURR_USER] = user.id

def logout_user(user):
    """Logout the user"""
    if CURR_USER in session:
        del session[CURR_USER]