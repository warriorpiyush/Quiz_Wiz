import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generateQuestions = async (req, res) => {
  try {
    const { text, num_questions = "5", prompt = "" } = req.body;
    
    // Generate questions from provided text
    
    if (!text || text.trim().length < 50) {
      return res.status(400).json({
        error: 'Text content is required and must be at least 50 characters long'
      });
    }

    const numQuestionsInt = parseInt(num_questions);
    if (numQuestionsInt < 1 || numQuestionsInt > 20) {
      return res.status(400).json({
        error: 'Number of questions must be between 1 and 20'
      });
    }

    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY not found in environment variables");
      return res.status(500).json({
        error: 'AI service not configured. Please add GEMINI_API_KEY to environment variables.'
      });
    }

    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Create the prompt for question generation
    const aiPrompt = `
Based on the following text, generate exactly ${numQuestionsInt} multiple-choice questions. 
Each question should have 4 options and indicate which option is correct.

Format your response as a JSON array with this exact structure:
[
  {
    "question": "Your question here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctOption": "Option A"
  }
]

Make sure:
1. Questions are relevant to the content
2. Options are plausible but only one is clearly correct
3. Questions test understanding, not just memorization
4. Return valid JSON only, no additional text

Text content:
${text.substring(0, 8000)}

${prompt ? `Additional instructions: ${prompt}` : ''}
`;

    // Generate content using Gemini
    const result = await model.generateContent(aiPrompt);
    const response = await result.response;
    const generatedText = response.text();

    // Parse the JSON response
    let questions;
    try {
      // Clean the response - remove any markdown formatting
      const cleanedResponse = generatedText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      questions = JSON.parse(cleanedResponse);
      
      // Validate the response structure
      if (!Array.isArray(questions)) {
        throw new Error("Response is not an array");
      }
      
      // Validate each question
      questions = questions.map((q, index) => {
        if (!q.question || !Array.isArray(q.options) || !q.correctOption) {
          throw new Error(`Invalid question structure at index ${index}`);
        }
        
        if (q.options.length !== 4) {
          throw new Error(`Question ${index + 1} must have exactly 4 options`);
        }
        
        if (!q.options.includes(q.correctOption)) {
          throw new Error(`Correct option not found in options for question ${index + 1}`);
        }
        
        return {
          question: q.question.trim(),
          options: q.options.map(opt => opt.trim()),
          correctOption: q.correctOption.trim()
        };
      });
      
      // Ensure we have the right number of questions
      questions = questions.slice(0, numQuestionsInt);
      
    } catch (parseError) {
      console.error("Error parsing Gemini response:", parseError);

      // Fallback to generated questions if parsing fails
      questions = generateFallbackQuestions(text, numQuestionsInt);
    }
    
    res.json(questions);
    
  } catch (error) {
    console.error('Error generating quiz with Gemini:', error);
    
    // Provide fallback questions if AI fails
    const { text, num_questions = "5" } = req.body;
    const numQuestionsInt = parseInt(num_questions);
    const fallbackQuestions = generateFallbackQuestions(text, numQuestionsInt);

    res.json(fallbackQuestions);
  }
};

// Fallback question generation function
const generateFallbackQuestions = (text, numQuestions) => {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
  const questions = [];
  
  // Extract key information
  const words = text.toLowerCase().split(/\s+/);
  const commonTopics = ['technology', 'science', 'business', 'education', 'sports', 'history', 'politics', 'cricket', 'player'];
  const detectedTopic = commonTopics.find(topic => words.includes(topic)) || 'general knowledge';
  
  // Generate questions from content
  for (let i = 0; i < Math.min(numQuestions, sentences.length); i++) {
    const sentence = sentences[i].trim();
    if (sentence.length > 30) {
      const shortSentence = sentence.substring(0, 100);
      questions.push({
        question: `Based on the content: What can be inferred about "${shortSentence}..."?`,
        options: [
          "This is a key point discussed in the content",
          "This is unrelated background information",
          "This is a minor detail mentioned briefly",
          "This is contradicted by other information"
        ],
        correctOption: "This is a key point discussed in the content"
      });
    }
  }
  
  // Fill remaining slots if needed
  while (questions.length < numQuestions) {
    questions.push({
      question: `What is the primary focus of this ${detectedTopic} content?`,
      options: [
        `Main ${detectedTopic} concepts and information`,
        "Unrelated general knowledge",
        "Historical background only",
        "Technical specifications only"
      ],
      correctOption: `Main ${detectedTopic} concepts and information`
    });
  }
  
  return questions.slice(0, numQuestions);
};
