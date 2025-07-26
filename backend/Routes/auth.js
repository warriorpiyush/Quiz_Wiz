import express from 'express';
import passport from '../config/passport.js';

const router = express.Router();

console.log('🔗 Auth routes loading...');

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
  console.log(`🧪 Testing session with type: ${userType}`);

  req.session.intendedUserType = userType;
  req.session.testData = `Test data for ${userType}`;

  req.session.save((err) => {
    if (err) {
      console.error('❌ Session save error:', err);
      return res.status(500).json({ error: 'Session save failed', details: err.message });
    }

    console.log('✅ Session saved:', req.session);
    res.json({
      message: `Session set for ${userType}`,
      sessionId: req.sessionID,
      sessionData: req.session
    });
  });
});

// Google OAuth routes with user type parameter
router.get('/google', (req, res, next) => {
  console.log('🚀 Starting Google OAuth flow...');
  console.log('📋 Query parameters:', req.query);
  console.log('📋 Session before:', req.session);

  // Store the intended user type in session
  const userType = req.query.type || 'student'; // default to student
  req.session.intendedUserType = userType;

  // Force session save
  req.session.save((err) => {
    if (err) {
      console.error('❌ Session save error:', err);
    } else {
      console.log('✅ Session saved successfully');
    }
  });

  console.log(`👤 User intends to sign up as: ${userType}`);
  console.log('📋 Session after:', req.session);

  passport.authenticate('google', {
    scope: ['profile', 'email']
  })(req, res, next);
});

router.get('/google/callback',
  (req, res, next) => {
    console.log('📞 Google callback received');
    passport.authenticate('google', {
      failureRedirect: 'http://localhost:3000/?error=auth_failed'
    })(req, res, next);
  },
  (req, res) => {
    try {
      console.log('✅ Google authentication successful');
      const user = req.user;

      if (!user) {
        console.log('❌ No user found after authentication');
        return res.redirect('http://localhost:3000/?error=no_user');
      }

      console.log(`👤 Authenticated user: ${user.email}, Type: ${user.userType}`);

      const userType = user.userType || 'student';

      // Redirect based on user type
      if (userType === 'examiner') {
        console.log('🎯 Redirecting to examiner dashboard');
        res.redirect('http://localhost:3000/examiner/dashboard');
      } else {
        console.log('🎯 Redirecting to candidate dashboard');
        res.redirect('http://localhost:3000/candidate/dashboard');
      }
    } catch (error) {
      console.error('❌ Error in callback:', error);
      res.redirect('http://localhost:3000/?error=callback_error');
    }
  }
);

// Logout route
router.get('/logout', (req, res) => {
  console.log('🚪 Logout requested for user:', req.user?.email);

  req.logout((err) => {
    if (err) {
      console.error('❌ Logout error:', err);
      return res.status(500).json({ message: 'Logout failed' });
    }

    // Destroy the session completely
    req.session.destroy((destroyErr) => {
      if (destroyErr) {
        console.error('❌ Session destroy error:', destroyErr);
      } else {
        console.log('✅ Session destroyed successfully');
      }

      // Clear the session cookie
      res.clearCookie('connect.sid');
      console.log('✅ User logged out successfully');
      res.redirect('http://localhost:3000/?logout=success');
    });
  });
});

// Check authentication status
router.get('/status', (req, res) => {
  console.log('Auth status check - Authenticated:', req.isAuthenticated());

  if (req.isAuthenticated()) {
    const user = req.user;
    console.log(`Auth status - User: ${user.email}, Type: ${user.userType}`);
    console.log(`📸 Profile picture in status: ${user.profilePicture}`);

    res.json({
      isAuthenticated: true,
      user: {
        id: user._id,
        name: user.name || `${user.firstName} ${user.lastName}`.trim(),
        email: user.email,
        userType: user.userType || 'student',
        profilePicture: user.profilePicture,
        photo: user.photo, // Include legacy photo field for debugging
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
  console.log('🔧 Force logout requested');

  req.logout((err) => {
    if (err) {
      console.error('❌ Force logout error:', err);
    }

    req.session.destroy((destroyErr) => {
      if (destroyErr) {
        console.error('❌ Session destroy error:', destroyErr);
      }

      res.clearCookie('connect.sid');
      res.json({ message: 'Force logout successful' });
    });
  });
});

// Direct examiner Google auth (bypass session issues)
router.get('/google-examiner', (req, res, next) => {
  console.log('🎓 Direct Examiner Google OAuth flow...');

  // Set examiner type directly in a more persistent way
  req.session.intendedUserType = 'examiner';
  req.session.directExaminerAuth = true;

  // Force session save and wait for it
  req.session.save((err) => {
    if (err) {
      console.error('❌ Session save error:', err);
      return res.status(500).send('Session error');
    }

    console.log('✅ Examiner session saved, redirecting to Google...');
    passport.authenticate('google', {
      scope: ['profile', 'email']
    })(req, res, next);
  });
});

// Direct student Google auth
router.get('/google-student', (req, res, next) => {
  console.log('👨‍🎓 Direct Student Google OAuth flow...');

  req.session.intendedUserType = 'student';
  req.session.directStudentAuth = true;

  req.session.save((err) => {
    if (err) {
      console.error('❌ Session save error:', err);
      return res.status(500).send('Session error');
    }

    console.log('✅ Student session saved, redirecting to Google...');
    passport.authenticate('google', {
      scope: ['profile', 'email']
    })(req, res, next);
  });
});

export default router;
