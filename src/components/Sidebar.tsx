import { NavLink } from 'react-router-dom';

type Props = {
    isOpen: boolean;
    onClose: () => void;
};

export default function Sidebar({ isOpen, onClose }: Props) {
    return (
        <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
            <div className="sidebar-title" style={{ padding: '1rem', fontWeight: '600', borderBottom: '1px solid var(--border)' }}>Сканер пар</div>
            <nav className="sidebar-nav">
                <NavLink to="/dashboard" className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`} onClick={onClose}>
                    Мониторинг
                </NavLink>
                <NavLink to="/dashboard/history" className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`} onClick={onClose}>
                    История
                </NavLink>
                <NavLink to="/dashboard/devices" className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`} onClick={onClose}>
                    Устройства
                </NavLink>
            </nav>
        </aside>
    );
}