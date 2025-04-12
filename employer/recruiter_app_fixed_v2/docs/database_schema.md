# Database Schema for Recruiter Application

## Applicants Table
```sql
CREATE TABLE applicants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    education_level TEXT,
    institution TEXT,
    major TEXT,
    experience_years INTEGER,
    current_position TEXT,
    current_company TEXT,
    location TEXT,
    willing_to_relocate BOOLEAN DEFAULT 0,
    desired_salary NUMERIC,
    resume_url TEXT,
    application_date DATE DEFAULT CURRENT_DATE,
    notes TEXT
);
```

## Skills Table
```sql
CREATE TABLE skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    category TEXT
);
```

## Applicant Skills (Junction Table)
```sql
CREATE TABLE applicant_skills (
    applicant_id INTEGER,
    skill_id INTEGER,
    proficiency_level TEXT, -- e.g., "Beginner", "Intermediate", "Expert"
    years_experience NUMERIC,
    PRIMARY KEY (applicant_id, skill_id),
    FOREIGN KEY (applicant_id) REFERENCES applicants(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);
```

## Certifications Table
```sql
CREATE TABLE certifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    issuing_organization TEXT
);
```

## Applicant Certifications (Junction Table)
```sql
CREATE TABLE applicant_certifications (
    applicant_id INTEGER,
    certification_id INTEGER,
    issue_date DATE,
    expiry_date DATE,
    PRIMARY KEY (applicant_id, certification_id),
    FOREIGN KEY (applicant_id) REFERENCES applicants(id) ON DELETE CASCADE,
    FOREIGN KEY (certification_id) REFERENCES certifications(id) ON DELETE CASCADE
);
```

## Job Positions Table
```sql
CREATE TABLE job_positions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    department TEXT,
    description TEXT,
    created_date DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'Open' -- Open, Closed, On Hold
);
```

## Job Requirements Table
```sql
CREATE TABLE job_requirements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id INTEGER,
    min_education_level TEXT,
    min_experience_years INTEGER,
    location_preference TEXT,
    relocation_required BOOLEAN DEFAULT 0,
    min_salary NUMERIC,
    max_salary NUMERIC,
    FOREIGN KEY (job_id) REFERENCES job_positions(id) ON DELETE CASCADE
);
```

## Job Required Skills (Junction Table)
```sql
CREATE TABLE job_required_skills (
    job_id INTEGER,
    skill_id INTEGER,
    importance INTEGER DEFAULT 1, -- 1: Nice to have, 2: Important, 3: Critical
    min_years_experience NUMERIC,
    PRIMARY KEY (job_id, skill_id),
    FOREIGN KEY (job_id) REFERENCES job_positions(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);
```

## Job Required Certifications (Junction Table)
```sql
CREATE TABLE job_required_certifications (
    job_id INTEGER,
    certification_id INTEGER,
    importance INTEGER DEFAULT 1, -- 1: Nice to have, 2: Important, 3: Critical
    PRIMARY KEY (job_id, certification_id),
    FOREIGN KEY (job_id) REFERENCES job_positions(id) ON DELETE CASCADE,
    FOREIGN KEY (certification_id) REFERENCES certifications(id) ON DELETE CASCADE
);
```

## Applicant Matching Results Table
```sql
CREATE TABLE applicant_matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id INTEGER,
    applicant_id INTEGER,
    match_score NUMERIC, -- Percentage or points-based score
    match_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (job_id) REFERENCES job_positions(id) ON DELETE CASCADE,
    FOREIGN KEY (applicant_id) REFERENCES applicants(id) ON DELETE CASCADE
);
```

## Indexes for Performance
```sql
CREATE INDEX idx_applicants_education ON applicants(education_level);
CREATE INDEX idx_applicants_experience ON applicants(experience_years);
CREATE INDEX idx_applicants_location ON applicants(location);
CREATE INDEX idx_applicant_skills ON applicant_skills(applicant_id, skill_id);
CREATE INDEX idx_job_required_skills ON job_required_skills(job_id, skill_id);
CREATE INDEX idx_applicant_matches_score ON applicant_matches(job_id, match_score DESC);
```
