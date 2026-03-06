import React, { useState } from 'react'; // убрали useEffect
import { transportConfig, getTransportIcon } from '../utils/config';
import DatePickerFlatpickr from './DatePickerFlatpickr';

const StatusTimeline = ({ track, onStatusChange, onPointClick }) => {
    const config = transportConfig[track.transportType];
    const points = track.points;
    const intervals = config.intervals;

    // Текущая позиция
    const pointIdx = points.findIndex(p => p.name === track.currentStatus);
    const interval = intervals.find(i => i.name === track.currentStatus);

    // Расчёт процента заполнения для маркера
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

    // Определение пройденных точек
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

    const isPointSelected = pointIdx !== -1;

    // Сортируем опции: сначала точки по порядку, потом интервалы по from
    const sortedOptions = [
        ...points.map(p => ({ type: 'point', name: p.name, order: points.indexOf(p) })),
        ...intervals.map(i => ({ type: 'interval', name: i.name, order: i.from }))
    ].sort((a, b) => a.order - b.order);

    // Для корректировки позиции маркера (чтобы он не выходил за границы)
    const markerStyle = {
        left: `calc(${fillPercent}% - 20px)` // 20px - половина ширины маркера (примерно)
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
                            className={`status-point ${completed[idx] ? 'completed' : ''} ${idx === pointIdx ? 'active' : ''}`}
                            onClick={() => onPointClick(idx)}
                        >
                            <span className="point-date">{point.date || point.name}</span>
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
                        <label>Текущий статус</label>
                        <select
                            className="form-select"
                            value={selectedStatus}
                            onChange={(e) => {
                                const newVal = e.target.value;
                                setSelectedStatus(newVal);
                                const newPointIdx = points.findIndex(p => p.name === newVal);
                                if (newPointIdx !== -1) {
                                    setDateInput(points[newPointIdx].date);
                                } else {
                                    setDateInput('');
                                }
                            }}
                        >
                            {sortedOptions.map(opt => (
                                <option key={opt.name} value={opt.name}>{opt.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="selector-item" style={{ display: isPointSelected ? 'block' : 'none' }}>
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