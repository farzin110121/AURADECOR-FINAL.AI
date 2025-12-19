
import React, { useCallback, useState } from 'react';
import UploadIcon from './icons/UploadIcon';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  error: string | null;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, error }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  }, [onFileUpload]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-3xl mx-auto text-center mt-12">
      <h2 className="text-4xl font-bold font-display gold-gradient-text mb-4">Upload Your Floorplan</h2>
      <p className="text-lg text-[#aaaaaa] mb-8">Let our AI analyze your space. Drag and drop or select a file to begin.</p>
      
      <div 
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`p-10 border-2 border-dashed rounded-xl transition-colors duration-300 ${dragActive ? 'border-[#D4AF37] bg-[rgba(212,175,55,0.1)]' : 'border-[rgba(212,175,55,0.25)] bg-[rgba(255,255,255,0.03)]'}`}
      >
        <input type="file" id="file-upload" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleChange} />
        <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center space-y-4">
          <UploadIcon className="w-16 h-16 text-[#aaaaaa]" />
          <p className="text-[#ffffff]">
            <span className="font-semibold text-[#D4AF37]">Click to upload</span> or drag and drop
          </p>
          <p className="text-sm text-[#aaaaaa]">PNG, JPG, or WEBP</p>
        </label>
      </div>

      {error && (
        <div className="mt-6 p-4 bg-red-900/50 border border-red-500/50 text-red-300 rounded-lg">
          <p><span className="font-bold">Error:</span> {error}</p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
