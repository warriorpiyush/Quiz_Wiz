import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import Examiner from '../Models/Examiner.js';
import Student from '../Models/Student.js';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔧 Passport Configuration Loading...');
console.log('Google Client ID:', process.env.GOOGLE_CLIENT_ID ? 'Set ✅' : 'Missing ❌');
console.log('Google Client Secret:', process.env.GOOGLE_CLIENT_SECRET ? 'Set ✅' : 'Missing ❌');

// Serialize user for session
passport.serializeUser((user, done) => {
  console.log(`📝 Serializing user: ${user.email} (Type: ${user.userType || 'unknown'})`);
  const sessionData = {
    id: user._id.toString(),
    type: user.userType || (user.type === 1 ? 'examiner' : 'student'),
    email: user.email
  };
  console.log(`📝 Session data:`, sessionData);
  done(null, sessionData);
});

// Deserialize user from session
passport.deserializeUser(async (sessionUser, done) => {
  try {
    console.log(`🔍 Deserializing user:`, sessionUser);
    let user;

    if (sessionUser.type === 'examiner') {
      user = await Examiner.findById(sessionUser.id);
      if (user) user.userType = 'examiner';
    } else {
      user = await Student.findById(sessionUser.id);
      if (user) user.userType = 'student';
    }

    if (user) {
      console.log(`✅ Successfully deserialized user: ${user.email} (${user.userType})`);
    } else {
      console.log(`❌ User not found during deserialization: ${sessionUser.id}`);
    }

    done(null, user);
  } catch (error) {
    console.error('❌ Error deserializing user:', error);
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
    console.log(`🔐 Google OAuth Strategy Called`);
    console.log(`👤 Profile:`, {
      id: profile.id,
      displayName: profile.displayName,
      email: profile.emails?.[0]?.value
    });
    console.log(`📋 Request session:`, {
      intendedUserType: req.session?.intendedUserType,
      sessionID: req.sessionID,
      sessionKeys: Object.keys(req.session || {})
    });

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

    console.log(`📸 Profile picture data:`, {
      photosArray: photos,
      originalUrl: photos?.[0]?.value,
      processedUrl: profilePicture,
      photosLength: photos?.length
    });

    if (!email) {
      console.log(`❌ No email found in Google profile`);
      return done(new Error('No email found in Google profile'), null);
    }

    console.log(`🔍 Searching for user with email: ${email} or Google ID: ${id}`);

    // Check if user exists as examiner (by email or Google ID)
    let existingExaminer = await Examiner.findOne({
      $or: [{ googleId: id }, { email: email }]
    });

    if (existingExaminer) {
      console.log(`👨‍🏫 Found existing examiner: ${existingExaminer.email}`);

      // Update Google info if not already set
      if (!existingExaminer.googleId || existingExaminer.googleId !== id) {
        existingExaminer.googleId = id;
        existingExaminer.profilePicture = profilePicture;
        existingExaminer.name = displayName;
        await existingExaminer.save();
        console.log(`✅ Updated examiner with Google info`);
      }

      existingExaminer.userType = 'examiner';
      console.log(`🎯 Returning examiner user`);
      return done(null, existingExaminer);
    }

    // Check if user exists as student (by email or Google ID)
    let existingStudent = await Student.findOne({
      $or: [{ googleId: id }, { email: email }]
    });

    if (existingStudent) {
      console.log(`👨‍🎓 Found existing student: ${existingStudent.email}`);

      // Update Google info if not already set
      if (!existingStudent.googleId || existingStudent.googleId !== id) {
        existingStudent.googleId = id;
        existingStudent.profilePicture = profilePicture;
        existingStudent.name = displayName;
        await existingStudent.save();
        console.log(`✅ Updated student with Google info`);
      }

      existingStudent.userType = 'student';
      console.log(`🎯 Returning student user`);
      return done(null, existingStudent);
    }

    // Get the intended user type from session (set during OAuth initiation)
    const intendedUserType = req.session?.intendedUserType || 'student';
    console.log(`🎯 Intended user type from session: ${intendedUserType}`);

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

    console.log(`📧 Email suggests examiner: ${emailSuggestsExaminer}`);
    console.log(`🎯 Final decision - should be examiner: ${shouldBeExaminer}`);

    if (shouldBeExaminer) {
      // Create new examiner
      console.log(`🆕 Creating new examiner for Google user: ${email}`);

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
      console.log(`✅ Successfully created new examiner: ${savedExaminer._id}`);

      savedExaminer.userType = 'examiner';
      console.log(`🎯 Returning new examiner user`);
      return done(null, savedExaminer);
    } else {
      // Create new student (default for Google sign-up)
      console.log(`🆕 Creating new student for Google user: ${email}`);

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
      console.log(`✅ Successfully created new student: ${savedStudent._id}`);

      savedStudent.userType = 'student';
      console.log(`🎯 Returning new student user`);
      return done(null, savedStudent);
    }

  } catch (error) {
    console.error('❌ Google Auth Error:', error);
    console.error('Error details:', error.message);
    return done(error, null);
  }
}));

console.log('✅ Passport Google Strategy configured');

export default passport;
