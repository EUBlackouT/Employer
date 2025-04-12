"""
Main application file with updated configuration for production features
"""
import os
from flask import Flask, render_template, send_from_directory, request, g, session, jsonify, redirect, url_for
from flask_cors import CORS
from dotenv import load_dotenv
from flask_babel import Babel

# Load environment variables
load_dotenv()

def create_app():
    """Create and configure the Flask application"""
    app = Flask(__name__, static_folder=None)
    
    # Load configuration
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-key-change-in-production')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Configure Babel for internationalization
    app.config['BABEL_DEFAULT_LOCALE'] = os.getenv('BABEL_DEFAULT_LOCALE', 'en')
    app.config['BABEL_TRANSLATION_DIRECTORIES'] = os.getenv('BABEL_TRANSLATION_DIRECTORIES', 'translations')
    
    # Enable CORS
    CORS(app)
    
    # Initialize Babel
    babel = Babel(app)
    
    @babel.localeselector
    def get_locale():
        # Get locale from user settings if logged in
        from flask_login import current_user
        if current_user.is_authenticated:
            return current_user.language_preference
        
        # Otherwise try to get it from the session
        if 'language' in session:
            return session['language']
        
        # Or use the browser's preferred language
        return request.accept_languages.best_match(['en', 'nl', 'fr'])
    
    # Initialize database
    from backend.database.db import init_db
    init_db()
    
    # Initialize authentication
    from backend.auth import init_app as init_auth
    init_auth(app)
    
    # Register blueprints
    from backend.routes.api import api
    app.register_blueprint(api, url_prefix='/api')
    
    # Serve frontend files
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_frontend(path):
        if path == "" or path == "index.html":
            return send_from_directory('frontend', 'index.html')
        return send_from_directory('frontend', path)
    
    # Set language route
    @app.route('/set-language/<language>')
    def set_language(language):
        # Validate language
        if language not in ['en', 'nl', 'fr']:
            language = 'en'
        
        # Store in session
        session['language'] = language
        
        # Update user preference if logged in
        from flask_login import current_user
        if current_user.is_authenticated:
            from backend.database.db import get_db_session, close_db_session
            from backend.models.models import User
            
            db_session = get_db_session()
            try:
                user = db_session.query(User).get(current_user.id)
                user.language_preference = language
                db_session.commit()
            finally:
                close_db_session(db_session)
        
        # Redirect back to referring page or home
        return redirect(request.referrer or url_for('serve_frontend'))
    
    # Error handlers
    @app.errorhandler(404)
    def not_found_error(error):
        if request.path.startswith('/api/'):
            return jsonify({"error": "Not found"}), 404
        return send_from_directory('frontend', 'index.html')
    
    @app.errorhandler(500)
    def internal_error(error):
        if request.path.startswith('/api/'):
            return jsonify({"error": "Internal server error"}), 500
        try:
            return send_from_directory('frontend', '500.html'), 500
        except:
            return jsonify({"error": "Internal server error"}), 500
    
    return app

app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=os.getenv('FLASK_ENV') == 'development')
