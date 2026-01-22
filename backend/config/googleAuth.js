const { google } = require("googleapis");
require("dotenv").config();

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URL
);

const calendar = google.calendar({
  version: "v3",
  auth: oauth2Client,
 //auth: process.env.API_KEY
});

const scopes = ["https://www.googleapis.com/auth/calendar"];

module.exports = {
  oauth2Client,
  calendar,
  scopes,
};
