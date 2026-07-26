const Jimp = require('jimp');

Jimp.read('public/qr-template.jpeg').then(image => {
  const width = image.bitmap.width;
  const height = image.bitmap.height;
  console.log(`Image dimensions: ${width}x${height}`);

  // Find pure white pixels (or very close to white)
  let minX = width, maxX = 0, minY = height, maxY = 0;
  
  // We expect two white boxes:
  // 1. Large square in the top right half.
  // 2. Small rectangle at the bottom right.
  
  // Let's scan the top half for the QR box
  let qrMinX = width, qrMaxX = 0, qrMinY = height, qrMaxY = 0;
  // Let's scan the bottom half for the text box
  let textMinX = width, textMaxX = 0, textMinY = height, textMaxY = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const color = Jimp.intToRGBA(image.getPixelColor(x, y));
      if (color.r > 240 && color.g > 240 && color.b > 240) { // white-ish
        if (y < height * 0.7) {
          // Top half (QR code)
          qrMinX = Math.min(qrMinX, x);
          qrMaxX = Math.max(qrMaxX, x);
          qrMinY = Math.min(qrMinY, y);
          qrMaxY = Math.max(qrMaxY, y);
        } else {
          // Bottom half (ticket)
          textMinX = Math.min(textMinX, x);
          textMaxX = Math.max(textMaxX, x);
          textMinY = Math.min(textMinY, y);
          textMaxY = Math.max(textMaxY, y);
        }
      }
    }
  }

  console.log(`QR Box: left=${(qrMinX/width*100).toFixed(2)}%, top=${(qrMinY/height*100).toFixed(2)}%, width=${((qrMaxX-qrMinX)/width*100).toFixed(2)}%, height=${((qrMaxY-qrMinY)/height*100).toFixed(2)}%`);
  console.log(`Text Box: left=${(textMinX/width*100).toFixed(2)}%, top=${(textMinY/height*100).toFixed(2)}%, width=${((textMaxX-textMinX)/width*100).toFixed(2)}%, height=${((textMaxY-textMinY)/height*100).toFixed(2)}%`);
});
