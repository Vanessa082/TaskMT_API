
import express from 'express';  
import dotenv from 'dotenv';  
import cors from 'cors';  
import cookieParser from 'cookie-parser';  
import http from 'http'; 
import { Server as SocketIO } from 'socket.io'; 

import authRouter from './routes/auth.js';
import taskRouter from './routes/tasks.js'  
import usersRouter from './routes/users.js';  
import projectRouter from './routes/projects.js';  
import notificationRouter from './routes/notificationRouter.js';  

dotenv.config();  
const app = express();  

const PORT = process.env.PORT || 3000;  

app.use(cors({  
  origin: '*',  
}));  
app.use(express.json());  
app.use(express.urlencoded({ extended: true }));  
app.use(cookieParser());   

app.use('./tasks', taskRouter)
app.use('/auth', authRouter);  
app.use('/users', usersRouter);  
app.use('/projects', projectRouter);  
app.use('/notifications', notificationRouter);  

// Create the HTTP server  
const server = http.createServer(app);   

// Initialize Socket.IO with the HTTP server  
export const io = new SocketIO(server); // Ensure 'SocketIO' is used instead of 'socketIo'  

// Socket.IO connection handling  
io.on('connection', (socket) => {  
  console.log('A user connected: ' + socket.id);  

  socket.on('sendNotification', async (notification) => {  
    try {  
      const query = 'INSERT INTO notifications (user_id, message) VALUES ($1, $2) RETURNING *';  
      const values = [notification.userId, notification.message];  
      
      const res = await pool.query(query, values);  
      console.log('Notification saved:', res.rows[0]);  
      
      // Emit the notification to all clients  
      io.emit('receiveNotification', res.rows[0]);  
    } catch (error) {  
      console.error('Error saving notification:', error);  
    }  
  });  

  socket.on('disconnect', () => {  
    console.log('User disconnected: ' + socket.id);  
  });  
});  

// Error handling middleware  
app.use(function (err, req, res, next) {  
  res.locals.message = err.message;  
  res.locals.error = req.app.get('env') === 'development' ? err : {};  

  console.log("\n", { err }, "\n");  
  res.status(err.status || 500);  
  res.send({ error: err });  
});  

// Start the server  
server.listen(PORT, () => {  
  console.log(`Listening on port ${PORT}`);  
});