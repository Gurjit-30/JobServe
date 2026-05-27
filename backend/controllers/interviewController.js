const Interview = require("../models/Interview");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.startInterview = async (req, res) => {
  try {
    const { companyTarget, roleTarget } = req.body;
    const candidateId = req.userId;

    const newInterview = new Interview({
      candidateId,
      companyTarget,
      roleTarget,
      interactions: []
    });

    await newInterview.save();
    res.json({ message: "Interview started", interview: newInterview });
  } catch (error) {
    res.status(500).json({ error: "Failed to start interview" });
  }
};

exports.submitAnswerAndGetNextQuestion = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const { answerTranscript, currentQuestion, confidenceLevel, nervousnessLevel, eyeContactScore } = req.body;

    const interviewRecord = await Interview.findById(interviewId);
    if (!interviewRecord) return res.status(404).json({ error: "Interview not found" });

    // Use Gemini to evaluate the answer based on STAR method
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `You are a strict technical interviewer at ${interviewRecord.companyTarget} for a ${interviewRecord.roleTarget} role.
The candidate was asked: "${currentQuestion}"
The candidate answered: "${answerTranscript}"

Evaluate this answer using the STAR (Situation, Task, Action, Result) method. 
Provide a short feedback summary, rate their technical and communication skills out of 10.
Finally, suggest the next follow-up or behavioral question to ask.

Respond strictly in JSON format with these keys:
- starFeedback (string)
- technicalScore (number 1-10)
- communicationScore (number 1-10)
- nextQuestion (string)`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Assuming the response is clean JSON (we can sanitize if needed)
    const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || responseText.match(/\{[\s\S]*\}/);
    let evaluation = { starFeedback: "Good answer.", technicalScore: 7, communicationScore: 7, nextQuestion: "Tell me about a time you failed." };
    
    if (jsonMatch) {
      try {
        evaluation = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } catch (e) {
        console.error("JSON parsing failed for AI response");
      }
    }

    interviewRecord.interactions.push({
      interviewerQuestion: currentQuestion,
      candidateAnswerTranscript: answerTranscript,
      aiFeedbackStarMethod: evaluation.starFeedback,
      technicalScore: evaluation.technicalScore,
      communicationScore: evaluation.communicationScore,
      emotionsDetected: { confidenceLevel, nervousnessLevel, eyeContactScore }
    });

    await interviewRecord.save();

    res.json({ 
      evaluation, 
      nextQuestion: evaluation.nextQuestion 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to process interview answer" });
  }
};

exports.completeInterview = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const interviewRecord = await Interview.findById(interviewId);
    
    if (!interviewRecord) return res.status(404).json({ error: "Interview not found" });

    let totalTech = 0, totalComm = 0;
    interviewRecord.interactions.forEach(interaction => {
      totalTech += interaction.technicalScore || 0;
      totalComm += interaction.communicationScore || 0;
    });

    const interactionCount = interviewRecord.interactions.length || 1;
    
    interviewRecord.overallTechnicalScore = Math.round(totalTech / interactionCount);
    interviewRecord.overallCommunicationScore = Math.round(totalComm / interactionCount);
    interviewRecord.overallSuggestedImprovements = "Focus on structuring answers precisely with the STAR method and maintain eye contact.";
    interviewRecord.status = 'completed';

    await interviewRecord.save();
    res.json({ message: "Interview completed", interview: interviewRecord });
  } catch (error) {
    res.status(500).json({ error: "Failed to complete interview" });
  }
};

exports.getInterviewReport = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const interviewRecord = await Interview.findById(interviewId).populate('candidateId', 'name');
    if (!interviewRecord) return res.status(404).json({ error: "Interview not found" });

    res.json(interviewRecord);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch report" });
  }
};
