import { oauth2Client } from "../config/config";

export default function refreshAccesToken(req, res, next) {
  const tokens = req.session.tokens

  if (tokens && tokens.expiry_date < Date.now()) {
    oauth2Client.setCredentials(tokens)
    oauth2Client.refreshAccessToken((err, newTokens) => {
      if (err) {
        console.error('Error refreshing token:', err);
        return res.status(401).send('Token refresh failed');
      }
      req.session.tokens = newTokens;
      next();
    })
  } else {
    next()
  }
}