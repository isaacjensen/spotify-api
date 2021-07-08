const mysqlPool = require('../lib/mysqlPool');
const { extractValidFields } = require('../lib/validation');

/*
 * Schema describing required/optional fields of a artist object.
 */
const ArtistSchema = {
    name: { required: true },
    id: { required: true },
    album: { required: true }
};
exports.ArtistSchema = ArtistSchema;


/*
 * Executes a MySQL query to fetch the total number of artists.  Returns
 * a Promise that resolves to this count.
 */
async function getArtistCount() {
  const [ results ] = await mysqlPool.query(
    'SELECT COUNT(*) AS count FROM artist'
  );
  return results[0].count;
}

/*
 * Executes a MySQL query to return a single page of artists.  Returns a
 * Promise that resolves to an array containing the fetched page of artists.
 */
async function getArtistsPage(page) {
  /*
   * Compute last page number and make sure page is within allowed bounds.
   * Compute offset into collection.
   */
  const count = await getArtistCount();
  const pageSize = 10;
  const lastPage = Math.ceil(count / pageSize);
  page = page > lastPage ? lastPage : page;
  page = page < 1 ? 1 : page;
  const offset = (page - 1) * pageSize;

  const [ results ] = await mysqlPool.query(
    'SELECT * FROM artist ORDER BY id LIMIT ?,?',
    [ offset, pageSize ]
  );

  return {
    artists: results,
    page: page,
    totalPages: lastPage,
    pageSize: pageSize,
    count: count
  };
}
exports.getArtistsPage = getArtistsPage;

/*
 * Executes a MySQL query to insert a new artist into the database.  Returns
 * a Promise that resolves to the ID of the newly-created artist entry.
 */
async function insertNewArtist(artist) {
  artist = extractValidFields(artist, ArtistSchema);
  const [ result ] = await mysqlPool.query(
    'INSERT INTO artist SET ?',
    artist
  );

  return result.insertId;
}
exports.insertNewArtist = insertNewArtist;

/*
 * Executes a MySQL query to fetch information about a single specified
 * artist based on its ID.  Does not fetch photo and review data for the
 * artist.  Returns a Promise that resolves to an object containing
 * information about the requested artist.  If no artist with the
 * specified ID exists, the returned Promise will resolve to null.
 */
async function getArtistById(id) {
  const [ results ] = await mysqlPool.query(
    'SELECT * FROM artist WHERE id = ?',
    [ id ]
  );
  return results[0];
}

/*
 * Executes a MySQL query to fetch detailed information about a single
 * specified artist based on its ID, including photo and review data for
 * the artist.  Returns a Promise that resolves to an object containing
 * information about the requested artist.  If no artist with the
 * specified ID exists, the returned Promise will resolve to null.
 */
async function getArtistDetailsById(id) {

  const artist = await getArtistById(id);
  return artist;
}
exports.getArtistDetailsById = getArtistDetailsById;

/*
 * Executes a MySQL query to replace a specified artist with new data.
 * Returns a Promise that resolves to true if the artist specified by
 * `id` existed and was successfully updated or to false otherwise.
 */
async function replaceArtistById(id, artist) {
  artist = extractValidFields(artist, ArtistSchema);
  const [ result ] = await mysqlPool.query(
    'UPDATE artist SET ? WHERE id = ?',
    [ artist, id ]
  );
  return result.affectedRows > 0;
}
exports.replaceArtistById = replaceArtistById;

/*
 * Executes a MySQL query to delete a artist specified by its ID.  Returns
 * a Promise that resolves to true if the artist specified by `id` existed
 * and was successfully deleted or to false otherwise.
 */
async function deleteArtistById(id) {
  const [ result ] = await mysqlPool.query(
    'DELETE FROM artist WHERE id = ?',
    [ id ]
  );
  return result.affectedRows > 0;
}
exports.deleteArtistById = deleteArtistById;

/*
 * Executes a MySQL query to fetch all artists owned by a specified user,
 * based on on the user's ID.  Returns a Promise that resolves to an array
 * containing the requested artists.  This array could be empty if the
 * specified user does not own any artists.  This function does not verify
 * that the specified user ID corresponds to a valid user.
 */
async function getArtistsByOwnerId(id) {
  const [ results ] = await mysqlPool.query(
    'SELECT * FROM artist WHERE ownerid = ?',
    [ id ]
  );
  return results;
}
exports.getArtistsByOwnerId = getArtistsByOwnerId;