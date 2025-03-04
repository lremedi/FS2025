const { parseJsonFromFile, writeJsonToFile } = require('./fileUtils');
require('dotenv').config();
const codebasePath = "file:///" + process.env.CODEBASE_PATH.replaceAll('\\','/');
const codebaseRepoPath = process.env.CODEBASEREPO_PATH;
const dataPath = process.env.DATA_FILE

const snippetsFile = process.env.SNIPPETS_FILE;
const trainingDataFile = process.env.SNIPPETS_EXPLANATION_FILE;

(async () => {
    try {
        const snippetsObjs = parseJsonFromFile(snippetsFile);
        const existingTrainingData = parseJsonFromFile(trainingDataFile);

        // merge these two arrays take id and explanation from existingTrainingData and codeSnippet from snippetsObjs into a new array and save it to data.json
        //remove basePath from documentUri

        const data = existingTrainingData.map((item) => {
            const snippet = snippetsObjs.find(snippet => snippet.id === item.id);
            return { ...item, codeSnippet: snippet.codeSnippet, 
            payload: {
                id: snippet.id,
                documentUri: snippet.documentUri.replace(codebasePath, codebaseRepoPath),
                language: snippet.language,
                codeSnippet: snippet.codeSnippet,
                lineContext: snippet.lineContext,
                fileContext: snippet.fileContext,
                rangeStart: snippet.rangeStart,
                rangeEnd: snippet.rangeEnd,
            } };
        });
        writeJsonToFile(dataPath, data);
    } catch (error) {
        console.error('Error processing merging data:', error);
    }
})();

