
import React from 'react';

interface ApiKeySelectorProps {
  onApiKeySelected: () => void;
  onReset: () => void;
}

const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({ onApiKeySelected, onReset }) => {
  const handleSelectKey = async () => {
    try {
      if (window.aistudio) {
        await window.aistudio.openSelectKey();
        // Assume success and proceed to the app to avoid race conditions.
        onApiKeySelected();
      } else {
        // Fallback for environments where aistudio is not available
        console.error("aistudio context is not available.");
        alert("API Key selection is not available in this environment.");
      }
    } catch (e) {
      console.error("Failed to open API key selection dialog", e);
    }
  };

  return (
    <div className="max-w-3xl mx-auto text-center mt-12 flex flex-col items-center">
      <div className="w-16 h-16 bg-gradient-to-r from-[#D4AF37] to-[#F1C40F] rounded-full flex items-center justify-center text-[#050505] font-bold text-3xl font-display mb-6">
        A
      </div>
      <h2 className="text-4xl font-bold font-display gold-gradient-text mb-4">API Key Required</h2>
      <p className="text-lg text-[#aaaaaa] mb-8 max-w-2xl">
        To access the advanced AI models for architectural analysis and image generation, AURADECOR.ai requires you to select a personal Google AI API key from a paid GCP project.
      </p>
      <p className="text-sm text-[#888888] mb-8">
        Your key is stored securely and used only for your design sessions. For more information on billing, please visit the{' '}
        <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#D4AF37]">
          official documentation
        </a>.
      </p>
      
      <button
        onClick={handleSelectKey}
        className="w-full max-w-xs inline-flex items-center justify-center px-4 py-3 border border-transparent text-base font-semibold rounded-full shadow-sm text-black bg-gradient-to-r from-[#D4AF37] to-[#F1C40F] hover:shadow-[0_5px_20px_rgba(212,175,55,0.4)] transform hover:-translate-y-0.5 transition-all"
      >
        Select API Key
      </button>

      <button
        onClick={onReset}
        className="mt-4 text-sm text-[#aaaaaa] hover:text-[#D4AF37] underline transition-colors"
      >
        Go back
      </button>
    </div>
  );
};

export default ApiKeySelector;
