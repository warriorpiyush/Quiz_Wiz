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

// Configure CORS to allow requests from frontend
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'http://localhost:3000',
      'https://localhost:3000',
      'https://quiz-wiz-kappa.vercel.app',
      'https://quiz-wiz-kappa.vercel.app/',
    ];

    // Check if origin is in allowed list or matches Vercel pattern
    const isAllowed = allowedOrigins.includes(origin) ||
                     /^https:\/\/quiz-wiz-.*\.vercel\.app$/.test(origin);

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Cookie',
    'Set-Cookie',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  preflightContinue: false
};

app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie, Set-Cookie, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Max-Age', '86400');
  res.sendStatus(200);
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

// CORS test endpoint
app.get('/test-cors', (req, res) => {
  res.json({
    message: 'CORS is working!',
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/", Routes);

database();

server.listen(8000, () => {
  console.log("Running on port 8000");
});
