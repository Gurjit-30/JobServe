import React, { useState, useRef, useEffect } from 'react';

const VideoPlayerWithQuiz = ({ lesson, onVideoEnd }) => {
  const videoRef = useRef(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [answeredQuizzes, setAnsweredQuizzes] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    // Reset state when lesson changes
    setShowQuiz(false);
    setCurrentQuiz(null);
    setAnsweredQuizzes([]);
    setSelectedOption(null);
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [lesson]);

  const handleTimeUpdate = () => {
    if (!videoRef.current || !lesson.quizzes) return;
    const currentTime = videoRef.current.currentTime;
    
    // Check if we need to show a quiz
    const activeQuiz = lesson.quizzes.find(
      q => Math.abs(q.timestampInSeconds - currentTime) < 1 && !answeredQuizzes.includes(q._id)
    );

    if (activeQuiz && !showQuiz) {
      videoRef.current.pause();
      setCurrentQuiz(activeQuiz);
      setShowQuiz(true);
    }
  };

  const handleQuizSubmit = () => {
    if (selectedOption === null) return;
    
    const isCorrect = selectedOption === currentQuiz.question.correctOptionIndex;
    if (isCorrect) {
       // Optional: Toast success
    } else {
       // Optional: Toast try again
    }
    
    setAnsweredQuizzes([...answeredQuizzes, currentQuiz._id]);
    setShowQuiz(false);
    setCurrentQuiz(null);
    setSelectedOption(null);
    videoRef.current.play();
  };

  return (
    <div className="relative w-full rounded-xl overflow-hidden shadow-2xl bg-black flex justify-center items-center" style={{ maxHeight: '60vh' }}>
      <video
        ref={videoRef}
        src={lesson.videoUrl}
        className="w-full h-full object-contain"
        controls={!showQuiz}
        onTimeUpdate={handleTimeUpdate}
        onEnded={onVideoEnd}
      />
      
      {showQuiz && currentQuiz && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4 z-10 backdrop-blur-sm transition-opacity">
          <div className="bg-gray-800 p-8 rounded-2xl max-w-lg w-full shadow-2xl border border-gray-700">
            <h3 className="text-2xl font-bold text-white mb-6">Quiz Time!</h3>
            <p className="text-lg text-gray-200 mb-6">{currentQuiz.question.questionText}</p>
            
            <div className="space-y-3 mb-8">
              {currentQuiz.question.options.map((opt, idx) => (
                <button
                  key={idx}
                  className={`w-full text-left px-5 py-4 rounded-xl border transition-all ${selectedOption === idx ? 'bg-blue-600 border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.5)]' : 'bg-gray-700 border-gray-600 hover:bg-gray-600 hover:border-gray-500'}`}
                  onClick={() => setSelectedOption(idx)}
                >
                  <span className="text-white">{opt}</span>
                </button>
              ))}
            </div>
            
            <button
              onClick={handleQuizSubmit}
              disabled={selectedOption === null}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${selectedOption !== null ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg' : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}
            >
              Submit Answer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayerWithQuiz;
