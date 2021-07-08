const mysqlPool = require('../lib/mysqlPool');
const { extractValidFields } = require('../lib/validation');

/*
 * Schema describing required/optional fields of a song object.
 */
const SongSchema = {
    id: { required: true },
    name: { required: true },
    popularity: { required: false },
    duration: { required: true },
    date: { required: true }
};
exports.SongSchema = SongSchema;


/*
 * Executes a MySQL query to fetch the total number of songs.  Returns
 * a Promise that resolves to this count.
 */
async function getSongCount() {
  const [ results ] = await mysqlPool.query(
    'SELECT COUNT(*) AS count FROM songs'
  );
  return results[0].count;
}

/*
 * Executes a MySQL query to return a single page of songs.  Returns a
 * Promise that resolves to an array containing the fetched page of songs.
 */
async function getSongsPage(page) {
  /*
   * Compute last page number and make sure page is within allowed bounds.
   * Compute offset into collection.
   */
  const count = await getSongCount();
  const pageSize = 10;
  const lastPage = Math.ceil(count / pageSize);
  page = page > lastPage ? lastPage : page;
  page = page < 1 ? 1 : page;
  const offset = (page - 1) * pageSize;

  const [ results ] = await mysqlPool.query(
    'SELECT * FROM songs ORDER BY id LIMIT ?,?',
    [ offset, pageSize ]
  );

  return {
    songs: results,
    page: page,
    totalPages: lastPage,
    pageSize: pageSize,
    count: count
  };
}
exports.getSongsPage = getSongsPage;

/*
 * Executes a MySQL query to insert a new song into the database.  Returns
 * a Promise that resolves to the ID of the newly-created song entry.
 */
async function insertNewSong(song) {
  song = extractValidFields(song, SongSchema);
  const [ result ] = await mysqlPool.query(
    'INSERT INTO songs SET ?',
    song
  );

  return result.insertId;
}
exports.insertNewSong = insertNewSong;

/*
 * Executes a MySQL query to fetch information about a single specified
 * song based on its ID.  Does not fetch photo and review data for the
 * song.  Returns a Promise that resolves to an object containing
 * information about the requested song.  If no song with the
 * specified ID exists, the returned Promise will resolve to null.
 */
async function getSongById(id) {
  const [ results ] = await mysqlPool.query(
    'SELECT * FROM songs WHERE id = ?',
    [ id ]
  );
  return results[0];
}

/*
 * Executes a MySQL query to fetch detailed information about a single
 * specified song based on its ID, including photo and review data for
 * the song.  Returns a Promise that resolves to an object containing
 * information about the requested song.  If no song with the
 * specified ID exists, the returned Promise will resolve to null.
 */
async function getSongDetailsById(id) {

  const song = await getSongById(id);
  return song;
}
exports.getSongDetailsById = getSongDetailsById;

/*
 * Executes a MySQL query to replace a specified song with new data.
 * Returns a Promise that resolves to true if the song specified by
 * `id` existed and was successfully updated or to false otherwise.
 */
async function replaceSongById(id, song) {
  song = extractValidFields(song, SongSchema);
  const [ result ] = await mysqlPool.query(
    'UPDATE songs SET ? WHERE id = ?',
    [ song, id ]
  );
  return result.affectedRows > 0;
}
exports.replaceSongById = replaceSongById;

/*
 * Executes a MySQL query to delete a song specified by its ID.  Returns
 * a Promise that resolves to true if the song specified by `id` existed
 * and was successfully deleted or to false otherwise.
 */
async function deleteSongById(id) {
  const [ result ] = await mysqlPool.query(
    'DELETE FROM songs WHERE id = ?',
    [ id ]
  );
  return result.affectedRows > 0;
}
exports.deleteSongById = deleteSongById;

/*
 * Executes a MySQL query to fetch all songs owned by a specified user,
 * based on on the user's ID.  Returns a Promise that resolves to an array
 * containing the requested songs.  This array could be empty if the
 * specified user does not own any songs.  This function does not verify
 * that the specified user ID corresponds to a valid user.
 */
async function getSongesByOwnerId(id) {
  const [ results ] = await mysqlPool.query(
    'SELECT * FROM songs WHERE ownerid = ?',
    [ id ]
  );
  return results;
}
exports.getSongesByOwnerId = getSongesByOwnerId;