const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Interview = require("../models/Interview");
const authenticateToken = require("../middleware/auth");

router.post("/save", authenticateToken, async (req, res) => {
  try {
    const {
      resumeScore,
      questions,
      totalScore,
      totalQuestions,
      answered,
      skipped,
      difficulty,
      time,
    } = req.body;

    if (!Array.isArray(questions)) {
      return res.status(400).json({
        success: false,
        message: "Questions must be an array.",
      });
    }

    const normalizedQuestions = questions.map((q) => {
      const answer = String(q.answer || "").trim();
      const status =
        q.status === "Skipped" || answer.toLowerCase() === "skipped"
          ? "Skipped"
          : q.status === "Answered" && answer
            ? "Answered"
            : "Skipped";

      return {
        question: q.question || "",
        answer,
        topic: q.topic || "Resume",
        difficulty: q.difficulty || difficulty || "Medium",
        score: status === "Skipped" ? 0 : Number(q.score) || 0,
        feedback: q.feedback || "",
        status,
      };
    });

    const answeredCount = normalizedQuestions.filter(
      (q) => q.status === "Answered"
    ).length;

    const skippedCount = normalizedQuestions.filter(
      (q) => q.status === "Skipped"
    ).length;

    const calculatedScore = normalizedQuestions.reduce(
      (sum, q) => sum + q.score,
      0
    );

    const interview = new Interview({
      userId: req.user.id,
      resumeScore: Number(resumeScore) || 0,
      questions: normalizedQuestions,
      totalScore:
        totalScore !== undefined ? Number(totalScore) || 0 : calculatedScore,
      totalQuestions:
        totalQuestions !== undefined
          ? Number(totalQuestions) || normalizedQuestions.length
          : normalizedQuestions.length,
      answered: answeredCount,
      skipped: skippedCount,
      difficulty: difficulty || "Medium",
      time: time || "00:00",
    });

    const savedInterview = await interview.save();

    return res.status(201).json({
      success: true,
      message: "Interview saved successfully.",
      interview: savedInterview,
    });
  } catch (error) {
    console.error("Save interview error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to save interview.",
    });
  }
});

router.get("/history", authenticateToken, async (req, res) => {
  try {
    const interviews = await Interview.find({
      userId: req.user.id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      interviews,
    });
  } catch (error) {
    console.error("Fetch interview history error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch interview history.",
    });
  }
});

router.get("/latest", authenticateToken, async (req, res) => {
  try {
    const interview = await Interview.findOne({
      userId: req.user.id,
    }).sort({ createdAt: -1 });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "No interview found for this account.",
      });
    }

    return res.status(200).json({
      success: true,
      interview,
    });
  } catch (error) {
    console.error("Fetch latest interview error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch the latest interview.",
    });
  }
});

router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid interview ID.",
      });
    }

    const deletedInterview = await Interview.findOneAndDelete({
      _id: id,
      userId: req.user.id,
    });

    if (!deletedInterview) {
      return res.status(404).json({
        success: false,
        message:
          "Interview not found or you do not have permission to delete it.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Interview deleted successfully.",
    });
  } catch (error) {
    console.error("Delete interview error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete interview.",
    });
  }
});

router.get("/test", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Interview API is working.",
  });
});

module.exports = router;

