const router = require('express').Router();
const { requireAuthentication } = require('../lib/auth');


const {
  SongSchema,
  getSongesPage,
  insertNewSong,
  getSongDetailsById,
  replaceSongById,
  deleteSongById,
  getSongesByOwnerdId,
  getSongsPage
} = require('../models/song');

const { validateAgainstSchema } = require('../lib/validation');

router.get('/', async (req, res) => {
  try {
    /*
     * Fetch page info, generate HATEOAS links for surrounding pages and then
     * send response.
     */
    const songsPage = await getSongsPage(parseInt(req.query.page) || 1);
    if (songsPage.page < songsPage.totalPages) {
      songsPage.links.nextPage = `/songs?page=${songsPage.page + 1}`;
      songsPage.links.lastPage = `/songs?page=${songsPage.totalPages}`;
    }
    if (songsPage.page > 1) {
      songsPage.links.prevPage = `/songs?page=${songsPage.page - 1}`;
      songsPage.links.firstPage = '/songs?page=1';
    }
    res.status(200).send(songsPage);
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Error fetching songs list.  Please try again later."
    });
  }
});

/*
 * Route to create a new songs.
 */
router.post('/', async (req, res) => {
  if (validateAgainstSchema(req.body, SongSchema)) {
    try {
      const id = await insertNewSong(req.body);
      res.status(201).send({
        id: req.body.id,
        links: {
          song: `/songs/${req.body.id}`
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).send({
        error: "Error inserting song into DB.  Please try again later."
      });
    }
  } else {
    res.status(400).send({
      error: "Request body is not a valid song object."
    });
  }
});

/*
 * Route to fetch info about a specific song.
 */
router.get('/:id', async (req, res, next) => {
  try {
    const song = await getSongDetailsById(parseInt(req.params.id));
    if (song) {
      res.status(200).send(song);
    } else {
      next();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Unable to fetch song.  Please try again later."
    });
  }
});

/*
 * Route to replace data for a business.
 */
router.put('/:id', async (req, res, next) => {
  if (validateAgainstSchema(req.body, SongSchema)) {
    try {
      const id = parseInt(req.params.id)
      const updateSuccessful = await replaceSongById(id, req.body);
      if (updateSuccessful) {
        res.status(200).send({
          links: {
            song: `/songs/${id}`
          }
        });
      } else {
        next();
      }
    } catch (err) {
      console.error(err);
      res.status(500).send({
        error: "Unable to update specified song.  Please try again later."
      });
    }
  } else {
    res.status(400).send({
      error: "Request body is not a valid song object"
    });
  }
});

/*
 * Route to delete a song.
 */
router.delete('/:id', requireAuthentication, async (req, res, next) => {
  if(req.user == 1){
  try {
    const deleteSuccessful = await deleteSongById(parseInt(req.params.id));
    if (deleteSuccessful) {
      res.status(204).end();
    } else {
      next();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Unable to delete song.  Please try again later."
    });
  }
}
else{
  res.status(401).send({
    error: "You are not an admin."
  });
}
});

module.exports = router;