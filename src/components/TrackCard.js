import React from 'react';
import { Link } from 'react-router-dom';
import { getTransportIcon, transportConfig } from '../utils/config';

const TrackCard = ({ track }) => {
    const config = transportConfig[track.transportType];
    const points = track.points;

    // Определяем пройденные точки
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

    const getProgressPercent = () => {
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

    const getLastDate = () => {
        const dates = points.map(p => p.date).filter(d => d);
        return dates.length ? dates[dates.length - 1] : 'нет даты';
    };

    const fillPercent = getProgressPercent();
    const lastStatus = track.currentStatus;
    const lastDate = getLastDate();

    return (
        <Link to={`/track/${track.id}`} className="track-card-link" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="track-card">
                <div className="track-card-header">
                    <i className={`fas ${getTransportIcon(track.transportType)}`}></i>
                    <h3>{track.name}</h3>
                </div>
                <div className="track-card-body">
                    <div className="track-status"><i className="fas fa-info-circle"></i> {lastStatus}</div>
                    <div className="track-date"><i className="far fa-calendar-alt"></i> {lastDate}</div>
                    
                    {/* Мини-шкала с иконками точек */}
                    <div className="track-mini-timeline">
                        <div className="mini-progress-line">
                            <div className="mini-progress-fill" style={{ width: `${fillPercent}%` }}></div>
                        </div>
                        <div className="mini-points">
                            {points.map((point, idx) => (
                                <div
                                    key={idx}
                                    className={`mini-point ${completedPoints[idx] ? 'completed' : ''}`}
                                    title={point.name}
                                >
                                    <i className={`fas ${point.icon}`}></i>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default TrackCard;