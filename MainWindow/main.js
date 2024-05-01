const { app, BrowserWindow } = require('electron/main');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

function checkAndInstallPythonDependencies() {
    const pythonScriptPath = path.join(__dirname, '../venv/Scripts');
    const requirementsFile = path.join(pythonScriptPath, 'requirements.txt');

    if (fs.existsSync(requirementsFile)) {
        try {
            execSync(`pip install -r ${requirementsFile}`);
            console.log('Python dependencies installed successfully.');
        } catch (error) {
            console.error('Error installing Python dependencies:', error);
        }
    } else {
        console.error('requirements.txt file not found.');
    }
}

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    });

    win.loadFile('./HTML/index.html');
}

app.whenReady().then(() => {
    checkAndInstallPythonDependencies();
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
