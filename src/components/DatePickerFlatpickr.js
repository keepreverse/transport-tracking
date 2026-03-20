import React from 'react';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import 'flatpickr/dist/l10n/ru.js';


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