import { useEffect, useState } from 'react';

export default function AlertBanner({ timestamp }) {
  // Simple time formatting
  const timeString = new Date(timestamp).toLocaleTimeString();
  
  return (
    <div className="bg-red-600/20 border-l-4 border-red-600 px-6 py-4 rounded-r-lg shadow-lg">
      <div className="flex items-center">
        <svg className="w-8 h-8 text-red-500 mr-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        <div>
          <h2 className="text-red-500 font-bold text-xl uppercase tracking-widest">Emergency Alert Received</h2>
          <p className="text-gray-300 mt-1">
            Last seen signal at <span className="text-white font-medium">{timeString}</span>. 
            <span className="font-bold ml-2"> DO NOT CALL THE DEVICE.</span> Head directly to the location or alert authorities.
          </p>
        </div>
      </div>
    </div>
  );
}
