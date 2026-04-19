import { useState, useEffect } from 'react';
import LiveMap from './components/LiveMap';
import AlertBanner from './components/AlertBanner';
import AudioPlayer from './components/AudioPlayer';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

function App() {
  const [alertData, setAlertData] = useState(null);

  useEffect(() => {
    // For demo purposes, automatically listening to all or specific test ID
    // In production, context/URL params dictate the device ID
    const urlParams = new URLSearchParams(window.location.search);
    const deviceId = urlParams.get('id') || 'test_device';

    socket.emit('join_alert_room', deviceId);

    socket.on('location_update', (data) => {
      console.log('Received location update', data);
      setAlertData(data);
    });

    return () => {
      socket.off('location_update');
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans p-6">
      <div className="max-w-5xl mx-auto">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-red-500 tracking-wider">SilentSOS <span className="text-gray-400 font-light ml-2">Monitor</span></h1>
          <div className="text-sm text-gray-400">
            Status: {alertData ? <span className="text-green-500">Live Connection</span> : <span className="text-yellow-500">Waiting for Signal...</span>}
          </div>
        </header>

        {alertData && <AlertBanner timestamp={alertData.timestamp} />}

        <div className="bg-gray-800 rounded-xl p-4 shadow-2xl border border-gray-700 mt-6">
          <LiveMap locationData={alertData} />
        </div>

        {alertData && (
          <div className="mt-6">
            <AudioPlayer audioUrl={`https://mock-s3-bucket.s3.amazonaws.com/audio_${alertData.alertId}_${alertData.timestamp}.txt`} />
          </div>
        )}
        
        {!alertData && (
          <div className="mt-20 text-center animate-pulse text-gray-500">
            <p className="text-xl">Standby mode</p>
            <p className="text-sm mt-2">Waiting for emergency dispatch events...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
