
const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema");
const puppeteer = require("puppeteer");

// ======================================
// GEMINI CONFIGURATION
// ======================================

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
});


// ======================================
// INTERVIEW REPORT SCHEMA
// ======================================

const questionSchema = z.object({
    question: z.string(),
    intention: z.string(),
    answer: z.string()
});

const interviewReportSchema = z.object({

    title: z.string(),

    matchScore: z.number().min(0).max(100),

    technicalQuestions: z.array(questionSchema),

    behavioralQuestions: z.array(questionSchema),

    skillGaps: z.array(
        z.object({
            skill: z.string(),
            severity: z.enum(["low", "medium", "high"])
        })
    ),

    preparationPlan: z.array(
        z.object({
            day: z.number(),
            focus: z.string(),
            tasks: z.array(z.string())
        })
    )

});


// ======================================
// NORMALIZE GEMINI RESPONSE
// ======================================

function normalizeInterviewReport(data, jobTitle) {

    // Convert technical questions into objects
    const technicalQuestions = (
        data.technicalQuestions || []
    ).map((item) => {

        if (typeof item === "string") {
            return {
                question: item,
                intention: "To evaluate technical knowledge.",
                answer: "Explain the concept clearly and give a practical example."
            };
        }

        return item;
    });


    // Convert behavioral questions into objects
    const behavioralQuestions = (
        data.behavioralQuestions || []
    ).map((item) => {

        if (typeof item === "string") {
            return {
                question: item,
                intention: "To evaluate communication and problem-solving skills.",
                answer: "Use the STAR method: Situation, Task, Action and Result."
            };
        }

        return item;
    });


    // Convert skill gaps into objects
    const skillGaps = (
        data.skillGaps || []
    ).map((item) => {

        if (typeof item === "string") {
            return {
                skill: item,
                severity: "medium"
            };
        }

        return item;
    });


    // Convert preparation plan into objects
    const preparationPlan = (
        data.preparationPlan || []
    ).map((item, index) => {

        if (typeof item === "string") {
            return {
                day: index + 1,
                focus: item,
                tasks: [
                    `Study ${item}`,
                    `Practice questions related to ${item}`,
                    `Revise the important concepts of ${item}`
                ]
            };
        }

        return item;
    });


    return {

        ...data,

        title: jobTitle,

        matchScore: Number(data.matchScore),

        technicalQuestions,

        behavioralQuestions,

        skillGaps,

        preparationPlan

    };
}


// ======================================
// GENERATE INTERVIEW REPORT
// ======================================

async function generateInterviewReport({
    title,
    resume,
    selfDescription,
    jobDescription
}) {

    try {

        if (!process.env.GOOGLE_GENAI_API_KEY) {
            throw new Error("GOOGLE_GENAI_API_KEY is missing from .env file.");
        }

        if (!title || !jobDescription || !resume) {
            throw new Error(
                "Job title, job description and resume are required."
            );
        }

        const prompt = `
You are an expert technical interviewer and career coach.

Generate a detailed and personalized interview preparation report.

JOB TITLE:
${title}

CANDIDATE RESUME:
${resume}

CANDIDATE SELF DESCRIPTION:
${selfDescription || "Not provided"}

JOB DESCRIPTION:
${jobDescription}

IMPORTANT INSTRUCTIONS:

1. Return a valid JSON object.
2. Do not return Markdown or code fences.
3. The title must be "${title}".
4. matchScore must be a number between 0 and 100.
5. technicalQuestions must be an array of objects.
   Each object must contain:
   - question
   - intention
   - answer

6. behavioralQuestions must be an array of objects.
   Each object must contain:
   - question
   - intention
   - answer

7. skillGaps must be an array of objects.
   Each object must contain:
   - skill
   - severity (low, medium, or high)

8. preparationPlan must be an array of objects.
   Each object must contain:
   - day (number)
   - focus
   - tasks (array of strings)

9. Generate at least:
   - 6 technical questions
   - 4 behavioral questions
   - 4 skill gaps
   - 5 preparation plan days

10. Questions must be relevant to the candidate's resume
    and the target job description.

11. Identify genuine missing skills. Do not invent experience
    or qualifications that are not present in the resume.

12. Give practical answers and actionable improvement tasks.
`;

        // Call Gemini
        const response = await ai.models.generateContent({

            model: "gemini-3-flash-preview",

            contents: prompt,

            config: {

                responseMimeType: "application/json",

                responseSchema: zodToJsonSchema(
                    interviewReportSchema
                )

            }

        });


        // Check response
        if (!response || !response.text) {
            throw new Error("Gemini returned an empty response.");
        }

        console.log("Gemini response received successfully.");


        // Parse JSON response
        let parsedData;

        try {

            parsedData = JSON.parse(response.text);

        } catch (parseError) {

            console.error(
                "Gemini JSON Parsing Error:",
                parseError.message
            );

            throw new Error(
                "Gemini returned invalid JSON. Please try again."
            );
        }


        // Normalize response
        const normalizedData = normalizeInterviewReport(
            parsedData,
            title
        );


        // Validate response using Zod
        const validatedData = interviewReportSchema.safeParse(
            normalizedData
        );

        if (!validatedData.success) {

            console.error(
                "Gemini Schema Validation Error:",
                validatedData.error.flatten()
            );

            throw new Error(
                "Gemini response does not match the required interview report format."
            );
        }


        console.log("Interview report generated and validated successfully.");

        return validatedData.data;

    } catch (error) {

        console.error(
            "Generate Interview Report Service Error:",
            error.message
        );

        throw error;
    }
}


// ======================================
// GENERATE PDF FROM HTML
// ======================================

async function generatePdfFromHtml(htmlContent) {

    let browser;

    try {

        browser = await puppeteer.launch();

        const page = await browser.newPage();

        await page.setContent(htmlContent, {
            waitUntil: "networkidle0"
        });

        const pdfBuffer = await page.pdf({

            format: "A4",

            printBackground: true,

            margin: {
                top: "20mm",
                bottom: "20mm",
                left: "15mm",
                right: "15mm"
            }

        });

        return pdfBuffer;

    } finally {

        if (browser) {
            await browser.close();
        }
    }
}


// ======================================
// GENERATE TAILORED RESUME PDF
// ======================================

async function generateResumePdf({
    resume,
    selfDescription,
    jobDescription
}) {

    try {

        const resumePdfSchema = z.object({
            html: z.string()
        });

        const prompt = `
You are a professional resume writer.

Create a professional, ATS-friendly resume using the candidate's
actual information.

EXISTING RESUME:
${resume}

SELF DESCRIPTION:
${selfDescription || "Not provided"}

TARGET JOB DESCRIPTION:
${jobDescription}

REQUIREMENTS:

1. Return a JSON object with one field named "html".
2. The html field must contain complete HTML.
3. Create a professional and simple resume.
4. Keep it ideally 1-2 pages.
5. Highlight relevant skills and projects.
6. Do not invent degrees, companies, experience, or certifications.
7. Use ATS-friendly headings and formatting.
8. Use readable fonts and a clean layout.
9. Do not include unnecessary graphics or tables.
`;

        const response = await ai.models.generateContent({

            model: "gemini-3-flash-preview",

            contents: prompt,

            config: {

                responseMimeType: "application/json",

                responseSchema: zodToJsonSchema(
                    resumePdfSchema
                )

            }

        });


        if (!response || !response.text) {
            throw new Error("Gemini returned an empty resume response.");
        }


        const jsonContent = JSON.parse(response.text);


        const validatedResume = resumePdfSchema.safeParse(
            jsonContent
        );


        if (!validatedResume.success) {

            console.error(
                "Resume Schema Validation Error:",
                validatedResume.error.flatten()
            );

            throw new Error(
                "Gemini returned an invalid resume format."
            );
        }


        // Convert HTML into PDF
        const pdfBuffer = await generatePdfFromHtml(
            validatedResume.data.html
        );

        return pdfBuffer;

    } catch (error) {

        console.error(
            "Generate Resume PDF Service Error:",
            error.message
        );

        throw error;
    }
}


// ======================================
// EXPORT FUNCTIONS
// ======================================

module.exports = {

    generateInterviewReport,

    generateResumePdf

};
