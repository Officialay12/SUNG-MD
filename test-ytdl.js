const ytdl = require('ytdl-core');
console.log('ytdl-core version:', ytdl.version);
// Test YouTube URL validation
const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
console.log('URL validation test:', ytdl.validateURL(testUrl) ? '✓ Working' : '✖ Not working');
