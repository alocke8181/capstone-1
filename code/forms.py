from flask_wtf import FlaskForm
from wtforms import StringField, BooleanField, IntegerField, TextAreaField, PasswordField
from wtforms.validators import InputRequired, Optional, NumberRange, URL, AnyOf, Length

class RegisterForm(FlaskForm):
    """Form for registering users"""
    username = StringField('Username', validators=[InputRequired(),Length(max=20, message='Username is too long (max 20 chars)')])
    password = PasswordField('Password',validators=[InputRequired()])
    email = StringField('Email',validators=[InputRequired(), Length(max=50, message='Email is too long (max 50 chars)')])
    pic_url = StringField('Profile Image URL')

class LoginForm(FlaskForm):
    """Form for logging in"""
    username = StringField('Username', validators=[InputRequired()])
    password = PasswordField('Password',validators=[InputRequired()])

class UserEditForm(FlaskForm):
    """Form for editing the user"""
    desc = TextAreaField('Description',validators=[Length(max=300, message='Description is too long (max 300 chars)')], render_kw={'rows':6, 'cols':50})
    email = StringField('Email',validators=[InputRequired(), Length(max=50, message='Email is too long (max 50 chars)')])
    pic_url = StringField('Profile Image URL')
    password = PasswordField('Password',validators=[InputRequired()])

