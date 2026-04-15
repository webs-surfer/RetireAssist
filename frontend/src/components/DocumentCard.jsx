import { FiFileText, FiTrash2, FiCheckCircle, FiClock, FiLock } from 'react-icons/fi';

export default function DocumentCard({ doc, onDelete }) {
    const typeIcons = {
        aadhaar: '🪪',
        pan: '💳',
        pension_id: '📋',
        bank_statement: '🏦',
        life_certificate: '📜',
        other: '📄',
    };

    const typeLabels = {
        aadhaar: 'Aadhaar Card',
        pan: 'PAN Card',
        pension_id: 'Pension ID',
        bank_statement: 'Bank Statement',
        life_certificate: 'Life Certificate',
        other: 'Other Document',
    };

    const statusColors = {
        verified: 'badge-success',
        uploaded: 'badge-info',
        processing: 'badge-warning',
        rejected: 'badge-danger',
    };

    return (
        <div className="card">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/5 rounded-lg flex items-center justify-center text-lg">
                        {typeIcons[doc.documentType] || '📄'}
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-text-dark">{typeLabels[doc.documentType] || doc.documentType}</h3>
                        <p className="text-xs text-text-light flex items-center gap-1">
                            <FiLock size={10} /> {doc.fileName}
                        </p>
                    </div>
                </div>
                <span className={statusColors[doc.status] || 'badge-info'}>
                    {doc.status === 'verified' && <FiCheckCircle className="mr-1" size={12} />}
                    {doc.status}
                </span>
            </div>

            {/* Extracted Data */}
            {doc.extractedData && (
                <div className="mt-3 p-3 bg-bg rounded-lg">
                    <p className="text-xs font-semibold text-primary mb-1.5">📊 Extracted Information</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                        {doc.extractedData.name && (
                            <div><span className="text-text-light">Name:</span> <span className="font-medium">{doc.extractedData.name}</span></div>
                        )}
                        {doc.extractedData.documentNumber && (
                            <div><span className="text-text-light">Number:</span> <span className="font-medium">{doc.extractedData.documentNumber}</span></div>
                        )}
                        {doc.extractedData.dateOfBirth && (
                            <div><span className="text-text-light">DOB:</span> <span className="font-medium">{doc.extractedData.dateOfBirth}</span></div>
                        )}
                        {doc.extractedData.address && (
                            <div className="sm:col-span-2"><span className="text-text-light">Address:</span> <span className="font-medium">{doc.extractedData.address}</span></div>
                        )}
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-1 text-xs text-text-light">
                    <FiClock size={11} />
                    <span>{new Date(doc.uploadedAt).toLocaleDateString('en-IN')}</span>
                </div>
                <button
                    onClick={() => onDelete?.(doc._id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-danger bg-danger/5 rounded-lg text-xs font-semibold hover:bg-danger hover:text-white transition-all border-none cursor-pointer"
                >
                    <FiTrash2 size={13} /> Delete
                </button>
            </div>
        </div>
    );
}
