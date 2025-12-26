import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import Card from '../components/Card';
import Button from '../components/Button';
import FileUpload from '../components/FileUpload';
import '../index.css';

const UploadDocuments = () => {
    const navigate = useNavigate();
    const { currentProfile, addDocument, saveProfile } = useProfile();
    const [uploadedDocs, setUploadedDocs] = useState([]);

    if (!currentProfile) {
        navigate('/profile-type');
        return null;
    }

    const requiredDocs = currentProfile.type === 'personal'
        ? ['SSN', "Driver's License"]
        : ['EIN', "Driver's License", 'Business License'];

    const alreadyUploaded = ['Marriage cert.', 'Birth cert.'];

    const handleFileUpload = (docType, files) => {
        const newDoc = {
            id: Date.now().toString(),
            type: docType,
            files: files,
            uploadedAt: new Date().toISOString()
        };

        addDocument(newDoc);
        setUploadedDocs(prev => [...prev, docType]);
    };

    const handleDone = () => {
        const saved = saveProfile();
        if (saved) {
            navigate('/');
        }
    };

    const allRequiredUploaded = requiredDocs.every(doc => uploadedDocs.includes(doc));

    return (
        <div className="container container-sm" style={{
            paddingTop: 'var(--spacing-3xl)',
            paddingBottom: 'var(--spacing-3xl)'
        }}>
            <div className="fade-in">
                <h1 className="text-center mb-xl">Upload Required Docs</h1>

                <Card className="mb-lg">
                    <h2 style={{ fontSize: '1.25rem', marginBottom: 'var(--spacing-lg)' }}>
                        Required Documents
                    </h2>

                    <div style={{
                        background: 'var(--surface-glass)',
                        borderRadius: 'var(--radius-md)',
                        padding: 'var(--spacing-lg)',
                        marginBottom: 'var(--spacing-md)',
                        border: '1px solid var(--surface-glass-border)'
                    }}>
                        {requiredDocs.map((doc, index) => (
                            <div key={index} style={{
                                marginBottom: index < requiredDocs.length - 1 ? 'var(--spacing-lg)' : '0'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginBottom: 'var(--spacing-sm)'
                                }}>
                                    <span style={{
                                        color: 'var(--text-primary)',
                                        fontWeight: '600'
                                    }}>
                                        • {doc}
                                    </span>
                                    {uploadedDocs.includes(doc) && (
                                        <span className="badge badge-success">Uploaded</span>
                                    )}
                                </div>
                                {!uploadedDocs.includes(doc) && (
                                    <FileUpload
                                        label={`Upload ${doc}`}
                                        accept="image/*,.pdf"
                                        onFileSelect={(files) => handleFileUpload(doc, files)}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </Card>

                <Card className="mb-xl">
                    <h2 style={{ fontSize: '1.25rem', marginBottom: 'var(--spacing-lg)' }}>
                        Already uploaded
                    </h2>

                    <div style={{
                        background: 'var(--surface-glass)',
                        borderRadius: 'var(--radius-md)',
                        padding: 'var(--spacing-lg)',
                        border: '1px solid var(--surface-glass-border)'
                    }}>
                        {alreadyUploaded.map((doc, index) => (
                            <div key={index} style={{
                                padding: 'var(--spacing-md)',
                                background: 'var(--bg-secondary)',
                                borderRadius: 'var(--radius-md)',
                                marginBottom: index < alreadyUploaded.length - 1 ? 'var(--spacing-md)' : '0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}>
                                <div>
                                    <div style={{
                                        color: 'var(--text-primary)',
                                        fontWeight: '600',
                                        marginBottom: 'var(--spacing-xs)'
                                    }}>
                                        {doc}
                                    </div>
                                    <div style={{
                                        fontSize: '0.875rem',
                                        color: 'var(--text-secondary)'
                                    }}>
                                        Uploaded previously
                                    </div>
                                </div>
                                <span className="badge badge-success">✓</span>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-xl">
                        <Button
                            variant="primary"
                            size="lg"
                            onClick={handleDone}
                            disabled={!allRequiredUploaded}
                        >
                            DONE
                        </Button>
                    </div>
                </Card>

                {!allRequiredUploaded && (
                    <div style={{
                        padding: 'var(--spacing-md)',
                        background: 'var(--surface-glass)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--warning)'
                    }}>
                        <p style={{ fontSize: '0.875rem', color: 'var(--warning)', marginBottom: '0' }}>
                            <strong>⚠️ Please upload all required documents before proceeding.</strong>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UploadDocuments;
