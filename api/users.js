const router = require('express').Router();
const { generateAuthToken, requireAuthentication } = require('../lib/auth');
const { validateAgainstSchema } = require('../lib/validation');

const {
  UserSchema,
  insertNewuser,
  getuserById,
  getusersAll,
  replaceuserById,
  deleteuserById,
  getusersPage,
  validateUser,
  replaceUserAlbumList,
  replaceUserArtistList,
  replaceUserSongsList
} = require('../models/users');

router.get('/:id', requireAuthentication, async (req, res) => {
  if(req.user == req.params.id){
  try {
    /*
     * Fetch page info, generate HATEOAS links for surrounding pages and then
     * send response.
     */
    const usersPage = await getuserById(req.params.id)
    res.status(200).send(usersPage);
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Error fetching user list.  Please try again later."
    });
  }
}
else{
  res.status(401).send({
    error: "Unauthorized action."
  });
}
});

router.get('/', requireAuthentication, async (req, res) => {
  if(req.user == 1){
  try {
    /*
     * Fetch page info, generate HATEOAS links for surrounding pages and then
     * send response.
     */
    const userPage = await getusersPage(parseInt(req.query.page) || 1);
    if (userPage.page < userPage.totalPages) {
      userPage.links.nextPage = `/users?page=${userPage.page + 1}`;
      userPage.links.lastPage = `/users?page=${userPage.totalPages}`;
    }
    if (userPage.page > 1) {
      userPage.links.prevPage = `/users?page=${userPage.page - 1}`;
      userPage.links.firstPage = '/users?page=1';
    }
    res.status(200).send(userPage);
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Error fetching users list.  Please try again later."
    });
  }
}
  else{
    res.status(401).send({
      error: "You are not an admin."
    });
  }
});

/*
 * Route to create a new user.
 */
router.post('/', async (req, res) => {
if(validateAgainstSchema(req.body, UserSchema)){
  try {
    const insertSuccess = await insertNewuser(req.body);
    if (insertSuccess) {
      res.status(201).send({
        success: "Added new user into database!",
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Unable to add user .  Please try again later."
    });
  }
}
else{
  res.status(500).send({
    error: "Wrong schema for new user.  Please try again later."
  });
}
});

/*
 * Route to replace data for a user.
 */
router.put('/:id',  requireAuthentication, async (req, res) => {
  if(req.user == req.params.id){
  if(validateAgainstSchema(req.body, UserSchema)){
    try {
      const replaceSuccess = await replaceuserById(req.params.id,req.body);
      if (replaceSuccess) {
        res.status(201).send({
          success: "Changed user in the database!",
        });
      }
    } catch (err) {
      console.error(err);
      res.status(500).send({
        error: "Unable to change user.  Please try again later."
      });
    }
  }
}
else{
  res.status(401).send({
    error: "Unauthorized action."
  });
}
  });

  router.post('/login', async (req, res) => {
    if (req.body && req.body.id && req.body.password) {
      try {
        const authenticated = await validateUser(req.body.id, req.body.password);
        if (authenticated) {
          res.status(200).send({
            token: generateAuthToken(req.body.id)
          });
        } else {
          res.status(401).send({
            error: "Invalid authentication credentials."
          });
        }
      } catch (err) {
        console.error("  -- error:", err);
        res.status(500).send({
          error: "Error logging in.  Try again later."
        });
      }
    } else {
      res.status(400).send({
        error: "Request body needs `id` and `password`."
      });
    }
  });
  router.put('/:id/albums',  requireAuthentication, async (req, res) => {
    if(req.user == req.params.id){
    if(req.body && req.body.albums){
      try {
        const replaceSuccess = await replaceUserAlbumList(req.params.id,req.body);
        if (replaceSuccess) {
          res.status(201).send({
            success: "Updated user album!",
          });
        }
      } catch (err) {
        console.error(err);
        res.status(500).send({
          error: "Unable to update user albums.  Please try again later."
        });
      }
    }
    else{
      res.status(401).send({
        error: "You're trying to change something other than albums! You sneaky devil you."
      });
    }
  }
  else{
    res.status(401).send({
      error: "Unauthorized action."
    });
  }
    });
module.exports = router;

router.put('/:id/artists',  requireAuthentication, async (req, res) => {
  if(req.user == req.params.id){
  if(req.body && req.body.artists){
    try {
      const replaceSuccess = await replaceUserArtistList(req.params.id,req.body);
      if (replaceSuccess) {
        res.status(201).send({
          success: "Updated user artist!",
        });
      }
    } catch (err) {
      console.error(err);
      res.status(500).send({
        error: "Unable to update user artist.  Please try again later."
      });
    }
  }
  else{
    res.status(401).send({
      error: "You're trying to change something other than artists! You sneaky devil you."
    });
  }
}
else{
  res.status(401).send({
    error: "Unauthorized action."
  });
}
  });
module.exports = router;

router.put('/:id/songs',  requireAuthentication, async (req, res) => {
  if(req.user == req.params.id){
  if(req.body && req.body.songs){
    try {
      const replaceSuccess = await replaceUserSongsList(req.params.id,req.body);
      if (replaceSuccess) {
        res.status(201).send({
          success: "Updated user songs!",
        });
      }
    } catch (err) {
      console.error(err);
      res.status(500).send({
        error: "Unable to update user songs.  Please try again later."
      });
    }
  }
  else{
    res.status(401).send({
      error: "You're trying to change something other than songs! You sneaky devil you."
    });
  }
}
else{
  res.status(401).send({
    error: "Unauthorized action."
  });
}
  });
module.exports = router;