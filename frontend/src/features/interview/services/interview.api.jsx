
import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3000",
    withCredentials: true,
});

// ======================================
// GENERATE INTERVIEW REPORT
// ======================================

export const generateInterviewReport = async ({
    title,
    jobDescription,
    selfDescription,
    resumeFile
}) => {

    // Validate required fields
    if (!title?.trim()) {
        throw new Error("Job title is required.");
    }

    if (!jobDescription?.trim()) {
        throw new Error("Job description is required.");
    }

    if (!resumeFile) {
        throw new Error("Please upload your resume PDF.");
    }

    const formData = new FormData();

    formData.append("title", title.trim());
    formData.append("jobDescription", jobDescription.trim());
    formData.append("selfDescription", selfDescription || "");
    formData.append("resume", resumeFile);

    const response = await api.post(
        "/api/interview/",
        formData
    );

    return response.data;
};


// ======================================
// GET INTERVIEW REPORT BY ID
// ======================================

export const getInterviewReportById = async (interviewId) => {

    const response = await api.get(
        `/api/interview/report/${interviewId}`
    );

    return response.data;
};


// ======================================
// GET ALL INTERVIEW REPORTS
// ======================================

export const getAllInterviewReports = async () => {

    const response = await api.get(
        "/api/interview/"
    );

    return response.data;
};


// ======================================
// GENERATE RESUME PDF
// ======================================

export const generateResumePdf = async ({ interviewReportId }) => {

    const response = await api.post(
        `/api/interview/resume/pdf/${interviewReportId}`,
        null,
        {
            responseType: "blob"
        }
    );

    return response.data;
};
