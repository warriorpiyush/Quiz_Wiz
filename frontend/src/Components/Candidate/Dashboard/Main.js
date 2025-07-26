import React, { useEffect, useState } from "react";
import { useAppContext } from "../../../LocalStorage";
import { useAuth } from "../../../Context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import JoinQuiz from "./JoinQuiz";
import Statistics from "./Statistics";
import InsightsSharpIcon from "@mui/icons-material/InsightsSharp";
import ErrorBoundary from "../../Common/ErrorBoundary";
import LogoutButton from "../../Common/LogoutButton";

function Main() {
  const { user: localUser } = useAppContext();
  const { user: googleUser, isAuthenticated, loading } = useAuth();
  const [joinQuiz, setJoinQuiz] = useState(true);
  const navigate = useNavigate();

  // Determine which user data to use (Google auth takes precedence)
  const user = googleUser || localUser;

  useEffect(() => {
    if (loading) {
      // Still checking authentication status
      return;
    }

    if (!user && !isAuthenticated) {
      navigate("/auth/candidate");
    } else if (user?.userType === 'examiner' || user?.type === 1) {
      navigate("/examiner/dashboard");
    }
  }, [user, localUser, googleUser, isAuthenticated, loading, navigate]);

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-row w-full h-screen">
      <nav className="bg-purple-200 w-1/5 border-r-2 text-blue-950 border-purple-300 justify-between flex flex-col">
        <Link to="/">
          <div className="text-2xl md:text-4xl font-bold tracking-wide mb-4 md:mb-0 cursor-pointer w-full text-center mt-14">
            <span className="text-purple-800">Quiz</span>Wiz
          </div>
        </Link>
        <div className="flex flex-col justify-center items-center mt-10 ">
          <img
            alt="User avatar"
            src={
              user?.profilePicture ||
              (user?.photo === "default" ? "https://avatar.iran.liara.run/public" : user?.photo) ||
              "https://avatar.iran.liara.run/public"
            }
            className="rounded-full border-4 p-2 border-purple-400 w-40 h-40 object-cover"
            onError={(e) => {
              console.error('Profile image failed to load:', e.target.src);
              e.target.src = "https://avatar.iran.liara.run/public";
            }}
            onLoad={() => {
              console.log('Profile image loaded successfully:', user?.profilePicture || user?.photo);
            }}
          />
          <h2 className="font-rubik font-semibold m-2 mt-6 ">
            {user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User'}
          </h2>
          <h3 className="font-serif text-sm m-2 ">{user?.email}</h3>
          <h3 className="font-playfair font-bold text-sm m-2 ">
            {user?.college || 'Candidate'}
          </h3>
        </div>
        {joinQuiz ? (
          <button
            onClick={() => setJoinQuiz(!joinQuiz)}
            className="bg-blue-900 p-3 m-4 rounded-md text-white font-rubik flex justify-center items-center hover:text-blue-950 hover:bg-white hover:border-2 hover:border-blue-900 transition-colors duration-300"
          >
            <EditNoteOutlinedIcon />
            <h1 className="ml-2">Join a Quiz</h1>
          </button>
        ) : (
          <button
            onClick={() => setJoinQuiz(!joinQuiz)}
            className="bg-blue-900 p-3 m-4 rounded-md text-white font-rubik flex justify-center items-center hover:text-blue-950 hover:bg-white hover:border-2 hover:border-blue-900 transition-colors duration-300"
          >
            <InsightsSharpIcon></InsightsSharpIcon>
            <h1 className="ml-2">View Statistics</h1>
          </button>
        )}

        <LogoutButton className="mb-6" />
      </nav>
      <div className=" w-4/5 overflow-y-scroll overflow-x-hidden">
        {joinQuiz ? (
          <ErrorBoundary>
            <Statistics />
          </ErrorBoundary>
        ) : (
          <JoinQuiz />
        )}
      </div>
    </div>
  );
}

export default Main;
