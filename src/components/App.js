import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import FilterTabs from './FilterTabs';
import SupplierFilter from './SupplierFilter';
import TrackList from './TrackList';
import TrackDetailPage from './TrackDetailPage';
import CreateTrackModal from './CreateTrackModal';
import { api } from '../api';
import { transportConfig } from '../utils/config';
import { getProgressPercent } from '../utils/progress';
import '../styles/App.css';

const AppContent = () => {
    const [tracks, setTracks] = useState([]);
    const [filter, setFilter] = useState('all');
    const [supplierFilter, setSupplierFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const refreshTracks = useCallback(() => {
        api.getTracks({
            transport: filter !== 'all' ? filter : undefined,
            supplier: supplierFilter !== 'all' ? supplierFilter : undefined,
            search: searchQuery || undefined,
            sort: sortBy
        }).then(data => {
            let sortedData = data;
            // Если сортировка по прогрессу, выполняем её на клиенте
            if (sortBy === 'progress_asc' || sortBy === 'progress_desc') {
                sortedData = [...data].sort((a, b) => {
                    const pA = getProgressPercent(a);
                    const pB = getProgressPercent(b);
                    return sortBy === 'progress_asc' ? pA - pB : pB - pA;
                });
            }
            setTracks(sortedData);
        }).catch(console.error);
    }, [filter, supplierFilter, searchQuery, sortBy]);

    useEffect(() => {
        refreshTracks();
    }, [refreshTracks]);

    const handleCreateTrack = (name, type, supplier) => {
        const points = transportConfig[type].points.map((p, index) => ({
            name: p.name,
            icon: p.icon,
            date: '',
            comment: '',
            order: index
        }));

        api.createTrack({ name, transportType: type, supplier, points })
            .then(refreshTracks)
            .catch(console.error)
            .finally(() => setIsCreateModalOpen(false));
    };

    const handleUpdateTrack = (updatedTrack) => {
        api.updateTrack(updatedTrack.id, updatedTrack)
            .then(refreshTracks)
            .catch(console.error);
    };

    const handleCopyTrack = (originalTrack, withFiles) => {
        api.copyTrack(originalTrack.id, withFiles)
            .then(refreshTracks)
            .catch(console.error);
    };

    const handleDeleteTrack = (id) => {
        if (!window.confirm('Удалить перевозку?')) return;
        api.deleteTrack(id)
            .then(refreshTracks)
            .catch(console.error);
    };

    return (
        <div className="app-container">
            <main className="main-content">
                <Routes>
                    <Route path="/" element={
                        <>
                            <div className="page-header">
                                <h1><i className="fas fa-map-marked-alt me-2"></i>My Tracks</h1>
                                <div className="search-wrapper">
                                    <input
                                        type="text"
                                        className="search-input"
                                        placeholder="Поиск..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <div className="action-bar">
                                    <FilterTabs currentFilter={filter} onFilterChange={setFilter} />
                                    <SupplierFilter currentFilter={supplierFilter} onFilterChange={setSupplierFilter} />
                                    <select
                                        className="sort-select"
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                    >
                                        <option value="newest">По дате создания (сначала новые)</option>
                                        <option value="oldest">По дате создания (сначала старые)</option>
                                        <option value="name_asc">По названию (А–Я)</option>
                                        <option value="name_desc">По названию (Я–А)</option>
                                        <option value="progress_asc">По прогрессу (сначала меньше)</option>
                                        <option value="progress_desc">По прогрессу (сначала больше)</option>
                                    </select>
                                    <button
                                        className="btn-create"
                                        onClick={() => setIsCreateModalOpen(true)}
                                    >
                                        <i className="fas fa-plus"></i> Создать
                                    </button>
                                </div>
                            </div>
                            <TrackList
                                tracks={tracks}
                                onUpdateTrack={handleUpdateTrack}
                                onCopyTrack={handleCopyTrack}
                                onDeleteTrack={handleDeleteTrack}
                            />
                        </>
                    } />
                    <Route path="/track/:id" element={
                        <TrackDetailPage onRefresh={refreshTracks} />
                    } />
                </Routes>
            </main>

            <CreateTrackModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreate={handleCreateTrack}
            />
        </div>
    );
};

const App = () => (
    <HashRouter>
        <AppContent />
    </HashRouter>
);

export default App;