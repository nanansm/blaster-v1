// Google Sheets API Service

import { google } from 'googleapis'

const GOOGLE_SHEETS_CLIENT_EMAIL = process.env.GOOGLE_SHEETS_CLIENT_EMAIL || ''
const GOOGLE_SHEETS_PRIVATE_KEY = process.env.GOOGLE_SHEETS_PRIVATE_KEY || ''

export class GoogleSheetsService {
  private auth: any

  constructor() {
    this.auth = new google.auth.JWT({
      email: GOOGLE_SHEETS_CLIENT_EMAIL,
      key: GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })
  }

  async getSheetData(spreadsheetId: string, range: string) {
    try {
      const sheets = google.sheets({ version: 'v4', auth: this.auth })
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      })
      return response.data.values
    } catch (error) {
      console.error('Error getting Google Sheets data:', error)
      return []
    }
  }

  async appendRow(spreadsheetId: string, range: string, values: string[]) {
    try {
      const sheets = google.sheets({ version: 'v4', auth: this.auth })
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [values],
        },
      })
      return { success: true }
    } catch (error) {
      console.error('Error appending to Google Sheets:', error)
      return { success: false, error }
    }
  }

  async clearSheet(spreadsheetId: string, range: string) {
    try {
      const sheets = google.sheets({ version: 'v4', auth: this.auth })
      await sheets.spreadsheets.values.clear({
        spreadsheetId,
        range,
      })
      return { success: true }
    } catch (error) {
      console.error('Error clearing Google Sheets:', error)
      return { success: false, error }
    }
  }
}

export const googleSheetsService = new GoogleSheetsService()
