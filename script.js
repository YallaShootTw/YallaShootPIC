// لصق الصورة مباشرة من الحافظة
document.addEventListener('paste', (event) => {
  const items = event.clipboardData.items;
  for (let item of items) {
    if (item.type.indexOf('image') === 0) {
      const blob = item.getAsFile();
      loadImage(blob); // تحميل الصورة من الحافظة
    }
  }
});

// تحميل الصورة وعرضها على القماش (Canvas)
function loadImage(file) {
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      canvas.style.display = 'block'; // عرض الصورة على القماش
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}
