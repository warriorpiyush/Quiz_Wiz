import Examiner from "./../Models/Examiner.js";
import { JSDOM } from "jsdom";
import axios from "axios";
import { YoutubeTranscript } from 'youtube-transcript';

export const addExaminer = async (req, res) => {
  try {
    const email = req.body.email;
    const user = await Examiner.findOne({ email: email });
    if (user) {
      return res
        .status(201)
        .json({ message: "User with this email already exist" });
    }
    const newUser = new Examiner(req.body);
    let output = await newUser.save();
    return res.status(200).json({ message: output });
  } catch (error) {
    return res.status(500).json({ message: "Could not fetch data" });
  }
};

export const getExaminer = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`📊 Fetching examiner data for email: ${email}`);

    if (!email) {
      console.log('❌ No email provided in request');
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await Examiner.findOne({ email: email });

    if (!user) {
      console.log(`❌ Examiner not found with email: ${email}`);
      return res
        .status(203)
        .json({ message: "User with this email does not exist" });
    }

    console.log(`📊 Found examiner: ${user.email}, GoogleId: ${user.googleId ? 'Yes' : 'No'}`);

    // For Google users, password might be 'google-auth' or they might have googleId
    const isGoogleUser = user.googleId || password === 'google-auth';
    const isValidPassword = password === user.password;

    if (isValidPassword || isGoogleUser) {
      console.log(`✅ Authentication successful for ${email} (Google: ${isGoogleUser})`);
      return res.status(200).json({ ...user });
    } else {
      console.log(`❌ Authentication failed for ${email}`);
      return res.status(201).json({ message: "Wrong Password" });
    }
  } catch (error) {
    console.error('❌ Error in getExaminer:', error);
    return res.status(500).json({ message: "Could not fetch data" });
  }
};

export const getTextFromUrl = async (req, res) => {
  try {
    const { url } = req.body;
    const response = await axios.get(url);
    const html = response.data;
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const textContent = [];

    const extractTextNodes = (node) => {
      if (node.nodeType === 3) {
        textContent.push(node.nodeValue.trim());
      }

      if (node.childNodes) {
        node.childNodes.forEach((child) => extractTextNodes(child));
      }
    };

    extractTextNodes(document.body);
    const mergedText = textContent.join(" ");
    res.status(200).json({ mergedText });
  } catch (error) {
    console.error("Error fetching or processing data:", error);
    return res.status(500).json({ message: "Could not fetch data" });
  }
};

export const getYouTubeTranscript = async (req, res) => {
  try {
    const { videoId } = req.body;

    if (!videoId) {
      return res.status(400).json({ message: "Video ID is required" });
    }

    console.log(`Fetching transcript for video ID: ${videoId}`);

    // Fetch transcript using youtube-transcript library
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);

    if (!transcript || transcript.length === 0) {
      return res.status(404).json({
        message: "No transcript available for this video. Please try a video with captions enabled."
      });
    }

    // Combine all transcript text
    const fullText = transcript.map(item => item.text).join(' ');

    if (fullText.length < 100) {
      return res.status(404).json({
        message: "Transcript is too short to generate meaningful questions. Please try a longer video."
      });
    }

    console.log(`Successfully extracted transcript: ${fullText.length} characters`);

    res.status(200).json({
      transcript: fullText,
      videoId: videoId,
      transcriptLength: fullText.length
    });
  } catch (error) {
    console.error("Error fetching YouTube transcript:", error);

    // Handle specific YouTube transcript errors
    if (error.name === 'YoutubeTranscriptDisabledError' || error.message.includes('Transcript is disabled')) {
      return res.status(404).json({
        message: "This video doesn't have captions/subtitles enabled. Please try a different video.",
        suggestions: [
          "Educational channels (Khan Academy, Crash Course, TED-Ed)",
          "TED Talks",
          "University lectures",
          "Popular channels that enable auto-captions"
        ]
      });
    }

    if (error.name === 'YoutubeTranscriptNotAvailableError' || error.message.includes('Video unavailable')) {
      return res.status(404).json({
        message: "Video is unavailable, private, or doesn't exist. Please check the URL and try again."
      });
    }

    if (error.message.includes('Could not retrieve a transcript')) {
      return res.status(404).json({
        message: "No transcript available for this video. The video may not have captions in any supported language."
      });
    }

    return res.status(500).json({
      message: "Could not fetch transcript. Please ensure the video has captions enabled and is publicly available.",
      error: error.message
    });
  }
};
