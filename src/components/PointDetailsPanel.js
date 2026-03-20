import React, { useState, useEffect } from 'react';
import DatePickerFlatpickr from './DatePickerFlatpickr';
import FilePreviewModal from './FilePreviewModal';
import { api } from '../api';

const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Б';
    const k = 1024;
    const sizes = ['Б', 'КБ', 'МБ', 'ГБ'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const PointDetailsPanel = ({ point, onUpdatePoint, onUploadFiles, onDeleteFile }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [comment, setComment] = useState('');
    const [date, setDate] = useState('');

    const [previewFile, setPreviewFile] = useState(null);

    useEffect(() => {
        setIsEditing(false);
        if (point) {
            setComment(point.comment || '');
            setDate(point.date || '');
        } else {
            setComment('');
            setDate('');
        }
    }, [point]);

    if (!point) {
        return <div className="point-details-placeholder">Выберите статус для просмотра деталей</div>;
    }

    const handleSave = () => {
        onUpdatePoint({ comment, date });
        setIsEditing(false);
    };

    const handleCancel = () => {
        setComment(point.comment || '');
        setDate(point.date || '');
        setIsEditing(false);
    };

    const handleClearDate = () => {
        setDate('');
    };

    const handleUploadClick = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.onchange = (e) => {
            const files = Array.from(e.target.files);
            onUploadFiles(files);
        };
        input.click();
    };

    const handleView = (fileId, fileName, fileType) => {
        setPreviewFile({ fileId, fileName, fileType });
    };

    const closePreview = () => {
        setPreviewFile(null);
    };

    return (
        <>
            <div className="point-details-panel">
                <div className="panel-header">
                    <h4>{point.name}</h4>
                    {!isEditing ? (
                        <button className="btn-edit" onClick={() => setIsEditing(true)}>
                            <i className="fas fa-pencil-alt"></i> Редактировать
                        </button>
                    ) : (
                        <div className="edit-actions">
                            <button className="btn-save" onClick={handleSave}>
                                <i className="fas fa-check"></i> Сохранить
                            </button>
                            <button className="btn-cancel" onClick={handleCancel}>
                                <i className="fas fa-times"></i> Отмена
                            </button>
                        </div>
                    )}
                </div>

                {!isEditing ? (
                    <div className="view-mode">
                        <div className="detail-row">
                            <label>Дата</label>
                            <div className="detail-value">{point.date || 'не указана'}</div>
                        </div>
                        <div className="detail-row">
                            <label>Комментарий</label>
                            <div className="detail-value">{point.comment || 'нет комментария'}</div>
                        </div>
                    </div>
                ) : (
                    <div className="edit-mode">
                        <div className="detail-row">
                            <label>Дата</label>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <DatePickerFlatpickr value={date} onChange={setDate} />
                                <button
                                    type="button"
                                    className="btn-clear-date"
                                    onClick={handleClearDate}
                                    title="Очистить дату"
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                        </div>
                        <div className="detail-row">
                            <label>Комментарий</label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Введите комментарий..."
                                rows={3}
                            />
                        </div>
                    </div>
                )}

                <div className="detail-row">
                    <label>Вложения</label>
                    <button className="btn-upload" onClick={handleUploadClick}>
                        <i className="fas fa-upload"></i> Загрузить файлы
                    </button>
                    <div className="file-list">
                        {point.files && point.files.length > 0 ? (
                            point.files.map((fileMeta) => (
                                <div key={fileMeta.id} className="file-item">
                                    <div className="file-info">
                                        <i className="fas fa-file-alt"></i>
                                        <span title={fileMeta.name}>
                                            {fileMeta.name} ({formatFileSize(fileMeta.size)})
                                        </span>
                                    </div>
                                    <div className="file-actions">
                                        <>
                                            <button
                                                className="btn-view"
                                                onClick={() => handleView(fileMeta.id, fileMeta.name, fileMeta.type)}
                                                title="Предпросмотр"
                                            >
                                                <i className="fas fa-eye"></i>
                                            </button>
                                            <a
                                                href={api.downloadFileUrl(fileMeta.id)}
                                                download={fileMeta.name}
                                                className="btn-download"
                                                title="Скачать"
                                            >
                                                <i className="fas fa-download"></i>
                                            </a>
                                        </>
                                        <button
                                            className="btn-delete-file"
                                            onClick={() => onDeleteFile(fileMeta.id)}
                                            title="Удалить файл"
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-files">Файлы отсутствуют</div>
                        )}
                    </div>
                </div>
            </div>

            <FilePreviewModal
                isOpen={!!previewFile}
                onClose={closePreview}
                fileId={previewFile?.fileId}
                fileName={previewFile?.fileName}
                fileType={previewFile?.fileType}
            />
        </>
    );
};

export default PointDetailsPanel;