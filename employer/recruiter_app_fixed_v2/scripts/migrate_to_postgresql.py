"""
Database migration script for the Recruiter Application
Handles migration from SQLite to PostgreSQL
"""
import os
import sys
import json
from dotenv import load_dotenv

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Load environment variables
load_dotenv()

# Import database modules
from backend.database.db import engine as pg_engine, Base
from backend.models.models import Applicant, Skill, Certification, JobPosition, JobRequirement

# SQLite database path
sqlite_db_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 
                             'backend', 'database', 'recruiter.db')

def migrate_to_postgresql():
    """Migrate data from SQLite to PostgreSQL"""
    print("Starting migration from SQLite to PostgreSQL...")
    
    # Check if PostgreSQL environment variables are set
    if os.getenv('DB_TYPE') != 'postgresql':
        print("Error: DB_TYPE environment variable must be set to 'postgresql'")
        return False
    
    # Check if SQLite database exists
    if not os.path.exists(sqlite_db_path):
        print(f"Error: SQLite database not found at {sqlite_db_path}")
        return False
    
    try:
        # Create tables in PostgreSQL
        print("Creating tables in PostgreSQL...")
        Base.metadata.create_all(pg_engine)
        
        # Connect to PostgreSQL
        from sqlalchemy.orm import sessionmaker
        PgSession = sessionmaker(bind=pg_engine)
        pg_session = PgSession()
        
        # Connect to SQLite
        from sqlalchemy import create_engine
        sqlite_engine = create_engine(f"sqlite:///{sqlite_db_path}")
        SqliteSession = sessionmaker(bind=sqlite_engine)
        sqlite_session = SqliteSession()
        
        # Migrate skills
        print("Migrating skills...")
        sqlite_skills = sqlite_session.query(Skill).all()
        for skill in sqlite_skills:
            new_skill = Skill(
                id=skill.id,
                name=skill.name
            )
            pg_session.add(new_skill)
        
        # Migrate certifications
        print("Migrating certifications...")
        sqlite_certs = sqlite_session.query(Certification).all()
        for cert in sqlite_certs:
            new_cert = Certification(
                id=cert.id,
                name=cert.name
            )
            pg_session.add(new_cert)
        
        # Commit skills and certifications first
        pg_session.commit()
        
        # Migrate applicants
        print("Migrating applicants...")
        sqlite_applicants = sqlite_session.query(Applicant).all()
        for applicant in sqlite_applicants:
            new_applicant = Applicant(
                id=applicant.id,
                name=applicant.name,
                email=applicant.email,
                phone=applicant.phone,
                education_level=applicant.education_level,
                institution=applicant.institution,
                major=applicant.major,
                experience_years=applicant.experience_years,
                current_position=applicant.current_position,
                current_company=applicant.current_company,
                location=applicant.location,
                willing_to_relocate=applicant.willing_to_relocate,
                desired_salary=applicant.desired_salary
            )
            
            # Add skills
            for skill in applicant.skills:
                pg_skill = pg_session.query(Skill).filter_by(id=skill.id).first()
                if pg_skill:
                    new_applicant.skills.append(pg_skill)
            
            # Add certifications
            for cert in applicant.certifications:
                pg_cert = pg_session.query(Certification).filter_by(id=cert.id).first()
                if pg_cert:
                    new_applicant.certifications.append(pg_cert)
            
            pg_session.add(new_applicant)
        
        # Migrate job positions and requirements
        print("Migrating job positions and requirements...")
        sqlite_jobs = sqlite_session.query(JobPosition).all()
        for job in sqlite_jobs:
            new_job = JobPosition(
                id=job.id,
                title=job.title,
                department=job.department,
                description=job.description
            )
            
            # Add requirements
            if job.requirements:
                new_requirements = JobRequirement(
                    job_id=job.id,
                    min_education_level=job.requirements.min_education_level,
                    min_experience_years=job.requirements.min_experience_years,
                    location_preference=job.requirements.location_preference,
                    relocation_required=job.requirements.relocation_required,
                    min_salary=job.requirements.min_salary,
                    max_salary=job.requirements.max_salary
                )
                new_job.requirements = new_requirements
            
            # Add required skills
            for skill in job.required_skills:
                pg_skill = pg_session.query(Skill).filter_by(id=skill.id).first()
                if pg_skill:
                    new_job.required_skills.append(pg_skill)
            
            # Add required certifications
            for cert in job.required_certifications:
                pg_cert = pg_session.query(Certification).filter_by(id=cert.id).first()
                if pg_cert:
                    new_job.required_certifications.append(pg_cert)
            
            pg_session.add(new_job)
        
        # Commit all changes
        pg_session.commit()
        
        print("Migration completed successfully!")
        return True
    
    except Exception as e:
        print(f"Error during migration: {str(e)}")
        return False
    finally:
        # Close sessions
        if 'pg_session' in locals():
            pg_session.close()
        if 'sqlite_session' in locals():
            sqlite_session.close()

if __name__ == "__main__":
    migrate_to_postgresql()
