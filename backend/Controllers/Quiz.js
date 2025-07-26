import Quiz from "../Models/Quiz.js";
const generateCode = async () => {
  let code;
  let exists = true;
  while (exists) {
    code = Math.floor(100000 + Math.random() * 900000).toString();
    const existingQuiz = await Quiz.findOne({ code });
    exists = existingQuiz !== null;
  }
  return code;
};

export const generateQuiz = async (req, res) => {
  try {
    const {
      scheduledTime,
      quizName,
      quizDuration,
      timePerQuestion,
      questionShuffle,
      optionShuffle,
      questions,
      generator,
      numberOfQuestions,
      quizTitle,
    } = req.body;

    const code = await generateCode();
    const newQuiz = new Quiz({
      code,
      scheduledTime,
      quizName,
      quizDuration,
      timePerQuestion,
      questionShuffle,
      optionShuffle,
      questions,
      generator,
      numberOfQuestions,
      quizTitle,
    });

    const savedQuiz = await newQuiz.save();
    return res.status(201).json(savedQuiz);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Could not create quiz" });
  }
};

export const getQuiz = async (req, res) => {
  try {
    const { Code } = req.body;
    const data = await Quiz.findOne({ code: Code });
    if (!data) {
      return res.status(404).json({ message: "Quiz not found" });
    }
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: "Could not fetch data" });
  }
};

export const getQuizes = async (req, res) => {
  try {
    const { email } = req.body;
    console.log(`📊 Fetching quizzes for generator email: ${email}`);

    if (!email) {
      console.log('❌ No email provided in request');
      return res.status(400).json({ message: "Email is required" });
    }

    const data = await Quiz.find({ generator: email });
    console.log(`📊 Found ${data.length} quizzes for ${email}`);

    // Log some details for debugging
    if (data.length > 0) {
      console.log('📊 Quiz details:', data.map(q => ({
        code: q.code,
        title: q.quizTitle,
        generator: q.generator,
        createdAt: q.createdAt
      })));
    } else {
      // Check if there are any quizzes in the database at all
      const totalQuizzes = await Quiz.countDocuments();
      console.log(`📊 Total quizzes in database: ${totalQuizzes}`);

      if (totalQuizzes > 0) {
        // Show some sample generators to help debug
        const sampleQuizzes = await Quiz.find({}).limit(5).select('generator');
        console.log('📊 Sample generators in database:', sampleQuizzes.map(q => q.generator));
      }
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('❌ Error in getQuizes:', error);
    return res.status(500).json({ message: "Could not fetch data" });
  }
};

export const updateQuiz = async (req, res) => {
  try {
    const { email, code, score } = req.body;
    const result = await Quiz.findOneAndUpdate(
      { code: code, "attemptedBy.email": { $ne: email } },
      {
        $addToSet: {
          attemptedBy: { email: email, correctAnswers: score },
        },
      },
      { new: true }
    );

    if (!result) {
      return res
        .status(201)
        .json({ message: "User has already attempted this quiz" });
    }

    return res.status(200).json({ message: "Quiz user added successfully" });
  } catch (error) {
    console.error("Error in updateQuiz:", error);
    return res.status(500).json({ message: "Could not fetch data" });
  }
};
