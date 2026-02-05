import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import OpenAI from "openai"
import path from "path"
import { fileURLToPath } from "url"

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(express.static(__dirname))

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"))
})

app.get("/api/challenge", async (req, res) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You create creative prompt-writing challenges." },
        { role: "user", content: "Give one fun prompt-engineering challenge for students." }
      ]
    })

    res.json({ challenge: response.choices[0].message.content })
  } catch (err) {
    res.status(500).json({ error: "Failed to generate challenge" })
  }
})

app.post("/api/judge", async (req, res) => {
  try {
    const userPrompt = req.body.prompt

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an expert prompt engineering judge. Score prompts and give feedback." },
        { role: "user", content: `Evaluate this prompt and respond in JSON with keys score (1-10), strengths, weaknesses, tips:\n\n${userPrompt}` }
      ],
      response_format: { type: "json_object" }
    })

    const result = JSON.parse(response.choices[0].message.content)
    res.json(result)

  } catch (err) {
    res.status(500).json({ error: "Failed to judge prompt" })
  }
})

app.listen(3000, () => console.log("Server running on http://localhost:3000"))