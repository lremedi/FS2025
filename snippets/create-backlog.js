const fs = require('fs');
const { parseJsonFromFile, writeJsonToFile } = require('./fileUtils');
const { getResponseFromLlmService, createBacklogItemPrompts, systemPromptPO } = require('./llmUtils');

require('dotenv').config();
const backlog = process.env.BACKLOG_FILE;
const dataPath = process.env.DATA_FILE;


const createChatMessages = (prompts) => {
    return [
        { role: 'system', content: systemPromptPO },
        ...prompts.map(prompt => ({ role: 'user', content: prompt }))
    ];
}

(async () => {
    try {
        const data = parseJsonFromFile(dataPath);
        const backlogItems = [];

        const batchSize = 20;
        const total = data.length;

        for (let i = 0; i < total; i += batchSize) {
            const batchStartTime = Date.now();
            const batch = data.slice(i, i + batchSize);
            const batchPromises = batch.map(context => {
                process.stdout.write(`\r Processing snippet ${i + batch.indexOf(context) + 1}/${total}`);
                const prompts = createBacklogItemPrompts(context);
                const chat = createChatMessages(prompts);
                return getResponseFromLlmService(chat)
                .then(response => {
                    const assets = JSON.parse(response['choices'][0]['message']['content'])["assets"];
                    if (assets)
                        backlogItems.push(...assets);
                });
            });

            await Promise.all(batchPromises);
            const batchEndTime = Date.now();
            const batchProcessingTime = (batchEndTime - batchStartTime) / 1000; // Convert to seconds
            console.log(`\nBatch ${Math.floor(i / batchSize) + 1} processing time: ${batchProcessingTime.toFixed(2)} seconds`);
            writeJsonToFile(backlog, backlogItems)
        }

    } catch (error) {
        console.error('Error analyzing data:', error);
    }
})();

