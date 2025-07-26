import React, { useState } from "react";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import YOUTUBE_SVG from "./../../../../Assets/icons/youtube-svgrepo-com (1).svg";
import { YouTube } from "@mui/icons-material";
import { generateQuestions, getYouTubeTranscript } from "./../../../../API/Examiner";
import { useAppContext } from "../../../../LocalStorage";
import { CircularProgress } from "@mui/material";

function Youtube({ setMethod }) {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const { setQuestions } = useAppContext();

  // Function to extract video ID from YouTube URL
  const extractVideoId = (url) => {
    const regex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // Function to fetch YouTube transcript using our backend API
  const fetchYouTubeTranscript = async (videoId) => {
    try {
      const response = await getYouTubeTranscript({ videoId });

      if (response.status === 200 && response.data.transcript) {
        return response.data.transcript;
      } else {
        throw new Error(response.data?.message || "Failed to fetch transcript");
      }
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error(error.response.data?.message || "Transcript not available for this video");
      } else if (error.response?.status === 500) {
        throw new Error(error.response.data?.message || "Server error while fetching transcript");
      } else {
        throw new Error("Could not fetch video transcript. Please ensure the video has captions enabled and is publicly available.");
      }
    }
  };

  const handleSubmit = async () => {
    if (!youtubeUrl.trim()) {
      setError("Please enter a YouTube URL.");
      return;
    }

    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) {
      setError("Please enter a valid YouTube URL.");
      return;
    }

    setLoading(true);
    setError("");
    setSuggestions([]);

    try {
      // Step 1: Fetch the actual transcript from the video
      let transcriptText;

      try {
        transcriptText = await fetchYouTubeTranscript(videoId);
        console.log(`Successfully fetched transcript: ${transcriptText.length} characters`);
      } catch (transcriptError) {
        // Check if the error response contains suggestions
        if (transcriptError.response?.data?.suggestions) {
          setSuggestions(transcriptError.response.data.suggestions);
        }
        setError(transcriptError.message);
        setLoading(false);
        return;
      }

      // Step 2: Generate questions using AI from the actual transcript
      const response = await generateQuestions({
        num_questions: "5",
        text: transcriptText,
        prompt: "Generate quiz questions based on this YouTube video transcript:",
      });

      if (response.status === 200) {
        setQuestions(response.data);
        setMethod(7); // Go to preview
      } else {
        setError("Failed to generate questions. Please try again.");
      }
    } catch (error) {
      setError("An error occurred while processing the video. Please try again or use the 'Text' method to input key points manually.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="bg-gray-100 flex flex-col min-h-screen">
      <button
        className="text-purple-950 w-20 h-10 rounded-md transition-colors mt-10 ml-10 flex justify-center items-center opacity-70 hover:opacity-100"
        onClick={() => setMethod(0)}
      >
        <ArrowBackOutlinedIcon />
        <h1 className="ml-1 font-rubik font-bold">Back</h1>
      </button>
      <div className="flex flex-col justify-center items-center p-8">
        <h1 className="text-3xl font-rubik font-bold mb-4 flex  border-b-4  w-2/3 items-center justify-center border-purple-300 rounded">
          <span>Create Quizzes from</span>
          <img src={YOUTUBE_SVG} alt="YouTube Logo" className="w-20 p-3" />
          <span>Videos</span>
        </h1>
        <h2 className="font-roboto font-semibold text-blue-950 text-center mb-6 w-2/3 p-8">
          Transform any YouTube video into an engaging quiz! Simply paste the
          video link below, and our system will extract the video's transcript
          and generate intelligent questions based on the actual content. Perfect
          for educational videos, lectures, tutorials, and any content with captions.
          Note: The video must have captions/subtitles enabled for this to work.
        </h2>
        <div className="bg-white shadow-md rounded-lg p-6 w-1/2 flex items-center">
          <div className="w-full">
            <label
              htmlFor="youtube-search"
              className="mb-2 text-sm font-medium text-slate-100 sr-only dark:text-white"
            >
              Generate
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                <YouTube style={{ color: "grey" }}></YouTube>
              </div>
              <input
                className="block w-full p-4 ps-12 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                placeholder="Enter the YouTube video link (e.g., https://www.youtube.com/watch?v=...)"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                required
              />
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="text-white absolute end-2 bottom-2 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-3 bg-blue-900 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <CircularProgress size={16} color="inherit" className="mr-2" />
                    Processing...
                  </>
                ) : (
                  "Generate"
                )}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg w-1/2">
            <p className="font-medium">Error:</p>
            <p>{error}</p>
            {suggestions.length > 0 && (
              <div className="mt-3">
                <p className="font-medium">Try videos from these sources:</p>
                <ul className="list-disc list-inside mt-2 ml-4">
                  {suggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm">{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 w-2/3 p-6">
          <h3 className="text-lg font-semibold text-blue-950 mb-4">How it works:</h3>
          <ul className="list-disc list-inside mb-6">
            {[
              "Paste the YouTube video link (video must have captions/subtitles).",
              "System extracts the video transcript automatically.",
              "AI generates intelligent questions based on the actual video content.",
              "Review and customize your quiz before sharing with others!",
            ].map((step, index) => (
            <li
              key={index}
              className="mb-4 flex items-center p-2 bg-blue-50 rounded-md transition-transform transform hover:scale-105 cursor-pointer"
            >
              <span className="text-blue-600 mr-2">✔️</span>
              <span>{`Step ${index + 1}: ${step}`}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-950 mb-2">💡 Tip: Try these types of videos</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Educational channels (Khan Academy, Crash Course, TED-Ed)</li>
            <li>• TED Talks and conference presentations</li>
            <li>• University lectures and online courses</li>
            <li>• Tutorial videos with clear narration</li>
            <li>• Documentary content with narration</li>
          </ul>
        </div>
      </div>
      </div>
    </div>
  );
}

export default Youtube;
