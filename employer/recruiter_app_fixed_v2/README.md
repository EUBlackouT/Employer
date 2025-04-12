# Recruiter Application - Enhanced Version

## Overview
The Recruiter Application is a comprehensive tool designed to help recruiters find the perfect candidates for their positions. This enhanced version includes significant improvements to the visual design, production readiness, authentication, multilingual support, and deployment options.

## Features

### Core Functionality
- **Requirement Matching**: Fill out a form with job requirements and get a list of matching applicants
- **Applicant Scoring**: Intelligent algorithm that scores applicants based on multiple criteria
- **Detailed Analysis**: See exactly why each applicant matches or doesn't match requirements
- **Export Capabilities**: Export results to CSV for further processing

### Enhanced Features
- **Modern UI**: Engaging visual design with animations and intuitive interface
- **Authentication System**: User accounts with role-based access control
- **Multilingual Support**: Full support for English, Dutch, and French
- **Production Ready**: Configured with Gunicorn WSGI server and PostgreSQL database
- **Docker Support**: Easy deployment with Docker Compose

## Technical Stack
- **Frontend**: HTML, CSS, JavaScript with Bootstrap
- **Backend**: Python with Flask
- **Database**: SQLite (development) / PostgreSQL (production)
- **Server**: Gunicorn WSGI server with Nginx
- **Containerization**: Docker and Docker Compose
- **Authentication**: Flask-Login with social login options
- **Internationalization**: Flask-Babel

## Installation and Setup

### Local Development Setup
1. Clone the repository:
   ```
   git clone <repository-url>
   cd recruiter_app
   ```

2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Run the application:
   ```
   python app.py
   ```

4. Access the application at http://localhost:5000

### Production Deployment with Docker
1. Clone the repository:
   ```
   git clone <repository-url>
   cd recruiter_app
   ```

2. Configure environment variables:
   ```
   cp .env.example .env
   # Edit .env file with your production settings
   ```

3. Build and start the Docker containers:
   ```
   docker-compose up -d
   ```

4. Access the application at http://localhost

### Database Migration
To migrate from SQLite to PostgreSQL:

1. Configure PostgreSQL connection in .env file
2. Run the migration script:
   ```
   python scripts/migrate_to_postgresql.py
   ```

## User Guide

### Recruiter Role
1. **Login**: Use your credentials to log in or register a new account
2. **Set Language**: Choose your preferred language from the dropdown in the header
3. **Fill Requirements Form**: Enter job details, required skills, education, etc.
4. **View Results**: See matching applicants sorted by match score
5. **Export Results**: Download the list of matching applicants as CSV

### Administrator Role
1. **User Management**: View and manage user accounts
2. **System Settings**: Configure application settings
3. **Data Management**: Manage applicant and job data

## Multilingual Support
The application supports the following languages:
- English (en)
- Dutch/Nederlands (nl)
- French/Français (fr)

To change language:
1. Click the language dropdown in the header
2. Select your preferred language
3. The UI will update immediately

## Authentication
The application supports the following authentication methods:
- Username/password authentication
- Google login (configured in production)
- LinkedIn login (configured in production)

User roles:
- **Recruiter**: Standard user with access to matching functionality
- **Administrator**: Advanced user with access to system settings

## Development Guide

### Project Structure
```
recruiter_app/
├── app.py                  # Main application entry point
├── requirements.txt        # Python dependencies
├── gunicorn_start.sh       # Gunicorn startup script
├── Dockerfile              # Docker configuration
├── docker-compose.yml      # Docker Compose configuration
├── babel.cfg               # Babel configuration
├── frontend/               # Frontend files
│   ├── index.html          # Main HTML file
│   ├── styles.css          # CSS styles
│   ├── script.js           # Main JavaScript
│   └── auth.js             # Authentication JavaScript
├── backend/                # Backend Python code
│   ├── __init__.py         # Package initialization
│   ├── auth/               # Authentication module
│   ├── database/           # Database configuration
│   ├── models/             # Data models
│   └── routes/             # API routes
├── translations/           # Translation files
│   ├── en/                 # English translations
│   ├── nl/                 # Dutch translations
│   └── fr/                 # French translations
├── scripts/                # Utility scripts
│   └── migrate_to_postgresql.py  # Database migration
└── nginx/                  # Nginx configuration
    └── nginx.conf          # Nginx server configuration
```

### Adding New Features
1. **Frontend Changes**:
   - Add HTML elements to frontend/index.html
   - Add styles to frontend/styles.css
   - Add JavaScript functionality to frontend/script.js

2. **Backend Changes**:
   - Add routes in backend/routes/api.py
   - Add models in backend/models/models.py
   - Update database configuration if needed

3. **Translation Updates**:
   - Add new strings to translation files
   - Run `pybabel extract -F babel.cfg -o messages.pot .`
   - Run `pybabel update -i messages.pot -d translations`
   - Edit translation files in translations/*/LC_MESSAGES/messages.po
   - Run `pybabel compile -d translations`

## Maintenance

### Backup and Restore
For PostgreSQL database:
```
# Backup
docker exec recruiter_app_db pg_dump -U postgres recruiter_app > backup.sql

# Restore
cat backup.sql | docker exec -i recruiter_app_db psql -U postgres recruiter_app
```

### Logs
Application logs are stored in the logs directory:
- Access logs: logs/access.log
- Error logs: logs/error.log

### Updating the Application
1. Pull the latest changes:
   ```
   git pull
   ```

2. Rebuild and restart Docker containers:
   ```
   docker-compose down
   docker-compose up -d --build
   ```

## Troubleshooting

### Common Issues
1. **Database Connection Issues**:
   - Check PostgreSQL connection settings in .env file
   - Ensure PostgreSQL container is running

2. **Authentication Problems**:
   - Clear browser cookies and try again
   - Check if the user exists in the database

3. **Docker Deployment Issues**:
   - Check Docker and Docker Compose installation
   - Ensure ports 80 and 5432 are not in use

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements
- Bootstrap for the responsive design framework
- Flask for the web framework
- SQLAlchemy for the ORM
- Docker for containerization
