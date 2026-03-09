import React, { useState, useRef, useEffect } from 'react';

const TrackMenu = ({ onEdit, onCopy, onDelete }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef();

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="track-menu" ref={menuRef}>
            <button className="menu-trigger" onClick={() => setIsOpen(!isOpen)}>
                <i className="fas fa-ellipsis-v"></i>
            </button>
            {isOpen && (
                <div className="menu-dropdown">
                    {onEdit && <button onClick={() => { onEdit(); setIsOpen(false); }}>Редактировать</button>}
                    {onCopy && <button onClick={() => { onCopy(); setIsOpen(false); }}>Копировать</button>}
                    {onDelete && <button onClick={() => { onDelete(); setIsOpen(false); }}>Удалить</button>}
                </div>
            )}
        </div>
    );
};

export default TrackMenu;