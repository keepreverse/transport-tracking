export const getProgressPercent = (track) => {
    const pointIdx = track.points.findIndex(p => p.name === track.currentStatus);
    if (pointIdx === -1) return 0;
    return (pointIdx / (track.points.length - 1)) * 100;
};