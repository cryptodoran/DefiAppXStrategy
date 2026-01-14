// Test script for canvas-based text editing
const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

async function testEdit() {
  // Load original image
  const imagePath = path.join(__dirname, 'image stuff', '4b7af7fc-8618-4927-97d9-f5579ab6971b.png');
  const img = await loadImage(imagePath);

  console.log('Original image size:', img.width, 'x', img.height);

  // Create canvas
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');

  // Draw original image
  ctx.drawImage(img, 0, 0);

  // Improved API response coordinates (y: 30 is correct!)
  const region = {
    originalText: "DAY 1",
    newText: "DAY 2",
    x: 5,
    y: 30,
    width: 30,
    height: 8,
    fontSize: 55,
    fontWeight: "900",
    color: "#FFFFFF",
    backgroundColor: "#000000",
    textAlign: "left",
    letterSpacing: 0,
    textTransform: "uppercase",
    textPaddingLeft: 15
  };

  // Convert percentages to pixels
  const x = (region.x / 100) * canvas.width;
  const y = (region.y / 100) * canvas.height;
  const width = (region.width / 100) * canvas.width;
  const height = (region.height / 100) * canvas.height;

  console.log('Pixel coordinates:', { x, y, width, height });

  // Scale font size based on actual image dimensions
  const scaleFactor = canvas.width / 1024;
  const fontSize = region.fontSize * scaleFactor;

  console.log('Scale factor:', scaleFactor);
  console.log('Font size:', fontSize);

  // Paint over original text with background color
  ctx.fillStyle = region.backgroundColor;
  ctx.fillRect(x, y, width, height);

  // Set up text styling
  ctx.fillStyle = region.color;
  // Node canvas requires simpler font string format
  ctx.font = `bold ${Math.round(fontSize)}px sans-serif`;
  ctx.textBaseline = 'middle';

  console.log('Setting font to:', `bold ${Math.round(fontSize)}px sans-serif`);

  // Apply text transform
  let text = region.newText;
  if (region.textTransform === 'uppercase') {
    text = text.toUpperCase();
  }

  // Calculate text position - add some padding from left edge
  const padding = (region.textPaddingLeft || 0) * scaleFactor;
  let textX = x + padding;
  ctx.textAlign = 'left';

  const textY = y + height / 2;

  console.log('Text position:', { textX, textY });
  console.log('Text to draw:', text);
  console.log('Font:', ctx.font);

  // Draw the text
  ctx.fillText(text, textX, textY);

  // Save result
  const outputPath = path.join(__dirname, 'image stuff', 'edited-result.png');
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);

  console.log('Saved edited image to:', outputPath);
}

testEdit().catch(console.error);
