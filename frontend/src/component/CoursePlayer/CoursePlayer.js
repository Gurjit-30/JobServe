import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import VideoPlayerWithQuiz from './VideoPlayerWithQuiz';
import DoubtForum from './DoubtForum';
import LessonResources from './LessonResources';
import { FiCheckCircle, FiCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import { subscribeToCourseViewers, joinCourseRoom, leaveCourseRoom } from '../../firebase';

const CoursePlayer = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [watchedLessons, setWatchedLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [activeTab, setActiveTab] = useState('doubts');
  const [liveViewers, setLiveViewers] = useState(0);

  useEffect(() => {
    // Generate a simple mock userId for tracking
    const userId = localStorage.getItem("token") ? JSON.parse(atob(localStorage.getItem("token").split('.')[1])).id : Math.random().toString(36).substr(2, 9);
    
    joinCourseRoom(courseId, userId);
    const unsubscribe = subscribeToCourseViewers(courseId, (count) => {
      setLiveViewers(count);
    });

    return () => {
      unsubscribe();
      leaveCourseRoom(courseId, userId);
    };
  }, [courseId]);

  useEffect(() => {
    // Mock data if backend is not seeded yet, or fetch from backend
    const fetchCourseData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/courses/${courseId}`);
        setCourse(response.data);
        if (response.data.modules?.[0]?.lessons?.[0]) {
          setCurrentLesson(response.data.modules[0].lessons[0]);
        }
      } catch (error) {
        console.error("Failed to fetch course. Using mock data for preview.", error);
        // Fallback mock data to allow preview without backend seeding
        const mockCourse = {
          _id: courseId,
          title: "Advanced React Patterns",
          modules: [
            {
              _id: 'm1',
              title: "Module 1: Introduction",
              lessons: [
                {
                  _id: 'l1',
                  title: "What are React Patterns?",
                  videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
                  quizzes: [{ _id: 'q1', timestampInSeconds: 5, question: { questionText: "What is React?", options: ["A library", "A framework", "A database"], correctOptionIndex: 0 } }],
                  resources: [{ title: "Slides", url: "https://example.com/slides.pdf", type: "pdf" }]
                },
                {
                  _id: 'l2',
                  title: "Setup and Configuration",
                  videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
                  quizzes: [],
                  resources: []
                }
              ]
            }
          ]
        };
        setCourse(mockCourse);
        setCurrentLesson(mockCourse.modules[0].lessons[0]);
      }

      try {
        const progressRes = await axios.get(`http://localhost:5000/courses/progress/${courseId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        setWatchedLessons(progressRes.data.watchedLessons || []);
      } catch (err) {
        console.error("Failed to fetch progress", err);
      }
    };
    fetchCourseData();
  }, [courseId]);

  const markAsWatched = async (lessonId) => {
    if (watchedLessons.includes(lessonId)) return;
    setWatchedLessons([...watchedLessons, lessonId]);
    try {
      await axios.post(`http://localhost:5000/courses/progress`, { courseId, lessonId }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      toast.success("Marked as watched");
    } catch (err) {
      console.error(err);
    }
  };

  if (!course || !currentLesson) return <div className="p-8 text-center text-white">Loading Course...</div>;

  return (
    <>
      <Helmet>
        <title>{course.title} | {currentLesson.title} - JobServe</title>
        <meta name="description" content={`Learn ${currentLesson.title} in the course ${course.title} on JobServe. Accelerate your career today.`} />
      </Helmet>
      <div className="flex flex-col md:flex-row h-screen bg-gray-900 text-white">
        {/* Sidebar */}
        <div className="w-full md:w-1/4 bg-gray-800 border-r border-gray-700 overflow-y-auto hidden md:block">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-xl font-bold text-blue-400">{course.title}</h2>
            <div className="mt-2 flex items-center text-sm font-medium text-red-400">
              <span className="relative flex h-3 w-3 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              {liveViewers} Live Watching
            </div>
          </div>
          <div>
          {course.modules.map(module => (
            <div key={module._id} className="mb-4">
              <h3 className="bg-gray-700 px-4 py-2 font-semibold text-sm uppercase tracking-wider">{module.title}</h3>
              <ul>
                {module.lessons.map(lesson => {
                  const isWatched = watchedLessons.includes(lesson._id);
                  const isCurrent = currentLesson._id === lesson._id;
                  return (
                    <li 
                      key={lesson._id}
                      onClick={() => setCurrentLesson(lesson)}
                      className={`flex items-center px-4 py-3 cursor-pointer hover:bg-gray-600 transition-colors ${isCurrent ? 'bg-blue-900/30 border-l-4 border-blue-500' : ''}`}
                    >
                      <button onClick={(e) => { e.stopPropagation(); markAsWatched(lesson._id); }} className="mr-3 text-lg focus:outline-none">
                        {isWatched ? <FiCheckCircle className="text-green-500" /> : <FiCircle className="text-gray-400" />}
                      </button>
                      <span className={`text-sm ${isCurrent ? 'font-semibold text-white' : 'text-gray-300'}`}>{lesson.title}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full md:w-3/4 flex flex-col h-full overflow-y-auto">
        <div className="p-4 flex-shrink-0 bg-black">
          <VideoPlayerWithQuiz 
            lesson={currentLesson} 
            onVideoEnd={() => markAsWatched(currentLesson._id)} 
          />
        </div>

        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold mb-6">{currentLesson.title}</h1>
          
          <div className="flex space-x-6 border-b border-gray-700 mb-6">
            <button 
              className={`pb-2 text-lg font-medium transition-colors ${activeTab === 'doubts' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setActiveTab('doubts')}
            >
              Doubt Discussion
            </button>
            <button 
              className={`pb-2 text-lg font-medium transition-colors ${activeTab === 'resources' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setActiveTab('resources')}
            >
              Downloads & Resources
            </button>
          </div>

          <div>
            {activeTab === 'doubts' && <DoubtForum lessonId={currentLesson._id} />}
            {activeTab === 'resources' && <LessonResources resources={currentLesson.resources} />}
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default CoursePlayer;
