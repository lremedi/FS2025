const fs = require('fs');
const { parseJsonFromFile, writeJsonToFile } = require('./fileUtils');
const { getResponseFromLlmService, createCodeExplanationPrompts, systemPrompt } = require('./llmUtils');

require('dotenv').config();
const snippetsFile = process.env.SNIPPETS_FILE;
const snippetsExplanation = process.env.SNIPPETS_EXPLANATION_FILE;

const createChatMessages = (prompts) => {
    return [
        { role: 'system', content: systemPrompt },
        ...prompts.map(prompt => ({ role: 'user', content: prompt }))
    ];
}

(async () => {
    try {
        console.log(snippetsExplanation);
        const snippetsObjs = parseJsonFromFile(snippetsFile);
        const existingSnippetsExplanation = parseJsonFromFile(snippetsExplanation) ?? [];
        const varNameRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

        let filteredSnippets = snippetsObjs.filter(snippet => {
            const alreadyProcessed = existingSnippetsExplanation.some(item => item.id === snippet.id);
            return !varNameRegex.test(snippet.codeSnippet) && !alreadyProcessed;
        });

        const batchSize = 20;
        const total = filteredSnippets.length;

        for (let i = 0; i < total; i += batchSize) {
            const batchStartTime = Date.now();
            const batch = filteredSnippets.slice(i, i + batchSize);
            const batchPromises = batch.map(snippet => {
                process.stdout.write(`\r Processing snippet ${i + batch.indexOf(snippet) + 1}/${total}`);
                const prompts = createCodeExplanationPrompts(snippet);
                const chat = createChatMessages(prompts);
                return getResponseFromLlmService(chat)
                    .then(response => (existingSnippetsExplanation.push({ 
                        id: snippet.id, 
                        explanation: response['choices'][0]['message']['content'] 
                    })));
            });

            await Promise.all(batchPromises);
            const batchEndTime = Date.now();
            const batchProcessingTime = (batchEndTime - batchStartTime) / 1000; // Convert to seconds
            console.log(`\nBatch ${Math.floor(i/batchSize) + 1} processing time: ${batchProcessingTime.toFixed(2)} seconds`);
            writeJsonToFile(snippetsExplanation, existingSnippetsExplanation)
        }

    } catch (error) {
        console.error('Error analyzing data:', error);
    }
})();

