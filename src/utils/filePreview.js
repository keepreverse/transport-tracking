export const isNativePreviewable = (mimeType) => {
    if (!mimeType) return false;
    return (
        mimeType.startsWith('image/') ||
        mimeType === 'application/pdf' ||
        mimeType.startsWith('text/')
    );
};

export const OFFICE_TYPES = {
    DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    DOC: 'application/msword',
    XLSX: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    XLS: 'application/vnd.ms-excel',
    PPTX: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    PPT: 'application/vnd.ms-powerpoint',
};

export const isOfficeFile = (mimeType) => {
    return Object.values(OFFICE_TYPES).includes(mimeType);
};

export const isAudio = (mimeType) => mimeType?.startsWith('audio/');
export const isVideo = (mimeType) => mimeType?.startsWith('video/');

const TEXT_EXTENSIONS = [
    'txt', 'js', 'jsx', 'ts', 'tsx', 'html', 'htm', 'css', 'scss', 'less',
    'json', 'xml', 'yaml', 'yml', 'md', 'markdown', 'lua', 'py', 'rb', 'php',
    'java', 'c', 'cpp', 'h', 'hpp', 'cs', 'go', 'rs', 'swift', 'kt', 'sh',
    'bat', 'ps1', 'ini', 'cfg', 'conf', 'log', 'sql', 'gitignore'
];

export const isTextFile = (fileName, mimeType) => {
    if (mimeType && mimeType.startsWith('text/')) return true;
    if (!fileName) return false;
    const ext = fileName.split('.').pop()?.toLowerCase();
    return ext ? TEXT_EXTENSIONS.includes(ext) : false;
};

export const getFileIcon = (mimeType) => {
    if (!mimeType) return 'fa-file-alt';
    if (mimeType.startsWith('image/')) return 'fa-file-image';
    if (mimeType === 'application/pdf') return 'fa-file-pdf';
    if (mimeType.includes('word') || mimeType.includes('msword') || mimeType === OFFICE_TYPES.DOCX || mimeType === OFFICE_TYPES.DOC)
        return 'fa-file-word';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet') || mimeType === OFFICE_TYPES.XLSX || mimeType === OFFICE_TYPES.XLS)
        return 'fa-file-excel';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation') || mimeType === OFFICE_TYPES.PPTX || mimeType === OFFICE_TYPES.PPT)
        return 'fa-file-powerpoint';
    if (mimeType.startsWith('text/')) return 'fa-file-alt';
    if (isAudio(mimeType)) return 'fa-file-audio';
    if (isVideo(mimeType)) return 'fa-file-video';
    return 'fa-file';
};