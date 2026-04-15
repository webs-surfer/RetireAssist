import { useState } from 'react';
import { FiChevronDown, FiChevronUp, FiExternalLink } from 'react-icons/fi';

export default function ServiceCard({ service }) {
    const [expanded, setExpanded] = useState(false);

    const categoryColors = {
        Government: 'bg-primary/10 text-primary',
        Financial: 'bg-accent/10 text-accent',
        Healthcare: 'bg-success/10 text-success',
    };

    return (
        <div className="card">
            <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/5 rounded-lg flex items-center justify-center text-lg">
                        {service.icon}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-text-dark">{service.title}</h3>
                            {service.category && (
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${categoryColors[service.category] || 'bg-bg text-text-light'}`}>
                                    {service.category}
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-text-light">{service.subtitle}</p>
                    </div>
                </div>
                <button className="w-8 h-8 rounded-lg bg-bg flex items-center justify-center border-none cursor-pointer text-text-light hover:bg-primary hover:text-white transition-all flex-shrink-0">
                    {expanded ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                </button>
            </div>

            {expanded && (
                <div className="mt-4 pt-4 border-t border-border animate-fade-in">
                    <h4 className="text-sm font-semibold text-text-dark mb-3">📋 Step-by-Step Guide</h4>
                    <ol className="space-y-2">
                        {service.steps.map((step, idx) => (
                            <li key={idx} className="flex items-start gap-2.5">
                                <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                                    {idx + 1}
                                </span>
                                <p className="text-sm text-text">{step}</p>
                            </li>
                        ))}
                    </ol>
                    {service.helpline && (
                        <div className="mt-3 p-3 bg-info/5 rounded-lg">
                            <p className="text-xs font-semibold text-info">📞 Helpline: {service.helpline}</p>
                        </div>
                    )}
                    {service.website && (
                        <a href={service.website} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 mt-2 text-primary text-xs font-semibold hover:underline">
                            <FiExternalLink size={12} /> Visit Official Website
                        </a>
                    )}
                </div>
            )}
        </div>
    );
}
