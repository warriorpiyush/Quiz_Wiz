import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import session from "express-session";
import http from "http";
import database from "./db.js";
import passport from "./config/passport.js";
import Routes from "./Routes/routes.js";
import authRoutes from "./Routes/auth.js";
import adminRoutes from "./Routes/admin.js";

const app = express();
const server = http.createServer(app);

// Configure CORS to allow requests from localhost:3000
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://localhost:3000',
    'https://quiz-wiz-kappa.vercel.app',
    'https://quiz-wiz-kappa.vercel.app/',
    /^https:\/\/quiz-wiz-.*\.vercel\.app$/
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Cookie',
    'Set-Cookie',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  preflightContinue: false
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Additional CORS headers for complex requests
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'http://localhost:3000',
    'https://localhost:3000',
    'https://quiz-wiz-kappa.vercel.app'
  ];

  if (allowedOrigins.includes(origin) || /^https:\/\/quiz-wiz-.*\.vercel\.app$/.test(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie, Set-Cookie, X-Requested-With, Accept, Origin');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

  next();
});

// Body parsing middleware (must come before routes)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.json({ extended: true, limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Session configuration for Google Auth
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-here',
  resave: true, // Changed to true to ensure session persistence
  saveUninitialized: true, // Changed to true to save empty sessions
  name: 'quizwiz.sid', // Custom session name
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/", Routes);

database();

server.listen(8000, () => {
  console.log("Running on port 8000");
});
