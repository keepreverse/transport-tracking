import React from 'react';
import TrackCard from './TrackCard';

const TrackList = ({ tracks, onUpdateTrack, onCopyTrack, onDeleteTrack }) => {
    if (tracks.length === 0) {
        return <div className="empty-files" style={{ marginTop: 'clamp(2rem, 4vh, 3rem)' }}>Нет треков</div>;
    }

    return (
        <div className="tracks-grid">
            {tracks.map(track => (
                <TrackCard
                    key={track.id}
                    track={track}
                    onUpdateTrack={onUpdateTrack}
                    onCopy={onCopyTrack}
                    onDelete={onDeleteTrack}
                />
            ))}
        </div>
    );
};

export default TrackList;