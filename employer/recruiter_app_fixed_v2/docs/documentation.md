# Recruiter Application - Documentation

## Overview
The Recruiter Application is a web-based tool that allows recruiters to filter applicants based on specific requirements and view matching candidates in an intuitive GUI. The application uses a sophisticated matching algorithm to score applicants against job requirements and provides detailed analysis of each match.

## Features
- Comprehensive requirements form for recruiters
- Advanced matching algorithm with weighted scoring
- Interactive results display with sorting and filtering
- Detailed applicant profiles with match analysis
- Export functionality for results

## Technical Architecture
The application follows a client-server architecture:
- **Frontend**: HTML, CSS, JavaScript with Bootstrap for responsive design
- **Backend**: Python with Flask, SQLAlchemy for database ORM
- **Database**: SQLite for data storage (can be upgraded to PostgreSQL for production)

## Directory Structure
```
recruiter_app/
├── app.py                  # Main application entry point
├── frontend/               # Frontend files
│   ├── index.html          # Main HTML file
│   ├── styles.css          # CSS styles
│   └── script.js           # JavaScript functionality
├── backend/                # Backend files
│   ├── __init__.py         # Backend initialization
│   ├── app/                # Application logic
│   │   ├── __init__.py
│   │   └── matching.py     # Matching algorithm
│   ├── database/           # Database files
│   │   ├── db.py           # Database connection
│   │   └── sample_data.json # Sample data for testing
│   ├── models/             # Data models
│   │   └── models.py       # SQLAlchemy models
│   └── routes/             # API routes
│       └── api.py          # API endpoints
└── docs/                   # Documentation
    ├── requirements_analysis.md
    └── database_schema.md
```

## Installation and Setup

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)

### Installation Steps
1. Clone the repository
2. Navigate to the project directory
3. Install dependencies:
   ```
   pip install -r backend/requirements.txt
   ```
4. Run the application:
   ```
   python app.py
   ```
5. Access the application at http://localhost:5000

## API Documentation

### POST /api/requirements
Submit job requirements and get matching applicants.

**Request Body:**
```json
{
  "jobTitle": "Senior Developer",
  "department": "Engineering",
  "jobDescription": "We are looking for a senior developer...",
  "educationLevel": "Bachelor's",
  "experienceYears": 5,
  "requiredSkills": ["JavaScript", "React", "Node.js"],
  "preferredSkills": ["TypeScript", "AWS"],
  "requiredCertifications": ["AWS Certified Developer"],
  "locationPreference": "San Francisco, CA",
  "relocationRequired": false,
  "minSalary": 120000,
  "maxSalary": 160000
}
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "(555) 123-4567",
    "educationLevel": "Master's",
    "institution": "Stanford University",
    "major": "Computer Science",
    "experienceYears": 8,
    "currentPosition": "Senior Software Engineer",
    "currentCompany": "TechCorp Inc.",
    "location": "San Francisco, CA",
    "willingToRelocate": false,
    "desiredSalary": 145000,
    "skills": [
      {"name": "JavaScript", "matched": true},
      {"name": "React", "matched": true},
      {"name": "Node.js", "matched": true},
      {"name": "Python", "matched": false},
      {"name": "AWS", "matched": true}
    ],
    "certifications": [
      {"name": "AWS Certified Developer"}
    ],
    "matchScore": 92,
    "matchAnalysis": {
      "strengths": [
        "Education exceeds requirements (Master's vs required Bachelor's)",
        "Experience exceeds requirements (8 years vs required 5)",
        "Matches 3 of 3 required skills: JavaScript, React, Node.js",
        "Matches 1 of 2 preferred skills: AWS",
        "Location matches preference (San Francisco, CA)",
        "Salary expectation ($145,000) within budget range ($120,000 - $160,000)"
      ],
      "gaps": []
    }
  }
]
```

### GET /api/applicants
Get all applicants in the system.

**Response:**
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "(555) 123-4567",
    "educationLevel": "Master's",
    "institution": "Stanford University",
    "major": "Computer Science",
    "experienceYears": 8,
    "currentPosition": "Senior Software Engineer",
    "currentCompany": "TechCorp Inc.",
    "location": "San Francisco, CA",
    "willingToRelocate": false,
    "desiredSalary": 145000,
    "skills": [
      {"name": "JavaScript"},
      {"name": "React"},
      {"name": "Node.js"},
      {"name": "Python"},
      {"name": "AWS"}
    ],
    "certifications": [
      {"name": "AWS Certified Developer"}
    ]
  }
]
```

## Matching Algorithm

The matching algorithm uses a weighted scoring system to evaluate applicants against job requirements:

- **Education Match (20 points)**: Compares education levels
- **Experience Match (20 points)**: Evaluates years of experience
- **Required Skills Match (30 points)**: Checks for required skills
- **Preferred Skills Match (10 points)**: Checks for preferred skills
- **Certifications Match (10 points)**: Verifies required certifications
- **Location Match (5 points)**: Considers location preference and relocation willingness
- **Salary Match (5 points)**: Compares salary expectations with budget

The final match score is calculated as a percentage of the total possible points.

## User Guide

### Submitting Requirements
1. Fill out the job requirements form with details about the position
2. Add required skills by typing them in the input field and clicking "Add" or pressing Enter
3. Similarly, add preferred skills and required certifications
4. Click "Find Matching Applicants" to submit the form

### Viewing Results
1. The results section will display matching applicants sorted by match score
2. Use the sort dropdown to sort by match score, name, or experience
3. Use the search box to filter results by any criteria
4. Click on an applicant card to view detailed information
5. Click "Export Results" to download a CSV file of the current results

## Extending the Application

### Adding New Features
1. **Custom Matching Weights**: Allow recruiters to adjust the importance of different criteria
2. **Resume Parsing**: Automatically extract information from uploaded resumes
3. **Interview Scheduling**: Integrate with calendar systems for interview scheduling
4. **Applicant Tracking**: Track applicant status through the hiring process

### Scaling for Production
1. Replace SQLite with PostgreSQL for better performance and concurrency
2. Implement user authentication and role-based access control
3. Add caching for frequently accessed data
4. Deploy using a production WSGI server like Gunicorn
5. Set up monitoring and logging for production use

## Troubleshooting

### Common Issues
1. **Database Connection Errors**: Ensure the database file exists and has proper permissions
2. **API Errors**: Check the server logs for detailed error messages
3. **Frontend Not Loading**: Verify that the Flask server is running and serving static files correctly

### Support
For additional support, please contact the development team.
