const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const publicDir = path.join(process.cwd(), 'public');
const heroImagePath = path.join(publicDir, 'hero-bg.jpg');
const optimizedHeroPath = path.join(publicDir, 'hero-bg-optimized.jpg');

async function optimizeHeroImage() {
  try {
    // Read the original image
    const imageBuffer = fs.readFileSync(heroImagePath);

    // Optimize the image
    await sharp(imageBuffer)
      .resize(1920, 1080, { // Resize to a reasonable size
        fit: 'cover',
        position: 'center'
      })
      .jpeg({
        quality: 85,
        progressive: true,
        mozjpeg: true
      })
      .toFile(optimizedHeroPath);

    console.log('Hero image optimized successfully!');
  } catch (error) {
    console.error('Error optimizing hero image:', error);
  }
}

optimizeHeroImage(); 