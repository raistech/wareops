const { google } = require('googleapis');
const path = require('path');
require('dotenv').config();
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const SHEET_NAME = process.env.SHEET_NAME;
const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, '../../service-account.json'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheets = google.sheets({ version: 'v4', auth });

const appendReport = async (data) => {
    try {
        const { warehouse_name, reporter_name, reporter_phone, category, description } = data;
        const now = new Date(Date.now() + 7 * 3600000); // WIB
        const dateStr = now.toISOString().split('T')[0];
        const timeStr = now.toISOString().split('T')[1].split('.')[0];
        
        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: `'COMPLAIN'!A:F`,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [[
                    `${dateStr} ${timeStr}`,
                    warehouse_name,
                    reporter_name,
                    reporter_phone,
                    category,
                    description
                ]]
            }
        });
        console.log(`[SHEETS] Report appended to COMPLAIN sheet`);
    } catch (error) {
        console.error('[SHEETS SERVICE] Error appending report:', error.message);
    }
};

const getOccupancyData = async (targetDate = null) => {
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `'${SHEET_NAME}'!A:Z`, 
        });
        const rows = response.data.values;
        if (!rows || rows.length === 0) {
            console.log('No occupancy data found.');
            return {};
        }
        let dd, mm, yyyy;
        if (targetDate) {
            const parts = targetDate.split('-');
            yyyy = parts[0];
            mm = parts[1].padStart(2, '0');
            dd = parts[2].padStart(2, '0');
        } else {
            const today = new Date();
            dd = String(today.getDate()).padStart(2, '0');
            mm = String(today.getMonth() + 1).padStart(2, '0');
            yyyy = today.getFullYear();
        }
        const todayStr = `${dd}/${mm}/${yyyy}`;
        console.log(`[SHEETS] Searching for date: ${todayStr}`);
        let dateColumnIndex = 1; 
        for (let r = 0; r < Math.min(5, rows.length); r++) {
            const row = rows[r];
            const foundIndex = row.findIndex(cell => cell && cell.includes(dd) && cell.includes(mm));
            if (foundIndex > 0) {
                dateColumnIndex = foundIndex;
                console.log(`[SHEETS] Found matching date at column index ${dateColumnIndex}`);
                break;
            }
        }
        const occupancyMap = {};
        const labels = ['KAPASITAS', 'ACTUAL', 'OCCUPANCY'];
        const excludedHeaders = ['TANGGAL', 'DIBUAT', 'DISETUJUI', 'MENGETAHUI', 'REKAPITULASI'];
        for (let i = 0; i < rows.length; i++) {
            const rowValue = rows[i][0] ? rows[i][0].trim() : '';
            if (!rowValue) continue;
            const isLabel = labels.some(l => rowValue.toUpperCase().includes(l));
            const isExcluded = excludedHeaders.some(e => rowValue.toUpperCase().includes(e));
            if (!isLabel && !isExcluded) {
                let hasDataRows = false;
                const tempData = { occupancy: '0%', capacity: '0', actual: '0' };
                for (let j = i + 1; j < Math.min(i + 10, rows.length); j++) {
                    const peekValue = rows[j][0] ? rows[j][0].trim().toUpperCase() : '';
                    if (!peekValue) continue;
                    const isNextLabel = labels.some(l => peekValue.includes(l));
                    if (!isNextLabel && peekValue.length > 3) {
                        break;
                    }
                    const val = rows[j][dateColumnIndex] || '0';
                    if (peekValue.includes('KAPASITAS')) { tempData.capacity = val; hasDataRows = true; }
                    if (peekValue.includes('ACTUAL')) { tempData.actual = val; hasDataRows = true; }
                    if (peekValue.includes('OCCUPANCY')) { tempData.occupancy = val; hasDataRows = true; }
                }
                if (hasDataRows) {
                    occupancyMap[rowValue] = tempData;
                }
            }
        }
        return occupancyMap;
    } catch (error) {
        console.error('[SHEETS SERVICE] Error fetching data:', error.message);
        return {};
    }
};
module.exports = { getOccupancyData, appendReport };
