import { oauth2Client } from "../config/config.js";
const Scopes = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.readonly'
]

export const url = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: Scopes,
  prompt: 'consent'
});