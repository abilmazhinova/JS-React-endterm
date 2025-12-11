// public/compress-worker.js
self.addEventListener('message', function(e) {
  const file = e.data;
  const reader = new FileReader();
  
  reader.onload = function(event) {
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Устанавливаем максимальный размер
      const MAX_WIDTH = 200;
      const MAX_HEIGHT = 200;
      let width = img.width;
      let height = img.height;
      
      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      
      // Конвертируем в base64 с качеством 70%
      const base64 = canvas.toDataURL('image/jpeg', 0.7);
      self.postMessage(base64);
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
});