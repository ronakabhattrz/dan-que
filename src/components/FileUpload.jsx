import React, { useState, useRef } from 'react';
import '../index.css';

const FileUpload = ({ onFileSelect, accept = '*', multiple = false, label = 'Upload File' }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const fileInputRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        handleFiles(files);
    };

    const handleFileInput = (e) => {
        const files = Array.from(e.target.files);
        handleFiles(files);
    };

    const handleFiles = (files) => {
        setSelectedFiles(files);
        if (onFileSelect) {
            onFileSelect(files);
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div>
            <div
                className={`file-upload ${isDragging ? 'drag-over' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleClick}
            >
                <div className="file-upload-icon">📁</div>
                <p style={{ color: 'var(--text-primary)', marginBottom: 'var(--spacing-sm)' }}>
                    {selectedFiles.length > 0
                        ? `${selectedFiles.length} file(s) selected`
                        : label
                    }
                </p>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                    Drag and drop or click to browse
                </p>
                {selectedFiles.length > 0 && (
                    <div style={{ marginTop: 'var(--spacing-md)' }}>
                        {selectedFiles.map((file, index) => (
                            <div key={index} style={{
                                color: 'var(--text-secondary)',
                                fontSize: '0.875rem',
                                marginTop: 'var(--spacing-xs)'
                            }}>
                                {file.name}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                multiple={multiple}
                onChange={handleFileInput}
                style={{ display: 'none' }}
            />
        </div>
    );
};

export default FileUpload;
