"""
Updated models module with User model for authentication
"""
from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, Table, Text
from sqlalchemy.orm import relationship
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
from ..database.db import Base

# Association tables for many-to-many relationships
applicant_skill = Table(
    'applicant_skill',
    Base.metadata,
    Column('applicant_id', Integer, ForeignKey('applicants.id')),
    Column('skill_id', Integer, ForeignKey('skills.id'))
)

applicant_certification = Table(
    'applicant_certification',
    Base.metadata,
    Column('applicant_id', Integer, ForeignKey('applicants.id')),
    Column('certification_id', Integer, ForeignKey('certifications.id'))
)

job_skill = Table(
    'job_skill',
    Base.metadata,
    Column('job_id', Integer, ForeignKey('job_positions.id')),
    Column('skill_id', Integer, ForeignKey('skills.id'))
)

job_certification = Table(
    'job_certification',
    Base.metadata,
    Column('job_id', Integer, ForeignKey('job_positions.id')),
    Column('certification_id', Integer, ForeignKey('certifications.id'))
)

class User(Base, UserMixin):
    """User model for authentication"""
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True)
    username = Column(String(64), unique=True, index=True)
    email = Column(String(120), unique=True, index=True)
    password_hash = Column(String(128))
    first_name = Column(String(64))
    last_name = Column(String(64))
    role = Column(String(20), default='recruiter')  # 'admin' or 'recruiter'
    is_active = Column(Boolean, default=True)
    language_preference = Column(String(5), default='en')  # 'en', 'nl', 'fr'
    
    def set_password(self, password):
        """Set password hash"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Check password against hash"""
        return check_password_hash(self.password_hash, password)
    
    def __repr__(self):
        return f'<User {self.username}>'

class Skill(Base):
    """Skill model"""
    __tablename__ = 'skills'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(50), unique=True, nullable=False)
    
    # Relationships
    applicants = relationship('Applicant', secondary=applicant_skill, back_populates='skills')
    jobs = relationship('JobPosition', secondary=job_skill, back_populates='required_skills')
    
    def __repr__(self):
        return f'<Skill {self.name}>'

class Certification(Base):
    """Certification model"""
    __tablename__ = 'certifications'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(100), unique=True, nullable=False)
    
    # Relationships
    applicants = relationship('Applicant', secondary=applicant_certification, back_populates='certifications')
    jobs = relationship('JobPosition', secondary=job_certification, back_populates='required_certifications')
    
    def __repr__(self):
        return f'<Certification {self.name}>'

class Applicant(Base):
    """Applicant model"""
    __tablename__ = 'applicants'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    phone = Column(String(20))
    education_level = Column(String(50))
    institution = Column(String(100))
    major = Column(String(100))
    experience_years = Column(Integer, default=0)
    current_position = Column(String(100))
    current_company = Column(String(100))
    location = Column(String(100))
    willing_to_relocate = Column(Boolean, default=False)
    desired_salary = Column(Float)
    
    # Relationships
    skills = relationship('Skill', secondary=applicant_skill, back_populates='applicants')
    certifications = relationship('Certification', secondary=applicant_certification, back_populates='applicants')
    
    def __repr__(self):
        return f'<Applicant {self.name}>'

class JobRequirement(Base):
    """Job requirement model"""
    __tablename__ = 'job_requirements'
    
    id = Column(Integer, primary_key=True)
    job_id = Column(Integer, ForeignKey('job_positions.id'))
    min_education_level = Column(String(50))
    min_experience_years = Column(Integer, default=0)
    location_preference = Column(String(100))
    relocation_required = Column(Boolean, default=False)
    min_salary = Column(Float)
    max_salary = Column(Float)
    
    # Relationship
    job = relationship('JobPosition', back_populates='requirements')
    
    def __repr__(self):
        return f'<JobRequirement for job_id {self.job_id}>'

class JobPosition(Base):
    """Job position model"""
    __tablename__ = 'job_positions'
    
    id = Column(Integer, primary_key=True)
    title = Column(String(100), nullable=False)
    department = Column(String(100))
    description = Column(Text)
    
    # Relationships
    requirements = relationship('JobRequirement', uselist=False, back_populates='job', cascade='all, delete-orphan')
    required_skills = relationship('Skill', secondary=job_skill, back_populates='jobs')
    required_certifications = relationship('Certification', secondary=job_certification, back_populates='jobs')
    
    def __repr__(self):
        return f'<JobPosition {self.title}>'
