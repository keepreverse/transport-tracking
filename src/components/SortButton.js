import React from 'react';

const SortButton = ({ sortOrder, onSortChange }) => {
    return (
        <button
            className={`sort-btn ${sortOrder !== 'none' ? 'active' : ''}`}
            onClick={() => onSortChange(sortOrder === 'asc' ? 'desc' : 'asc')}
        >
            <i className="fas fa-sort-amount-down-alt"></i> Сортировка
        </button>
    );
};

export default SortButton;  