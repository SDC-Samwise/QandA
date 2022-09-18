const client = require('../db');

module.exports = {
  reportHelpful: (params) => {
    var updateHelpfulQuery = `
      update answers az \
      set helpful=helpful + 1 \
      where az.id=$1 \
    `;
    return client.query(updateHelpfulQuery, params)
  },
  reportReported: (params) => {
    var updateReportedQuery = `
    update answers az \
    set reported=1 \
    where az.id=$1 \
  `;
  return client.query(updateReportedQuery, params)
  }
};