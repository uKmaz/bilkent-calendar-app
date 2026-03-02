const fs = require('fs');
const path = require('path');

const normalPath = 'C:/Windows/Fonts/times.ttf';
const boldPath = 'C:/Windows/Fonts/timesbd.ttf';

const normal = fs.readFileSync(normalPath).toString('base64');
const bold = fs.readFileSync(boldPath).toString('base64');

const out = `
export const timesNormal = '${normal}';
export const timesBold = '${bold}';
`;

fs.mkdirSync(path.join(__dirname, 'src/lib/fonts'), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'src/lib/fonts/times.ts'), out);
console.log('Fonts generated successfully.');
