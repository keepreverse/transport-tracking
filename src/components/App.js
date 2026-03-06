import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import FilterTabs from './FilterTabs';
import TrackList from './TrackList';
import TrackDetailPage from './TrackDetailPage';
import CreateTrackModal from './CreateTrackModal';
import { loadTracks, saveTracks, createTrack } from '../utils/storage';
import '../styles/App.css';

const AppContent = () => {
    const [tracks, setTracks] = useState([]);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    useEffect(() => {
        setTracks(loadTracks());
    }, []);

    const getProgressPercent = (track) => {
        const config = require('../utils/config').transportConfig[track.transportType];
        const points = track.points;
        const pointIdx = points.findIndex(p => p.name === track.currentStatus);
        const interval = config.intervals.find(i => i.name === track.currentStatus);
        if (pointIdx !== -1) {
            return (pointIdx / (points.length - 1)) * 100;
        } else if (interval) {
            const from = interval.from;
            const to = interval.to;
            const progress = track.intervalProgress || 50;
            return ((from + (progress / 100) * (to - from)) / (points.length - 1)) * 100;
        }
        return 0;
    };

    let filteredTracks = tracks.filter(track => {
        if (filter !== 'all' && track.transportType !== filter) return false;
        if (searchQuery && !track.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    filteredTracks = filteredTracks.sort((a, b) => {
        if (sortBy === 'newest') {
            return b.id.localeCompare(a.id);
        } else if (sortBy === 'progress_asc') {
            return getProgressPercent(a) - getProgressPercent(b);
        } else if (sortBy === 'progress_desc') {
            return getProgressPercent(b) - getProgressPercent(a);
        }
        return 0;
    });

    const handleCreateTrack = (name, type) => {
        const newTrack = createTrack(name, type);
        const updated = [newTrack, ...tracks];
        setTracks(updated);
        saveTracks(updated);
        setIsCreateModalOpen(false);
        // Убрали автоматический переход navigate(`/track/${newTrack.id}`);
    };

    const handleUpdateTrack = (updatedTrack) => {
        const updatedList = tracks.map(t => t.id === updatedTrack.id ? updatedTrack : t);
        setTracks(updatedList);
        saveTracks(updatedList);
    };

    return (
        <div className="app-container">
            <main className="main-content">
                <Routes>
                    <Route path="/" element={
                        <>
                            <div className="page-header">
                                <h1><i className="fas fa-map-marked-alt me-2"></i>Мои перевозки</h1>
                                <div className="filter-section">
                                    <input
                                        type="text"
                                        className="search-input"
                                        placeholder="Поиск..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    <FilterTabs currentFilter={filter} onFilterChange={setFilter} />
                                    <select
                                        className="sort-select"
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                    >
                                        <option value="newest">Сначала новые</option>
                                        <option value="progress_desc">По прогрессу (убывание)</option>
                                        <option value="progress_asc">По прогрессу (возрастание)</option>
                                    </select>
                                    <button
                                        className="btn-create"
                                        onClick={() => setIsCreateModalOpen(true)}
                                    >
                                        <i className="fas fa-plus"></i> Создать
                                    </button>
                                </div>
                            </div>
                            <TrackList tracks={filteredTracks} />
                        </>
                    } />
                    <Route path="/track/:id" element={
                        <TrackDetailPage
                            tracks={tracks}
                            onUpdateTrack={handleUpdateTrack}
                        />
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
    <BrowserRouter>
        <AppContent />
    </BrowserRouter>
);

export default App;