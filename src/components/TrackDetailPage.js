import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StatusTimeline from './StatusTimeline';
import PointDetailsPanel from './PointDetailsPanel';
import TrackMenu from './TrackMenu';
import CopyTrackModal from './CopyTrackModal';
import { getTransportIcon, getTransportName } from '../utils/config';
import { api } from '../api';

const TrackDetailPage = ({ onRefresh }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [track, setTrack] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedPointName, setSelectedPointName] = useState(null);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editedTitle, setEditedTitle] = useState('');
    const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);

    useEffect(() => {
        const loadTrack = async () => {
            try {
                setLoading(true);
                const data = await api.getTrack(id);
                setTrack(data);
                setSelectedPointName(data.currentStatus);
            } catch (err) {
                setError('Ошибка загрузки трека');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadTrack();
    }, [id]);

    useEffect(() => {
        if (track && selectedPointName) {
            const pointExists = track.points.some(p => p.name === selectedPointName);
            if (!pointExists) {
                setSelectedPointName(track.currentStatus);
            }
        }
    }, [track, selectedPointName]);

    if (loading) return <div>Загрузка...</div>;
    if (error) return <div>{error}</div>;
    if (!track) return <div>Трек не найден</div>;

    const selectedPointIndex = selectedPointName
        ? track.points.findIndex(p => p.name === selectedPointName)
        : -1;
    const selectedPoint = selectedPointIndex !== -1 ? track.points[selectedPointIndex] : null;

    const performUpdate = async (updates) => {
        try {
            await api.updateTrack(track.id, updates);
            setTrack(prev => {
                const updated = { ...prev };
                if (updates.name) updated.name = updates.name;
                if (updates.currentStatus) updated.currentStatus = updates.currentStatus;
                if (updates.pointUpdates) {
                    updates.pointUpdates.forEach(({ order, date, comment }) => {
                        if (updated.points[order]) {
                            if (date !== undefined) updated.points[order].date = date;
                            if (comment !== undefined) updated.points[order].comment = comment;
                        }
                    });
                }
                return updated;
            });
            if (onRefresh) onRefresh();
        } catch (err) {
            console.error('Ошибка обновления трека:', err);
            alert('Не удалось обновить трек');
        }
    };

    const handleStatusChange = (newStatus, date) => {
        const updates = { currentStatus: newStatus };
        if (date) {
            const idx = track.points.findIndex(p => p.name === newStatus);
            if (idx !== -1) {
                updates.pointUpdates = [{ order: idx, date }];
            }
        }
        performUpdate(updates);
    };

    const handlePointUpdate = (pointIndex, { date, comment }) => {
        const updates = {
            pointUpdates: [{ order: pointIndex, date, comment }]
        };
        performUpdate(updates);
    };

    const handleUploadFiles = async (files, pointIndex) => {
        const point = track.points[pointIndex];
        if (!point.id) {
            console.error('У точки нет id, невозможно загрузить файлы');
            return;
        }
        try {
            const uploaded = await api.uploadFiles(point.id, files);
            const updated = { ...track };
            updated.points[pointIndex].files.push(...uploaded);
            setTrack(updated);
            if (onRefresh) onRefresh();
        } catch (err) {
            console.error('Ошибка загрузки файлов:', err);
            alert('Не удалось загрузить файлы');
        }
    };

    const handleDeleteFile = async (pointIndex, fileId) => {
        try {
            await api.deleteFile(fileId);
            const updated = { ...track };
            updated.points[pointIndex].files = updated.points[pointIndex].files.filter(f => f.id !== fileId);
            setTrack(updated);
            if (onRefresh) onRefresh();
        } catch (err) {
            console.error('Ошибка удаления файла:', err);
            alert('Не удалось удалить файл');
        }
    };

    const handlePointClick = (index) => {
        setSelectedPointName(track.points[index].name);
    };

    const handleTitleSave = () => {
        if (editedTitle.trim() && editedTitle !== track.name) {
            performUpdate({ name: editedTitle.trim() });
        }
        setIsEditingTitle(false);
    };

    const handleTitleCancel = () => {
        setEditedTitle(track.name);
        setIsEditingTitle(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleTitleSave();
        if (e.key === 'Escape') handleTitleCancel();
    };

    const handleCopyClick = () => {
        setIsCopyModalOpen(true);
    };

    const handleCopyConfirm = (withFiles) => {
        api.copyTrack(track.id, withFiles)
            .then(() => {
                if (onRefresh) onRefresh();
                navigate('/');
            })
            .catch(err => {
                console.error('Ошибка копирования:', err);
                alert('Не удалось скопировать трек');
            });
    };

    const handleDelete = async () => {
        if (!window.confirm('Удалить перевозку?')) return;
        try {
            await api.deleteTrack(track.id);
            if (onRefresh) onRefresh();
            navigate('/');
        } catch (err) {
            console.error('Ошибка удаления:', err);
            alert('Не удалось удалить трек');
        }
    };

    return (
        <div className="track-detail-page">
            <div className="detail-header">
                <button className="btn-back" onClick={() => navigate('/')}>
                    <i className="fas fa-arrow-left"></i> Назад
                </button>
                <TrackMenu
                    onEdit={() => setIsEditingTitle(true)}
                    onCopy={handleCopyClick}
                    onDelete={handleDelete}
                />
            </div>

            <div className="track-header" style={{ marginBottom: 'clamp(0.75rem, 2vh, 1.5rem)', marginTop: 'clamp(0.75rem, 2vh, 1.5rem)' }}>
                {isEditingTitle ? (
                    <div className="title-edit">
                        <input
                            type="text"
                            value={editedTitle}
                            onChange={(e) => setEditedTitle(e.target.value)}
                            onKeyDown={handleKeyDown}
                            autoFocus
                        />
                        <button onClick={handleTitleSave}><i className="fas fa-check"></i></button>
                        <button onClick={handleTitleCancel}><i className="fas fa-times"></i></button>
                    </div>
                ) : (
                    <h2>{track.name}</h2>
                )}
                <span className="transport-badge">
                    <i className={`fas ${getTransportIcon(track.transportType)}`}></i> {getTransportName(track.transportType)}
                </span>
                <span className="supplier-badge">
                    <i className="fas fa-user"></i> {track.supplier}
                </span>
            </div>

            <StatusTimeline
                track={track}
                onStatusChange={handleStatusChange}
                onPointClick={handlePointClick}
                selectedPointIndex={selectedPointIndex >= 0 ? selectedPointIndex : undefined}
            />

            <PointDetailsPanel
                point={selectedPoint}
                onUpdatePoint={(updates) => handlePointUpdate(selectedPointIndex, updates)}
                onUploadFiles={(files) => handleUploadFiles(files, selectedPointIndex)}
                onDeleteFile={(fileId) => handleDeleteFile(selectedPointIndex, fileId)}
            />

            <CopyTrackModal
                isOpen={isCopyModalOpen}
                onClose={() => setIsCopyModalOpen(false)}
                onConfirm={handleCopyConfirm}
            />
        </div>
    );
};

export default TrackDetailPage;