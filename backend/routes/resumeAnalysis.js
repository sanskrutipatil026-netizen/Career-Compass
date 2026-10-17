
const express = require("express");
const router = express.Router();
const ResumeAnalysis = require("../models/ResumeAnalysis");

router.post("/save", async (req, res) => {
  try {
    console.log("Resume analysis save request received");

    const {
      fileName,
      fileType,
      fileSize,
      extractedText,
      resumeHash,
      analysis,
    } = req.body;

    if (!analysis) {
      return res.status(400).json({
        success: false,
        error: "Resume analysis data is required.",
      });
    }

    if (
      resumeHash &&
      typeof resumeHash === "string"
    ) {
      const existing = await ResumeAnalysis.findOne({
        resumeHash,
      });

      if (existing) {
        return res.status(200).json({
          success: true,
          message: "Resume analysis already exists.",
          resumeAnalysis: existing,
        });
      }
    }

    const resumeAnalysis = new ResumeAnalysis({
      resume: {
        fileName: fileName || "",
        fileType: fileType || "",
        fileSize: Number(fileSize) || 0,
        extractedText: extractedText || "",
      },
      resumeHash: resumeHash || "",
      analysis,
    });

    const savedResume = await resumeAnalysis.save();

    console.log(
      "Resume analysis saved:",
      savedResume._id
    );

    return res.status(201).json({
      success: true,
      message: "Resume analysis saved successfully.",
      resumeAnalysis: savedResume,
    });
  } catch (error) {
    console.error("SAVE RESUME ANALYSIS ERROR:", error);

    return res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : String(error),
    });
  }
});

router.get("/by-hash/:resumeHash", async (req, res) => {
  try {
    const { resumeHash } = req.params;

    if (!resumeHash) {
      return res.status(400).json({
        success: false,
        error: "Resume hash is required.",
      });
    }

    const resumeAnalysis = await ResumeAnalysis.findOne({
      resumeHash,
    });

    if (!resumeAnalysis) {
      return res.status(404).json({
        success: false,
        message: "No previous analysis found for this resume.",
      });
    }

    return res.status(200).json({
      success: true,
      resumeAnalysis,
    });
  } catch (error) {
    console.error("GET RESUME ANALYSIS BY HASH ERROR:", error);

    return res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : String(error),
    });
  }
});

router.get("/latest", async (req, res) => {
  try {
    const resumeAnalysis = await ResumeAnalysis.findOne().sort({
      createdAt: -1,
    });

    if (!resumeAnalysis) {
      return res.status(404).json({
        success: false,
        message: "No resume analysis found.",
      });
    }

    return res.status(200).json({
      success: true,
      resumeAnalysis,
    });
  } catch (error) {
    console.error("GET LATEST RESUME ANALYSIS ERROR:", error);

    return res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : String(error),
    });
  }
});

router.get("/test", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Resume analysis route is working.",
  });
});

module.exports = router;

