const btn = document.getElementById('btntest');
const xlsx = require('xlsx');

function debounce(func, wait) {
  let timeout;
  return function(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

btn.addEventListener('click', debounce(function() {
    const fileInput = document.getElementById('files');
    const file = fileInput.files[0];

    if (!file) {
        console.log("No file selected.");
        return;
    }

    function excelToHtmlTable(file) {
        const reader = new FileReader();

        reader.onload = function(e) {
            const data = new Uint8Array(e.target.result);
            const workbook = xlsx.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const htmlTable = xlsx.utils.sheet_to_html(sheet);
            const parsedTable = new DOMParser().parseFromString(htmlTable, 'text/html');
            const table = parsedTable.getElementsByTagName('table')[0];

            let rowIndex = 1;
            for (let row of table.rows) {
                row.insertCell(0).textContent = rowIndex++;
                row.cells[0].style.textAlign = 'center';
                row.cells[0].style.background = 'gray';

                for (let cell of row.cells) {
                    cell.contentEditable = true;
                }
            }

            const headerRow = table.insertRow(0);
            const blankCell = headerRow.insertCell(0);
            blankCell.style.textAlign = 'center';
            blankCell.style.background = 'gray';
            blankCell.textContent = ''; 
            
            let colIndex = 0;
            for (let i = 1; i < table.rows[1].cells.length; i++) {
                const cell = headerRow.insertCell(i);
                let label = '';
                let remainder = colIndex;
            
                while (remainder >= 0) {
                    label = String.fromCharCode(65 + (remainder % 26)) + label;
                    remainder = Math.floor(remainder / 26) - 1;
                }
            
                cell.textContent = label;
                cell.style.textAlign = 'center';
                cell.style.background = 'gray';
                colIndex++;
            }
            
            for (let cell of headerRow.cells) {
                cell.contentEditable = true;
            }
            
            document.getElementById('table-container').innerHTML = table.outerHTML;
        };

        reader.readAsArrayBuffer(file);
    }

    excelToHtmlTable(file);
}, 500));