import refreshAccesToken from "../utils/refreshAccessToken.js";
import express from 'express';

const router = express.Router()

router.get('/', refreshAccesToken, (req, res) => {
  try {
    const calendarUrl = 'https://calendar.google.com/calendar/u/0/r';
    res.redirect(calendarUrl);
  } catch (error) {
    console.error('Redirecting returned an error:', error);
    return res.status(500).send('Failed to veiw calendar');
  }
})

export default router