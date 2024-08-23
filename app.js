import express from 'express';  
import dotenv from 'dotenv';  
import cookieParser from 'cookie-parser';  
import cors from 'cors';  
import http from 'http';  
import { Server } from 'socket.io';  

// Import routes  
import tasksRoute from './routes/tasks.js';  
import authRouter from './routes/auth.js';  
import usersRouter from './routes/users.js';  
import projectRouter from './routes/projects.js';  

dotenv.config();  

const app = express();  
const PORT = process.env.PORT || 3000;  

// Middleware  
app.use(cors({ origin: '*' }));  
app.use(express.json());  
app.use(express.urlencoded({ extended: true }));  
app.use(cookieParser());  

// Routes  
app.use('/tasks', tasksRoute);  
app.use('/auth', authRouter);  
app.use('/users', usersRouter);  
app.use('/projects', projectRouter);  

// Error handling middleware  
app.use(function (err, req, res, next) {  
  res.locals.message = err.message;  
  res.locals.error = req.app.get('env') === 'development' ? err : {};  
  console.error("\n", { err }, "\n");  
  res.status(err.status || 500);  
  res.send({ error: err });  
});  

// Set up HTTP server and Socket.IO  
const server = http.createServer(app);  
const io = new Server(server);  

// Socket.IO connection  
io.on('connection', (socket) => {  
  console.log('A user connected: ' + socket.id);  

  socket.on('sendNotification', async (notification) => {  
    try {  
      const query = 'INSERT INTO notifications (user_id, message) VALUES ($1, $2) RETURNING *';  
      const values = [notification.userId, notification.message];  
      const res = await pool.query(query, values); // Ensure pool is defined  
      console.log('Notification saved:', res.rows[0]);  
      io.emit('receiveNotification', res.rows[0]);  
    } catch (error) {  
      console.error('Error saving notification:', error);  
    }  
  });  

  socket.on('disconnect', () => {  
    console.log('User disconnected: ' + socket.id);  
  });  
});  

// Export the app for testing or other usage  
export default app;  

// Start server  
server.listen(PORT, () => {  
  console.log(`Listening on port ${PORT}`);  
});