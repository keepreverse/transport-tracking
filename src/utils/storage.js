import { transportConfig } from './config';

const STORAGE_KEY = 'transport_tracks_v3';

export const loadTracks = () => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
};

export const saveTracks = (tracks) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tracks));
};

// storage.js
export const createTrack = (name, type) => {
    const config = transportConfig[type];
    const points = config.points.map(p => ({
        name: p.name,
        icon: p.icon,
        date: '',
        files: [], // теперь здесь будут храниться только метаданные: [{ id, name, size, type }]
        comment: ''
    }));
    return {
        id: Date.now().toString(),
        name,
        transportType: type,
        points,
        currentStatus: config.points[0].name,
        intervalProgress: 50
    };
};