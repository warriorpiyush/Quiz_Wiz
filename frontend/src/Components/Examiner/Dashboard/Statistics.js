import React, { useEffect, useState } from "react";
import Slider from "./StatsComponent/Slider";
import { useAppContext } from "../../../LocalStorage";
import { useAuth } from "../../../Context/AuthContext";
import { getQuizes } from "./../../../API/Quiz";
import { LineChart } from "@mui/x-charts";

function Statistics() {
  const [quizes, setQuizes] = useState([]);
  const { user: localUser } = useAppContext();
  const { user: googleUser } = useAuth();
  const [avgScore, setAvgScore] = useState([]);
  const [quizCode, setQuizCode] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use Google user if available, otherwise use local user
  const user = googleUser || localUser;

  useEffect(() => {
    const calculateAvgScore = () => {
      const avgScores = [];
      const quizCodes = [];

      quizes?.forEach((quiz) => {
        quizCodes.push(quiz.code);
        let totalScore = 0;
        let totalParticipants = 0;

        quiz.attemptedBy.forEach((attempt) => {
          totalScore += attempt.correctAnswers;
          totalParticipants++;
        });

        const totalQuestions = quiz.questions.length;
        const avgPercentage =
          totalParticipants > 0
            ? (totalScore / (totalQuestions * totalParticipants)) * 100
            : 0;
        avgScores.push(avgPercentage);
      });

      setQuizCode(quizCodes);
      setAvgScore(avgScores);
    };

    if (quizes?.length > 0) {
      calculateAvgScore();
    }
  }, [quizes]);
  useEffect(() => {
    const getAllQuizes = async () => {
      if (!user?.email) {
        console.log('⚠️ No user email found, skipping quiz fetch');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log('📊 Fetching quizzes for user:', user.email);

        const res = await getQuizes({
          email: user.email,
          password: user.password || 'google-auth', // For Google users who don't have password
        });

        console.log('📊 Quiz fetch response:', res);

        if (res && res.data) {
          setQuizes(res.data);
          console.log(`✅ Found ${res.data.length} quizzes`);
        } else {
          console.log('⚠️ No quiz data in response');
          setQuizes([]);
        }
      } catch (err) {
        console.error('❌ Error fetching quizzes:', err);
        setError('Failed to load quizzes. Please try refreshing the page.');
        setQuizes([]);
      } finally {
        setLoading(false);
      }
    };

    getAllQuizes();
  }, [user?.email, user?.password]);
  // Show loading state
  if (loading) {
    return (
      <div className="w-full p-4 mt-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your quizzes...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="w-full p-4 mt-4">
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
      </div>
    );
  }

  return (
    <div>
      <div className="w-full  p-4 mt-4 ">
        {quizes.length !== 0 ? (
          <div>
            <h1 className="text-xl mb-2 ml-2 font-bold ">Your Quizes -</h1>
            <Slider slides={quizes}></Slider>
            <h1 className="text-xl mb-2 ml-2 font-bold mt-10">
              Performance Chart -
            </h1>
            <div className="bg-slate-100 mt-4 rounded-xl shadow-inner  flex items-center justify-center">
            <LineChart
                xAxis={[
                  {
                    label: "Quiz Code",
                    data: quizCode,
                    scaleType: "band",
                  },
                ]}
                yAxis={[
                  {
                    label: "Marks",
                  },
                ]}
                series={[
                  {
                    label: "Average Score",
                    data: avgScore,
                    color: "#965fe3",
                  },
                ]}
                width={1100}
                height={400}
                title="Quiz"
              />
            </div>
          </div>
        ) : (
          <div className="w-full h-max items-center justify-center flex flex-col mt-60 bg-blue-50 p-10 rounded-xl text-blue-950">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="font-semibold text-4xl">No Quizzes Yet</h2>
            <p className="mt-4 text-center max-w-md">
              You haven't created any quizzes yet. Start by creating your first quiz to see statistics and performance data here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Statistics;
