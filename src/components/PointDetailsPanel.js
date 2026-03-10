import React, { useState, useEffect, useRef } from 'react';
import DatePickerFlatpickr from './DatePickerFlatpickr';
import { getFileFromDB } from '../utils/db';
import FilePreviewModal from './FilePreviewModal';

// Форматирование размера файла
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
    const [fileUrls, setFileUrls] = useState({});      // id -> url
    const fileUrlsRef = useRef({});                     // кеш для уже загруженных URL
    const prevPointRef = useRef(null);                  // предыдущий point для отслеживания смены точки

    // Для модала предпросмотра
    const [previewFile, setPreviewFile] = useState(null); // { fileId, fileName, fileType }

    // Сброс состояния при смене точки
    useEffect(() => {
        if (prevPointRef.current !== point) {
            // точка изменилась — очищаем кеш и состояние
            Object.values(fileUrlsRef.current).forEach(url => URL.revokeObjectURL(url));
            fileUrlsRef.current = {};
            setFileUrls({});
            prevPointRef.current = point;
        }
    }, [point]);

    // Обновление полей и сброс режима редактирования при смене точки
    useEffect(() => {
        // Закрываем режим редактирования при переключении на другую точку
        setIsEditing(false);
        // Устанавливаем данные из текущей точки
        if (point) {
            setComment(point.comment || '');
            setDate(point.date || '');
        } else {
            setComment('');
            setDate('');
        }
    }, [point]);

    // Загрузка файлов, которых ещё нет в кеше
    useEffect(() => {
        if (!point || !point.files || point.files.length === 0) {
            // Нет файлов — очищаем всё
            Object.values(fileUrlsRef.current).forEach(url => URL.revokeObjectURL(url));
            fileUrlsRef.current = {};
            setFileUrls({});
            return;
        }

        const loadMissingFiles = async () => {
            const newUrls = {};
            const filesToLoad = point.files.filter(fileMeta => !fileUrlsRef.current[fileMeta.id]);

            if (filesToLoad.length === 0) {
                // Все файлы уже загружены — просто обновляем состояние из кеша
                setFileUrls({ ...fileUrlsRef.current });
                return;
            }

            await Promise.all(filesToLoad.map(async (fileMeta) => {
                try {
                    const file = await getFileFromDB(fileMeta.id);
                    if (file && file.url) {
                        newUrls[fileMeta.id] = file.url;
                    } else {
                        console.warn('Файл не найден в БД:', fileMeta.id);
                    }
                } catch (error) {
                    console.error('Ошибка загрузки файла', fileMeta.id, error);
                }
            }));

            // Добавляем новые URL в кеш и состояние
            Object.assign(fileUrlsRef.current, newUrls);
            setFileUrls({ ...fileUrlsRef.current });
        };

        loadMissingFiles();

        // Очистка при размонтировании
        return () => {
            Object.values(fileUrlsRef.current).forEach(url => URL.revokeObjectURL(url));
        };
    }, [point]);

    // При удалении файла нужно сразу убрать его URL из состояния и кеша
    const handleDelete = (fileId) => {
        // Удаляем из кеша
        if (fileUrlsRef.current[fileId]) {
            URL.revokeObjectURL(fileUrlsRef.current[fileId]);
            delete fileUrlsRef.current[fileId];
        }
        // Удаляем из состояния
        setFileUrls(prev => {
            const newUrls = { ...prev };
            delete newUrls[fileId];
            return newUrls;
        });
        // Вызываем родительский обработчик
        onDeleteFile(fileId);
    };

    // Открыть предпросмотр файла
    const handleView = (fileId, fileName, fileType) => {
        setPreviewFile({ fileId, fileName, fileType });
    };

    const closePreview = () => {
        setPreviewFile(null);
    };

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
                            <DatePickerFlatpickr value={date} onChange={setDate} />
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
                            point.files.map((fileMeta) => {
                                const url = fileUrls[fileMeta.id];
                                return (
                                    <div key={fileMeta.id} className="file-item">
                                        <div className="file-info">
                                            <i className="fas fa-file-alt"></i>
                                            <span title={fileMeta.name}>
                                                {fileMeta.name} ({formatFileSize(fileMeta.size)})
                                            </span>
                                        </div>
                                        <div className="file-actions">
                                            {url ? (
                                                <>
                                                    <button
                                                        className="btn-view"
                                                        onClick={() => handleView(fileMeta.id, fileMeta.name, fileMeta.type)}
                                                        title="Предпросмотр"
                                                    >
                                                        <i className="fas fa-eye"></i>
                                                    </button>
                                                    <a
                                                        href={url}
                                                        download={fileMeta.name}
                                                        className="btn-download"
                                                        title="Скачать"
                                                    >
                                                        <i className="fas fa-download"></i>
                                                    </a>
                                                </>
                                            ) : (
                                                <span className="loading">загрузка...</span>
                                            )}
                                            <button
                                                className="btn-delete-file"
                                                onClick={() => handleDelete(fileMeta.id)}
                                                title="Удалить файл"
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
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