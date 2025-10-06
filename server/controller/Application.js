const Application = require('../models/Application');

// (Apply) Create job
exports.applyForJob = async (req, res) => {
    try {
        const { userId, jobId } = req.body;

        // Check if already applied
        const existingApp = await Application.findOne({ userId, jobId });

        if (existingApp) {
            return res.status(400).json({ message: "Already applied to this job." });
        }

        const application = new Application({ userId, jobId });
        await application.save();

        res.status(201).json({ 
            message: "Application submitted successfully.", 
            application 
        });
    } 
    catch (error) {
        res.status(500).json({ 
            message: "Server error in ApplyForJob.", 
            error 
        });
    }
};

// Get all applications
exports.getAllApplications = async (req, res) => {
    try {

        const applications = await Application.find()
            .populate('userId', 'name email')  
            .populate('jobId', 'title company');  

        res.status(200).json(applications);
    } 
    catch (error) {
        res.status(500).json({ 
            message: "Server error in getAllApplications.", 
            error 
        });
    }
};

// Get applications by user
exports.getApplicationsByUser = async (req, res) => {
    try {

        const { userId } = req.params;

        const applications = await Application.find({ 
               userId 
            })
            .populate('jobId', 'title company');

        res.status(200).json(applications);
    } 
    catch (error) {
        res.status(500).json({ 
            message: "Server error in getApplicationsByUser.",
            error 
        });
    }
};

// Get applications for a job
exports.getApplicationsByJob = async (req, res) => {
    try {

        const { jobId } = req.params;

        const applications = await Application.find({ jobId })
            .populate('userId', 'name email');

        res.status(200).json(applications);
    } 
    catch (error) {
        res.status(500).json({ 
            message: "Server error in GetApplicationsByJob.",
            error 
        });
    }
};

// Update application status
exports.updateApplicationStatus = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { status } = req.body;

        const updated = await Application.findByIdAndUpdate(
            applicationId,
            { status },
            { new: true }
        );

        if (!updated) return res.status(404).json({ 
            message: "Application not found." 
        });

        res.status(200).json({ 
            message: "Status updated.",
            updated 
        });
    } 
    catch (error) {
        res.status(500).json({ 
            message: "Server error in Update Application Status.", 
            error 
        });
    }
};

// Delete application
exports.deleteApplication = async (req, res) => {
    try {
        const { applicationId } = req.params;

        const deleted = await Application.findByIdAndDelete(applicationId);

        if (!deleted){
            return res.status(404).json({
                message: "Application not found.",
            });
        } 

        res.status(200).json({
            message: "Application deleted.", 
            deleted 
        });
    } 
    catch (error) {
        res.status(500).json({ 
            message: "Server error in Delete Application.",
            error 
        });
    }
};
