const pdfParse = require("pdf-parse");
const model = require("../utils/gemini");

exports.analyzeResume = async (req, res) => {
    try {
        const pdfData = await pdfParse(req.file.buffer);
        const resumeText = pdfData.text;

        const jobRole = req.body.role;

        const prompt = `
    Analyze this resume for the role: ${jobRole}

    Resume:
    ${resumeText}

    Give output in this format:
    Match Percentage: __%
    Strengths: ...
    Weaknesses: ...
    Suggestions: ...
    `;

        const result = await model.generateContent(prompt);
        const response = result.response.text();

        res.json({ result: response });

    } catch (err) {
        console.error("AI Error:", err);
        res.status(500).json({ message: "AI error", details: err.message });
    }
};