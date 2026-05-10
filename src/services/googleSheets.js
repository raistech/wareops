const { google } = require('googleapis');
const path = require('path');
require('dotenv').config();

const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, '../../service-account.json'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

const sheets = google.sheets({ version: 'v4', auth });
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const SHEET_NAME = process.env.SHEET_NAME || 'INVENTOR';

/**
 * Fetches occupancy data from Google Sheets
 * Expected Sheet structure:
 * Column A: Warehouse Name/ID
 * Column B: Occupancy (e.g. 85% or 100/120)
 * We will need to map these names to our warehouse IDs
 */
const getOccupancyData = async () => {
    try {
        // Fetch more columns to find the date (A to Z)
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `'${SHEET_NAME}'!A:Z`, 
        });

        const rows = response.data.values;
        if (!rows || rows.length === 0) {
            console.log('No occupancy data found.');
            return {};
        }

        // 1. Find the column for today's date
        // Typical format in sheet: DD/MM/YYYY
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const yyyy = today.getFullYear();
        const todayStr = `${dd}/${mm}/${yyyy}`;
        
        console.log(`[SHEETS] Searching for date: ${todayStr}`);

        let dateColumnIndex = 1; // Default to Column B (index 1)
        
        // Look in the first few rows for the date
        for (let r = 0; r < Math.min(5, rows.length); r++) {
            const row = rows[r];
            const foundIndex = row.findIndex(cell => cell && cell.includes(dd) && cell.includes(mm));
            if (foundIndex > 0) {
                dateColumnIndex = foundIndex;
                console.log(`[SHEETS] Found matching date at column index ${dateColumnIndex} (Column ${String.fromCharCode(65 + dateColumnIndex)})`);
                break;
            }
        }

        const occupancyMap = {};
        const knownNames = ['RM ABBA', 'RM Cassaland', 'RM Sumber Asia', 'RM Kemasan', 'Gudang Waru', 'Gudang Kletek', 'RM Pabrik'];

        for (let i = 0; i < rows.length; i++) {
            const rowValue = rows[i][0] ? rows[i][0].trim() : '';
            
            if (knownNames.some(kn => rowValue.toLowerCase() === kn.toLowerCase())) {
                const warehouseName = rowValue;
                const data = { occupancy: '0%', capacity: '0', actual: '0' };
                
                // Look ahead for specific labels but stop if we hit another warehouse name
                for (let j = i + 1; j < Math.min(i + 10, rows.length); j++) {
                    const firstColValue = rows[j][0] ? rows[j][0].trim() : '';
                    
                    // Stop if we hit a new warehouse name
                    if (firstColValue && knownNames.some(kn => firstColValue.toLowerCase() === kn.toLowerCase())) {
                        break;
                    }

                    const label = firstColValue.toUpperCase();
                    const val = rows[j][dateColumnIndex] || '0';
                    
                    if (label.includes('KAPASITAS')) data.capacity = val;
                    if (label.includes('ACTUAL')) data.actual = val;
                    if (label.includes('OCCUPANCY')) data.occupancy = val;
                }
                
                occupancyMap[warehouseName] = data;
            }
        }

        return occupancyMap;
    } catch (error) {
        console.error('[SHEETS SERVICE] Error fetching data:', error.message);
        return {};
    }
};

module.exports = { getOccupancyData };
