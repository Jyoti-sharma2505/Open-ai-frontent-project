// InterviewCoach.jsx
import React, { useState } from "react";

function InterviewCoach() {
  const [questions, setQuestions] = useState([]);
  const[answers,setAnswer]=useState([])
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const candidateProfile = {
    job_role: "Backend Developer",
    years_experience: 3,
    technical_keywords: ["Node", "Express"],
    company_type: "MNC",
    interview_round: "Technical Round 1",
    focus_area: "Backend",
  };

  const systemPrompt = `
You are an AI Job Interview Coach. 
Return output ONLY in strict JSON format, with explanations.

Candidate Profile:
- Job Role: ${candidateProfile.job_role}
- Years of Experience: ${candidateProfile.years_experience}
- Technical Keywords: ${candidateProfile.technical_keywords.join(", ")}
- Company Type: ${candidateProfile.company_type}
- Interview Round: ${candidateProfile.interview_round}
- Focus Area: ${candidateProfile.focus_area}

Instructions:
- Provide 1–2 interview questions.
- Output strictly in this JSON structure:

{
  "questions": [
    { "id": 1, "question": "string" },
    { "id": 2, "question": "string" }
  ]
}
  {
  "answers": [
    { "id": 1, "answer": "string" },
    { "id": 2, "answer": "string" }
  ]
}
`;
// async function listModels() {
//   const res = await fetch(
//     `https://generativelanguage.googleapis.com/v1/models?key=${import.meta.env.VITE_GEMINI_API_KEY}`
//   );
//   const data = await res.json();
//   console.log("Available models:", data);
// }
// console.log(listModels,"abc")

  async function fetchQuestions() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
          `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt }] }],
          }),
        }
      );

      const data = await res.json();
      console.log("Raw API Response:", JSON.stringify(data, null, 2));

      const output = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      if (!output) {
        throw new Error("No text returned from Gemini");
      }

      let parsed;
      try {
        parsed = JSON.parse(output);
      } catch (e) {
        const match = output.match(/\{[\s\S]*\}/);
        if (match) {
          parsed = JSON.parse(match[0]);
        } else {
          throw new Error("No valid JSON found in AI response");
        }
      }

      setQuestions(parsed.questions || []);
      setAnswer(parsed.answers || []);
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to fetch interview questions");
    }
    setLoading(false);
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>AI Interview Coach (Gemini 2.5 Flash)</h2>
      <button onClick={fetchQuestions} disabled={loading}>
        {loading ? "Loading..." : "Get Interview Questions And Answer"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <ul>
        {questions.map((q) => (
          <li key={q.id}><b>Q{q.id}:</b>{q.question}</li>
        ))}
      </ul>
      <ul>
        {answers.map((a)=>(
            <li key={a.id}><b>A{a.id}:</b>{a.answer}</li>
        ))}
      </ul>

      {/* <pre>{JSON.stringify(questions, null, 2)}</pre> */}
    </div>
  );
}

export default InterviewCoach;
