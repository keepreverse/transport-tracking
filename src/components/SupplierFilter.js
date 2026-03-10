import React from 'react';

const suppliers = [
    { value: 'all', label: 'Все', icon: 'fa-users' },
    { value: 'Angela', label: 'Angela', icon: 'fa-user' },
    { value: 'Wendy', label: 'Wendy', icon: 'fa-user' }
];

const SupplierFilter = ({ currentFilter, onFilterChange }) => {
    return (
        <div className="filter-buttons supplier-filter">
            {suppliers.map(s => (
                <button
                    key={s.value}
                    className={`filter-btn supplier-btn ${currentFilter === s.value ? 'active' : ''}`}
                    data-letter={s.value === 'Angela' ? 'A' : s.value === 'Wendy' ? 'W' : ''}
                    onClick={() => onFilterChange(s.value)}
                >
                    <i className={`fas ${s.icon}`}></i>
                    <span className="filter-label">{s.label}</span>
                </button>
            ))}
        </div>
    );
};

export default SupplierFilter;