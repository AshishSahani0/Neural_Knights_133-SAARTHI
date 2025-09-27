import Assessment from "../models/Assessment.js";
import { getAIFeedback } from "../util/feedbackGenerator.js";

export const submitAssessment = async (req, res) => {
  try {
    const { studentId, answers } = req.body;

    // Prevent re-submission within 7 days
    const lastAssessment = await Assessment.findOne({ studentId }).sort({ createdAt: -1 });
    if (lastAssessment && new Date() - lastAssessment.createdAt < 7 * 24 * 60 * 60 * 1000) {
      return res.status(400).json({ success: false, message: "You can only submit screening once per week." });
    }

    const phqScore = answers.slice(0, 9).reduce((a, b) => a + b, 0);
    const gadScore = answers.slice(9, 16).reduce((a, b) => a + b, 0);
    const ghqScore = answers.slice(16).reduce((a, b) => a + b, 0);

    const feedback = getAIFeedback({ phqScore, gadScore, ghqScore });

    const assessment = new Assessment({
      studentId,
      answers,
      phqScore,
      gadScore,
      ghqScore,
      feedback,
    });

    await assessment.save();

    res.status(200).json({ success: true, feedback });
  } catch (err) {
    console.error("Submit error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getAssessmentsForStudent = async (req, res) => {
  try {
    const assessments = await Assessment.find({ studentId: req.user._id }).sort({ createdAt: 1 });
    const lastAssessmentDate = assessments.length ? assessments.at(-1).createdAt : null;

    res.status(200).json({ success: true, assessments, lastAssessmentDate });
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ success: false, message: "Fetch error" });
  }
};
