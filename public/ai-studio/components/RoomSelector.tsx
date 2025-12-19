
import React from 'react';
import { Room } from '../types';

interface RoomSelectorProps {
  rooms: Room[];
  onSelectRoom: (room: Room) => void;
  onReset: () => void;
}

const RoomSelector: React.FC<RoomSelectorProps> = ({ rooms, onSelectRoom, onReset }) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-bold font-display gold-gradient-text mb-4">Analysis Complete</h2>
        <p className="text-lg text-[#aaaaaa]">We've identified the following rooms. Select one to start designing.</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <button
            key={room.name}
            onClick={() => onSelectRoom(room)}
            className="p-6 bg-[rgba(255,255,255,0.03)] border border-[rgba(212,175,55,0.25)] rounded-xl hover:border-[#D4AF37] hover:shadow-[0_10px_30px_rgba(212,175,55,0.2)] hover:-translate-y-1 transform transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D4AF37] focus:ring-offset-[#050505] text-left"
          >
            <h3 className="text-xl font-bold text-[#D4AF37] capitalize font-display">{room.name.replace('_', ' ')}</h3>
            <p className="text-[#aaaaaa] mt-1">Size: {room.size}</p>
             <p className="text-[#aaaaaa] mt-1">Entry: {room.entry} wall</p>
             {room.features && room.features.length > 0 && (
                <div className="mt-4 pt-2 border-t border-[rgba(212,175,55,0.25)]">
                    <h4 className="text-sm font-semibold text-[#dddddd]">Detected Features:</h4>
                    <ul className="text-sm text-[#aaaaaa] list-disc list-inside space-y-1">
                        {room.features.map((feature) => (
                            <li key={feature.id}>
                              <span className="font-bold text-gray-400">{feature.id}:</span> {feature.description}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
          </button>
        ))}
      </div>
      <div className="text-center mt-12">
        <button
          onClick={onReset}
          className="text-sm text-[#aaaaaa] hover:text-[#D4AF37] underline transition-colors"
        >
          Or upload a different floorplan
        </button>
      </div>
    </div>
  );
};

export default RoomSelector;
