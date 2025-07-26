import React, { useEffect, useState } from "react";
import { useAppContext } from "../../../LocalStorage";
import { useAuth } from "../../../Context/AuthContext";
import { getCandidate } from "../../../API/Candidate";
import { LineChart } from "@mui/x-charts";
import { sampleUsers } from "./dummyData";

// Fallback data in case import fails
const fallbackData = {
  quizzesAttended: [
    { code: 101, score: 85, totalMarks: 100, date: "2024-01-15", topic: "Data Structures", examiner: "Sample Examiner" },
    { code: 102, score: 92, totalMarks: 100, date: "2024-02-20", topic: "Algorithms", examiner: "Sample Examiner" }
  ]
};

function Statistics() {
  const [candidateData, setCandidateData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user: localUser } = useAppContext();
  const { user: googleUser } = useAuth();
  const [quizCodeArray, setQuizCodeArray] = useState([]);
  const [quizObtainedArray, setQuizObtainedArray] = useState([]);

  // Use Google user if available, otherwise use local user
  const user = googleUser || localUser;

  // Safety check to ensure arrays are always arrays
  const safeQuizCodeArray = Array.isArray(quizCodeArray) ? quizCodeArray : [];
  const safeQuizObtainedArray = Array.isArray(quizObtainedArray) ? quizObtainedArray : [];

  useEffect(() => {
    const fetchCandidateData = async () => {
      if (!user?.email) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await getCandidate({
          email: user.email,
          password: user.password || 'google-auth', // For Google users who don't have password
        });

        if (response?.data) {
          // Handle both direct data and _doc structure
          const userData = response.data._doc || response.data;

          // Ensure userData exists and has the expected structure
          if (userData && typeof userData === 'object') {
            setCandidateData(userData);

            // Process quiz data for chart with proper null checks
            const quizzes = Array.isArray(userData.quizzesAttended) ? userData.quizzesAttended : [];

            const codes = quizzes.map(quiz => quiz?.code || 'Unknown');
            const percentages = quizzes.map(quiz => {
              const score = quiz?.score || 0;
              const totalMarks = quiz?.totalMarks || 1;
              return totalMarks > 0 ? (score / totalMarks) * 100 : 0;
            });

            setQuizCodeArray(codes);
            setQuizObtainedArray(percentages);
          } else {
            // If userData is not valid, use sample data
            const safeSampleData = sampleUsers && sampleUsers.quizzesAttended ? sampleUsers : fallbackData;
            setCandidateData(safeSampleData);

            const codes = safeSampleData.quizzesAttended.map(quiz => quiz?.code || 'Unknown');
            const percentages = safeSampleData.quizzesAttended.map(quiz => {
              const score = quiz?.score || 0;
              const totalMarks = quiz?.totalMarks || 1;
                return totalMarks > 0 ? (score / totalMarks) * 100 : 0;
              });

              setQuizCodeArray(codes);
              setQuizObtainedArray(percentages);
            }
          } else {
            // No data received, use sample data
            const safeSampleData = sampleUsers && sampleUsers.quizzesAttended ? sampleUsers : fallbackData;
            setCandidateData(safeSampleData);

            const codes = safeSampleData.quizzesAttended.map(quiz => quiz?.code || 'Unknown');
            const percentages = safeSampleData.quizzesAttended.map(quiz => {
              const score = quiz?.score || 0;
              const totalMarks = quiz?.totalMarks || 1;
              return totalMarks > 0 ? (score / totalMarks) * 100 : 0;
            });

            setQuizCodeArray(codes);
            setQuizObtainedArray(percentages);
          }
      } catch (err) {
        setError('Failed to load your quiz history. Please try refreshing the page.');

        // Fallback to sample data for testing
        const safeSampleData = sampleUsers && sampleUsers.quizzesAttended ? sampleUsers : fallbackData;
        setCandidateData(safeSampleData);

        const codes = safeSampleData.quizzesAttended.map(quiz => quiz?.code || 'Unknown');
        const percentages = safeSampleData.quizzesAttended.map(quiz => {
          const score = quiz?.score || 0;
          const totalMarks = quiz?.totalMarks || 1;
          return totalMarks > 0 ? (score / totalMarks) * 100 : 0;
        });

        setQuizCodeArray(codes);
        setQuizObtainedArray(percentages);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidateData();
  }, [user?.email, user?.password]);

  if (loading) {
    return (
      <div className="w-full h-max items-center justify-center flex flex-col mt-60 bg-blue-50 p-10 rounded-xl text-blue-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <h2 className="font-semibold text-2xl mt-4">Loading...</h2>
        <p className="mt-2">Fetching your quiz history</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="w-full h-max items-center justify-center flex flex-col mt-60 bg-red-50 p-10 rounded-xl text-red-800">
        <h2 className="font-semibold text-4xl">⚠️ Error</h2>
        <p className="mt-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  // Ensure candidateData exists and has the expected structure
  const quizzesAttended = (candidateData && Array.isArray(candidateData.quizzesAttended))
    ? candidateData.quizzesAttended
    : [];

  return (
    <div>
      <div className="w-full p-4 mt-4">
        {quizzesAttended.length > 0 ? (
          <div>
            <h1 className="text-xl mb-2 ml-2 font-bold">Your Quiz History -</h1>

            {/* Quiz History List */}
            <div className="bg-slate-100 p-4 rounded-xl shadow-inner mb-6">
              <div className="grid gap-3">
                {quizzesAttended.map((quiz, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-blue-950">{quiz.topic || 'Quiz'}</h3>
                      <p className="text-sm text-gray-600">Code: {quiz.code} | Examiner: {quiz.examiner || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">
                        {quiz.time ? new Date(quiz.time).toLocaleDateString() :
                         quiz.date ? new Date(quiz.date).toLocaleDateString() : 'Unknown date'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-purple-950">
                        {quiz.score || 0}/{quiz.totalMarks || 0}
                      </p>
                      <p className="text-sm text-gray-600">
                        {quiz.totalMarks > 0 ? ((quiz.score / quiz.totalMarks) * 100).toFixed(1) : 0}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <h1 className="text-xl mb-2 ml-2 font-bold">Performance Chart -</h1>
            <div className="bg-slate-100 mt-4 rounded-xl shadow-inner flex items-center justify-center">
              {safeQuizCodeArray.length > 0 && safeQuizObtainedArray.length > 0 ? (
                <LineChart
                  xAxis={[
                    {
                      label: "Quiz Code",
                      data: safeQuizCodeArray,
                      scaleType: "band",
                    },
                  ]}
                  yAxis={[
                    {
                      label: "Marks Percentage",
                    },
                  ]}
                  series={[
                    {
                      label: "Your Performance",
                      data: safeQuizObtainedArray,
                      color: "#965fe3",
                    },
                  ]}
                  width={600}
                  height={300}
                  title="Your Quiz Performance"
                />
              ) : (
                <p className="text-gray-600 p-8">No data available for chart</p>
              )}
            </div>
          </div>
        ) : (
          <div className="w-full h-max items-center justify-center flex flex-col mt-60 bg-blue-50 p-10 rounded-xl text-blue-950">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="font-semibold text-4xl">No Quiz History</h2>
            <p className="mt-4 text-center max-w-md">
              You haven't attempted any quizzes yet. Join a quiz using a quiz code to see your performance statistics here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Statistics;
