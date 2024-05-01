const { PythonShell } = require('python-shell');
const fs = require('fs');
const path = require('path');

const btn = document.getElementById('btntest');
const fileInput = document.getElementById('files');
btn.addEventListener('click', () => {
    const file = fileInput.files[0];

    if (!file) {
        console.log("No file selected.");
        return;
    }

    const pyshell = new PythonShell(path.join(__dirname, '../JS/test.py'));

    const datas = {
        file: file.path
    }

    pyshell.send(JSON.stringify(datas));

    pyshell.on('message', function (message) {
        console.log(message);
    });

    pyshell.end(function (err) {
        if (err) {
            throw err;
        };
        console.log('finished');
    });
});

window.onload = function() {
    const spreadsheetUrl = "https://docs.google.com/spreadsheets/d/1Q6vPAovgHOffrr8uQDawW7M59wFNV14kI9eltW8P8RA/#gid=0&headers=false";
    const spreadsheetContainer = document.getElementById('spreadsheet-container');
    const iframe = document.createElement('iframe');
 
    iframe.src = spreadsheetUrl; 
    iframe.width = '100%';
    iframe.height = '600px';
    spreadsheetContainer.appendChild(iframe);
};
