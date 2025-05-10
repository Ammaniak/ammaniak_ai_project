import React, { useState, useRef } from "react";

interface UploadWindowProps {
  onFileUpload: (file: File) => void;
}

const UploadWindow: React.FC<UploadWindowProps> = ({ onFileUpload }) => {
  const [dragActive, setDragActive] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file && (file.type.includes("audio") || file.type.includes("video"))) {
      setSelectedFile(file);
      onFileUpload(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type.includes("audio") || file.type.includes("video"))) {
      setSelectedFile(file);
      onFileUpload(file);
    }
  };

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <div
      className={`
        w-full min-h-[300px] p-8
        border-3 border-dashed rounded-xl
        flex items-center justify-center
        transition-all duration-300 ease-in-out
        ${
          dragActive
            ? "border-lightBlue bg-lightBlue/10"
            : "border-mustard bg-white"
        }
        shadow-lg hover:shadow-xl
      `}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept="audio/*,video/*"
        onChange={handleChange}
        className="hidden"
      />

      <div className="flex flex-col items-center gap-4 text-center">
        <h3 className="text-2xl font-semibold text-gray-800">
          Upload Audio or Video File
        </h3>
        <p className="text-gray-600">
          Drag and drop your file here or click to browse
        </p>

        <button
          onClick={handleButtonClick}
          className="px-6 py-3 bg-mustard text-gray-800 rounded-lg font-medium
            transition-all duration-200 hover:bg-lightBlue hover:text-white hover:bg-black
            hover:transform hover:-translate-y-0.5
            focus:outline-none focus:ring-2 focus:ring-lightBlue"
        >
          Choose File
        </button>

        {selectedFile && (
          <p className="mt-4 px-4 py-2 text-sm text-lightBlue bg-lightBlue/10 rounded-md">
            Selected: {selectedFile.name}
          </p>
        )}
      </div>
    </div>
  );
};

export default UploadWindow;
