const fs = require('fs');
const content = fs.readFileSync('C:/Users/mrtau/.gemini/antigravity/brain/a2df4e32-5221-40ea-a7a6-d3a82a94cf5e/.system_generated/steps/79/content.md', 'utf8');
const match = content.match(/"paths":(\{.*?\})/);
if (match) {
    const paths = JSON.parse(match[1].replace(/\\\\/g, '\\\\').replace(/\\"/g, '"'));
    console.log(Object.keys(paths));
}
