// العناصر من HTML
const imageInput = document.getElementById('imageInput');
const outputText = document.getElementById('outputText');
const loadingText = document.getElementById('loadingText');
const cropButton = document.getElementById('cropButton');
const extractButton = document.getElementById('extractButton');
const canvas = document.getElementById('imageCanvas');
const ctx = canvas.getContext('2d');

let croppedImage = null;

// تحميل الصورة إلى القماش (Canvas)
function loadImage(file) {
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      // تحديد الحجم المناسب للعرض
      const maxWidth = 800; // العرض الأقصى
      const maxHeight = 600; // الارتفاع الأقصى
      let width = img.width;
      let height = img.height;

      // ضبط الأبعاد مع الحفاظ على نسبة الأبعاد
      if (width > maxWidth) {
        height = (maxWidth / width) * height;
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = (maxHeight / height) * width;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      canvas.style.display = 'block'; // عرض القماش
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

  // تأكد من أن الأبعاد صحيحة
  if (width <= 0 || height <= 0) {
    alert('يرجى تحديد مساحة صحيحة للقص.');
    return;
  }

  const croppedCanvas = document.createElement('canvas');
  croppedCanvas.width = width;
  croppedCanvas.height = height;

  const croppedCtx = croppedCanvas.getContext('2d');
  croppedCtx.drawImage(canvas, startX, startY, width, height, 0, 0, width, height);

  croppedImage = croppedCanvas.toDataURL('image/png'); // حفظ الصورة المقصوصة
  alert('تم قص الصورة بنجاح.');
}

// تحويل الصورة باستخدام OCR.Space API
extractButton.addEventListener('click', () => {
  if (!croppedImage) {
    alert('يرجى قص الصورة أولاً.');
    return;
  }

  loadingText.style.display = 'block';
  outputText.innerText = '';

  // تجهيز الصورة لإرسالها إلى API
  const base64Image = croppedImage.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');

  fetch('https://api.ocr.space/parse/image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      apikey: 'K86027703788957', // مفتاح API الخاص بك
      base64Image: base64Image,
      language: 'ara', // اللغة العربية
    }),
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
        alert('لم يتم استخراج النص بنجاح. تأكد من وضوح النص في الصورة.');
      }
    })
    .catch((error) => {
      loadingText.style.display = 'none';
      console.error(error);
      alert('حدث خطأ أثناء الاتصال بـ API. الرجاء المحاولة مرة أخرى.');
    });
});
