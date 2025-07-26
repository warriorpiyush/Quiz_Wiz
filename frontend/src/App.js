import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Homepage from "./Components/Homepage/Main";
import Examiner from "./Components/Examiner/Dashboard/Main";
import Candidate from "./Components/Candidate/Dashboard/Main";
import AuthenticationCandidate from "./Components/Authentication/CandidateAuth";
import AuthenticationExaminer from "./Components/Authentication/ExaminerAuth";
import NotFoundPage from "./Components/Homepage/NotFoundPage";
import Quiz from "./Components/Candidate/Quiz/Main";
import JoinQuizPage from "./Components/Homepage/JoinQuiz/JoinQuizPage";
import AboutPage from "./Components/Homepage/AboutPage"; // Import AboutPage
import ContactPage from "./Components/Homepage/ContactPage"; // Import ContactPage
import { AuthProvider } from "./Context/AuthContext";
import AuthTest from "./Components/Common/AuthTest";
import AdminPanel from "./Components/Common/AdminPanel";
import SessionDebug from "./Components/Common/SessionDebug";
import ExaminerSignupTest from "./Components/Common/ExaminerSignupTest";
import UserDataInspector from "./Components/Common/UserDataInspector";
import GoogleIndicatorTest from "./Components/Common/GoogleIndicatorTest";
function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Router>
          <Routes>
            <Route path="/*" element={<NotFoundPage />} />
            <Route path="/" element={<Homepage />} />
            <Route path="/auth" element={<Homepage />} />
            <Route path="/auth/candidate" element={<AuthenticationCandidate />} />
            <Route path="/auth/examiner" element={<AuthenticationExaminer />} />
            <Route path="/candidate/dashboard" element={<Candidate />} />
            <Route path="/candidate/quiz/:id" element={<Quiz />} />
            <Route path="/examiner/dashboard" element={<Examiner />} />
            <Route path="/join" element={<JoinQuizPage></JoinQuizPage>}></Route>
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/auth-test" element={<AuthTest />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/session-debug" element={<SessionDebug />} />
            <Route path="/examiner-test" element={<ExaminerSignupTest />} />
            <Route path="/user-debug" element={<UserDataInspector />} />
            <Route path="/google-test" element={<GoogleIndicatorTest />} />
          </Routes>
        </Router>
      </div>
    </AuthProvider>
  );
}

export default App;
