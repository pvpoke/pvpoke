// This script formats JSON files with custom rules for better readability
const fs = require('fs');
const path = require('path');

const inputPath = process.argv[2]; // Accept file path as argument

if (!inputPath) {
    console.error('No input file provided.');
    process.exit(1);
}

const fullPath = path.resolve(inputPath);
const json = JSON.parse(fs.readFileSync(fullPath, 'utf8'));

function customStringify(obj, space = 4) {
    return JSON.stringify(obj, (key, value) => {
        if (Array.isArray(value)) {
            const isSimple = value.every(v =>
                typeof v === 'string' || typeof v === 'number'
            );
            if (isSimple) return JSON.stringify(value);
        }
        return value;
    }, space)
        .replace(/"(\[)/g, '$1') // Replace "[ with ["
        .replace(/(\])"/g, '$1') // Replace ]" with ]"
        .replace(/\\"/g, '"') // Replace escaped quotes with normal quotes
        .replace(/,(?=[^\n])/g, ', '); // Add space after commas in arrays
}

function arrayToString(arr) {
    return '[' + arr.join(', ') + ']';
}

const output = customStringify(json);
fs.writeFileSync(fullPath, output);
console.log(`Formatted: ${inputPath}`);
