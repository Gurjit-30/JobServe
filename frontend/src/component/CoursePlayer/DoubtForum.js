import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiCheck, FiCornerDownRight } from 'react-icons/fi';
import toast from 'react-hot-toast';

const DoubtForum = ({ lessonId }) => {
  const [doubts, setDoubts] = useState([]);
  const [newDoubtText, setNewDoubtText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [activeReplyId, setActiveReplyId] = useState(null);

  const fetchDoubts = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/courses/doubts/${lessonId}`);
      setDoubts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDoubts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  const postDoubt = async (e) => {
    e.preventDefault();
    if (!newDoubtText.trim()) return;
    try {
      await axios.post(`http://localhost:5000/courses/doubts`, { lessonId, text: newDoubtText }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setNewDoubtText("");
      toast.success("Doubt posted");
      fetchDoubts();
    } catch (err) {
      toast.error("Failed to post doubt");
    }
  };

  const postReply = async (doubtId) => {
    if (!replyText.trim()) return;
    try {
      await axios.post(`http://localhost:5000/courses/doubts/${doubtId}/reply`, { text: replyText, isMentor: false }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setReplyText("");
      setActiveReplyId(null);
      fetchDoubts();
    } catch (err) {
      toast.error("Failed to reply");
    }
  };

  const markResolved = async (doubtId) => {
    try {
      await axios.put(`http://localhost:5000/courses/doubts/${doubtId}/resolve`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      fetchDoubts();
      toast.success("Marked as resolved");
    } catch (err) {
      toast.error("Failed to resolve");
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={postDoubt} className="bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-md">
        <textarea
          value={newDoubtText}
          onChange={(e) => setNewDoubtText(e.target.value)}
          placeholder="Ask a question about this lesson..."
          className="w-full bg-gray-900 text-white rounded-lg p-4 border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none h-24"
        />
        <div className="flex justify-end mt-3">
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
            Post Question
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {doubts.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No doubts yet. Be the first to ask!</p>
        ) : (
          doubts.map(doubt => (
            <div key={doubt._id} className="bg-gray-800 rounded-xl p-5 border border-gray-700 shadow-sm transition-all hover:border-gray-600">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center font-bold">
                    {doubt.studentId?.name ? doubt.studentId.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-200">{doubt.studentId?.name || 'Unknown User'}</p>
                    <p className="text-xs text-gray-400">{new Date(doubt.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                {doubt.isResolved ? (
                  <span className="flex items-center text-green-400 text-sm font-medium bg-green-400/10 px-3 py-1 rounded-full">
                    <FiCheck className="mr-1" /> Resolved
                  </span>
                ) : (
                  <button onClick={() => markResolved(doubt._id)} className="text-sm text-gray-400 hover:text-green-400 transition-colors flex items-center">
                    Mark as Resolved
                  </button>
                )}
              </div>
              
              <p className="text-gray-300 mt-2 text-lg">{doubt.text}</p>
              
              <div className="mt-4 border-t border-gray-700 pt-4">
                {doubt.replies && doubt.replies.length > 0 && (
                  <div className="space-y-4 mb-4">
                    {doubt.replies.map(reply => (
                      <div key={reply._id} className="flex space-x-3 ml-6 pl-4 border-l-2 border-gray-700">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center font-bold text-sm mt-1 shrink-0">
                           {reply.authorId?.name ? reply.authorId.name.charAt(0).toUpperCase() : 'A'}
                        </div>
                        <div>
                          <div className="flex items-baseline space-x-2">
                            <span className="font-medium text-gray-200">{reply.authorId?.name || 'User'}</span>
                            {reply.isMentor && <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">Mentor</span>}
                          </div>
                          <p className="text-gray-400 text-sm mt-1">{reply.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {activeReplyId === doubt._id ? (
                  <div className="flex mt-3 ml-6 pl-4 border-l-2 border-transparent">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write a reply..."
                      className="flex-1 bg-gray-900 text-white rounded-l-lg px-4 py-2 border border-gray-700 focus:border-blue-500 focus:outline-none"
                    />
                    <button onClick={() => postReply(doubt._id)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-lg">
                      Reply
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setActiveReplyId(doubt._id)} className="text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors ml-6 flex items-center">
                    <FiCornerDownRight className="mr-1" /> Add Reply
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DoubtForum;
