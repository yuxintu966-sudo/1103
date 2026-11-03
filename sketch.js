// 1. 題目與素材設定
const QUESTIONS = [
  {
      id: 1,
      svg: "🙋‍♂️🏼",
      question: "幼兒園早上見面時，要說哪一句「你好」？",
      options: ["감사합니다", "안녕하세요", "엄마", "아빠"],
      answer: "안녕하세요",
      explain: "每天早上見面都要大聲開心地說「안녕하세요」！"
  },
  {
      id: 2,
      svg: "🎁🙏",
      question: "別人幫你收玩具、送你貼紙時，要說「謝謝」？",
      options: ["선생님", "아가", "감사합니다", "안녕하세요"],
      answer: "감사합니다",
      explain: "很有禮貌地跟別人說「감사합니다」！"
  },
  {
      id: 3,
      svg: "👩‍👧❤️",
      question: "每天早上溫柔叫你起床的「媽媽」是？",
      options: ["아빠", "엄마", "선생님", "아가"],
      answer: "엄마",
      explain: "最愛我們、最溫柔的「엄마」！"
  },
  {
      id: 4,
      svg: "👨‍👦‍👦🧔",
      question: "鬍子刺刺的、常常陪你玩的「爸爸」是？",
      options: ["엄마", "아가", "선생님", "아빠"],
      answer: "아빠",
      explain: "我們的超級英雄「아빠」！"
  },
  {
      id: 5,
      svg: "👩‍🏫🎨",
      question: "在幼兒園帶大家一起唱歌、畫畫的「老師」是？",
      options: ["선생님", "아빠", "엄마", "감사합니다"],
      answer: "선생님",
      explain: "在學校教我們好多事情的「선생님」！"
  },
  {
      id: 6,
      svg: "👶🍼",
      question: "家裡剛出生、圓滾滾的小小成員「寶寶」是？",
      options: ["아가", "선생님", "엄마", "아빠"],
      answer: "아가",
      explain: "我們家最可愛的「아가」！"
  }
];

// 音效合成
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

function playDingSound() {
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(523.25, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(1046.50, audioCtx.currentTime + 0.3);
  gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.3);
}

function playWrongSound() {
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(220, audioCtx.currentTime);
  osc.frequency.linearRampToValueAtTime(164.81, audioCtx.currentTime + 0.2);
  gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.3);
}

// 韓語發音語音
function speakKorean(text) {
  if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
  }
}

let currentQueue = [];
let currentPos = 0;
let userAnswers = [];

const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');

const startBtn = document.getElementById('start-btn');
const nextBtn = document.getElementById('next-btn');
const restartBtn = document.getElementById('restart-btn');
const retryWrongBtn = document.getElementById('retry-wrong-btn');

const questionNumEl = document.getElementById('question-number');
const imageDisplay = document.getElementById('image-display');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const feedbackCard = document.getElementById('feedback-card');
const feedbackText = document.getElementById('feedback-text');
const progressBarSegments = document.querySelectorAll('.progress-segment');

startBtn.addEventListener('click', () => {
  currentQueue = QUESTIONS.map((_, index) => index);
  currentPos = 0;
  userAnswers = [];
  resetProgressUI();
  switchScreen(quizScreen);
  loadQuestion();
});

function loadQuestion() {
  const qIndex = currentQueue[currentPos];
  const qData = QUESTIONS[qIndex];

  questionNumEl.textContent = `第 ${currentPos + 1}/${currentQueue.length} 題`;
  imageDisplay.innerHTML = `<span class="svg-illustration">${qData.svg}</span>`;
  questionText.textContent = `中文題目：「${qData.question}」`;

  optionsContainer.innerHTML = '';
  qData.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.textContent = opt;
      btn.onclick = () => checkAnswer(opt, btn);
      optionsContainer.appendChild(btn);
  });

  feedbackCard.classList.add('hidden');
  updateProgressBar('current');
}

function checkAnswer(selectedOption, clickedBtn) {
  const qIndex = currentQueue[currentPos];
  const qData = QUESTIONS[qIndex];
  const isCorrect = (selectedOption === qData.answer);

  speakKorean(selectedOption);

  const allBtns = optionsContainer.querySelectorAll('.option-btn');
  allBtns.forEach(btn => btn.disabled = true);

  if (isCorrect) {
      clickedBtn.classList.add('correct-choice');
      playDingSound();
      feedbackText.textContent = `🎉 答對了！${qData.explain}`;
      feedbackCard.className = 'feedback-card correct-bg';
      updateProgressBar('correct');
      userAnswers.push({ qIndex, isCorrect: true });
  } else {
      clickedBtn.classList.add('wrong-choice');
      playWrongSound();
      feedbackText.textContent = `💡 再試一次！正確答案是「${qData.answer}」`;
      feedbackCard.className = 'feedback-card wrong-bg';
      updateProgressBar('wrong');
      userAnswers.push({ qIndex, isCorrect: false });
  }

  feedbackCard.classList.remove('hidden');
}

nextBtn.addEventListener('click', () => {
  currentPos++;
  if (currentPos < currentQueue.length) {
      loadQuestion();
  } else {
      showResults();
  }
});

function showResults() {
  switchScreen(resultScreen);
  const correctCount = userAnswers.filter(a => a.isCorrect).length;
  document.getElementById('stars-count').textContent = correctCount;

  const resultMsg = document.getElementById('result-message');
  if (correctCount === currentQueue.length) {
      resultMsg.textContent = "太厲害了！你全部都答對囉！得滿分！ 🌟";
      retryWrongBtn.classList.add('hidden');
  } else {
      resultMsg.textContent = `好棒的嘗試！答對了 ${correctCount} 題，繼續加油！`;
      retryWrongBtn.classList.remove('hidden');
  }
}

retryWrongBtn.addEventListener('click', () => {
  const wrongQIndices = userAnswers.filter(a => !a.isCorrect).map(a => a.qIndex);
  currentQueue = wrongQIndices;
  currentPos = 0;
  userAnswers = [];
  resetProgressUI();
  switchScreen(quizScreen);
  loadQuestion();
});

restartBtn.addEventListener('click', () => {
  switchScreen(startScreen);
});

function switchScreen(targetScreen) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  targetScreen.classList.add('active');
}

function resetProgressUI() {
  progressBarSegments.forEach((seg, idx) => {
      seg.className = 'progress-segment';
      if (idx >= currentQueue.length) {
          seg.style.display = 'none';
      } else {
          seg.style.display = 'block';
      }
  });
}

function updateProgressBar(status) {
  if (progressBarSegments[currentPos]) {
      progressBarSegments[currentPos].className = `progress-segment ${status}`;
  }
}