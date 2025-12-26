import { NavLink } from 'react-router-dom';
import './styles/Sidebar.css'; // Импорт локальных стилей

type Props = {
    isOpen: boolean;
    onClose: () => void;
};

export default function Sidebar({ isOpen, onClose }: Props) {
    return (
        <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
            <div className="sidebar-title">Сканер пар</div>
            <nav className="sidebar-nav">
                <NavLink to="/dashboard" className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`} onClick={onClose}>
                    <span className="side-icon">📊</span>
                    <span className="side-text">Мониторинг</span>
                </NavLink>
                <NavLink to="/dashboard/history" className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`} onClick={onClose}>
                    <span className="side-icon">📋</span>
                    <span className="side-text">История</span>
                </NavLink>
                <NavLink to="/dashboard/devices" className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`} onClick={onClose}>
                    <span className="side-icon">🔧</span>
                    <span className="side-text">Устройства</span>
                </NavLink>
            </nav>
        </aside>
    );
}
