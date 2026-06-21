require("dotenv").config({ path: __dirname + "/../.env" });
const mongoose = require("mongoose");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Problem = require("../models/Problem");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const prompt = `Generate 5 standard DSA pattern problems in strict JSON format. 
The output MUST be a JSON array of objects with the following schema:
[{
  "title": "String",
  "difficulty": "Easy" | "Medium" | "Hard",
  "description": "String",
  "constraints": ["String"],
  "baseCodeTemplates": {
    "python": "String",
    "java": "String",
    "cpp": "String",
    "javascript": "String"
  },
  "testCases": [
    {
      "input": "String",
      "expectedOutput": "String"
    }
  ]
}]
Ensure there are at least 3 test cases per problem. The input/output format must be string-based matching Judge0 expectations (newline separated inputs). Respond only with valid JSON.`;

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro", 
      generationConfig: { responseMimeType: "application/json" } 
    });
    
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const problems = JSON.parse(responseText);
    
    for (const p of problems) {
      await Problem.updateOne({ title: p.title }, p, { upsert: true });
    }
    
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
}

seed();
