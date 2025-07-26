import axios from "axios";
import { API_CONFIG } from "../config/api";
const URL = API_CONFIG.BASE_URL;
export const addExaminer = async (data) => {
  try {
    let res = await axios.post(`${URL}/addExaminer`, data);
    return res;
  } catch (error) {
    // Handle error silently
  }
};

export const getExaminer = async (data) => {
  try {
    let res = await axios.post(`${URL}/getExaminer`, data);
    return res;
  } catch (error) {
    // Handle error silently
  }
};

export const getTextFromUrl = async (data) => {
  try {
    let res = await axios.post(`${URL}/getTextFromUrl`, data);
    return res;
  } catch (error) {
    return { status: -1, error: error.message };
  }
};

export const generateQuestions = async (data) => {
  try {
    let res = await axios.post(
      `${API_CONFIG.AI_SERVICE_URL}/generateQuestions`,
      data
    );

    return res;
  } catch (error) {
    return { status: -1, error: error.message };
  }
};

export const getYouTubeTranscript = async (data) => {
  try {
    let res = await axios.post(`${URL}/getYouTubeTranscript`, data);
    return res;
  } catch (error) {
    return { status: -1, error: error.message, response: error.response };
  }
};
