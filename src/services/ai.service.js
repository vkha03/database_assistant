import { GoogleGenerativeAI } from "@google/generative-ai";
import promptAI from "../utils/prompt.js";

const AIHandle = async (question, schema, errMessage) => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_API_MODEL,
  });

  const prompt = promptAI(question, schema, errMessage);
  const result = await model.generateContent(prompt);
  let generatedSQL = result.response.text().trim();
  generatedSQL = generatedSQL.replace(/```sql|```/g, "").trim();
  const isSafe = /^\s*(SELECT|WITH)\b/i.test(generatedSQL);

  if (!isSafe) {
    throw new Error(
      `Truy vấn không hợp lệ hoặc có nguy cơ bảo mật: ${generatedSQL.substring(0, 100)}...`,
      { statusCode: 403 },
    );
  }

  return generatedSQL;
};

export default AIHandle;
