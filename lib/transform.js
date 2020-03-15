exports.transformTransactionsToUpdates = function(data, transactions) {
  /**
   * Implement your custom logic of transforming transactions into
   * Google Sheet cell updates.
   *
   * Transactions come in the format of:
   * {
   *   account: 'paypal',
   *   name: 'Payment from XXX',
   *   date: 2019-xx-xx,
   *   amount: 123
   * }
   *
   * Updates should be in the form of:
   * {
   *   range: 'A1:B2',
   *   values: [[1,2],[3,4]]
   * }
   *
   * Example: Put each transaction on a line in the spreadsheet.
   * const updates = transactions.map(function(transaction, i) {
   *   return {
   *     range: `A${i + 1}:D${i + 1}`,
   *     values: [Object.values(transaction)]
   *   }
   * });
   *
   */

  function compare(a, b) {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  }
  transactions.sort(compare);

  const updates = transactions.reduce(function(accum, transaction, i) {
    const item = data[transaction.transaction_id];
    if (item) {
      accum.updates.push({
        range: item.range,
        values: [Object.values(transaction)]
      });
    } else {
      accum.inserts.push(Object.values(transaction));
    }
    return accum;
  }, { updates: [], inserts: [] });

  return updates
}
