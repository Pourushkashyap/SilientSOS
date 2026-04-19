import { useState } from 'react';

export default function AudioPlayer({ audioUrl }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [decryptionKey, setDecryptionKey] = useState('');

  // NOTE: This assumes the audio URL returns the raw base64 string or the decrypted stream directly.
  // In a real implementation this might fetch a blob, decipher it using the key.

  const handlePlay = () => {
    if (!decryptionKey) {
      alert("Please enter the decryption key (Device ID) to play evidence.");
      return;
    }
    // Mocking the browser decipher and playback mechanism
    setIsPlaying(true);
    setTimeout(() => setIsPlaying(false), 5000); // Stop after 5s mock
  };

  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-md">
      <h3 className="text-xl font-semibold mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path></svg>
        Encrypted Audio Evidence
      </h3>
      
      <div className="flex gap-4 items-center">
        <input 
          type="password" 
          placeholder="Enter Decryption Key" 
          value={decryptionKey}
          onChange={(e) => setDecryptionKey(e.target.value)}
          className="flex-1 bg-gray-900 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500"
        />
        
        <button 
          onClick={handlePlay}
          className={`px-6 py-2 rounded font-bold transition-colors ${isPlaying ? 'bg-green-600 hover:bg-green-500' : 'bg-blue-600 hover:bg-blue-500'}`}
        >
          {isPlaying ? 'Playing...' : 'Decrypt & Play'}
        </button>
      </div>
      
      <p className="text-xs text-gray-500 mt-4">
        * Audio consists of the 30-second context recording captured directly after the threat algorithm triggered.
      </p>
    </div>
  );
}
