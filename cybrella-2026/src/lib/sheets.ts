// src/lib/sheets.ts
import { google } from 'googleapis';

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID;

// 1. IMPROVED AUTH CONFIGURATION
const auth = new google.auth.GoogleAuth({
    credentials: {
        client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
        // CRITICAL: Handle the private key strictly
        private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

// 2. INITIALIZE SHEETS WITH AUTH
const sheets = google.sheets({ version: 'v4', auth });

interface RegistrationData {
    id: string;
    name: string;
    email: string;
    phone: string;
    address?: string;
    state?: string;
    age?: string;
    grade?: string;
    schoolName?: string;
    className?: string;
    collegeName?: string;
    semester?: string;
    pastCourse?: string;
    course?: string;
    eventTitle: string;
    upiRef: string;
    status: string;
    enlistedAt: string | Date | { seconds: number; nanoseconds: number };
    paymentScreenshot: string;
    idCardUrl?: string;
}

const HEADER_ROW = [
    'SERIAL NO', 
    'ID', 
    'NAME', 
    'EMAIL', 
    'PHONE', 
    'EVENT', 
    'UPI_REF', 
    'STATUS', 
    'ADDRESS', 
    'STATE', 
    'TIMESTAMP', 
    'EVIDENCE_LINK', 
    'AGE', 
    'GRADE', 
    'INSTITUTION', 
    'CLASS_SEM', 
    'COURSE', 
    'ID_CARD_LINK'];

async function syncHeaders(title: string) {
    await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${title}!A1:R1`,
        valueInputOption: 'RAW',
        requestBody: { values: [HEADER_ROW] }
    });
}

async function ensureSheetExists(title: string) {
    if (!SPREADSHEET_ID) {
        console.error("MISSING_SPREADSHEET_ID_IN_ENV");
        throw new Error("Missing Spreadsheet ID");
    }
    
    const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
    const exists = meta.data.sheets?.some(s => s.properties?.title === title);
    
    if (!exists) {
        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: SPREADSHEET_ID,
            requestBody: { requests: [{ addSheet: { properties: { title } } }] }
        });
    }
    // Always sync headers to ensure consistency across all sectors
    await syncHeaders(title);
}

async function findRowIndex(sheetName: string, id: string) {
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `'${sheetName}'!A:A`,
    });
    const rows = res.data.values || [];
    const index = rows.findIndex(row => row[0] === id);
    return index !== -1 ? index + 1 : null;
}

function mapRegistrationToRow(data: RegistrationData, serialNumber: number): string[] {
    const evidenceLink = data.paymentScreenshot 
        ? `=HYPERLINK("${data.paymentScreenshot}", "VIEW_ATTACHMENT")` 
        : "NO_ASSET";

    const formattedDate = formatTimestamp(data.enlistedAt);

    const idCardLink = data.idCardUrl 
        ? `=HYPERLINK("${data.idCardUrl}", "VIEW_ID")` 
        : "NO_ASSET";

    return [
        serialNumber.toString(),
        data.id,
        data.name,
        data.email,
        formatPhoneNumber(data.phone),
        data.eventTitle,
        data.upiRef,
        data.status,
        data.address || "N/A",
        data.state || "N/A",
        formattedDate,
        evidenceLink,
        data.age || "N/A",
        data.grade || "N/A",
        (data.schoolName || data.collegeName) || "N/A",
        (data.className || data.semester) || "N/A",
        (data.course || data.pastCourse) || "N/A",
        idCardLink
    ];
}

export async function appendRegistrationToSheets(data: RegistrationData) {
    const eventTab = data.eventTitle.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase();
    const targets = Array.from(new Set(['MASTER_LOG', eventTab]));

    for (const tab of targets) {
        await ensureSheetExists(tab);
        
        // Get current row count to determine serial number
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${tab}!A:A`,
        });
        const rowCount = (res.data.values || []).length;
        const serialNumber = rowCount; // Header is row 1, so next row gets serial = current count
        
        const row = mapRegistrationToRow(data, serialNumber);
        
        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: `${tab}!A:R`,
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: [row] }
        });
    }
}

export async function rebuildSpreadsheet(registrations: RegistrationData[]) {
    // 1. Get meta data
    const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
    const sheetTitles = meta.data.sheets?.map(s => s.properties?.title) || [];

    // 2. Clear existing data
    for (const title of sheetTitles) {
        await sheets.spreadsheets.values.clear({
            spreadsheetId: SPREADSHEET_ID,
            range: `${title}!A1:Z1000`,
        });
    }

    // 3. Prepare data with separate serial numbering for master and event tabs
    const masterRows: string[][] = [HEADER_ROW];
    const eventTabs: Record<string, string[][]> = {};
    const eventCounters: Record<string, number> = {}; // Track serial numbers per event

    registrations.forEach((reg, index) => {
        // Master row uses global index
        const masterSerial = index + 1;
        const masterRow = mapRegistrationToRow(reg, masterSerial);
        masterRows.push(masterRow);
        
        const eventTab = reg.eventTitle.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase();
        
        // Initialize event tab if it doesn't exist
        if (!eventTabs[eventTab]) {
            eventTabs[eventTab] = [HEADER_ROW];
            eventCounters[eventTab] = 0;
        }
        
        // Increment counter for this event tab and generate row with event-specific serial
        eventCounters[eventTab]++;
        const eventRow = mapRegistrationToRow(reg, eventCounters[eventTab]);
        eventTabs[eventTab].push(eventRow);
    });

    // 4. Update Master
    await ensureSheetExists('MASTER_LOG');
    await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: 'MASTER_LOG!A1',
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: masterRows }
    });

    // 5. Update Events
    for (const [tabName, rows] of Object.entries(eventTabs)) {
        await ensureSheetExists(tabName);
        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `${tabName}!A1`,
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: rows }
        });
    }
}

export async function updateRegistrationInSheets(id: string, status: string, eventTitle: string) {
    const eventTab = eventTitle.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase();
    
    for (const tab of ['MASTER_LOG', eventTab]) {
        const rowIdx = await findRowIndex(tab, id);
        if (rowIdx) {
            await sheets.spreadsheets.values.update({
                spreadsheetId: SPREADSHEET_ID,
                range: `'${tab}'!H${rowIdx}`, // Column H is STATUS (S.NO shifted everything by 1)
                valueInputOption: 'USER_ENTERED',
                requestBody: { values: [[status]] }
            });
        }
    }
}

export async function deleteRegistrationFromSheets(id: string, eventTitle: string) {
    const eventTab = eventTitle.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase();
    
    for (const tab of ['MASTER_LOG', eventTab]) {
        await ensureSheetExists(tab);
        const rowIdx = await findRowIndex(tab, id);
        if (rowIdx) {
            // Get Sheet ID first
            const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
            const sheetId = meta.data.sheets?.find(s => s.properties?.title === tab)?.properties?.sheetId;
            
            await sheets.spreadsheets.batchUpdate({
                spreadsheetId: SPREADSHEET_ID,
                requestBody: {
                    requests: [{
                        deleteDimension: {
                            range: { 
                                sheetId: sheetId, 
                                dimension: 'ROWS', 
                                startIndex: rowIdx - 1, 
                                endIndex: rowIdx 
                            }
                        }
                    }]
                }
            });
        }
    }
}

/**
 * UPDATED: Improved logic to handle ISO strings, Firestore objects, 
 * and Date objects uniformly to match the "Default" UI style.
 */
function formatTimestamp(timestamp: string | Date | { seconds?: number; nanoseconds?: number }): string {
    if (!timestamp) return "N/A";
    
    let dateObj: Date;

    // Case 1: Firestore Timestamp { seconds, nanoseconds }
    if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp && typeof timestamp.seconds === 'number') {
        dateObj = new Date(timestamp.seconds * 1000);
    } 
    // Case 2: String (ISO) or existing Date object
    else if (typeof timestamp === 'string' || timestamp instanceof Date) {
        dateObj = new Date(timestamp);
    }
    else {
        return "N/A";
    }

    // Check if the date is actually valid before formatting
    if (isNaN(dateObj.getTime())) return "INVALID_DATE";

    // Returns "DD/MM/YYYY, HH:MM:SS" (Matches your image's top rows)
    return dateObj.toLocaleString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false // Set to true if you prefer 12-hour format
    });
}

/**
 * Formats "+911234567890" to "'+91 12345 67890"
 * The leading ' (apostrophe) forces Google Sheets to treat it as a string
 */
function formatPhoneNumber(phone: string): string {
    if (!phone) return "N/A";
    
    // Remove any existing spaces or non-digit characters except +
    const clean = phone.replace(/[^\d+]/g, '');
    
    // Pattern: +91 (5 digits) (5 digits)
    // This regex looks for the +91 prefix and the 10 following digits
    const match = clean.match(/^(\+91)(\d{5})(\d{5})$/);
    
    if (match) {
        // We add a leading ' to prevent Google Sheets from stripping the +
        return `'${match[1]} ${match[2]} ${match[3]}`;
    }
    
    // Fallback if the format doesn't match perfectly
    return `'${clean}`;
}