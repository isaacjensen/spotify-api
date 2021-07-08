/*
 * Review schema and data accessor methods.
 */

const bcrypt = require('bcryptjs');
const { extractValidFields } = require('../lib/validation');
const mysqlPool = require('../lib/mysqlPool');

const UserSchema = {
  id: { required: true },
  username: { required: true },
  password: { required: true },
  albums: { required: false },
  songs: { required: false },
  artists: { required: false }
};
exports.UserSchema = UserSchema;
async function getusersPage(page) {
    /*
     * Compute last page number and make sure page is within allowed bounds.
     * Compute offset into collection.
     */
    const count = await getuserCount();
    const pageSize = 10;
    const lastPage = Math.ceil(count / pageSize);
    page = page > lastPage ? lastPage : page;
    page = page < 1 ? 1 : page;
    const offset = (page - 1) * pageSize;
  
    const [ results ] = await mysqlPool.query(
      'SELECT * FROM user ORDER BY id LIMIT ?,?',
      [ offset, pageSize ]
    );
  
    return {
      users: results,
      page: page,
      totalPages: lastPage,
      pageSize: pageSize,
      count: count
    };
  }
  exports.getusersPage = getusersPage;

async function getuserCount() {
    const [ results ] = await mysqlPool.query(
        'SELECT COUNT(*) AS count FROM user'
      );
      return results[0].count;
}
async function getusersAll() {
  return users;
}
exports.getusersAll = getusersAll;

async function insertNewuser(user) {
    users = extractValidFields(user, UserSchema);
    console.log()
    const [ result ] = await mysqlPool.query(
      'INSERT INTO user SET ?',
      users
    );
  
    return result.insertId;
}
exports.insertNewuser = insertNewuser;

async function validateUser(id, password) {
  // console.log("password: ", password);
  const user = await getuserById(id);
  return user && !(password.localeCompare(user.password));
}
exports.validateUser = validateUser;

async function getuserById(id) {
    const [ results ] = await mysqlPool.query(
        'SELECT * FROM user WHERE id = ?',
        [ id ]
      );
      return results[0];
}
exports.getuserById = getuserById;


async function replaceuserById(id, user) {
    users = extractValidFields(user, UserSchema);
    const [ result ] = await mysqlPool.query(
      'UPDATE user SET ? WHERE id = ?',
      [ users, id ]
    );
    return result.affectedRows > 0;
  }
exports.replaceuserById = replaceuserById;

async function deleteuserById(id) {
    const [ result ] = await mysqlPool.query(
        'DELETE FROM user WHERE id = ?',
        [ id ]
      );
      return result.affectedRows > 0;
    }
exports.deleteuserById = deleteuserById;

async function replaceUserAlbumList(id, user) {
  const [ result ] = await mysqlPool.query(
    'UPDATE user SET ? WHERE id = ?',
    [ user, id ]
  );
  
  return result.affectedRows > 0;
}
exports.replaceUserAlbumList = replaceUserAlbumList;

async function replaceUserArtistList(id, user) {
  const [ result ] = await mysqlPool.query(
    'UPDATE user SET ? WHERE id = ?',
    [ user, id ]
  );
  return result.affectedRows > 0;
}
exports.replaceUserArtistList = replaceUserArtistList;

async function replaceUserSongsList(id, user) {
  const [ result ] = await mysqlPool.query(
    'UPDATE user SET ? WHERE id = ?',
    [ user, id ]
  );
  return result.affectedRows > 0;
}
exports.replaceUserSongsList = replaceUserSongsList;