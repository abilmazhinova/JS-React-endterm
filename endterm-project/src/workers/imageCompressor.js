self.onmessage = async (event) => {
  const file = event.data;

  try {
    const img = await createImageBitmap(file);

    const canvas = new OffscreenCanvas(img.width, img.height);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(img, 0, 0);

    const blob = await canvas.convertToBlob({
      type: "image/jpeg",
      quality: 0.6,
    });

    self.postMessage(blob, [blob]); // обязательно передаём blob
  } catch (error) {
    self.postMessage({ error: error.message });
  }
};
