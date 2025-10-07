const express = require('express');
const { applyForJob, getAllApplications, getApplicationsByUser, getApplicationsByJob, updateApplicationStatus, deleteApplication } = require('../controller/Application');
const router = express.Router();
    
//create job
router.post('/applyForJob', applyForJob);
router.get('/getAllApplications',getAllApplications);
router.get('/getApplicationsByUser/:id', getApplicationsByUser);
router.get('/getApplicationsByJob/:id', getApplicationsByJob);
router.put('/updateApplicationStatus/:id',updateApplicationStatus);
router.delete('/deleteApplication/:id',deleteApplication);
module.exports = router;
