const $=selector=>document.querySelector(selector);
const $$=selector=>[...document.querySelectorAll(selector)];
const words=[
  {word:'fingers',zh:'手指',art:'🖐️'},
  {word:'toes',zh:'脚趾',art:'🦶'},
  {word:'shoulder',zh:'肩膀',art:'🧍'},
  {word:'knee',zh:'膝盖',art:'🦵'},
  {word:'back',zh:'背部',art:'👕'}
];
const actions=[
  {sentence:'Wiggle your fingers!',zh:'扭动手指',art:'👐'},
  {sentence:'Shake your hands!',zh:'摇一摇双手',art:'🙌'},
  {sentence:'Shrug your shoulders!',zh:'耸耸肩',art:'🤷'},
  {sentence:'Bend your knees!',zh:'弯弯膝盖',art:'🧎'}
];
const questions=[
  {word:'backs',answer:1,art:'🧍',sentence:'I have 1 back.'},
  {word:'shoulders',answer:2,art:'🤷',sentence:'I have 2 shoulders.'},
  {word:'knees',answer:2,art:'🦵',sentence:'I have 2 knees.'},
  {word:'fingers',answer:10,art:'👐',sentence:'I have 10 fingers.'},
  {word:'toes',answer:10,art:'🦶',sentence:'I have 10 toes.'}
];
const phonics=[
  {word:'back',sound:'k',art:'👕'},
  {word:'bend',sound:'d',art:'🧎'},
  {word:'shake',sound:'k',art:'🙌'},
  {word:'shrug',sound:'g',art:'🤷'}
];
let wordIndex=0,actionIndex=0,questionIndex=0,phonicsIndex=0,stars=0;
let questionSolved=false,phonicsSolved=false,actionAwarded=false;
const rewardedQuestions=new Set(),rewardedSounds=new Set();
let preferredVoice=null;
const fullscreenButton=$('#fullscreenButton');
function nativeFullscreenElement(){return document.fullscreenElement||document.webkitFullscreenElement||null}
function updateFullscreenButton(active){
  document.documentElement.classList.toggle('study-fullscreen',active);
  fullscreenButton.setAttribute('aria-pressed',String(active));
  fullscreenButton.setAttribute('aria-label',active?'退出全屏学习':'进入全屏学习');
  fullscreenButton.querySelector('[aria-hidden]').textContent=active?'↙':'⛶';
  fullscreenButton.querySelector('.fullscreen-label').textContent=active?'退出':'全屏';
}
async function toggleFullscreen(){
  if(nativeFullscreenElement()){
    const exit=document.exitFullscreen||document.webkitExitFullscreen;
    if(exit)await exit.call(document);
    updateFullscreenButton(false);return;
  }
  const enter=document.documentElement.requestFullscreen||document.documentElement.webkitRequestFullscreen;
  if(enter){
    try{await enter.call(document.documentElement);updateFullscreenButton(true);return}catch(_){}
  }
  updateFullscreenButton(!document.documentElement.classList.contains('study-fullscreen'));
}
function voiceScore(voice){
  const label=(voice.name+' '+voice.voiceURI).toLowerCase();
  let score=voice.lang.toLowerCase()==='en-us'?40:voice.lang.toLowerCase().startsWith('en')?10:-100;
  [['microsoft aria online',180],['google us english',170],['ava',145],['samantha',140],['jenny',135],['allison',125],['zoe',120],['aria',115],['premium',90],['enhanced',80],['natural',75]].forEach(([name,points])=>{if(label.includes(name))score+=points});
  if(label.includes('espeak'))score-=120;
  return score;
}
function refreshVoice(){
  if(!('speechSynthesis' in window))return;
  preferredVoice=window.speechSynthesis.getVoices().filter(v=>v.lang.toLowerCase().startsWith('en')).sort((a,b)=>voiceScore(b)-voiceScore(a))[0]||null;
}
function speak(text,rate=.74){
  if(!('speechSynthesis' in window))return;
  if(!preferredVoice)refreshVoice();
  window.speechSynthesis.cancel();
  const utterance=new SpeechSynthesisUtterance(text);
  utterance.lang='en-US';if(preferredVoice)utterance.voice=preferredVoice;
  utterance.rate=rate;utterance.pitch=1;
  window.speechSynthesis.speak(utterance);
}
refreshVoice();
if('speechSynthesis' in window)window.speechSynthesis.addEventListener('voiceschanged',refreshVoice);
function chime(){
  try{
    const audio=new (window.AudioContext||window.webkitAudioContext)();
    [523,659,784].forEach((frequency,index)=>{
      const oscillator=audio.createOscillator(),gain=audio.createGain(),time=audio.currentTime+index*.1;
      oscillator.frequency.value=frequency;oscillator.type='sine';
      gain.gain.setValueAtTime(.04,time);gain.gain.exponentialRampToValueAtTime(.001,time+.22);
      oscillator.connect(gain).connect(audio.destination);oscillator.start(time);oscillator.stop(time+.24);
    });
    setTimeout(()=>audio.close(),900);
  }catch(_){}
}
function addStar(){
  stars=Math.min(10,stars+1);
  $('#stars').textContent=stars;
  chime();
}
function show(id){
  if('speechSynthesis' in window)window.speechSynthesis.cancel();
  $$('.screen').forEach(el=>el.classList.toggle('active',el.id===id));
  window.scrollTo({top:0,behavior:'smooth'});
  if(id==='words')renderWord();
  if(id==='actions')renderAction();
  if(id==='counting')renderQuestion();
  if(id==='phonics')renderPhonics();
  if(id==='finish')speak('Amazing, Susie! You did it!');
}
function renderWord(){
  const item=words[wordIndex];
  $('#wordCount').textContent=(wordIndex+1)+' / '+words.length;
  $('#wordArt').textContent=item.art;
  $('#wordText').textContent=item.word;
  $('#wordZh').textContent=item.zh;
  $('#nextWord').textContent=wordIndex===words.length-1?'Move with Poppy →':'Next word →';
}
function renderAction(){
  const item=actions[actionIndex];
  $('#actionCount').textContent=(actionIndex+1)+' / '+actions.length;
  $('#actionArt').textContent=item.art;
  $('#actionText').textContent=item.sentence;
  $('#actionZh').textContent=item.zh;
  $('#didAction').textContent=actionIndex===actions.length-1?'去数一数 →':'我做到了！ →';
}
function renderQuestion(){
  const item=questions[questionIndex];
  questionSolved=rewardedQuestions.has(questionIndex);
  $('#countProgress').style.width=(questionIndex/questions.length*100)+'%';
  $('#quizCount').textContent=(questionIndex+1)+' / '+questions.length;
  $('#quizArt').textContent=item.art;
  $('#question').textContent='How many '+item.word+' do you have?';
  $('#countFeedback').className='feedback';
  $('#countFeedback').textContent=questionSolved?'Great! '+item.sentence:'';
  $('#hearAnswer').classList.toggle('hidden',!questionSolved);
  $('#nextQuestion').classList.toggle('hidden',!questionSolved);
  $('#nextQuestion').textContent=questionIndex===questions.length-1?'Listen to sounds →':'Next →';
  $('#answers').replaceChildren();
  [1,2,10].forEach(number=>{
    const button=document.createElement('button');button.type='button';button.textContent=String(number);
    if(questionSolved&&number===item.answer)button.classList.add('correct');
    button.addEventListener('click',()=>chooseNumber(button,number));
    $('#answers').append(button);
  });
}
function chooseNumber(button,number){
  if(questionSolved)return;
  const item=questions[questionIndex];
  if(number!==item.answer){
    button.classList.add('wrong');
    $('#countFeedback').className='feedback try';
    $('#countFeedback').textContent='再数一数，试一次～';
    setTimeout(()=>button.classList.remove('wrong'),500);
    return;
  }
  questionSolved=true;rewardedQuestions.add(questionIndex);addStar();
  button.classList.add('correct');
  $('#countFeedback').className='feedback good';$('#countFeedback').textContent='Great! '+item.sentence;
  $('#hearAnswer').classList.remove('hidden');$('#nextQuestion').classList.remove('hidden');
  speak(item.sentence);
}
function renderPhonics(){
  const item=phonics[phonicsIndex];
  phonicsSolved=rewardedSounds.has(phonicsIndex);
  $('#phonicsProgress').style.width=(phonicsIndex/phonics.length*100)+'%';
  $('#phonicsCount').textContent=(phonicsIndex+1)+' / '+phonics.length;
  $('#phonicsWord').textContent=item.art+' '+item.word;
  $('#phonicsFeedback').className='feedback';
  $('#phonicsFeedback').textContent=phonicsSolved?'Yes! '+item.word+' ends with /'+item.sound+'/.' :'';
  $('#nextPhonics').classList.toggle('hidden',!phonicsSolved);
  $('#nextPhonics').textContent=phonicsIndex===phonics.length-1?'Finish adventure →':'Next →';
  $('#soundAnswers').replaceChildren();
  ['k','d','g'].forEach(sound=>{
    const button=document.createElement('button');button.type='button';
    button.textContent='/'+sound+'/';button.setAttribute('aria-label','词尾音 /'+sound+'/');
    if(phonicsSolved&&sound===item.sound)button.classList.add('correct');
    button.addEventListener('click',()=>chooseSound(button,sound));
    $('#soundAnswers').append(button);
  });
}
function chooseSound(button,sound){
  if(phonicsSolved)return;
  const item=phonics[phonicsIndex];
  if(sound!==item.sound){
    button.classList.add('wrong');$('#phonicsFeedback').className='feedback try';
    $('#phonicsFeedback').textContent='听听最后一个音，再试一次～';
    speak(item.word,.68);
    setTimeout(()=>button.classList.remove('wrong'),500);
    return;
  }
  phonicsSolved=true;rewardedSounds.add(phonicsIndex);addStar();
  button.classList.add('correct');
  $('#phonicsFeedback').className='feedback good';
  $('#phonicsFeedback').textContent='Yes! '+item.word+' ends with /'+sound+'/.' ;
  $('#nextPhonics').classList.remove('hidden');
  speak(item.word,.68);
}
function reset(){
  wordIndex=0;actionIndex=0;questionIndex=0;phonicsIndex=0;stars=0;actionAwarded=false;
  rewardedQuestions.clear();rewardedSounds.clear();$('#stars').textContent='0';show('home');
}
$$('[data-go]').forEach(button=>button.addEventListener('click',()=>show(button.dataset.go)));
$('#hearWord').addEventListener('click',()=>speak(words[wordIndex].word));
$('#nextWord').addEventListener('click',()=>{
  if(wordIndex<words.length-1){wordIndex++;renderWord();speak(words[wordIndex].word)}
  else{show('actions');speak(actions[actionIndex].sentence)}
});
$('#hearAction').addEventListener('click',()=>speak(actions[actionIndex].sentence));
$('#didAction').addEventListener('click',()=>{
  if(actionIndex<actions.length-1){actionIndex++;renderAction();speak(actions[actionIndex].sentence)}
  else{if(!actionAwarded){addStar();actionAwarded=true}show('counting');speak('How many backs do you have?')}
});
$('#hearQuestion').addEventListener('click',()=>speak($('#question').textContent));
$('#hearAnswer').addEventListener('click',()=>speak(questions[questionIndex].sentence));
$('#nextQuestion').addEventListener('click',()=>{
  if(questionIndex<questions.length-1){questionIndex++;renderQuestion();speak($('#question').textContent)}
  else{show('phonics');speak(phonics[0].word,.68)}
});
$('#hearPhonics').addEventListener('click',()=>speak(phonics[phonicsIndex].word,.68));
$('#nextPhonics').addEventListener('click',()=>{
  if(phonicsIndex<phonics.length-1){phonicsIndex++;renderPhonics();speak(phonics[phonicsIndex].word,.68)}
  else show('finish');
});
$('#replay').addEventListener('click',reset);
fullscreenButton.addEventListener('click',toggleFullscreen);
document.addEventListener('fullscreenchange',()=>updateFullscreenButton(Boolean(nativeFullscreenElement())));
document.addEventListener('webkitfullscreenchange',()=>updateFullscreenButton(Boolean(nativeFullscreenElement())));
renderWord();
