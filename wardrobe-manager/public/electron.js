const { app, BrowserWindow, session, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const isDev = require('electron-is-dev');
const convert = require('heic-convert');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, 'preload.js')
        },
        titleBarStyle: 'hiddenInset',
        show: false
    });

    mainWindow.loadURL(
        isDev
            ? 'http://localhost:3000'
            : `file://${path.join(__dirname, '../build/index.html')}`
    );

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    if (isDev) {
        mainWindow.webContents.openDevTools();
    }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

ipcMain.handle('select-images', async () => {
    console.log('select-images handler called');

    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile', 'multiSelections'],
        filters: [
            { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'heic', 'webp'] },
            { name: 'All Files', extensions: ['*'] }
        ]
    });

    console.log('Dialog result:', result);

    if (result.canceled) {
        console.log('Dialog canceled');
        return [];
    }

    console.log('Selected files:', result.filePaths);

    // Convert images to base64 for storage
    const imagePromises = result.filePaths.map(async (filePath) => {
        try {
            console.log('Processing file:', filePath);
            const ext = path.extname(filePath).toLowerCase();
            let imageBuffer;
            let mimeType = 'image/jpeg';

            if (ext === '.heic') {
                console.log('Converting HEIC file:', filePath);
                try {
                    const inputBuffer = await fs.readFile(filePath);
                    imageBuffer = await convert({
                        buffer: inputBuffer,
                        format: 'JPEG',
                        quality: 0.9
                    });
                    mimeType = 'image/jpeg';
                    console.log('HEIC conversion successful');
                } catch (heicError) {
                    console.error('HEIC conversion failed:', heicError);
                    // Fallback: try to read as regular file
                    imageBuffer = await fs.readFile(filePath);
                    mimeType = 'image/heic';
                }
            } else {
                // Regular image processing
                imageBuffer = await fs.readFile(filePath);

                if (ext === '.png') mimeType = 'image/png';
                else if (ext === '.webp') mimeType = 'image/webp';
                else if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
            }

            const base64 = `data:${mimeType};base64,${imageBuffer.toString('base64')}`;
            console.log('Converted to base64, length:', base64.length);
            return base64;
        } catch (error) {
            console.error('Error processing image:', filePath, error);
            return null;
        }
    });

    const base64Images = await Promise.all(imagePromises);
    const validImages = base64Images.filter(img => img !== null);
    console.log('Returning images count:', validImages.length);

    // Show conversion summary if HEIC files were processed
    const heicFiles = result.filePaths.filter(fp => path.extname(fp).toLowerCase() === '.heic');
    if (heicFiles.length > 0) {
        const convertedCount = heicFiles.length;
        dialog.showMessageBox(mainWindow, {
            type: 'info',
            title: 'Konwersja HEIC',
            message: `Skonwertowano ${convertedCount} plików HEIC`,
            detail: 'Pliki HEIC zostały automatycznie skonwertowane do formatu JPG dla lepszej kompatybilności.',
            buttons: ['OK']
        });
    }

    return validImages;
});

ipcMain.handle('save-data', async (event, data) => {
    try {
        const userDataPath = app.getPath('userData');
        const dataPath = path.join(userDataPath, 'wardrobe-data.json');
        await fs.writeFile(dataPath, JSON.stringify(data, null, 2));
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('load-data', async () => {
    try {
        const userDataPath = app.getPath('userData');
        const dataPath = path.join(userDataPath, 'wardrobe-data.json');
        const data = await fs.readFile(dataPath, 'utf8');
        return { success: true, data: JSON.parse(data) };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('export-data', async () => {
    const result = await dialog.showSaveDialog(mainWindow, {
        filters: [{ name: 'JSON', extensions: ['json'] }]
    });

    if (result.canceled) return { success: false };

    try {
        const userDataPath = app.getPath('userData');
        const dataPath = path.join(userDataPath, 'wardrobe-data.json');
        const data = await fs.readFile(dataPath, 'utf8');
        await fs.writeFile(result.filePath, data);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('import-data', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        filters: [{ name: 'JSON', extensions: ['json'] }],
        properties: ['openFile']
    });

    if (result.canceled) return { success: false };

    try {
        const data = await fs.readFile(result.filePaths[0], 'utf8');
        const userDataPath = app.getPath('userData');
        const dataPath = path.join(userDataPath, 'wardrobe-data.json');
        await fs.writeFile(dataPath, data);
        return { success: true, data: JSON.parse(data) };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('clear-cache', async () => {
    try {
        await session.defaultSession.clearCache();
        await session.defaultSession.clearStorageData();
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});