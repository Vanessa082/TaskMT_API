import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from "cors"

import authRouter from './routes/auth.js';
import usersRouter from './routes/users.js';
import projectRouter from './routes/projects.js';
import taskRouter from './routes/tasks.js'
import session from 'express-session';

dotenv.config();
const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: '*',
}))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: process.env.GOOGLE_SECRET_KEY,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } 
}))

app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/projects', projectRouter);
app.use('/tasks', taskRouter)

app.get("/health", (_, res) => {
  const date = new Date();
  res.status(200).json({
    message: "🚀 server up and running 🚀",
    time: `${date.toDateString()} | ${date.toLocaleTimeString()}`
  });
});

app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  console.log("\n", { err }, "\n");

  // render the error page
  res.status(err.status || 500);
  res.send({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
})