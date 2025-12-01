"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const cors_1 = __importDefault(require("cors"));
const passport_1 = __importDefault(require("passport"));
const express_session_1 = __importDefault(require("express-session"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_rate_limit_1 = require("express-rate-limit");
const body_parser_1 = __importDefault(require("body-parser"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
// Import routers
const auth_route_js_1 = __importDefault(require("./routes/auth.route.js"));
const profile_route_js_1 = __importDefault(require("./routes/profile.route.js"));
const company_route_js_1 = __importDefault(require("./routes/company.route.js"));
const job_route_js_1 = __importDefault(require("./routes/job.route.js"));
const application_route_js_1 = __importDefault(require("./routes/application.route.js"));
const user_route_js_1 = __importDefault(require("./routes/user.route.js"));
const dashboard_routes_js_1 = __importDefault(require("./routes/dashboard.routes.js"));
const saved_job_route_js_1 = __importDefault(require("./routes/saved-job.route.js"));
const error_middleware_js_1 = __importDefault(require("./middleware/error.middleware.js"));
// Import Passport config
require("./config/passport.config.js");
const env_config_js_1 = require("./config/env.config.js");
// import { app, httpServer, io } from './config/socket.config.js';
const socket_config_js_1 = require("./config/socket.config.js");
const message_route_js_1 = __importDefault(require("./routes/message.route.js"));
const swagger_config_js_1 = __importDefault(require("./config/swagger.config.js"));
const app = (0, express_1.default)();
exports.app = app;
const port = process.env.PORT || 3000;
const httpServer = (0, http_1.createServer)(app);
const io = (0, socket_config_js_1.initSocketServer)(httpServer);
exports.io = io;
app.use((0, cookie_parser_1.default)());
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)({
    origin: env_config_js_1.FRONTEND_URL,
    credentials: true,
}));
const limiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 5 * 60 * 1000, // 15 minutes
    limit: 1000, // limit each IP to 100 requests per windowMs
});
app.use(limiter);
// Initialize session
app.use((0, express_session_1.default)({
    secret: env_config_js_1.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Heroku uses HTTPS in production
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
}));
// Initialize Passport
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
app.set('io', io);
// Your existing routes
app.use('/api/users', user_route_js_1.default);
app.use('/api/auth', auth_route_js_1.default);
app.use('/api/profiles', profile_route_js_1.default);
app.use('/api/companies', company_route_js_1.default);
app.use('/api/jobs', job_route_js_1.default);
app.use('/api/applications', application_route_js_1.default);
app.use('/api/dashboard', dashboard_routes_js_1.default);
app.use('/api/saved-jobs', saved_job_route_js_1.default);
app.use('/api/conversations', message_route_js_1.default);
// Swagger documentation
app.use('/docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_config_js_1.default));
app.get('/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swagger_config_js_1.default);
});
app.use(error_middleware_js_1.default);
httpServer.listen(port, () => {
    console.log(`Server is running on port ${port} in ${process.env.NODE_ENV || 'development'} mode`);
});
