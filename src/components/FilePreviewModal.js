import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { api } from '../api';
import {
    isNativePreviewable,
    isOfficeFile,
    isAudio,
    isVideo,
    isTextFile,
    getFileIcon
} from '../utils/filePreview';
import OfficePreview from './OfficePreview';

const FilePreviewModal = ({ isOpen, onClose, fileId, fileName, fileType }) => {
    const [fileData, setFileData] = useState(null); // { blob, url }
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [textContent, setTextContent] = useState(null); // для текстовых файлов
    const fileUrlRef = useRef(null); // для хранения текущего blob-URL и его очистки

    // Очистка URL при размонтировании или смене fileId
    useEffect(() => {
        return () => {
            if (fileUrlRef.current) {
                URL.revokeObjectURL(fileUrlRef.current);
                fileUrlRef.current = null;
            }
        };
    }, [fileId]);

    // Загрузка файла
    useEffect(() => {
        if (!isOpen || !fileId) return;

        const loadFile = async () => {
            try {
                setLoading(true);
                // Очищаем предыдущий URL перед загрузкой нового
                if (fileUrlRef.current) {
                    URL.revokeObjectURL(fileUrlRef.current);
                    fileUrlRef.current = null;
                }
                setFileData(null);
                setTextContent(null);

                const response = await fetch(api.getFileUrl(fileId));
                if (!response.ok) {
                    setError('Файл не найден');
                    return;
                }
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                fileUrlRef.current = url;
                setFileData({ url, blob });

                // Если файл текстовый, загружаем его содержимое как текст
                if (isTextFile(fileName, fileType)) {
                    const text = await blob.text();
                    setTextContent(text);
                }
            } catch (err) {
                setError('Ошибка загрузки файла');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadFile();
    }, [isOpen, fileId, fileName, fileType]);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const renderPreview = () => {
        if (loading) return <div className="preview-loading">Загрузка файла...</div>;
        if (error) return <div className="preview-error">{error}</div>;
        if (!fileData) return <p>Файл не доступен</p>;

        const { url, blob } = fileData;
        const iconClass = getFileIcon(fileType);

        // 1. Текстовые файлы (включая .lua, .js и т.д.) — показываем в <pre> с белым фоном
        if (isTextFile(fileName, fileType)) {
            if (textContent === null) return <div className="preview-loading">Загрузка текста...</div>;
            return (
                <pre className="text-preview">
                    {textContent}
                </pre>
            );
        }

        // 2. Изображения
        if (fileType?.startsWith('image/')) {
            return <img src={url} alt={fileName} className="preview-image" />;
        }

        // 3. Аудио
        if (isAudio(fileType)) {
            return (
                <audio controls className="preview-audio">
                    <source src={url} type={fileType} />
                    Ваш браузер не поддерживает аудио.
                </audio>
            );
        }

        // 4. Видео
        if (isVideo(fileType)) {
            return (
                <video controls className="preview-video">
                    <source src={url} type={fileType} />
                    Ваш браузер не поддерживает видео.
                </video>
            );
        }

        // 5. PDF и другие нативные (кроме текста, который уже обработан)
        if (isNativePreviewable(fileType)) {
            return <iframe src={url} title={fileName} className="preview-iframe" />;
        }

        // 6. Офисные файлы (Word, Excel)
        if (isOfficeFile(fileType)) {
            return <OfficePreview blob={blob} mimeType={fileType} />;
        }

        // 7. Все остальные типы — только скачивание (без открытия в новой вкладке)
        return (
            <div className="preview-unsupported">
                <i className={`fas ${iconClass}`} style={{ fontSize: '4rem', color: '#2563eb', marginBottom: '1rem' }}></i>
                <p>Предпросмотр для этого типа файлов не поддерживается.</p>
                <p>Вы можете скачать файл, чтобы открыть его в соответствующей программе.</p>
                <a
                    href={api.downloadFileUrl(fileId)}
                    download={fileName}
                    className="btn-download"
                    style={{ marginTop: '1rem' }}
                >
                    <i className="fas fa-download"></i> Скачать
                </a>
            </div>
        );
    };

    return ReactDOM.createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content preview-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h5 className="modal-title">{fileName}</h5>
                    <button className="btn-close" onClick={onClose}></button>
                </div>
                <div className="modal-body preview-body">
                    {renderPreview()}
                </div>
                <div className="modal-footer">
                    <button className="modal-btn modal-btn-secondary" onClick={onClose}>Закрыть</button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default FilePreviewModal;