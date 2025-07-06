import express from 'express';
import cors from 'cors';
import passport from 'passport';
import session from 'express-session';
import { rateLimit } from 'express-rate-limit';

import bodyParser from 'body-parser';
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

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));      

// Initialize rate limiter
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 15 minutes
  limit: 1000 // limit each IP to 100 requests per windowMs
});

app.use(limiter);

// Initialize session
app.use(session({
  secret: process.env.SESSION_SECRET || 'secretJobBoardKey',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

app.use('/api/users', userRouter);
app.use('/api/auth', authRouter);
app.use('/api/profiles', profileRouter);
app.use('/api/companies', companyRouter);
app.use('/api/jobs', jobRouter);
app.use('/api/applications', applicationRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/saved-jobs', savedJobRouter);

app.use(errorHandler);

// Export the app for vercel
export default app;

// Only run the server if not in production mode
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log('Server is running on http://localhost:' + port);
  })
}
