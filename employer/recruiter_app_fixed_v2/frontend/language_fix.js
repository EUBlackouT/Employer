// Enhanced language switching implementation for the recruiter application

document.addEventListener('DOMContentLoaded', function() {
    // Original script.js functionality remains unchanged
    // This script enhances the language switching functionality
    
    // Get all translatable elements
    const translatableElements = {
        // Header elements
        'header h1': 'talentMatch',
        'header p.lead': 'findPerfectCandidates',
        
        // Dashboard stats
        '.stats-label:nth-of-type(1)': 'activeApplicants',
        '.stats-label:nth-of-type(2)': 'openPositions',
        '.stats-label:nth-of-type(3)': 'successfulMatches',
        '.stats-label:nth-of-type(4)': 'daysAvgTimeToHire',
        
        // Form headers
        '.card-header h2': 'jobRequirements',
        'button[type="submit"]': 'findMatchingApplicants',
        '#results-section .card-header h2': 'matchingApplicants',
        '#no-results': 'noApplicantsMatch',
        
        // Section titles
        '.section-title:nth-of-type(1)': 'jobDetails',
        '.section-title:nth-of-type(2)': 'educationAndExperience',
        '.section-title:nth-of-type(3)': 'skills',
        '.section-title:nth-of-type(4)': 'certifications',
        '.section-title:nth-of-type(5)': 'locationAndCompensation',
        
        // Form labels
        'label[for="job-title"]': 'jobTitle',
        'label[for="department"]': 'department',
        'label[for="job-description"]': 'jobDescription',
        'label[for="education-level"]': 'minimumEducationLevel',
        'label[for="experience-years"]': 'minimumYearsOfExperience',
        'label[for="skill-input"]': 'requiredSkills',
        'label[for="preferred-skill-input"]': 'preferredSkills',
        'label[for="certification-input"]': 'requiredCertifications',
        'label[for="location-preference"]': 'locationPreference',
        'label[for="relocation-required"]': 'relocationRequired',
        'label[for="min-salary"]': 'minimumSalary',
        'label[for="max-salary"]': 'maximumSalary',
        
        // Buttons and actions
        '#add-skill-btn': 'add',
        '#add-preferred-skill-btn': 'add',
        '#add-certification-btn': 'add',
        '#export-results': 'export',
        '#search-results': 'searchResults',
        
        // Select options
        '#education-level option:nth-of-type(1)': 'selectEducationLevel',
        '#education-level option:nth-of-type(2)': 'highSchool',
        '#education-level option:nth-of-type(3)': 'associatesDegree',
        '#education-level option:nth-of-type(4)': 'bachelorsDegree',
        '#education-level option:nth-of-type(5)': 'mastersDegree',
        '#education-level option:nth-of-type(6)': 'phd',
        
        '#relocation-required option:nth-of-type(1)': 'no',
        '#relocation-required option:nth-of-type(2)': 'yes',
        
        '#sort-by option:nth-of-type(1)': 'sortByMatchScore',
        '#sort-by option:nth-of-type(2)': 'sortByName',
        '#sort-by option:nth-of-type(3)': 'sortByExperience',
        
        // Footer links
        '.footer-link:nth-of-type(1)': 'about',
        '.footer-link:nth-of-type(2)': 'privacyPolicy',
        '.footer-link:nth-of-type(3)': 'termsOfService',
        '.footer-link:nth-of-type(4)': 'contact'
    };
    
    // Enhanced translations object with additional keys
    const enhancedTranslations = {
        en: {
            // Original translations
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
            sampleJobRequirements: 'Sample job requirements have been loaded for demonstration.',
            
            // Additional translations for static elements
            talentMatch: 'Talent Match',
            findPerfectCandidates: 'Find the perfect candidates for your positions with our intelligent matching system',
            activeApplicants: 'Active Applicants',
            openPositions: 'Open Positions',
            successfulMatches: 'Successful Matches',
            daysAvgTimeToHire: 'Days Avg. Time-to-Hire',
            jobDetails: 'Job Details',
            educationAndExperience: 'Education & Experience',
            skills: 'Skills',
            certifications: 'Certifications',
            locationAndCompensation: 'Location & Compensation',
            minimumEducationLevel: 'Minimum Education Level',
            minimumYearsOfExperience: 'Minimum Years of Experience',
            minimumSalary: 'Minimum Salary',
            maximumSalary: 'Maximum Salary',
            add: 'Add',
            sortByMatchScore: 'Sort by: Match Score',
            sortByName: 'Sort by: Name',
            sortByExperience: 'Sort by: Experience',
            about: 'About',
            privacyPolicy: 'Privacy Policy',
            termsOfService: 'Terms of Service',
            contact: 'Contact',
            justNow: 'Just now'
        },
        nl: {
            // Original translations
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
            sampleJobRequirements: 'Voorbeeldfunctie-eisen zijn geladen voor demonstratie.',
            
            // Additional translations for static elements
            talentMatch: 'Talent Match',
            findPerfectCandidates: 'Vind de perfecte kandidaten voor uw functies met ons intelligente matchingsysteem',
            activeApplicants: 'Actieve Kandidaten',
            openPositions: 'Open Posities',
            successfulMatches: 'Succesvolle Matches',
            daysAvgTimeToHire: 'Dagen Gem. Aanwervingstijd',
            jobDetails: 'Functiedetails',
            educationAndExperience: 'Opleiding & Ervaring',
            skills: 'Vaardigheden',
            certifications: 'Certificeringen',
            locationAndCompensation: 'Locatie & Vergoeding',
            minimumEducationLevel: 'Minimaal Opleidingsniveau',
            minimumYearsOfExperience: 'Minimaal Aantal Jaren Ervaring',
            minimumSalary: 'Minimumsalaris',
            maximumSalary: 'Maximumsalaris',
            add: 'Toevoegen',
            sortByMatchScore: 'Sorteer op: Match Score',
            sortByName: 'Sorteer op: Naam',
            sortByExperience: 'Sorteer op: Ervaring',
            about: 'Over Ons',
            privacyPolicy: 'Privacybeleid',
            termsOfService: 'Servicevoorwaarden',
            contact: 'Contact',
            justNow: 'Zojuist'
        },
        fr: {
            // Original translations
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
            sampleJobRequirements: 'Des exemples d\'exigences de poste ont été chargés pour démonstration.',
            
            // Additional translations for static elements
            talentMatch: 'Talent Match',
            findPerfectCandidates: 'Trouvez les candidats parfaits pour vos postes avec notre système de correspondance intelligent',
            activeApplicants: 'Candidats Actifs',
            openPositions: 'Postes Ouverts',
            successfulMatches: 'Correspondances Réussies',
            daysAvgTimeToHire: 'Jours Moy. Délai d\'Embauche',
            jobDetails: 'Détails du Poste',
            educationAndExperience: 'Éducation et Expérience',
            skills: 'Compétences',
            certifications: 'Certifications',
            locationAndCompensation: 'Lieu et Rémunération',
            minimumEducationLevel: 'Niveau d\'Éducation Minimum',
            minimumYearsOfExperience: 'Années d\'Expérience Minimum',
            minimumSalary: 'Salaire Minimum',
            maximumSalary: 'Salaire Maximum',
            add: 'Ajouter',
            sortByMatchScore: 'Trier par: Score de Correspondance',
            sortByName: 'Trier par: Nom',
            sortByExperience: 'Trier par: Expérience',
            about: 'À Propos',
            privacyPolicy: 'Politique de Confidentialité',
            termsOfService: 'Conditions d\'Utilisation',
            contact: 'Contact',
            justNow: 'À l\'instant'
        }
    };
    
    // Function to apply translations to elements without data-i18n attributes
    function applyTranslationsToStaticElements(language) {
        if (!enhancedTranslations[language]) {
            console.error('Language not supported:', language);
            return;
        }
        
        // Apply translations to each element in the translatableElements object
        for (const [selector, translationKey] of Object.entries(translatableElements)) {
            try {
                const elements = document.querySelectorAll(selector);
                if (elements.length > 0) {
                    elements.forEach(element => {
                        if (enhancedTranslations[language][translationKey]) {
                            element.textContent = enhancedTranslations[language][translationKey];
                        }
                    });
                }
            } catch (error) {
                console.error(`Error translating ${selector}:`, error);
            }
        }
        
        // Update placeholders
        document.querySelectorAll('input[placeholder], textarea[placeholder]').forEach(element => {
            const placeholder = element.placeholder;
            // Try to find a matching translation key
            for (const [key, value] of Object.entries(enhancedTranslations.en)) {
                if (value === placeholder && enhancedTranslations[language][key]) {
                    element.placeholder = enhancedTranslations[language][key];
                    break;
                }
            }
        });
    }
    
    // Override the original setLanguage function
    const originalSetLanguage = window.setLanguage;
    window.setLanguage = function(lang) {
        // Call the original function if it exists
        if (typeof originalSetLanguage === 'function') {
            originalSetLanguage(lang);
        } else {
            // Set current language
            window.currentLanguage = lang;
            
            // Update language in dropdown
            const languageDropdown = document.getElementById('languageDropdown');
            if (languageDropdown) {
                languageDropdown.innerHTML = `<i class="fas fa-globe me-1"></i> ${lang === 'en' ? 'English' : (lang === 'nl' ? 'Nederlands' : 'Français')}`;
            }
            
            // Update UI text for elements with data-i18n attributes
            updateUIText();
            
            // Store language preference
            localStorage.setItem('preferredLanguage', lang);
        }
        
        // Apply translations to static elements
        applyTranslationsToStaticElements(lang);
    };
    
    // Function to update UI text based on selected language
    function updateUIText() {
        const currentLanguage = window.currentLanguage || 'en';
        
        // Update static UI elements with data-i18n attributes
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (enhancedTranslations[currentLanguage][key]) {
                element.textContent = enhancedTranslations[currentLanguage][key];
            }
        });
        
        // Update placeholders with data-i18n-placeholder attributes
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            if (enhancedTranslations[currentLanguage][key]) {
                element.placeholder = enhancedTranslations[currentLanguage][key];
            }
        });
        
        // Update button text with data-i18n attributes
        document.querySelectorAll('button[data-i18n]').forEach(button => {
            const key = button.getAttribute('data-i18n');
            if (enhancedTranslations[currentLanguage][key]) {
                button.textContent = enhancedTranslations[currentLanguage][key];
            }
        });
        
        // Update select options with data-i18n-options attributes
        document.querySelectorAll('select[data-i18n-options]').forEach(select => {
            const optionsKey = select.getAttribute('data-i18n-options').split(',');
            Array.from(select.options).forEach((option, index) => {
                if (optionsKey[index] && enhancedTranslations[currentLanguage][optionsKey[index]]) {
                    option.textContent = enhancedTranslations[currentLanguage][optionsKey[index]];
                }
            });
        });
    }
    
    // Initialize language from stored preference or browser setting
    const storedLanguage = localStorage.getItem('preferredLanguage');
    if (storedLanguage && enhancedTranslations[storedLanguage]) {
        window.setLanguage(storedLanguage);
    } else {
        // Use browser language
        const browserLang = navigator.language.split('-')[0];
        if (enhancedTranslations[browserLang]) {
            window.setLanguage(browserLang);
        } else {
            window.setLanguage('en'); // Default to English
        }
    }
    
    // Add event listeners to language selector items if they don't already have them
    const languageItems = document.querySelectorAll('.dropdown-item[data-lang]');
    if (languageItems) {
        languageItems.forEach(item => {
            // Remove existing event listeners to avoid duplicates
            const newItem = item.cloneNode(true);
            item.parentNode.replaceChild(newItem, item);
            
            // Add new event listener
            newItem.addEventListener('click', function(e) {
                e.preventDefault();
                const lang = this.getAttribute('data-lang');
                window.setLanguage(lang);
            });
        });
    }
});
