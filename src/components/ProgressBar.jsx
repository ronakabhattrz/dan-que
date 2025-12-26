import React from 'react';
import '../index.css';

const ProgressBar = ({ progress, showLabel = true }) => {
    return (
        <div className="mb-lg">
            {showLabel && (
                <div className="flex justify-between mb-sm">
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Progress</span>
                    <span className="text-sm font-weight-600" style={{ color: 'var(--primary-400)' }}>
                        {Math.round(progress)}%
                    </span>
                </div>
            )}
            <div className="progress-bar">
                <div
                    className="progress-bar-fill"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
};

export default ProgressBar;
