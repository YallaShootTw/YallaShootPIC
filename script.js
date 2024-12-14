// التعامل مع رفع الصورة
const imageInput = document.getElementById('imageInput');
const imageLabel = document.getElementById('imageLabel');
const outputText = document.getElementById('outputText');
const loadingText = document.getElementById('loadingText');
const cropButton = document.getElementById('cropButton');
const extractButton = document.getElementById('extractButton');
const canvas = document.getElementById('imageCanvas');
const ctx = canvas.getContext('2d');

let croppedImage = null;

// السماح بلصق الصورة من الحافظة
document.addEventListener('paste', (event) => {
  const items = event.clipboardData.items;
  for (let item of items) {
    if (item.type.indexOf('image') === 0) {
      const blob = item.getAsFile();
      loadImage(blob);
    }
  }
});

// تحميل الصورة
imageInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    loadImage(file);
  }
});

// عرض الصورة لتحريرها
function loadImage(file) {
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      canvas.style.display = 'block';
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

// قص الصورة
cropButton.addEventListener('click', () => {
  const width = canvas.width / 2; // مثال لقص النصف
  const height = canvas.height / 2;
  const croppedCanvas = document.createElement('canvas');
  croppedCanvas.width = width;
  croppedCanvas.height = height;
  const croppedCtx = croppedCanvas.getContext('2d');
  croppedCtx.drawImage(canvas, 0, 0, width, height, 0, 0, width, height);
  croppedImage = croppedCanvas.toDataURL();
  alert('تم قص الصورة. اضغط تحويل.');
});

// استخراج النص
extractButton.addEventListener('click', () => {
  if (!croppedImage) {
    alert('يرجى قص الصورة أولاً.');
    return;
  }
  loadingText.style.display = 'block';
  outputText.innerText = '';

  Tesseract.recognize(croppedImage, 'ara', {
    logger: (info) => console.log(info),
  }).then(({ data: { text } }) => {
    loadingText.style.display = 'none';
    const cleanedText = text.replace(/[0-9]/g, '').split('\n').join('\n');
    outputText.innerText = cleanedText;
  }).catch((err) => {
    console.error(err);
    alert('حدث خطأ أثناء التحويل.');
  });
});
