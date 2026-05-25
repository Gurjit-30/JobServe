import React, { useState } from 'react';
import { FiChevronDown, FiChevronRight, FiPlayCircle, FiFileText, FiFolder, FiCheckCircle } from 'react-icons/fi';

const COURSE_MODULES = [
  {
    id: 'dsa',
    title: 'Data Structures & Algorithms',
    icon: <FiFolder className="w-5 h-5" />,
    modules: [
      {
        id: 'trees',
        title: 'Trees',
        lessons: [
          { id: 'video1', title: 'Introduction to Binary Trees', type: 'video', duration: '12:45', completed: true },
          { id: 'video2', title: 'Tree Traversals (Inorder, Preorder)', type: 'video', duration: '24:10', completed: false },
          { id: 'reading1', title: 'Self-Balancing Trees Overview', type: 'reading', duration: '10 min', completed: false },
        ]
      },
      {
        id: 'graphs',
        title: 'Graphs',
        lessons: [
          { id: 'video3', title: 'Graph Representations', type: 'video', duration: '18:20', completed: false },
          { id: 'video4', title: 'BFS and DFS', type: 'video', duration: '35:00', completed: false },
        ]
      }
    ]
  },
  {
    id: 'system_design',
    title: 'System Design',
    icon: <FiFolder className="w-5 h-5" />,
    modules: [
      {
        id: 'scalability',
        title: 'Scalability Fundamentals',
        lessons: [
          { id: 'video5', title: 'Vertical vs Horizontal Scaling', type: 'video', duration: '15:30', completed: true },
          { id: 'video6', title: 'Load Balancing Strategies', type: 'video', duration: '22:15', completed: false },
        ]
      }
    ]
  }
];

export default function CourseDashboard() {
  // State for tracking which categories (e.g., 'DSA') are expanded
  const [expandedCategories, setExpandedCategories] = useState({ dsa: true });
  
  // State for tracking which modules (e.g., 'Trees') are expanded
  const [expandedModules, setExpandedModules] = useState({ trees: true });
  
  // State for the currently selected lesson
  const [activeLesson, setActiveLesson] = useState(COURSE_MODULES[0].modules[0].lessons[0]);

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const selectLesson = (lesson) => {
    setActiveLesson(lesson);
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] gap-6 animate-fade-in">
      
      {/* Sidebar Navigation */}
      <aside className="w-80 flex-shrink-0 glass-card gradient-border overflow-y-auto hidden md:flex flex-col rounded-2xl custom-scrollbar">
        <div className="p-5 border-b border-white/5 sticky top-0 glass-card z-10">
          <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
            Course Curriculum
          </h2>
          <p className="text-xs text-gray-400 mt-1">Track your learning progress</p>
        </div>
        
        <div className="p-4 flex flex-col gap-2">
          {COURSE_MODULES.map(category => {
            const isCategoryExpanded = expandedCategories[category.id];
            
            return (
              <div key={category.id} className="flex flex-col">
                {/* Category Header */}
                <button 
                  onClick={() => toggleCategory(category.id)}
                  className={`flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${isCategoryExpanded ? 'bg-white/5' : 'hover:bg-white/5'}`}
                >
                  <div className="flex items-center gap-3 text-gray-200 font-semibold text-sm">
                    <span className="text-emerald-500">{category.icon}</span>
                    {category.title}
                  </div>
                  <span className="text-gray-400 transition-transform duration-300">
                    {isCategoryExpanded ? <FiChevronDown /> : <FiChevronRight />}
                  </span>
                </button>

                {/* Modules List */}
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isCategoryExpanded ? 'max-h-[1000px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                  {category.modules.map(module => {
                    const isModuleExpanded = expandedModules[module.id];
                    
                    return (
                      <div key={module.id} className="ml-4 pl-4 border-l border-white/10 flex flex-col gap-1 mb-2">
                        {/* Module Header */}
                        <button 
                          onClick={() => toggleModule(module.id)}
                          className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/5 transition-colors text-left"
                        >
                          <span className="text-sm font-medium text-gray-300">{module.title}</span>
                          <span className="text-gray-500 text-xs">
                            {isModuleExpanded ? <FiChevronDown /> : <FiChevronRight />}
                          </span>
                        </button>

                        {/* Lessons List */}
                        <div className={`flex flex-col gap-1 overflow-hidden transition-all duration-300 ${isModuleExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                          {module.lessons.map(lesson => {
                            const isActive = activeLesson?.id === lesson.id;
                            
                            return (
                              <button
                                key={lesson.id}
                                onClick={() => selectLesson(lesson)}
                                className={`flex items-start gap-3 p-2 ml-2 rounded-lg text-left transition-all duration-200 group ${
                                  isActive 
                                    ? 'bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                                    : 'hover:bg-white/5 border border-transparent'
                                }`}
                              >
                                <div className={`mt-0.5 ${isActive ? 'text-emerald-400' : 'text-gray-500 group-hover:text-emerald-400/70'}`}>
                                  {lesson.completed ? (
                                    <FiCheckCircle className="text-emerald-500" />
                                  ) : lesson.type === 'video' ? (
                                    <FiPlayCircle />
                                  ) : (
                                    <FiFileText />
                                  )}
                                </div>
                                <div className="flex flex-col w-full">
                                  <span className={`text-xs font-medium leading-tight ${isActive ? 'text-emerald-300' : 'text-gray-400 group-hover:text-gray-300'}`}>
                                    {lesson.title}
                                  </span>
                                  <span className="text-[10px] text-gray-600 font-semibold mt-1">
                                    {lesson.type.toUpperCase()} • {lesson.duration}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 glass-card gradient-border rounded-2xl flex flex-col relative overflow-hidden">
        {activeLesson ? (
          <>
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20 backdrop-blur-md">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-500/80 uppercase tracking-wider mb-2">
                  <span>{activeLesson.type}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                  <span>{activeLesson.duration}</span>
                </div>
                <h1 className="text-2xl font-black text-gray-100">{activeLesson.title}</h1>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-lg font-semibold transition-all text-sm shadow-lg shadow-emerald-500/5">
                <FiCheckCircle /> Mark Complete
              </button>
            </div>

            {/* Video / Content Viewer Area */}
            <div className="flex-1 p-6 flex flex-col items-center justify-center bg-[#0a0a0a] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 via-[#0a0a0a] to-black">
              {activeLesson.type === 'video' ? (
                <div className="w-full max-w-4xl aspect-video rounded-2xl border border-white/10 bg-black shadow-2xl flex flex-col items-center justify-center group cursor-pointer hover:border-emerald-500/30 transition-all overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 z-0"></div>
                  <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center backdrop-blur-md border border-emerald-500/40 group-hover:scale-110 group-hover:bg-emerald-500/30 transition-all duration-300 z-10 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                    <FiPlayCircle className="w-10 h-10 text-emerald-400 ml-1" />
                  </div>
                  <p className="mt-6 text-gray-400 font-medium z-10 group-hover:text-gray-300 transition-colors">Click to play {activeLesson.title}</p>
                </div>
              ) : (
                <div className="w-full max-w-3xl glass-card p-10 rounded-2xl prose prose-invert">
                  <h2 className="text-xl text-gray-200 font-bold mb-4">Reading Material</h2>
                  <p className="text-gray-400 leading-relaxed">
                    This is placeholder content for the reading assignment. In a complete application, this area would render markdown, rich text, or embed a PDF viewer.
                  </p>
                  <p className="text-gray-400 leading-relaxed mt-4">
                    Take your time to understand the concepts presented in this section before marking it as complete.
                  </p>
                </div>
              )}
            </div>
            
            {/* Notes / Discussion Tabs (Mock) */}
            <div className="h-48 border-t border-white/5 bg-gray-900/50 p-4">
               <div className="flex items-center gap-6 border-b border-white/5 px-2 pb-2 mb-4">
                 <button className="text-emerald-400 text-sm font-bold border-b-2 border-emerald-400 pb-2 -mb-[10px]">My Notes</button>
                 <button className="text-gray-500 hover:text-gray-300 text-sm font-bold pb-2 transition-colors">Discussion (24)</button>
                 <button className="text-gray-500 hover:text-gray-300 text-sm font-bold pb-2 transition-colors">Resources</button>
               </div>
               <textarea 
                 placeholder="Take notes while learning..." 
                 className="w-full h-24 bg-black/40 border border-white/5 rounded-xl p-3 text-sm text-gray-300 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 resize-none custom-scrollbar"
               ></textarea>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <FiFolder className="w-16 h-16 mb-4 opacity-20" />
            <p>Select a lesson from the sidebar to begin.</p>
          </div>
        )}
      </main>

    </div>
  );
}
