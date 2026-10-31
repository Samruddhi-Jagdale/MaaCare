// routes/education.js
const express = require('express');
const educationData = require('../data/educationData');

const router = express.Router();

// @desc    Get maternal education resources
// @route   GET /api/education
// @access  Public / Authenticated
router.get('/', (req, res) => {
  const lang = req.query.lang === 'mr' ? 'mr' : 'en';
  const trimester = req.query.trimester ? Number(req.query.trimester) : null;

  const dataset = educationData[lang] || educationData.en;

  if (trimester && [1, 2, 3].includes(trimester)) {
    const specificTrimester = dataset.trimesterGuidance.find((t) => t.trimester === trimester);
    return res.json({
      language: lang,
      emergencyCare: dataset.emergencyCare,
      trimesterGuidance: [specificTrimester],
      faqs: dataset.faqs,
    });
  }

  res.json({
    language: lang,
    emergencyCare: dataset.emergencyCare,
    trimesterGuidance: dataset.trimesterGuidance,
    faqs: dataset.faqs,
  });
});

module.exports = router;
