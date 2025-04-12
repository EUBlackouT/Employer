"""
API routes for the Recruiter Application
"""
from flask import Blueprint, request, jsonify, redirect, url_for
import json

# Create blueprint
api = Blueprint('api', __name__)

@api.route('/requirements', methods=['POST'])
def process_requirements():
    """Process job requirements and find matching applicants"""
    try:
        # Get requirements from request
        requirements = request.json
        
        # Validate requirements
        if not requirements:
            return jsonify({"error": "No requirements provided"}), 400
        
        # Import here to avoid circular imports
        from backend.app.matching import MatchingEngine
        
        # Use matching engine to find matching applicants
        matching_engine = MatchingEngine()
        matches = matching_engine.find_matching_applicants_from_requirements(requirements)
        
        # Convert matches to JSON-serializable format
        results = []
        for match in matches:
            applicant = match["applicant"]
            
            # Format skills with matched flag
            skills = []
            for skill in applicant.skills:
                skill_obj = {
                    "name": skill.name,
                    "matched": skill.name in requirements.get('requiredSkills', []) or 
                              skill.name in requirements.get('preferredSkills', [])
                }
                skills.append(skill_obj)
            
            # Format certifications
            certifications = [{"name": cert.name} for cert in applicant.certifications]
            
            # Create applicant object
            applicant_obj = {
                "id": applicant.id,
                "name": applicant.name,
                "email": applicant.email,
                "phone": applicant.phone,
                "educationLevel": applicant.education_level,
                "institution": applicant.institution,
                "major": applicant.major,
                "experienceYears": applicant.experience_years,
                "currentPosition": applicant.current_position,
                "currentCompany": applicant.current_company,
                "location": applicant.location,
                "willingToRelocate": applicant.willing_to_relocate,
                "desiredSalary": applicant.desired_salary,
                "skills": skills,
                "certifications": certifications,
                "matchScore": match["match_score"],
                "matchAnalysis": match["match_analysis"]
            }
            
            results.append(applicant_obj)
        
        return jsonify(results)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Add a new endpoint for matching applicants that matches the frontend URL
@api.route('/match_applicants', methods=['POST'])
def match_applicants():
    """Alias for process_requirements to match frontend URL"""
    return process_requirements()

@api.route('/job', methods=['POST'])
def create_job():
    """Create a new job position with requirements"""
    try:
        # Get job data from request
        job_data = request.json
        
        # Validate job data
        if not job_data:
            return jsonify({"error": "No job data provided"}), 400
        
        # Import here to avoid circular imports
        from backend.database.db import get_db_session, close_db_session
        from backend.models.models import JobPosition, JobRequirement, Skill, Certification
        
        # Get database session
        session = get_db_session()
        
        try:
            # Create job position
            job = JobPosition(
                title=job_data.get('jobTitle'),
                department=job_data.get('department'),
                description=job_data.get('jobDescription')
            )
            session.add(job)
            session.flush()  # Flush to get job ID
            
            # Create job requirements
            requirements = JobRequirement(
                job_id=job.id,
                min_education_level=job_data.get('educationLevel'),
                min_experience_years=job_data.get('experienceYears', 0),
                location_preference=job_data.get('locationPreference'),
                relocation_required=job_data.get('relocationRequired', False),
                min_salary=job_data.get('minSalary'),
                max_salary=job_data.get('maxSalary')
            )
            session.add(requirements)
            
            # Add required skills
            if job_data.get('requiredSkills'):
                for skill_name in job_data['requiredSkills']:
                    # Check if skill exists
                    skill = session.query(Skill).filter(Skill.name == skill_name).first()
                    if not skill:
                        # Create new skill
                        skill = Skill(name=skill_name)
                        session.add(skill)
                        session.flush()
                    
                    # Add skill to job
                    job.required_skills.append(skill)
            
            # Add required certifications
            if job_data.get('requiredCertifications'):
                for cert_name in job_data['requiredCertifications']:
                    # Check if certification exists
                    cert = session.query(Certification).filter(Certification.name == cert_name).first()
                    if not cert:
                        # Create new certification
                        cert = Certification(name=cert_name)
                        session.add(cert)
                        session.flush()
                    
                    # Add certification to job
                    job.required_certifications.append(cert)
            
            # Commit changes
            session.commit()
            
            return jsonify({"id": job.id, "message": "Job created successfully"})
        
        except Exception as e:
            session.rollback()
            raise e
        
        finally:
            close_db_session(session)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api.route('/job/<int:job_id>/matches', methods=['GET'])
def get_job_matches(job_id):
    """Get applicants matching a job position"""
    try:
        # Import here to avoid circular imports
        from backend.app.matching import MatchingEngine
        
        # Use matching engine to find matching applicants
        matching_engine = MatchingEngine()
        matches = matching_engine.find_matching_applicants(job_id)
        
        # Convert matches to JSON-serializable format
        results = []
        for match in matches:
            applicant = match["applicant"]
            
            # Format skills with matched flag
            skills = []
            for skill in applicant.skills:
                skill_obj = {
                    "name": skill.name,
                    "matched": hasattr(skill, 'matched') and skill.matched
                }
                skills.append(skill_obj)
            
            # Format certifications
            certifications = [{"name": cert.name} for cert in applicant.certifications]
            
            # Create applicant object
            applicant_obj = {
                "id": applicant.id,
                "name": applicant.name,
                "email": applicant.email,
                "phone": applicant.phone,
                "educationLevel": applicant.education_level,
                "institution": applicant.institution,
                "major": applicant.major,
                "experienceYears": applicant.experience_years,
                "currentPosition": applicant.current_position,
                "currentCompany": applicant.current_company,
                "location": applicant.location,
                "willingToRelocate": applicant.willing_to_relocate,
                "desiredSalary": applicant.desired_salary,
                "skills": skills,
                "certifications": certifications,
                "matchScore": match["match_score"],
                "matchAnalysis": match["match_analysis"]
            }
            
            results.append(applicant_obj)
        
        return jsonify(results)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api.route('/applicants', methods=['GET'])
def get_applicants():
    """Get all applicants"""
    try:
        # Import here to avoid circular imports
        from backend.database.db import get_db_session, close_db_session
        from backend.models.models import Applicant
        
        # Get database session
        session = get_db_session()
        
        try:
            # Get all applicants
            applicants = session.query(Applicant).all()
            
            # Convert applicants to JSON-serializable format
            results = []
            for applicant in applicants:
                # Format skills
                skills = [{"name": skill.name} for skill in applicant.skills]
                
                # Format certifications
                certifications = [{"name": cert.name} for cert in applicant.certifications]
                
                # Create applicant object
                applicant_obj = {
                    "id": applicant.id,
                    "name": applicant.name,
                    "email": applicant.email,
                    "phone": applicant.phone,
                    "educationLevel": applicant.education_level,
                    "institution": applicant.institution,
                    "major": applicant.major,
                    "experienceYears": applicant.experience_years,
                    "currentPosition": applicant.current_position,
                    "currentCompany": applicant.current_company,
                    "location": applicant.location,
                    "willingToRelocate": applicant.willing_to_relocate,
                    "desiredSalary": applicant.desired_salary,
                    "skills": skills,
                    "certifications": certifications
                }
                
                results.append(applicant_obj)
            
            return jsonify(results)
        
        finally:
            close_db_session(session)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api.route('/applicants/<int:applicant_id>', methods=['GET'])
def get_applicant(applicant_id):
    """Get a specific applicant"""
    try:
        # Import here to avoid circular imports
        from backend.database.db import get_db_session, close_db_session
        from backend.models.models import Applicant
        
        # Get database session
        session = get_db_session()
        
        try:
            # Get applicant
            applicant = session.query(Applicant).filter(Applicant.id == applicant_id).first()
            
            if not applicant:
                return jsonify({"error": "Applicant not found"}), 404
            
            # Format skills
            skills = [{"name": skill.name} for skill in applicant.skills]
            
            # Format certifications
            certifications = [{"name": cert.name} for cert in applicant.certifications]
            
            # Create applicant object
            applicant_obj = {
                "id": applicant.id,
                "name": applicant.name,
                "email": applicant.email,
                "phone": applicant.phone,
                "educationLevel": applicant.education_level,
                "institution": applicant.institution,
                "major": applicant.major,
                "experienceYears": applicant.experience_years,
                "currentPosition": applicant.current_position,
                "currentCompany": applicant.current_company,
                "location": applicant.location,
                "willingToRelocate": applicant.willing_to_relocate,
                "desiredSalary": applicant.desired_salary,
                "skills": skills,
                "certifications": certifications
            }
            
            return jsonify(applicant_obj)
        
        finally:
            close_db_session(session)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api.route('/applicants', methods=['POST'])
def create_applicant():
    """Create a new applicant"""
    try:
        # Get applicant data from request
        applicant_data = request.json
        
        # Validate applicant data
        if not applicant_data:
            return jsonify({"error": "No applicant data provided"}), 400
        
        # Import here to avoid circular imports
        from backend.database.db import get_db_session, close_db_session
        from backend.models.models import Applicant, Skill, Certification
        
        # Get database session
        session = get_db_session()
        
        try:
            # Create applicant
            applicant = Applicant(
                name=applicant_data.get('name'),
                email=applicant_data.get('email'),
                phone=applicant_data.get('phone'),
                education_level=applicant_data.get('educationLevel'),
                institution=applicant_data.get('institution'),
                major=applicant_data.get('major'),
                experience_years=applicant_data.get('experienceYears', 0),
                current_position=applicant_data.get('currentPosition'),
                current_company=applicant_data.get('currentCompany'),
                location=applicant_data.get('location'),
                willing_to_relocate=applicant_data.get('willingToRelocate', False),
                desired_salary=applicant_data.get('desiredSalary')
            )
            session.add(applicant)
            session.flush()  # Flush to get applicant ID
            
            # Add skills
            if applicant_data.get('skills'):
                for skill_name in applicant_data['skills']:
                    # Check if skill exists
                    skill = session.query(Skill).filter(Skill.name == skill_name).first()
                    if not skill:
                        # Create new skill
                        skill = Skill(name=skill_name)
                        session.add(skill)
                        session.flush()
                    
                    # Add skill to applicant
                    applicant.skills.append(skill)
            
            # Add certifications
            if applicant_data.get('certifications'):
                for cert_name in applicant_data['certifications']:
                    # Check if certification exists
                    cert = session.query(Certification).filter(Certification.name == cert_name).first()
                    if not cert:
                        # Create new certification
                        cert = Certification(name=cert_name)
                        session.add(cert)
                        session.flush()
                    
                    # Add certification to applicant
                    applicant.certifications.append(cert)
            
            # Commit changes
            session.commit()
            
            return jsonify({"id": applicant.id, "message": "Applicant created successfully"})
        
        except Exception as e:
            session.rollback()
            raise e
        
        finally:
            close_db_session(session)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
