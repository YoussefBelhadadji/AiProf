const fs = require('fs');
let txt = fs.readFileSync('frontend/src/pages/Students.tsx', 'utf8');

txt = txt.replace('{realStudents.length > 0 && (', '{realStudents.length > 0 && (');
txt = txt.replace('{realStudents.length > 0 && (\n      {/* Toolbar */}', '{/* Toolbar */}\n      {realStudents.length > 0 && (\n        <div className=\"flex flex-col gap-6\">');

// Now we need to close the div and the ) before the eturn or the end of the <div> wrapper.
// Actually, let's just make it simple. We can wrap the Toolbar down to just before the conditional rendering of the table.

