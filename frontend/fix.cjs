const fs = require('fs');
const path = require('path');

function walkDir(dir) {
  let files = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) files = files.concat(walkDir(file));
    else if (file.endsWith('.tsx')) files.push(file);
  });
  return files;
}

const files = walkDir(path.join(__dirname, 'src'));
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/import React from 'react';\r?\n/g, '');
  content = content.replace(/import React, {/g, 'import {');
  fs.writeFileSync(file, content);
});
console.log('Fixed React imports');
