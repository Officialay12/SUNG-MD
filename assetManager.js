const fs = require('fs');
const path = require('path');
const { SOLO_LEVELING_QUOTES } = require('./config/constants');

class AssetManager {
  constructor() {
    this.imageBase = path.join(__dirname, 'public/images');
    this.downloadBase = path.join(__dirname, 'public/downloads');
  }

  getRandomSoloImage() {
    const imageDir = path.join(this.imageBase, 'solo_leveling/jinwoo');
    const categories = fs.readdirSync(imageDir);
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const images = fs.readdirSync(path.join(imageDir, randomCategory));
    const randomImage = images[Math.floor(Math.random() * images.length)];
    
    return {
      path: path.join('solo_leveling/jinwoo', randomCategory, randomImage),
      caption: SOLO_LEVELING_QUOTES[Math.floor(Math.random() * SOLO_LEVELING_QUOTES.length)]
    };
  }

  cacheDownload(fileType, id, content) {
    const cacheDir = path.join(this.downloadBase, fileType, 'cached');
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
    
    const filePath = path.join(cacheDir, `${id}.${fileType === 'movies' ? 'mp4' : 'mp3'}`);
    fs.writeFileSync(filePath, content);
    
    return filePath;
  }
}

module.exports = new AssetManager();