const express = require('express');
const { saveJob, deleteSavedJob, getSavedJobs } = require('../controller/SaveJob');
const router = express.Router();
    
//create job
router.post('/saveJob', saveJob);
router.get('/getSavedJobs',getSavedJobs);
router.delete('/deleteSavedJob/:id',deleteSavedJob);
module.exports = router;
