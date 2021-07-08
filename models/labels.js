
const { extractValidFields } = require('../lib/validation');
const labels = require('../data/labels.json');
/*
* Schema describing required/optional fields of a song object.
*/
const LabelSchema = {
 name: { required: true },
 id: { required: true },
 ownerID: { required: true },
 artistsSigned: { required: true }
};
exports.LabelSchema = LabelSchema;

async function getLabelCount() {
    const [ results ] = await mysqlPool.query(
        'SELECT COUNT(*) AS count FROM labels'
      );
      return results[0].count;
}
async function getLabelsPage(page) {
    /*
     * Compute last page number and make sure page is within allowed bounds.
     * Compute offset into collection.
     */
    const count = await getLabelCount();
    const pageSize = 10;
    const lastPage = Math.ceil(count / pageSize);
    page = page > lastPage ? lastPage : page;
    page = page < 1 ? 1 : page;
    const offset = (page - 1) * pageSize;
  
    const [ results ] = await mysqlPool.query(
      'SELECT * FROM labels ORDER BY id LIMIT ?,?',
      [ offset, pageSize ]
    );
  
    return {
      labels: results,
      page: page,
      totalPages: lastPage,
      pageSize: pageSize,
      count: count
    };
  }
  exports.getLabelsPage = getLabelsPage;

async function getLabelsAll() {
 return labels;
}
exports.getLabelsAll = getLabelsAll;

async function insertNewLabel(label) {
    labels = extractValidFields(label, LabelSchema);
    const [ result ] = await mysqlPool.query(
      'INSERT INTO labels SET ?',
      labels
    );
  
    return result.insertId;
}
exports.insertNewLabel = insertNewLabel;


async function getLabelById(id) {
    const [ results ] = await mysqlPool.query(
        'SELECT * FROM labels WHERE id = ?',
        [ id ]
      );
      return results[0];
}
exports.getLabelById = getLabelById;


async function replaceLabelById(id, label) {
    labels = extractValidFields(label, LabelSchema);
    const [ result ] = await mysqlPool.query(
      'UPDATE labels SET ? WHERE id = ?',
      [ labels, id ]
    );
    return result.affectedRows > 0;
  }
exports.replaceLabelById = replaceLabelById;

async function deleteLabelById(id) {
    const [ result ] = await mysqlPool.query(
        'DELETE FROM labels WHERE id = ?',
        [ id ]
      );
      return result.affectedRows > 0;
    }
exports.deleteLabelById = deleteLabelById;

async function getLabelsByOwnerId(id) {
    const [ results ] = await mysqlPool.query(
        'SELECT * FROM labels WHERE ownerid = ?',
        [ id ]
      );
      return results;
    }
exports.getLabelsByOwnerId = getLabelsByOwnerId;
