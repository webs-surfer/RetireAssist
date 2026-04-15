import { FiClock, FiCheckCircle, FiTrash2 } from 'react-icons/fi';

export default function ReminderCard({ reminder, onComplete, onDelete }) {
    const priorityColors = {
        high: 'border-l-danger',
        medium: 'border-l-warning',
        low: 'border-l-info',
    };

    const typeLabels = {
        life_certificate: '📋 Life Certificate',
        pension_verification: '💰 Pension Verification',
        insurance_renewal: '🏥 Insurance Renewal',
        bank_update: '🏦 Bank Update',
        custom: '📌 Custom',
    };

    const isOverdue = new Date(reminder.dueDate) < new Date() && reminder.status !== 'completed';
    const dueDate = new Date(reminder.dueDate).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric'
    });

    return (
        <div className={`card border-l-4 ${priorityColors[reminder.priority] || 'border-l-info'} ${reminder.status === 'completed' ? 'opacity-60' : ''}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs">{typeLabels[reminder.type] || '📌'}</span>
                        {isOverdue && <span className="badge-danger text-[10px]">⚠️ Overdue</span>}
                        {reminder.status === 'completed' && <span className="badge-success text-[10px]">✅ Done</span>}
                    </div>
                    <h3 className="text-sm font-bold text-text-dark">{reminder.title}</h3>
                    <p className="text-text-light text-xs mt-0.5">{reminder.description}</p>
                    <div className="flex items-center gap-1.5 mt-1.5 text-xs text-text-light">
                        <FiClock size={11} />
                        <span>Due: {dueDate}</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    {reminder.status !== 'completed' && (
                        <button onClick={() => onComplete?.(reminder._id)} className="btn-senior bg-success text-white px-3 py-2 text-xs border-none min-h-[36px]">
                            <FiCheckCircle className="inline mr-1" size={14} /> Done
                        </button>
                    )}
                    <button onClick={() => onDelete?.(reminder._id)} className="btn-senior bg-danger/10 text-danger px-3 py-2 text-xs border-none hover:bg-danger hover:text-white min-h-[36px]">
                        <FiTrash2 size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
}
