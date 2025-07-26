import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: Number,
    default: 1,
    required: true,
  },
  photo: {
    type: String,
    default: "default",
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true, // Allows null values to be non-unique
  },
  profilePicture: {
    type: String,
    default: null,
  },
  name: {
    type: String,
    // Computed from firstName + lastName or Google displayName
  },
  college: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model("Examiner", userSchema);

export default User;
