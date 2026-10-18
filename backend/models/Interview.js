const mongoose = require("mongoose");

const interviewQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },

    answer: {
      type: String,
      default: "",
    },

    topic: {
      type: String,
      default: "Resume",
    },

    difficulty: {
      type: String,
      default: "easy",
    },

    score: {
      type: Number,
      default: 0,
    },

    feedback: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["Answered", "Skipped"],
      default: "Answered",
    },
  },
  { _id: false }
);

const interviewSchema = new mongoose.Schema(
  {
    userId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  required: false,
  index: true,
},
    resumeScore: {
      type: Number,
      default: 0,
    },

    questions: {
      type: [interviewQuestionSchema],
      default: [],
    },

    totalScore: {
      type: Number,
      default: 0,
    },

    totalQuestions: {
      type: Number,
      default: 5,
    },

    answered: {
      type: Number,
      default: 0,
    },

    skipped: {
      type: Number,
      default: 0,
    },

    difficulty: {
      type: String,
      default: "easy",
    },

    time: {
      type: String,
      default: "00:00",
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.Interview ||
  mongoose.model("Interview", interviewSchema);
