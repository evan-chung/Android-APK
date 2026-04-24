const { execSync } = require('child_process');
const path = require('path');

// Change to project directory
process.chdir('C:/Users/user/.qclaw/workspace/LoRaToolApp2');

// Run react-native config
try {
  const result = execSync('npx react-native config', { 
    encoding: 'utf-8',
    cwd: 'C:/Users/user/.qclaw/workspace/LoRaToolApp2'
  });
  console.log(result);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
