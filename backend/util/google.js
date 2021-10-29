const { google } = require('googleapis');
const HttpStatus = require('http-status-codes');
const { getToken } = require('./users');

/**
 * Initialises a new auth client.
 *
 * @returns oAuth2Client
 */
const setupAuth = () => {
  const oAuth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    'postmessage'
  );
  return oAuth2Client;
};

/**
 * Creates a bucket in Google Storage for Cromwell to use
 * if it does not exist already.
 *
 * @param projectId     google project id
 * @param oAuth2Client  google OAuth2 client
 */
const createBucket = async (projectId, oAuth2Client) => {
  const storage = google.storage('v1');
  try {
    await storage.buckets.insert({
      project: projectId,
      requestBody: {
        name: 'cromwell-' + projectId
      },
      auth: oAuth2Client
    });
  } catch (err) {
    // Allow 409 CONFLICT as normal behaviour
    if (err.response.status !== HttpStatus.CONFLICT) {
      console.log(err);
      throw err;
    }
  }
};

/**
 * Verifies idToken AND gets refresh token from database.
 * Attaches the refresh_token to the auth client for use.
 *
 * @param oAuth2Client google auth client
 * @param idToken Google id_token
 * @returns void
 */
const attachRefreshToken = async (oAuth2Client, idToken) => {
  const payload = await getPayload(oAuth2Client, idToken);
  const response = await getToken(payload.email);
  oAuth2Client.setCredentials({
    refresh_token: response.token
  });
};

/**
 * Get id_token payload.
 *
 * @param oAuth2Client google auth client
 * @param idToken Google id_token
 * @returns token payload
 */
const getPayload = async (oAuth2Client, idToken) => {
  const { payload } = await oAuth2Client.verifyIdToken({
    idToken: idToken,
    audience: process.env.CLIENT_ID
  });
  return payload;
};

module.exports = {
  setupAuth,
  createBucket,
  attachRefreshToken,
  getPayload
};
