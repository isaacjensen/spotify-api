const mysqlPool = require('../lib/mysqlPool');
const { extractValidFields } = require('../lib/validation');

/*
 * Schema describing required/optional fields of a album object.
 */
const AlbumSchema = {
    id: { required: true },
    date: { required: true },
    name: { required: false },
    songs: { required: true },
    cover: { required: true },
};
exports.AlbumSchema = AlbumSchema;


/*
 * Executes a MySQL query to fetch the total number of albums.  Returns
 * a Promise that resolves to this count.
 */
async function getAlbumCount() {
  const [ results ] = await mysqlPool.query(
    'SELECT COUNT(*) AS count FROM album'
  );
  return results[0].count;
}

/*
 * Executes a MySQL query to return a single page of albums.  Returns a
 * Promise that resolves to an array containing the fetched page of albums.
 */
async function getAlbumsPage(page) {
  /*
   * Compute last page number and make sure page is within allowed bounds.
   * Compute offset into collection.
   */
  const count = await getAlbumCount();
  const pageSize = 10;
  const lastPage = Math.ceil(count / pageSize);
  page = page > lastPage ? lastPage : page;
  page = page < 1 ? 1 : page;
  const offset = (page - 1) * pageSize;

  const [ results ] = await mysqlPool.query(
    'SELECT * FROM album ORDER BY id LIMIT ?,?',
    [ offset, pageSize ]
  );

  return {
    album: results,
    page: page,
    totalPages: lastPage,
    pageSize: pageSize,
    count: count
  };
}
exports.getAlbumsPage = getAlbumsPage;

/*
 * Executes a MySQL query to insert a new album into the database.  Returns
 * a Promise that resolves to the ID of the newly-created album entry.
 */
async function insertNewAlbum(album) {
  album = extractValidFields(album, AlbumSchema);
  const [ result ] = await mysqlPool.query(
    'INSERT INTO album SET ?',
    album
  );

  return result.insertId;
}
exports.insertNewAlbum = insertNewAlbum;

/*
 * Executes a MySQL query to fetch information about a single specified
 * album based on its ID.  Does not fetch photo and review data for the
 * album.  Returns a Promise that resolves to an object containing
 * information about the requested album.  If no album with the
 * specified ID exists, the returned Promise will resolve to null.
 */
async function getAlbumById(id) {
  const [ results ] = await mysqlPool.query(
    'SELECT * FROM album WHERE id = ?',
    [ id ]
  );
  return results[0];
}

/*
 * Executes a MySQL query to fetch detailed information about a single
 * specified album based on its ID, including photo and review data for
 * the album.  Returns a Promise that resolves to an object containing
 * information about the requested album.  If no album with the
 * specified ID exists, the returned Promise will resolve to null.
 */
async function getAlbumDetailsById(id) {

  const album = await getAlbumById(id);
  return album;
}
exports.getAlbumDetailsById = getAlbumDetailsById;

/*
 * Executes a MySQL query to replace a specified album with new data.
 * Returns a Promise that resolves to true if the album specified by
 * `id` existed and was successfully updated or to false otherwise.
 */
async function replaceAlbumById(id, album) {
  album = extractValidFields(album, AlbumSchema);
  const [ result ] = await mysqlPool.query(
    'UPDATE album SET ? WHERE id = ?',
    [ album, id ]
  );
  return result.affectedRows > 0;
}
exports.replaceAlbumById = replaceAlbumById;

/*
 * Executes a MySQL query to delete a album specified by its ID.  Returns
 * a Promise that resolves to true if the album specified by `id` existed
 * and was successfully deleted or to false otherwise.
 */
async function deleteAlbumById(id) {
  const [ result ] = await mysqlPool.query(
    'DELETE FROM album WHERE id = ?',
    [ id ]
  );
  return result.affectedRows > 0;
}
exports.deleteAlbumById = deleteAlbumById;

/*
 * Executes a MySQL query to fetch all albums owned by a specified user,
 * based on on the user's ID.  Returns a Promise that resolves to an array
 * containing the requested albums.  This array could be empty if the
 * specified user does not own any albums.  This function does not verify
 * that the specified user ID corresponds to a valid user.
 */
async function getAlbumesByOwnerId(id) {
  const [ results ] = await mysqlPool.query(
    'SELECT * FROM album WHERE ownerid = ?',
    [ id ]
  );
  return results;
}
exports.getAlbumesByOwnerId = getAlbumesByOwnerId;