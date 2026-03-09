import React, { useState } from 'react';
import { transportConfig, getTransportIcon } from '../utils/config';
import DatePickerFlatpickr from './DatePickerFlatpickr';

const StatusTimeline = ({ track, onStatusChange, onPointClick, selectedPointIndex }) => {
    const config = transportConfig[track.transportType];
    const points = track.points;
    const intervals = config.intervals;

    const pointIdx = points.findIndex(p => p.name === track.currentStatus);
    const interval = intervals.find(i => i.name === track.currentStatus);

    let fillPercent = 0;
    let transportIconClass = getTransportIcon(track.transportType);
    if (pointIdx !== -1) {
        fillPercent = (pointIdx / (points.length - 1)) * 100;
    } else if (interval) {
        const from = interval.from;
        const to = interval.to;
        const progress = track.intervalProgress || 50;
        fillPercent = (from + (progress / 100) * (to - from)) / (points.length - 1) * 100;
        transportIconClass = interval.transportIcon || getTransportIcon(track.transportType);
    }

    const getCompletedPoints = () => {
        if (pointIdx !== -1) {
            return points.map((_, idx) => idx <= pointIdx);
        } else if (interval) {
            return points.map((_, idx) => idx <= interval.from);
        }
        return points.map(() => false);
    };
    const completed = getCompletedPoints();

    const [selectedStatus, setSelectedStatus] = useState(track.currentStatus);
    const [dateInput, setDateInput] = useState(pointIdx !== -1 ? points[pointIdx].date : '');

    const handleUpdate = () => {
        onStatusChange(selectedStatus, dateInput);
    };

    const isSelectedPoint = points.some(p => p.name === selectedStatus);

    const sortedOptions = [
        ...points.map((p, idx) => ({ type: 'point', name: p.name, order: idx })),
        ...intervals.map(i => ({ type: 'interval', name: i.name, order: i.from }))
    ].sort((a, b) => a.order - b.order);

    const markerStyle = {
        left: `calc(44px + (${fillPercent} * (100% - 66px) / 100))`,
        transform: 'translateX(-50%)',
        transition: 'left 0.3s ease'
    };
    
    return (
        <>
            <div className="progress-track">
                <div className="progress-line">
                    <div className="progress-fill" style={{ width: `${fillPercent}%` }}></div>
                </div>
                <div className="points-container">
                    {points.map((point, idx) => (
                        <div
                            key={idx}
                            className={`status-point ${completed[idx] ? 'completed' : ''} ${idx === pointIdx ? 'active' : ''} ${idx === selectedPointIndex ? 'selected' : ''}`}
                            onClick={() => onPointClick(idx)}
                        >
                            {point.date && <span className="point-date">{point.date}</span>}
                            <div className="point-icon">
                                <i className={`fas ${point.icon}`}></i>
                            </div>
                            <span className="point-label">{point.name}</span>
                        </div>
                    ))}
                </div>
                <div className="transport-marker" style={markerStyle}>
                    <i className={`fas ${transportIconClass}`}></i>
                </div>
            </div>

            <div className="control-panel">
                <div className="status-selector">
                    <div className="selector-item">
                        <label>Новый статус</label>
                        <select
                            className="form-select"
                            value={selectedStatus}
                            onChange={(e) => {
                                const newVal = e.target.value;
                                setSelectedStatus(newVal);
                                const newPointIdx = points.findIndex(p => p.name === newVal);
                                setDateInput(newPointIdx !== -1 ? points[newPointIdx].date : '');
                            }}
                        >
                            {sortedOptions.map(opt => (
                                <option key={opt.name} value={opt.name}>{opt.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="selector-item" style={{ display: isSelectedPoint ? 'block' : 'none' }}>
                        <label>Дата события</label>
                        <DatePickerFlatpickr
                            value={dateInput}
                            onChange={setDateInput}
                        />
                    </div>
                    <div className="selector-item">
                        <button className="btn-update" onClick={handleUpdate}>Обновить</button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default StatusTimeline;