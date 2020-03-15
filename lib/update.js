const { promisify } = require('util');
const { google } = require('googleapis')
const moment = require('moment')
const oAuth2Client = require('./googleClient')

oAuth2Client.setCredentials({
  access_token: process.env.SHEETS_ACCESS_TOKEN,
  refresh_token: process.env.SHEETS_REFRESH_TOKEN,
  scope: process.env.SHEETS_SCOPE,
  token_type: process.env.SHEETS_TOKEN_TYPE,
  expiry_date: process.env.SHEETS_EXPIRY_DATE
})

const sheets = google.sheets({
  version: 'v4',
  auth: oAuth2Client
})

exports.fetchData = async function() {
  const request = {
    spreadsheetId: process.env.SHEETS_SHEET_ID,
    valueRenderOption: 'UNFORMATTED_VALUE',
    dateTimeRenderOption: 'FORMATTED_STRING',
    range: 'A2:F101',
  };
  try {
    const res = await promisify(sheets.spreadsheets.values.get)(request)
    const data = res.data.values || [];
    return data.reduce(function(accum, item, i) {
      const [id, date, name, amount, account, pending] = item;
      const range = `A${i + 2}:F${i + 2}`;
      accum[id] = {
        id,
        date,
        name,
        amount,
        account,
        pending,
        range,
      };
      return accum;
    }, {});
  } catch(err) {
    console.log('Fetch failed: ', err)
  }
}

exports.updateSheet = async function(updates) {
  try {
    if (updates.updates.length > 0) {
      const res = await promisify(sheets.spreadsheets.values.batchUpdate)({
        spreadsheetId: process.env.SHEETS_SHEET_ID,
        resource: {
          valueInputOption: 'USER_ENTERED',
          data: updates.updates.map(p => ({
            range: p.range,
            values: p.values
          }))
        }
      });
      console.log(`Success! ${res.data.totalUpdatedRows} rows updated.`)
    } else {
      console.log('Nothing to update.')
    }

    if (updates.inserts.length > 0) {
      await insertInSheet(updates.inserts);
      console.log(`Success! ${updates.inserts.length} rows inserted.`)
    } else {
      console.log('Nothing to insert.')
    }
  } catch(err) {
    console.log('Update failed: ', err)
  }
}

async function insertInSheet(inserts) {
  try {
    await promisify(sheets.spreadsheets.batchUpdate)({
      spreadsheetId: process.env.SHEETS_SHEET_ID,
      resource: {
        requests: [
          {
            insertRange: {
              range: {
                sheetId: 0,
                startRowIndex: 1,
                endRowIndex: inserts.length + 1,
              },
              shiftDimension: 'ROWS'
            }
          }
        ]
      }
    });
    await promisify(sheets.spreadsheets.values.batchUpdate)({
      spreadsheetId: process.env.SHEETS_SHEET_ID,
      resource: {
        valueInputOption: 'USER_ENTERED',
        data: inserts.map( (v, i) => ({
          range: `A${i + 2}:F${i + 2}`,
          values: [v]
        }))
      }
    });
  } catch(err) {
    console.log('Insert failed: ', err)
  }
}
