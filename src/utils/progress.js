import { transportConfig } from './config';

export const getProgressPercent = (track) => {
    const config = transportConfig[track.transportType];
    const points = track.points;
    const pointIdx = points.findIndex(p => p.name === track.currentStatus);
    const interval = config.intervals.find(i => i.name === track.currentStatus);

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
