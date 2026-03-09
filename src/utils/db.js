// Открываем базу данных
const DB_NAME = 'TransportTracksDB';
const DB_VERSION = 1;
const STORE_NAME = 'files';

let db = null;

// Полифилл для crypto.randomUUID (для старых браузеров)
function generateUUID() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // Fallback: генерация случайного UUID v4
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : ((r & 0x3) | 0x8);
        return v.toString(16);
    });
}

const openDB = () => {
    return new Promise((resolve, reject) => {
        if (db) {
            resolve(db);
            return;
        }
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
            console.error('IndexedDB error:', event.target.error);
            reject(event.target.error);
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };
    });
};

// Вспомогательная функция: dataURL -> Blob
function dataURLToBlob(dataURL) {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
}

// Сохранить файл в IndexedDB, возвращает id
export const saveFileToDB = async (file) => {
    const db = await openDB();
    const id = generateUUID();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const blob = dataURLToBlob(file.dataUrl);
        const fileData = {
            id,
            name: file.name,
            size: file.size,
            type: file.type,
            blob: blob
        };
        const request = store.add(fileData);
        request.onsuccess = () => resolve(id);
        request.onerror = (e) => reject(e.target.error);
    });
};

// Получить файл по ID (возвращает объект с blob и url)
export const getFileFromDB = async (id) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(id);
        request.onsuccess = () => {
            const fileData = request.result;
            if (fileData && fileData.blob) {
                const url = URL.createObjectURL(fileData.blob);
                resolve({ ...fileData, url });
            } else {
                resolve(null);
            }
        };
        request.onerror = (e) => reject(e.target.error);
    });
};

// Удалить файл по ID
export const deleteFileFromDB = async (id) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = (e) => reject(e.target.error);
    });
};

// Удалить несколько файлов по массиву ID
export const deleteFilesFromDB = async (ids) => {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    return Promise.all(ids.map(id => {
        return new Promise((resolve, reject) => {
            const request = store.delete(id);
            request.onsuccess = () => resolve();
            request.onerror = (e) => reject(e.target.error);
        });
    }));
};