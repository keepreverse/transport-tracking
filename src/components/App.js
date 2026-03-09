import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom'; // изменён импорт
import FilterTabs from './FilterTabs';
import TrackList from './TrackList';
import TrackDetailPage from './TrackDetailPage';
import CreateTrackModal from './CreateTrackModal';
import { loadTracks, saveTracks, createTrack } from '../utils/storage';
import { getProgressPercent } from '../utils/progress';
import { deleteFilesFromDB } from '../utils/db';
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

    let filteredTracks = tracks.filter(track => {
        if (filter !== 'all' && track.transportType !== filter) return false;
        if (searchQuery && !track.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    filteredTracks = filteredTracks.sort((a, b) => {
        if (sortBy === 'newest') {
            return parseInt(b.id) - parseInt(a.id);
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
    };

    const handleUpdateTrack = (updatedTrack) => {
        const updatedList = tracks.map(t => t.id === updatedTrack.id ? updatedTrack : t);
        setTracks(updatedList);
        saveTracks(updatedList);
    };

    const handleCopyTrack = (track) => {
        const newTrack = {
            ...track,
            id: Date.now().toString(),
            name: `${track.name} (копия)`
        };
        const updated = [newTrack, ...tracks];
        setTracks(updated);
        saveTracks(updated);
    };

    const handleDeleteTrack = async (id) => {
        if (!window.confirm('Удалить перевозку?')) return;

        const trackToDelete = tracks.find(t => t.id === id);
        if (trackToDelete) {
            const fileIds = trackToDelete.points.flatMap(point => 
                point.files.map(file => file.id)
            );
            if (fileIds.length > 0) {
                try {
                    await deleteFilesFromDB(fileIds);
                } catch (error) {
                    console.error('Ошибка удаления файлов из БД:', error);
                }
            }
        }

        const updated = tracks.filter(t => t.id !== id);
        setTracks(updated);
        saveTracks(updated);
    };

    return (
        <div className="app-container">
            <main className="main-content">
                <Routes>
                    <Route path="/" element={
                        <>
                            <div className="page-header">
                                <h1><i className="fas fa-map-marked-alt me-2"></i>Мои перевозки</h1>
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
                            <TrackList
                                tracks={filteredTracks}
                                onUpdateTrack={handleUpdateTrack}
                                onCopyTrack={handleCopyTrack}
                                onDeleteTrack={handleDeleteTrack}
                            />
                        </>
                    } />
                    <Route path="/track/:id" element={
                        <TrackDetailPage
                            tracks={tracks}
                            onUpdateTrack={handleUpdateTrack}
                            onDeleteTrack={handleDeleteTrack}
                            onCopyTrack={handleCopyTrack}
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
    <HashRouter> {/* заменён BrowserRouter */}
        <AppContent />
    </HashRouter>
);

export default App;