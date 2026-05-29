import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import * as faceapi from '@vladmandic/face-api';
import toast from 'react-hot-toast';

const ActiveInterview = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  
  const videoRef = useRef(null);
  
  const [hasPermissions, setHasPermissions] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState("Tell me about yourself and your background.");
  const [aiFeedback, setAiFeedback] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  
  const recognitionRef = useRef(null);
  
  // Emotion tracking
  const emotionStatsRef = useRef({ happy: 0, neutral: 0, sad: 0, surprised: 0, fearful: 0, angry: 0, total: 0 });

  useEffect(() => {
    const loadModels = async () => {
      try {
        // Models need to be placed in public/models
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        await faceapi.nets.faceExpressionNet.loadFromUri('/models');
        setIsModelLoaded(true);
      } catch (err) {
        console.warn("Failed to load face-api models. Please ensure they are in public/models.", err);
      }
    };
    loadModels();
    
    // Setup Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(prev => prev + " " + currentTranscript);
      };
    } else {
      toast.error("Speech Recognition not supported in this browser.");
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const requestPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasPermissions(true);
    } catch (err) {
      toast.error("Camera/Microphone permissions required.");
    }
  };

  const analyzeEmotions = useCallback(async () => {
    if (!videoRef.current || !isModelLoaded || !isRecording) return;
    
    if (videoRef.current.paused || videoRef.current.ended) return;

    try {
      const detections = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions();
      if (detections) {
        const expr = detections.expressions;
        const stats = emotionStatsRef.current;
        stats.total++;
        if (expr.happy > 0.5) stats.happy++;
        if (expr.neutral > 0.5) stats.neutral++;
        if (expr.sad > 0.5 || expr.fearful > 0.5) stats.fearful++;
      }
    } catch (error) {
       // Ignore random detection errors
    }
    
    if (isRecording) {
      setTimeout(analyzeEmotions, 1000);
    }
  }, [isRecording, isModelLoaded]);

  useEffect(() => {
    if (isRecording && isModelLoaded) {
      analyzeEmotions();
    }
  }, [isRecording, isModelLoaded, analyzeEmotions]);

  const toggleRecording = () => {
    if (!isRecording) {
      setTranscript("");
      emotionStatsRef.current = { happy: 0, neutral: 0, sad: 0, surprised: 0, fearful: 0, angry: 0, total: 0 };
      if (recognitionRef.current) recognitionRef.current.start();
      setIsRecording(true);
    } else {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsRecording(false);
      submitAnswer();
    }
  };

  const submitAnswer = async () => {
    setIsAnalyzing(true);
    
    // Calculate metrics
    const stats = emotionStatsRef.current;
    const confidenceLevel = stats.total > 0 ? Math.round(((stats.happy + stats.neutral) / stats.total) * 100) : 50;
    const nervousnessLevel = stats.total > 0 ? Math.round((stats.fearful / stats.total) * 100) : 10;
    const eyeContactScore = stats.total > 0 ? 80 : 50; // Simplified

    try {
      const res = await axios.post(`http://localhost:5000/interviews/${interviewId}/answer`, {
        answerTranscript: transcript || "No answer provided.",
        currentQuestion,
        confidenceLevel,
        nervousnessLevel,
        eyeContactScore
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      
      setAiFeedback(res.data.evaluation);
      setCurrentQuestion(res.data.nextQuestion);
    } catch (error) {
      toast.error("Failed to analyze answer.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const completeInterview = async () => {
    try {
      await axios.post(`http://localhost:5000/interviews/${interviewId}/complete`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      navigate(`/interview/report/${interviewId}`);
    } catch (err) {
      toast.error("Failed to complete interview.");
    }
  };

  if (!hasPermissions) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white p-4">
        <div className="bg-gray-800 p-8 rounded-2xl max-w-md text-center shadow-2xl border border-gray-700">
          <h2 className="text-2xl font-bold mb-4">Camera & Microphone Access</h2>
          <p className="text-gray-400 mb-8">We need access to your camera and microphone to conduct the AI interview and analyze your responses.</p>
          <button onClick={requestPermissions} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl w-full transition-colors">
            Allow Access
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <header className="p-4 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-400">Live Interview Session</h1>
        <button onClick={completeInterview} className="bg-red-500/20 text-red-400 hover:bg-red-500/30 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
          End Interview
        </button>
      </header>

      <main className="flex-1 p-6 flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/2 flex flex-col space-y-4">
          <div className="relative rounded-2xl overflow-hidden bg-black aspect-video border border-gray-700 shadow-2xl">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
            <div className="absolute top-4 right-4 flex space-x-2">
              {isRecording && <div className="bg-red-500 animate-pulse text-white px-3 py-1 rounded-full text-xs font-bold">Recording</div>}
              {isModelLoaded && <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold">AI Active</div>}
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
             <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Live Transcript</h3>
             <div className="h-32 overflow-y-auto text-gray-300 font-mono text-sm leading-relaxed p-2 bg-gray-900 rounded-lg border border-gray-800">
               {transcript || <span className="text-gray-600 italic">Your speech will appear here...</span>}
             </div>
          </div>
        </div>

        <div className="w-full md:w-1/2 flex flex-col">
          <div className="bg-blue-900/20 border border-blue-500/30 p-6 rounded-2xl mb-6 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
            <h3 className="text-blue-400 font-bold mb-2 text-sm uppercase tracking-wider">Interviewer</h3>
            <p className="text-2xl font-medium text-white leading-snug">"{currentQuestion}"</p>
          </div>

          <div className="flex justify-center mb-8">
            <button
              onClick={toggleRecording}
              disabled={isAnalyzing}
              className={`w-48 h-48 rounded-full flex flex-col items-center justify-center transition-all shadow-2xl ${
                isAnalyzing ? 'bg-gray-700 cursor-not-allowed' :
                isRecording ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 
                'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isAnalyzing ? (
                <span className="text-xl font-bold">Analyzing...</span>
              ) : (
                <>
                  <div className="text-4xl mb-2">{isRecording ? '⏹' : '🎙'}</div>
                  <span className="text-xl font-bold">{isRecording ? 'Stop Answering' : 'Start Answering'}</span>
                </>
              )}
            </button>
          </div>

          {aiFeedback && (
            <div className="bg-gray-800 border border-gray-700 p-5 rounded-2xl animate-fade-in-up">
              <h3 className="text-green-400 font-bold mb-3 flex items-center">
                <span className="bg-green-400/20 p-1 rounded mr-2">✓</span> Previous Answer Feedback
              </h3>
              <p className="text-gray-300 mb-4">{aiFeedback.starFeedback}</p>
              <div className="flex gap-4">
                <div className="bg-gray-900 px-4 py-2 rounded-lg border border-gray-700 flex-1">
                  <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Tech Score</div>
                  <div className="text-2xl font-bold text-blue-400">{aiFeedback.technicalScore}/10</div>
                </div>
                <div className="bg-gray-900 px-4 py-2 rounded-lg border border-gray-700 flex-1">
                  <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Comm Score</div>
                  <div className="text-2xl font-bold text-purple-400">{aiFeedback.communicationScore}/10</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ActiveInterview;
