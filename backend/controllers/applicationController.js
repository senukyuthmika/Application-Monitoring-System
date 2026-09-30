const applicationModel = require("../models/applicationModel");


// Create Application
const createApplication = async (req, res) => {

    try {

        const application = await applicationModel.createApplication({
            ...req.body,
            owner_id: req.user.user_id
        });


        res.status(201).json({
            message: "Application created successfully",
            application
        });


    } catch(error){

        console.log(error);

        res.status(500).json({
            message:"Failed to create application"
        });

    }

};



// Get all applications
const getApplications = async (req,res)=>{

    try{

        const applications =
            await applicationModel.getApplications();


        res.json(applications);


    }catch(error){

        console.log(error);

        res.status(500).json({
            message:"Failed to fetch applications"
        });

    }

};



// Get application by ID
const getApplicationById = async(req,res)=>{

    try{

        const application =
            await applicationModel.getApplicationById(
                req.params.id
            );


        if(!application){

            return res.status(404).json({
                message:"Application not found"
            });

        }


        res.json(application);


    }catch(error){

        console.log(error);

        res.status(500).json({
            message:"Failed to fetch application"
        });

    }

};



// Update Application
const updateApplication = async(req,res)=>{


    try{


        const application =
            await applicationModel.updateApplication(
                req.params.id,
                req.body
            );


        res.json({
            message:"Application updated successfully",
            application
        });



    }catch(error){

        console.log(error);

        res.status(500).json({
            message:"Failed to update application"
        });

    }


};



// Delete Application
const deleteApplication = async(req,res)=>{


    try{


        const application =
            await applicationModel.deleteApplication(
                req.params.id
            );


        res.json({
            message:"Application deleted successfully",
            application
        });


    }catch(error){

        console.log(error);

        res.status(500).json({
            message:"Failed to delete application"
        });

    }


};



module.exports = {

    createApplication,
    getApplications,
    getApplicationById,
    updateApplication,
    deleteApplication

};