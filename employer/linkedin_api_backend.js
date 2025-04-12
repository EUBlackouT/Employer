// Backend implementation for LinkedIn API integration

const express = require('express');
const axios = require('axios');
const router = express.Router();
const crypto = require('crypto');
const { User, Profile, WorkExperience, Education, Skill, Certification } = require('../models/models');

// Environment variables should be set in .env file
const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const LINKEDIN_REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI;
const LINKEDIN_SCOPE = 'r_liteprofile r_emailaddress r_basicprofile r_fullprofile';

// Store state parameters to prevent CSRF attacks
const stateStore = new Map();

/**
 * Generate LinkedIn authorization URL
 */
router.get('/auth/linkedin', (req, res) => {
  try {
    // Generate random state parameter for CSRF protection
    const state = crypto.randomBytes(16).toString('hex');
    
    // Store state with expiration (10 minutes)
    stateStore.set(state, {
      userId: req.user?.id, // If user is already logged in
      expires: Date.now() + 600000 // 10 minutes
    });
    
    // Construct LinkedIn authorization URL
    const authUrl = new URL('https://www.linkedin.com/oauth/v2/authorization');
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('client_id', LINKEDIN_CLIENT_ID);
    authUrl.searchParams.append('redirect_uri', LINKEDIN_REDIRECT_URI);
    authUrl.searchParams.append('state', state);
    authUrl.searchParams.append('scope', LINKEDIN_SCOPE);
    
    res.json({ authUrl: authUrl.toString() });
  } catch (error) {
    console.error('Error generating LinkedIn auth URL:', error);
    res.status(500).json({ error: 'Failed to generate LinkedIn authorization URL' });
  }
});

/**
 * Handle LinkedIn OAuth callback
 */
router.get('/auth/linkedin/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    
    // Verify state parameter to prevent CSRF attacks
    const storedState = stateStore.get(state);
    if (!storedState || storedState.expires < Date.now()) {
      return res.status(400).json({ error: 'Invalid or expired state parameter' });
    }
    
    // Remove used state
    stateStore.delete(state);
    
    // Exchange authorization code for access token
    const tokenResponse = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', null, {
      params: {
        grant_type: 'authorization_code',
        code,
        redirect_uri: LINKEDIN_REDIRECT_URI,
        client_id: LINKEDIN_CLIENT_ID,
        client_secret: LINKEDIN_CLIENT_SECRET
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    const { access_token, expires_in } = tokenResponse.data;
    
    // Fetch LinkedIn profile data
    const profileData = await fetchLinkedInProfileData(access_token);
    
    // Process the profile data (create/update user)
    const userId = storedState.userId || await findOrCreateUser(profileData);
    
    // Map and save LinkedIn data to user profile
    await saveLinkedInData(userId, profileData, access_token, expires_in);
    
    // Redirect to frontend with success
    res.redirect(`/linkedin-success?userId=${userId}`);
  } catch (error) {
    console.error('Error handling LinkedIn callback:', error);
    res.redirect('/linkedin-error');
  }
});

/**
 * Fetch all LinkedIn profile data
 */
async function fetchLinkedInProfileData(accessToken) {
  try {
    // Fetch basic profile
    const profileResponse = await axios.get('https://api.linkedin.com/v2/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    // Fetch email address
    const emailResponse = await axios.get('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    // Fetch profile picture
    const pictureResponse = await axios.get('https://api.linkedin.com/v2/me?projection=(id,profilePicture(displayImage~:playableStreams))', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    // Fetch work experience
    const experienceResponse = await axios.get('https://api.linkedin.com/v2/positions?q=members&projection=(elements*(title,company,locationName,startDate,endDate,description))', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    // Fetch education
    const educationResponse = await axios.get('https://api.linkedin.com/v2/educations?q=members&projection=(elements*(schoolName,degree,fieldOfStudy,startDate,endDate))', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    // Fetch skills
    const skillsResponse = await axios.get('https://api.linkedin.com/v2/skills?q=members&projection=(elements*(name,proficiency))', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    // Fetch certifications
    const certificationsResponse = await axios.get('https://api.linkedin.com/v2/certifications?q=members&projection=(elements*(name,authority,licenseNumber,startDate,endDate))', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    // Extract email from response
    const email = emailResponse.data.elements[0]['handle~'].emailAddress;
    
    // Extract profile picture URL if available
    let profilePictureUrl = null;
    if (pictureResponse.data.profilePicture && 
        pictureResponse.data.profilePicture['displayImage~'] && 
        pictureResponse.data.profilePicture['displayImage~'].elements && 
        pictureResponse.data.profilePicture['displayImage~'].elements.length > 0) {
      // Get the highest quality image
      const elements = pictureResponse.data.profilePicture['displayImage~'].elements;
      profilePictureUrl = elements[elements.length - 1].identifiers[0].identifier;
    }
    
    // Combine all data
    return {
      basicProfile: {
        ...profileResponse.data,
        email,
        profilePictureUrl
      },
      workExperience: experienceResponse.data,
      education: educationResponse.data,
      skills: skillsResponse.data,
      certifications: certificationsResponse.data,
      lastSyncDate: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching LinkedIn profile data:', error);
    throw error;
  }
}

/**
 * Find existing user by LinkedIn email or create new user
 */
async function findOrCreateUser(profileData) {
  const email = profileData.basicProfile.email;
  
  // Check if user exists with this email
  let user = await User.findOne({ where: { email } });
  
  if (!user) {
    // Create new user
    user = await User.create({
      email,
      firstName: profileData.basicProfile.localizedFirstName,
      lastName: profileData.basicProfile.localizedLastName,
      source: 'linkedin',
      isVerified: true // LinkedIn users are pre-verified
    });
  }
  
  return user.id;
}

/**
 * Save LinkedIn data to user profile
 */
async function saveLinkedInData(userId, profileData, accessToken, expiresIn) {
  try {
    // Calculate token expiration
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + expiresIn);
    
    // Update or create user profile
    const [profile, created] = await Profile.findOrCreate({
      where: { userId },
      defaults: {
        firstName: profileData.basicProfile.localizedFirstName,
        lastName: profileData.basicProfile.localizedLastName,
        headline: profileData.basicProfile.headline || '',
        summary: profileData.basicProfile.summary || '',
        location: profileData.basicProfile.locationName || '',
        profilePictureUrl: profileData.basicProfile.profilePictureUrl,
        linkedInProfileUrl: profileData.basicProfile.vanityName ? 
          `https://www.linkedin.com/in/${profileData.basicProfile.vanityName}` : null,
        linkedInAccessToken: accessToken,
        linkedInTokenExpiresAt: expiresAt,
        lastSyncDate: profileData.lastSyncDate,
        dataSource: 'linkedin'
      }
    });
    
    if (!created) {
      // Update existing profile
      await profile.update({
        firstName: profileData.basicProfile.localizedFirstName,
        lastName: profileData.basicProfile.localizedLastName,
        headline: profileData.basicProfile.headline || profile.headline,
        summary: profileData.basicProfile.summary || profile.summary,
        location: profileData.basicProfile.locationName || profile.location,
        profilePictureUrl: profileData.basicProfile.profilePictureUrl || profile.profilePictureUrl,
        linkedInProfileUrl: profileData.basicProfile.vanityName ? 
          `https://www.linkedin.com/in/${profileData.basicProfile.vanityName}` : profile.linkedInProfileUrl,
        linkedInAccessToken: accessToken,
        linkedInTokenExpiresAt: expiresAt,
        lastSyncDate: profileData.lastSyncDate,
        dataSource: 'linkedin'
      });
    }
    
    // Process work experience
    if (profileData.workExperience && profileData.workExperience.elements) {
      // Remove existing work experience entries
      await WorkExperience.destroy({ where: { userId } });
      
      // Add new work experience entries
      for (const job of profileData.workExperience.elements) {
        await WorkExperience.create({
          userId,
          company: job.company.name,
          title: job.title,
          location: job.locationName || '',
          startDate: job.startDate ? new Date(job.startDate.year, (job.startDate.month || 1) - 1) : null,
          endDate: job.endDate ? new Date(job.endDate.year, (job.endDate.month || 1) - 1) : null,
          isCurrent: !job.endDate,
          description: job.description || '',
          source: 'linkedin'
        });
      }
    }
    
    // Process education
    if (profileData.education && profileData.education.elements) {
      // Remove existing education entries
      await Education.destroy({ where: { userId } });
      
      // Add new education entries
      for (const edu of profileData.education.elements) {
        await Education.create({
          userId,
          institution: edu.schoolName,
          degree: edu.degree || '',
          fieldOfStudy: edu.fieldOfStudy || '',
          startDate: edu.startDate ? new Date(edu.startDate.year, 0) : null,
          endDate: edu.endDate ? new Date(edu.endDate.year, 0) : null,
          isCurrent: !edu.endDate,
          source: 'linkedin'
        });
      }
    }
    
    // Process skills
    if (profileData.skills && profileData.skills.elements) {
      // Remove existing skills
      await Skill.destroy({ where: { userId } });
      
      // Add new skills
      for (const skill of profileData.skills.elements) {
        await Skill.create({
          userId,
          name: skill.name,
          proficiency: skill.proficiency || 'Intermediate',
          endorsements: skill.endorsements || 0,
          source: 'linkedin'
        });
      }
    }
    
    // Process certifications
    if (profileData.certifications && profileData.certifications.elements) {
      // Remove existing certifications
      await Certification.destroy({ where: { userId } });
      
      // Add new certifications
      for (const cert of profileData.certifications.elements) {
        await Certification.create({
          userId,
          name: cert.name,
          issuingOrganization: cert.authority ? cert.authority.name : '',
          issueDate: cert.startDate ? new Date(cert.startDate.year, (cert.startDate.month || 1) - 1) : null,
          expirationDate: cert.endDate ? new Date(cert.endDate.year, (cert.endDate.month || 1) - 1) : null,
          credentialId: cert.licenseNumber || '',
          source: 'linkedin'
        });
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error saving LinkedIn data:', error);
    throw error;
  }
}

/**
 * Synchronize LinkedIn data for a user
 */
router.post('/linkedin/sync', async (req, res) => {
  try {
    const userId = req.user.id; // Assuming user is authenticated
    
    // Get user profile with LinkedIn token
    const profile = await Profile.findOne({ where: { userId } });
    
    if (!profile || !profile.linkedInAccessToken) {
      return res.status(400).json({ error: 'No LinkedIn connection found' });
    }
    
    // Check if token is expired
    if (new Date(profile.linkedInTokenExpiresAt) < new Date()) {
      return res.status(401).json({ error: 'LinkedIn token expired, please reconnect' });
    }
    
    // Fetch latest LinkedIn data
    const profileData = await fetchLinkedInProfileData(profile.linkedInAccessToken);
    
    // Save updated data
    await saveLinkedInData(userId, profileData, profile.linkedInAccessToken, 
      Math.floor((new Date(profile.linkedInTokenExpiresAt) - new Date()) / 1000));
    
    res.json({ 
      success: true, 
      message: 'LinkedIn data synchronized successfully',
      lastSyncDate: profileData.lastSyncDate
    });
  } catch (error) {
    console.error('Error synchronizing LinkedIn data:', error);
    res.status(500).json({ error: 'Failed to synchronize LinkedIn data' });
  }
});

/**
 * Disconnect LinkedIn integration
 */
router.post('/linkedin/disconnect', async (req, res) => {
  try {
    const userId = req.user.id; // Assuming user is authenticated
    
    // Update profile to remove LinkedIn connection
    await Profile.update({
      linkedInAccessToken: null,
      linkedInTokenExpiresAt: null,
      dataSource: 'manual' // Change data source to manual
    }, {
      where: { userId }
    });
    
    // Update source for all related data
    await WorkExperience.update({ source: 'manual' }, { where: { userId, source: 'linkedin' } });
    await Education.update({ source: 'manual' }, { where: { userId, source: 'linkedin' } });
    await Skill.update({ source: 'manual' }, { where: { userId, source: 'linkedin' } });
    await Certification.update({ source: 'manual' }, { where: { userId, source: 'linkedin' } });
    
    res.json({ 
      success: true, 
      message: 'LinkedIn connection removed successfully'
    });
  } catch (error) {
    console.error('Error disconnecting LinkedIn:', error);
    res.status(500).json({ error: 'Failed to disconnect LinkedIn integration' });
  }
});

/**
 * Get LinkedIn connection status
 */
router.get('/linkedin/status', async (req, res) => {
  try {
    const userId = req.user.id; // Assuming user is authenticated
    
    // Get user profile with LinkedIn token
    const profile = await Profile.findOne({ where: { userId } });
    
    if (!profile || !profile.linkedInAccessToken) {
      return res.json({ 
        connected: false
      });
    }
    
    // Check if token is expired
    const isExpired = new Date(profile.linkedInTokenExpiresAt) < new Date();
    
    res.json({
      connected: !isExpired,
      lastSyncDate: profile.lastSyncDate,
      expiresAt: profile.linkedInTokenExpiresAt,
      profileUrl: profile.linkedInProfileUrl
    });
  } catch (error) {
    console.error('Error getting LinkedIn status:', error);
    res.status(500).json({ error: 'Failed to get LinkedIn connection status' });
  }
});

module.exports = router;
