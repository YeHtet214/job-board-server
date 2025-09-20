import express from "express";
import { createServer } from 'http';
import cors from 'cors';
import passport from 'passport';
import session from 'express-session';
import { rateLimit } from 'express-rate-limit';
import bodyParser from 'body-parser';

// Import your routers
import authRouter from './routes/auth.route.js';
import profileRouter from './routes/profile.route.js';
import companyRouter from './routes/company.route.js';
import jobRouter from './routes/job.route.js';
import applicationRouter from './routes/application.route.js';
import userRouter from './routes/user.route.js';
import dashboardRouter from './routes/dashboard.routes.js';
import savedJobRouter from './routes/saved-job.route.js';
import errorHandler from './middleware/error.middleware.js';

// Import Passport config
import './config/passport.config.js';
import { FRONTEND_URL, SESSION_SECRET } from './config/env.config.js';
// import { app, httpServer, io } from './config/socket.config.js';
import { initSocketServer } from './config/socket.config.js';

const app = express();
const port = process.env.PORT || 3000;  
const httpServer = createServer(app);
const io = initSocketServer(httpServer);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  }),
);

// Initialize rate limiter
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 15 minutes
  limit: 1000, // limit each IP to 100 requests per windowMs
});

app.use(limiter);

// Initialize session
app.use(
  session({
    secret: SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // Heroku uses HTTPS in production
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }),
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

app.set('io', io);

// Your existing routes
app.use('/api/users', userRouter);
app.use('/api/auth', authRouter);
app.use('/api/profiles', profileRouter);
app.use('/api/companies', companyRouter);
app.use('/api/jobs', jobRouter);
app.use('/api/applications', applicationRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/saved-jobs', savedJobRouter);

app.use(errorHandler);

// Start the server
httpServer.listen(port, () => {
  console.log(
    `Server is running on port ${port} in ${process.env.NODE_ENV || 'development'} mode`,
  );
});

// Export for testing purposes
export { app, io };
