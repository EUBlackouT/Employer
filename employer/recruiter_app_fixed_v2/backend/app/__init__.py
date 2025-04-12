"""
Main application file for the Recruiter Application
"""
from flask import Flask, render_template, send_from_directory
from flask_cors import CORS
import os
from .routes.api import api
from .database.db import get_db_session, close_db_session
from .models.models import Applicant, Skill, Certification, JobPosition, JobRequirement
import json

def create_app():
    """Create and configure the Flask application"""
    app = Flask(__name__, static_folder=None)
    
    # Enable CORS
    CORS(app)
    
    # Register blueprints
    app.register_blueprint(api, url_prefix='/api')
    
    # Serve frontend files
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_frontend(path):
        if path == "" or path == "index.html":
            return send_from_directory('../frontend', 'index.html')
        return send_from_directory('../frontend', path)
    
    # Initialize database with sample data
    @app.before_first_request
    def init_db_with_sample_data():
        session = get_db_session()
        
        try:
            # Check if database is already populated
            if session.query(Applicant).count() > 0:
                return
            
            # Load sample data
            with open('backend/database/sample_data.json', 'r') as f:
                sample_data = json.load(f)
            
            # Create skills
            skills = {}
            for skill_name in sample_data['skills']:
                skill = Skill(name=skill_name)
                session.add(skill)
                skills[skill_name] = skill
            
            # Create certifications
            certifications = {}
            for cert_name in sample_data['certifications']:
                cert = Certification(name=cert_name)
                session.add(cert)
                certifications[cert_name] = cert
            
            # Flush to get IDs
            session.flush()
            
            # Create applicants
            for applicant_data in sample_data['applicants']:
                applicant = Applicant(
                    name=applicant_data['name'],
                    email=applicant_data['email'],
                    phone=applicant_data['phone'],
                    education_level=applicant_data['educationLevel'],
                    institution=applicant_data['institution'],
                    major=applicant_data['major'],
                    experience_years=applicant_data['experienceYears'],
                    current_position=applicant_data['currentPosition'],
                    current_company=applicant_data['currentCompany'],
                    location=applicant_data['location'],
                    willing_to_relocate=applicant_data['willingToRelocate'],
                    desired_salary=applicant_data['desiredSalary']
                )
                
                # Add skills
                for skill_name in applicant_data['skills']:
                    applicant.skills.append(skills[skill_name])
                
                # Add certifications
                for cert_name in applicant_data['certifications']:
                    applicant.certifications.append(certifications[cert_name])
                
                session.add(applicant)
            
            # Create job positions
            for job_data in sample_data['jobs']:
                job = JobPosition(
                    title=job_data['title'],
                    department=job_data['department'],
                    description=job_data['description']
                )
                
                # Add requirements
                requirements = JobRequirement(
                    min_education_level=job_data['requirements']['minEducationLevel'],
                    min_experience_years=job_data['requirements']['minExperienceYears'],
                    location_preference=job_data['requirements']['locationPreference'],
                    relocation_required=job_data['requirements']['relocationRequired'],
                    min_salary=job_data['requirements']['minSalary'],
                    max_salary=job_data['requirements']['maxSalary']
                )
                
                job.requirements = requirements
                
                # Add required skills
                for skill_name in job_data['requiredSkills']:
                    job.required_skills.append(skills[skill_name])
                
                # Add required certifications
                for cert_name in job_data['requiredCertifications']:
                    job.required_certifications.append(certifications[cert_name])
                
                session.add(job)
            
            # Commit changes
            session.commit()
        
        except Exception as e:
            session.rollback()
            print(f"Error initializing database: {e}")
        
        finally:
            close_db_session(session)
    
    return app
