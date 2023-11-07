# OpenAI GPT Voice Assistant

To install dependencies:

```bash
bun install
```

Create a `.env.local` file and setup it with `OPENAI_API_KEY = KEY-GOES-HERE` in your env.

To run:

```bash
bun run index.ts
```

# Run

The app will listen for your voice for 10s, before auto stopping.
The response will be written in your terminal and also generated as a .mp3 file in your repository.