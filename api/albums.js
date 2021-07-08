const router = require('express').Router();
const { requireAuthentication } = require('../lib/auth');

const {
  AlbumSchema,
  getAlbumesPage,
  insertNewAlbum,
  getAlbumDetailsById,
  replaceAlbumById,
  deleteAlbumById,
  getAlbumesByOwnerdId,
  getAlbumsPage
} = require('../models/albums');

const { validateAgainstSchema } = require('../lib/validation');

router.get('/', async (req, res) => {
    try {
      /*
       * Fetch page info, generate HATEOAS links for surrounding pages and then
       * send response.
       */
      const albumsPage = await getAlbumsPage(parseInt(req.query.page) || 1);
      if (albumsPage.page < albumsPage.totalPages) {
        albumsPage.links.nextPage = `/albums?page=${albumsPage.page + 1}`;
        albumsPage.links.lastPage = `/albums?page=${albumsPage.totalPages}`;
      }
      if (albumsPage.page > 1) {
        albumsPage.links.prevPage = `/albums?page=${albumsPage.page - 1}`;
        albumsPage.links.firstPage = '/albums?page=1';
      }
      res.status(200).send(albumsPage);
    } catch (err) {
      console.error(err);
      res.status(500).send({
        error: "Error fetching albums list.  Please try again later."
      });
    }
  });
  
  /*
   * Route to create a new albums.
   */
  router.post('/', async (req, res) => {
    if (validateAgainstSchema(req.body, AlbumSchema)) {
      try {
        const id = await insertNewAlbum(req.body);
        res.status(201).send({
          id: req.body.id,
          links: {
            album: `/albums/${req.body.id}`
          }
        });
      } catch (err) {
        console.error(err);
        res.status(500).send({
          error: "Error inserting album into DB.  Please try again later."
        });
      }
    } else {
      res.status(400).send({
        error: "Request body is not a valid album object."
      });
    }
  });
  
  /*
   * Route to fetch info about a specific business.
   */
  router.get('/:id', async (req, res, next) => {
    try {
      const business = await getAlbumDetailsById(parseInt(req.params.id));
      if (business) {
        res.status(200).send(business);
      } else {
        next();
      }
    } catch (err) {
      console.error(err);
      res.status(500).send({
        error: "Unable to fetch business.  Please try again later."
      });
    }
  });
  
/*
 * Route to replace data for a business.
 */
router.put('/:id', async (req, res, next) => {
    if (validateAgainstSchema(req.body, AlbumSchema)) {
      try {
        const id = parseInt(req.params.id)
        const updateSuccessful = await replaceAlbumById(id, req.body);
        if (updateSuccessful) {
          res.status(200).send({
            links: {
              album: `/albums/${id}`
            }
          });
        } else {
          next();
        }
      } catch (err) {
        console.error(err);
        res.status(500).send({
          error: "Unable to update specified album.  Please try again later."
        });
      }
    } else {
      res.status(400).send({
        error: "Request body is not a valid album object"
      });
    }
  });
  
  /*
   * Route to delete a album.
   */
  router.delete('/:id', requireAuthentication, async (req, res, next) => {
    if(req.user == 1){
    try {
      const deleteSuccessful = await deleteAlbumById(parseInt(req.params.id));
      if (deleteSuccessful) {
        res.status(204).end();
      } else {
        next();
      }
    } catch (err) {
      console.error(err);
      res.status(500).send({
        error: "Unable to delete album.  Please try again later."
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