import { google, drive_v3, sheets_v4 } from 'googleapis';
import mammoth from 'mammoth';
import { extractText } from 'unpdf';

/**
 * Get an authenticated Drive and Sheets client using the server-side NextAuth access token
 */
export const getGoogleClients = (accessToken: string) => {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  const drive = google.drive({ version: 'v3', auth });
  const sheets = google.sheets({ version: 'v4', auth });

  return { drive, sheets };
};

/**
 * Read text content from a Drive file.
 * Supports: Google Docs, PDF, DOCX, DOC, and plain text files.
 */
export const getDriveFileText = async (drive: drive_v3.Drive, fileId: string): Promise<string> => {
  // 1. Detect file type first
  const metaResponse = await drive.files.get({ fileId, fields: 'mimeType, name' });
  const mimeType = metaResponse.data.mimeType || '';
  console.log(`[Drive] Reading "${metaResponse.data.name}" as mimeType: ${mimeType}`);

  // 2. Google Doc → native text export
  if (mimeType === 'application/vnd.google-apps.document') {
    const res = await drive.files.export(
      { fileId, mimeType: 'text/plain' },
      { responseType: 'text' }
    );
    return res.data as string;
  }

  // 3. PDF → download binary → unpdf (ESM-native, Turbopack-safe)
  if (mimeType === 'application/pdf') {
    const res = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'arraybuffer' }
    );
    const uint8Array = new Uint8Array(res.data as ArrayBuffer);
    const { text } = await extractText(uint8Array, { mergePages: true });
    return Array.isArray(text) ? text.join('\n') : text;
  }

  // 4. DOCX / DOC → download binary → mammoth
  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType === 'application/msword'
  ) {
    const res = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'arraybuffer' }
    );
    const buffer = Buffer.from(res.data as ArrayBuffer);
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  // 5. Plain text or markdown → download as text
  if (mimeType === 'text/plain' || mimeType === 'text/markdown') {
    const res = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'text' }
    );
    return res.data as string;
  }

  // 6. Fallback for any other Google Workspace type
  try {
    const res = await drive.files.export(
      { fileId, mimeType: 'text/plain' },
      { responseType: 'text' }
    );
    return res.data as string;
  } catch {
    throw new Error(
      `Unsupported file type: "${mimeType}". Please use a Google Doc, PDF, DOCX, or plain text file.`
    );
  }
};

/**
 * Upload the new Tailored Resume to Google Drive as a Google Doc.
 */
export const uploadTailoredResume = async (
  drive: drive_v3.Drive,
  markdownContent: string,
  companyName: string,
  roleName: string
) => {
  const fileMetadata = {
    name: `${companyName} - ${roleName} - Tailored Resume`,
    mimeType: 'application/vnd.google-apps.document',
  };

  const media = {
    mimeType: 'text/plain',
    body: markdownContent,
  };

  const file = await drive.files.create({
    requestBody: fileMetadata,
    media,
    fields: 'id, webViewLink',
  });

  return { id: file.data.id, link: file.data.webViewLink };
};

/**
 * Find or create the "AI Application Tracker" Google Sheet.
 * Returns the spreadsheet ID.
 */
export const ensureTrackingSheet = async (drive: drive_v3.Drive, sheets: sheets_v4.Sheets): Promise<string> => {
  const res = await drive.files.list({
    q: "name='AI Application Tracker' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false",
    spaces: 'drive',
    fields: 'files(id, name)',
  });

  const files = res.data.files;
  if (files && files.length > 0) {
    return files[0].id!;
  }

  // Create a new sheet with headers
  const newSheet = await sheets.spreadsheets.create({
    requestBody: {
      properties: { title: 'AI Application Tracker' },
      sheets: [{
        properties: { title: 'Applications' },
        data: [{
          startRow: 0,
          startColumn: 0,
          rowData: [{
            values: [
              { userEnteredValue: { stringValue: 'Date' } },
              { userEnteredValue: { stringValue: 'Company' } },
              { userEnteredValue: { stringValue: 'Role' } },
              { userEnteredValue: { stringValue: 'JD Link' } },
              { userEnteredValue: { stringValue: 'ATS Score' } },
              { userEnteredValue: { stringValue: 'Resume Link' } },
              { userEnteredValue: { stringValue: 'Status' } },
            ]
          }]
        }]
      }]
    }
  });

  return newSheet.data.spreadsheetId!;
};

/**
 * Append a new application row to the tracker sheet.
 */
export const appendToTracker = async (
  sheets: sheets_v4.Sheets,
  spreadsheetId: string,
  company: string,
  role: string,
  jdLink: string,
  score: number,
  resumeLink: string
) => {
  const date = new Date().toISOString().split('T')[0];

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'Applications!A:G',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[date, company, role, jdLink || 'N/A', score, resumeLink, 'Applied']]
    }
  });
};
