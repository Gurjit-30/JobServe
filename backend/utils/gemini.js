const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI("AIzaSyDzZm7lrEijyAwxM91tAG9Uo60HveAoTbo");

const model = genAI.getGenerativeModel({ model: "gemini-pro" });

module.exports = model;