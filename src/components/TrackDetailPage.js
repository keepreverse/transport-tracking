import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StatusTimeline from './StatusTimeline';
import FileManager from './FileManager';
import StatusDetailModal from './StatusDetailModal';
import { getTransportIcon, getTransportName } from '../utils/config';

const TrackDetailPage = ({ tracks, onUpdateTrack }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const track = tracks.find(t => t.id === id);

    const [selectedStatusIndex, setSelectedStatusIndex] = useState(null); // индекс точки
    const [isPointModalOpen, setIsPointModalOpen] = useState(false);

    if (!track) {
        return <div>Трек не найден</div>;
    }

    const pointIdx = track.points.findIndex(p => p.name === track.currentStatus);
    const currentPoint = pointIdx !== -1 ? track.points[pointIdx] : null;

    const handleStatusChange = (newStatus, date) => {
        const updated = { ...track, currentStatus: newStatus };
        if (date) {
            const idx = updated.points.findIndex(p => p.name === newStatus);
            if (idx !== -1) {
                updated.points[idx].date = date;
            }
        }
        onUpdateTrack(updated);
    };

    const handlePointUpdate = (pointIndex, updates) => {
        const updated = { ...track };
        updated.points[pointIndex] = { ...updated.points[pointIndex], ...updates };
        onUpdateTrack(updated);
    };

    const handleUploadFiles = (files, pointIndex) => {
        const readerPromises = files.map(file => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (ev) => resolve({ name: file.name, dataUrl: ev.target.result });
                reader.readAsDataURL(file);
            });
        });
        Promise.all(readerPromises).then(newFiles => {
            const updated = { ...track };
            updated.points[pointIndex].files.push(...newFiles);
            onUpdateTrack(updated);
        });
    };

    // Обработчик клика по точке (вызывается из StatusTimeline)
    const handlePointClick = (index) => {
        setSelectedStatusIndex(index);
        setIsPointModalOpen(true);
    };

    const closePointModal = () => {
        setIsPointModalOpen(false);
        setSelectedStatusIndex(null);
    };

    return (
        <div className="track-detail-page">
            <button className="btn-back" onClick={() => navigate('/')}>
                <i className="fas fa-arrow-left"></i> Назад к списку
            </button>

            <div className="track-header" style={{ marginBottom: 20, marginTop: 20 }}>
                <h2>{track.name}</h2>
                <span className="transport-badge">
                    <i className={`fas ${getTransportIcon(track.transportType)}`}></i> {getTransportName(track.transportType)}
                </span>
            </div>

            <StatusTimeline
                track={track}
                onStatusChange={handleStatusChange}
                onPointClick={handlePointClick}  // передаём обработчик
            />

            <FileManager
                point={currentPoint}
                onUpload={(files) => handleUploadFiles(files, pointIdx)}
            />

            {isPointModalOpen && selectedStatusIndex !== null && (
                <StatusDetailModal
                    isOpen={isPointModalOpen}
                    onClose={closePointModal}
                    point={track.points[selectedStatusIndex]}
                    onUpdatePoint={(updates) => handlePointUpdate(selectedStatusIndex, updates)}
                    onUploadFiles={(files) => handleUploadFiles(files, selectedStatusIndex)}
                />
            )}
        </div>
    );
};

export default TrackDetailPage;