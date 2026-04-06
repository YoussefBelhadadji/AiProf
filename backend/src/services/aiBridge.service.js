/**
 * AI Bridge Service
 * ==================
 * 
 * 🔥 CRITICAL RULE: This is a DUMB BRIDGE ONLY
 * 
 * Node DOES NOT:
 * ❌ Make decisions
 * ❌ Apply rules
 * ❌ Analyze data
 * ❌ Do any AI logic
 * 
 * Node ONLY:
 * ✅ Receives request
 * ✅ Calls Python subprocess
 * ✅ Returns result
 */

const { spawn } = require('child_process');
const path = require('path');

exports.runAiPipeline = (studentData) => {
  return new Promise((resolve, reject) => {
    const pythonScript = path.resolve(__dirname, '../../ai_engine/main.py');
    const pyProcess = spawn('python', [pythonScript, JSON.stringify(studentData)]);
    
    let stdout = '';
    let stderr = '';
    
    pyProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    pyProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    pyProcess.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`Python process failed: ${stderr}`));
      }
      
      try {
        const result = JSON.parse(stdout);
        resolve(result);
      } catch (e) {
        reject(new Error(`Failed to parse Python output: ${e.message}`));
      }
    });
    
    pyProcess.on('error', (err) => {
      reject(new Error(`Failed to spawn Python process: ${err.message}`));
    });
  });
};

