import { useState, useRef } from 'react';

export default function OnboardingStep3({ onComplete, onBack }) {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  const documentTypes = [
    { value: 'business_license', label: 'Business License', required: true },
    { value: 'tax_id_document', label: 'Tax ID Document (EIN/SSN)', required: true },
    { value: 'bank_statements', label: 'Recent Bank Statements (3 months)', required: true },
    { value: 'previous_tax_returns', label: 'Previous Tax Returns (2 years)', required: false },
    { value: 'chart_of_accounts', label: 'Chart of Accounts', required: false },
    { value: 'invoices', label: 'Sample Invoices', required: false },
    { value: 'receipts', label: 'Sample Receipts', required: false },
    { value: 'payroll_records', label: 'Payroll Records', required: false },
    { value: 'other', label: 'Other Documents', required: false }
  ];

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      const maxSize = 10 * 1024 * 1024; // 10MB
      
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          fileType: 'Only PDF, JPEG, and PNG files are allowed'
        }));
        return false;
      }
      
      if (file.size > maxSize) {
        setErrors(prev => ({
          ...prev,
          fileSize: 'File size must be less than 10MB'
        }));
        return false;
      }
      
      return true;
    });

    if (validFiles.length > 0) {
      setErrors({});
      uploadFiles(validFiles);
    }
  };

  const uploadFiles = async (files) => {
    setUploading(true);
    
    try {
      // For demo purposes, simulate file upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const results = files.map((file) => ({
        id: Date.now() + Math.random(),
        name: file.name,
        type: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        documentType: 'other'
      }));
      
      setUploadedFiles(prev => [...prev, ...results]);
      console.log('Files uploaded (demo):', results);
    } catch (error) {
      console.error('Error uploading files:', error);
      setErrors({ upload: 'Failed to upload files. Please try again.' });
    } finally {
      setUploading(false);
    }
  };

  const handleDocumentTypeChange = async (fileId, newType) => {
    try {
      // In a real implementation, you'd update the document type via API
      setUploadedFiles(prev => 
        prev.map(file => 
          file.id === fileId ? { ...file, documentType: newType } : file
        )
      );
    } catch (error) {
      console.error('Error updating document type:', error);
    }
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleContinue = () => {
    // Check if required documents are uploaded
    const requiredTypes = documentTypes.filter(doc => doc.required).map(doc => doc.value);
    const uploadedTypes = uploadedFiles.map(file => file.documentType);
    
    const missingRequired = requiredTypes.filter(type => !uploadedTypes.includes(type));
    
    if (missingRequired.length > 0) {
      setErrors({ 
        required: `Please upload the following required documents: ${missingRequired.join(', ')}` 
      });
      return;
    }

    onComplete({ uploadedFiles });
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Document Upload
        </h2>
        <p className="text-gray-600 mb-4">
          Please upload the required documents to complete your onboarding. You can upload multiple files at once.
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h4 className="text-sm font-medium text-blue-800 mb-2">💡 Upload Tips:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Supported formats: PDF, JPG, PNG (Max 10MB per file)</li>
            <li>• You can drag and drop files or click to browse</li>
            <li>• Upload multiple files at once for faster completion</li>
            <li>• Make sure documents are clear and readable</li>
          </ul>
        </div>
      </div>

      {/* Required Documents List */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Required Documents</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {documentTypes.filter(doc => doc.required).map(doc => (
            <div key={doc.value} className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-yellow-800">{doc.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* File Upload Area */}
      <div className="mb-8">
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          {uploading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-4"></div>
              <p className="text-gray-600">Uploading files...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <svg className="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-lg font-medium text-gray-900 mb-2">Upload Documents</p>
              <p className="text-gray-600">Click to select files or drag and drop</p>
              <p className="text-sm text-gray-500 mt-2">PDF, JPEG, PNG up to 10MB each</p>
            </div>
          )}
        </div>
      </div>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Uploaded Files</h3>
          <div className="space-y-3">
            {uploadedFiles.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <svg className="h-8 w-8 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <select
                    value={file.documentType || 'other'}
                    onChange={(e) => handleDocumentTypeChange(file.id, e.target.value)}
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                  >
                    {documentTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                  
                  <button
                    onClick={() => removeFile(file.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Messages */}
      {errors.fileType && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{errors.fileType}</p>
        </div>
      )}
      
      {errors.fileSize && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{errors.fileSize}</p>
        </div>
      )}
      
      {errors.upload && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{errors.upload}</p>
        </div>
      )}
      
      {errors.required && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{errors.required}</p>
        </div>
      )}

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          Back
        </button>
        <button
          onClick={handleContinue}
          disabled={uploadedFiles.length === 0}
          className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  );
}