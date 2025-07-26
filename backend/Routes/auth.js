import express from 'express';
import passport from '../config/passport.js';

const router = express.Router();

// Test route to verify Google OAuth config
router.get('/test-config', (_req, res) => {
  res.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID ? 'Set ✅' : 'Missing ❌',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'Set ✅' : 'Missing ❌',
    sessionSecret: process.env.SESSION_SECRET ? 'Set ✅' : 'Missing ❌',
    callbackUrl: '/auth/google/callback',
    authUrl: '/auth/google'
  });
});

// Test session endpoint
router.get('/test-session/:type', (req, res) => {
  const userType = req.params.type;

  req.session.intendedUserType = userType;
  req.session.testData = `Test data for ${userType}`;

  req.session.save((err) => {
    if (err) {
      return res.status(500).json({ error: 'Session save failed', details: err.message });
    }

    res.json({
      message: `Session set for ${userType}`,
      sessionId: req.sessionID,
      sessionData: req.session
    });
  });
});

// Google OAuth routes with user type parameter
router.get('/google', (req, res, next) => {
  // Store the intended user type in session
  const userType = req.query.type || 'student'; // default to student
  req.session.intendedUserType = userType;

  // Force session save
  req.session.save((err) => {
    if (err) {
      // Handle error silently
    }
  });

  passport.authenticate('google', {
    scope: ['profile', 'email']
  })(req, res, next);
});

router.get('/google/callback',
  (req, res, next) => {
    passport.authenticate('google', {
      failureRedirect: 'http://localhost:3000/?error=auth_failed'
    })(req, res, next);
  },
  (req, res) => {
    try {
      const user = req.user;

      if (!user) {
        return res.redirect('http://localhost:3000/?error=no_user');
      }

      const userType = user.userType || 'student';

      // Redirect based on user type
      if (userType === 'examiner') {
        res.redirect('http://localhost:3000/examiner/dashboard');
      } else {
        res.redirect('http://localhost:3000/candidate/dashboard');
      }
    } catch (error) {
      res.redirect('http://localhost:3000/?error=callback_error');
    }
  }
);

// Logout route
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }

    // Destroy the session completely
    req.session.destroy((destroyErr) => {
      // Clear the session cookie
      res.clearCookie('connect.sid');
      res.redirect('http://localhost:3000/?logout=success');
    });
  });
});

// Check authentication status
router.get('/status', (req, res) => {
  if (req.isAuthenticated()) {
    const user = req.user;

    res.json({
      isAuthenticated: true,
      user: {
        id: user._id,
        name: user.name || `${user.firstName} ${user.lastName}`.trim(),
        email: user.email,
        userType: user.userType || 'student',
        profilePicture: user.profilePicture,
        photo: user.photo,
        googleId: user.googleId
      }
    });
  } else {
    res.json({ isAuthenticated: false });
  }
});

// Debug endpoint to check user data
router.get('/debug', async (req, res) => {
  try {
    const Student = (await import('../Models/Student.js')).default;
    const Examiner = (await import('../Models/Examiner.js')).default;

    const students = await Student.find({}).select('email googleId name firstName lastName');
    const examiners = await Examiner.find({}).select('email googleId name firstName lastName');

    res.json({
      isAuthenticated: req.isAuthenticated(),
      currentUser: req.user ? {
        id: req.user._id,
        email: req.user.email,
        userType: req.user.userType,
        googleId: req.user.googleId
      } : null,
      students: students,
      examiners: examiners
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clear all sessions (for debugging)
router.post('/clear-sessions', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to clear session' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Session cleared successfully' });
  });
});

// Force logout endpoint
router.post('/force-logout', (req, res) => {
  req.logout((err) => {
    req.session.destroy((destroyErr) => {
      res.clearCookie('connect.sid');
      res.json({ message: 'Force logout successful' });
    });
  });
});

// Direct examiner Google auth (bypass session issues)
router.get('/google-examiner', (req, res, next) => {
  // Set examiner type directly in a more persistent way
  req.session.intendedUserType = 'examiner';
  req.session.directExaminerAuth = true;

  // Force session save and wait for it
  req.session.save((err) => {
    if (err) {
      return res.status(500).send('Session error');
    }

    passport.authenticate('google', {
      scope: ['profile', 'email']
    })(req, res, next);
  });
});

// Direct student Google auth
router.get('/google-student', (req, res, next) => {
  req.session.intendedUserType = 'student';
  req.session.directStudentAuth = true;

  req.session.save((err) => {
    if (err) {
      return res.status(500).send('Session error');
    }

    passport.authenticate('google', {
      scope: ['profile', 'email']
    })(req, res, next);
  });
});

export default router;
