import express from 'express'
import cors from 'cors'
import { ChatLlamaCpp } from "langchain/chat_models/llama_cpp";
import { HumanMessage } from "langchain/schema";
import { JSONLoader } from "langchain/document_loaders/fs/json";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { LlamaCppEmbeddings } from "langchain/embeddings/llama_cpp";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { BufferMemory } from "langchain/memory";
import { PromptTemplate } from 'langchain/prompts';
import { RetrievalQAChain, loadQAStuffChain } from "langchain/chains";


const modelPath = "./llama-2-7b-chat.Q5_K_M.gguf";

const chat_model = new ChatLlamaCpp({ 
  modelPath: modelPath ,
});

const chat_memory = new BufferMemory({
  memoryKey: "chat_history",
  returnMessages: true,
});

const loader = new JSONLoader("./data_set.json");

let docs;
let docsLoaded = false;
let splitDocs;
let splitDocsLoaded = false;
let vectorStore;
let vectorStoreLoaded = false;
var legitStore;
var chain;
let chain_initialized = false;


loader.load().then(async (docs) =>{
  console.log("Docs loaded");
  docs = docs;
  docsLoaded = true;

const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500,
  chunkOverlap: 0,
});


textSplitter.splitDocuments(docs).then(async(splitDocs) => {
  console.log("Docs split");
  splitDocs = splitDocs;
  console.log(splitDocs)
  splitDocsLoaded = true;

  
const embeddings = new LlamaCppEmbeddings({
  modelPath: modelPath,
});

vectorStore = await MemoryVectorStore.fromDocuments(
  splitDocs,
  embeddings
);

MemoryVectorStore.fromDocuments(splitDocs, embeddings).then((vectorStore) => {
  legitStore = vectorStore;
  vectorStoreLoaded = true;
  console.log("Vector store loaded");
})
})
})

const app = express()
app.use(express.json())
app.use(cors())

app.get('/health', (req, res) => {
  res.send("App is healthy and running");
})
app.post('/retreival', async (req, res) => {
  const { query } = req.body;
  if (!vectorStoreLoaded){
    res.send("Vector store not loaded yet");
  }
  if (vectorStoreLoaded){
    vectorStore.similaritySearch(query).then((relevantDocs) => {
      res.send(relevantDocs);
    }) 
  }
})

  const promptTemplate = `You are an AI chat bot trained on a set of titles and their corresponding abstracts. 
  Please make sure to act like a chat bot and help the person asking you.
       Question: {question}`;
  
       const prompt = PromptTemplate.fromTemplate(promptTemplate);

app.post('/chat', async(req,res) => {
  const { query } = req.body;
  if (!docsLoaded){
    res.send("Docs not loaded yet");
  }
  if (!splitDocsLoaded){
    res.send("Split docs not loaded yet");
  }
  if (!vectorStoreLoaded){
    res.send("Vector store not loaded yet");
  }
  if (docsLoaded && splitDocsLoaded && vectorStoreLoaded){
      if(!chain_initialized){ 
chain = new RetrievalQAChain({
      combineDocumentsChain: loadQAStuffChain(chat_model, { prompt }),
      retriever: vectorStore.asRetriever() ,
    });
    }
    chain.call({ query: query }).then((result) => {
      res.send(result);
    })
  }
})
const PORT = process.env.PORT || 5050
app.listen(PORT, () => {
  console.log("This is the port: " + PORT)
})
