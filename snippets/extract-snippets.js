require('dotenv').config();
const { writeJsonToFile, parseJsonFromFile } = require('./fileUtils');
const lsifFilePath = process.env.CODEBASEGRAPH_FILE;
const snippetsPath = process.env.SNIPPETS_FILE;

const extractCodeSnippet = (fullRange, content) => {
    const lines = content.split('\n');
    const { start, end } = fullRange;

    if (
        start.line < 0 || end.line < 0 ||
        start.line >= lines.length || end.line >= lines.length ||
        start.character < 0 || end.character < 0
    ) {
        throw new Error('Invalid range specified.');
    }

    if (start.line === end.line) {
        return lines[start.line].substring(start.character, end.character);
    }

    const snippet = [];
    snippet.push(lines[start.line].substring(start.character)); // Extract from start character to the end of the start line.
    for (let i = start.line + 1; i < end.line; i++) {
        snippet.push(lines[i]); // Add full lines in between.
    }
    snippet.push(lines[end.line].substring(0, end.character)); // Extract from the start to the end character on the last line.

    return snippet.join('\n');
}

const extractSnippets = (lsifData) => {
    let codeSnippets = [];

    //document uri contains src and is not node_modules
    const documentNodes = lsifData.filter(node => node.type === 'vertex' && node.label === 'document' && node.uri.includes('src') && !node.uri.includes('node_modules'));

    documentNodes.forEach(documentNode => {
        const base64Content = documentNode.contents;
        const decodedContent = Buffer.from(base64Content, 'base64').toString('utf-8');
        const edge = lsifData.find(edge => edge.type === 'edge' && edge.label === 'contains' && edge.outV === documentNode.id);
        const rangeNodeIds = edge.inVs;
        rangeNodeIds.forEach(rangeNodeId => {
            const rangeNode = lsifData.filter(node => node.id === rangeNodeId && node.type === 'vertex' && node.label === 'range' && node.tag["type"] === "definition")[0];
            if (rangeNode) {
                const codeSnippet = extractCodeSnippet(rangeNode.tag.fullRange, decodedContent);

                codeSnippets.push(
                    {
                        id: rangeNode.id,
                        language: documentNode.languageId,
                        documentId: documentNode.id,
                        documentUri: documentNode.uri,
                        rangeStart: rangeNode.tag.fullRange.start,
                        rangeEnd: rangeNode.tag.fullRange.end,
                        codeSnippet: codeSnippet,
                        fileContext: decodedContent,
                        lineContext: rangeNode.tag.fullRange.start.line == rangeNode.tag.fullRange.end.line ? decodedContent.split('\n')[rangeNode.tag.fullRange.start.line] : ""
                    }
                );
            }
        });

    });

    return codeSnippets;
};

(async () => {
    try {
        const lsifData = parseJsonFromFile(lsifFilePath);
        if (!lsifData) {
            throw new Error('Failed to parse LSIF data');
        }
        // Extract code snippets
        const snippets = extractSnippets(lsifData);
        writeJsonToFile(snippetsPath, snippets);
    }
    catch (error) {
        console.error('Error extracting snippets:', error);
    }
})();