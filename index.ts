import fs from "node:fs";
import path from "node:path";
import NodeMic from "node-mic";
import { OpenAI } from "openai";
import { playAudioFile } from "audic";

const mic = new NodeMic({
  rate: 48000,
  channels: 1,
  threshold: 6,
  fileType: "wav",
});

const inputStream = mic.getAudioStream();
const outputStream = fs.createWriteStream("user.wav");
const aiAudioPath = path.resolve("ai.mp3");

inputStream.pipe(outputStream);

inputStream.on("started", () => {
  console.log("Recording...");
  setTimeout(() => {
    mic.stop();
  }, 10000);
});

inputStream.on("stopped", async () => {
  console.log("Stopped");

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const { text: transcription } = await openai.audio.transcriptions.create({
    file: fs.createReadStream("user.wav"),
    model: "whisper-1",
    language: "en",
  });

  const chat = await openai.chat.completions.create({
    model: "gpt-4-1106-preview",
    messages: [
      {
        role: "user",
        content: transcription,
      },
    ],
  });


  const aiMessage = chat.choices[0].message.content;
  if (!aiMessage) {
    console.warn("No message from AI");
    return;
  }

  console.log(aiMessage);
  const mp3 = await openai.audio.speech.create({
    model: "tts-1",
    voice: "shimmer",
    input: aiMessage,
    response_format: "mp3",
  });

  const buffer = Buffer.from(await mp3.arrayBuffer());
  fs.writeFileSync(aiAudioPath, buffer);
  console.log("file written");
});

mic.start();
