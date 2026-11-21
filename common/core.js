/* モコの おべんきょうハウス ― きょうつう（ほぞん・アイテム・キャラ・おと・ポップアップ）
   ポイントや もちものは ぜんぶの へやで きょうつう。localStorage の 'moko-math-v1' に ほぞんします。 */
const r=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const $=s=>document.querySelector(s);
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=r(0,i);[a[i],a[j]]=[a[j],a[i]]}return a};

/* ---------- もんだいの しゅるい（せっていで つかう） ---------- */
const TYPES=[
 {id:'add1', name:'1けた ＋ 1けた', ex:'3 ＋ 5', pts:1, gen:()=>[r(1,9),'+',r(1,9)]},
 {id:'add21',name:'2けた ＋ 1けた', ex:'23 ＋ 6', pts:2, gen:()=>{const a=r(10,99),b=r(1,9);return Math.random()<.5?[a,'+',b]:[b,'+',a]}},
 {id:'add22',name:'2けた ＋ 2けた', ex:'34 ＋ 28',pts:3, gen:()=>[r(10,99),'+',r(10,99)]},
 {id:'sub1', name:'1けた − 1けた', ex:'8 − 3',  pts:1, gen:()=>{const a=r(2,9);return [a,'-',r(1,a)]}},
 {id:'sub21',name:'2けた − 1けた', ex:'25 − 7', pts:2, gen:()=>[r(10,99),'-',r(1,9)]},
 {id:'sub22',name:'2けた − 2けた', ex:'52 − 18',pts:3, gen:()=>{const a=r(11,99);return [a,'-',r(10,a)]}},
];
const TYPE=Object.fromEntries(TYPES.map(t=>[t.id,t]));
const KTYPES=[
 {id:'k1yomi',name:'かん字よみ 1ねん',ex:'山 → やま',pts:1},
 {id:'k1kaki',name:'かん字かき 1ねん',ex:'やま → 山',pts:2},
 {id:'k2yomi',name:'かん字よみ 2ねん',ex:'会う → あう',pts:2},
 {id:'k2kaki',name:'かん字かき 2ねん',ex:'あう → 会う',pts:3},
 {id:'kotoba',name:'ことば・ぶん',ex:'はんたいことば・は を へ',pts:2},
 {id:'yomi',name:'よみとり',ex:'おはなしを よんで こたえる',pts:3},
];
const KTYPE=Object.fromEntries(KTYPES.map(t=>[t.id,t]));

/* ---------- アイテム ---------- */
const ITEMS=[
 {id:'o_none',cat:'outfit',name:'なし',price:0},
 {id:'o_pink',cat:'outfit',name:'ピンクのワンピース',price:20},
 {id:'o_over',cat:'outfit',name:'あおいオーバーオール',price:25},
 {id:'o_rain',cat:'outfit',name:'きいろのレインコート',price:30},
 {id:'o_princess',cat:'outfit',name:'おひめさまドレス',price:80},
 {id:'h_none',cat:'hat',name:'なし',price:0},
 {id:'h_ribbon',cat:'hat',name:'リボン',price:10},
 {id:'h_beret',cat:'hat',name:'ベレーぼう',price:20},
 {id:'h_flower',cat:'hat',name:'はなかんむり',price:25},
 {id:'h_crown',cat:'hat',name:'おうかん',price:60},
 {id:'a_none',cat:'acc',name:'なし',price:0},
 {id:'a_balloon',cat:'acc',name:'ふうせん',price:15},
 {id:'a_bag',cat:'acc',name:'ポシェット',price:20},
 {id:'a_wand',cat:'acc',name:'ほしのステッキ',price:40},
 {id:'w_cream',cat:'wall',name:'クリームのかべ',price:0},
 {id:'w_dots',cat:'wall',name:'みずたまのかべ',price:30},
 {id:'w_stripe',cat:'wall',name:'そらいろストライプ',price:30},
 {id:'w_night',cat:'wall',name:'ほしぞらのかべ',price:50},
 {id:'f_wood',cat:'floor',name:'きのゆか',price:0},
 {id:'f_mint',cat:'floor',name:'ミントのじゅうたん',price:25},
 {id:'f_tile',cat:'floor',name:'ピンクのタイル',price:25},
 {id:'u_rug',cat:'furn',name:'ふわふわラグ',price:20,box:'80 222 205 58'},
 {id:'u_plant',cat:'furn',name:'うえきばち',price:15,box:'300 172 62 104'},
 {id:'u_poster',cat:'furn',name:'ほしのポスター',price:15,box:'140 20 78 88'},
 {id:'u_lamp',cat:'furn',name:'ランプ',price:20,box:'250 128 84 142'},
 {id:'u_bear',cat:'furn',name:'くまのぬいぐるみ',price:30,box:'34 234 52 64'},
 {id:'u_shelf',cat:'furn',name:'ほんだな',price:35,box:'228 2 112 108'},
 {id:'u_bed',cat:'furn',name:'ベッド',price:40,box:'0 164 130 100'},
 /* ✨ スペシャル（こうがく） */
 {id:'c_moko',cat:'char',name:'うさぎの モコ',price:0},
 {id:'c_hamster',cat:'char',name:'ハムスターの ポテ',price:400,special:true},
 {id:'c_penguin',cat:'char',name:'ペンギンの ペペ',price:500,special:true},
 {id:'c_cat',cat:'char',name:'スコティッシュフォールドの ミルク',price:800,special:true},
 {id:'o_kimono',cat:'outfit',name:'ふりそで',price:180,special:true},
 {id:'o_magical',cat:'outfit',name:'まほうしょうじょの ドレス',price:250,special:true},
 {id:'h_bigbow',cat:'hat',name:'おおきな リボン',price:120,special:true},
 {id:'h_unicorn',cat:'hat',name:'ユニコーンの つの',price:200,special:true},
 {id:'a_wings',cat:'acc',name:'てんしの はね',price:220,special:true},
 {id:'a_fairy',cat:'acc',name:'ようせいの はね',price:280,special:true},
 {id:'w_candy',cat:'wall',name:'おかしの かべ',price:150,special:true},
 {id:'w_space',cat:'wall',name:'うちゅうの かべ',price:200,special:true},
 {id:'f_flower',cat:'floor',name:'おはなばたけの ゆか',price:160,special:true},
 {id:'u_chandelier',cat:'furn',name:'シャンデリア',price:250,special:true,box:'138 0 84 78'},
 {id:'u_canopy',cat:'furn',name:'てんがいつき ベッド',price:350,special:true,box:'0 108 134 156'},
 /* テスト ごうかくで もらえる アイテム */
 {id:'a_icecream',cat:'acc',name:'アイスクリーム',test:'add1-1'},
 {id:'h_tiara',cat:'hat',name:'ティアラ',test:'add1-2'},
 {id:'u_trophy',cat:'furn',name:'きんのトロフィー',test:'add1-3',box:'230 252 50 50'},
 {id:'a_bouquet',cat:'acc',name:'はなたば',test:'add21-1'},
 {id:'o_sailor',cat:'outfit',name:'セーラーふく',test:'add21-2'},
 {id:'w_rainbow',cat:'wall',name:'にじのかべ',test:'add21-3'},
 {id:'u_fish',cat:'furn',name:'きんぎょばち',test:'add22-1',box:'278 256 46 46'},
 {id:'h_witch',cat:'hat',name:'まじょのぼうし',test:'add22-2'},
 {id:'o_stardress',cat:'outfit',name:'ほしぞらドレス',test:'add22-3'},
 {id:'a_umbrella',cat:'acc',name:'かさ',test:'sub1-1'},
 {id:'h_chef',cat:'hat',name:'コックぼうし',test:'sub1-2'},
 {id:'f_cloud',cat:'floor',name:'くものゆか',test:'sub1-3'},
 {id:'u_piano',cat:'furn',name:'おもちゃのピアノ',test:'sub21-1',box:'82 262 64 40'},
 {id:'o_apron',cat:'outfit',name:'エプロン',test:'sub21-2'},
 {id:'u_garland',cat:'furn',name:'ガーランド',test:'sub21-3',box:'122 0 116 40'},
 {id:'a_heart',cat:'acc',name:'ハートのステッキ',test:'sub22-1'},
 {id:'h_halo',cat:'hat',name:'てんしのわっか',test:'sub22-2'},
 {id:'o_rainbow',cat:'outfit',name:'にじいろドレス',test:'sub22-3'},
];
const ITEM=Object.fromEntries(ITEMS.map(i=>[i.id,i]));
const CATS=[['special','✨スペシャル'],['char','🐾キャラ'],['outfit','ふく'],['hat','ぼうし'],['acc','こもの'],['wall','かべ'],['floor','ゆか'],['furn','かぐ']];

/* ---------- じょうたいと ほぞん ---------- */
function defState(){return{v:1,t:0,points:0,
 owned:['c_moko','o_none','h_none','a_none','w_cream','f_wood'],
 equip:{char:'c_moko',outfit:'o_none',hat:'h_none',acc:'a_none',wall:'w_cream',floor:'f_wood'},
 furn:[],
 settings:{types:Object.fromEntries(TYPES.map(t=>[t.id,{on:t.id.startsWith('add'),pts:t.pts}])),
  ktypes:Object.fromEntries(KTYPES.map(t=>[t.id,{on:true,pts:t.pts}])),
  perRound:5,perfect:3,daily:5,sound:true,testScale:1,practiceMul:2,practiceBonus:5,progPts:3},
 lastDay:'',stats:{q:0,ok:0},kstats:{q:0,ok:0},tests:{}}}
function merge(d){
 const s=defState(); if(!d||typeof d!=='object') return s;
 if(typeof d.points==='number') s.points=d.points;
 s.t=d.t||0; s.lastDay=d.lastDay||'';
 if(Array.isArray(d.owned)) s.owned=[...new Set([...s.owned,...d.owned.filter(i=>ITEM[i])])];
 if(d.equip) for(const k in s.equip) if(d.equip[k]&&ITEM[d.equip[k]]) s.equip[k]=d.equip[k];
 if(Array.isArray(d.furn)) s.furn=d.furn.filter(i=>ITEM[i]);
 const ds=d.settings||{};
 for(const k of ['perRound','perfect','daily','practiceMul','practiceBonus','testScale','progPts']) if(typeof ds[k]==='number') s.settings[k]=ds[k];
 if(typeof ds.sound==='boolean') s.settings.sound=ds.sound;
 for(const g of ['types','ktypes']) if(ds[g]) for(const id in s.settings[g]) if(ds[g][id]) Object.assign(s.settings[g][id],ds[g][id]);
 if(d.stats) Object.assign(s.stats,d.stats);
 if(d.kstats) Object.assign(s.kstats,d.kstats);
 if(d.tests&&typeof d.tests==='object') s.tests=d.tests;
 return s}
const LS='moko-math-v1';
const loadState=()=>merge((()=>{try{return JSON.parse(localStorage.getItem(LS)||'null')}catch(e){return null}})());
let S=loadState();
function save(){S.t=Date.now();try{localStorage.setItem(LS,JSON.stringify(S))}catch(e){}updPts()}
function updPts(){const p=$('#pts');if(p)p.textContent=S.points}
// ほかの へやで ふえた ポイントを とりこむ（もどるボタン・べつタブ）
function resync(){S=loadState();if(typeof render==='function')render();else updPts()}
window.addEventListener('pageshow',e=>{if(e.persisted)resync()});
window.addEventListener('storage',e=>{if(e.key===LS)resync()});
const today=()=>{const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()};

/* ---------- おと ---------- */
let AC;
function beep(f,d=.12,v=.12){if(!S.settings.sound)return;try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();const o=AC.createOscillator(),g=AC.createGain();o.type='triangle';o.frequency.value=f;g.gain.setValueAtTime(v,AC.currentTime);g.gain.exponentialRampToValueAtTime(.001,AC.currentTime+d);o.connect(g);g.connect(AC.destination);o.start();o.stop(AC.currentTime+d)}catch(e){}}
const sTap=()=>beep(520,.06,.06);
const sOk=()=>{beep(660);setTimeout(()=>beep(880),110);setTimeout(()=>beep(1320,.25),220)};
const sNg=()=>{beep(330,.15);setTimeout(()=>beep(260,.2),150)};
const sBuy=()=>[523,659,784,1046].forEach((f,i)=>setTimeout(()=>beep(f,.15),i*90));

/* ---------- キャラクター（モコ） ---------- */
const star=(cx,cy,R,rr)=>{let p=[];for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,q=i%2?rr:R;p.push((cx+q*Math.cos(a)).toFixed(1)+','+(cy+q*Math.sin(a)).toFixed(1))}return p.join(' ')};
const BODY='#fff6ef',LINE='#e7b5a3',INK='#4b3a3a';
const OUTFIT={
 o_none:'',
 o_pink:`<path d="M72 160 Q100 152 128 160 L148 214 Q100 228 52 214 Z" fill="#ffb7cb" stroke="#f08aa8" stroke-width="3"/>
  <g fill="#fff">${[[80,190],[100,200],[120,190],[90,212],[112,212],[70,208],[130,208]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="3.5"/>`).join('')}</g>
  <path d="M84 160 Q92 172 100 162 Q108 172 116 160" fill="#fff" stroke="#f08aa8" stroke-width="2"/>`,
 o_over:`<path d="M60 190 Q100 200 140 190 L138 218 L106 218 L100 206 L94 218 L62 218 Z" fill="#86bdf2" stroke="#5a96d8" stroke-width="3"/>
  <rect x="80" y="160" width="40" height="36" rx="7" fill="#86bdf2" stroke="#5a96d8" stroke-width="3"/>
  <rect x="91" y="172" width="18" height="12" rx="3" fill="#a9d2fb" stroke="#5a96d8" stroke-width="2"/>
  <circle cx="86" cy="167" r="3.5" fill="#ffd34f"/><circle cx="114" cy="167" r="3.5" fill="#ffd34f"/>`,
 o_rain:`<path d="M68 160 Q100 150 132 160 L144 216 Q100 226 56 216 Z" fill="#ffe066" stroke="#e6b800" stroke-width="3"/>
  <line x1="100" y1="160" x2="100" y2="220" stroke="#e6b800" stroke-width="2"/>
  <g fill="#fff" stroke="#e6b800" stroke-width="1.5"><circle cx="106" cy="178" r="3.5"/><circle cx="106" cy="196" r="3.5"/></g>
  <path d="M72 196 h14 v10 h-14z" fill="#ffd23a" stroke="#e6b800" stroke-width="2"/>`,
 o_princess:`<path d="M80 158 Q100 150 120 158 L117 192 L83 192 Z" fill="#d6bdff" stroke="#ad8ef0" stroke-width="3"/>
  <path d="M83 188 Q100 196 117 188 L158 222 Q100 238 42 222 Z" fill="#e6d6ff" stroke="#ad8ef0" stroke-width="3"/>
  <path d="M46 220 q9 8 18 0 q9 8 18 0 q9 8 18 0 q9 8 18 0 q9 8 18 0 q9 8 18 0" fill="none" stroke="#fff" stroke-width="3"/>
  <circle cx="100" cy="168" r="5" fill="#ff9ec0"/>
  <g fill="#fff6a8"><polygon points="${star(70,208,6,2.5)}"/><polygon points="${star(128,204,6,2.5)}"/><polygon points="${star(100,214,5,2)}"/></g>`
};
function flowerCrown(){let s='';const cols=['#ff8fb1','#ffd34f','#9ad6ff','#ffb1e6','#b6ec9c'];
 for(let i=0;i<9;i++){const a=(-152+i*15.5)*Math.PI/180,x=100+60*Math.cos(a),y=108+60*Math.sin(a);
  s+=`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="8" fill="${cols[i%5]}" stroke="#fff" stroke-width="2"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.6" fill="#fff"/>`}
 return s}
const HAT={
 h_none:'',
 h_ribbon:`<g transform="translate(128 60) rotate(15)"><path d="M0 0 L-20 -12 L-20 12 Z M0 0 L20 -12 L20 12 Z" fill="#ff7ea6" stroke="#e05a86" stroke-width="2.5" stroke-linejoin="round"/><circle r="6" fill="#ff9ec0" stroke="#e05a86" stroke-width="2.5"/></g>`,
 h_beret:`<path d="M54 70 Q58 38 100 36 Q146 38 148 64 Q120 74 54 70 Z" fill="#ff6f6f" stroke="#d94c4c" stroke-width="3"/><circle cx="104" cy="34" r="5" fill="#d94c4c"/>`,
 h_flower:flowerCrown(),
 h_crown:`<polygon points="76,60 76,32 88,46 100,24 112,46 124,32 124,60" fill="#ffd34f" stroke="#e5a91c" stroke-width="3" stroke-linejoin="round"/><circle cx="100" cy="50" r="5" fill="#ff7ea6"/><circle cx="85" cy="53" r="3.5" fill="#8fc8ff"/><circle cx="115" cy="53" r="3.5" fill="#8fc8ff"/>`
};
const ACC={
 a_none:'',
 a_balloon:`<path d="M146 184 Q160 140 166 86" stroke="#b9a5a5" stroke-width="2" fill="none"/><ellipse cx="168" cy="62" rx="20" ry="24" fill="#ff9ab4" stroke="#f0668b" stroke-width="3"/><path d="M163 86 l5 6 l5 -6z" fill="#f0668b"/><ellipse cx="160" cy="52" rx="5" ry="8" fill="#fff" opacity=".7"/>`,
 a_bag:`<path d="M84 166 Q112 178 130 198" stroke="#c97b5a" stroke-width="3" fill="none"/><rect x="118" y="194" width="28" height="22" rx="7" fill="#ff9e7a" stroke="#d9704c" stroke-width="3"/><circle cx="132" cy="204" r="3" fill="#fff"/>`,
 a_wand:`<line x1="56" y1="186" x2="30" y2="142" stroke="#c9a0ff" stroke-width="5" stroke-linecap="round"/><polygon points="${star(28,134,17,7.5)}" fill="#ffd34f" stroke="#e5a91c" stroke-width="2.5" stroke-linejoin="round"/>`
};
/* テスト ごほうび アイテムの え */
function rainbowDress(){const c=['#ff9a9a','#ffc27a','#ffe27a','#a8e39a','#8fc8ff','#c3a8ff'];let s='';const y0=160,y1=218,h=(y1-y0)/6,xa=y=>72-20*(y-y0)/(y1-y0);
 for(let i=0;i<6;i++){const ya=y0+i*h,yb=ya+h;s+=`<polygon points="${xa(ya).toFixed(1)},${ya.toFixed(1)} ${(200-xa(ya)).toFixed(1)},${ya.toFixed(1)} ${(200-xa(yb)).toFixed(1)},${yb.toFixed(1)} ${xa(yb).toFixed(1)},${yb.toFixed(1)}" fill="${c[i]}"/>`}
 return s+`<path d="M72 160 L128 160 L148 218 L52 218 Z" fill="none" stroke="#e59ab0" stroke-width="3" stroke-linejoin="round"/><g fill="#fff">${[[80,176],[118,186],[96,206],[132,210]].map(([x,y])=>`<polygon points="${star(x,y,4.5,2)}"/>`).join('')}</g>`}
Object.assign(OUTFIT,{
 o_sailor:`<path d="M66 196 Q100 204 134 196 L146 218 Q100 228 54 218 Z" fill="#4a6fb5" stroke="#365a9c" stroke-width="3"/>
  <path d="M72 160 Q100 152 128 160 L134 198 Q100 206 66 198 Z" fill="#fff" stroke="#c9d6ea" stroke-width="3"/>
  <path d="M80 158 L100 184 L120 158 L124 170 L100 192 L76 170 Z" fill="#4a6fb5"/>
  <path d="M100 186 L88 178 L88 194 Z M100 186 L112 178 L112 194 Z" fill="#ff6f6f"/><circle cx="100" cy="186" r="3.5" fill="#ff6f6f"/>`,
 o_stardress:`<path d="M72 160 Q100 152 128 160 L150 216 Q100 230 50 216 Z" fill="#3e4c94" stroke="#2c376e" stroke-width="3"/>
  <path d="M86 159 Q100 170 114 159" fill="#fff" stroke="#2c376e" stroke-width="2"/>
  <g fill="#ffe27a">${[[78,188],[104,196],[124,184],[70,210],[96,216],[124,212],[112,174]].map(([x,y],i)=>`<polygon points="${star(x,y,i%2?4:5.5,i%2?1.8:2.4)}"/>`).join('')}</g>`,
 o_apron:`<path d="M86 164 L114 164 L116 190 L84 190 Z" fill="#fff" stroke="#ff9fb8" stroke-width="2.5"/>
  <path d="M68 188 L132 188 L140 214 Q100 224 60 214 Z" fill="#fff" stroke="#ff9fb8" stroke-width="2.5"/>
  <path d="M62 214 q6 7 13 1 q6 7 13 1 q6 7 13 1 q6 7 13 1 q6 7 13 1 q6 7 13 0" fill="none" stroke="#ff9fb8" stroke-width="2.5"/>
  <path d="M100 208 C90 200 92 192 100 197 C108 192 110 200 100 208 Z" fill="#ff8fb1"/>`,
 o_rainbow:rainbowDress()
});
Object.assign(HAT,{
 h_tiara:`<polygon points="80,62 84,48 92,55 100,38 108,55 116,48 120,62" fill="#eef2f8" stroke="#a9b7cc" stroke-width="2.5" stroke-linejoin="round"/><circle cx="100" cy="52" r="5" fill="#ff8fb1"/><circle cx="86" cy="57" r="2.5" fill="#9ad6ff"/><circle cx="114" cy="57" r="2.5" fill="#9ad6ff"/>`,
 h_witch:`<path d="M72 58 L94 10 Q102 2 118 12 L128 58 Z" fill="#8e6be0" stroke="#6a48bd" stroke-width="3" stroke-linejoin="round"/><rect x="74" y="44" width="52" height="9" fill="#ffd34f"/><ellipse cx="100" cy="60" rx="54" ry="10" fill="#8e6be0" stroke="#6a48bd" stroke-width="3"/><polygon points="${star(112,30,7,3)}" fill="#ffd34f"/>`,
 h_chef:`<g fill="#fff" stroke="#d9d0d0" stroke-width="2.5"><circle cx="82" cy="38" r="16"/><circle cx="118" cy="38" r="16"/><circle cx="100" cy="28" r="18"/><rect x="78" y="40" width="44" height="20" rx="4"/></g><line x1="80" y1="48" x2="120" y2="48" stroke="#f0e6e6" stroke-width="2"/>`,
 h_halo:`<ellipse cx="100" cy="28" rx="32" ry="8" fill="none" stroke="#fff1a8" stroke-width="11"/><ellipse cx="100" cy="28" rx="32" ry="8" fill="none" stroke="#ffd34f" stroke-width="5"/>`
});
Object.assign(ACC,{
 a_icecream:`<polygon points="47,176 69,176 58,206" fill="#f2c27b" stroke="#d69c4a" stroke-width="2.5" stroke-linejoin="round"/><path d="M52 184 L62 192 M58 178 L66 186 M50 180 L56 198" stroke="#d69c4a" stroke-width="1.5"/><circle cx="52" cy="168" r="10" fill="#ffb7cb" stroke="#f08aa8" stroke-width="2"/><circle cx="65" cy="167" r="10" fill="#fff2c2" stroke="#e9cf7a" stroke-width="2"/><circle cx="58" cy="155" r="5" fill="#ff5a6e"/>`,
 a_bouquet:`<g stroke="#5fae5b" stroke-width="3"><line x1="142" y1="192" x2="148" y2="156"/><line x1="142" y1="192" x2="160" y2="150"/><line x1="142" y1="192" x2="164" y2="164"/></g><circle cx="148" cy="152" r="8" fill="#ff8fb1" stroke="#fff" stroke-width="2"/><circle cx="162" cy="146" r="8" fill="#ffd34f" stroke="#fff" stroke-width="2"/><circle cx="166" cy="162" r="7" fill="#9ad6ff" stroke="#fff" stroke-width="2"/><path d="M132 198 L150 166 L164 176 Z" fill="#ffd0dc" stroke="#f08aa8" stroke-width="2" stroke-linejoin="round"/>`,
 a_umbrella:`<path d="M148 186 q0 10 -8 10" stroke="#5a96d8" stroke-width="4" fill="none" stroke-linecap="round"/>`,
 a_heart:`<line x1="56" y1="186" x2="30" y2="144" stroke="#ffb1d0" stroke-width="5" stroke-linecap="round"/><path d="M28 148 C8 132 14 114 28 124 C42 114 48 132 28 148 Z" fill="#ff7ea6" stroke="#e05a86" stroke-width="2.5" stroke-linejoin="round"/><ellipse cx="21" cy="128" rx="3" ry="4" fill="#fff" opacity=".7"/>`
});
const ACC_BACK={
 a_umbrella:`<line x1="150" y1="40" x2="148" y2="188" stroke="#5a96d8" stroke-width="4"/><path d="M104 66 Q150 -6 196 66 q-11.5 -9 -23 0 q-11.5 -9 -23 0 q-11.5 -9 -23 0 q-11.5 -9 -23 0 Z" fill="#8fc8ff" stroke="#5a96d8" stroke-width="3" stroke-linejoin="round"/><path d="M150 32 L150 66" stroke="#5a96d8" stroke-width="2"/><circle cx="150" cy="28" r="4" fill="#5a96d8"/>`
};
/* ✨ スペシャル アイテム */
const wingPath=(dir,c1,c2,op)=>{const m=dir<0?'':'transform="translate(200 0) scale(-1 1)"';
 return `<g ${m} opacity="${op}"><path d="M70 176 C30 120 4 130 10 156 C-2 168 10 188 30 186 C20 204 44 214 70 196 Z" fill="${c1}" stroke="${c2}" stroke-width="3" stroke-linejoin="round"/><path d="M66 180 C40 160 26 158 20 162 M66 186 C44 182 34 186 30 190" stroke="${c2}" stroke-width="2" fill="none"/></g>`};
Object.assign(ACC_BACK,{
 a_wings:wingPath(-1,'#fff','#b9d8f5',1)+wingPath(1,'#fff','#b9d8f5',1),
 a_fairy:`<g>${wingPath(-1,'#d9c4ff','#b394f0',.85)}${wingPath(1,'#ffc4e1','#f08aa8',.85)}</g>`
});
Object.assign(ACC,{a_wings:'',a_fairy:`<g fill="#fff6a8">${[[30,140],[172,136],[22,190],[180,196]].map(([x,y])=>`<polygon points="${star(x,y,5,2)}"/>`).join('')}</g>`});
Object.assign(OUTFIT,{
 o_kimono:`<path d="M70 160 Q100 152 130 160 L140 220 Q100 228 60 220 Z" fill="#ff8fa3" stroke="#e0607a" stroke-width="3"/>
  <path d="M86 158 L100 182 L114 158" fill="none" stroke="#fff" stroke-width="4"/><path d="M90 158 L100 176 L110 158" fill="none" stroke="#ffd34f" stroke-width="2"/>
  <rect x="66" y="184" width="68" height="14" fill="#ffd34f" stroke="#e5a91c" stroke-width="2"/><path d="M100 191 l-9 -6 v12z M100 191 l9 -6 v12z" fill="#ff6f8a"/>
  ${[[76,208],[120,212],[96,214],[124,172],[74,170]].map(([x,y])=>`<g fill="#fff">${[0,72,144,216,288].map(a=>`<circle cx="${(x+4*Math.cos(a*Math.PI/180)).toFixed(1)}" cy="${(y+4*Math.sin(a*Math.PI/180)).toFixed(1)}" r="2.8"/>`).join('')}</g><circle cx="${x}" cy="${y}" r="1.8" fill="#ffd34f"/>`).join('')}`,
 o_magical:`<path d="M80 158 Q100 150 120 158 L118 190 L82 190 Z" fill="#fff" stroke="#f08aa8" stroke-width="3"/>
  <path d="M82 186 Q100 194 118 186 L154 214 Q100 232 46 214 Z" fill="#ff9ec0" stroke="#e0688f" stroke-width="3"/>
  <path d="M86 192 Q100 198 114 192 L136 214 Q100 226 64 214 Z" fill="#fff" opacity=".6"/>
  <path d="M48 212 q8 8 16 0 q8 8 16 0 q8 8 16 0 q8 8 16 0 q8 8 16 0 q8 8 16 0" fill="none" stroke="#fff" stroke-width="3"/>
  <path d="M100 168 L80 156 L80 180 Z M100 168 L120 156 L120 180 Z" fill="#ff6f9a" stroke="#e05a86" stroke-width="2" stroke-linejoin="round"/><polygon points="${star(100,168,8,3.5)}" fill="#ffd34f" stroke="#e5a91c" stroke-width="1.5"/>`
});
Object.assign(HAT,{
 h_unicorn:`<polygon points="91,60 100,12 109,60" fill="#ffe27a" stroke="#e5a91c" stroke-width="2.5" stroke-linejoin="round"/><g stroke="#e5a91c" stroke-width="2"><line x1="93" y1="50" x2="107" y2="44"/><line x1="95" y1="38" x2="105" y2="33"/><line x1="97" y1="26" x2="103" y2="23"/></g>
  ${[[76,60,'#ff9ec0'],[86,54,'#c3a8ff'],[114,54,'#9ad6ff'],[124,60,'#ff9ec0']].map(([x,y,c])=>`<circle cx="${x}" cy="${y}" r="7" fill="${c}" stroke="#fff" stroke-width="2"/><circle cx="${x}" cy="${y}" r="2.2" fill="#fff"/>`).join('')}`,
 h_bigbow:`<g transform="translate(100 46)"><path d="M0 0 C-14 -26 -50 -22 -44 4 C-40 20 -14 14 0 0 Z M0 0 C14 -26 50 -22 44 4 C40 20 14 14 0 0 Z" fill="#ff7ea6" stroke="#e05a86" stroke-width="3" stroke-linejoin="round"/><path d="M-6 4 L-18 30 L-6 26 Z M6 4 L18 30 L6 26 Z" fill="#ff7ea6" stroke="#e05a86" stroke-width="2.5" stroke-linejoin="round"/><ellipse rx="9" ry="10" fill="#ff9ec0" stroke="#e05a86" stroke-width="3"/>${[[-30,-6],[-22,4],[30,-6],[22,4]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="2.6" fill="#fff"/>`).join('')}</g>`
});
function face(m,C={}){
 const big=C.bigEyes,ex=big?78:80,ex2=big?122:120;
 const eye=x=>`<ellipse cx="${x}" cy="110" rx="${big?8.5:6.5}" ry="${big?10:8.5}" fill="${INK}"/><circle cx="${x+2.5}" cy="106" r="${big?3.4:2.6}" fill="#fff"/>${big?`<circle cx="${x-2.5}" cy="114" r="1.6" fill="#fff"/>`:''}`;
 const happyEye=x=>`<path d="M${x-7} 113 Q${x} 102 ${x+7} 113" stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
 const cw=C.cheek||10;
 let s=`<ellipse cx="66" cy="127" rx="${cw}" ry="${cw*.6}" fill="${C.blush||'#ffb3c4'}" opacity=".85"/><ellipse cx="134" cy="127" rx="${cw}" ry="${cw*.6}" fill="${C.blush||'#ffb3c4'}" opacity=".85"/>`;
 s+=m==='happy'?happyEye(ex)+happyEye(ex2):eye(ex)+eye(ex2);
 if(C.beak){s+=`<path d="M89 121 Q100 114 111 121 Q100 ${m==='happy'?136:131} 89 121Z" fill="#ffb347" stroke="#e08f1f" stroke-width="2" stroke-linejoin="round"/>`}
 else{
  if(C.nose) s+=`<path d="M96 117 h8 l-4 4.5z" fill="${C.nose}" stroke="${C.nose}" stroke-width="1.5" stroke-linejoin="round"/>`;
  const my=C.nose?3:0;
  if(m==='happy') s+=`<path d="M91 ${122+my} Q100 ${137+my} 109 ${122+my} Z" fill="#ff7d96" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>`;
  else if(m==='oops') s+=`<path d="M94 ${130+my} Q100 ${125+my} 106 ${130+my}" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  else if(C.mouthW) s+=`<path d="M92 124 Q96 129 100 124 Q104 129 108 124" stroke="${INK}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
  else s+=`<path d="M93 ${123+my} Q100 ${131+my} 107 ${123+my}" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
 }
 if(m==='oops') s+=`<path d="M150 90 q5 8 0 12 q-5 -4 0 -12z" fill="#9ad6ff"/>`;
 return s}
/* キャラクター：からだの かたちは きょうつう（ふくが そのまま きられる）で、いろ・みみ・かおを かえる */
const CH={
 c_moko:{body:BODY,line:LINE,
  back:`<g stroke="${LINE}" stroke-width="3" fill="${BODY}"><ellipse cx="74" cy="52" rx="15" ry="38" transform="rotate(-14 74 52)"/><ellipse cx="126" cy="52" rx="15" ry="38" transform="rotate(14 126 52)"/></g>
  <ellipse cx="74" cy="56" rx="7" ry="25" fill="#ffc9d6" transform="rotate(-14 74 56)"/><ellipse cx="126" cy="56" rx="7" ry="25" fill="#ffc9d6" transform="rotate(14 126 56)"/>`},
 c_hamster:{body:'#f6c793',line:'#d79a5c',
  back:`<g stroke="#d79a5c" stroke-width="3" fill="#f6c793"><circle cx="64" cy="64" r="16"/><circle cx="136" cy="64" r="16"/></g><circle cx="64" cy="64" r="8" fill="#ffc2c8"/><circle cx="136" cy="64" r="8" fill="#ffc2c8"/>`,
  belly:`<ellipse cx="100" cy="196" rx="27" ry="24" fill="#fffaf2"/>`,
  front:`<ellipse cx="100" cy="132" rx="45" ry="30" fill="#fffaf2"/><path d="M100 54 q-4 10 0 18 q4 -8 0 -18" fill="#e9b27a"/>`,
  blush:'#ff9fb0',cheek:14,nose:'#ff8fa0'},
 c_penguin:{body:'#4d5d8c',line:'#33406b',feet:'#ffb347',footLine:'#e08f1f',
  back:`<path d="M96 52 q-2 -16 12 -18 q-10 6 -4 18z" fill="#4d5d8c" stroke="#33406b" stroke-width="2.5"/>`,
  belly:`<ellipse cx="100" cy="194" rx="30" ry="29" fill="#fff"/>`,
  front:`<g fill="#fff"><circle cx="80" cy="116" r="25"/><circle cx="120" cy="116" r="25"/><ellipse cx="100" cy="136" rx="36" ry="24"/></g>`,
  beak:true,blush:'#ffb3c4'},
 c_cat:{body:'#c9d0db',line:'#97a1b3',
  back:`<path d="M134 214 Q182 214 176 168 Q172 150 160 156" fill="none" stroke="#97a1b3" stroke-width="20" stroke-linecap="round"/><path d="M134 214 Q182 214 176 168 Q172 150 160 156" fill="none" stroke="#c9d0db" stroke-width="14" stroke-linecap="round"/><g stroke="#a3acbd" stroke-width="3"><line x1="170" y1="190" x2="181" y2="186"/><line x1="166" y1="204" x2="176" y2="208"/></g>`,
  belly:`<ellipse cx="100" cy="196" rx="24" ry="22" fill="#f4f6fa"/>`,
  front:`<g stroke="#97a1b3" stroke-width="3" fill="#c9d0db" stroke-linejoin="round"><path d="M58 76 Q60 50 86 56 Q80 70 58 76 Z"/><path d="M142 76 Q140 50 114 56 Q120 70 142 76 Z"/></g>
   <path d="M66 70 Q70 60 80 60" stroke="#ffc2cf" stroke-width="3" fill="none"/><path d="M134 70 Q130 60 120 60" stroke="#ffc2cf" stroke-width="3" fill="none"/>
   <g stroke="#a3acbd" stroke-width="3.5" stroke-linecap="round" fill="none"><path d="M100 56 v13"/><path d="M90 58 q-2 6 0 10"/><path d="M110 58 q2 6 0 10"/></g>
   <ellipse cx="100" cy="128" rx="24" ry="15" fill="#f4f6fa"/>
   <g stroke="#97a1b3" stroke-width="2" stroke-linecap="round"><line x1="58" y1="120" x2="40" y2="116"/><line x1="58" y1="127" x2="40" y2="129"/><line x1="142" y1="120" x2="160" y2="116"/><line x1="142" y1="127" x2="160" y2="129"/></g>`,
  nose:'#ff9fb3',mouthW:true,blush:'#ffb3c4',bigEyes:true}
};
function charInner(eq,mood){
 const C=CH[eq.char]||CH.c_moko,st=`stroke="${C.line}" stroke-width="3"`;
 return `${ACC_BACK[eq.acc]||''}${C.back||''}
 <g stroke="${C.footLine||C.line}" stroke-width="3" fill="${C.feet||C.body}"><ellipse cx="82" cy="222" rx="16" ry="10"/><ellipse cx="118" cy="222" rx="16" ry="10"/></g>
 <g ${st} fill="${C.body}"><ellipse cx="100" cy="188" rx="42" ry="36"/></g>${C.belly||''}
 ${OUTFIT[eq.outfit]||''}
 <g ${st} fill="${C.body}"><ellipse cx="58" cy="184" rx="12" ry="16" transform="rotate(25 58 184)"/><ellipse cx="142" cy="184" rx="12" ry="16" transform="rotate(-25 142 184)"/><circle cx="100" cy="108" r="58"/></g>
 ${C.front||''}${face(mood,C)}${HAT[eq.hat]||''}${ACC[eq.acc]||''}`}
const charSVG=(eq,mood='normal',cls='')=>`<svg viewBox="0 0 200 240"><g class="${cls}">${charInner(eq,mood)}</g></svg>`;

/* ---------- おへや ---------- */
const NIGHT_STARS=[[30,20],[150,30],[210,15],[330,40],[260,120],[180,150],[340,160],[20,150],[130,130],[300,90]];
function wallSVG(id){
 let s='';
 if(id==='w_dots'){s+=`<rect width="360" height="200" fill="#ffe4ec"/>`;for(let y=15;y<200;y+=30)for(let x=(y/30|0)%2?30:15;x<360;x+=30)s+=`<circle cx="${x}" cy="${y}" r="5" fill="#ffc4d6"/>`}
 else if(id==='w_stripe'){s+=`<rect width="360" height="200" fill="#e6f4ff"/>`;for(let x=8;x<360;x+=32)s+=`<rect x="${x}" width="14" height="200" fill="#cde8ff"/>`}
 else if(id==='w_rainbow'){s+=`<rect width="360" height="200" fill="#fffaf0"/>`;['#ffadad','#ffd29a','#fff0a0','#bfeab0','#addcff','#d4c2ff'].forEach((c,i)=>{const R=150-i*12;s+=`<path d="M${250-R} 200 A${R} ${R} 0 0 1 ${250+R} 200" fill="none" stroke="${c}" stroke-width="12"/>`});
  s+=`<g fill="#fff"><circle cx="100" cy="190" r="14"/><circle cx="118" cy="182" r="16"/><circle cx="136" cy="192" r="12"/><circle cx="380" cy="190" r="14"/><circle cx="362" cy="184" r="15"/></g>`}
 else if(id==='w_candy'){s+=`<rect width="360" height="200" fill="#e4faf1"/>`;for(let x=10;x<360;x+=36)s+=`<rect x="${x}" width="16" height="200" fill="#d0f3e4"/>`;
  [[150,40],[210,120],[320,60],[260,30],[170,150],[330,150]].forEach(([x,y],i)=>{s+=i%2?`<circle cx="${x}" cy="${y}" r="12" fill="#ffb1c8" stroke="#f08aa8" stroke-width="2"/><circle cx="${x}" cy="${y}" r="4.5" fill="#e4faf1"/>${[0,1,2,3].map(k=>`<rect x="${x-6+k*4}" y="${y-9+(k%2)*3}" width="2.5" height="1.5" fill="${['#fff','#ffd34f','#8fc8ff','#fff'][k]}"/>`).join('')}`
   :`<path d="M${x-18} ${y} l6 -5 v10z M${x+18} ${y} l-6 -5 v10z" fill="#ffd34f"/><circle cx="${x}" cy="${y}" r="10" fill="#c3a8ff"/><path d="M${x-6} ${y} a6 6 0 0 1 12 0 a3 3 0 0 1 -6 0" fill="none" stroke="#fff" stroke-width="2.5"/>`})}
 else if(id==='w_space'){s+=`<rect width="360" height="200" fill="#2a1f55"/>`+NIGHT_STARS.map(([x,y],i)=>`<polygon points="${star(x,y,i%3?3:5,i%3?1.4:2.2)}" fill="#fff6a8"/>`).join('')+
  `<circle cx="300" cy="66" r="22" fill="#ffb38a"/><ellipse cx="300" cy="66" rx="36" ry="8" fill="none" stroke="#ffe0b8" stroke-width="4" transform="rotate(-18 300 66)"/><circle cx="214" cy="150" r="10" fill="#8fc8ff"/><circle cx="160" cy="60" r="6" fill="#c3a8ff"/><path d="M220 30 l40 16" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".7"/>`}
 else if(id==='w_night'){s+=`<rect width="360" height="200" fill="#34407a"/>`+NIGHT_STARS.map(([x,y])=>`<polygon points="${star(x,y,5,2.2)}" fill="#fff6a8"/>`).join('')+`<circle cx="300" cy="40" r="0"/>`}
 else s+=`<rect width="360" height="200" fill="#fff1dc"/><rect y="150" width="360" height="50" fill="#ffe6c4"/><line x1="0" y1="150" x2="360" y2="150" stroke="#f3cf9f" stroke-width="3"/>`;
 const night=id==='w_night'||id==='w_space';
 s+=`<rect x="28" y="32" width="90" height="86" rx="8" fill="${night?'#1d2550':'#bfe6ff'}" stroke="#fff" stroke-width="6"/>
  ${night?`<circle cx="92" cy="58" r="12" fill="#fff3b0"/><circle cx="98" cy="54" r="11" fill="#1d2550"/><polygon points="${star(50,90,5,2)}" fill="#fff6a8"/>`:`<ellipse cx="58" cy="92" rx="18" ry="8" fill="#fff"/><ellipse cx="70" cy="88" rx="12" ry="8" fill="#fff"/><circle cx="96" cy="54" r="10" fill="#ffe27a"/>`}
  <line x1="73" y1="32" x2="73" y2="118" stroke="#fff" stroke-width="5"/>
  <path d="M22 26 Q30 80 20 124 L40 124 Q34 80 44 26Z" fill="#ffa9c2"/><path d="M124 26 Q116 80 126 124 L106 124 Q112 80 102 26Z" fill="#ffa9c2"/>
  <rect x="16" y="22" width="114" height="7" rx="3" fill="#e9a07f"/>`;
 return s}
function floorSVG(id){
 let s='';
 if(id==='f_mint'){s+=`<rect y="200" width="360" height="100" fill="#c4ecdc"/>`;for(let y=214;y<300;y+=22)for(let x=(y%44?12:24);x<360;x+=24)s+=`<circle cx="${x}" cy="${y}" r="2.5" fill="#a5dcc6"/>`}
 else if(id==='f_flower'){s+=`<rect y="200" width="360" height="100" fill="#c2eaa8"/>`;const c=['#ff9ec0','#ffd34f','#ffffff','#c3a8ff','#8fc8ff'];let k=0;for(let y=212;y<300;y+=22)for(let x=(y%44?14:30);x<360;x+=34){const cc=c[k++%5];s+=`<g fill="${cc}">${[0,72,144,216,288].map(a=>`<circle cx="${(x+4.5*Math.cos(a*Math.PI/180)).toFixed(1)}" cy="${(y+3.2*Math.sin(a*Math.PI/180)).toFixed(1)}" r="3"/>`).join('')}</g><circle cx="${x}" cy="${y}" r="2" fill="#ff9e3d"/>`}}
 else if(id==='f_cloud'){s+=`<rect y="200" width="360" height="100" fill="#d6eeff"/>`;[[40,230],[150,270],[270,226],[330,280],[90,290],[220,292]].forEach(([x,y])=>{s+=`<g fill="#fff" opacity=".95"><ellipse cx="${x}" cy="${y}" rx="22" ry="8"/><circle cx="${x-8}" cy="${y-5}" r="8"/><circle cx="${x+6}" cy="${y-7}" r="10"/></g>`})}
 else if(id==='f_tile'){for(let y=200,j=0;y<300;y+=25,j++)for(let x=0,i=0;x<360;x+=30,i++)s+=`<rect x="${x}" y="${y}" width="30" height="25" fill="${(i+j)%2?'#ffd6e2':'#fff0f4'}"/>`}
 else{s+=`<rect y="200" width="360" height="100" fill="#e9c89d"/>`;for(let y=220;y<300;y+=20)s+=`<line x1="0" y1="${y}" x2="360" y2="${y}" stroke="#d6ae7f" stroke-width="2"/>`;for(let y=200,k=0;y<300;y+=20,k++)for(let x=(k%2?40:90);x<360;x+=110)s+=`<line x1="${x}" y1="${y}" x2="${x}" y2="${y+20}" stroke="#d6ae7f" stroke-width="2"/>`}
 return s+`<rect y="196" width="360" height="7" fill="#fff"/>`}
const FURN={
 u_poster:()=>`<rect x="150" y="28" width="58" height="72" rx="5" fill="#fffbe8" stroke="#f3c34f" stroke-width="3"/><polygon points="${star(179,62,20,9)}" fill="#ffd34f" stroke="#e5a91c" stroke-width="2" stroke-linejoin="round"/><circle cx="179" cy="31" r="3" fill="#ff8fb1"/>`,
 u_shelf:()=>{let s='';const c=['#ff9ab4','#8fc8ff','#ffd34f','#b6ec9c','#d6bdff','#ffb38a'];
  [[40,0],[98,1]].forEach(([y,k])=>{let x=242;for(let i=0;i<6;i++){const h=20+((i*7+k*3)%10),w=9+((i+k)%3)*2;s+=`<rect x="${x}" y="${y-h}" width="${w}" height="${h}" rx="2" fill="${c[(i+k*2)%6]}"/>`;x+=w+2}
   s+=`<circle cx="${k?318:322}" cy="${y-8}" r="8" fill="${k?'#ffb1e6':'#9ad6ff'}"/>`});
  return s+`<rect x="236" y="40" width="98" height="8" rx="3" fill="#c99a6c"/><rect x="236" y="98" width="98" height="8" rx="3" fill="#c99a6c"/>`},
 u_lamp:()=>`<circle cx="292" cy="168" r="40" fill="#fff3b0" opacity=".45"/><ellipse cx="292" cy="262" rx="18" ry="6" fill="#b9886b"/><rect x="289" y="168" width="6" height="94" fill="#b9886b"/><path d="M268 174 L316 174 L304 140 L280 140 Z" fill="#ffe28a" stroke="#f0bf3c" stroke-width="3" stroke-linejoin="round"/>`,
 u_plant:()=>`<g fill="#8ed08a" stroke="#5fae5b" stroke-width="2.5"><ellipse cx="335" cy="205" rx="9" ry="26"/><ellipse cx="335" cy="214" rx="8" ry="22" transform="rotate(-38 335 236)"/><ellipse cx="335" cy="214" rx="8" ry="22" transform="rotate(38 335 236)"/></g><path d="M317 234 L353 234 L347 270 L323 270 Z" fill="#ee966f" stroke="#cf6f4b" stroke-width="3" stroke-linejoin="round"/>`,
 u_bed:()=>`<rect x="8" y="170" width="18" height="88" rx="7" fill="#f3a9bd"/><rect x="12" y="246" width="8" height="14" fill="#e48aa3"/><rect x="108" y="246" width="8" height="14" fill="#e48aa3"/><rect x="8" y="206" width="114" height="44" rx="11" fill="#ffd3de" stroke="#f3a9bd" stroke-width="3"/><ellipse cx="44" cy="206" rx="18" ry="10" fill="#fff" stroke="#f3c6d2" stroke-width="2"/><rect x="58" y="198" width="64" height="38" rx="11" fill="#ff9fb8"/>${[[72,210],[92,222],[110,208],[80,228],[104,228]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="3" fill="#fff"/>`).join('')}`,
 u_bear:()=>`<g fill="#c8925f" stroke="#a5703f" stroke-width="2.5"><circle cx="48" cy="248" r="6.5"/><circle cx="72" cy="248" r="6.5"/><ellipse cx="60" cy="280" rx="17" ry="15"/><circle cx="60" cy="260" r="15"/></g><ellipse cx="60" cy="265" rx="6.5" ry="4.5" fill="#f5dcc0"/><circle cx="54" cy="257" r="2" fill="${INK}"/><circle cx="66" cy="257" r="2" fill="${INK}"/><circle cx="60" cy="263" r="1.8" fill="${INK}"/><path d="M52 273 l8 4 l8 -4 l-2 7 l-6 -3 l-6 3 z" fill="#ff8fb1"/>`,
 u_trophy:()=>`<path d="M243 262 q-11 0 -9 9 q2 7 10 5 M267 262 q11 0 9 9 q-2 7 -10 5" fill="none" stroke="#e5a91c" stroke-width="3"/><path d="M242 258 h26 v8 q0 16 -13 18 q-13 -2 -13 -18z" fill="#ffd34f" stroke="#e5a91c" stroke-width="2.5" stroke-linejoin="round"/><rect x="252" y="284" width="6" height="7" fill="#e5a91c"/><rect x="243" y="290" width="24" height="8" rx="2" fill="#c98f2a"/><polygon points="${star(255,269,6,2.6)}" fill="#fff6c4"/>`,
 u_fish:()=>`<ellipse cx="300" cy="297" rx="15" ry="3" fill="#000" opacity=".08"/><circle cx="300" cy="280" r="17" fill="#d6f1ff" stroke="#8fc8ff" stroke-width="2.5"/><ellipse cx="300" cy="266" rx="11" ry="3" fill="#fff" stroke="#8fc8ff" stroke-width="2"/><path d="M292 296 q-3 -8 1 -14 M296 296 q3 -6 -1 -10" stroke="#6fc27a" stroke-width="2.5" fill="none"/><ellipse cx="302" cy="281" rx="7" ry="4.5" fill="#ff8a5c"/><path d="M308 281 l7 -5 v10z" fill="#ff8a5c"/><circle cx="298" cy="280" r="1.3" fill="#333"/><circle cx="296" cy="272" r="1.8" fill="#fff"/><circle cx="293" cy="276" r="1.2" fill="#fff"/>`,
 u_piano:()=>{let k='';for(let i=0;i<7;i++)k+=`<rect x="${92+i*6.3}" y="276" width="6.3" height="13" fill="#fff" stroke="#e8cfd6" stroke-width="1"/>`;for(const i of [1,2,4,5,6])k+=`<rect x="${92+i*6.3-1.8}" y="276" width="3.6" height="7.5" fill="#5a4646"/>`;
  return `<rect x="92" y="292" width="4" height="8" fill="#e57c9b"/><rect x="132" y="292" width="4" height="8" fill="#e57c9b"/><rect x="88" y="268" width="52" height="26" rx="6" fill="#ff9fb8" stroke="#e57c9b" stroke-width="2.5"/>${k}`},
 u_garland:()=>{const P=(t)=>[(1-t)**2*128+2*(1-t)*t*180+t*t*232,(1-t)**2*6+2*(1-t)*t*32+t*t*6],c=['#ff8fb1','#ffd34f','#8fc8ff','#a8e39a','#c3a8ff','#ffb38a','#ff8fb1'];let s=`<path d="M128 6 Q180 32 232 6" fill="none" stroke="#c99a6c" stroke-width="2"/>`;
  for(let i=0;i<7;i++){const t=.08+i*.14,[x,y]=P(t);s+=`<polygon points="${(x-7).toFixed(1)},${y.toFixed(1)} ${(x+7).toFixed(1)},${y.toFixed(1)} ${x.toFixed(1)},${(y+15).toFixed(1)}" fill="${c[i]}"/>`}return s},
 u_canopy:()=>`<rect x="6" y="132" width="6" height="128" rx="2" fill="#e5b95a"/><rect x="118" y="132" width="6" height="128" rx="2" fill="#e5b95a"/>${FURN.u_bed()}
  <path d="M8 142 Q20 190 12 238 L24 238 Q30 190 20 142Z M122 142 Q110 190 118 238 L106 238 Q100 190 110 142Z" fill="#ffd6e6" opacity=".85"/>
  <path d="M0 134 Q65 114 130 134 L130 146 Q65 126 0 146 Z" fill="#ffb6d0" stroke="#f08aa8" stroke-width="2"/><path d="M4 144 q8 8 16 0 q8 8 16 0 q8 8 16 0 q8 8 16 0 q8 8 16 0 q8 8 16 0 q8 8 16 0 q8 8 16 0" fill="none" stroke="#fff" stroke-width="2.5"/>
  <polygon points="${star(65,116,9,4)}" fill="#ffd34f" stroke="#e5a91c" stroke-width="1.5"/>`,
 u_chandelier:()=>`<circle cx="180" cy="40" r="34" fill="#fff6c4" opacity=".5"/><line x1="180" y1="0" x2="180" y2="18" stroke="#e5a91c" stroke-width="3"/>
  <path d="M146 30 Q180 52 214 30" fill="none" stroke="#e5a91c" stroke-width="4"/><ellipse cx="180" cy="22" rx="10" ry="6" fill="#ffd34f" stroke="#e5a91c" stroke-width="2"/>
  ${[150,165,180,195,210].map((x,i)=>{const y=[30,38,41,38,30][i];return `<rect x="${x-2.5}" y="${y-14}" width="5" height="12" fill="#fff" stroke="#e8d9c0" stroke-width="1"/><path d="M${x} ${y-21} q3 4 0 6 q-3 -2 0 -6" fill="#ffb347"/><path d="M${x} ${y+2} l4 6 l-4 6 l-4 -6z" fill="#cde8ff" stroke="#8fc8ff" stroke-width="1"/>`}).join('')}`,
 u_rug:()=>`<ellipse cx="182" cy="252" rx="94" ry="20" fill="#ffd9a8" stroke="#ffbf75" stroke-width="3" stroke-dasharray="7 5"/><ellipse cx="182" cy="252" rx="70" ry="13" fill="none" stroke="#fff" stroke-width="2"/>`
};
function roomSVG(st,mood='normal',cls='sway'){
 const has=id=>st.furn.includes(id),f=id=>has(id)&&!(id==='u_bed'&&has('u_canopy'))?FURN[id]():'';
 return `<svg viewBox="0 0 360 300">${wallSVG(st.equip.wall)}${f('u_poster')}${f('u_shelf')}${f('u_garland')}${f('u_chandelier')}${floorSVG(st.equip.floor)}${f('u_rug')}${f('u_bed')}${f('u_canopy')}${f('u_lamp')}${f('u_plant')}
 <g transform="translate(118 100) scale(.62)" data-act="pet"><g class="${cls}">${charInner(st.equip,mood)}</g></g>${f('u_bear')}${f('u_piano')}${f('u_trophy')}${f('u_fish')}</svg>`}


function thumb(it){
 if(['char','outfit','hat','acc'].includes(it.cat)){const eq={...S.equip,[it.cat]:it.id};return charSVG(eq,it.cat==='char'?'happy':'normal')}
 if(it.cat==='wall') return `<svg viewBox="0 0 360 200" preserveAspectRatio="xMidYMid slice">${wallSVG(it.id)}</svg>`;
 if(it.cat==='floor') return `<svg viewBox="0 200 360 100" preserveAspectRatio="xMidYMid slice">${floorSVG(it.id)}</svg>`;
 return `<svg viewBox="${it.box}">${FURN[it.id]()}</svg>`}
const tabs=(list,cur,act)=>`<div class="tabs">${list.map(([k,l])=>`<button class="${k===cur?'on':''}" data-act="${act}" data-arg="${k}">${l}</button>`).join('')}</div>`;

/* ---------- さんすうの テスト（ていぎ）---------- */
const TBASE={add1:4,add21:7,add22:12,sub1:4.5,sub21:8,sub22:14}; // 1もん あたりの きほん びょうすう
const TLV=[{n:10,need:9,mul:1,medal:'🥉',name:'テスト1'},{n:15,need:14,mul:.8,medal:'🥈',name:'テスト2'},{n:20,need:20,mul:.65,medal:'🥇',name:'テスト3'}];
const testLimit=(tid,lv)=>Math.round(TLV[lv].n*TBASE[tid]*TLV[lv].mul*S.settings.testScale);
const testItem=key=>ITEMS.find(i=>i.test===key);
const parseKey=key=>{const [tid,l]=key.split('-');return{tid,lv:Number(l)-1}};
const testUnlocked=key=>{const {tid,lv}=parseKey(key);return lv===0||!!(S.tests[tid+'-'+lv]||{}).pass};
const passRule=L=>L.need===L.n?'ぜんもん せいかい':`${L.need}もん いじょう せいかい`;

/* ---------- ポップアップと ボタン ---------- */
function showPop(html){const o=$('#ov');o.innerHTML=`<div class="pop">${html}</div>`;o.classList.remove('hide')}
function closePop(){$('#ov').classList.add('hide');$('#ov').innerHTML=''}
const ACT={};
document.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(!b)return;const f=ACT[b.dataset.act];if(f)f(b.dataset.arg,b)});
if('serviceWorker' in navigator&&location.protocol!=='file:')navigator.serviceWorker.register(document.querySelector('meta[name=sw]').content).catch(()=>{});
