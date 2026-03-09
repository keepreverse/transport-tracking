import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StatusTimeline from './StatusTimeline';
import PointDetailsPanel from './PointDetailsPanel';
import TrackMenu from './TrackMenu';
import { getTransportIcon, getTransportName } from '../utils/config';
import { saveFileToDB, deleteFileFromDB } from '../utils/db';

const TrackDetailPage = ({ tracks, onUpdateTrack, onDeleteTrack, onCopyTrack }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const track = tracks.find(t => t.id === id);

    const [selectedPointName, setSelectedPointName] = useState(null);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editedTitle, setEditedTitle] = useState('');

    useEffect(() => {
        if (track && !selectedPointName) {
            setSelectedPointName(track.currentStatus);
        }
    }, [track, selectedPointName]);

    useEffect(() => {
        if (track && selectedPointName) {
            const pointExists = track.points.some(p => p.name === selectedPointName);
            if (!pointExists) {
                setSelectedPointName(track.currentStatus);
            }
        }
    }, [track, selectedPointName]);

    if (!track) {
        return <div>Трек не найден</div>;
    }

    const selectedPointIndex = selectedPointName
        ? track.points.findIndex(p => p.name === selectedPointName)
        : -1;
    const selectedPoint = selectedPointIndex !== -1 ? track.points[selectedPointIndex] : null;

    const performUpdate = (updatedTrack) => {
        onUpdateTrack(updatedTrack);
    };

    const handleStatusChange = (newStatus, date) => {
        const updated = { ...track, currentStatus: newStatus };
        if (date) {
            const idx = updated.points.findIndex(p => p.name === newStatus);
            if (idx !== -1) {
                const oldPoint = updated.points[idx];
                const newPoint = { ...oldPoint, date };
                updated.points = [
                    ...updated.points.slice(0, idx),
                    newPoint,
                    ...updated.points.slice(idx + 1)
                ];
            }
        }
        performUpdate(updated);
    };

    const handlePointUpdate = (pointIndex, updates) => {
        const updated = { ...track };
        const oldPoint = updated.points[pointIndex];
        const newPoint = { ...oldPoint, ...updates };
        updated.points = [
            ...updated.points.slice(0, pointIndex),
            newPoint,
            ...updated.points.slice(pointIndex + 1)
        ];
        performUpdate(updated);
    };

    const handleUploadFiles = async (files, pointIndex) => {
        const readerPromises = files.map(file => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (ev) => resolve({ 
                    name: file.name, 
                    size: file.size,
                    type: file.type,
                    dataUrl: ev.target.result 
                });
                reader.readAsDataURL(file);
            });
        });

        const filesData = await Promise.all(readerPromises);

        const savedFiles = [];
        for (const fileData of filesData) {
            try {
                const id = await saveFileToDB(fileData);
                savedFiles.push({
                    id,
                    name: fileData.name,
                    size: fileData.size,
                    type: fileData.type
                });
            } catch (error) {
                console.error('Ошибка сохранения файла в БД:', error);
            }
        }

        const updated = { ...track };
        const oldPoint = updated.points[pointIndex];
        const newPoint = {
            ...oldPoint,
            files: [...oldPoint.files, ...savedFiles]
        };
        updated.points = [
            ...updated.points.slice(0, pointIndex),
            newPoint,
            ...updated.points.slice(pointIndex + 1)
        ];
        performUpdate(updated);
    };

    const handleDeleteFile = async (pointIndex, fileId) => {
        const point = track.points[pointIndex];
        const fileIndex = point.files.findIndex(f => f.id === fileId);
        if (fileIndex === -1) return;

        try {
            await deleteFileFromDB(fileId);
            const updated = { ...track };
            const oldPoint = updated.points[pointIndex];
            const newFiles = oldPoint.files.filter(f => f.id !== fileId);
            const newPoint = { ...oldPoint, files: newFiles };
            updated.points = [
                ...updated.points.slice(0, pointIndex),
                newPoint,
                ...updated.points.slice(pointIndex + 1)
            ];
            performUpdate(updated);
        } catch (error) {
            console.error('Ошибка удаления файла:', error);
            alert('Не удалось удалить файл');
        }
    };

    const handlePointClick = (index) => {
        setSelectedPointName(track.points[index].name);
    };

    const handleTitleSave = () => {
        if (editedTitle.trim() && editedTitle !== track.name) {
            const updated = { ...track, name: editedTitle.trim() };
            performUpdate(updated);
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

    const handleCopy = () => {
        onCopyTrack(track);
    };

    const handleDelete = () => {
        onDeleteTrack(track.id);
        navigate('/');
    };

    return (
        <div className="track-detail-page">
            <div className="detail-header">
                <button className="btn-back" onClick={() => navigate('/')}>
                    <i className="fas fa-arrow-left"></i> Назад
                </button>
                <TrackMenu
                    onEdit={() => setIsEditingTitle(true)}
                    onCopy={handleCopy}
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
        </div>
    );
};

export default TrackDetailPage;