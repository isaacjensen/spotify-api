const router = require('express').Router();
const { generateAuthToken, requireAuthentication } = require('../lib/auth');
const { validateAgainstSchema } = require('../lib/validation');

const {
  LabelSchema,
  insertNewLabel,
  getLabelsAll,
  replaceLabelById,
  deleteLabelById,
  getLabelsByOwnerId
} = require('../models/labels');
router.get('/', async (req, res) => {
  try {
    /*
     * Fetch page info, generate HATEOAS links for surrounding pages and then
     * send response.
     */
    const labelsPage = await getLabelsAll()
    res.status(200).send(labelsPage);
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Error fetching Labeles list.  Please try again later."
    });
  }
});

/*
 * Route to create a new Label.
 */
router.post('/', async (req, res) => {
  const new_label = {
    name: req.body.name,
    id: labels.length,
    ownerID: req.body.ownerID,
    artistsSigned: req.body.artistsSigned
  };
  try {
    const insertSuccess = await insertNewLabel(new_label);
    if (insertSuccess) {
      res.status(201).send({
        success: "Added new label into database!",
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Unable to add label.  Please try again later."
    });
  }
});

/*
 * Route to replace data for a Label.
 */
router.put('/:id', requireAuthentication, async (req, res) => {
  if(req.user == req.body.ownerID){
    const new_label = {
      name: req.body.name,
      id: req.body.id,
      ownerID: req.body.ownerID,
      artistsSigned: req.body.artistsSigned
    };
    try {
      const replaceSuccess = await replaceLabelById(parseInt(req.body.id),new_label);
      if (replaceSuccess) {
        res.status(201).send({
          success: "Changed label in database!",
        });
      }
    } catch (err) {
      console.error(err);
      res.status(500).send({
        error: "Unable to change label.  Please try again later."
      });
    }
  }
  else{
    res.status(401).send({
      error: "Unauthorized action."
    });
  }
});

/*
 * Route to delete a Label.
 */
router.delete('/:id', requireAuthentication, async (req, res) => {
  if(req.user == req.body.ownerID){
  try {
    const deleteSuccessful = await deleteLabelById(parseInt(req.params.id));
    if (deleteSuccessful) {
      res.status(204).end();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Unable to delete label.  Please try again later."
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
