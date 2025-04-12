"""
Matching algorithm for applicants and job requirements
"""
from sqlalchemy import desc
from ..models.models import Applicant, JobPosition, JobRequirement, Skill, Certification, ApplicantMatch
from ..database.db import get_db_session, close_db_session

class MatchingEngine:
    """Engine for matching applicants to job requirements"""
    
    def __init__(self):
        self.session = get_db_session()
        
    def __del__(self):
        close_db_session(self.session)
    
    def find_matching_applicants(self, job_id):
        """Find applicants matching a job position's requirements"""
        job = self.session.query(JobPosition).filter(JobPosition.id == job_id).first()
        if not job:
            return []
            
        # Get all applicants
        applicants = self.session.query(Applicant).all()
        
        # Calculate match scores
        matches = []
        for applicant in applicants:
            match_score = self._calculate_match_score(applicant, job)
            if match_score > 30:  # Only include reasonable matches
                match = {
                    "applicant": applicant,
                    "match_score": match_score,
                    "match_analysis": self._generate_match_analysis(applicant, job)
                }
                matches.append(match)
                
                # Save match to database
                self._save_match(applicant.id, job.id, match_score)
        
        # Sort by match score (descending)
        matches.sort(key=lambda x: x["match_score"], reverse=True)
        return matches
    
    def find_matching_applicants_from_requirements(self, requirements):
        """Find applicants matching requirements without creating a job position"""
        # Get all applicants
        applicants = self.session.query(Applicant).all()
        
        # Calculate match scores
        matches = []
        for applicant in applicants:
            match_score = self._calculate_match_score_from_requirements(applicant, requirements)
            if match_score > 30:  # Only include reasonable matches
                match = {
                    "applicant": applicant,
                    "match_score": match_score,
                    "match_analysis": self._generate_match_analysis_from_requirements(applicant, requirements)
                }
                matches.append(match)
        
        # Sort by match score (descending)
        matches.sort(key=lambda x: x["match_score"], reverse=True)
        return matches
    
    def _calculate_match_score(self, applicant, job):
        """Calculate match score between an applicant and a job position"""
        score = 0
        max_score = 0
        
        # Get job requirements
        requirements = job.requirements
        
        # Education match (worth 20 points)
        max_score += 20
        if requirements.min_education_level:
            education_levels = ['High School', 'Associate\'s', 'Bachelor\'s', 'Master\'s', 'PhD']
            req_education_index = education_levels.index(requirements.min_education_level) if requirements.min_education_level in education_levels else -1
            app_education_index = education_levels.index(applicant.education_level) if applicant.education_level in education_levels else -1
            
            if req_education_index == -1 or app_education_index >= req_education_index:
                score += 20
        else:
            score += 20
        
        # Experience match (worth 20 points)
        max_score += 20
        if applicant.experience_years >= requirements.min_experience_years:
            exp_ratio = min(applicant.experience_years / max(requirements.min_experience_years, 1), 2)
            score += min(20, 10 + 5 * exp_ratio)
        
        # Required skills match (worth 30 points)
        required_skills = job.required_skills
        if required_skills:
            max_score += 30
            
            # Get applicant skills
            applicant_skills = applicant.skills
            applicant_skill_names = [skill.name for skill in applicant_skills]
            
            # Count matched skills
            matched_skills = [skill for skill in required_skills if skill.name in applicant_skill_names]
            
            # Calculate score based on ratio of matched skills
            skill_ratio = len(matched_skills) / len(required_skills) if required_skills else 0
            score += 30 * skill_ratio
        
        # Certifications match (worth 10 points)
        required_certs = job.required_certifications
        if required_certs:
            max_score += 10
            
            # Get applicant certifications
            applicant_certs = applicant.certifications
            applicant_cert_names = [cert.name for cert in applicant_certs]
            
            # Count matched certifications
            matched_certs = [cert for cert in required_certs if cert.name in applicant_cert_names]
            
            # Calculate score based on ratio of matched certifications
            cert_ratio = len(matched_certs) / len(required_certs) if required_certs else 0
            score += 10 * cert_ratio
        
        # Location match (worth 5 points)
        if requirements.location_preference:
            max_score += 5
            if requirements.location_preference in applicant.location or applicant.location in requirements.location_preference:
                score += 5
            elif applicant.willing_to_relocate and requirements.relocation_required:
                score += 3
        
        # Salary match (worth 5 points)
        if requirements.min_salary and requirements.max_salary:
            max_score += 5
            if applicant.desired_salary >= requirements.min_salary and applicant.desired_salary <= requirements.max_salary:
                score += 5
            else:
                salary_diff = min(
                    abs(applicant.desired_salary - requirements.min_salary),
                    abs(applicant.desired_salary - requirements.max_salary)
                )
                salary_ratio = max(0, 1 - (salary_diff / requirements.max_salary))
                score += 5 * salary_ratio
        
        # Calculate final percentage
        return round((score / max_score) * 100) if max_score > 0 else 0
    
    def _calculate_match_score_from_requirements(self, applicant, requirements):
        """Calculate match score between an applicant and requirements dictionary"""
        score = 0
        max_score = 0
        
        # Education match (worth 20 points)
        if requirements.get('educationLevel'):
            max_score += 20
            education_levels = ['High School', 'Associate\'s', 'Bachelor\'s', 'Master\'s', 'PhD']
            req_education_index = education_levels.index(requirements['educationLevel']) if requirements['educationLevel'] in education_levels else -1
            app_education_index = education_levels.index(applicant.education_level) if applicant.education_level in education_levels else -1
            
            if req_education_index == -1 or app_education_index >= req_education_index:
                score += 20
        
        # Experience match (worth 20 points)
        if requirements.get('experienceYears') is not None:
            max_score += 20
            if applicant.experience_years >= requirements['experienceYears']:
                exp_ratio = min(applicant.experience_years / max(requirements['experienceYears'], 1), 2)
                score += min(20, 10 + 5 * exp_ratio)
        
        # Required skills match (worth 30 points)
        if requirements.get('requiredSkills'):
            max_score += 30
            
            # Get applicant skills
            applicant_skills = [skill.name for skill in applicant.skills]
            
            # Count matched skills
            matched_skills = [skill for skill in requirements['requiredSkills'] if skill in applicant_skills]
            
            # Calculate score based on ratio of matched skills
            skill_ratio = len(matched_skills) / len(requirements['requiredSkills']) if requirements['requiredSkills'] else 0
            score += 30 * skill_ratio
        
        # Preferred skills match (worth 10 points)
        if requirements.get('preferredSkills'):
            max_score += 10
            
            # Get applicant skills
            applicant_skills = [skill.name for skill in applicant.skills]
            
            # Count matched skills
            matched_skills = [skill for skill in requirements['preferredSkills'] if skill in applicant_skills]
            
            # Calculate score based on ratio of matched skills
            skill_ratio = len(matched_skills) / len(requirements['preferredSkills']) if requirements['preferredSkills'] else 0
            score += 10 * skill_ratio
        
        # Certifications match (worth 10 points)
        if requirements.get('requiredCertifications'):
            max_score += 10
            
            # Get applicant certifications
            applicant_certs = [cert.name for cert in applicant.certifications]
            
            # Count matched certifications
            matched_certs = [cert for cert in requirements['requiredCertifications'] if cert in applicant_certs]
            
            # Calculate score based on ratio of matched certifications
            cert_ratio = len(matched_certs) / len(requirements['requiredCertifications']) if requirements['requiredCertifications'] else 0
            score += 10 * cert_ratio
        
        # Location match (worth 5 points)
        if requirements.get('locationPreference'):
            max_score += 5
            if requirements['locationPreference'] in applicant.location or applicant.location in requirements['locationPreference']:
                score += 5
            elif applicant.willing_to_relocate and requirements.get('relocationRequired'):
                score += 3
        
        # Salary match (worth 5 points)
        if requirements.get('minSalary') is not None and requirements.get('maxSalary') is not None:
            max_score += 5
            if applicant.desired_salary >= requirements['minSalary'] and applicant.desired_salary <= requirements['maxSalary']:
                score += 5
            else:
                salary_diff = min(
                    abs(applicant.desired_salary - requirements['minSalary']),
                    abs(applicant.desired_salary - requirements['maxSalary'])
                )
                salary_ratio = max(0, 1 - (salary_diff / requirements['maxSalary']))
                score += 5 * salary_ratio
        
        # Calculate final percentage
        return round((score / max_score) * 100) if max_score > 0 else 0
    
    def _generate_match_analysis(self, applicant, job):
        """Generate analysis of match strengths and gaps"""
        strengths = []
        gaps = []
        
        # Get job requirements
        requirements = job.requirements
        
        # Education analysis
        if requirements.min_education_level:
            education_levels = ['High School', 'Associate\'s', 'Bachelor\'s', 'Master\'s', 'PhD']
            req_education_index = education_levels.index(requirements.min_education_level) if requirements.min_education_level in education_levels else -1
            app_education_index = education_levels.index(applicant.education_level) if applicant.education_level in education_levels else -1
            
            if req_education_index != -1 and app_education_index != -1:
                if app_education_index > req_education_index:
                    strengths.append(f"Education exceeds requirements ({applicant.education_level} vs required {requirements.min_education_level})")
                elif app_education_index == req_education_index:
                    strengths.append(f"Education matches requirements ({applicant.education_level})")
                else:
                    gaps.append(f"Education below requirements ({applicant.education_level} vs required {requirements.min_education_level})")
        
        # Experience analysis
        if applicant.experience_years > requirements.min_experience_years:
            strengths.append(f"Experience exceeds requirements ({applicant.experience_years} years vs required {requirements.min_experience_years})")
        elif applicant.experience_years == requirements.min_experience_years:
            strengths.append(f"Experience matches requirements ({applicant.experience_years} years)")
        else:
            gaps.append(f"Experience below requirements ({applicant.experience_years} years vs required {requirements.min_experience_years})")
        
        # Skills analysis
        required_skills = job.required_skills
        if required_skills:
            # Get applicant skills
            applicant_skill_names = [skill.name for skill in applicant.skills]
            required_skill_names = [skill.name for skill in required_skills]
            
            # Find matched and missing skills
            matched_skills = [skill for skill in required_skill_names if skill in applicant_skill_names]
            missing_skills = [skill for skill in required_skill_names if skill not in applicant_skill_names]
            
            if matched_skills:
                strengths.append(f"Matches {len(matched_skills)} of {len(required_skills)} required skills: {', '.join(matched_skills)}")
            
            if missing_skills:
                gaps.append(f"Missing {len(missing_skills)} required skills: {', '.join(missing_skills)}")
        
        # Location analysis
        if requirements.location_preference:
            if requirements.location_preference in applicant.location or applicant.location in requirements.location_preference:
                strengths.append(f"Location matches preference ({applicant.location})")
            elif applicant.willing_to_relocate and requirements.relocation_required:
                strengths.append("Willing to relocate as required")
            elif requirements.relocation_required and not applicant.willing_to_relocate:
                gaps.append("Not willing to relocate as required")
            else:
                gaps.append(f"Location ({applicant.location}) does not match preference ({requirements.location_preference})")
        
        # Salary analysis
        if requirements.min_salary and requirements.max_salary:
            if applicant.desired_salary >= requirements.min_salary and applicant.desired_salary <= requirements.max_salary:
                strengths.append(f"Salary expectation (${applicant.desired_salary:,}) within budget range (${requirements.min_salary:,} - ${requirements.max_salary:,})")
            elif applicant.desired_salary < requirements.min_salary:
                strengths.append(f"Salary expectation (${applicant.desired_salary:,}) below budget minimum (${requirements.min_salary:,})")
            else:
                gaps.append(f"Salary expectation (${applicant.desired_salary:,}) above budget maximum (${requirements.max_salary:,})")
        
        return {"strengths": strengths, "gaps": gaps}
    
    def _generate_match_analysis_from_requirements(self, applicant, requirements):
        """Generate analysis of match strengths and gaps from requirements dictionary"""
        strengths = []
        gaps = []
        
        # Education analysis
        if requirements.get('educationLevel'):
            education_levels = ['High School', 'Associate\'s', 'Bachelor\'s', 'Master\'s', 'PhD']
            req_education_index = education_levels.index(requirements['educationLevel']) if requirements['educationLevel'] in education_levels else -1
            app_education_index = education_levels.index(applicant.education_level) if applicant.education_level in education_levels else -1
            
            if req_education_index != -1 and app_education_index != -1:
                if app_education_index > req_education_index:
                    strengths.append(f"Education exceeds requirements ({applicant.education_level} vs required {requirements['educationLevel']})")
                elif app_education_index == req_education_index:
                    strengths.append(f"Education matches requirements ({applicant.education_level})")
                else:
                    gaps.append(f"Education below requirements ({applicant.education_level} vs required {requirements['educationLevel']})")
        
        # Experience analysis
        if requirements.get('experienceYears') is not None:
            if applicant.experience_years > requirements['experienceYears']:
                strengths.append(f"Experience exceeds requirements ({applicant.experience_years} years vs required {requirements['experienceYears']})")
            elif applicant.experience_years == requirements['experienceYears']:
                strengths.append(f"Experience matches requirements ({applicant.experience_years} years)")
            else:
                gaps.append(f"Experience below requirements ({applicant.experience_years} years vs required {requirements['experienceYears']})")
        
        # Skills analysis
        if requirements.get('requiredSkills'):
            # Get applicant skills
            applicant_skills = [skill.name for skill in applicant.skills]
            
            # Find matched and missing skills
            matched_skills = [skill for skill in requirements['requiredSkills'] if skill in applicant_skills]
            missing_skills = [skill for skill in requirements['requiredSkills'] if skill not in applicant_skills]
            
            if matched_skills:
                strengths.append(f"Matches {len(matched_skills)} of {len(requirements['requiredSkills'])} required skills: {', '.join(matched_skills)}")
            
            if missing_skills:
                gaps.append(f"Missing {len(missing_skills)} required skills: {', '.join(missing_skills)}")
        
        # Preferred skills analysis
        if requirements.get('preferredSkills'):
            # Get applicant skills
            applicant_skills = [skill.name for skill in applicant.skills]
            
            # Find matched preferred skills
            matched_skills = [skill for skill in requirements['preferredSkills'] if skill in applicant_skills]
            
            if matched_skills:
                strengths.append(f"Matches {len(matched_skills)} of {len(requirements['preferredSkills'])} preferred skills: {', '.join(matched_skills)}")
        
        # Location analysis
        if requirements.get('locationPreference'):
            if requirements['locationPreference'] in applicant.location or applicant.location in requirements['locationPreference']:
                strengths.append(f"Location matches preference ({applicant.location})")
            elif applicant.willing_to_relocate and requirements.get('relocationRequired'):
                strengths.append("Willing to relocate as required")
            elif requirements.get('relocationRequired') and not applicant.willing_to_relocate:
                gaps.append("Not willing to relocate as required")
            else:
                gaps.append(f"Location ({applicant.location}) does not match preference ({requirements['locationPreference']})")
        
        # Salary analysis
        if requirements.get('minSalary') is not None and requirements.get('maxSalary') is not None:
            if applicant.desired_salary >= requirements['minSalary'] and applicant.desired_salary <= requirements['maxSalary']:
                strengths.append(f"Salary expectation (${applicant.desired_salary:,}) within budget range (${requirements['minSalary']:,} - ${requirements['maxSalary']:,})")
            elif applicant.desired_salary < requirements['minSalary']:
                strengths.append(f"Salary expectation (${applicant.desired_salary:,}) below budget minimum (${requirements['minSalary']:,})")
            else:
                gaps.append(f"Salary expectation (${applicant.desired_salary:,}) above budget maximum (${requirements['maxSalary']:,})")
        
        return {"strengths": strengths, "gaps": gaps}
    
    def _save_match(self, applicant_id, job_id, match_score):
        """Save match to database"""
        # Check if match already exists
        existing_match = self.session.query(ApplicantMatch).filter(
            ApplicantMatch.applicant_id == applicant_id,
            ApplicantMatch.job_id == job_id
        ).first()
        
        if existing_match:
            # Update existing match
            existing_match.match_score = match_score
        else:
            # Create new match
            match = ApplicantMatch(
                applicant_id=applicant_id,
                job_id=job_id,
                match_score=match_score
            )
            self.session.add(match)
        
        self.session.commit()
