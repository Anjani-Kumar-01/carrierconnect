const Job = require('../models/Job');
const User = require('../models/User'); 
const Company = require('../models/Company');


// Create a new job
exports.createjob = async (req, res) => {
    try {
        const { title, description, requirement, salary, role, location, type, companyId}=req.body;

        if (!title || !description || !requirement || !salary || !role || !location || !type || !companyId){

            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }
        // const companyDetails = await Company.findById(companyId);
        
        // if (!companyDetails) {
            //     return res.status(404).json({
                //         success: false,
                //         message: "Company details not found"
                //     });
                // }
                
                console.log("ok")
                const newJob = await Job.create({
                    title,
                    description,
                    requirement,
                    salary,
                    role,
                    location,
                    type,
                    companyId
                });

        res.status(201).json({
            success: true,
            message: "Job created successfully",
            data: newJob
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Validation error',
            details: error.message
        });
    }
};


// GET jobs List all jobs
exports.getAllJobs = async (req, res) => {
    try {
        const jobs = await Job.find()
         .populate('companyId');

        res.json({
            success: true,
            message: "Jobs fetched successfully",
            data: jobs
        });
    }
    catch (error) {
        console.log("Something went wrong in listing jobs:", error.message);
        res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
};


//  Get a job by ID
exports.getJobById = async (req, res) => {
    try {

        const jobId = req.params.id;
        console.log(jobId);

        const jobDetails = await Job.findById(jobId)
        .populate("companyId");

        if (!jobDetails) {
            return res.status(404).json({
                success: false,
                message: "Job not found"
            });
        }

        res.json({
            success: true,
            message: "Job fetched successfully",
            data: jobDetails
        });

    } 
    catch (error) {
        console.log("Error in GetJob:", error.message);
        res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
};


//Update job
exports.updateJob = async (req, res) => {
    try {
        const updatedJob = await Job.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedJob) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        res.json({
            success: true,
            message: 'Job updated successfully',
            data: updatedJob
        });
    }

    catch (error) {
        res.status(400).json({
            success: false,
            message: 'Update failed',
            details: error.message
        });
    }
};


// Delete job
exports.deleteJob = async (req, res) => {
    try {
        const deletedJob = await Job.findByIdAndDelete(req.params.id);

        if (!deletedJob) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Job deleted successfully'
        });
    }

    catch (error) {
        console.log("Error : " , error.message);
        res.status(500).json({
            success: false,
            message: 'Server error',
            details: error.message
        });
    }
};