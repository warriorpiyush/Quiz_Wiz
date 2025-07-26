import { Router } from "express";
import {
  addStudent,
  getStudent,
  updateScore,
} from "./../Controllers/Student.js";
import {
  addExaminer,
  getExaminer,
  getTextFromUrl,
  getYouTubeTranscript,
} from "./../Controllers/Examiner.js";
import {
  getQuiz,
  generateQuiz,
  updateQuiz,
  getQuizes,
} from "../Controllers/Quiz.js";
import {
  generateQuestions,
} from "../Controllers/AI.js";
const route = Router();

{
  /*  Student  */
}
route.post("/addStudent", addStudent);
route.post("/getStudent", getStudent);
route.post("/updateScore", updateScore);

{
  /*  Examiner  */
}
route.post("/addExaminer", addExaminer);
route.post("/getExaminer", getExaminer);
route.post("/getTextFromUrl", getTextFromUrl);
route.post("/getYouTubeTranscript", getYouTubeTranscript);

{
  /*  Quiz  */
}
route.post("/getQuiz", getQuiz);
route.post("/getQuizes", getQuizes);
route.post("/generateQuiz", generateQuiz);
route.post("/updateQuiz", updateQuiz);

{
  /*  AI  */
}
route.post("/generateQuestions", generateQuestions);

export default route;
