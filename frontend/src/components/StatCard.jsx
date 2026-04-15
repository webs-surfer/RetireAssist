export default function StatCard({ icon: Icon, label, value, color = 'accent', subtitle }) {
    const colors = {
        accent: 'bg-amber-50 text-accent',
        success: 'bg-emerald-50 text-success',
        info: 'bg-blue-50 text-info',
        danger: 'bg-red-50 text-danger',
        warning: 'bg-orange-50 text-warning',
        primary: 'bg-teal-50 text-primary',
    };

    return (
        <div className="card flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[color] || colors.accent}`}>
                {Icon && <Icon size={22} />}
            </div>
            <div>
                <p className="text-2xl font-bold text-text-dark">{value}</p>
                <p className="text-sm text-text-light font-medium">{label}</p>
                {subtitle && <p className="text-xs text-text-light">{subtitle}</p>}
            </div>
        </div>
    );
}
