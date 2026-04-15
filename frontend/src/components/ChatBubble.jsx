import { FiUser, FiCpu } from 'react-icons/fi';

export default function ChatBubble({ message, isBot, timestamp }) {
    // Simple markdown-like rendering for bold text
    const renderText = (text) => {
        if (!text) return '';
        return text.split('\n').map((line, i) => {
            // Bold
            let rendered = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            return <p key={i} className={i > 0 ? 'mt-0.5' : ''} dangerouslySetInnerHTML={{ __html: rendered }} />;
        });
    };

    return (
        <div className={`flex gap-2.5 mb-3 animate-fade-in ${isBot ? '' : 'flex-row-reverse'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isBot ? 'bg-primary text-white' : 'bg-accent text-white'}`}>
                {isBot ? <FiCpu size={16} /> : <FiUser size={16} />}
            </div>
            <div className={isBot ? 'chat-bot' : 'chat-user'}>
                <div className="text-sm leading-relaxed whitespace-pre-wrap">{renderText(message)}</div>
                {timestamp && (
                    <p className={`text-[10px] mt-1.5 ${isBot ? 'text-text-light' : 'text-white/70'}`}>
                        {new Date(timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                )}
            </div>
        </div>
    );
}
