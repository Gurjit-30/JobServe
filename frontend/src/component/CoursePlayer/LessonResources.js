import React from 'react';
import { FiDownload, FiExternalLink, FiFileText, FiGithub } from 'react-icons/fi';

const LessonResources = ({ resources }) => {
  if (!resources || resources.length === 0) {
    return <div className="text-gray-400 py-8 text-center bg-gray-800 rounded-xl border border-gray-700">No resources available for this lesson.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {resources.map((res, idx) => {
        let Icon = FiFileText;
        let colorClass = "text-blue-400 bg-blue-400/10 border-blue-400/20";
        if (res.type === 'pdf') {
          Icon = FiDownload;
          colorClass = "text-red-400 bg-red-400/10 border-red-400/20";
        } else if (res.type === 'github') {
          Icon = FiGithub;
          colorClass = "text-gray-200 bg-gray-600/30 border-gray-500/30";
        }

        return (
          <a 
            key={idx} 
            href={res.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className={`flex items-center p-5 rounded-xl border transition-all hover:-translate-y-1 hover:shadow-lg ${colorClass}`}
          >
            <div className="p-3 rounded-lg bg-black/20 mr-4">
              <Icon className="text-2xl" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-lg text-white group-hover:text-current transition-colors">{res.title}</h4>
              <p className="text-sm opacity-80 mt-1 capitalize">{res.type} Resource</p>
            </div>
            <FiExternalLink className="opacity-50 text-xl" />
          </a>
        );
      })}
    </div>
  );
};

export default LessonResources;
