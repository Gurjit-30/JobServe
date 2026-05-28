import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const InterviewSetup = () => {
  const [companyTarget, setCompanyTarget] = useState('Amazon');
  const [roleTarget, setRoleTarget] = useState('Frontend Engineer');
  const [isStarting, setIsStarting] = useState(false);
  const navigate = useNavigate();

  const startInterview = async () => {
    setIsStarting(true);
    try {
      // Top 10% Tech Stack Tip: WebRTC Prep for live mock interviews
      // Here we request camera permission as a precursor to setting up RTCPeerConnection
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        // In a full WebRTC flow, we would initialize an RTCPeerConnection here
        // and exchange SDP offers/answers with the server via WebSockets.
      } else {
        alert("WebRTC is not supported in this browser. Live streaming features will be disabled.");
      }

      const res = await axios.post('http://localhost:5000/interviews/start', { companyTarget, roleTarget }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      navigate(`/interview/active/${res.data.interview._id}`);
    } catch (error) {
      console.error(error);
      alert('Failed to start interview. Ensure you have granted camera permissions and are logged in.');
      setIsStarting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 text-white">
      <div className="bg-gray-800 max-w-lg w-full rounded-2xl shadow-2xl p-8 border border-gray-700">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-400">AI Interview Hub</h2>
        <p className="text-gray-400 mb-8 text-center">Prepare for your next big role with our real-time AI interviewer.</p>
        
        <div className="space-y-5 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Target Company / Framework</label>
            <select
              value={companyTarget}
              onChange={(e) => setCompanyTarget(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="Amazon">Amazon (Leadership Principles)</option>
              <option value="Google">Google (Googlyness & Technical)</option>
              <option value="Microsoft">Microsoft (Growth Mindset)</option>
              <option value="Meta">Meta (Move Fast)</option>
              <option value="General Technical">General Technical</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Target Role</label>
            <input
              type="text"
              value={roleTarget}
              onChange={(e) => setRoleTarget(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="e.g., Frontend Engineer"
            />
          </div>
        </div>

        <button
          onClick={startInterview}
          disabled={isStarting}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${isStarting ? 'bg-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg'}`}
        >
          {isStarting ? 'Setting up Interview...' : 'Start AI Interview'}
        </button>
      </div>
    </div>
  );
};

export default InterviewSetup;
