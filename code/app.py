from flask import Flask, request, render_template, redirect, flash, session, g, abort, jsonify
from flask_debugtoolbar import DebugToolbarExtension
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from models import db, connect_db, User, Palette, Tag
from forms import RegisterForm, LoginForm, UserEditForm, PaletteEditForm
from sqlalchemy.exc import IntegrityError
import requests

bcrypt = Bcrypt()

CURR_USER = 'curr_user'
DEFAULT_PIC = '/static/default-user-icon.png'
BASE_URL = 'http://colormind.io/api/'

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://dejacydg:9jX6UdhDmncVL2k_A935aVzdJNkwuP7h@mahmud.db.elephantsql.com/dejacydg'
#app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql:///capstone1'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ECHO'] = False
app.config['SECRET_KEY'] = 'secret'
app.config['DEBUG_TB_INTERCEPT_REDIRECTS'] = False

connect_db(app)

#####################################################################################
#Home Route

@app.route('/')
def show_home():
    """Show the home page with the 8 most recently created palettes"""
    palettes = Palette.query.order_by(Palette.date_created.desc(), Palette.name.desc()).limit(8).all()
    return render_template('home.html', palettes=palettes)

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
            user = User.register(
                username = form.username.data,
                password = form.password.data,
                email = form.email.data,
                pic_url = form.pic_url.data or DEFAULT_PIC)
            db.session.commit()
        except IntegrityError:
            flash('Username already taken','error')
            return render_template('users/register.html', form=form)
        login_user(user)
        return redirect(f'/users/{user.id}')
    return render_template('users/register.html', form=form)

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
#View, Edit, and Delete user profiles

@app.route('/users/<int:user_id>')
def view_profile(user_id):
    """View a user's profile"""
    user = User.query.get_or_404(user_id)
    return render_template('users/profile.html', user=user)

@app.route('/users/<int:user_id>/edit', methods=['GET','POST'])
def edit_profile(user_id):
    """Authorize and allow edits of a user's profile.
    Returns 403 if they are not authorized."""
    if not g.user or session[CURR_USER] != user_id:
        abort(403)

    form = UserEditForm(obj=g.user)
    if form.validate_on_submit():
        if User.authenticate(g.user.username, form.password.data):
            g.user.desc = form.desc.data
            g.user.email = form.email.data
            g.user.pic_url = form.pic_url.data
            db.session.add(g.user)
            db.session.commit()
            return redirect(f'/users/{g.user.id}')
        else:
            flash('Invalid Password','danger')
            return redirect(f'/users/{user_id}/edit')
    else:
        return render_template('users/edit.html',form=form)

@app.route('/users/<int:user_id>/delete',methods=['GET'])
def delete_profile(user_id):
    """Delete a user's profile.
    Returns 403 if they are not authorized."""

    if not g.user or session[CURR_USER] != user_id:
        abort(403)

    user = User.query.get_or_404(user_id)
    logout_user()
    db.session.delete(g.user)
    db.session.commit()
    return redirect('/')    

#####################################################################################
#Palette creation routes

@app.route('/palettes/new', methods=['GET'])
def show_palette_maker():
    """Show the palette creator page.
    It is pre-populated with colors on load."""
    first_response = requests.post(BASE_URL, json={'model' : 'default'})
    first_models = requests.get('http://colormind.io/list/')
    model_list = process_models(first_models.json()['result'])
    first_colors = first_response.json()['result']
    first_colors = process_colors_out(first_colors)
    tag_list = Tag.query.all()
    return render_template('palettes/create.html', colors=first_colors, models=model_list, tags=tag_list)

@app.route('/palettes/generate', methods=['POST'])
def generate_palette():
    """Generate a palette based on colors that are locked in."""
    colors_in = request.json['colors']
    model = request.json['model']
    colors_processed = process_colors_in(colors_in)
    response = requests.post(BASE_URL, json={'model' : model, 'input' : colors_processed})
    generated_colors = response.json()['result']
    processed_colors = process_colors_out(generated_colors)
    return jsonify(colors=processed_colors)

@app.route('/palettes/save', methods=['POST'])
def save_palette():
    """Save a palette that the user has made.
    Redirects to the view page for that palette."""
    name = request.json['name']
    desc = request.json['desc']
    colors = request.json['colors']
    tags = request.json['tags']
    try:
        palette = Palette(
            name=name,
            desc=desc,
            main=colors[0],
            light_c=colors[1],
            light_a=colors[2],
            dark_c=colors[3],
            dark_a=colors[4]
        )
        for eachTag in tags:
            tag = Tag.query.filter(Tag.name==eachTag).first()
            palette.tags.append(tag)
        db.session.add(palette)
        g.user.palettes.append(palette)
        db.session.add(g.user)
        db.session.commit()
    except:
        return jsonify(error=error)
    else:
        return jsonify(redir_url = f'palettes/{palette.id}'),200
#####################################################################################
#Palette view, edit, and delete routes
@app.route('/palettes/<int:palette_id>')
def show_palette(palette_id, methods=['GET']):
    """Display a palette"""
    palette = Palette.query.get_or_404(palette_id)
    return render_template('/palettes/view.html', palette=palette)

@app.route('/palettes/<int:palette_id>/edit', methods=['GET'])
def edit_palette(palette_id):
    """Edit a palette"""
    palette = Palette.query.get_or_404(palette_id)
    user = palette.user[0]
    tags = Tag.query.all()
    if not g.user or session[CURR_USER] != user.id:
        abort(403)
    return render_template('/palettes/edit.html',palette=palette, tags=tags)

@app.route('/palettes/<int:palette_id>/edit', methods=['POST'])
def save_edit(palette_id):
    """Save the edits to a palette"""
    name = request.json['name']
    desc = request.json['desc']
    tags = request.json['tags']
    palette = Palette.query.get_or_404(palette_id)
    palette.name = name
    palette.desc = desc
    palette.tags.clear()
    for eachTag in tags:
        tag = Tag.query.filter(Tag.name==eachTag).first()
        palette.tags.append(tag)
    db.session.add(palette)
    db.session.commit()
    return jsonify(redir_url = f'palettes/{palette.id}'),200

@app.route('/palettes/<int:palette_id>/delete', methods=['GET'])
def del_palette(palette_id):
    """Delete a palette"""
    palette = Palette.query.get_or_404(palette_id)
    user = palette.user[0]
    if not g.user or session[CURR_USER] != user.id:
        abort(403)
    db.session.delete(palette)
    db.session.commit()
    flash('Palette deleted!')
    return redirect(f'/users/{user.id}')

#####################################################################################
#Palette favorite/unfavorite routes
@app.route('/palettes/<int:palette_id>/favorite', methods=['GET'])
def favorite_palette(palette_id):
    """Add a palette to the user's favorites.
    Users cannot favorite their own palettes."""
    palette = Palette.query.get_or_404(palette_id)
    owner = palette.user[0]
    if owner.id == session[CURR_USER] or g.user == None:
        abort(403)
    g.user.favorites.append(palette)
    db.session.add(g.user)
    db.session.commit()
    return "Success", 200

@app.route('/palettes/<int:palette_id>/unfavorite', methods=['GET'])
def unfavorite_palette(palette_id):
    """Remove a palette from the user's favorites.
    Users cannot unfavorite their own palettes."""
    palette = Palette.query.get_or_404(palette_id)
    owner = palette.user[0]
    if owner.id == session[CURR_USER] or g.user == None:
        abort(403)
    g.user.favorites.remove(palette)
    db.session.add(g.user)
    db.session.commit()
    return "Success", 200

#####################################################################################
#Palette Browsing Routes
@app.route('/palettes/browse', methods=['GET'])
def show_browse_palettes():
    """Return the render template or if there are more palettes to load
    If the CHECK param is set to true it will only return true/false if there are more palettes that could be loaded"""
    page_str = request.args.get('page')
    page_num = 0
    if page_str != None:
        try:
            page_num = int(page_str)
        except:
            abort(404)
    if page_num < 0:
        abort(404)
    user = parse_to_string(request.args.get('user'))
    name = parse_to_string(request.args.get('name'))
    tags = request.args.get('tags')
    if tags != None:
        tags = tags.split('+')
    palettes_all = Palette.query.order_by(Palette.date_created.desc(), Palette.name.desc()).offset(16*page_num).limit(16).all()
    palettes_filtered = filter_palettes(palettes_all, name, user, tags)
    if request.args.get('check') == 'True':
        if (len(palettes_filtered) > 0):
            return jsonify(more = True)
        else:
            return jsonify(more = False)
    else:
        return render_template('/palettes/browse.html', palettes = palettes_filtered)

#####################################################################################
#Tag Route
def get_Tag_Name(tag):
    return tag.name

@app.route('/tags', methods=['GET'])
def get_all_tags():
    tag_objects = Tag.query.all()
    tag_names = list(map(get_Tag_Name, tag_objects))
    return jsonify(tags = tag_names)
#####################################################################################
#Helper functions
def generate_tags():
    """Helper function to pre-generate all of the tags.
    See Readme for explanaition of pre-generated tags."""

    tag_names = ['Black','Dark Grey','Grey','Light Gray','White','Off-White','Silver',
    'Red','Brown','Maroon','Salmon','Pink','Crimson',
    'Orange','Orange Red','Chocolate','Peach','Dark Orange','Goldenrod',
    'Yellow','Gold','Lemon','Beige',
    'Green','Lime','Olive','Dark Green','Sea Green','Mint','Forest Green',
    'Blue','Blue Green','Aqua','Cyan','Sky Blue','Navy','Turquoise',
    'Purple','Indigo','Violet','Plum','Magenta','Orchid',
    'Warm','Hot','Cool','Cold','Neutral','Neon', 'Pastel',
    'Bright','Dark','High Contrast','Low Contrast'
    ]
    tags = []
    for tag_name in tag_names:
        tag = Tag(name=tag_name)
        tags.append(tag)
    db.session.add_all(tags)
    db.session.commit()

def setup():
    """Only needs to be ran once from a Python console"""
    db.create_all()
    generate_tags()

def login_user(user):
    """Login the user"""
    session[CURR_USER] = user.id

def logout_user():
    """Logout the user"""
    if CURR_USER in session:
        del session[CURR_USER]

def process_colors_in(colors):
    """Reorders,Converts to RGB, and returns it as a list
    M,LC,LA,DC,DA->LC,LA,M,DA,DC"""
    convertedColors = []
    orderedColors = []
    for eachColor in colors:
        if eachColor != "N":
            eachColor = eachColor.lstrip('#')
            eachColor = list(int(eachColor[i:i+2],16) for i in (0,2,4))
            convertedColors.append(eachColor)
        else:
            convertedColors.append(eachColor)
    orderedColors.append(convertedColors[1])
    orderedColors.append(convertedColors[2])
    orderedColors.append(convertedColors[0])
    orderedColors.append(convertedColors[4])
    orderedColors.append(convertedColors[3])
    return orderedColors


def process_colors_out(colors):
    """Reorders, converts them to HEX, and returns them as a dictionary
    LC,LA,M,DA,DC -> M,LC,LA,DC,DA"""
    light_c = f"#{'%02x%02x%02x' % tuple(colors[0])}"
    light_a = f"#{'%02x%02x%02x' % tuple(colors[1])}"
    main = f"#{'%02x%02x%02x' % tuple(colors[2])}"
    dark_a = f"#{'%02x%02x%02x' % tuple(colors[3])}"
    dark_c = f"#{'%02x%02x%02x' % tuple(colors[4])}"
    processed = {
        'main':main,
        'light_c':light_c,
        'light_a':light_a,
        'dark_c':dark_c,
        'dark_a':dark_a
    }
    return processed

def process_models(models):
    """Returns a dict with the models
    process_models(['model_1','model_2'])
    {'model_1' : 'Model 1', 'model_2' : 'Model 2'}"""
    processed_models = {}
    for model in models:
        model_title = model.replace('_',' ').title()
        processed_models[model] = model_title
    return processed_models

def make_random_palettes(numPals):
    """Helper function to generate a number of random palettes."""
    for i in range(1, numPals+1):
        res = requests.post(BASE_URL, json={'model' : 'default', 'input' : ['N','N','N','N','N']})
        gen_colors = res.json()['result']
        proc_colors = process_colors_out(gen_colors)
        print(proc_colors)
        palette = Palette(
            name=f'Test {i}', 
            desc=f'Test palette {i}', 
            main=proc_colors['main'],
            light_c=proc_colors['light_c'],
            light_a=proc_colors['light_a'],
            dark_c=proc_colors['dark_c'],
            dark_a=proc_colors['dark_a'])
        tags = Tag.query.limit(5).all()
        for eachTag in tags:
            palette.tags.append(eachTag)
        db.session.add(palette)
        user = User.query.get(1)
        user.palettes.append(palette)
        db.session.add(user)
        db.session.commit()

def parse_to_string(input):
    """In case the user searches for a number"""
    if input != None:
        return str(input)
    else:
        return None

def filter_palettes(palettes, name, user, tags):
    """Filter palettes by name, user, and tags"""
    filtered = []
    name_filtered = []
    user_filtered = []
    if name != None:
        for palette in palettes:
            if name.lower() in palette.name.lower():
                name_filtered.append(palette)
    else:
        name_filtered = palettes
    if user != None:
        for palette in name_filtered:
            if user.lower() == palette.user[0].username.lower():
                user_filtered.append(palette)
    else:
        user_filtered = name_filtered
    if tags != None:
        for palette in user_filtered:
            valid_tags = True
            palette_tags = map(convertTag, palette.serialize()['tags'])
            for tag in tags:
                if tag not in palette_tags:
                    valid_tags = False
            if valid_tags:
                filtered.append(palette)
    else:
        filtered = user_filtered
    return filtered

def convertTag(tag):
    """Convert tag to snake case"""
    converted_Name = tag.lower().replace(" ", "_")
    return converted_Name

#####################################################################################
#Error routes

@app.errorhandler(404)
def page_not_found(e):
    """Handle 404 errors"""
    return render_template('errors/404.html',error=e), 404

@app.errorhandler(403)
def forbidden_access(e):
    "Handle 403 errors"
    return render_template('errors/403.html',error=e), 403
