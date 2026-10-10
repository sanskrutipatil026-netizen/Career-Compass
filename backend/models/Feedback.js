const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    helpfulness: {
      type: String,
      required: true,
    },

    experience: {
      type: String,
      default: "",
    },

    mostHelpful: {
      type: String,
      default: "",
    },

    improvement: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Feedback", feedbackSchema);