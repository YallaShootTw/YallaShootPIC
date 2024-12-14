document.getElementById('extractButton').addEventListener('click', () => {
  const imageInput = document.getElementById('imageInput').files[0];
  
  if (!imageInput) {
    alert('Please select an image!');
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const image = reader.result;

    // استخدام Tesseract.js مع دعم اللغة العربية
    Tesseract.recognize(
      image,               // صورة الإدخال
      'ara',               // تحديد اللغة العربية
      {
        logger: info => console.log(info) // لمعرفة تقدم العملية
      }
    ).then(({ data: { text } }) => {
      document.getElementById('outputText').innerText = text;
    }).catch(error => {
      console.error(error);
      alert('Error extracting text. Try another image.');
    });
  };

  reader.readAsDataURL(imageInput);
});
