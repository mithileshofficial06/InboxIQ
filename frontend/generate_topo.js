const fs = require('fs');

const width = 800;
const height = 800;
const numLines = 30;

let paths = '';

// Generate smooth topographic lines using bezier curves
for (let i = 0; i < numLines; i++) {
  const scale = 1 + (i * 0.15); // Scale outward
  const offset = i * 15;
  
  // Center blob
  const cx1 = 200, cy1 = 200;
  const cx2 = 600, cy2 = 500;
  
  // Creating organic path shapes around cx1, cy1
  let path1 = `M ${cx1},${cy1 - offset} `;
  path1 += `C ${cx1 + offset * 1.5},${cy1 - offset} ${cx1 + offset * 1.5},${cy1 + offset} ${cx1},${cy1 + offset} `;
  path1 += `C ${cx1 - offset * 1.5},${cy1 + offset} ${cx1 - offset * 1.5},${cy1 - offset} ${cx1},${cy1 - offset} Z`;

  // Creating organic path shapes around cx2, cy2
  let path2 = `M ${cx2},${cy2 - offset} `;
  path2 += `C ${cx2 + offset * 2},${cy2 - offset} ${cx2 + offset * 1.5},${cy2 + offset * 1.5} ${cx2},${cy2 + offset} `;
  path2 += `C ${cx2 - offset * 1.2},${cy2 + offset * 0.8} ${cx2 - offset * 1.5},${cy2 - offset} ${cx2},${cy2 - offset} Z`;

  paths += `<path d="${path1}" fill="none" stroke="#c9c5be" stroke-width="2" />\n`;
  paths += `<path d="${path2}" fill="none" stroke="#c9c5be" stroke-width="2" />\n`;
  
  // A larger connected blob encompassing both
  if (i > 15) {
      let mergeOffset = offset * 1.2;
      let path3 = `M ${cx1},${cy1 - mergeOffset} `;
      path3 += `C ${cx1 + mergeOffset * 3},${cy1 - mergeOffset} ${cx2 + mergeOffset},${cy2 - mergeOffset} ${cx2},${cy2 - mergeOffset} `;
      path3 += `C ${cx2 + mergeOffset},${cy2 + mergeOffset} ${cx1 + mergeOffset},${cy2 + mergeOffset} ${cx1},${cy1 + mergeOffset} `;
      path3 += `C ${cx1 - mergeOffset},${cy1 + mergeOffset * 0.5} ${cx1 - mergeOffset},${cy1 - mergeOffset} ${cx1},${cy1 - mergeOffset} Z`;
      paths += `<path d="${path3}" fill="none" stroke="#c9c5be" stroke-width="2" />\n`;
  }
}

// Add a few sweeping lines across the whole canvas
for(let j=0; j<10; j++) {
    const y1 = 100 + j*70;
    const y2 = 150 + j*70;
    const y3 = 200 + j*70;
    paths += `<path d="M 0,${y1} Q 200,${y2-100} 400,${y2} T 800,${y3}" fill="none" stroke="#c9c5be" stroke-width="2" />\n`;
}

const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800">
  ${paths}
</svg>`;

fs.writeFileSync('public/topo.svg', svg);
console.log('Created public/topo.svg');
