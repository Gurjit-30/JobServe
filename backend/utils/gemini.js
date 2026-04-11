const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI("AIzaSyD9PCYxrnNm9Oqbs0ju093vVXLHdCPRZOc");

const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

module.exports = model;