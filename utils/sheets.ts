import { GoogleSheetsConfig } from '../types';

export const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';
export const DISCOVERY_DOCS = ['https://sheets.googleapis.com/$discovery/rest?version=v4'];

let tokenClient: any;
let gapiInited = false;
let gisInited = false;

export const initGapiClient = async (config: GoogleSheetsConfig) => {
  if (gapiInited) return;
  
  await new Promise<void>((resolve, reject) => {
    (window as any).gapi.load('client', async () => {
      try {
        await (window as any).gapi.client.init({
          apiKey: config.apiKey,
          discoveryDocs: DISCOVERY_DOCS,
        });
        gapiInited = true;
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  });
};

export const initGisClient = (config: GoogleSheetsConfig, onTokenReceived: () => void) => {
  if (gisInited) return;
  
  tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
    client_id: config.clientId,
    scope: SCOPES,
    callback: async (resp: any) => {
      if (resp.error !== undefined) {
        throw (resp);
      }
      onTokenReceived();
    },
  });
  gisInited = true;
};

export const signIn = () => {
  if (tokenClient) {
    if ((window as any).gapi.client.getToken() === null) {
      tokenClient.requestAccessToken({prompt: 'consent'});
    } else {
      tokenClient.requestAccessToken({prompt: ''});
    }
  }
};

export const signOut = () => {
  const token = (window as any).gapi.client.getToken();
  if (token !== null) {
    (window as any).google.accounts.oauth2.revoke(token.access_token);
    (window as any).gapi.client.setToken('');
  }
};

// Generic read/write functions
export const fetchSheetData = async (spreadsheetId: string, range: string) => {
  try {
    const response = await (window as any).gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });
    return response.result.values || [];
  } catch (err) {
    console.error("Error fetching data:", err);
    throw err;
  }
};

export const updateSheetData = async (spreadsheetId: string, range: string, values: any[][]) => {
  try {
    const response = await (window as any).gapi.client.sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      resource: { values },
    });
    return response;
  } catch (err) {
    console.error("Error updating data:", err);
    throw err;
  }
};

export const clearSheetData = async (spreadsheetId: string, range: string) => {
    try {
        await (window as any).gapi.client.sheets.spreadsheets.values.clear({
            spreadsheetId,
            range
        });
    } catch (err) {
        console.error("Error clearing data", err);
        throw err;
    }
}