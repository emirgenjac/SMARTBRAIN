import * as faceapi from '@vladmandic/face-api';

let modelsReady;

export function loadFaceModels() {
  if (!modelsReady) {
    modelsReady = faceapi.nets.ssdMobilenetv1
      .loadFromUri(`${process.env.PUBLIC_URL}/models`)
      .catch((err) => {
        modelsReady = undefined;
        throw err;
      });
  }
  return modelsReady;
}

async function canvasFromImage(image) {
  const response = await fetch(image.src, { credentials: 'include' });
  if (!response.ok) {
    throw new Error('image fetch failed');
  }
  const blob = await response.blob();
  const bitmap = await createImageBitmap(blob, { imageOrientation: 'from-image' });
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  canvas.getContext('2d', { willReadFrequently: true }).drawImage(bitmap, 0, 0);
  bitmap.close();
  return canvas;
}

export async function detectFaces(image) {
  await loadFaceModels();
  const canvas = await canvasFromImage(image);
  const options = new faceapi.SsdMobilenetv1Options({ minConfidence: 0.3 });
  const detections = await faceapi.detectAllFaces(canvas, options);
  const scaleX = image.width / canvas.width;
  const scaleY = image.height / canvas.height;
  return detections.map((detection) => ({
    top: detection.box.y * scaleY,
    left: detection.box.x * scaleX,
    width: detection.box.width * scaleX,
    height: detection.box.height * scaleY
  }));
}
