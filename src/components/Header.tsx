import React from 'react';
import './styles/Header.css'; // Подключаем локальные стили

type Props = {
    title: string;
    right?: React.ReactNode;
};

export default function Header({ title, right }: Props) {
    return (
        <header className="header">
            <h1 className="header-title">{title}</h1>
            {right && <div className="header-right">{right}</div>}
        </header>
    );
}
