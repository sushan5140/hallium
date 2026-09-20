/* Hallium Hangul Lab · writing practice. Purely local, no account or AI grading. */
(function () {
  'use strict';
  const lab = window.HangulLab;
  if (!lab) throw new Error('Hangul Lab must load before the handwriting studio.');
  const $ = id => document.getElementById(id);
  const KEY = 'hallium-hangul-writing-sheets-v1';
  const examples = [
    {text:'가',rom:'ga',meaning:'Go (syllable)',say:'가'},
    {text:'나',rom:'na',meaning:'I / me',say:'나'},
    {text:'다',rom:'da',meaning:'All (syllable)',say:'다'},
    {text:'라',rom:'ra',meaning:'Practice the tapped ㄹ',say:'라'},
    {text:'마',rom:'ma',meaning:'M + a',say:'마'},
    {text:'바',rom:'ba',meaning:'B + a',say:'바'},
    {text:'사',rom:'sa',meaning:'S + a',say:'사'},
    {text:'아',rom:'a',meaning:'Silent ㅇ + a',say:'아'},
    {text:'자',rom:'ja',meaning:'J + a',say:'자'},
    {text:'차',rom:'cha',meaning:'Aspirated ㅊ + a',say:'차'},
    {text:'카',rom:'ka',meaning:'Aspirated ㅋ + a',say:'카'},
    {text:'타',rom:'ta',meaning:'Aspirated ㅌ + a',say:'타'},
    {text:'파',rom:'pa',meaning:'Aspirated ㅍ + a',say:'파'},
    {text:'하',rom:'ha',meaning:'H + a',say:'하'},
    {text:'까',rom:'kka',meaning:'Tense ㄲ + a',say:'까'},
    {text:'따',rom:'tta',meaning:'Tense ㄸ + a',say:'따'},
    {text:'빠',rom:'ppa',meaning:'Tense ㅃ + a',say:'빠'},
    {text:'싸',rom:'ssa',meaning:'Tense ㅆ + a',say:'싸'},
    {text:'짜',rom:'jja',meaning:'Tense ㅉ + a',say:'짜'},
    {text:'한',rom:'han',meaning:'ㅏ + final ㄴ',say:'한'},
    {text:'글',rom:'geul',meaning:'ㅡ + final ㄹ',say:'글'},
    {text:'물',rom:'mul',meaning:'Water',say:'물'},
    {text:'집',rom:'jip',meaning:'House',say:'집'},
    {text:'꽃',rom:'kkot',meaning:'Flower',say:'꽃'}
  ];
  const words = [
    {text:'안녕',rom:'annyeong',meaning:'Hello / bye (casual)'},
    {text:'안녕하세요',rom:'annyeonghaseyo',meaning:'Hello (polite)'},
    {text:'한글',rom:'hangeul',meaning:'Korean alphabet'},
    {text:'한국',rom:'hanguk',meaning:'Korea'},
    {text:'사랑',rom:'sarang',meaning:'Love'},
    {text:'고마워요',rom:'gomawoyo',meaning:'Thank you (polite)'},
    {text:'학교',rom:'hakgyo',meaning:'School'},
    {text:'친구',rom:'chingu',meaning:'Friend'},
    {text:'어떻게 지내요?',rom:'eotteoke jinaeyo?',meaning:'How are you?'},
    {text:'잘 지내요',rom:'jal jinaeyo',meaning:"I'm doing well"}
  ];
  const letters = lab.all.map(v=>({text:v.hangul,rom:v.rom,meaning:v.guide,say:v.sample,group:lab.studyGroupKeys.find(k=>lab.studyGroups[k].letters.includes(v.hangul))}));
  let kind='letters', family='all', target=null, guideOn=true, mode='trace', strokes=[], live=null, pointer=null, width=500, height=375, saved={};
  const canvas=$('writing-canvas'), wrap=$('writing-canvas-wrap'), ctx=canvas.getContext('2d');
  function readSheets(){try{const data=JSON.parse(localStorage.getItem(KEY));return data&&typeof data==='object'&&!Array.isArray(data)?data:{}}catch{return {}}}
  saved=readSheets();
  function choices(){return kind==='letters'?letters.filter(v=>family==='all'||v.group===family):kind==='syllables'?examples:words}
  function key(){return kind+':'+target.text}
  function points(){return strokes.reduce((total,stroke)=>total+stroke.length,0)}
  function sizeGuide(){const n=Array.from(target.text).length;const w=wrap.clientWidth||500;const max=w*.81/Math.max(1,n*.81);return Math.max(24,Math.min(n<=1?145:117,max))}
  function drawBackground(context,w,h,reference){context.fillStyle='#fffefb';context.fillRect(0,0,w,h);context.strokeStyle='#e5e9e6';context.lineWidth=1;for(let i=1;i<4;i++){context.beginPath();context.moveTo(i*w/4,0);context.lineTo(i*w/4,h);context.stroke();context.beginPath();context.moveTo(0,i*h/4);context.lineTo(w,i*h/4);context.stroke()}context.save();context.setLineDash([7,9]);context.strokeStyle='#ddded9';context.beginPath();context.moveTo(w/2,0);context.lineTo(w/2,h);context.moveTo(0,h/2);context.lineTo(w,h/2);context.stroke();context.restore();if(reference){context.fillStyle='#dedcf8';context.textAlign='center';context.textBaseline='middle';context.font='800 '+Math.round(sizeGuide()/Math.max(1,wrap.clientWidth||w)*w)+'px "Noto Sans KR",sans-serif';context.fillText(target.text,w/2,h/2,w*.85)}}
  function paintLine(context,stroke,w,h){if(!stroke.length)return;context.strokeStyle='#5147e8';context.fillStyle='#5147e8';context.lineWidth=Math.max(3.5,w*.011);context.lineCap='round';context.lineJoin='round';if(stroke.length===1){context.beginPath();context.arc(stroke[0][0]*w,stroke[0][1]*h,context.lineWidth/2,0,Math.PI*2);context.fill();return}context.beginPath();context.moveTo(stroke[0][0]*w,stroke[0][1]*h);for(let i=1;i<stroke.length-1;i++){const p=stroke[i],n=stroke[i+1];context.quadraticCurveTo(p[0]*w,p[1]*h,(p[0]+n[0])*w/2,(p[1]+n[1])*h/2)}const last=stroke[stroke.length-1];context.lineTo(last[0]*w,last[1]*h);context.stroke()}
  function redraw(){ctx.clearRect(0,0,width,height);for(const stroke of strokes)paintLine(ctx,stroke,width,height);if(live)paintLine(ctx,live,width,height);updateButtons()}
  function resize(){const b=canvas.getBoundingClientRect();if(b.width<10||b.height<10)return;width=b.width;height=b.height;const scale=Math.min(window.devicePixelRatio||1,3);canvas.width=Math.round(width*scale);canvas.height=Math.round(height*scale);ctx.setTransform(scale,0,0,scale,0,0);if(target)$('writing-guide').style.fontSize=sizeGuide()+'px';redraw()}
  function updateButtons(){const has=points()>0;$('writing-undo').disabled=!has;$('writing-clear').disabled=!has;$('writing-save').disabled=!has;$('writing-export').disabled=!has}
  function getPoint(e){const r=canvas.getBoundingClientRect();return [Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)),Math.max(0,Math.min(1,(e.clientY-r.top)/r.height))]}
  function down(e){if(e.button!==0&&e.pointerType==='mouse')return;if(pointer!==null)return;e.preventDefault();pointer=e.pointerId;live=[getPoint(e)];canvas.setPointerCapture?.(pointer);redraw()}
  function move(e){if(pointer!==e.pointerId||!live)return;e.preventDefault();const p=getPoint(e),prev=live[live.length-1];if(Math.hypot(p[0]-prev[0],p[1]-prev[1])>.0014){live.push(p);redraw()}}
  function end(e){if(pointer!==e.pointerId||!live)return;e.preventDefault();const p=getPoint(e),prev=live[live.length-1];if(Math.hypot(p[0]-prev[0],p[1]-prev[1])>.0014)live.push(p);strokes.push(live);live=null;pointer=null;try{canvas.releasePointerCapture(e.pointerId)}catch{}redraw();$('writing-feedback').textContent='Nice work. Compare your writing with the reference; save when you feel ready.'}
  function setMode(next){mode=next;guideOn=mode==='trace';$('writing-trace').classList.toggle('is-active',mode==='trace');$('writing-free').classList.toggle('is-active',mode==='free');$('writing-trace').setAttribute('aria-pressed',String(mode==='trace'));$('writing-free').setAttribute('aria-pressed',String(mode==='free'));syncGuide()}
  function syncGuide(){wrap.classList.toggle('show-writing-guide',guideOn);$('writing-guide-toggle').textContent=guideOn?'◉ Guide on':'◎ Guide off';$('writing-guide-toggle').setAttribute('aria-pressed',String(guideOn))}
  function renderTargets(preferred){const items=choices();const select=$('writing-target');select.replaceChildren();items.forEach((v,i)=>{const o=document.createElement('option');o.value=String(i);o.textContent=v.text+'  ·  '+v.rom;select.append(o)});let index=items.findIndex(v=>v.text===preferred);if(index<0)index=0;select.value=String(index);choose(index)}
  function choose(index){const items=choices();target=items[index]||items[0];if(!target)return;$('writing-target').value=String(Math.max(0,items.findIndex(v=>v.text===target.text)));$('writing-guide').textContent=target.text;$('writing-reference-char').textContent=target.text;$('writing-reference-char').textContent=target.text;$('writing-reference-rom').textContent=target.rom;$('writing-reference-meaning').textContent=target.meaning||'';$('writing-guide').style.fontSize=sizeGuide()+'px';$('writing-reference-char').style.fontSize=(Array.from(target.text).length>6?'clamp(22px,2.4vw,36px)':Array.from(target.text).length>2?'clamp(30px,3.6vw,56px)':'clamp(56px,6vw,95px)');const old=saved[key()];strokes=old&&Array.isArray(old.strokes)?old.strokes.map(p=>p.map(q=>[Number(q[0]),Number(q[1])])):[];live=null;pointer=null;$('writing-sheet-count').textContent=old?'LAST ATTEMPT RESTORED':'NOT YET SAVED';$('writing-done').textContent=old?'Your last attempt is restored. Keep practising or try again.':'Your attempts are only saved on this device.';$('writing-feedback').textContent='Use the guide to trace, or switch to “From memory.” Saved attempts do not receive an automatic accuracy score.';resize();redraw()}
  function setKind(next,preferred){kind=next;$('writing-kind').value=kind;$('writing-family-wrap').hidden=kind!=='letters';renderTargets(preferred)}
  function step(n){const items=choices(),i=items.findIndex(v=>v.text===target.text);choose((i+n+items.length)%items.length)}
  function compact(stroke){const every=Math.max(1,Math.ceil(stroke.length/210));return stroke.filter((p,i)=>i%every===0||i===stroke.length-1).map(p=>[Math.round(p[0]*10000)/10000,Math.round(p[1]*10000)/10000])}
  function save(){if(!points())return;const record={strokes:strokes.slice(-38).map(compact),mode,savedAt:new Date().toISOString()};saved[key()]=record;const ordered=Object.entries(saved).sort((a,b)=>String(b[1].savedAt||'').localeCompare(String(a[1].savedAt||'')));saved=Object.fromEntries(ordered.slice(0,55));try{localStorage.setItem(KEY,JSON.stringify(saved))}catch{$('writing-feedback').textContent='Storage is full or blocked. Download your sheet as an image to keep a copy.';return}lab.recordWriting(target.text,kind);$('writing-sheet-count').textContent='ATTEMPT SAVED ✓';$('writing-done').textContent='Saved locally. Try without the guide to see how much you remember!';$('writing-feedback').textContent='Saved! You can switch letters and return to this attempt on the same device.';lab.showToast(target.text+' — writing attempt saved ✦')}
  function exportPng(){if(!points())return;const out=document.createElement('canvas');out.width=1400;out.height=1000;const g=out.getContext('2d');const originalW=width,originalH=height;drawBackground(g,1400,1000,guideOn);for(const line of strokes)paintLine(g,line,1400,1000);g.fillStyle='#17191f';g.fillRect(0,943,1400,57);g.fillStyle='#fff';g.font='700 21px sans-serif';g.textAlign='left';g.fillText('HALLIUM  /  HANGUL WRITING STUDIO',35,976);g.textAlign='right';g.fillText(target.text+'  ·  '+target.rom,1365,976);const anchor=document.createElement('a');anchor.download='hallium-writing-'+kind+'-'+Array.from(target.text).filter(c=>/[가-힣ㄱ-ㅎㅏ-ㅣ]/.test(c)).join('').slice(0,14)+'.png';anchor.href=out.toDataURL('image/png');anchor.click()}
  function selectLetter(h){if(!lab.byLetter[h])return;family='all';$('writing-family').value='all';setKind('letters',h);lab.switchView('write')}
  function selectWord(h){setKind('words',h);lab.switchView('write')}
  function selectFamily(g){if(!lab.studyGroups[g])return;family=g;$('writing-family').value=g;setKind('letters',lab.studyGroups[g].letters[0]);lab.switchView('write')}
  function clearSavedSheets(){saved={};try{localStorage.removeItem(KEY)}catch{}strokes=[];if(target)choose(Number($('writing-target').value)||0)}
  function setup(){
    $('writing-kind').addEventListener('change',e=>setKind(e.target.value));
    $('writing-family').addEventListener('change',e=>{family=e.target.value;renderTargets()});
    $('writing-target').addEventListener('change',e=>choose(Number(e.target.value)));
    $('writing-prev').addEventListener('click',()=>step(-1));
    $('writing-next').addEventListener('click',()=>step(1));
    $('writing-random').addEventListener('click',()=>{const items=choices();if(items.length<2)return;let n=Number($('writing-target').value);let i=(n+1+Math.floor(Math.random()*(items.length-1)))%items.length;choose(i)});
    $('writing-trace').addEventListener('click',()=>setMode('trace'));
    $('writing-free').addEventListener('click',()=>setMode('free'));
    $('writing-guide-toggle').addEventListener('click',()=>{guideOn=!guideOn;syncGuide()});
    $('writing-undo').addEventListener('click',()=>{strokes.pop();redraw();$('writing-sheet-count').textContent='UNSAVED CHANGES'});
    $('writing-clear').addEventListener('click',()=>{strokes=[];redraw();$('writing-sheet-count').textContent='READY TO DRAW';$('writing-feedback').textContent='Clean sheet. Try making the shape again.'});
    $('writing-save').addEventListener('click',save);
    $('writing-export').addEventListener('click',exportPng);
    $('writing-listen').addEventListener('click',()=>lab.listen(target.say||target.text));
    document.querySelectorAll('[data-writing-example]').forEach(b=>b.addEventListener('click',()=>selectWord(b.dataset.writingExample)));
    canvas.addEventListener('pointerdown',down);
    canvas.addEventListener('pointermove',move);
    canvas.addEventListener('pointerup',end);
    canvas.addEventListener('pointercancel',end);
    window.addEventListener('resize',resize);
    if('ResizeObserver'in window)new ResizeObserver(resize).observe(wrap);
    window.addEventListener('hashchange',()=>{if(location.hash==='#write')resize()});
    setKind('letters');setMode('trace');updateButtons();resize();
  }
  window.HalliumWriting={selectLetter,selectWord,selectFamily,clearSavedSheets,resize};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();
})();
