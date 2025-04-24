---
path: run-deepseek-in-local-terminal
date: "2025-01-25"
title: Run DeepSeek R1 locally from a .js script
description: A guide on how to run DeepSeek's open-source AI model locally in your terminal via a .js script
featured_image_url: ''
tags:
  - tech
--- 

Let's run DeepSeek's R1 AI model locally. 

## Prerequisites

- About 8GB of free disk space
- Node.js

## Steps

### 1. Install Ollama

```bash
brew install ollama
```

### 2. Download and run the DeepSeek R1 model locally.

Pick a model size. 14b should work on a 2024 M3 MacBook Pro.

```bash
1.5B version (smallest):
ollama run deepseek-r1:1.5b

8B version:
ollama run deepseek-r1:8b

14B version:
ollama run deepseek-r1:14b

32B version:
ollama run deepseek-r1:32b

70B version (biggest/smartest):
ollama run deepseek-r1:70b
```

Now you can try it out.

```bash
ollama run deepseek-r1:8b
```

## 3. Run it from a .js script

Make a new directory, get the ollama package, and create a new file called `index.js`.

```bash
mkdir deepseek-test
cd deepseek-test
npm init -y
npm install ollama
touch index.js
```

Add the following code to `index.js`:
```js
// Import the Ollama library, which provides tools to interact with AI models
import { Ollama } from 'ollama';

async function runDeepSeekR1() {
  // Create an instance of the Ollama client
  const ollama = new Ollama();

  const messages = [
    { role: 'user', content: 'What is the capital of France?' }
  ];

  try {
    const response = await ollama.chat({
      model: 'deepseek-r1:14b',
      messages: messages,
      stream: true              // Enable streaming for real-time response
    });

    // Loop through the streamed response parts
    // The `for await...of` syntax is used to handle asynchronous iteration
    for await (const part of response) {
      // Write each part of the response to the standard output (console)
      process.stdout.write(part.message.content);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

runDeepSeekR1();
```

Now run the script:
```bash
node index.js
```

Output:
```
❯ node index.js
<think>
Okay, so I need to figure out what the capital of France is. Hmm, I think it's Paris, but I'm not entirely sure. Let me see... France is a country in Europe, right? I remember learning about some major cities there. Paris sounds familiar because of things like the Eiffel Tower and the Louvre Museum. But wait, could it be another city? Maybe Lyon or Marseille? No, those are probably just big cities, not capitals.

I think the capital is where the government is located. So if Paris has places like the Élysée Palace, which I believe is where the President lives and works, that must be part of why it's the capital. Also, there's the National Assembly and other important government buildings in Paris. That makes sense because capitals are usually centers for government activities.

I'm trying to recall any movies or books set in France. They often mention Paris as the main city, so that reinforces the idea that it's the capital. Sometimes they refer to Paris as "the City of Light," which is a nickname I've heard before. That sounds like something a capital might be known for, especially if it's a center of culture and history.

Wait, but I'm not 100% certain. Could there have been times when the capital was somewhere else? Maybe during conflicts or historical events? I think in some revolutions or wars, capitals can change, but I don't remember any instance where France had a different capital. It's always Paris in my mind.

Also, looking at maps, Paris is centrally located in France, which makes sense geographically for a capital because it's easier to govern from a central point. Other capitals I know are like London for England and Washington D.C. for the United States, so following that pattern, Paris would make sense as the capital of France.

I should also consider if there's any official documentation or sources that state this. From what I've read before in textbooks and reliable websites, they all say that Paris is the capital. So combining all these thoughts together, it seems clear that Paris is indeed the capital of France.
</think>

The capital of France is Paris.%
```

You've just run DeepSeek's R1 model locally in your terminal.

You can iterate on your `index.js` script and make it do cool stuff.


ps. Thanks to [this Reddit post](https://www.reddit.com/r/selfhosted/comments/1i6ggyh/got_deepseek_r1_running_locally_full_setup_guide/) for steps 1 and 2.




