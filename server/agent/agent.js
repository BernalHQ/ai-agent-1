import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { MemorySaver } from "@langchain/langgraph";

const weatherTool = tool(async ({query}) => {
    console.log(query);

    return 'The weather in tokio is sunny';
}, {
  name: 'weather',
  description: 'Get the weather in a given location',
  schema: z.object({
      query: z.string().describe('The location to get the weather for')
  })
});

const jsExecuter = tool(async ({code}) => {
    const response = await fetch('http://localhost:3001/', {
      method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            code: code,
        }),
    });

    const result = await response.json();

    return result
}, {
  name: 'run_javascript_code_tool',
  description: `
    Run general pr+urpose javascript code.
    this can be used to access internet or do any computation that you need.
    The output will be composed of stdout and stderr.
    The code shoud be written in a way that it can be executed with javascript eval in node envahiroment.
  `,
  schema: z.object({
      code: z.string().describe('The code to run')
  })
});

const llm = new ChatAnthropic({
    model: 'claude-3-5-sonnet-latest',
    apiKey: process.env.ANTHROPIC_KEY
});

const checkpointSaver = new MemorySaver();

export const agent = createReactAgent({
 llm: llm,
 tools: [weatherTool, jsExecuter],	
 checkpointSaver: checkpointSaver
});

/*
const response = await agent.invoke({
    messages: [{
        role: 'user',
        content: 'Whats the weather in tokio?'
    }]
},
{
  configurable: { thread_id: 42 }
}
);

const followup = await agent.invoke({
    messages: [{
        role: 'user',
        content: 'Whats city is that for?'
    }]
},
{
  configurable: { thread_id: 42 }
}
);


console.log(response.messages.at(-1).content); 
console.info('other: ', followup.messages.at(-1).content); 
*/
