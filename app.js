import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors  from "cors"

import authRouter from './routes/auth.js';
import usersRouter from './routes/users.js';
import projectRouter from './routes/projects.js';

dotenv.config();
const app = express();

const PORT = process.env.PORT ||  3000;

app.use(cors({
  origin: '*', 
}))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/projects', projectRouter);

// catch 404 and forward to error handler
// app.use(function (req, res, next) {
//   next(createError(404));
// });

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  console.log("\n", { err }, "\n");

  // render the error page
  res.status(err.status || 500);
  res.send({ error: err });
});

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
})