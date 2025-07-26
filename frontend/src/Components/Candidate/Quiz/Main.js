import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { QuizDetails } from "../../../API/Quiz";
import INVALID_CODE from "./../../../Assets/Bad idea-rafiki.svg";
import QuizBoard from "./QuizBoard";
import { useAppContext } from "../../../LocalStorage";
import { useAuth } from "../../../Context/AuthContext";

function FullScreenApp() {
  const { user: localUser } = useAppContext();
  const { user: googleUser, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  // Use Google user if available, otherwise use local user
  const user = googleUser || localUser;
  const [isFullScreen, setIsFullScreen] = useState(true);
  const [isValidCode, setIsValidCode] = useState(false);
  const [quiz, setQuiz] = useState();
  const location = useLocation();
  const code = location.pathname.split("/")[3];
  const enterFullScreen = () => {
    const elem = document.documentElement;
    const request =
      elem.requestFullscreen ||
      elem.mozRequestFullScreen ||
      elem.webkitRequestFullscreen ||
      elem.msRequestFullscreen;

    if (request) {
      request
        .call(elem)
        .then(() => setIsFullScreen(true))
        .catch((err) => console.error("Error enabling fullscreen:", err));
    }
  };

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
  }, []);

  useEffect(() => {
    const getQuizDetails = async () => {
      let res = await QuizDetails({ Code: code });
      if (res?.status === 200) {
        setQuiz(res.data);
        setIsValidCode(true);
      }
    };
    getQuizDetails();
  }, [code]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-blue-950">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-lg">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!user && !isAuthenticated) {
    navigate("/auth/candidate");
    return null;
  }

  return (
    <div className="h-screen">
      {isFullScreen ? (
        <div>
          {isValidCode ? (
            <div className="h-screen bg-blue-950 overflow-hidden">
              <QuizBoard quiz={quiz}></QuizBoard>
            </div>
          ) : (
            <div className="w-full h-screen flex justify-center items-center flex-col bg-blue-50">
              <img src={INVALID_CODE} className="w-1/3" alt="Invalid Code" />
              <h1 className="text-4xl text-purple-950 font-bold">
                Contest with this code does not exist.
              </h1>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full h-screen flex items-center justify-center bg-blue-50">
          <div className="bg-white w-1/2 p-20 pb-10 flex flex-col items-center justify-center shadow-lg rounded-lg border-4">
            <h1 className="text-xl text-center font-semibold text-blue-950">
              To maintain the integrity of the quiz and prevent cheating, please
              enter full-screen mode by clicking the button below. This will
              ensure a focused environment without distractions.
            </h1>
            <button
              onClick={enterFullScreen}
              className="bg-blue-900 hover:bg-blue-950 duration-300 border-blue-200 border-4 rounded-lg text-white p-3 w-40 font-rubik font-semibold m-10"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default FullScreenApp;
