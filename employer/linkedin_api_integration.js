// LinkedIn API Integration Implementation

// Configuration for LinkedIn OAuth
const linkedInConfig = {
  clientId: 'YOUR_LINKEDIN_CLIENT_ID',
  clientSecret: 'YOUR_LINKEDIN_CLIENT_SECRET',
  redirectUri: 'http://localhost:5000/auth/linkedin/callback',
  scope: [
    'r_liteprofile',
    'r_emailaddress',
    'r_basicprofile',
    'r_fullprofile'
  ],
  state: generateRandomState(), // Function to generate random state for CSRF protection
  responseType: 'code'
};

// Function to generate LinkedIn authorization URL
function getLinkedInAuthUrl() {
  const authUrl = new URL('https://www.linkedin.com/oauth/v2/authorization');
  authUrl.searchParams.append('response_type', linkedInConfig.responseType);
  authUrl.searchParams.append('client_id', linkedInConfig.clientId);
  authUrl.searchParams.append('redirect_uri', linkedInConfig.redirectUri);
  authUrl.searchParams.append('state', linkedInConfig.state);
  authUrl.searchParams.append('scope', linkedInConfig.scope.join(' '));
  
  return authUrl.toString();
}

// Function to exchange authorization code for access token
async function getAccessToken(authorizationCode) {
  try {
    const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: authorizationCode,
        redirect_uri: linkedInConfig.redirectUri,
        client_id: linkedInConfig.clientId,
        client_secret: linkedInConfig.clientSecret
      })
    });
    
    if (!response.ok) {
      throw new Error(`LinkedIn API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in
    };
  } catch (error) {
    console.error('Error getting LinkedIn access token:', error);
    throw error;
  }
}

// Function to fetch basic profile data
async function getBasicProfile(accessToken) {
  try {
    const response = await fetch('https://api.linkedin.com/v2/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`LinkedIn API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching LinkedIn profile:', error);
    throw error;
  }
}

// Function to fetch email address
async function getEmailAddress(accessToken) {
  try {
    const response = await fetch('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`LinkedIn API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.elements[0]['handle~'].emailAddress;
  } catch (error) {
    console.error('Error fetching LinkedIn email:', error);
    throw error;
  }
}

// Function to fetch work experience
async function getWorkExperience(accessToken) {
  try {
    const response = await fetch('https://api.linkedin.com/v2/positions?q=members&projection=(elements*(title,company,locationName,startDate,endDate,description))', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`LinkedIn API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching LinkedIn work experience:', error);
    throw error;
  }
}

// Function to fetch education history
async function getEducation(accessToken) {
  try {
    const response = await fetch('https://api.linkedin.com/v2/educations?q=members&projection=(elements*(schoolName,degree,fieldOfStudy,startDate,endDate))', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`LinkedIn API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching LinkedIn education:', error);
    throw error;
  }
}

// Function to fetch skills
async function getSkills(accessToken) {
  try {
    const response = await fetch('https://api.linkedin.com/v2/skills?q=members&projection=(elements*(name,proficiency))', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`LinkedIn API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching LinkedIn skills:', error);
    throw error;
  }
}

// Function to fetch certifications
async function getCertifications(accessToken) {
  try {
    const response = await fetch('https://api.linkedin.com/v2/certifications?q=members&projection=(elements*(name,authority,licenseNumber,startDate,endDate))', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`LinkedIn API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching LinkedIn certifications:', error);
    throw error;
  }
}

// Main function to fetch all LinkedIn profile data
async function fetchLinkedInProfileData(accessToken) {
  try {
    // Fetch all data in parallel for efficiency
    const [basicProfile, email, workExperience, education, skills, certifications] = await Promise.all([
      getBasicProfile(accessToken),
      getEmailAddress(accessToken),
      getWorkExperience(accessToken),
      getEducation(accessToken),
      getSkills(accessToken),
      getCertifications(accessToken)
    ]);
    
    // Combine all data into a single profile object
    return {
      basicProfile,
      email,
      workExperience,
      education,
      skills,
      certifications,
      lastSyncDate: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching LinkedIn profile data:', error);
    throw error;
  }
}

// Function to map LinkedIn data to our application schema
function mapLinkedInDataToAppSchema(linkedInData) {
  // Extract basic profile information
  const basicProfile = {
    firstName: linkedInData.basicProfile.localizedFirstName,
    lastName: linkedInData.basicProfile.localizedLastName,
    headline: linkedInData.basicProfile.headline || '',
    profileUrl: linkedInData.basicProfile.vanityName ? `https://www.linkedin.com/in/${linkedInData.basicProfile.vanityName}` : '',
    email: linkedInData.email,
    location: linkedInData.basicProfile.locationName || ''
  };
  
  // Map work experience
  const workExperience = linkedInData.workExperience.elements.map(job => ({
    company: job.company.name,
    title: job.title,
    location: job.locationName || '',
    startDate: job.startDate ? `${job.startDate.year}-${job.startDate.month || '01'}` : '',
    endDate: job.endDate ? `${job.endDate.year}-${job.endDate.month || '01'}` : '',
    current: !job.endDate,
    description: job.description || ''
  }));
  
  // Map education
  const education = linkedInData.education.elements.map(edu => ({
    institution: edu.schoolName,
    degree: edu.degree || '',
    fieldOfStudy: edu.fieldOfStudy || '',
    startDate: edu.startDate ? `${edu.startDate.year}` : '',
    endDate: edu.endDate ? `${edu.endDate.year}` : '',
    current: !edu.endDate
  }));
  
  // Map skills
  const skills = linkedInData.skills.elements.map(skill => ({
    name: skill.name,
    proficiency: skill.proficiency || 'Intermediate'
  }));
  
  // Map certifications
  const certifications = linkedInData.certifications.elements.map(cert => ({
    name: cert.name,
    issuingOrganization: cert.authority.name,
    issueDate: cert.startDate ? `${cert.startDate.year}-${cert.startDate.month || '01'}` : '',
    expirationDate: cert.endDate ? `${cert.endDate.year}-${cert.endDate.month || '01'}` : '',
    credentialId: cert.licenseNumber || ''
  }));
  
  // Return mapped data
  return {
    basicProfile,
    workExperience,
    education,
    skills,
    certifications,
    lastSyncDate: linkedInData.lastSyncDate,
    source: 'linkedin'
  };
}

// Function to handle LinkedIn OAuth callback
async function handleLinkedInCallback(authorizationCode) {
  try {
    // Exchange authorization code for access token
    const tokenData = await getAccessToken(authorizationCode);
    
    // Fetch LinkedIn profile data
    const linkedInData = await fetchLinkedInProfileData(tokenData.accessToken);
    
    // Map LinkedIn data to our application schema
    const mappedData = mapLinkedInDataToAppSchema(linkedInData);
    
    // Store access token for future use (refresh, etc.)
    storeLinkedInToken(tokenData.accessToken, tokenData.expiresIn);
    
    return mappedData;
  } catch (error) {
    console.error('Error handling LinkedIn callback:', error);
    throw error;
  }
}

// Function to store LinkedIn token securely
function storeLinkedInToken(accessToken, expiresIn) {
  // Calculate expiration date
  const expirationDate = new Date();
  expirationDate.setSeconds(expirationDate.getSeconds() + expiresIn);
  
  // Store token in secure storage (e.g., encrypted in database)
  // This is a placeholder - actual implementation would depend on your backend
  const tokenData = {
    accessToken,
    expiresAt: expirationDate.toISOString()
  };
  
  // Example storage (replace with actual secure storage)
  localStorage.setItem('linkedInToken', JSON.stringify(tokenData));
}

// Function to check if stored token is valid
function isTokenValid() {
  try {
    const tokenData = JSON.parse(localStorage.getItem('linkedInToken'));
    if (!tokenData) return false;
    
    const expiresAt = new Date(tokenData.expiresAt);
    const now = new Date();
    
    // Return true if token exists and is not expired
    return expiresAt > now;
  } catch (error) {
    console.error('Error checking token validity:', error);
    return false;
  }
}

// Function to generate random state for CSRF protection
function generateRandomState() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// Function to synchronize LinkedIn data
async function synchronizeLinkedInData(userId) {
  try {
    // Check if token is valid
    if (!isTokenValid()) {
      throw new Error('LinkedIn token is invalid or expired');
    }
    
    // Get stored token
    const tokenData = JSON.parse(localStorage.getItem('linkedInToken'));
    
    // Fetch latest LinkedIn data
    const linkedInData = await fetchLinkedInProfileData(tokenData.accessToken);
    
    // Map to application schema
    const mappedData = mapLinkedInDataToAppSchema(linkedInData);
    
    // Update user profile with new data
    // This is a placeholder - actual implementation would depend on your backend
    await updateUserProfile(userId, mappedData);
    
    return {
      success: true,
      lastSyncDate: mappedData.lastSyncDate
    };
  } catch (error) {
    console.error('Error synchronizing LinkedIn data:', error);
    throw error;
  }
}

// Export functions for use in other modules
export {
  getLinkedInAuthUrl,
  handleLinkedInCallback,
  synchronizeLinkedInData,
  isTokenValid
};
