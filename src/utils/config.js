export const transportConfig = {
    auto: {
        points: [
            { name: 'Отгрузка', icon: 'fa-industry' },
            { name: 'Граница', icon: 'fa-flag' },
            { name: 'СВХ', icon: 'fa-cubes' },
            { name: 'Доставлено', icon: 'fa-warehouse' }
        ],
        intervals: [
            { name: 'в пути до границы', from: 0, to: 1 },
            { name: 'в пути до СВХ', from: 1, to: 2 },
            { name: 'в пути до склада', from: 2, to: 3 }
        ]
    },
    train: {
        points: [
            { name: 'Отгрузка', icon: 'fa-industry' },
            { name: 'Станция отправления', icon: 'fa-train' },
            { name: 'Граница', icon: 'fa-flag' },
            { name: 'СВХ', icon: 'fa-cubes' },
            { name: 'Доставлено', icon: 'fa-warehouse' }
        ],
        intervals: [
            { name: 'в пути до станции отправления', from: 0, to: 1 },
            { name: 'в пути до границы', from: 1, to: 2 },
            { name: 'в пути до СВХ', from: 2, to: 3 },
            { name: 'в пути до склада', from: 3, to: 4 }
        ]
    },
    air: {
        points: [
            { name: 'Отгрузка', icon: 'fa-industry' },
            { name: 'Аэропорт отправления', icon: 'fa-plane-departure' },
            { name: 'Аэропорт прибытия', icon: 'fa-plane-arrival' },
            { name: 'Доставлено', icon: 'fa-warehouse' }
        ],
        intervals: [
            { name: 'в пути до аэропорта', from: 0, to: 1 },
            { name: 'В полете', from: 1, to: 2 },
            { name: 'в пути до склада', from: 2, to: 3, transportIcon: 'fa-truck' }
        ]
    },
    sea_rail: {
        points: [
            { name: 'Отгрузка', icon: 'fa-industry' },
            { name: 'Порт отправления', icon: 'fa-ship' },
            { name: 'Порт прибытия', icon: 'fa-ship' },
            { name: 'Перегруз на ЖД', icon: 'fa-train' },
            { name: 'Доставлено', icon: 'fa-warehouse' }
        ],
        intervals: [
            { name: 'в пути до порта отправления', from: 0, to: 1 },
            { name: 'В плавании', from: 1, to: 2 },
            { name: 'в пути до склада', from: 3, to: 4, transportIcon: 'fa-truck' }
        ]
    }
};

export const getTransportIcon = (type) => {
    const map = {
        auto: 'fa-truck',
        train: 'fa-train',
        air: 'fa-plane',
        sea_rail: 'fa-ship'
    };
    return map[type] || 'fa-question';
};

export const getTransportName = (type) => {
    const names = {
        auto: 'Авто',
        train: 'ЖД',
        air: 'Авиа',
        sea_rail: 'Море+ЖД'
    };
    return names[type] || type;
};