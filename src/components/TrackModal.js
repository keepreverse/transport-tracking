import React, { useState } from 'react';
import Modal from './Modal';
import StatusTimeline from './StatusTimeline';
import StatusDetailModal from './StatusDetailModal';
import FileManager from './FileManager';
import { getTransportIcon, getTransportName } from '../utils/config';

const TrackModal = ({ isOpen, onClose, track, onUpdateTrack }) => {
    const [selectedPointIndex, setSelectedPointIndex] = useState(null); // для открытия детальной модалки точки

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

    const handleUploadFiles = (files) => {
        if (pointIdx === -1) return;
        const readerPromises = files.map(file => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (ev) => resolve({ name: file.name, dataUrl: ev.target.result });
                reader.readAsDataURL(file);
            });
        });
        Promise.all(readerPromises).then(newFiles => {
            const updated = { ...track };
            updated.points[pointIdx].files.push(...newFiles);
            onUpdateTrack(updated);
        });
    };

    const handlePointClick = (index) => {
        setSelectedPointIndex(index);
    };

    const closePointModal = () => {
        setSelectedPointIndex(null);
    };

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} title={track.name}>
                <div className="track-header" style={{ marginBottom: 20 }}>
                    <span className="transport-badge">
                        <i className={`fas ${getTransportIcon(track.transportType)}`}></i> {getTransportName(track.transportType)}
                    </span>
                </div>
                <StatusTimeline
                    track={track}
                    onStatusChange={handleStatusChange}
                    onPointClick={handlePointClick}
                />
                <FileManager
                    point={currentPoint}
                    onUpload={handleUploadFiles}
                />
            </Modal>

            {selectedPointIndex !== null && (
                <StatusDetailModal
                    isOpen={true}
                    onClose={closePointModal}
                    point={track.points[selectedPointIndex]}
                    onUpdatePoint={(updates) => handlePointUpdate(selectedPointIndex, updates)}
                    onUploadFiles={(files) => {
                        // аналогично загрузке файлов в точку
                        const readerPromises = files.map(file => {
                            return new Promise((resolve) => {
                                const reader = new FileReader();
                                reader.onload = (ev) => resolve({ name: file.name, dataUrl: ev.target.result });
                                reader.readAsDataURL(file);
                            });
                        });
                        Promise.all(readerPromises).then(newFiles => {
                            const updated = { ...track };
                            updated.points[selectedPointIndex].files.push(...newFiles);
                            onUpdateTrack(updated);
                        });
                    }}
                />
            )}
        </>
    );
};

export default TrackModal;