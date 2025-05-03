const fs = require('fs');
const path = require('path');

const cleanDirectory = (dirPath, maxAgeHours = 24) => {
  const files = fs.readdirSync(dirPath);
  const now = new Date().getTime();
  
  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);
    const fileAgeHours = (now - stats.mtime.getTime()) / (1000 * 60 * 60);
    
    if (fileAgeHours > maxAgeHours) {
      fs.unlinkSync(filePath);
      console.log(`Cleaned: ${filePath}`);
    }
  });
};

// Run daily cleanup
setInterval(() => {
  cleanDirectory(path.join(__dirname, 'public/downloads/temp'), 4);  // Clean temp files older than 4 hours
  cleanDirectory(path.join(__dirname, 'public/downloads/movies/cached'), 24);
  cleanDirectory(path.join(__dirname, 'public/downloads/songs/cached'), 24);
}, 24 * 60 * 60 * 1000);