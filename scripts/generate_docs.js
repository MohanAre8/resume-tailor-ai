const fs = require('fs');
const path = require('path');

const mdPath = path.join(__dirname, '../TECHNICAL_DOCUMENTATION.md');
const htmlPath = path.join(__dirname, '../TECHNICAL_DOCUMENTATION.html');

try {
  const content = fs.readFileSync(mdPath, 'utf8');
  
  // Basic MD to HTML conversion (simple replacement for headers and tables)
  let html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Technical Documentation</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 20px; color: #333; }
        h1 { color: #111; border-bottom: 2px solid #eee; padding-bottom: 10px; }
        h2 { color: #222; margin-top: 30px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
        h3 { color: #444; }
        code { background: #f4f4f4; padding: 2px 5px; border-radius: 3px; font-family: monospace; }
        table { border-collapse: collapse; width: 100%; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background: #f8f8f8; }
        pre { background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; }
        .toc { background: #f9f9f9; padding: 20px; border-radius: 5px; margin-bottom: 30px; }
    </style>
</head>
<body>
  `;

  // Very primitive converter
  const lines = content.split('\n');
  lines.forEach(line => {
    if (line.startsWith('# ')) html += `<h1>${line.substring(2)}</h1>`;
    else if (line.startsWith('## ')) html += `<h2>${line.substring(3)}</h2>`;
    else if (line.startsWith('### ')) html += `<h3>${line.substring(4)}</h3>`;
    else if (line.startsWith('|')) {
        // Table handling could be complex, omitting for high-level primitive
        html += `<p>${line}</p>`; 
    }
    else if (line.startsWith('- ')) html += `<li>${line.substring(2)}</li>`;
    else if (line.trim() === '') html += `<br>`;
    else html += `<p>${line}</p>`;
  });

  html += `</body></html>`;
  
  fs.writeFileSync(htmlPath, html);
  console.log('Successfully generated TECHNICAL_DOCUMENTATION.html');
} catch (err) {
  console.error('Error generating docs:', err);
}
