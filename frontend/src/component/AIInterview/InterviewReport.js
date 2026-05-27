import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

const InterviewReport = () => {
  const { interviewId } = useParams();
  const [report, setReport] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/interviews/${interviewId}/report`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        setReport(res.data);
      } catch (err) {
        console.error("Failed to fetch report", err);
      }
    };
    fetchReport();
  }, [interviewId]);

  if (!report) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading Report...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-4xl font-bold mb-2">Interview Report</h1>
            <p className="text-gray-400 text-lg">Target: {report.companyTarget} - {report.roleTarget}</p>
          </div>
          <Link to="/" className="text-blue-400 hover:text-blue-300 font-medium">Return to Dashboard</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-gray-800 border border-gray-700 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
             <div className="text-gray-400 font-semibold mb-2 uppercase tracking-wider text-sm">Overall Technical</div>
             <div className="text-5xl font-black text-blue-400">{report.overallTechnicalScore}<span className="text-2xl text-gray-500">/10</span></div>
          </div>
          <div className="bg-gray-800 border border-gray-700 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
             <div className="text-gray-400 font-semibold mb-2 uppercase tracking-wider text-sm">Overall Communication</div>
             <div className="text-5xl font-black text-purple-400">{report.overallCommunicationScore}<span className="text-2xl text-gray-500">/10</span></div>
          </div>
          <div className="bg-gray-800 border border-gray-700 p-6 rounded-2xl flex flex-col justify-center">
             <div className="text-gray-400 font-semibold mb-2 uppercase tracking-wider text-sm">Key Improvements</div>
             <p className="text-gray-300">{report.overallSuggestedImprovements}</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-6">Detailed Breakdown</h2>
        <div className="space-y-6">
          {report.interactions.map((interaction, idx) => (
            <div key={idx} className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
              <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-700">
                <div className="w-10 h-10 bg-blue-900/50 rounded-full flex items-center justify-center text-blue-400 font-bold">
                  Q{idx + 1}
                </div>
                <h3 className="text-xl font-medium text-gray-200">{interaction.interviewerQuestion}</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Your Answer Transcript</h4>
                  <p className="text-gray-400 text-sm italic bg-gray-900 p-4 rounded-xl border border-gray-800 leading-relaxed">
                    "{interaction.candidateAnswerTranscript}"
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">AI STAR Feedback</h4>
                    <p className="text-gray-300">{interaction.aiFeedbackStarMethod}</p>
                  </div>
                  
                  <div className="flex gap-4 mt-4 pt-4 border-t border-gray-700">
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 mb-1">Confidence</div>
                      <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${interaction.emotionsDetected.confidenceLevel}%` }}></div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 mb-1">Nervousness</div>
                      <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{ width: `${interaction.emotionsDetected.nervousnessLevel}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InterviewReport;
