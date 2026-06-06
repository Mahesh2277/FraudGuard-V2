const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

exports.geminiController = async (req, res)=>{
    try{
        const prompt = req.body.prompt || "Explain how AI works";
        const result = await model.generateContent(prompt);
        const ans = result.response.text();

        return res.status(200).json({
            success: true,
            resp : ans
        })
    }
    catch(error){
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            err : error
        })
    }
}
