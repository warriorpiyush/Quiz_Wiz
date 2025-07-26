import express from 'express';
import Student from '../Models/Student.js';
import Examiner from '../Models/Examiner.js';

const router = express.Router();

// Promote a student to examiner
router.post('/promote-to-examiner', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find the student
    const student = await Student.findOne({ email: email });
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if examiner already exists
    const existingExaminer = await Examiner.findOne({ email: email });
    if (existingExaminer) {
      return res.status(400).json({ message: 'User is already an examiner' });
    }

    // Create new examiner from student data
    const newExaminer = new Examiner({
      googleId: student.googleId,
      firstName: student.firstName,
      lastName: student.lastName,
      name: student.name,
      email: student.email,
      profilePicture: student.profilePicture,
      password: student.password,
      college: student.college,
      type: 1, // Examiner type
    });

    // Save the new examiner
    await newExaminer.save();
    
    // Delete the student record
    await Student.deleteOne({ _id: student._id });

    res.json({
      message: 'User promoted to examiner successfully',
      examiner: {
        id: newExaminer._id,
        email: newExaminer.email,
        name: newExaminer.name
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Get all users (for admin interface)
router.get('/users', async (req, res) => {
  try {
    const students = await Student.find({}).select('email name firstName lastName googleId college');
    const examiners = await Examiner.find({}).select('email name firstName lastName googleId college');
    
    res.json({
      students: students.map(s => ({ ...s.toObject(), userType: 'student' })),
      examiners: examiners.map(e => ({ ...e.toObject(), userType: 'examiner' })),
      total: students.length + examiners.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
