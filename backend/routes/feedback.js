const express = require("express");
const router = express.Router();

const Feedback = require("../models/Feedback");

// Save feedback
router.post("/", async (req, res) => {
  try {
    const {
      rating,
      helpfulness,
      experience,
      mostHelpful,
      improvement,
    } = req.body;

    if (!rating || !helpfulness) {
      return res.status(400).json({
        message: "Rating and helpfulness are required.",
      });
    }

    const feedback = new Feedback({
      rating,
      helpfulness,
      experience,
      mostHelpful,
      improvement,
    });

    await feedback.save();

    res.status(201).json({
      message: "Feedback submitted successfully.",
      feedback,
    });
  } catch (error) {
    console.error("Feedback submission error:", error);

    res.status(500).json({
      message: "Failed to submit feedback.",
    });
  }
});

module.exports = router;