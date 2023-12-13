import express from 'express'
import cors from 'cors'
import { ChatLlamaCpp } from "langchain/chat_models/llama_cpp";
import { HumanMessage } from "langchain/schema";

const app = express()

app.use(express.json())
app.use(cors())

const modelPath = "./llama-2-7b-chat.Q5_K_M.gguf";

const model = new ChatLlamaCpp({ modelPath: modelPath });



app.get('/health', (req, res) => {
  res.send("App is healthy and running");
})

app.post('/query', async (req, res) => {
  const { query } = req.body;
  const stream = await model.stream(query);

  for await (const chunk of stream) {
    console.log(chunk.content);
  }

})

const PORT = process.env.PORT || 5050

app.listen(PORT, () => {
  console.log("This is the port: " + PORT)
})

