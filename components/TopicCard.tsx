
import React from 'react';
import { TopicConfig } from '../types';

interface TopicCardProps {
  topic: TopicConfig;
  selected: boolean;
  mastery?: number; // 0 to 100
  onSelect: (topic: TopicConfig) => void;
}

const TopicCard: React.FC<TopicCardProps> = ({ topic, selected, mastery = 0, onSelect }) => {
  return (
    <button
      onClick={() => onSelect(topic)}
      className={`p-5 rounded-3xl border-2 transition-all text-left flex flex-col gap-3 h-full relative group ${
        selected 
          ? 'border-pink-500 bg-white shadow-xl ring-4 ring-pink-50' 
          : 'border-slate-100 bg-white hover:border-pink-200 hover:shadow-md'
      }`}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-3xl filter group-hover:scale-110 transition-transform">{topic.icon}</span>
          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${topic.paper === 'S1' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
            {topic.paper}
          </span>
        </div>
        {mastery > 0 && (
          <div className="px-2 py-1 rounded-lg text-[9px] font-black text-emerald-600 bg-emerald-50">
            {mastery}% MASTERY
          </div>
        )}
      </div>
      
      <div>
        <h3 className="font-black text-slate-800 text-sm leading-tight group-hover:text-pink-600 transition-colors uppercase tracking-tight">{topic.id.split(': ')[1]}</h3>
        <p className="text-[10px] text-slate-400 mt-1 line-clamp-1 font-medium">{topic.description}</p>
      </div>
      
      <div className="mt-auto pt-3 flex flex-wrap gap-1">
        <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Syllabus Checkpoints: {topic.syllabusObjectives.length}</span>
      </div>

      {/* Progress Bar */}
      <div className="mt-2 w-full h-1 bg-slate-50 rounded-full overflow-hidden">
        <div 
          className="h-full bg-pink-500 transition-all duration-700 ease-out" 
          style={{ width: `${mastery}%` }}
        />
      </div>
    </button>
  );
};

export default TopicCard;
