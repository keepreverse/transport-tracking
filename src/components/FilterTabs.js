import React from 'react';

const filters = [
    { value: 'all', label: 'Все', icon: 'fa-globe' },
    { value: 'auto', label: 'Авто', icon: 'fa-truck' },
    { value: 'train', label: 'ЖД', icon: 'fa-train' },
    { value: 'air', label: 'Авиа', icon: 'fa-plane' },
    { value: 'sea_rail', label: 'Море + ЖД', icon: 'fa-ship' }
];

const FilterTabs = ({ currentFilter, onFilterChange }) => {
    return (
        <div className="filter-buttons">
            {filters.map(f => (
                <button
                    key={f.value}
                    className={`filter-btn ${currentFilter === f.value ? 'active' : ''}`}
                    onClick={() => onFilterChange(f.value)}
                >
                    <i className={`fas ${f.icon}`}></i> {f.label}
                </button>
            ))}
        </div>
    );
};

export default FilterTabs;