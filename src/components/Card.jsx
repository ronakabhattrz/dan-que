import React from 'react';
import '../index.css';

const Card = ({ children, className = '', hover = true, ...props }) => {
    return (
        <div
            className={`glass-card ${!hover ? 'no-hover' : ''} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
