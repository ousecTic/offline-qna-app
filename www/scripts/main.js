let extractedTexts = [];
let model;

document.addEventListener("DOMContentLoaded", async () => {
  const uploadBtn = document.getElementById("uploadBtn");
  const askBtn = document.getElementById("askBtn");
  const fileInput = document.getElementById("fileInput");
  const textOutput = document.getElementById("textOutput");
  const questionInput = document.getElementById("questionInput");
  const answerOutput = document.getElementById("answerOutput");
  const qaSection = document.getElementById("qaSection");

  // Load the QnA model
  model = await qna.load();

  uploadBtn.addEventListener("click", async () => {
    const files = fileInput.files;
    if (files.length > 0) {
      textOutput.innerHTML = "Processing images...";
      extractedTexts = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const text = await processFile(file);
        extractedTexts.push({ name: file.name, text: text });
      }

      displayExtractedTexts();
      qaSection.style.display = "block";
    }
  });

  askBtn.addEventListener("click", async () => {
    const question = questionInput.value;
    if (question && extractedTexts.length > 0) {
      answerOutput.innerHTML = "Processing question...";
      let allText = extractedTexts.map((item) => item.text).join(" ");
      const answers = await model.findAnswers(question, allText);
      console.log(answers);
      if (answers.length > 0) {
        answerOutput.innerHTML = `Answer: ${answers[0].text}`;
      } else {
        answerOutput.innerHTML = "No answer found.";
      }
    }
  });
});

async function processFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const img = new Image();
      img.onload = async () => {
        const text = await performOCR(img);
        resolve(text);
      };
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function performOCR(image) {
  const result = await Tesseract.recognize(image, "eng", {
    logger: (m) => console.log(m),
  });
  return result.data.text;
}

function displayExtractedTexts() {
  const textOutput = document.getElementById("textOutput");
  textOutput.innerHTML = extractedTexts
    .map(
      (item) =>
        `<div class="file-item">
                    <h3>${item.name}</h3>
                    <p>${item.text}</p>
                </div>`
    )
    .join("");
}
