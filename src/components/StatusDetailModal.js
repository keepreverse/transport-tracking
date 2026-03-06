import React, { useState } from 'react';
import Modal from './Modal';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.min.css'; // базовые стили

const StatusDetailModal = ({ isOpen, onClose, point, onUpdatePoint, onUploadFiles }) => {
    const [comment, setComment] = useState(point?.comment || '');
    const [date, setDate] = useState(point?.date || null);

    const handleCommentBlur = () => {
        if (point && comment !== point.comment) {
            onUpdatePoint({ comment });
        }
    };

    const handleDateChange = (selectedDates) => {
        const newDate = selectedDates[0] ? selectedDates[0].toLocaleDateString('ru-RU') : '';
        setDate(newDate);
        onUpdatePoint({ date: newDate });
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

    if (!point) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={point.name}>
            <div className="status-detail-info">
                <h6>Дата:</h6>
                <Flatpickr
                    className="form-control"
                    value={date}
                    onChange={handleDateChange}
                    options={{ dateFormat: 'd.m.Y', allowInput: true, locale: 'ru' }}
                />
                <h6 className="mt-3">Комментарий</h6>
                <textarea
                    className="comment-input"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    onBlur={handleCommentBlur}
                    placeholder="Введите комментарий..."
                />
            </div>
            <div className="files-section" style={{ marginTop: 0, padding: 0, background: 'transparent' }}>
                <div className="files-header">
                    <h6><i className="fas fa-paperclip me-2"></i>Прикреплённые файлы</h6>
                    <button className="btn-upload" style={{ padding: '6px 16px' }} onClick={handleUploadClick}>
                        <i className="fas fa-upload"></i> Загрузить
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
        </Modal>
    );
};

export default StatusDetailModal;