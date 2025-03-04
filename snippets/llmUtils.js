const axios = require('axios');
require('dotenv').config();

const CONFIG = {
    tokenUrl: process.env.TOKEN_URL,
    llmUrl: process.env.LLM_URL,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    scope: process.env.SCOPE,
    model: process.env.MODEL
};

let tokenCache = {
    accessToken: null,
    expiresAt: null
};

async function getToken() {
    const currentTime = Date.now();
    const timeBuffer = 5 * 60 * 1000; // 5 minutes in milliseconds

    // Return cached token if it exists and isn't near expiration
    if (tokenCache.accessToken && tokenCache.expiresAt &&
        currentTime < tokenCache.expiresAt - timeBuffer) {
        return tokenCache.accessToken;
    }
    try {
        const response = await axios.post(CONFIG.tokenUrl, {
            client_id: CONFIG.clientId,
            client_secret: CONFIG.clientSecret,
            grant_type: 'client_credentials',
            scope: CONFIG.scope
        }, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        // Calculate expiration time from refresh_expires_in
        const expiresIn = response.data.refresh_expires_in || 3600; // fallback to 1 hour
        tokenCache = {
            accessToken: response.data.access_token,
            expiresAt: currentTime + (expiresIn * 1000)
        };
        return response.data.access_token;
    } catch (error) {
        console.error('Error fetching access token:', error);
        throw error;
    }
}

async function getResponseFromLlmService(messages) {
    try {
        const accessToken = await getToken();
        const chatRequest = {
            messages: messages,
            model: CONFIG.model,
            frequency_penalty: 0.0,
            presence_penalty: 0.0,
            stream: false,
            stream_options: null,
            temperature: 1.0,
            top_p: 1.0,
            max_tokens: 2048,
            n: 1
        };

        const response = await axios.post(CONFIG.llmUrl, chatRequest, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error in LLM service:', error);
        throw error;
    }
}

const systemPrompt = `You are a code expert, super senior dev. 
Your goal is to analyze and explain the given code snippets. Give straight code description, no need for human-like intros.
RESPONSE FORMAT:
- Use Markdown formatting
- One reply per conversation turn
`;

const systemPromptPO = `You are a product owner expert. 
Your goal is to analyze and explain the given product requirements. Give straight product description, no need for human-like intros.
RESPONSE FORMAT:
- JSON
- One reply per conversation turn
`;

const createBacklogItemPrompts = (context) => {
    const sourceContext = `SOURCE CONTEXT
-------------
File Name: ${context.payload.documentUri}
File Content:\n\`\`\`${context.payload.language}\n${context.payload.fileContext}\n\`\`\`
Language: ${context.payload.language}
Location: L${context.payload.rangeStart.line}:${context.payload.rangeStart.character} to L${context.payload.rangeEnd.line}:${context.payload.rangeEnd.character}
${context.payload.lineContext ? `Line Content:\n\`\`\`${context.payload.language}\n${context.payload.lineContext}\n\`\`\`\n` : ''}`;

    const codeToAnalyze = `CODE TO ANALYZE
--------------
${context.codeSnippet}`;

    const explanationToAnalyze = `EXPLANATION TO ANALYZE
    --------------
    ${context.explanation}`;

    const request = `
    Please analyze this code and its explanation and create a JSON body with the following format that will be later used to feed Agility:
    AssetType is \`Story\` for stories and \`Defect\` for defects:
    Name is a short string
    Description is a xhtml string containing details of what the story need to do is gherkin sintax, or what the defect need to fix in gherkin sintax.
    Keep Scope to be \`Scope:0\`

    Create a few per request:
    Example of response:
    \n\`\`\`json\n
        {
            "assets":
            [
                {
                    "AssetType": "Story",
                    "Name": "New Story",
                    "Scope": "Scope:0"
                },
                {
                    "AssetType": "Defect",
                    "Name": "Another New Defect",
                    "Scope": "Scope:0"
                }

            ]
        }    
        \n\`\`\``;
        return [sourceContext, codeToAnalyze, explanationToAnalyze, request];
}

const createCodeExplanationPrompts = (context) => {

    const sourceContext = `SOURCE CONTEXT
-------------
File Name: ${context.documentUri}
File Content:\n\`\`\`${context.language}\n${context.fileContext}\n\`\`\`
Language: ${context.language}
Location: L${context.rangeStart.line}:${context.rangeStart.character} to L${context.rangeEnd.line}:${context.rangeEnd.character}
${context.lineContext ? `Line Content:\n\`\`\`${context.language}\n${context.lineContext}\n\`\`\`\n` : ''}`;

    const codeToAnalyze = `CODE TO ANALYZE
--------------
${context.codeSnippet}`;

    const explanationRequest = `
    Please analyze this code and explain:
    1. What the code does at a high level
    2. Key components and their purposes
    3. Important functions/methods
    4. Notable patterns or techniques used
    5. Any potential concerns or improvements
    
    Code to analyze:
    {code_context}
    """
    
    analysis_format = """
    ### Overview
    {high_level_explanation}
    
    ### Key Components
    {components_breakdown}
    
    ### Important Functions
    {functions_explanation}
    
    ### Implementation Details
    {technical_details}`;

    return [sourceContext, codeToAnalyze, explanationRequest];
}

module.exports = {
    systemPrompt,
    getResponseFromLlmService,
    createCodeExplanationPrompts,
    createBacklogItemPrompts,
    systemPromptPO
};