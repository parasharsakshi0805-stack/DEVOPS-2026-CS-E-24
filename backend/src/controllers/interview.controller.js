
const pdfParse = require("pdf-parse");

const {
    generateInterviewReport,
    generateResumePdf
} = require("../services/ai.service");

const interviewReportModel = require("../models/interviewReport.model");

// ======================================
// GENERATE INTERVIEW REPORT
// ======================================

async function generateInterViewReportController(req, res) {
    try {

        // 1. Extract frontend data
        const {
            title,
            selfDescription,
            jobDescription
        } = req.body;

        // 2. Validate required fields
        if (!title || !title.trim()) {
            return res.status(400).json({
                message: "Job title is required."
            });
        }

        if (!jobDescription || !jobDescription.trim()) {
            return res.status(400).json({
                message: "Job description is required."
            });
        }

        // Resume is required in your current frontend
        if (!req.file) {
            return res.status(400).json({
                message: "Please upload your resume PDF."
            });
        }

        // Check PDF file type
        if (
            req.file.mimetype !== "application/pdf" &&
            !req.file.originalname.toLowerCase().endsWith(".pdf")
        ) {
            return res.status(400).json({
                message: "Only PDF files are supported."
            });
        }

        // 3. Extract text from PDF
        const pdfParser = new pdfParse.PDFParse(
            Uint8Array.from(req.file.buffer)
        );

        let resumeContent;

        try {
            resumeContent = await pdfParser.getText();
        } finally {
            if (typeof pdfParser.destroy === "function") {
                await pdfParser.destroy();
            }
        }

        const resumeText = resumeContent?.text?.trim();

        if (!resumeText) {
            return res.status(400).json({
                message: "Could not extract text from the uploaded PDF."
            });
        }

        // 4. Generate report using Gemini AI
        const interViewReportByAi = await generateInterviewReport({

            title: title.trim(),

            resume: resumeText,

            selfDescription: selfDescription || "",

            jobDescription: jobDescription.trim()

        });

        // 5. Save report in MongoDB
        const interviewReport = await interviewReportModel.create({

            ...interViewReportByAi,

            title: title.trim(),

            user: req.user.id,

            resume: resumeText,

            selfDescription: selfDescription || "",

            jobDescription: jobDescription.trim()

        });

        // 6. Send successful response
        return res.status(201).json({

            message: "Interview report generated successfully.",

            interviewReport

        });

    } catch (error) {

        console.error(
            "Generate Interview Report Controller Error:",
            error
        );

        return res.status(500).json({

            message: "Failed to generate interview report.",

            error: error.message

        });
    }
}


// ======================================
// GET INTERVIEW REPORT BY ID
// ======================================

async function getInterviewReportByIdController(req, res) {
    try {

        const { interviewId } = req.params;

        const interviewReport = await interviewReportModel.findOne({
            _id: interviewId,
            user: req.user.id
        });

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found."
            });
        }

        return res.status(200).json({

            message: "Interview report fetched successfully.",

            interviewReport

        });

    } catch (error) {

        console.error("Get Interview Report Error:", error);

        return res.status(500).json({

            message: "Failed to fetch interview report.",

            error: error.message

        });
    }
}


// ======================================
// GET ALL INTERVIEW REPORTS
// ======================================

async function getAllInterviewReportsController(req, res) {
    try {

        const interviewReports = await interviewReportModel

            .find({
                user: req.user.id
            })

            .sort({
                createdAt: -1
            })

            .select(
                "-resume -selfDescription -jobDescription -__v"
            );

        return res.status(200).json({

            message: "Interview reports fetched successfully.",

            interviewReports

        });

    } catch (error) {

        console.error("Get All Interview Reports Error:", error);

        return res.status(500).json({

            message: "Failed to fetch interview reports.",

            error: error.message

        });
    }
}


// ======================================
// GENERATE RESUME PDF
// ======================================

async function generateResumePdfController(req, res) {
    try {

        const { interviewReportId } = req.params;

        // Only allow the logged-in user to access their report
        const interviewReport = await interviewReportModel.findOne({

            _id: interviewReportId,

            user: req.user.id

        });

        if (!interviewReport) {
            return res.status(404).json({

                message: "Interview report not found."

            });
        }

        const {
            resume,
            jobDescription,
            selfDescription
        } = interviewReport;

        // Generate tailored resume
        const pdfBuffer = await generateResumePdf({

            resume,

            jobDescription,

            selfDescription

        });

        res.set({

            "Content-Type": "application/pdf",

            "Content-Disposition":
                `attachment; filename=resume_${interviewReportId}.pdf`

        });

        return res.send(pdfBuffer);

    } catch (error) {

        console.error("Generate Resume PDF Error:", error);

        return res.status(500).json({

            message: "Failed to generate resume PDF.",

            error: error.message

        });
    }
}


// ======================================
// EXPORT CONTROLLERS
// ======================================

module.exports = {

    generateInterViewReportController,

    getInterviewReportByIdController,

    getAllInterviewReportsController,

    generateResumePdfController

};
