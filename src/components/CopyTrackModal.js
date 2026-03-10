import React from 'react';
import Modal from './Modal';

const CopyTrackModal = ({ isOpen, onClose, onConfirm }) => {
    const handleCopyWithFiles = () => {
        onConfirm(true);
        onClose();
    };

    const handleCopyWithoutFiles = () => {
        onConfirm(false);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Копирование перевозки">
            <div className="copy-modal-content">
                <p className="copy-modal-text">Копировать вместе с вложениями?</p>
            </div>
            <div className="modal-footer">
                <button className="modal-btn modal-btn-primary" onClick={handleCopyWithFiles}>
                    Да, с вложениями
                </button>
                <button className="modal-btn modal-btn-secondary" onClick={handleCopyWithoutFiles}>
                    Нет, только данные
                </button>
            </div>
        </Modal>
    );
};

export default CopyTrackModal;