self.onmessage = async (event) => {
  const file = event.data;

  try {
    // превращаем файл в bitmap
    const bitmap = await createImageBitmap(file);

    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const ctx = canvas.getContext("2d");

    // рисуем изображение
    ctx.drawImage(bitmap, 0, 0);

    // сжимаем JPEG до 60%
    const blob = await canvas.convertToBlob({
      type: "image/jpeg",
      quality: 0.6
    });

    // читаем blob в base64
    const reader = new FileReader();
    reader.onloadend = () => {
      self.postMessage(reader.result); // отправляем base64 обратно в React
    };
    reader.readAsDataURL(blob);

  } catch (err) {
    console.error("Worker error:", err);
    self.postMessage(null);
  }
};