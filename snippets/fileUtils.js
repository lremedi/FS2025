const fs = require('fs');

const chardet = require('chardet');
const iconv = require('iconv-lite');

const readFileWithEncoding = (filePath) => {
    try {
        // Detect file encoding
        const encoding = chardet.detectFileSync(filePath);

        // Read file with detected encoding
        const fileBuffer = fs.readFileSync(filePath);
        const fileContent = iconv.decode(fileBuffer, encoding);

        return fileContent;
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.error(`File not found: ${filePath}`);
        } else {
            console.error(`Error reading file: ${error.message}`);
        }
    }
};

const parseJsonFromFile = (filePath) => {
    try {
        if (!fs.existsSync(filePath)) return null;
        const fileContent = readFileWithEncoding(filePath);

        // Parse JSON content
        const jsonData = JSON.parse(fileContent);

        return jsonData;
    } catch (error) {
        if (error instanceof SyntaxError) {
            console.error(`Invalid JSON in file: ${filePath}`);
        } else {
            console.error(`Error reading/parsing file: ${error.message}`);
        }
        return null;
    }
};

const writeJsonToFile = (filePath, data) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error('Error writing JSON to file:', error.message);
    }
}

const appendToFile = async (filename, data) => {
    const content = JSON.stringify(data) + '\n';
    fs.appendFileSync(filename, content);
}

module.exports = {
    parseJsonFromFile,
    writeJsonToFile,
    appendToFile
};