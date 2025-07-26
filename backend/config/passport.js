import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import Examiner from '../Models/Examiner.js';
import Student from '../Models/Student.js';
import dotenv from 'dotenv';

dotenv.config();

// Serialize user for session
passport.serializeUser((user, done) => {
  const sessionData = {
    id: user._id.toString(),
    type: user.userType || (user.type === 1 ? 'examiner' : 'student'),
    email: user.email
  };
  done(null, sessionData);
});

// Deserialize user from session
passport.deserializeUser(async (sessionUser, done) => {
  try {
    let user;

    if (sessionUser.type === 'examiner') {
      user = await Examiner.findById(sessionUser.id);
      if (user) user.userType = 'examiner';
    } else {
      user = await Student.findById(sessionUser.id);
      if (user) user.userType = 'student';
    }

    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback",
  passReqToCallback: true // This allows us to access req in the callback
}, async (req, accessToken, refreshToken, profile, done) => {
  try {

    const { id, displayName, emails, photos } = profile;
    const email = emails?.[0]?.value;
    let profilePicture = photos?.[0]?.value;

    // Fix Google profile picture URL to get higher resolution
    if (profilePicture && profilePicture.includes('googleusercontent.com')) {
      // Remove size parameter and add a larger size
      profilePicture = profilePicture.replace(/=s\d+-c/, '=s200-c');
      // If no size parameter, add one
      if (!profilePicture.includes('=s')) {
        profilePicture += '=s200-c';
      }
    }

    if (!email) {
      return done(new Error('No email found in Google profile'), null);
    }

    // Check if user exists as examiner (by email or Google ID)
    let existingExaminer = await Examiner.findOne({
      $or: [{ googleId: id }, { email: email }]
    });

    if (existingExaminer) {
      // Update Google info if not already set
      if (!existingExaminer.googleId || existingExaminer.googleId !== id) {
        existingExaminer.googleId = id;
        existingExaminer.profilePicture = profilePicture;
        existingExaminer.name = displayName;
        await existingExaminer.save();
      }

      existingExaminer.userType = 'examiner';
      return done(null, existingExaminer);
    }

    // Check if user exists as student (by email or Google ID)
    let existingStudent = await Student.findOne({
      $or: [{ googleId: id }, { email: email }]
    });

    if (existingStudent) {
      // Update Google info if not already set
      if (!existingStudent.googleId || existingStudent.googleId !== id) {
        existingStudent.googleId = id;
        existingStudent.profilePicture = profilePicture;
        existingStudent.name = displayName;
        await existingStudent.save();
      }

      existingStudent.userType = 'student';
      return done(null, existingStudent);
    }

    // Get the intended user type from session (set during OAuth initiation)
    const intendedUserType = req.session?.intendedUserType || 'student';

    // Also check email domain for automatic detection
    const emailSuggestsExaminer = email.includes('@university.edu') ||
                                 email.includes('@school.edu') ||
                                 email.includes('@college.edu') ||
                                 email.includes('teacher') ||
                                 email.includes('professor') ||
                                 email.includes('instructor');

    // Determine final user type: intended type takes precedence, email domain as fallback
    const shouldBeExaminer = intendedUserType === 'examiner' ||
                            (intendedUserType === 'student' && emailSuggestsExaminer);

    if (shouldBeExaminer) {
      // Create new examiner
      const firstName = displayName.split(' ')[0] || displayName;
      const lastName = displayName.split(' ').slice(1).join(' ') || '';

      const newExaminer = new Examiner({
        googleId: id,
        firstName: firstName,
        lastName: lastName,
        name: displayName,
        email: email,
        profilePicture: profilePicture,
        password: 'google-auth-' + Date.now(),
        college: 'Google Sign-up',
        type: 1, // Examiner type
      });

      const savedExaminer = await newExaminer.save();

      savedExaminer.userType = 'examiner';
      return done(null, savedExaminer);
    } else {
      // Create new student (default for Google sign-up)

      const firstName = displayName.split(' ')[0] || displayName;
      const lastName = displayName.split(' ').slice(1).join(' ') || '';

      const newStudent = new Student({
        googleId: id,
        firstName: firstName,
        lastName: lastName,
        name: displayName,
        email: email,
        profilePicture: profilePicture,
        password: 'google-auth-' + Date.now(),
        college: 'Google Sign-up',
        degree: 'Not specified',
        collegeRollNo: 'GOOGLE-' + id.substring(0, 8),
        branch: 'Not specified',
        type: 0, // Student type
        quizzesAttended: []
      });

      const savedStudent = await newStudent.save();

      savedStudent.userType = 'student';
      return done(null, savedStudent);
    }

  } catch (error) {
    return done(error, null);
  }
}));

export default passport;
