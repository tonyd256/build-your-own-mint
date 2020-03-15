require('dotenv').config()

const { fetchTransactions } = require('./lib/fetch')
const { transformTransactionsToUpdates } = require('./lib/transform')
const { updateSheet, fetchData } = require('./lib/update')

;(async () => {
  const transactions = await fetchTransactions()
  const data = await fetchData();
  const updates = transformTransactionsToUpdates(data, transactions)
  updateSheet(updates)
})()
