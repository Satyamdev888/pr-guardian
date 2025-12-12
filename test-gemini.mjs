import { GoogleGenerativeAI } from "@google/generative-ai";

// ⚠️ PASTE YOUR REAL KEY HERE
const API_KEY = "AIzaSy..."; 

const modelNames = [
  "gemini-1.5-flash",
  "gemini-1.5-flash-001",
  "gemini-1.5-flash-latest",
  "gemini-pro"
];

async function testAll() {
  const genAI = new GoogleGenerativeAI(API_KEY);

  for (const name of modelNames) {
    console.log(`👉 Testing model name: "${name}"...`);
    try {
      const model = genAI.getGenerativeModel({ model: name });
      const result = await model.generateContent("Say hello.");
      const response = await result.response;
      console.log(`✅ SUCCESS! "${name}" works.`);
      return; // Stop after finding the first working one
    } catch (error) {
      console.log(`❌ "${name}" failed.`);
    }
  }
}

testAll();