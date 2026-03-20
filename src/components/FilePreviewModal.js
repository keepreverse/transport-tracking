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
    const [fileData, setFileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [textContent, setTextContent] = useState(null);
    const fileUrlRef = useRef(null);

    useEffect(() => {
        return () => {
            if (fileUrlRef.current) {
                URL.revokeObjectURL(fileUrlRef.current);
                fileUrlRef.current = null;
            }
        };
    }, [fileId]);

    useEffect(() => {
        if (!isOpen || !fileId) return;

        const loadFile = async () => {
            try {
                setLoading(true);
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

        if (isTextFile(fileName, fileType)) {
            if (textContent === null) return <div className="preview-loading">Загрузка текста...</div>;
            return (
                <pre className="text-preview">
                    {textContent}
                </pre>
            );
        }

        if (fileType?.startsWith('image/')) {
            return <img src={url} alt={fileName} className="preview-image" />;
        }

        if (isAudio(fileType)) {
            return (
                <audio controls className="preview-audio">
                    <source src={url} type={fileType} />
                    Ваш браузер не поддерживает аудио.
                </audio>
            );
        }

        if (isVideo(fileType)) {
            return (
                <video controls className="preview-video">
                    <source src={url} type={fileType} />
                    Ваш браузер не поддерживает видео.
                </video>
            );
        }

        if (isNativePreviewable(fileType)) {
            return <iframe src={url} title={fileName} className="preview-iframe" />;
        }

        if (isOfficeFile(fileType)) {
            return <OfficePreview blob={blob} mimeType={fileType} />;
        }

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