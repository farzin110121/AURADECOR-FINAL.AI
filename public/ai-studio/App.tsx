
import React, { useState, useCallback, useEffect } from 'react';
import { AppState, Room, FloorplanAnalysis } from './types';
import { analyzeFloorplan } from './services/geminiService';
import { fileToBase64 } from './utils/fileUtils';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import RoomSelector from './components/RoomSelector';
import DesignStudio from './components/DesignStudio';
import Loader from './components/Loader';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.UPLOAD);
  const [analysisResult, setAnalysisResult] = useState<FloorplanAnalysis | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [floorplanImage, setFloorplanImage] = useState<string | null>(null);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token');
    if (token) {
      setAuthToken(token);
    } else {
        setError("Authentication token not found. Please launch the studio from your dashboard.");
    }
  }, []);

  const handleFileUpload = useCallback(async (file: File) => {
    if (!authToken) {
        setError("Cannot upload: Authentication token is missing.");
        return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const base64Image = await fileToBase64(file);
      setFloorplanImage(base64Image);
      const result = await analyzeFloorplan(base64Image);
      setAnalysisResult(result);
      setAppState(AppState.SELECT_ROOM);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setAppState(AppState.UPLOAD);
    } finally {
      setIsLoading(false);
    }
  }, [authToken]);

  const handleRoomSelect = useCallback((room: Room) => {
    setSelectedRoom(room);
    setAppState(AppState.DESIGN);
  }, []);

  const handleBackToRoomSelect = useCallback(() => {
    setSelectedRoom(null);
    setAppState(AppState.SELECT_ROOM);
  }, []);

  const handleReset = useCallback(() => {
    setAppState(AppState.UPLOAD);
    setAnalysisResult(null);
    setSelectedRoom(null);
    setError(authToken ? null : "Authentication token not found. Please launch the studio from your dashboard.");
    setIsLoading(false);
    setFloorplanImage(null);
  }, [authToken]);
  
  const renderContent = () => {
    if (isLoading) {
        let message = "Loading...";
        if (appState === AppState.UPLOAD) message = "Analyzing your floorplan...";
        return <Loader message={message} />;
    }

    switch (appState) {
      case AppState.UPLOAD:
        return <FileUpload onFileUpload={handleFileUpload} error={error} />;
      case AppState.SELECT_ROOM:
        if (analysisResult) {
          return <RoomSelector rooms={analysisResult.rooms} onSelectRoom={handleRoomSelect} onReset={handleReset} />;
        }
        handleReset();
        return null;
      case AppState.DESIGN:
        if (selectedRoom && analysisResult && authToken && floorplanImage) {
          return <DesignStudio 
                    room={selectedRoom} 
                    onBack={handleBackToRoomSelect}
                    authToken={authToken}
                    floorplanImage={floorplanImage}
                    analysisResult={analysisResult}
                 />;
        }
        handleBackToRoomSelect();
        return null;
      default:
        return <FileUpload onFileUpload={handleFileUpload} error={error} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#050505]">
      <Header onReset={handleReset} />
      <main className="container mx-auto px-4 py-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
