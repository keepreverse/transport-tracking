import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import FilterTabs from './FilterTabs';
import SupplierFilter from './SupplierFilter';
import TrackList from './TrackList';
import TrackDetailPage from './TrackDetailPage';
import CreateTrackModal from './CreateTrackModal';
import { loadTracks, saveTracks, createTrack } from '../utils/storage';
import { copyFileInDB } from '../utils/db';
import { getProgressPercent } from '../utils/progress';
import { deleteFilesFromDB } from '../utils/db';
import '../styles/App.css';

const AppContent = () => {
    const [tracks, setTracks] = useState([]);
    const [filter, setFilter] = useState('all');
    const [supplierFilter, setSupplierFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    useEffect(() => {
        setTracks(loadTracks());
    }, []);

    let filteredTracks = tracks.filter(track => {
        if (filter !== 'all' && track.transportType !== filter) return false;
        if (supplierFilter !== 'all' && track.supplier !== supplierFilter) return false;
        if (searchQuery && !track.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    filteredTracks = filteredTracks.sort((a, b) => {
        switch (sortBy) {
            case 'newest':
                return parseInt(b.id) - parseInt(a.id);
            case 'oldest':
                return parseInt(a.id) - parseInt(b.id);
            case 'name_asc':
                return a.name.localeCompare(b.name);
            case 'name_desc':
                return b.name.localeCompare(a.name);
            case 'progress_asc':
                return getProgressPercent(a) - getProgressPercent(b);
            case 'progress_desc':
                return getProgressPercent(b) - getProgressPercent(a);
            default:
                return 0;
        }
    });

    const handleCreateTrack = (name, type, supplier) => {
        const newTrack = createTrack(name, type, supplier);
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

    const handleCopyTrack = async (originalTrack, withFiles) => {
        // Создаём копию трека с новым ID и именем
        const newTrack = {
            ...originalTrack,
            id: Date.now().toString(),
            name: `${originalTrack.name} (копия)`,
            points: originalTrack.points.map(point => ({
                ...point,
                files: [] // сначала пустые
            }))
        };

        if (withFiles) {
            // Копируем файлы для каждой точки
            for (let i = 0; i < originalTrack.points.length; i++) {
                const originalPoint = originalTrack.points[i];
                const newPoint = newTrack.points[i];
                const copiedFiles = [];
                for (const fileMeta of originalPoint.files) {
                    try {
                        const newFileId = await copyFileInDB(fileMeta.id);
                        copiedFiles.push({
                            ...fileMeta,
                            id: newFileId
                        });
                    } catch (error) {
                        console.error('Ошибка копирования файла', fileMeta.id, error);
                    }
                }
                newPoint.files = copiedFiles;
            }
        }

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
    <HashRouter>
        <AppContent />
    </HashRouter>
);

export default App;