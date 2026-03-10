import { transportConfig } from './config';

const STORAGE_KEY = 'transport_tracks_v3';

export const loadTracks = () => {
    const data = localStorage.getItem(STORAGE_KEY);
    const tracks = data ? JSON.parse(data) : [];
    // Для обратной совместимости: если у трека нет supplier, добавляем по умолчанию 'Angela'
    return tracks.map(track => ({
        ...track,
        supplier: track.supplier || 'Angela'
    }));
};

export const saveTracks = (tracks) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tracks));
};

export const createTrack = (name, type, supplier) => {
    const config = transportConfig[type];
    const points = config.points.map(p => ({
        name: p.name,
        icon: p.icon,
        date: '',
        files: [],
        comment: ''
    }));
    return {
        id: Date.now().toString(),
        name,
        transportType: type,
        supplier: supplier || 'Angela',
        points,
        currentStatus: config.points[0].name,
        intervalProgress: 50
    };
};