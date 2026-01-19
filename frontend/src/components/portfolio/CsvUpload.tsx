import React, { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';

interface CsvUploadProps {
    onUpload: (csv: string) => Promise<{ success: boolean; message: string; imported?: number; errors?: string[] }>;
}

const CsvUpload: React.FC<CsvUploadProps> = ({ onUpload }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState<{ imported: number; errors: string[] } | null>(null);
    const [fileName, setFileName] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        setError('');
        setResult(null);

        // Validate file type
        if (!file.name.endsWith('.csv')) {
            setError('Please upload a CSV file');
            return;
        }

        // Read file content
        const reader = new FileReader();
        reader.onload = async (event) => {
            const csv = event.target?.result as string;
            if (!csv) {
                setError('Failed to read file');
                return;
            }

            setLoading(true);
            try {
                const response = await onUpload(csv);
                if (response.success) {
                    setResult({
                        imported: response.imported || 0,
                        errors: response.errors || []
                    });
                } else {
                    setError(response.message);
                    if (response.errors && response.errors.length > 0) {
                        setResult({ imported: 0, errors: response.errors });
                    }
                }
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to upload CSV');
            } finally {
                setLoading(false);
            }
        };
        reader.readAsText(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const file = e.dataTransfer.files?.[0];
        if (file && fileInputRef.current) {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            fileInputRef.current.files = dataTransfer.files;
            fileInputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
        }
    };

    const resetUpload = () => {
        setFileName('');
        setError('');
        setResult(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="csv-upload-card">
            <div className="card-header">
                <Upload size={20} />
                <h3>Upload CSV</h3>
            </div>

            <div
                className={`dropzone ${loading ? 'loading' : ''}`}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                />

                {loading ? (
                    <div className="dropzone-content">
                        <div className="spinner"></div>
                        <p>Processing CSV...</p>
                    </div>
                ) : fileName ? (
                    <div className="dropzone-content">
                        <FileText size={32} className="text-primary" />
                        <p>{fileName}</p>
                    </div>
                ) : (
                    <div className="dropzone-content">
                        <Upload size={32} className="text-muted" />
                        <p>Drag & drop CSV file here</p>
                        <span>or click to browse</span>
                    </div>
                )}
            </div>

            <div className="csv-format-hint">
                <strong>CSV Format:</strong> isin, asset_type, quantity
                <br />
                <code>INE002A01018,EQUITY,100</code>
            </div>

            {error && (
                <div className="alert alert-error">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                </div>
            )}

            {result && (
                <div className={`alert ${result.imported > 0 ? 'alert-success' : 'alert-warning'}`}>
                    <CheckCircle size={16} />
                    <div>
                        <p><strong>{result.imported} holdings imported successfully</strong></p>
                        {result.errors.length > 0 && (
                            <ul className="error-list">
                                {result.errors.slice(0, 5).map((err, i) => (
                                    <li key={i}>{err}</li>
                                ))}
                                {result.errors.length > 5 && (
                                    <li>...and {result.errors.length - 5} more issues</li>
                                )}
                            </ul>
                        )}
                    </div>
                </div>
            )}

            {(fileName || result) && (
                <button className="btn btn-secondary" onClick={resetUpload}>
                    Upload Another File
                </button>
            )}
        </div>
    );
};

export default CsvUpload;
