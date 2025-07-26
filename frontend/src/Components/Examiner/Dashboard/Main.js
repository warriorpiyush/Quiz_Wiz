import React, { useEffect, useState } from "react";
import { useAppContext } from "../../../LocalStorage";
import { useAuth } from "../../../Context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import AddCircleOutlineSharpIcon from "@mui/icons-material/AddCircleOutlineSharp";
import InsightsSharpIcon from "@mui/icons-material/InsightsSharp";
import Statistics from "./Statistics";
import CreateQuiz from "./CreateQuiz";
import LogoutButton from "../../Common/LogoutButton";
function Main() {
  const { user: localUser } = useAppContext();
  const { user: googleUser, isAuthenticated, loading, checkAuthStatus } = useAuth();
  const navigate = useNavigate();
  const [showStatistics, setShowStatistics] = useState(true);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [error, setError] = useState(null);

  // Determine which user data to use (Google auth takes precedence)
  const user = googleUser || localUser;

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        setDashboardLoading(true);
        setError(null);

        // Wait for auth context to finish loading
        if (loading) {
          return;
        }

        // If no user found, try refreshing auth status once
        if (!user && !isAuthenticated) {
          console.log('🔄 No user found, refreshing auth status...');
          await checkAuthStatus();

          // Give a small delay for state to update
          setTimeout(() => {
            const currentUser = googleUser || localUser;
            if (!currentUser && !isAuthenticated) {
              console.log('🚪 Redirecting to examiner auth...');
              navigate("/auth/examiner");
            }
          }, 100);
          return;
        }

        // Check if user is actually a student (wrong dashboard)
        if (user?.userType === 'student' || user?.type === 0) {
          console.log('👨‍🎓 User is student, redirecting to candidate dashboard...');
          navigate("/candidate/dashboard");
          return;
        }

        // Check if user is examiner
        if (user?.userType === 'examiner' || user?.type === 1) {
          console.log('👨‍🏫 Examiner dashboard loaded successfully');
          setDashboardLoading(false);
          return;
        }

        // If we have a user but no clear type, assume examiner for now
        if (user) {
          console.log('⚠️ User type unclear, assuming examiner:', user);
          setDashboardLoading(false);
          return;
        }

      } catch (err) {
        console.error('❌ Dashboard initialization error:', err);
        setError('Failed to load dashboard. Please try refreshing the page.');
        setDashboardLoading(false);
      }
    };

    initializeDashboard();
  }, [user, localUser, googleUser, isAuthenticated, loading, navigate, checkAuthStatus]);
  // Show loading screen while checking authentication or initializing dashboard
  if (loading || dashboardLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">
            {loading ? 'Checking authentication...' : 'Loading your dashboard...'}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            {user ? `Welcome, ${user.name || user.email}` : 'Please wait...'}
          </p>
        </div>
      </div>
    );
  }

  // Show error screen if something went wrong
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Dashboard Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700"
            >
              Refresh Page
            </button>
            <button
              onClick={() => navigate("/auth/examiner")}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-row w-full h-screen">
      <nav className="bg-purple-200 w-1/5 border-r-2 text-blue-950 border-purple-300 justify-between flex flex-col">
        <Link to="/">
          <div className="text-3xl text-center flex justify-center items-center mt-10 md:text-4xl font-bold tracking-wide mb-4 md:mb-0 cursor-pointer">
            <span className="text-purple-500">Quiz</span>Wiz
          </div>
        </Link>
        <div className="flex flex-col justify-center items-center">
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
            {user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Examiner'}
          </h2>
          <h3 className="font-serif text-sm m-2 ">{user?.email}</h3>
          <h3 className="font-playfair font-bold text-sm m-2 ">
            {user?.college || 'Examiner'}
          </h3>
        </div>
        <button
          onClick={(e) => setShowStatistics(!showStatistics)}
          className="bg-blue-900 p-3 m-4 rounded-md text-white font-rubik flex justify-center items-center hover:text-blue-950 hover:bg-white hover:border-2 hover:border-blue-900 transition-colors duration-300"
        >
          {showStatistics ? (
            <div className="flex justify-center">
              <AddCircleOutlineSharpIcon></AddCircleOutlineSharpIcon>
              <h1 className="ml-2">Create new Quiz</h1>
            </div>
          ) : (
            <div className="flex justify-center">
              <InsightsSharpIcon></InsightsSharpIcon>
              <h1 className="ml-2">Show Statistics</h1>
            </div>
          )}
        </button>
        <LogoutButton className="mb-6" />
      </nav>
      <div className=" w-4/5 overflow-y-scroll overflow-x-hidden">
        {showStatistics ? <Statistics></Statistics> : <CreateQuiz></CreateQuiz>}
      </div>
    </div>
  );
}

export default Main;
