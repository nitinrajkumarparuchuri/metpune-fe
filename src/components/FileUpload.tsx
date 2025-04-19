
import React, { useState } from 'react';
import { Upload, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const FileUpload = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpload = () => {
    setIsLoading(true);
    // Simulate file processing
    setTimeout(() => {
      setIsLoading(false);
      navigate('/dashboard');
    }, 2000);
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
      {!isLoading ? (
        <>
          <Upload size={48} className="text-gray-400" />
          <h3 className="text-lg font-semibold">Upload Hackathon Files</h3>
          <p className="text-gray-500 text-center max-w-sm">
            Drag and drop your files here, or click to select files
          </p>
          <Button onClick={handleUpload} className="bg-purple-600 hover:bg-purple-700">
            Select Files
          </Button>
        </>
      ) : (
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin">
            <Upload size={48} className="text-purple-600" />
          </div>
          <p className="text-purple-600 font-semibold">Processing files...</p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
