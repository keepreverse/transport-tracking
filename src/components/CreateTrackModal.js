import React, { useState } from 'react';
import Modal from './Modal';

const CreateTrackModal = ({ isOpen, onClose, onCreate }) => {
    const [name, setName] = useState('');
    const [type, setType] = useState('auto');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        onCreate(name.trim(), type);
        setName('');
        setType('auto');
        onClose(); // просто закрываем, без перехода
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Новая перевозка">
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">Название</label>
                    <input
                        type="text"
                        className="form-control"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="например, Груз №123"
                        autoFocus
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Вид транспорта</label>
                    <div className="transport-options">
                        <label className="transport-option">
                            <input
                                type="radio"
                                name="transportType"
                                value="auto"
                                checked={type === 'auto'}
                                onChange={(e) => setType(e.target.value)}
                            />
                            <i className="fas fa-truck"></i> Авто
                        </label>
                        <label className="transport-option">
                            <input
                                type="radio"
                                name="transportType"
                                value="train"
                                checked={type === 'train'}
                                onChange={(e) => setType(e.target.value)}
                            />
                            <i className="fas fa-train"></i> ЖД
                        </label>
                        <label className="transport-option">
                            <input
                                type="radio"
                                name="transportType"
                                value="air"
                                checked={type === 'air'}
                                onChange={(e) => setType(e.target.value)}
                            />
                            <i className="fas fa-plane"></i> Авиа
                        </label>
                        <label className="transport-option">
                            <input
                                type="radio"
                                name="transportType"
                                value="sea_rail"
                                checked={type === 'sea_rail'}
                                onChange={(e) => setType(e.target.value)}
                            />
                            <i className="fas fa-ship"></i> + <i className="fas fa-train"></i> Море+ЖД
                        </label>
                    </div>
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={onClose}>Отмена</button>
                    <button type="submit" className="btn btn-primary">Создать</button>
                </div>
            </form>
        </Modal>
    );
};

export default CreateTrackModal;