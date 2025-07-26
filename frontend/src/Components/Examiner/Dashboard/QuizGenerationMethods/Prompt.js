import React, { useState } from "react";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import { generateQuestions } from "./../../../../API/Examiner";
import { useAppContext } from "../../../../LocalStorage";
import { CircularProgress } from "@mui/material";

function PromptQuiz({ setMethod }) {
  const { setQuestions } = useAppContext();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (prompt.length < 10) {
      setError("Please provide a more detailed prompt (at least 10 characters).");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // For prompts, we create a base text and use the prompt as additional instruction
      const baseText = `Generate quiz questions about: ${prompt}. This is a general knowledge topic that should be covered comprehensively.`;

      const res = await generateQuestions({
        num_questions: "5",
        text: baseText,
        prompt: `Focus on creating questions about: ${prompt}`,
      });

      if (res && res.status === 200 && res.data) {
        setQuestions(res.data);
        setMethod(7);
      } else {
        setError("Failed to generate questions. Please try again.");
        setLoading(false);
      }
    } catch (error) {
      setError(`Failed to generate questions: ${error.message}`);
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
        <h1 className="text-3xl font-rubik font-bold pb-4 flex border-b-4 w-2/3 items-center justify-center border-purple-300 rounded">
          <span>Create Quizzes from Prompts</span>
        </h1>
        <h2 className="font-roboto font-semibold text-blue-950 text-center mb-6 w-2/3 p-8">
          Transform any prompt into an interactive quiz! Simply input your
          prompt below, and our system will help you create engaging questions
          based on the content. Perfect for educational purposes, training
          sessions, or creative exercises!
        </h2>
        <div className="bg-white shadow-md rounded-lg p-6 w-1/2 flex items-center">
          <div className="w-full">
            <label
              htmlFor="prompt-input"
              className="mb-2 text-sm font-medium text-slate-100 sr-only"
            >
              Enter Prompt
            </label>
            <div className="relative">
              <input
                id="prompt-input"
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="block w-full p-4 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                placeholder="Type the topic here (e.g., 'JavaScript programming', 'World War 2', 'Biology')..."
                disabled={loading}
                required
              />
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="text-white absolute right-2 bottom-2 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-3 bg-blue-900 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <CircularProgress size={16} color="inherit" className="mr-2" />
                    Generating...
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
          </div>
        )}

        <ul className="list-disc list-inside mt-6 w-2/3 p-6">
          {[
            "Type your prompt in the input field.",
            "Automatically generate questions based on the prompt.",
            "Customize your quiz by adding additional details or options.",
            "Share your quiz with others and track their results in real-time!",
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
      </div>
    </div>
  );
}

export default PromptQuiz;
