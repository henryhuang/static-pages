const shapes = [
  { name: 'diamond', zh: '菱形', color: '#6fbde7', type: 'css' },
  { name: 'oval', zh: '椭圆形', color: '#51c6b7', type: 'css' },
  { name: 'heart', zh: '心形', color: '#ff6b81', type: 'css' },
  { name: 'crescent', zh: '月牙形', color: '#a78bd4', type: 'css' },
  { name: 'star', zh: '星形', color: '#ffd74b', type: 'star' }
];

const shapeQuestions = [
  { object: 'starfish', art: '🌟', shape: 'star', sentence: 'The starfish is a star.' },
  { object: 'moon', art: '🌙', shape: 'crescent', sentence: 'The moon is a crescent.' },
  { object: 'egg', art: '🥚', shape: 'oval', sentence: 'The egg is an oval.' },
  { object: 'kite', art: '🪁', shape: 'diamond', sentence: 'The kite is a diamond.' },
  { object: 'cookie', art: '💗', shape: 'heart', sentence: 'The cookie is a heart.' }
];

const phonicsWords = [
  { word: 'flag', sound: 'g', icon: '🚩' }, { word: 'dog', sound: 'g', icon: '🐶' },
  { word: 'leg', sound: 'g', icon: '🦵' }, { word: 'log', sound: 'g', icon: '🪵' },
  { word: 'look', sound: 'k', icon: '👀' }, { word: 'cook', sound: 'k', icon: '👩‍🍳' },
  { word: 'book', sound: 'k', icon: '📕' }, { word: 'talk', sound: 'k', icon: '💬' }
];

const phonicsExamples = {
  k: ['look', 'cook', 'book', 'talk'],
  g: ['flag', 'dog', 'leg', 'log']
};

let stars = Number(localStorage.getItem('susu-shape-stars') || 0);
let shapeIndex = 0;
let phonicsIndex = 0;
let shapeLocked = false;
let phonicsLocked = false;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

let preferredVoice = null;
const fullscreenButton = $('#fullscreenButton');

function nativeFullscreenElement() {
  return document.fullscreenElement || document.webkitFullscreenElement || null;
}

function updateFullscreenButton(active) {
  document.documentElement.classList.toggle('study-fullscreen', active);
  fullscreenButton.setAttribute('aria-pressed', String(active));
  fullscreenButton.setAttribute('aria-label', active ? '退出全屏学习' : '进入全屏学习');
  fullscreenButton.querySelector('[aria-hidden]').textContent = active ? '↙' : '⛶';
  fullscreenButton.querySelector('.fullscreen-label').textContent = active ? '退出' : '全屏';
}

async function toggleFullscreen() {
  if (nativeFullscreenElement()) {
    const exit = document.exitFullscreen || document.webkitExitFullscreen;
    if (exit) await exit.call(document);
    updateFullscreenButton(false);
    return;
  }
  const enter = document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen;
  if (enter) {
    try {
      await enter.call(document.documentElement);
      updateFullscreenButton(true);
      return;
    } catch (_) {}
  }
  updateFullscreenButton(!document.documentElement.classList.contains('study-fullscreen'));
}

function voiceScore(voice) {
  const label = `${voice.name} ${voice.voiceURI}`.toLowerCase();
  let score = voice.lang.toLowerCase() === 'en-us' ? 40 : voice.lang.toLowerCase().startsWith('en') ? 10 : -100;
  const preferences = [
    ['microsoft aria online', 180], ['google us english', 170],
    ['ava', 145], ['samantha', 140], ['jenny', 135],
    ['allison', 125], ['zoe', 120], ['aria', 115],
    ['premium', 90], ['enhanced', 80], ['natural', 75]
  ];
  preferences.forEach(([name, points]) => {
    if (label.includes(name)) score += points;
  });
  if (label.includes('espeak')) score -= 120;
  return score;
}

function refreshPreferredVoice() {
  if (!('speechSynthesis' in window)) return;
  preferredVoice = window.speechSynthesis.getVoices()
    .filter(voice => voice.lang.toLowerCase().startsWith('en'))
    .sort((a, b) => voiceScore(b) - voiceScore(a))[0] || null;
}

function speak(text, rate = 0.74) {
  if (!('speechSynthesis' in window)) return;
  if (!preferredVoice) refreshPreferredVoice();
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  if (preferredVoice) utterance.voice = preferredVoice;
  utterance.rate = rate;
  utterance.pitch = 1;
  utterance.volume = 1;
  window.speechSynthesis.speak(utterance);
}

refreshPreferredVoice();
if ('speechSynthesis' in window) {
  window.speechSynthesis.addEventListener('voiceschanged', refreshPreferredVoice);
}

function chime(good = true) {
  try {
    const audio = new (window.AudioContext || window.webkitAudioContext)();
    const notes = good ? [523, 659, 784] : [220, 196];
    notes.forEach((frequency, index) => {
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      gain.gain.setValueAtTime(.08, audio.currentTime + index * .1);
      gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + .25 + index * .1);
      oscillator.connect(gain).connect(audio.destination);
      oscillator.start(audio.currentTime + index * .1);
      oscillator.stop(audio.currentTime + .28 + index * .1);
    });
  } catch (_) {}
}

function updateStars(increment = 0) {
  stars = Math.min(10, stars + increment);
  localStorage.setItem('susu-shape-stars', stars);
  $('#starCount').textContent = stars;
}

function showScreen(id) {
  $$('.screen').forEach(screen => screen.classList.toggle('active', screen.id === id));
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (id === 'shapesQuiz') renderShapeQuestion();
  if (id === 'phonicsIntro') resetPhonicsCards();
  if (id === 'phonicsQuiz') renderPhonicsQuestion();
}

function resetPhonicsCards() {
  $$('.sound-card').forEach(card => {
    card.dataset.index = '0';
    const word = card.querySelector('.sound-word');
    word.textContent = '点一下，出现第一个单词';
    word.classList.remove('revealed');
    card.querySelector('.sound-step').textContent = '准备好了吗？';
    card.setAttribute('aria-label', `${card.dataset.sound.toUpperCase()} sound. Tap to reveal the first word.`);
  });
}

function revealNextPhonicsWord(card) {
  const sound = card.dataset.sound;
  const words = phonicsExamples[sound];
  const index = Number(card.dataset.index || 0);
  const word = words[index];
  const wordDisplay = card.querySelector('.sound-word');

  wordDisplay.classList.remove('revealed');
  void wordDisplay.offsetWidth;
  wordDisplay.textContent = word;
  wordDisplay.classList.add('revealed');
  card.querySelector('.sound-step').textContent = `${index + 1} / ${words.length}`;
  card.dataset.index = String((index + 1) % words.length);
  card.setAttribute('aria-label', `${word}. Word ${index + 1} of ${words.length}. Tap for the next word.`);
  speak(word, .68);
}

function renderShapeCards() {
  $('#shapeGrid').innerHTML = shapes.map(shape => `
    <button class="shape-card" style="--card-color:${shape.color}" data-word="${shape.name}">
      <span class="shape">${shape.type === 'star' ? '<span class="shape-star">★</span>' : `<span class="shape-css ${shape.name}"></span>`}</span>
      <strong>${shape.name}</strong><small>${shape.zh} · 🔊</small>
    </button>
  `).join('');

  $$('.shape-card').forEach(card => card.addEventListener('click', () => {
    card.classList.add('playing');
    speak(card.dataset.word);
    setTimeout(() => card.classList.remove('playing'), 700);
  }));
}

function shuffledAnswers(correct) {
  const wrong = shapes.map(s => s.name).filter(name => name !== correct).sort(() => Math.random() - .5).slice(0, 2);
  return [correct, ...wrong].sort(() => Math.random() - .5);
}

function renderShapeQuestion() {
  shapeLocked = false;
  const item = shapeQuestions[shapeIndex];
  $('#shapeProgress').style.width = `${(shapeIndex / shapeQuestions.length) * 100}%`;
  $('#objectArt').textContent = item.art;
  $('#shapeQuestion').textContent = `What shape is a ${item.object}?`;
  $('#shapeFeedback').textContent = '';
  $('#shapeFeedback').className = 'feedback';
  $('#nextShape').classList.add('hidden');
  $('#shapeAnswers').innerHTML = shuffledAnswers(item.shape).map(answer => `<button class="answer" data-answer="${answer}">${answer}</button>`).join('');
  $$('#shapeAnswers .answer').forEach(button => button.addEventListener('click', () => checkShape(button, item)));
}

function checkShape(button, item) {
  if (shapeLocked) return;
  if (button.dataset.answer === item.shape) {
    shapeLocked = true;
    button.classList.add('correct');
    $('#shapeFeedback').className = 'feedback good';
    $('#shapeFeedback').innerHTML = `Great! <strong>${item.sentence}</strong> 🔊`;
    $('#nextShape').classList.remove('hidden');
    updateStars(1);
    chime(true);
    speak(item.sentence);
  } else {
    button.classList.add('wrong');
    $('#shapeFeedback').className = 'feedback try';
    $('#shapeFeedback').textContent = 'Almost! Try another shape. 再想一想～';
    chime(false);
    setTimeout(() => button.classList.remove('wrong'), 500);
  }
}

function nextShape() {
  shapeIndex += 1;
  if (shapeIndex >= shapeQuestions.length) {
    $('#shapeProgress').style.width = '100%';
    showScreen('phonicsIntro');
    return;
  }
  renderShapeQuestion();
}

function renderPhonicsQuestion() {
  phonicsLocked = false;
  const item = phonicsWords[phonicsIndex];
  $('#phonicsProgress').style.width = `${(phonicsIndex / phonicsWords.length) * 100}%`;
  $('#phonicsWord strong').textContent = `${item.icon} ${item.word}`;
  $('#phonicsFeedback').textContent = '';
  $('#phonicsFeedback').className = 'feedback';
  $$('.sound-baskets button').forEach(button => button.disabled = false);
}

function checkPhonics(answer) {
  if (phonicsLocked) return;
  const item = phonicsWords[phonicsIndex];
  if (answer === item.sound) {
    phonicsLocked = true;
    $('#phonicsFeedback').className = 'feedback good';
    $('#phonicsFeedback').textContent = `Yes! ${item.word} ends with /${item.sound}/. ⭐`;
    updateStars(phonicsIndex < 5 ? 1 : 0);
    chime(true);
    speak(`${item.word}. ${item.word} ends with ${item.sound}.`);
    setTimeout(() => {
      phonicsIndex += 1;
      if (phonicsIndex >= phonicsWords.length) {
        $('#phonicsProgress').style.width = '100%';
        showScreen('finish');
      } else renderPhonicsQuestion();
    }, 1400);
  } else {
    $('#phonicsFeedback').className = 'feedback try';
    $('#phonicsFeedback').textContent = `Listen again: ${item.word}. 再听一次结尾～`;
    chime(false);
    speak(item.word, .68);
  }
}

$$('[data-go]').forEach(button => button.addEventListener('click', () => showScreen(button.dataset.go)));
$('#speakQuestion').addEventListener('click', () => speak($('#shapeQuestion').textContent));
$('#nextShape').addEventListener('click', nextShape);
$('#shapeFeedback').addEventListener('click', () => {
  if (shapeLocked) speak(shapeQuestions[shapeIndex].sentence);
});
$$('[data-sound]').forEach(button => button.addEventListener('click', () => revealNextPhonicsWord(button)));
$('#phonicsWord').addEventListener('click', () => speak(phonicsWords[phonicsIndex].word, .68));
$$('.sound-baskets button').forEach(button => button.addEventListener('click', () => checkPhonics(button.dataset.answer)));
$('#playAgain').addEventListener('click', () => {
  shapeIndex = 0; phonicsIndex = 0; stars = 0; updateStars(); showScreen('home');
});
$('#resetProgress').addEventListener('click', () => {
  shapeIndex = 0; phonicsIndex = 0; stars = 0; updateStars();
});
fullscreenButton.addEventListener('click', toggleFullscreen);
document.addEventListener('fullscreenchange', () => updateFullscreenButton(Boolean(nativeFullscreenElement())));
document.addEventListener('webkitfullscreenchange', () => updateFullscreenButton(Boolean(nativeFullscreenElement())));

renderShapeCards();
updateStars();
