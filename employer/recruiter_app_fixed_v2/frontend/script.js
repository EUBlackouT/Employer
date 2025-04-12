// Enhanced Recruiter Application JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Form elements
    const requirementsForm = document.getElementById('requirements-form');
    const resultsSection = document.getElementById('results-section');
    const applicantsContainer = document.getElementById('applicants-container');
    const noResults = document.getElementById('no-results');
    
    // Skill management
    const skillInput = document.getElementById('skill-input');
    const addSkillBtn = document.getElementById('add-skill-btn');
    const skillsContainer = document.getElementById('skills-container');
    const requiredSkillsInput = document.getElementById('required-skills');
    
    // Preferred skill management
    const preferredSkillInput = document.getElementById('preferred-skill-input');
    const addPreferredSkillBtn = document.getElementById('add-preferred-skill-btn');
    const preferredSkillsContainer = document.getElementById('preferred-skills-container');
    const preferredSkillsInput = document.getElementById('preferred-skills');
    
    // Certification management
    const certificationInput = document.getElementById('certification-input');
    const addCertificationBtn = document.getElementById('add-certification-btn');
    const certificationsContainer = document.getElementById('certifications-container');
    const requiredCertificationsInput = document.getElementById('required-certifications');
    
    // Sort and search
    const sortBySelect = document.getElementById('sort-by');
    const searchResults = document.getElementById('search-results');
    
    // Export results
    const exportResultsBtn = document.getElementById('export-results');
    
    // Modal elements
    const applicantDetailModal = new bootstrap.Modal(document.getElementById('applicant-detail-modal'));
    const applicantDetailContent = document.getElementById('applicant-detail-content');
    
    // Language selector
    const languageDropdown = document.getElementById('languageDropdown');
    const languageItems = document.querySelectorAll('.dropdown-item[data-lang]');
    
    // Toast elements
    const toastContainer = document.querySelector('.toast-container');
    
    // API endpoint - Use relative URL instead of hardcoded IP
    const API_URL = '/api';
    
    // Current language
    let currentLanguage = 'en';
    
    // Translations
    const translations = {
        en: {
            jobRequirements: 'Job Requirements',
            findMatchingApplicants: 'Find Matching Applicants',
            matchingApplicants: 'Matching Applicants',
            noApplicantsMatch: 'No applicants match your requirements. Try adjusting your criteria.',
            sortBy: 'Sort by:',
            matchScore: 'Match Score',
            name: 'Name',
            experience: 'Experience',
            searchResults: 'Search results...',
            export: 'Export',
            contactApplicant: 'Contact Applicant',
            close: 'Close',
            jobTitle: 'Job Title',
            department: 'Department',
            jobDescription: 'Job Description',
            educationLevel: 'Education Level',
            experienceYears: 'Years of Experience',
            requiredSkills: 'Required Skills',
            preferredSkills: 'Preferred Skills',
            requiredCertifications: 'Required Certifications',
            locationPreference: 'Location Preference',
            relocationRequired: 'Relocation Required',
            minSalary: 'Minimum Salary',
            maxSalary: 'Maximum Salary',
            addSkill: 'Add Skill',
            addCertification: 'Add Certification',
            yes: 'Yes',
            no: 'No',
            selectEducationLevel: 'Select education level',
            highSchool: 'High School',
            associatesDegree: 'Associate\'s Degree',
            bachelorsDegree: 'Bachelor\'s Degree',
            mastersDegree: 'Master\'s Degree',
            phd: 'PhD or Doctorate',
            contactInfo: 'Contact Information',
            email: 'Email:',
            phone: 'Phone:',
            education: 'Education',
            degree: 'Degree:',
            institution: 'Institution:',
            major: 'Major:',
            currentRole: 'Current Role:',
            company: 'Company:',
            location: 'Location',
            current: 'Current:',
            willingToRelocate: 'Willing to Relocate:',
            compensation: 'Compensation',
            desiredSalary: 'Desired Salary:',
            matchAnalysis: 'Match Analysis',
            strengths: 'Strengths:',
            gaps: 'Gaps:',
            loadDemoData: 'Load Demo Data',
            skillAdded: 'Skill Added',
            skillRemoved: 'Skill Removed',
            certificationAdded: 'Certification Added',
            certificationRemoved: 'Certification Removed',
            searchComplete: 'Search Complete',
            found: 'Found',
            matchingApplicantsText: 'matching applicants.',
            error: 'Error',
            failedToFetch: 'Failed to fetch matching applicants. Please try again.',
            exportComplete: 'Export Complete',
            exported: 'Exported',
            applicantsToCSV: 'applicants to CSV.',
            languageChanged: 'Language Changed',
            applicationLanguageChanged: 'Application language changed to',
            demoDataLoaded: 'Demo Data Loaded',
            sampleJobRequirements: 'Sample job requirements have been loaded for demonstration.'
        },
        nl: {
            jobRequirements: 'Functie-eisen',
            findMatchingApplicants: 'Zoek Passende Kandidaten',
            matchingApplicants: 'Passende Kandidaten',
            noApplicantsMatch: 'Geen kandidaten voldoen aan uw eisen. Probeer uw criteria aan te passen.',
            sortBy: 'Sorteer op:',
            matchScore: 'Match Score',
            name: 'Naam',
            experience: 'Ervaring',
            searchResults: 'Zoek resultaten...',
            export: 'Exporteren',
            contactApplicant: 'Contact Kandidaat',
            close: 'Sluiten',
            jobTitle: 'Functietitel',
            department: 'Afdeling',
            jobDescription: 'Functieomschrijving',
            educationLevel: 'Opleidingsniveau',
            experienceYears: 'Jaren Ervaring',
            requiredSkills: 'Vereiste Vaardigheden',
            preferredSkills: 'Gewenste Vaardigheden',
            requiredCertifications: 'Vereiste Certificeringen',
            locationPreference: 'Locatievoorkeur',
            relocationRequired: 'Verhuizing Vereist',
            minSalary: 'Minimumsalaris',
            maxSalary: 'Maximumsalaris',
            addSkill: 'Vaardigheid Toevoegen',
            addCertification: 'Certificering Toevoegen',
            yes: 'Ja',
            no: 'Nee',
            selectEducationLevel: 'Selecteer opleidingsniveau',
            highSchool: 'Middelbare School',
            associatesDegree: 'MBO',
            bachelorsDegree: 'HBO/Bachelor',
            mastersDegree: 'Master',
            phd: 'PhD of Doctoraat',
            contactInfo: 'Contactgegevens',
            email: 'E-mail:',
            phone: 'Telefoon:',
            education: 'Opleiding',
            degree: 'Diploma:',
            institution: 'Instelling:',
            major: 'Studierichting:',
            currentRole: 'Huidige Functie:',
            company: 'Bedrijf:',
            location: 'Locatie',
            current: 'Huidig:',
            willingToRelocate: 'Bereid te Verhuizen:',
            compensation: 'Vergoeding',
            desiredSalary: 'Gewenst Salaris:',
            matchAnalysis: 'Match Analyse',
            strengths: 'Sterke Punten:',
            gaps: 'Hiaten:',
            loadDemoData: 'Laad Demogegevens',
            skillAdded: 'Vaardigheid Toegevoegd',
            skillRemoved: 'Vaardigheid Verwijderd',
            certificationAdded: 'Certificering Toegevoegd',
            certificationRemoved: 'Certificering Verwijderd',
            searchComplete: 'Zoeken Voltooid',
            found: 'Gevonden',
            matchingApplicantsText: 'passende kandidaten.',
            error: 'Fout',
            failedToFetch: 'Kon geen passende kandidaten ophalen. Probeer het opnieuw.',
            exportComplete: 'Export Voltooid',
            exported: 'Geëxporteerd',
            applicantsToCSV: 'kandidaten naar CSV.',
            languageChanged: 'Taal Gewijzigd',
            applicationLanguageChanged: 'Applicatietaal gewijzigd naar',
            demoDataLoaded: 'Demogegevens Geladen',
            sampleJobRequirements: 'Voorbeeldfunctie-eisen zijn geladen voor demonstratie.'
        },
        fr: {
            jobRequirements: 'Exigences du Poste',
            findMatchingApplicants: 'Trouver des Candidats Correspondants',
            matchingApplicants: 'Candidats Correspondants',
            noApplicantsMatch: 'Aucun candidat ne correspond à vos exigences. Essayez d\'ajuster vos critères.',
            sortBy: 'Trier par:',
            matchScore: 'Score de Correspondance',
            name: 'Nom',
            experience: 'Expérience',
            searchResults: 'Rechercher des résultats...',
            export: 'Exporter',
            contactApplicant: 'Contacter le Candidat',
            close: 'Fermer',
            jobTitle: 'Titre du Poste',
            department: 'Département',
            jobDescription: 'Description du Poste',
            educationLevel: 'Niveau d\'Éducation',
            experienceYears: 'Années d\'Expérience',
            requiredSkills: 'Compétences Requises',
            preferredSkills: 'Compétences Préférées',
            requiredCertifications: 'Certifications Requises',
            locationPreference: 'Préférence de Lieu',
            relocationRequired: 'Relocalisation Requise',
            minSalary: 'Salaire Minimum',
            maxSalary: 'Salaire Maximum',
            addSkill: 'Ajouter une Compétence',
            addCertification: 'Ajouter une Certification',
            yes: 'Oui',
            no: 'Non',
            selectEducationLevel: 'Sélectionnez le niveau d\'éducation',
            highSchool: 'Lycée',
            associatesDegree: 'Diplôme d\'Associé',
            bachelorsDegree: 'Licence',
            mastersDegree: 'Master',
            phd: 'Doctorat',
            contactInfo: 'Coordonnées',
            email: 'Email:',
            phone: 'Téléphone:',
            education: 'Formation',
            degree: 'Diplôme:',
            institution: 'Institution:',
            major: 'Spécialité:',
            currentRole: 'Poste Actuel:',
            company: 'Entreprise:',
            location: 'Lieu',
            current: 'Actuel:',
            willingToRelocate: 'Prêt à Déménager:',
            compensation: 'Rémunération',
            desiredSalary: 'Salaire Souhaité:',
            matchAnalysis: 'Analyse de Correspondance',
            strengths: 'Points Forts:',
            gaps: 'Lacunes:',
            loadDemoData: 'Charger les Données de Démo',
            skillAdded: 'Compétence Ajoutée',
            skillRemoved: 'Compétence Supprimée',
            certificationAdded: 'Certification Ajoutée',
            certificationRemoved: 'Certification Supprimée',
            searchComplete: 'Recherche Terminée',
            found: 'Trouvé',
            matchingApplicantsText: 'candidats correspondants.',
            error: 'Erreur',
            failedToFetch: 'Échec de la récupération des candidats correspondants. Veuillez réessayer.',
            exportComplete: 'Exportation Terminée',
            exported: 'Exporté',
            applicantsToCSV: 'candidats vers CSV.',
            languageChanged: 'Langue Modifiée',
            applicationLanguageChanged: 'Langue de l\'application changée en',
            demoDataLoaded: 'Données de Démonstration Chargées',
            sampleJobRequirements: 'Des exemples d\'exigences de poste ont été chargés pour démonstration.'
        }
    };
    
    // Required skills management
    let requiredSkills = [];
    
    addSkillBtn.addEventListener('click', function() {
        addSkill(true);
    });
    
    skillInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addSkill(true);
        }
    });
    
    function addSkill(isRequired) {
        const input = isRequired ? skillInput : preferredSkillInput;
        const container = isRequired ? skillsContainer : preferredSkillsContainer;
        const skillsArray = isRequired ? requiredSkills : preferredSkills;
        const hiddenInput = isRequired ? requiredSkillsInput : preferredSkillsInput;
        
        const skill = input.value.trim();
        if (skill && !skillsArray.includes(skill)) {
            skillsArray.push(skill);
            
            const skillTag = document.createElement('div');
            skillTag.className = `skill-tag ${isRequired ? 'required' : 'preferred'}`;
            skillTag.innerHTML = `
                ${skill}
                <span class="tag-remove" data-skill="${skill}" data-required="${isRequired}">×</span>
            `;
            container.appendChild(skillTag);
            
            // Update hidden input
            hiddenInput.value = JSON.stringify(skillsArray);
            
            // Clear input
            input.value = '';
            input.focus();
            
            // Show success toast
            showToast(translations[currentLanguage].skillAdded, `"${skill}" ${isRequired ? translations[currentLanguage].requiredSkills : translations[currentLanguage].preferredSkills}.`);
        }
    }
    
    // Event delegation for removing skill tags
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('tag-remove')) {
            const skill = e.target.getAttribute('data-skill');
            const isRequired = e.target.getAttribute('data-required') === 'true';
            const skillsArray = isRequired ? requiredSkills : preferredSkills;
            const hiddenInput = isRequired ? requiredSkillsInput : preferredSkillsInput;
            
            // Remove from array
            const index = skillsArray.indexOf(skill);
            if (index > -1) {
                skillsArray.splice(index, 1);
            }
            
            // Update hidden input
            hiddenInput.value = JSON.stringify(skillsArray);
            
            // Remove tag element
            e.target.parentElement.remove();
            
            // Show info toast
            showToast(translations[currentLanguage].skillRemoved, `"${skill}" ${isRequired ? translations[currentLanguage].requiredSkills : translations[currentLanguage].preferredSkills}.`);
        }
    });
    
    // Preferred skills management
    let preferredSkills = [];
    
    addPreferredSkillBtn.addEventListener('click', function() {
        addSkill(false);
    });
    
    preferredSkillInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addSkill(false);
        }
    });
    
    // Certifications management
    let requiredCertifications = [];
    
    addCertificationBtn.addEventListener('click', function() {
        addCertification();
    });
    
    certificationInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addCertification();
        }
    });
    
    function addCertification() {
        const certification = certificationInput.value.trim();
        if (certification && !requiredCertifications.includes(certification)) {
            requiredCertifications.push(certification);
            
            const certTag = document.createElement('div');
            certTag.className = 'certification-tag';
            certTag.innerHTML = `
                ${certification}
                <span class="tag-remove" data-certification="${certification}">×</span>
            `;
            certificationsContainer.appendChild(certTag);
            
            // Update hidden input
            requiredCertificationsInput.value = JSON.stringify(requiredCertifications);
            
            // Clear input
            certificationInput.value = '';
            certificationInput.focus();
            
            // Show success toast
            showToast(translations[currentLanguage].certificationAdded, `"${certification}" ${translations[currentLanguage].requiredCertifications}.`);
        }
    }
    
    // Event delegation for removing certification tags
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('tag-remove') && e.target.hasAttribute('data-certification')) {
            const certification = e.target.getAttribute('data-certification');
            
            // Remove from array
            const index = requiredCertifications.indexOf(certification);
            if (index > -1) {
                requiredCertifications.splice(index, 1);
            }
            
            // Update hidden input
            requiredCertificationsInput.value = JSON.stringify(requiredCertifications);
            
            // Remove tag element
            e.target.parentElement.remove();
            
            // Show info toast
            showToast(translations[currentLanguage].certificationRemoved, `"${certification}" ${translations[currentLanguage].requiredCertifications}.`);
        }
    });
    
    // Form submission
    requirementsForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Collect form data
        const formData = {
            jobTitle: document.getElementById('job-title').value,
            department: document.getElementById('department').value,
            jobDescription: document.getElementById('job-description').value,
            educationLevel: document.getElementById('education-level').value,
            experienceYears: parseInt(document.getElementById('experience-years').value) || 0,
            requiredSkills: requiredSkills,
            preferredSkills: preferredSkills,
            requiredCertifications: requiredCertifications,
            locationPreference: document.getElementById('location-preference').value,
            relocationRequired: document.getElementById('relocation-required').value === '1',
            minSalary: document.getElementById('min-salary').value ? parseInt(document.getElementById('min-salary').value) : null,
            maxSalary: document.getElementById('max-salary').value ? parseInt(document.getElementById('max-salary').value) : null
        };
        
        // Send to backend API
        findMatchingApplicants(formData);
    });
    
    // Function to find matching applicants via API
    function findMatchingApplicants(requirements) {
        // Show loading state
        applicantsContainer.innerHTML = `
            <div class="spinner-container">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
        `;
        
        // Show results section
        resultsSection.classList.remove('d-none');
        
        // Scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth' });
        
        // Call API
        fetch(`${API_URL}/match_applicants`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requirements)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(applicants => {
            // Display results
            displayApplicants(applicants);
            
            // Show success toast
            showToast(translations[currentLanguage].searchComplete, `${translations[currentLanguage].found} ${applicants.length} ${translations[currentLanguage].matchingApplicantsText}`);
        })
        .catch(error => {
            console.error('Error fetching matching applicants:', error);
            applicantsContainer.innerHTML = `
                <div class="alert alert-danger" role="alert">
                    <i class="fas fa-exclamation-circle me-2"></i>${translations[currentLanguage].failedToFetch}
                </div>
            `;
            
            // Show error toast
            showToast(translations[currentLanguage].error, translations[currentLanguage].failedToFetch, 'error');
        });
    }
    
    // Function to display applicants
    function displayApplicants(applicants) {
        if (applicants.length === 0) {
            applicantsContainer.innerHTML = '';
            noResults.classList.remove('d-none');
        } else {
            noResults.classList.add('d-none');
            
            // Generate HTML for applicant cards
            let html = '';
            applicants.forEach((applicant, index) => {
                const matchScoreClass = applicant.matchScore >= 80 ? 'high' : (applicant.matchScore >= 50 ? 'medium' : 'low');
                const delay = Math.min(index, 5); // Limit delay to 5 max
                
                html += `
                    <div class="col-md-6 col-lg-4 mb-4 fade-in delay-${delay}">
                        <div class="applicant-card p-3" data-applicant-id="${applicant.id}">
                            <div class="d-flex align-items-center mb-3">
                                <div class="match-score ${matchScoreClass} me-3">${applicant.matchScore}%</div>
                                <div>
                                    <h3 class="h5 mb-1">${applicant.name}</h3>
                                    <p class="text-muted mb-0">${applicant.currentPosition} • ${applicant.experienceYears} yrs</p>
                                </div>
                            </div>
                            <div class="mb-2">
                                <div class="text-muted small mb-1">${translations[currentLanguage].education}</div>
                                <div>${applicant.educationLevel}, ${applicant.institution}</div>
                            </div>
                            <div class="mb-2">
                                <div class="text-muted small mb-1">${translations[currentLanguage].location}</div>
                                <div>${applicant.location}</div>
                            </div>
                            <div>
                                <div class="text-muted small mb-1">${translations[currentLanguage].requiredSkills}</div>
                                <div class="applicant-skills">
                                    ${applicant.skills.slice(0, 5).map(skill => 
                                        `<span class="applicant-skill ${skill.matched ? 'matched' : ''}">${skill.name}</span>`
                                    ).join('')}
                                    ${applicant.skills.length > 5 ? `<span class="applicant-skill">+${applicant.skills.length - 5} more</span>` : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            applicantsContainer.innerHTML = html;
            
            // Add click event to applicant cards
            document.querySelectorAll('.applicant-card').forEach(card => {
                card.addEventListener('click', function() {
                    const applicantId = this.getAttribute('data-applicant-id');
                    showApplicantDetails(applicantId, applicants);
                });
            });
        }
    }
    
    // Function to show applicant details
    function showApplicantDetails(applicantId, applicants) {
        // Find applicant in the results
        const applicant = applicants.find(a => a.id === parseInt(applicantId));
        
        if (applicant) {
            // Generate HTML for applicant details
            const html = `
                <div class="applicant-detail-header">
                    <h2 class="h4 mb-1">${applicant.name}</h2>
                    <p class="text-muted mb-3">${applicant.currentPosition} at ${applicant.currentCompany}</p>
                    <div class="match-score-large ${applicant.matchScore >= 80 ? 'high' : (applicant.matchScore >= 50 ? 'medium' : 'low')}">
                        ${applicant.matchScore}% ${translations[currentLanguage].matchScore}
                    </div>
                </div>
                
                <div class="row mt-4">
                    <div class="col-md-6">
                        <div class="detail-section">
                            <h3 class="h5 mb-3">${translations[currentLanguage].contactInfo}</h3>
                            <p><strong>${translations[currentLanguage].email}</strong> ${applicant.email}</p>
                            <p><strong>${translations[currentLanguage].phone}</strong> ${applicant.phone}</p>
                        </div>
                        
                        <div class="detail-section">
                            <h3 class="h5 mb-3">${translations[currentLanguage].education}</h3>
                            <p><strong>${translations[currentLanguage].degree}</strong> ${applicant.educationLevel}</p>
                            <p><strong>${translations[currentLanguage].institution}</strong> ${applicant.institution}</p>
                            <p><strong>${translations[currentLanguage].major}</strong> ${applicant.major}</p>
                        </div>
                        
                        <div class="detail-section">
                            <h3 class="h5 mb-3">${translations[currentLanguage].experience}</h3>
                            <p><strong>${translations[currentLanguage].years}</strong> ${applicant.experienceYears}</p>
                            <p><strong>${translations[currentLanguage].currentRole}</strong> ${applicant.currentPosition}</p>
                            <p><strong>${translations[currentLanguage].company}</strong> ${applicant.currentCompany}</p>
                        </div>
                    </div>
                    
                    <div class="col-md-6">
                        <div class="detail-section">
                            <h3 class="h5 mb-3">${translations[currentLanguage].location}</h3>
                            <p><strong>${translations[currentLanguage].current}</strong> ${applicant.location}</p>
                            <p><strong>${translations[currentLanguage].willingToRelocate}</strong> ${applicant.willingToRelocate ? translations[currentLanguage].yes : translations[currentLanguage].no}</p>
                        </div>
                        
                        <div class="detail-section">
                            <h3 class="h5 mb-3">${translations[currentLanguage].compensation}</h3>
                            <p><strong>${translations[currentLanguage].desiredSalary}</strong> $${applicant.desiredSalary.toLocaleString()}</p>
                        </div>
                        
                        <div class="detail-section">
                            <h3 class="h5 mb-3">${translations[currentLanguage].matchAnalysis}</h3>
                            <p><strong>${translations[currentLanguage].strengths}</strong></p>
                            <ul>
                                ${applicant.matchAnalysis.strengths.map(strength => `<li>${strength}</li>`).join('')}
                            </ul>
                            <p><strong>${translations[currentLanguage].gaps}</strong></p>
                            <ul>
                                ${applicant.matchAnalysis.gaps.map(gap => `<li>${gap}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                </div>
                
                <div class="row mt-4">
                    <div class="col-12">
                        <div class="detail-section">
                            <h3 class="h5 mb-3">${translations[currentLanguage].skills}</h3>
                            <div class="applicant-skills-detail">
                                ${applicant.skills.map(skill => 
                                    `<span class="applicant-skill ${skill.matched ? 'matched' : ''}">${skill.name}</span>`
                                ).join('')}
                            </div>
                        </div>
                        
                        <div class="detail-section">
                            <h3 class="h5 mb-3">${translations[currentLanguage].certifications}</h3>
                            <div class="applicant-certifications">
                                ${applicant.certifications.map(cert => 
                                    `<span class="applicant-certification">${cert.name}</span>`
                                ).join('')}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="modal-footer mt-4">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${translations[currentLanguage].close}</button>
                    <button type="button" class="btn btn-primary contact-btn" data-email="${applicant.email}">${translations[currentLanguage].contactApplicant}</button>
                </div>
            `;
            
            // Update modal content
            applicantDetailContent.innerHTML = html;
            
            // Add event listener to contact button
            const contactBtn = applicantDetailContent.querySelector('.contact-btn');
            if (contactBtn) {
                contactBtn.addEventListener('click', function() {
                    const email = this.getAttribute('data-email');
                    window.location.href = `mailto:${email}?subject=Job Opportunity&body=Hello, I found your profile interesting for a position we have available.`;
                });
            }
            
            // Show modal
            applicantDetailModal.show();
        }
    }
    
    // Function to show toast notification
    function showToast(title, message, type = 'info') {
        const toastId = 'toast-' + Date.now();
        const toastHtml = `
            <div id="${toastId}" class="toast ${type}" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="toast-header">
                    <strong class="me-auto">${title}</strong>
                    <small>${translations[currentLanguage].justNow}</small>
                    <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
                <div class="toast-body">
                    ${message}
                </div>
            </div>
        `;
        
        toastContainer.insertAdjacentHTML('beforeend', toastHtml);
        const toastElement = document.getElementById(toastId);
        const toast = new bootstrap.Toast(toastElement, { autohide: true, delay: 5000 });
        toast.show();
        
        // Remove toast after it's hidden
        toastElement.addEventListener('hidden.bs.toast', function() {
            this.remove();
        });
    }
    
    // Function to export results to CSV
    if (exportResultsBtn) {
        exportResultsBtn.addEventListener('click', function() {
            // Get all applicant cards
            const applicantCards = document.querySelectorAll('.applicant-card');
            
            if (applicantCards.length === 0) {
                showToast(translations[currentLanguage].error, 'No applicants to export.', 'error');
                return;
            }
            
            // Create CSV content
            let csv = 'Name,Match Score,Current Position,Experience Years,Education,Location\n';
            
            applicantCards.forEach(card => {
                const name = card.querySelector('.h5').textContent;
                const matchScore = card.querySelector('.match-score').textContent.replace('%', '');
                const positionExp = card.querySelector('.text-muted').textContent.split('•');
                const currentPosition = positionExp[0].trim();
                const experienceYears = positionExp[1].trim().replace(' yrs', '');
                const education = card.querySelectorAll('.mb-2')[0].querySelector('div:last-child').textContent;
                const location = card.querySelectorAll('.mb-2')[1].querySelector('div:last-child').textContent;
                
                csv += `"${name}",${matchScore},"${currentPosition}",${experienceYears},"${education}","${location}"\n`;
            });
            
            // Create download link
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', 'matching_applicants.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Show success toast
            showToast(translations[currentLanguage].exportComplete, `${translations[currentLanguage].exported} ${applicantCards.length} ${translations[currentLanguage].applicantsToCSV}`);
        });
    }
    
    // Language selection
    if (languageItems) {
        languageItems.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                const lang = this.getAttribute('data-lang');
                setLanguage(lang);
            });
        });
    }
    
    // Function to set language
    function setLanguage(lang) {
        if (translations[lang]) {
            currentLanguage = lang;
            
            // Update language in dropdown
            if (languageDropdown) {
                languageDropdown.textContent = lang.toUpperCase();
            }
            
            // Update UI text
            updateUIText();
            
            // Show toast notification
            showToast(translations[currentLanguage].languageChanged, `${translations[currentLanguage].applicationLanguageChanged} ${lang.toUpperCase()}.`);
            
            // Store language preference
            localStorage.setItem('preferredLanguage', lang);
            
            // Update language on server if authenticated
            if (typeof isAuthenticated !== 'undefined' && isAuthenticated) {
                fetch(`/set-language/${lang}`);
            }
        }
    }
    
    // Function to update UI text based on selected language
    function updateUIText() {
        // Update static UI elements
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (translations[currentLanguage][key]) {
                element.textContent = translations[currentLanguage][key];
            }
        });
        
        // Update placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            if (translations[currentLanguage][key]) {
                element.placeholder = translations[currentLanguage][key];
            }
        });
        
        // Update button text
        document.querySelectorAll('button[data-i18n]').forEach(button => {
            const key = button.getAttribute('data-i18n');
            if (translations[currentLanguage][key]) {
                button.textContent = translations[currentLanguage][key];
            }
        });
        
        // Update select options
        document.querySelectorAll('select[data-i18n-options]').forEach(select => {
            const optionsKey = select.getAttribute('data-i18n-options').split(',');
            Array.from(select.options).forEach((option, index) => {
                if (optionsKey[index] && translations[currentLanguage][optionsKey[index]]) {
                    option.textContent = translations[currentLanguage][optionsKey[index]];
                }
            });
        });
    }
    
    // Load demo data
    const loadDemoBtn = document.getElementById('load-demo-btn');
    if (loadDemoBtn) {
        loadDemoBtn.addEventListener('click', function() {
            // Set demo values
            document.getElementById('job-title').value = 'Senior Software Engineer';
            document.getElementById('department').value = 'Engineering';
            document.getElementById('job-description').value = 'We are looking for an experienced software engineer to join our team and help build scalable web applications.';
            document.getElementById('education-level').value = 'Bachelor\'s Degree';
            document.getElementById('experience-years').value = '5';
            document.getElementById('location-preference').value = 'San Francisco, CA';
            document.getElementById('relocation-required').value = '0';
            document.getElementById('min-salary').value = '120000';
            document.getElementById('max-salary').value = '160000';
            
            // Clear existing skills and certifications
            skillsContainer.innerHTML = '';
            preferredSkillsContainer.innerHTML = '';
            certificationsContainer.innerHTML = '';
            requiredSkills = [];
            preferredSkills = [];
            requiredCertifications = [];
            
            // Add demo skills
            const demoRequiredSkills = ['JavaScript', 'React', 'Node.js'];
            const demoPreferredSkills = ['TypeScript', 'GraphQL', 'AWS'];
            const demoCertifications = ['AWS Certified Developer'];
            
            demoRequiredSkills.forEach(skill => {
                requiredSkills.push(skill);
                const skillTag = document.createElement('div');
                skillTag.className = 'skill-tag required';
                skillTag.innerHTML = `
                    ${skill}
                    <span class="tag-remove" data-skill="${skill}" data-required="true">×</span>
                `;
                skillsContainer.appendChild(skillTag);
            });
            
            demoPreferredSkills.forEach(skill => {
                preferredSkills.push(skill);
                const skillTag = document.createElement('div');
                skillTag.className = 'skill-tag preferred';
                skillTag.innerHTML = `
                    ${skill}
                    <span class="tag-remove" data-skill="${skill}" data-required="false">×</span>
                `;
                preferredSkillsContainer.appendChild(skillTag);
            });
            
            demoCertifications.forEach(cert => {
                requiredCertifications.push(cert);
                const certTag = document.createElement('div');
                certTag.className = 'certification-tag';
                certTag.innerHTML = `
                    ${cert}
                    <span class="tag-remove" data-certification="${cert}">×</span>
                `;
                certificationsContainer.appendChild(certTag);
            });
            
            // Update hidden inputs
            requiredSkillsInput.value = JSON.stringify(requiredSkills);
            preferredSkillsInput.value = JSON.stringify(preferredSkills);
            requiredCertificationsInput.value = JSON.stringify(requiredCertifications);
            
            // Show success toast
            showToast(translations[currentLanguage].demoDataLoaded, translations[currentLanguage].sampleJobRequirements);
        });
    }
    
    // Initialize language from stored preference or browser setting
    const storedLanguage = localStorage.getItem('preferredLanguage');
    if (storedLanguage && translations[storedLanguage]) {
        setLanguage(storedLanguage);
    } else {
        // Use browser language
        const browserLang = navigator.language.split('-')[0];
        if (translations[browserLang]) {
            setLanguage(browserLang);
        } else {
            setLanguage('en'); // Default to English
        }
    }
    
    // Initialize UI text
    updateUIText();
});
