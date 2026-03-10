import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getTransportIcon, transportConfig } from '../utils/config';
import { getProgressPercent } from '../utils/progress';
import TrackMenu from './TrackMenu';
import CopyTrackModal from './CopyTrackModal';

const TrackCard = ({ track, onUpdateTrack, onCopy, onDelete }) => {
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editedTitle, setEditedTitle] = useState(track.name);
    const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);

    const config = transportConfig[track.transportType];
    const points = track.points;

    const pointIdx = points.findIndex(p => p.name === track.currentStatus);
    const interval = config.intervals.find(i => i.name === track.currentStatus);
    let completedPoints = [];
    if (pointIdx !== -1) {
        completedPoints = points.map((_, idx) => idx <= pointIdx);
    } else if (interval) {
        completedPoints = points.map((_, idx) => idx <= interval.from);
    } else {
        completedPoints = points.map(() => false);
    }

    const getLastDate = () => {
        const dates = points.map(p => p.date).filter(d => d);
        return dates.length ? dates[dates.length - 1] : 'нет даты';
    };

    const fillPercent = getProgressPercent(track);
    const lastStatus = track.currentStatus;
    const lastDate = getLastDate();
    const whatSupplier = track.supplier;

    const handleTitleSave = () => {
        if (editedTitle.trim() && editedTitle !== track.name) {
            const updated = { ...track, name: editedTitle.trim() };
            onUpdateTrack(updated);
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
        onCopy(track, withFiles);
    };

    // Режим редактирования – без ссылки
    if (isEditingTitle) {
        return (
            <div className="track-card-wrapper">
                <div className="track-card" style={{ flex: 1 }}>
                    <div className="track-card-header">
                        <i className={`fas ${getTransportIcon(track.transportType)}`}></i>
                        <div className="title-edit" onClick={(e) => e.preventDefault()}>
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
                    </div>
                    <div className="track-card-body">
                        <div className="track-status"><i className="fas fa-info-circle"></i> {lastStatus}</div>
                        <div className="track-supplier"><i className="fas fa-user"></i> {whatSupplier}</div>
                        <div className="track-date"><i className="far fa-calendar-alt"></i> {lastDate}</div>

                        <div className="track-mini-timeline">
                            <div className="mini-progress-line">
                                <div className="mini-progress-fill" style={{ width: `${fillPercent}%` }}></div>
                            </div>
                            <div className="mini-points-with-labels">
                                {points.map((point, idx) => (
                                    <div
                                        key={idx}
                                        className={`mini-point-container ${completedPoints[idx] ? 'completed' : ''}`}
                                    >
                                        <div className="mini-point-icon">
                                            <i className={`fas ${point.icon}`}></i>
                                        </div>
                                        <span className="mini-point-label">{point.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <TrackMenu
                    onEdit={() => setIsEditingTitle(true)}
                    onCopy={handleCopyClick}
                    onDelete={() => onDelete(track.id)}
                />
                <CopyTrackModal
                    isOpen={isCopyModalOpen}
                    onClose={() => setIsCopyModalOpen(false)}
                    onConfirm={handleCopyConfirm}
                />
            </div>
        );
    }

    // Обычный режим – внутри ссылки
    return (
        <div className="track-card-wrapper">
            <Link to={`/track/${track.id}`} className="track-card-link" style={{ textDecoration: 'none', color: 'inherit', flex: 1 }}>
                <div className="track-card">
                    <div className="track-card-header">
                        <i className={`fas ${getTransportIcon(track.transportType)}`}></i>
                        <h3>{track.name}</h3>
                    </div>
                    <div className="track-card-body">
                        <div className="track-status"><i className="fas fa-info-circle"></i> {lastStatus}</div>
                        <div className="track-supplier"><i className="fas fa-user"></i> {whatSupplier}</div>
                        <div className="track-date"><i className="far fa-calendar-alt"></i> {lastDate}</div>

                        <div className="track-mini-timeline">
                            <div className="mini-progress-line">
                                <div className="mini-progress-fill" style={{ width: `${fillPercent}%` }}></div>
                            </div>
                            <div className="mini-points-with-labels">
                                {points.map((point, idx) => (
                                    <div
                                        key={idx}
                                        className={`mini-point-container ${completedPoints[idx] ? 'completed' : ''}`}
                                    >
                                        <div className="mini-point-icon">
                                            <i className={`fas ${point.icon}`}></i>
                                        </div>
                                        <span className="mini-point-label">{point.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
            <TrackMenu
                onEdit={() => setIsEditingTitle(true)}
                onCopy={handleCopyClick}
                onDelete={() => onDelete(track.id)}
            />
            <CopyTrackModal
                isOpen={isCopyModalOpen}
                onClose={() => setIsCopyModalOpen(false)}
                onConfirm={handleCopyConfirm}
            />
        </div>
    );
};

export default TrackCard;