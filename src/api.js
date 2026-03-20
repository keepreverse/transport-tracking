const API_BASE = 'https://api.tracker.harucase.synology.me';

export const api = {
    getTracks: (params = {}) => {
        const url = new URL(`${API_BASE}/tracks/`);
        if (params.transport) url.searchParams.append('transport', params.transport);
        if (params.supplier) url.searchParams.append('supplier', params.supplier);
        if (params.search) url.searchParams.append('search', params.search);
        if (params.sort) url.searchParams.append('sort', params.sort);
        return fetch(url).then(res => {
            if (!res.ok) throw new Error('Ошибка загрузки треков');
            return res.json();
        });
    },

    getTrack: (id) => fetch(`${API_BASE}/tracks/${id}`).then(res => {
        if (!res.ok) throw new Error('Трек не найден');
        return res.json();
    }),

    createTrack: (trackData) => fetch(`${API_BASE}/tracks/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trackData)
    }).then(res => {
        if (!res.ok) throw new Error('Ошибка создания трека');
        return res.json();
    }),

    updateTrack: (id, trackData) => {
        const payload = {};
        if (trackData.name) payload.name = trackData.name;
        if (trackData.currentStatus) payload.currentStatus = trackData.currentStatus;
        if (trackData.pointUpdates && trackData.pointUpdates.length > 0) {
            payload.points = trackData.pointUpdates;
        }
        return fetch(`${API_BASE}/tracks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }).then(res => {
            if (!res.ok) throw new Error('Ошибка обновления трека');
            return res.json();
        });
    },

    copyTrack: (id, withFiles) => fetch(`${API_BASE}/tracks/${id}/copy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ withFiles })
    }).then(res => {
        if (!res.ok) throw new Error('Ошибка копирования трека');
        return res.json();
    }),

    deleteTrack: (id) => fetch(`${API_BASE}/tracks/${id}`, {
        method: 'DELETE'
    }).then(res => {
        if (!res.ok) throw new Error('Ошибка удаления трека');
        return res.json();
    }),

    uploadFiles: (pointId, files) => {
        const formData = new FormData();
        formData.append('pointId', pointId);
        files.forEach(f => formData.append('files', f));
        return fetch(`${API_BASE}/files/upload`, {
            method: 'POST',
            body: formData
        }).then(res => {
            if (!res.ok) throw new Error('Ошибка загрузки файлов');
            return res.json();
        });
    },

    getFileUrl: (fileId) => `${API_BASE}/files/${fileId}`,
    downloadFileUrl: (fileId) => `${API_BASE}/files/${fileId}/download`,

    deleteFile: (fileId) => fetch(`${API_BASE}/files/${fileId}`, {
        method: 'DELETE'
    }).then(res => {
        if (!res.ok) throw new Error('Ошибка удаления файла');
        return res.json();
    })
};