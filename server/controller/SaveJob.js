const Save = require("../models/SaveJob"); 

// Save a job for a user
exports.saveJob = async (req, res) => {
    try {

        const { userId, jobId } = req.body;

        // Check if already saved
        const existingSave = await Save.findOne({ userId, jobId });
        if (existingSave) {
            return res.status(400).json({ 
                message: "Job already saved." 
            });
        }

        const newSave = new Save({ userId, jobId });
        await newSave.save();

        res.status(201).json({
            message: "Job saved successfully",
            data: newSave 
        });
    } 
    catch (error) {
        res.status(500).json({ 
            message: "Error saving job", 
            error: error.message 
        });
    }
};

// Get all saved jobs for a user
exports.getSavedJobs = async (req, res) => {
    try {

        const { userId } = req.params;

        const savedJobs = await Save.find({ userId }).populate("jobId");

        res.status(200).json({
            data: savedJobs 
        });
    } 
    catch (error) {
        res.status(500).json({ 
            message: "Error fetching saved jobs",
            error: error.message 
        });
    }
};

// Delete a saved job
exports.deleteSavedJob = async (req, res) => {
    try {
        const { userId, jobId } = req.body;

        const deleted = await Save.findOneAndDelete({ userId, jobId });

        if (!deleted) {
            return res.status(404).json({ 
                message: "Saved job not found" 
            });
        }

        res.status(200).json({
            message: "Saved job deleted successfully" 
        });
    } 
    catch (error) {
        res.status(500).json({ 
            message: "Error deleting saved job", 
            error: error.message 
        });
    }
};


