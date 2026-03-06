import React from 'react';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
// Убираем импорт темы, чтобы использовать стандартную (можно настроить через CSS)

const DatePickerFlatpickr = ({ value, onChange, placeholder = 'дд.мм.гггг' }) => {
    return (
        <Flatpickr
            value={value || ''}
            onChange={(selectedDates, dateStr) => {
                onChange(dateStr);
            }}
            options={{
                locale: 'ru',
                dateFormat: 'd.m.Y',
                allowInput: true,
                placeholder: placeholder,
            }}
            className="form-control"
        />
    );
};

export default DatePickerFlatpickr;