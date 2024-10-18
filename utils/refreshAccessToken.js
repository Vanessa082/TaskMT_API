import { oauth2Client } from '../config/config.js';
import { url } from './redirectUrl.js';

export default function refreshAccessToken(req, res, next) {
  const tokens = req.session.tokens;

  if (!tokens) {
    return res.redirect(url); 
  }

  if (tokens.expiry_date && tokens.expiry_date < Date.now()) {
    oauth2Client.setCredentials(tokens);
    oauth2Client.refreshAccessToken((err, newTokens) => {
      if (err) {
        console.error('Error refreshing token:', err);
        return res.redirect(url); 
      }
      req.session.tokens = newTokens.credentials || newTokens;
      next();
    });
  } else {
    next(); 
  }
}
