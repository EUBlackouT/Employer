"""
Authentication module for the Recruiter Application
Handles user registration, login, and session management
"""
from flask import Blueprint, render_template, redirect, url_for, flash, request, jsonify, current_app
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, BooleanField, SelectField, SubmitField
from wtforms.validators import DataRequired, Email, EqualTo, Length, ValidationError
from werkzeug.urls import url_parse
from ..models.models import User
from ..database.db import get_db_session, close_db_session
import os
import json

# Create blueprint
auth = Blueprint('auth', __name__)

# Initialize login manager
login_manager = LoginManager()
login_manager.login_view = 'auth.login'
login_manager.login_message = 'Please log in to access this page.'

@login_manager.user_loader
def load_user(user_id):
    """Load user by ID for Flask-Login"""
    session = get_db_session()
    try:
        return session.query(User).get(int(user_id))
    finally:
        close_db_session(session)

# Forms
class LoginForm(FlaskForm):
    """Login form"""
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired()])
    remember_me = BooleanField('Remember Me')
    submit = SubmitField('Sign In')

class RegistrationForm(FlaskForm):
    """Registration form"""
    username = StringField('Username', validators=[DataRequired(), Length(min=3, max=64)])
    email = StringField('Email', validators=[DataRequired(), Email()])
    first_name = StringField('First Name', validators=[DataRequired(), Length(max=64)])
    last_name = StringField('Last Name', validators=[DataRequired(), Length(max=64)])
    password = PasswordField('Password', validators=[DataRequired(), Length(min=8)])
    password2 = PasswordField('Repeat Password', validators=[DataRequired(), EqualTo('password')])
    role = SelectField('Role', choices=[('recruiter', 'Recruiter'), ('admin', 'Administrator')])
    language = SelectField('Language', choices=[('en', 'English'), ('nl', 'Nederlands'), ('fr', 'Français')])
    submit = SubmitField('Register')
    
    def validate_username(self, username):
        """Validate username is unique"""
        session = get_db_session()
        try:
            user = session.query(User).filter_by(username=username.data).first()
            if user is not None:
                raise ValidationError('Please use a different username.')
        finally:
            close_db_session(session)
    
    def validate_email(self, email):
        """Validate email is unique"""
        session = get_db_session()
        try:
            user = session.query(User).filter_by(email=email.data).first()
            if user is not None:
                raise ValidationError('Please use a different email address.')
        finally:
            close_db_session(session)

# Routes
@auth.route('/login', methods=['GET', 'POST'])
def login():
    """Handle user login"""
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    
    # Handle API login (AJAX)
    if request.headers.get('Content-Type') == 'application/json':
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        email = data.get('email')
        password = data.get('password')
        remember_me = data.get('remember_me', False)
        
        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400
        
        session = get_db_session()
        try:
            user = session.query(User).filter_by(email=email).first()
            if user is None or not user.check_password(password):
                return jsonify({"error": "Invalid email or password"}), 401
            
            login_user(user, remember=remember_me)
            return jsonify({
                "success": True,
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "role": user.role,
                    "language_preference": user.language_preference
                }
            })
        finally:
            close_db_session(session)
    
    # Handle form login
    form = LoginForm()
    if form.validate_on_submit():
        session = get_db_session()
        try:
            user = session.query(User).filter_by(email=form.email.data).first()
            if user is None or not user.check_password(form.password.data):
                flash('Invalid email or password')
                return redirect(url_for('auth.login'))
            
            login_user(user, remember=form.remember_me.data)
            next_page = request.args.get('next')
            if not next_page or url_parse(next_page).netloc != '':
                next_page = url_for('index')
            return redirect(next_page)
        finally:
            close_db_session(session)
    
    return render_template('auth/login.html', title='Sign In', form=form)

@auth.route('/logout')
def logout():
    """Handle user logout"""
    logout_user()
    
    # Handle API logout (AJAX)
    if request.headers.get('Content-Type') == 'application/json':
        return jsonify({"success": True})
    
    return redirect(url_for('index'))

@auth.route('/register', methods=['GET', 'POST'])
def register():
    """Handle user registration"""
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    
    # Handle API registration (AJAX)
    if request.headers.get('Content-Type') == 'application/json':
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        # Validate required fields
        required_fields = ['username', 'email', 'password', 'first_name', 'last_name']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"{field} is required"}), 400
        
        # Check if username or email already exists
        session = get_db_session()
        try:
            if session.query(User).filter_by(username=data['username']).first():
                return jsonify({"error": "Username already exists"}), 400
            
            if session.query(User).filter_by(email=data['email']).first():
                return jsonify({"error": "Email already exists"}), 400
            
            # Create new user
            user = User(
                username=data['username'],
                email=data['email'],
                first_name=data['first_name'],
                last_name=data['last_name'],
                role=data.get('role', 'recruiter'),
                language_preference=data.get('language_preference', 'en')
            )
            user.set_password(data['password'])
            
            session.add(user)
            session.commit()
            
            # Log in the new user
            login_user(user)
            
            return jsonify({
                "success": True,
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "role": user.role,
                    "language_preference": user.language_preference
                }
            })
        finally:
            close_db_session(session)
    
    # Handle form registration
    form = RegistrationForm()
    if form.validate_on_submit():
        session = get_db_session()
        try:
            user = User(
                username=form.username.data,
                email=form.email.data,
                first_name=form.first_name.data,
                last_name=form.last_name.data,
                role=form.role.data,
                language_preference=form.language.data
            )
            user.set_password(form.password.data)
            
            session.add(user)
            session.commit()
            
            flash('Congratulations, you are now a registered user!')
            return redirect(url_for('auth.login'))
        finally:
            close_db_session(session)
    
    return render_template('auth/register.html', title='Register', form=form)

@auth.route('/profile', methods=['GET', 'POST'])
@login_required
def profile():
    """Handle user profile"""
    # Handle API profile update (AJAX)
    if request.method == 'POST' and request.headers.get('Content-Type') == 'application/json':
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        session = get_db_session()
        try:
            user = session.query(User).get(current_user.id)
            
            # Update fields
            if 'first_name' in data:
                user.first_name = data['first_name']
            if 'last_name' in data:
                user.last_name = data['last_name']
            if 'language_preference' in data:
                user.language_preference = data['language_preference']
            
            # Update password if provided
            if 'password' in data and data['password']:
                user.set_password(data['password'])
            
            session.commit()
            
            return jsonify({
                "success": True,
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "role": user.role,
                    "language_preference": user.language_preference
                }
            })
        finally:
            close_db_session(session)
    
    # Handle GET request
    if request.headers.get('Accept') == 'application/json':
        return jsonify({
            "id": current_user.id,
            "username": current_user.username,
            "email": current_user.email,
            "first_name": current_user.first_name,
            "last_name": current_user.last_name,
            "role": current_user.role,
            "language_preference": current_user.language_preference
        })
    
    return render_template('auth/profile.html', title='Profile')

@auth.route('/check-auth')
def check_auth():
    """Check if user is authenticated (for AJAX calls)"""
    if current_user.is_authenticated:
        return jsonify({
            "authenticated": True,
            "user": {
                "id": current_user.id,
                "username": current_user.username,
                "email": current_user.email,
                "first_name": current_user.first_name,
                "last_name": current_user.last_name,
                "role": current_user.role,
                "language_preference": current_user.language_preference
            }
        })
    else:
        return jsonify({"authenticated": False})

# Social login routes
@auth.route('/login/google')
def google_login():
    """Handle Google login"""
    # This would be implemented with OAuth libraries in a real application
    return jsonify({"error": "Google login not implemented in this demo"}), 501

@auth.route('/login/linkedin')
def linkedin_login():
    """Handle LinkedIn login"""
    # This would be implemented with OAuth libraries in a real application
    return jsonify({"error": "LinkedIn login not implemented in this demo"}), 501

def init_app(app):
    """Initialize authentication for the application"""
    login_manager.init_app(app)
    app.register_blueprint(auth, url_prefix='/auth')
    
    # Create admin user if it doesn't exist
    with app.app_context():
        session = get_db_session()
        try:
            admin = session.query(User).filter_by(username='admin').first()
            if admin is None:
                admin = User(
                    username='admin',
                    email='admin@example.com',
                    first_name='Admin',
                    last_name='User',
                    role='admin',
                    language_preference='en'
                )
                admin.set_password('adminpassword')
                session.add(admin)
                session.commit()
                app.logger.info('Created admin user')
        finally:
            close_db_session(session)
