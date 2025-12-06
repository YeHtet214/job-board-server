import express, { CookieOptions } from "express";
import { createServer } from 'http';
import cors from 'cors';
import passport from 'passport';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import bodyParser from 'body-parser';
import swaggerUi from 'swagger-ui-express'

// Import routers
import authRouter from './routes/auth.route.js';
import profileRouter from './routes/profile.route.js';
import companyRouter from './routes/company.route.js';
import jobRouter from './routes/job.route.js';
import applicationRouter from './routes/application.route.js';
import userRouter from './routes/user.route.js';
import dashboardRouter from './routes/dashboard.routes.js';
import savedJobRouter from './routes/saved-job.route.js';
import passwordRouter from './routes/password.route.js';
import errorHandler from './middleware/error.middleware.js';

// Import Passport config
import './config/passport.config.js';
import { FRONTEND_URL, SESSION_SECRET } from './config/env.config.js';
// import { app, httpServer, io } from './config/socket.config.js';
import { initSocketServer } from './config/socket.config.js';
import MessagingRouter from "./routes/message.route.js";
import swaggerSpec from "./config/swagger.config.js";
import resumeRouter from "./routes/resume.route.js";

const app = express();
const port = process.env.PORT || 3000;  
const httpServer = createServer(app);
const io = initSocketServer(httpServer);

export const REFRESH_TOKEN_COOKIE_CONFIG: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'none',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  }),
);

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
app.use('/api/password', passwordRouter);
app.use('/api/profiles', profileRouter);
app.use('/api/resumes', resumeRouter);
app.use('/api/companies', companyRouter);
app.use('/api/jobs', jobRouter);
app.use('/api/applications', applicationRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/saved-jobs', savedJobRouter);
app.use('/api/conversations', MessagingRouter);

// Swagger documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

app.use(errorHandler);

httpServer.listen(port, () => {
  console.log(
    `Server is running on port ${port} in ${process.env.NODE_ENV || 'development'} mode`,
  );
});

// Export for testing purposes
export { app, io };
