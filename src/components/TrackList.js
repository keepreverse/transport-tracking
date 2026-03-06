import React from 'react';
import TrackCard from './TrackCard';

const TrackList = ({ tracks }) => {
    if (tracks.length === 0) {
        return <div className="empty-files" style={{ marginTop: 40 }}>Нет треков</div>;
    }

    return (
        <div className="tracks-grid">
            {tracks.map(track => (
                <TrackCard key={track.id} track={track} />
            ))}
        </div>
    );
};

export default TrackList;