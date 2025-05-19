import React, { useState } from "react";
import axios from "axios";

function FileLoader() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle"); // 'idle' | 'uploading' | 'success' | 'error'
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleFileUpload = async () => {
    if (!file) return;

    setStatus("uploading");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("https://httpbin.org/post ", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          setUploadProgress(progress);
        },
      });

      console.log("Upload response:", response.data);
      setStatus("success");
    } catch (error) {
      console.error("Upload failed:", error);
      setStatus("error");
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-md max-w-md mx-auto">
      <label
        htmlFor="paySlip"
        className="block text-sm font-medium text-gray-900"
      >
        <span className="text-red-700 mr-1">*</span>
        Upload Pay Slip
      </label>

      <input
        type="file"
        id="paySlip"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                   file:rounded file:border-0
                   file:text-sm file:font-semibold
                   file:bg-gray-200 file:text-gray-700
                   hover:file:bg-gray-300"
      />

      {/* Display file details */}
      {file && (
        <div className="mt-2 space-y-1 text-sm text-gray-600">
          <p>File Name: {file.name}</p>
          <p>Size: {(file.size / 1024).toFixed(2)} KB</p>
          <p>Type: {file.type || "N/A"}</p>
        </div>
      )}

      {/* Upload button */}
      {file && status !== "uploading" && (
        <button
          onClick={handleFileUpload}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Upload
        </button>
      )}

      {/* Progress bar during upload */}
      {status === "uploading" && (
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-1">{uploadProgress}% uploaded</p>
        </div>
      )}

      {/* Success message */}
      {status === "success" && (
        <p className="text-sm text-green-600">File uploaded successfully!</p>
      )}

      {/* Error message */}
      {status === "error" && (
        <p className="text-sm text-red-600">
          Upload failed. Please try again.
        </p>
      )}
    </div>
  );
}

export default FileLoader;