import Student from "./../Models/Student.js";
import { quizSchema } from "./../Models/Student.js";
import mongoose from "mongoose";

export const addStudent = async (req, res) => {
  try {
    const email = req.body.email;
    const user = await Student.findOne({ email: email });
    if (user) {
      return res
        .status(201)
        .json({ message: "User with this email already exist" });
    }
    const newUser = new Student(req.body);
    let output = await newUser.save();
    return res.status(200).json({ message: output });
  } catch (error) {
    return res.status(500).json({ message: "Could not fetch data" });
  }
};

export const getStudent = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await Student.findOne({ email: email });

    if (!user) {
      return res
        .status(203)
        .json({ message: "User with this email does not exist" });
    }

    // For Google users, password might be 'google-auth' or they might have googleId
    const isGoogleUser = user.googleId || password === 'google-auth';
    const isValidPassword = password === user.password;

    if (isValidPassword || isGoogleUser) {
      return res.status(200).json({ ...user });
    } else {
      return res.status(201).json({ message: "Wrong Password" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Could not fetch data" });
  }
};

export const updateScore = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { email, code, totalMarks, score, date, examiner, topic } = req.body;
    const quiz = {
      code: code,
      totalMarks: totalMarks,
      score: score,
      time: date,
      examiner: examiner,
      topic: topic,
    };

    const user = await Student.findOne({ email: email }).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "User not found" });
    }

    const quizExists = user.quizzesAttended.some(
      (attendedQuiz) => attendedQuiz.code === quiz.code
    );

    if (quizExists) {
      await session.abortTransaction();
      session.endSession();
      return res.status(201).json({ message: "Quiz score already updated" });
    }

    user.quizzesAttended.push(quiz);
    await user.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({ message: "Quiz score updated successfully" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ message: "Could not fetch data" });
  }
};
