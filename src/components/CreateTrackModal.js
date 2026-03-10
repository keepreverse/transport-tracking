import React, { useState } from 'react';
import Modal from './Modal';

const CreateTrackModal = ({ isOpen, onClose, onCreate }) => {
    const [name, setName] = useState('');
    const [type, setType] = useState('auto');
    const [supplier, setSupplier] = useState('Angela');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        onCreate(name.trim(), type, supplier);
        setName('');
        setType('auto');
        setSupplier('Angela');
        onClose();
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
                        {['auto', 'train', 'air', 'sea_rail'].map(t => (
                            <label key={t} className="transport-option">
                                <input
                                    type="radio"
                                    name="transportType"
                                    value={t}
                                    checked={type === t}
                                    onChange={(e) => setType(e.target.value)}
                                />
                                <i className={`fas ${t === 'auto' ? 'fa-truck' : t === 'train' ? 'fa-train' : t === 'air' ? 'fa-plane' : 'fa-ship'}`}></i>
                                {t === 'auto' ? 'Авто' : t === 'train' ? 'ЖД' : t === 'air' ? 'Авиа' : 'Море + ЖД'}
                            </label>
                        ))}
                    </div>
                </div>
                <div className="mb-3">
                    <label className="form-label">Поставщик</label>
                    <div className="supplier-options">
                        {['Angela', 'Wendy'].map(s => (
                            <label key={s} className="supplier-option">
                                <input
                                    type="radio"
                                    name="supplier"
                                    value={s}
                                    checked={supplier === s}
                                    onChange={(e) => setSupplier(e.target.value)}
                                />
                                <i className={`fas fa-user`}></i> {s}
                            </label>
                        ))}
                    </div>
                </div>
                <div className="modal-footer">
                    <button type="button" className="modal-btn modal-btn-secondary" onClick={onClose}>Отмена</button>
                    <button type="submit" className="modal-btn modal-btn-primary">Создать</button>
                </div>
            </form>
        </Modal>
    );
};

export default CreateTrackModal;