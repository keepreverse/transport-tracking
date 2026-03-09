import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import * as mammoth from 'mammoth';
import { OFFICE_TYPES } from '../utils/filePreview';

const renderExcel = (arrayBuffer) => {
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const html = XLSX.utils.sheet_to_html(worksheet);
    return html; // возвращаем строку, а не объект
};

const renderWord = async (arrayBuffer) => {
    const result = await mammoth.convertToHtml({ arrayBuffer });
    return result.value; // строка
};

// Заглушка для PowerPoint
const renderPowerPoint = () => {
    return '<p class="preview-unsupported-message">Предпросмотр PowerPoint временно недоступен</p>';
};

const OfficePreview = ({ blob, mimeType }) => {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!blob) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            const arrayBuffer = e.target.result;
            try {
                let html = '';
                if (mimeType === OFFICE_TYPES.DOCX || mimeType === OFFICE_TYPES.DOC) {
                    html = await renderWord(arrayBuffer);
                } else if (mimeType === OFFICE_TYPES.XLSX || mimeType === OFFICE_TYPES.XLS) {
                    html = renderExcel(arrayBuffer);
                } else if (mimeType === OFFICE_TYPES.PPTX || mimeType === OFFICE_TYPES.PPT) {
                    html = renderPowerPoint();
                } else {
                    throw new Error('Неподдерживаемый тип файла');
                }
                setContent(html);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        reader.readAsArrayBuffer(blob);
    }, [blob, mimeType]);

    if (loading) return <div className="preview-loading">Загрузка предпросмотра...</div>;
    if (error) return <div className="preview-error">Ошибка: {error}</div>;
    if (!content) return <div className="preview-error">Не удалось загрузить содержимое</div>;

    return (
        <div
            className="office-preview"
            dangerouslySetInnerHTML={{ __html: content }}
        />
    );
};

export default OfficePreview;