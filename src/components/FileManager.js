import React from 'react';

const FileManager = ({ point, onUpload }) => {
    if (!point) {
        return (
            <div className="files-section">
                <div className="empty-files">Выберите точечный статус</div>
            </div>
        );
    }

    const handleUploadClick = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.onchange = (e) => {
            const files = Array.from(e.target.files);
            onUpload(files);
        };
        input.click();
    };

    return (
        <div className="files-section">
            <div className="files-header">
                <h5><i className="fas fa-paperclip me-2"></i>Файлы: {point.name}</h5>
                <button className="btn-upload" onClick={handleUploadClick}>
                    <i className="fas fa-upload me-2"></i>Загрузить
                </button>
            </div>
            <div className="file-list">
                {point.files && point.files.length > 0 ? (
                    point.files.map((file, idx) => (
                        <div key={idx} className="file-item">
                            <div className="file-info">
                                <i className="fas fa-file-alt"></i>
                                <span>{file.name}</span>
                            </div>
                            <a href={file.dataUrl} download={file.name} className="btn-download">
                                <i className="fas fa-download me-1"></i>Скачать
                            </a>
                        </div>
                    ))
                ) : (
                    <div className="empty-files">Файлы отсутствуют</div>
                )}
            </div>
        </div>
    );
};

export default FileManager;