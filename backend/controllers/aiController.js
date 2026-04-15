const pdfParse = require("pdf-parse");
const model = require("../utils/gemini");

exports.analyzeResume = async (req, res) => {
    try {
        const pdfData = await pdfParse(req.file.buffer);
        const resumeText = pdfData.text;

        const jobRole = req.body.role;

        const prompt = `
You are an expert ATS (Applicant Tracking System) and resume coach. Analyze the resume below for the role: "${jobRole}".

Resume:
${resumeText}

Return ONLY valid JSON (no markdown, no code fences, no extra text) in this exact format:
{
  "score": <integer 0-100>,
  "grade": "<one of: Rookie | Contender | Skilled | Expert | Elite | Legendary>",
  "strengths": ["...", "...", "..."],
  "weaknesses": ["...", "...", "..."],
  "suggestions": ["...", "...", "..."],
  "summary": "<2-3 sentence overall verdict>"
}

Scoring guide:
- 0-19: Rookie
- 20-39: Contender
- 40-59: Skilled
- 60-74: Expert
- 75-89: Elite
- 90-100: Legendary
`;

        const result = await model.generateContent(prompt);
        let responseText = result.response.text().trim();

        // Strip markdown code fences if present
        responseText = responseText.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();

        let parsed;
        try {
            parsed = JSON.parse(responseText);
        } catch (parseErr) {
            // Fallback: return raw text with a default score
            return res.json({ result: responseText, score: null, grade: null });
        }

        res.json({
            score: parsed.score ?? 0,
            grade: parsed.grade ?? "Rookie",
            strengths: parsed.strengths ?? [],
            weaknesses: parsed.weaknesses ?? [],
            suggestions: parsed.suggestions ?? [],
            summary: parsed.summary ?? "",
        });

    } catch (err) {
        console.error("AI Error:", err);
        res.status(500).json({ message: "AI error", details: err.message });
    }
};

exports.generateCoverLetter = async (req, res) => {
    try {
        const { role, company } = req.body;
        if (!role || !company) return res.status(400).json({ message: "Role and company required" });

        const prompt = `You are an expert career coach. Write a professional, concise, and modern cover letter for the role of "${role}" at "${company}". Keep it highly engaging, confident, under 3 paragraphs, and leave placeholders for [My Name], [Contact Info], and [Date].`;
        
        const result = await model.generateContent(prompt);
        res.json({ coverLetter: result.response.text().trim() });
    } catch (err) {
        console.error("Cover Letter AI Error:", err);
        res.status(500).json({ message: "Failed to generate cover letter", details: err.message });
    }
};