const express = require('express');
const { createjob, getAllJobs, getJobById, deleteJob, updateJob } = require('../controller/jobsController');
const router = express.Router();
    
//create job
router.post('/createjob', createjob);
router.get('/getalljob',getAllJobs);
router.get('/getjobbyId/:id', getJobById);
router.put('/job/:id',updateJob);
router.delete('/job/:id',deleteJob);
module.exports = router;
