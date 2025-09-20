import express, { RequestHandler } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
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
import { RequestWithUser } from './types/users.js';
import { verifyToken } from './middleware/auth.middleware.js';
import { fetchUserById } from './services/user.service.js';
import { UnauthorizedError } from './middleware/errorHandler.js';

const app = express();
const httpServer = createServer(app); // Create HTTP server from Express app
const port = process.env.PORT || 3000;

// Initialize Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: FRONTEND_URL,
    credentials: true
  },
  // Heroku-specific configuration
  transports: ['websocket', 'polling'],
  allowEIO3: true
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
  origin: FRONTEND_URL,
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
  secret: SESSION_SECRET as string,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Heroku uses HTTPS in production
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  },
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Share session middleware with Socket.io
io.engine.use(session({
  secret: SESSION_SECRET as string,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

io.engine.use(passport.initialize());
io.engine.use(passport.session());

// Socket.io authentication middleware
io.use(async (socket, next) => {
  try {
    // Try to get session from handshake
    const request = socket.request as RequestWithUser;
    const session = request.session;
    
    if (!session || !(session as any).passport || !(session as any).passport.user) {
      // Alternative: check for token in handshake auth
      const token = socket.handshake.auth.token;
      if (token) {
        // Verify token and get user
        const user = await verifyToken(token);
        if (user) {
          socket.data.user = user;
          return next();
        }
      }
      throw new UnauthorizedError("Authentication error: No session or token found");
    }
    
    // Get user from session
    const user = await fetchUserById((session as any).passport.user);
    
    if (!user) {
      throw new UnauthorizedError("Authentication error: User not found");
    }
    
    socket.data.user = user;
    next();
  } catch (error: any) {
      throw new UnauthorizedError("Authentication error: " + error.message);
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.data.user.id);
  
  // Join user to their personal room
  socket.join(`user_${socket.data.user.id}`);
  
  // Import and register your message handlers
  registerMessageHandlers(socket);
  
  socket.on('disconnect', (reason) => {
    console.log('User disconnected:', socket.data.user.id, 'Reason:', reason);
  });
});

// Make io accessible to routes
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

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    websockets: io.engine.clientsCount,
    timestamp: new Date().toISOString()
  });
});

app.use(errorHandler);

// Start the server
httpServer.listen(port, () => {
  console.log(`Server is running on port ${port} in ${process.env.NODE_ENV || 'development'} mode`);
});

// Export for testing purposes
export { app, io };

function registerMessageHandlers(socket: any) {
  // Handle sending a message
  socket.on('message:send', async (data: any, callback: any) => {
    try {
      console.log('Message received:', data);
      
      // Simulate message processing
      const mockMessage = {
        id: Date.now().toString(),
        content: data.content,
        senderId: socket.data.user.id,
        conversationId: data.conversationId,
        createdAt: new Date()
      };
      
      // Broadcast to all users in the conversation
      socket.to(data.conversationId).emit('message:receive', mockMessage);
      
      // Send acknowledgment
      if (callback) {
        callback({ status: 'success', message: mockMessage });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      if (callback) {
        callback({ status: 'error', message: 'Failed to send message' });
      }
    }
  });

  // Handle joining a conversation
  socket.on('conversation:join', (conversationId: string) => {
    socket.join(conversationId);
    console.log(`User ${socket.data.user.id} joined conversation ${conversationId}`);
  });

  // Handle leaving a conversation
  socket.on('conversation:leave', (conversationId: string) => {
    socket.leave(conversationId);
    console.log(`User ${socket.data.user.id} left conversation ${conversationId}`);
  });
}