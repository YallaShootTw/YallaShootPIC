// العناصر من HTML
const imageInput = document.getElementById('imageInput');
const outputText = document.getElementById('outputText');
const loadingText = document.getElementById('loadingText');
const cropButton = document.getElementById('cropButton');
const extractButton = document.getElementById('extractButton');
const canvas = document.getElementById('imageCanvas');
const ctx = canvas.getContext('2d');

let croppedImage = null;

// تحميل الصورة إلى القماش
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

// عند اختيار صورة
imageInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    loadImage(file);
  }
});

// قص الصورة
let isCropping = false;
let startX, startY, endX, endY;

canvas.addEventListener('mousedown', (event) => {
  isCropping = true;
  startX = event.offsetX;
  startY = event.offsetY;
});

canvas.addEventListener('mouseup', (event) => {
  isCropping = false;
  endX = event.offsetX;
  endY = event.offsetY;
  cropImage();
});

function cropImage() {
  const width = endX - startX;
  const height = endY - startY;

  const croppedCanvas = document.createElement('canvas');
  croppedCanvas.width = width;
  croppedCanvas.height = height;

  const croppedCtx = croppedCanvas.getContext('2d');
  croppedCtx.drawImage(canvas, startX, startY, width, height, 0, 0, width, height);

  croppedImage = croppedCanvas.toDataURL('image/png'); // حفظ الصورة المقصوصة
}

// تحويل الصورة باستخدام OCR.Space API
extractButton.addEventListener('click', () => {
  if (!croppedImage) {
    alert('يرجى قص الصورة أولاً.');
    return;
  }

  loadingText.style.display = 'block';
  outputText.innerText = '';

  // استدعاء API لتحويل الصورة إلى نص
  fetch('https://api.ocr.space/parse/image', {
    method: 'POST',
    body: JSON.stringify({
      apikey: 'K86027703788957', // مفتاح API الخاص بك
      base64Image: croppedImage.replace(/^data:image\/(png|jpg|jpeg);base64,/, ''),
      language: 'ara', // دعم اللغة العربية
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response.json())
    .then((data) => {
      loadingText.style.display = 'none';
      if (data.ParsedResults && data.ParsedResults.length > 0) {
        const text = data.ParsedResults[0].ParsedText;
        const cleanedText = text
          .replace(/[0-9]/g, '') // إزالة الأرقام
          .split('\n') // فصل الأسطر
          .filter((line) => line.trim() !== '') // إزالة الأسطر الفارغة
          .join('\n');
        outputText.innerText = cleanedText; // عرض النص النظيف
      } else {
        alert('لم يتم استخراج النص بنجاح.');
      }
    })
    .catch((error) => {
      console.error(error);
      alert('حدث خطأ أثناء الاتصال بـ API.');
    });
});
