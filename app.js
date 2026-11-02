const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cfg={theme:localStorage.getItem('nv-theme')||'dark',siteTheme:"normal",birthdayName:"",birthdayMessage:"",animations:localStorage.getItem('nv-animations')!=='false',font:Number(localStorage.getItem('nv-font')||18)};
let scheduledChapters=[],db,stories=[],isAdmin=false,user=null,activeStory=null,activeChapter=0,page=0,pages=[],timer;let reactions=[],myReactions=[],publicProfiles=[],profile=null;
const validCover=u=>typeof u==='string'&&/^https:\/\//i.test(u);
function applySettings(){document.documentElement.dataset.theme=cfg.theme;document.body.classList.toggle('halloween',cfg.siteTheme==='halloween');document.body.classList.toggle('christmas',cfg.siteTheme==='christmas');document.body.classList.toggle('newyear',cfg.siteTheme==='newyear');document.body.classList.toggle('birthday',cfg.siteTheme==='birthday');document.body.classList.toggle('easter',cfg.siteTheme==='easter');document.body.classList.toggle('no-motion',!cfg.animations);document.documentElement.style.setProperty('--reader-size',cfg.font+'px');if($('#siteSeasonSelect'))$('#siteSeasonSelect').value=cfg.siteTheme;syncBirthdayAdmin();renderBirthdayBanner();renderSeasonEffects();$('#themeSetting').value=cfg.theme;$('#animationsSetting').checked=cfg.animations;$('#fontSetting').value=cfg.font;}
function setSetting(k,v){cfg[k]=v;localStorage.setItem('nv-'+k,String(v));applySettings();}
async function init(){applySettings();try{if(window.ENCRIA_SUPABASE_URL&&window.ENCRIA_SUPABASE_ANON_KEY&&window.supabase){db=supabase.createClient(window.ENCRIA_SUPABASE_URL,window.ENCRIA_SUPABASE_ANON_KEY);const {data:{user:u}}=await db.auth.getUser();user=u;await checkAdmin();await loadSiteTheme();await loadProfile();db.auth.onAuthStateChange(()=>setTimeout(async()=>{const r=await db.auth.getUser();user=r.data.user;await checkAdmin();bookmarkCache.clear();await loadProfile();await loadSiteTheme();await loadStories();},0));await loadStories();}else{stories=await(await fetch('histoires.json')).json();render();await loadReadingList();} }catch(e){console.error(e);$('#empty').textContent='Impossible de charger les histoires : '+(e?.message||'connexion Supabase indisponible')+'. Aucune donnée n’a été supprimée.';$('#empty').hidden=false;}updateAccount();}
const SITE_THEMES=['normal','halloween','christmas','newyear','birthday','easter'];
async function loadSiteTheme(){
 if(!db)return;
 let {data,error}=await db.from('site_settings').select('site_theme,birthday_name,birthday_message').eq('id',1).maybeSingle();
 if(error){ /* migration anniversaire pas encore exécutée : on lit au moins le thème */
  const r=await db.from('site_settings').select('site_theme').eq('id',1).maybeSingle();data=r.data;error=r.error;
  if(error){console.warn('Exécuter MIGRATION-V5.sql pour activer les thèmes globaux :',error.message);return;}
  console.warn('Exécuter MIGRATION-V7-15-NOUVEL-AN-ANNIVERSAIRE.sql pour activer les éditions Nouvel An et Anniversaire.');
 }
 cfg.siteTheme=SITE_THEMES.includes(data?.site_theme)?data.site_theme:'normal';
 cfg.birthdayName=(data?.birthday_name||'').trim();cfg.birthdayMessage=(data?.birthday_message||'').trim();
 applySettings();
}
/* ----- édition Anniversaire : bannière en haut du site ----- */
function bdayKey(){return cfg.birthdayName+'|'+cfg.birthdayMessage;}
function renderBirthdayBanner(){
 const box=$('#bdayBanner');if(!box)return;
 const name=cfg.birthdayName,msg=cfg.birthdayMessage;
 let closed=false;try{closed=sessionStorage.getItem('nv-bday-closed')===bdayKey();}catch(e){}
 const show=cfg.siteTheme==='birthday'&&(name||msg)&&!closed;
 box.hidden=!show;if(!show)return;
 $('#bdayTitle').textContent=name?'Joyeux anniversaire '+name+' !':msg;
 $('#bdayMsg').textContent=name?msg:'';
}
function syncBirthdayAdmin(){
 const sel=$('#siteSeasonSelect'),box=$('#birthdayFields');if(!sel||!box)return;
 box.hidden=sel.value!=='birthday';
 if($('#bdayNameInput')&&document.activeElement!==$('#bdayNameInput'))$('#bdayNameInput').value=cfg.birthdayName;
 if($('#bdayMsgInput')&&document.activeElement!==$('#bdayMsgInput'))$('#bdayMsgInput').value=cfg.birthdayMessage;
}
async function saveSiteTheme(e){
 const select=$('#siteSeasonSelect'),status=$('#siteSeasonStatus');
 if(!isAdmin||!db){select.value=cfg.siteTheme;syncBirthdayAdmin();return;}
 const requested=select.value;
 /* Anniversaire : on affiche d'abord les champs, l'admin clique ensuite sur « Appliquer » */
 if(e&&e.type==='change'&&requested==='birthday'&&cfg.siteTheme!=='birthday'){syncBirthdayAdmin();status.textContent='Saisis un prénom et un petit mot (facultatifs), puis clique sur « Appliquer ».';return;}
 const name=requested==='birthday'?($('#bdayNameInput').value||'').trim().slice(0,40):null;
 const msg=requested==='birthday'?($('#bdayMsgInput').value||'').trim().slice(0,140):null;
 select.disabled=true;$('#siteSeasonApply').disabled=true;status.textContent='Enregistrement…';
 const {error}=await db.rpc('set_site_theme',{new_theme:requested,bday_name:name,bday_message:msg});
 if(error){status.textContent='Erreur : '+error.message+(/function|set_site_theme/i.test(error.message)?' (exécute MIGRATION-V7-15-NOUVEL-AN-ANNIVERSAIRE.sql)':'');select.value=cfg.siteTheme;syncBirthdayAdmin();}
 else{
  const changed=requested!==cfg.siteTheme;
  if(changed)window.dispatchEvent(new Event('nv:admin-theme')); /* le voile de transition ne joue que pour ce changement */
  cfg.siteTheme=requested;if(requested==='birthday'){cfg.birthdayName=name;cfg.birthdayMessage=msg;}
  applySettings();status.textContent='Thème appliqué à tous les visiteurs.';
 }
 select.disabled=false;$('#siteSeasonApply').disabled=false;
}
async function checkAdmin(){isAdmin=false;if(user&&db){const r=await db.from('admins').select('user_id').eq('user_id',user.id).maybeSingle();isAdmin=!!r.data;}updateAccount();applySettings();}
function renderSeasonEffects(){const layer=$('#seasonEffects');if(layer)layer.replaceChildren(); /* les décors des saisons sont gérés par seasons.js */}
function updateAccount(){const b=$('#accountButton');b.textContent=user?'Profil':'Connexion';$('#profileArea').hidden=!user;$('#loginArea').hidden=!!user;$('#adminLink').hidden=!isAdmin;$('#myStoriesOpen').hidden=!user;$('#adminSeasonSetting').hidden=!isAdmin;$('#accountRole').textContent=isAdmin?'ADMINISTRATEUR':'COMPTE LECTEUR';if(user){$('#accountEmail').textContent=user.email||'';$('#accountName').textContent=profile?.pseudo||user.user_metadata?.pseudo||(isAdmin?'Administrateur':'Lecteur');}}
async function loadProfile(){if(!db||!user){profile=null;updateAccount();return;}const {data}=await db.from('profiles').select('user_id,pseudo,pseudo_changed_at').eq('user_id',user.id).maybeSingle();profile=data||null;updateAccount();}
function authorOf(s){if(s.author_alias)return s.author_alias;return s.owner_id?(publicProfiles.find(p=>p.user_id===s.owner_id)?.pseudo||s.author):s.author;}
async function loadStories(){
 if(!db)return;
 const [a,b]=await Promise.all([db.from('stories').select('*').order('created_at',{ascending:false}),db.from('chapters').select('*').order('publish_at')]);
 if(a.error||b.error){const problem=a.error||b.error;console.error('Novelya: lecture Supabase',problem);throw problem;}
 const pr=await db.from('author_names').select('user_id,pseudo');if(!pr.error)publicProfiles=pr.data||[];
 const now=Date.now();
 stories=(a.data||[]).filter(s=>isAdmin||s.visibility==='published'||s.visibility==='scheduled').map(s=>({...s,chapters:(b.data||[]).filter(c=>String(c.story_id)===String(s.id)&&(isAdmin||!c.publish_at||new Date(c.publish_at).getTime()<=now)).map(c=>({title:c.title,text:c.body,background_url:c.background_url||null}))}));
 // Les chapitres futurs ne sont pas ajoutés au lecteur public avant leur publication.
 scheduledChapters=(b.data||[]).filter(c=>c.publish_at&&new Date(c.publish_at).getTime()>now).map(c=>({chapter:c,story:stories.find(s=>String(s.id)===String(c.story_id))})).filter(x=>x.story&&!upcoming(x.story)&&x.story.visibility==='published');
 await loadReactions();render();await loadReadingList();
}
function upcoming(s){return s.visibility==='scheduled'&&s.release_at&&new Date(s.release_at)>new Date();}
function counts(id){const r=reactions.filter(x=>x.story_id===id);const likes=r.filter(x=>x.liked).length;const notes=r.filter(x=>Number.isInteger(x.rating)&&x.rating>=1&&x.rating<=5).map(x=>x.rating);return {likes,avg:notes.length?notes.reduce((a,b)=>a+b,0)/notes.length:0,votes:notes.length,mine:myReactions.find(x=>x.story_id===id)};}
async function loadReactions(){if(!db){reactions=[];myReactions=[];return;}const {data,error}=await db.from('story_reactions').select('story_id,liked,rating,user_id');if(error){console.warn('Installer MIGRATION-V5-3-AVIS.sql :',error.message);reactions=[];myReactions=[];return;}reactions=data||[];myReactions=user?reactions.filter(r=>r.user_id===user.id):[];}
async function saveReaction(id,kind,value){if(!db||!user){$('#accountDialog').showModal();$('#authStatus').textContent='Connecte-toi pour liker ou noter une histoire.';return;}const mine=myReactions.find(x=>x.story_id===id);const payload={story_id:id,user_id:user.id,liked:kind==='like'?!mine?.liked:!!mine?.liked,rating:kind==='rating'?(mine?.rating===value?null:value):(mine?.rating||null)};const {error}=await db.from('story_reactions').upsert(payload,{onConflict:'story_id,user_id'});if(error){alert('Impossible d’enregistrer ton avis : '+error.message);return;}await loadReactions();render();if($('#storyDetail').open)openStoryDetail(id);}
function storyCard(s){const soon=upcoming(s),color=/^#[0-9a-f]{6}$/i.test(s.color)?s.color:'#5a72a2';const date=soon?new Date(s.release_at):null;return `<article class="card"><div class="cover" data-detail="${esc(s.id)}" style="--cover:${color}">${validCover(s.cover_url)?`<img class="cover-image" src="${esc(s.cover_url)}" alt="Couverture de ${esc(s.title)}" loading="lazy">`:''}</div><div class="card-body"><h3 data-detail="${esc(s.id)}" class="clickable-title">${esc(s.title)}</h3><span class="genre-tag">${esc(s.story_format||"Roman")}</span> <span class="genre-tag">${esc(s.genre)}</span> <span class="status-tag">${soon?'À venir':s.visibility==='draft'?'Brouillon':'Publiée'}</span><div class="author">par ${esc(authorOf(s))}</div><div class="story-reactions"><button type="button" class="reaction-like ${counts(s.id).mine?.liked?'active':''}" data-like="${esc(s.id)}" aria-label="Aimer cette histoire">${counts(s.id).mine?.liked?'❤️':'🤍'} ${counts(s.id).likes} j’aime</button><div class="reaction-rating" aria-label="Noter sur cinq étoiles">${[1,2,3,4,5].map(n=>`<button type="button" data-rate="${esc(s.id)}" data-score="${n}" aria-label="Noter ${n} sur 5" class="${(counts(s.id).mine?.rating||0)>=n?'selected':''}">★</button>`).join('')}<small>${counts(s.id).votes?counts(s.id).avg.toFixed(1)+'/5 · '+counts(s.id).votes+' avis':'Aucune note'}</small></div><button class="review-open" data-reviews="${esc(s.id)}">💬 Voir les avis</button></div><p class="description">${esc(s.description)}</p>${soon?`<p class="release">${date.toLocaleString('fr-FR',{dateStyle:'long',timeStyle:'short'})}<br><span data-countdown="${esc(s.id)}"></span></p>`:''}${isAdmin?`<a class="edit-inline" href="admin.html?edit=${encodeURIComponent(s.id)}">✏️ Modifier l'histoire</a>`:''}<button class="read-btn" data-detail="${esc(s.id)}" ${soon&&!isAdmin||!s.chapters.length?'disabled':''}>${soon&&!isAdmin?'Bientôt disponible':s.chapters.length?'Découvrir l’histoire →':'Aucun chapitre disponible'}</button></div></article>`;}
function chapterUpcomingCard({story,chapter}){
 const date=new Date(chapter.publish_at);
 const color=/^#[0-9a-f]{6}$/i.test(story.color)?story.color:'#5a72a2';
 return `<article class="card chapter-upcoming-card"><div class="cover" data-detail="${esc(story.id)}" style="--cover:${color}">${validCover(story.cover_url)?`<img class="cover-image" src="${esc(story.cover_url)}" alt="Couverture de ${esc(story.title)}" loading="lazy">`:''}</div><div class="card-body"><span class="genre-tag">Nouveau chapitre</span><h3 data-detail="${esc(story.id)}" class="clickable-title">${esc(story.title)}</h3><p class="upcoming-chapter-title">${esc(chapter.title)}</p><div class="author">par ${esc(authorOf(story))}</div><p class="release">${date.toLocaleString('fr-FR',{dateStyle:'long',timeStyle:'short'})}<br><span data-chapter-countdown="${esc(chapter.id)}"></span></p><button type="button" class="read-btn" disabled>Chapitre bientôt disponible</button></div></article>`;
}

function render(){const q=$('#search').value.toLowerCase(),g=$('#genre').value,f=$('#format').value,sort=$('#sort').value;const formats=['Roman','Manga','Webtoon','BD','Nouvelle','Light novel','Poésie','Fanfiction','Conte'];const genres=['Fantasy','Romance','Science-fiction','Horreur','Thriller','Policier','Aventure','Action','Drame','Comédie','Historique','Tranche de vie','Mystère','Fantastique','Dystopie','Autre'];const knownFormats=[...new Set([...formats,...stories.map(s=>s.story_format||'Roman')])];const knownGenres=[...new Set([...genres,...stories.map(s=>s.genre).filter(Boolean)])];$('#format').innerHTML='<option value="">Tous les formats</option>'+knownFormats.map(x=>`<option value="${esc(x)}" ${x===f?'selected':''}>${esc(x)}</option>`).join('');$('#genre').innerHTML='<option value="">Tous les genres</option>'+knownGenres.map(x=>`<option value="${esc(x)}" ${x===g?'selected':''}>${esc(x)}</option>`).join('');const filtered=stories.filter(s=>(!g||s.genre===g)&&(!f||(s.story_format||'Roman')===f)&&[s.title,authorOf(s),s.genre,s.story_format,s.description].join(' ').toLowerCase().includes(q));filtered.sort((a,b)=>sort==='rating'?(counts(b.id).votes?counts(b.id).avg:0)-(counts(a.id).votes?counts(a.id).avg:0)||counts(b.id).votes-counts(a.id).votes:sort==='recent'?new Date(b.created_at||0)-new Date(a.created_at||0):sort==='title'?a.title.localeCompare(b.title,'fr'):counts(b.id).likes-counts(a.id).likes||counts(b.id).avg-counts(a.id).avg);const live=filtered.filter(s=>!upcoming(s)),soon=filtered.filter(upcoming);$('#grid').innerHTML=live.map(storyCard).join('');const chapterSoon=scheduledChapters.filter(({story,chapter})=>(!g||story.genre===g)&&(!f||(story.story_format||'Roman')===f)&&[story.title,authorOf(story),story.genre,story.story_format,chapter.title].join(' ').toLowerCase().includes(q)).sort((a,b)=>new Date(a.chapter.publish_at)-new Date(b.chapter.publish_at));$('#upcomingGrid').innerHTML=soon.map(storyCard).join('')+chapterSoon.map(chapterUpcomingCard).join('');$('#upcomingSection').hidden=!soon.length&&!chapterSoon.length;$('#empty').hidden=!!filtered.length;$('#storyCount').textContent=stories.filter(s=>!upcoming(s)&&s.visibility!=='draft').length;renderFeatured();updateCountdowns();}
let featureIndex=0;
// Défilement autonome, sans remplacer la sélection lorsque la fenêtre de lecture est ouverte.
setInterval(()=>{const available=stories.filter(s=>!upcoming(s)&&(s.visibility==='published'||!s.visibility)&&s.chapters.length);if(available.length>1&&!document.hidden&&!$('#reader').open&&!$('#featuredStories').matches(':hover')&&!window.__featDown){featureIndex=(featureIndex+1)%available.length;renderFeatured();}},30000);
function renderFeatured(){
 const el=$('#featuredStories');if(!el)return;
 const choices=stories.filter(s=>!upcoming(s)&&(s.visibility==='published'||!s.visibility)&&s.chapters.length).sort((a,b)=>counts(b.id).likes-counts(a.id).likes||counts(b.id).avg-counts(a.id).avg);
 if(!choices.length){el.innerHTML='<div class="feature-empty"><span class="feature-sigil">✦</span><p>Découvre nos univers.<br>Chaque histoire commence ici.</p></div>';return;}
 featureIndex%=choices.length;
 const s=choices[featureIndex];const img=validCover(s.cover_url)?`<img src="${esc(s.cover_url)}" alt="Couverture de ${esc(s.title)}">`:'<span class="feature-sigil">✦</span>';
 el.innerHTML=`<button type="button" class="feature-book" data-detail="${esc(s.id)}" aria-label="Découvrir ${esc(s.title)}"><div class="feature-art" style="--feature-color:${/^#[0-9a-f]{6}$/i.test(s.color)?s.color:'#2944a3'}">${img}</div><div class="feature-bottom"><span class="feature-kicker">À DÉCOUVRIR · ${esc(s.genre)}</span><strong>${esc(s.title)}</strong><span class="feature-cta">Découvrir cette histoire →</span></div></button><div class="feature-nav"><button type="button" data-feature="-1" aria-label="Couverture précédente">←</button><span>${featureIndex+1} / ${choices.length}</span><button type="button" data-feature="1" aria-label="Couverture suivante">→</button></div>`;
}
function updateCountdowns(){document.querySelectorAll('[data-chapter-countdown]').forEach(el=>{const item=scheduledChapters.find(x=>String(x.chapter.id)===el.dataset.chapterCountdown);if(!item)return;const diff=new Date(item.chapter.publish_at).getTime()-Date.now();if(diff<=0){el.textContent='Disponible maintenant';return;}const days=Math.floor(diff/86400000),hrs=Math.floor(diff%86400000/3600000),mins=Math.floor(diff%3600000/60000);el.textContent=`${days} j ${hrs} h ${mins} min avant la sortie`;});document.querySelectorAll('[data-countdown]').forEach(el=>{const s=stories.find(x=>x.id===el.dataset.countdown);if(!s)return;const diff=new Date(s.release_at)-new Date();if(diff<=0){el.textContent='Disponible maintenant';return;}const days=Math.floor(diff/86400000),hrs=Math.floor(diff%86400000/3600000),mins=Math.floor(diff%3600000/60000);el.textContent=`${days} j ${hrs} h ${mins} min avant la sortie`;});}
// Découpage fondé sur la taille réelle des pages, pas sur un nombre approximatif de caractères.
// La mesure tient compte des paragraphes, de la police, de la largeur et de la hauteur disponibles.
async function paginate(text){
 const probe=$('#bookPage'),source=String(text||'').replace(/\r\n?/g,'\n').trim();
 if(!probe || !probe.clientHeight || !probe.clientWidth)return [source];
 // Mesurer sur une copie invisible : ne jamais afficher les essais dans la page de gauche.
 const rect=probe.getBoundingClientRect();
 const measure=probe.cloneNode(false);
 measure.removeAttribute('id');
 measure.removeAttribute('onclick');
 measure.style.cssText=`position:fixed!important;left:-20000px!important;top:0!important;visibility:hidden!important;pointer-events:none!important;transform:none!important;animation:none!important;width:${rect.width}px!important;height:${rect.height}px!important;min-height:0!important;max-height:${rect.height}px!important;overflow:hidden!important;flex:none!important;box-sizing:border-box!important;`;
 probe.parentNode.appendChild(measure);
 const result=[];let pos=0,iterations=0;
 const fits=end=>{measure.textContent=source.slice(pos,end);return measure.scrollHeight<=measure.clientHeight+1;};
 try{
  while(pos<source.length){
   const cap=Math.min(source.length,pos+1400);let lo=pos+1,hi=cap,best=pos;
   while(lo<=hi){const mid=Math.floor((lo+hi)/2);if(fits(mid)){best=mid;lo=mid+1;}else hi=mid-1;}
   if(best<=pos)best=Math.min(source.length,pos+1);
   if(best<source.length&&!/\s/.test(source[best-1])&&!/\s/.test(source[best])){
    const fragment=source.slice(pos,best),lastSpace=Math.max(fragment.lastIndexOf(' '),fragment.lastIndexOf('\n'));
    if(lastSpace>Math.floor(fragment.length*.55))best=pos+lastSpace+1;
   }
   const chunk=source.slice(pos,best).trim();
   if(chunk)result.push(chunk);
   pos=best;
   // Ne jamais fabriquer de pages pour des espaces ou des sauts de ligne restants.
   while(pos<source.length && /\s/.test(source[pos]))pos++;
   if(++iterations%5===0)await new Promise(resolve=>requestAnimationFrame(()=>resolve()));
  }
 }finally{measure.remove();}
 return result.length?result:[''];
}
// Marque-pages enregistrés par compte et par histoire (synchronisés sur Supabase).
let readerLoadVersion=0, bookmarkCache=new Map();
function bookmarkLocalKey(id){return 'nv-bookmark-'+(user?.id||'guest')+'-'+id;}
function getBookmark(id){return bookmarkCache.get(String(id))||JSON.parse(localStorage.getItem(bookmarkLocalKey(id))||'null');}
async function loadBookmark(id){
 if(!user||!db)return getBookmark(id);
 const {data,error}=await db.from('reading_bookmarks').select('chapter_index,page_index').eq('user_id',user.id).eq('story_id',id).maybeSingle();
 if(error){console.warn('Marque-page indisponible :',error.message);return getBookmark(id);}
 if(data){const mark={chapter:data.chapter_index,page:data.page_index};bookmarkCache.set(String(id),mark);localStorage.setItem(bookmarkLocalKey(id),JSON.stringify(mark));}
 else {bookmarkCache.delete(String(id));localStorage.removeItem(bookmarkLocalKey(id));}
 return getBookmark(id);
}
async function saveBookmark(){
 if(!activeStory)return;
 if(!user||!db){$('#bookmarkStatus').textContent='Connecte-toi pour enregistrer ton marque-page.';return;}
 const entry={chapter:activeChapter,page};
 const {error}=await db.from('reading_bookmarks').upsert({user_id:user.id,story_id:activeStory.id,chapter_index:entry.chapter,page_index:entry.page,updated_at:new Date().toISOString()},{onConflict:'user_id,story_id'});
 if(error){$('#bookmarkStatus').textContent='Erreur : '+error.message;return;}
 bookmarkCache.set(String(activeStory.id),entry);localStorage.setItem(bookmarkLocalKey(activeStory.id),JSON.stringify(entry));
 $('#bookmarkStatus').textContent='Marque-page enregistré : chapitre '+(activeChapter+1)+', page '+(page+1)+'.';
 $('#removeBookmark').hidden=false;
 await loadReadingList();
 // Le bouton de reprise est immédiatement disponible pour cette histoire.
 const resume=$('#detailResume');if(resume&&String(resume.dataset.storyId)===String(activeStory.id))resume.hidden=false;
}
// V7.1 : liste de lecture personnelle, chargée uniquement pour le compte connecté.
async function loadReadingList(){
 const section=$('#continueReading'),list=$('#continueList');if(!section||!list)return;
 section.hidden=true;list.replaceChildren();if(!user||!db)return;
 const currentUser=user.id;
 const {data,error}=await db.from('reading_bookmarks').select('story_id,chapter_index,page_index,updated_at').eq('user_id',currentUser).order('updated_at',{ascending:false});
 if(error){console.warn('Lectures en cours indisponibles :',error.message);return;}
 if(user?.id!==currentUser)return;
 const saved=(data||[]).map(m=>({mark:m,story:stories.find(s=>String(s.id)===String(m.story_id)&&!upcoming(s)&&s.chapters?.length)})).filter(x=>x.story);
 for(const {mark,story} of saved){
  const entry={chapter:mark.chapter_index,page:mark.page_index};bookmarkCache.set(String(story.id),entry);localStorage.setItem(bookmarkLocalKey(story.id),JSON.stringify(entry));
  const item=document.createElement('article');item.className='continue-card';
  const cover=document.createElement('div');cover.className='continue-cover';
  if(validCover(story.cover_url)){const img=document.createElement('img');img.src=story.cover_url;img.alt='Couverture de '+story.title;img.loading='lazy';cover.append(img);}else cover.textContent='✦';
  const content=document.createElement('div');content.className='continue-info';
  const title=document.createElement('h3');title.textContent=story.title;
  const meta=document.createElement('p');meta.textContent='Chapitre '+(entry.chapter+1)+' · Page '+(entry.page+1);
  const buttons=document.createElement('div');buttons.className='continue-actions';
  const resume=document.createElement('button');resume.type='button';resume.className='continue-resume';resume.textContent='Reprendre la lecture →';resume.onclick=()=>resumeReader(story.id);
  const remove=document.createElement('button');remove.type='button';remove.className='continue-remove';remove.textContent='Retirer';remove.setAttribute('aria-label','Retirer '+story.title+' des lectures en cours');remove.onclick=()=>removeReadingBookmark(story.id);
  buttons.append(resume,remove);content.append(title,meta,buttons);item.append(cover,content);list.append(item);
 }
 section.hidden=!saved.length;
}
async function removeReadingBookmark(id){
 if(!db||!user)return;
 if(!confirm('Supprimer définitivement le marque-page de cette histoire ?'))return;
 const {error}=await db.from('reading_bookmarks').delete().eq('user_id',user.id).eq('story_id',id);
 if(error){alert('Impossible de retirer le marque-page : '+error.message);return;}
 bookmarkCache.delete(String(id));localStorage.removeItem(bookmarkLocalKey(id));
 if(activeStory&&String(activeStory.id)===String(id)){$('#removeBookmark').hidden=true;$('#bookmarkStatus').textContent='Marque-page supprimé.';}
 const resume=$('#detailResume');if(resume&&String(resume.dataset.storyId)===String(id))resume.hidden=true;
 await loadReadingList();
}
async function resumeReader(id){const mark=await loadBookmark(id);if(!mark){alert('Aucun marque-page enregistré pour cette histoire.');return;}await openReader(id,mark.chapter,false,mark.page);}

function readerStep(){return matchMedia('(max-width:760px)').matches?1:2;}
async function openReader(id,idx=0,restore=true,requestedPage=null){
 const s=stories.find(x=>String(x.id)===String(id));if(!s||!s.chapters[idx]||upcoming(s)&&!isAdmin)return;
 if($('#storyDetail').open)$('#storyDetail').close();
 activeStory=s;activeChapter=idx;
 $('#readerTitle').textContent=s.title;$('#readerMeta').textContent=`par ${authorOf(s)} · ${s.genre}`;
 $('#chapterSelect').innerHTML=s.chapters.map((c,i)=>`<option value="${i}" ${i===idx?'selected':''}>${esc(c.title)}</option>`).join('');
 const chapterBg=s.chapters[idx].background_url||s.cover_url;
 const background=validCover(chapterBg)?`url("${chapterBg.replace(/["\\\\]/g,'')}")`:'none';
 $('#reader').style.setProperty('--chapter-bg',background);
 if(!$('#reader').open)$('#reader').showModal();$('#bookmarkStatus').textContent='';
 $('#removeBookmark').hidden=true;loadBookmark(s.id).then(mark=>{if(activeStory&&String(activeStory.id)===String(s.id))$('#removeBookmark').hidden=!mark;});
 // La boîte doit être visible avant de mesurer ses pages.
 const key='nv-progress-'+s.id+'-'+idx;
 const saved=requestedPage!==null?Number(requestedPage):(restore?Number(localStorage.getItem(key)||0):0);
 const thisLoad=++readerLoadVersion;$('#pageIndicator').textContent='Préparation des pages…';
 const newPages=await paginate(s.chapters[idx].text);
 if(thisLoad!==readerLoadVersion||!$('#reader').open)return;
 pages=newPages.filter((part,i)=>part.trim().length>0 || (i===0&&newPages.length===1));
 page=Math.max(0,Math.min(Math.floor(saved/readerStep())*readerStep(),pages.length-1));
 drawPage();
}
function openStoryDetail(id){
 const s=stories.find(x=>String(x.id)===String(id));
 if(!s || (upcoming(s)&&!isAdmin))return;
 const n=counts(s.id),cover=validCover(s.cover_url)?s.cover_url:null;
 const chosenBackground=s.chapters[0]?.background_url&&validCover(s.chapters[0].background_url)?s.chapters[0].background_url:cover;
 $('#storyDetail').style.setProperty('--detail-bg',chosenBackground?`url("${chosenBackground.replace(/["\\\\]/g,'')}")`:'none');
 $('#detailCover').innerHTML=cover?`<img src="${esc(cover)}" alt="Couverture de ${esc(s.title)}">`:'<span class="detail-no-cover">✦</span>';
 $('#detailTitle').textContent=s.title;
 $('#detailAuthor').textContent='Écrit par '+authorOf(s);
 $('#detailTags').innerHTML=`<span>${esc(s.story_format||'Roman')}</span><span>${esc(s.genre||'Autre')}</span>`;
 $('#detailSummary').textContent=s.description||'Aucun résumé disponible pour cette histoire.';
 $('#detailStats').innerHTML=`<button type="button" data-like="${esc(s.id)}">${n.mine?.liked?'❤️':'🤍'} ${n.likes} j’aime</button><span>⭐ ${n.votes?n.avg.toFixed(1)+'/5 ('+n.votes+' notes)':'Pas encore de note'}</span>`;
 $('#detailRating').innerHTML='<span>Ta note : </span>'+[1,2,3,4,5].map(i=>`<button type="button" data-rate="${esc(s.id)}" data-score="${i}" aria-label="Noter ${i} sur 5" class="${(n.mine?.rating||0)>=i?'selected':''}">★</button>`).join('');
 $('#detailChapterCount').textContent=s.chapters.length+' chapitre'+(s.chapters.length>1?'s':'')+' disponible'+(s.chapters.length>1?'s':'');
 $('#detailRead').disabled=!s.chapters.length;
 $('#detailRead').onclick=()=>openReader(s.id,0,false,0);
 const resume=$('#detailResume');resume.dataset.storyId=String(s.id);resume.hidden=!getBookmark(s.id);resume.onclick=()=>resumeReader(s.id);
 loadBookmark(s.id).then(mark=>{if($('#storyDetail').open&&String(resume.dataset.storyId)===String(s.id))resume.hidden=!mark;}).catch(console.error);
 $('#detailReviews').onclick=()=>{ $('#storyDetail').close();openReviews(s.id); };
 if(!$('#storyDetail').open)$('#storyDetail').showModal();
}
function drawPage(direction=0){
 if(!activeStory)return;
 const left=$('#bookPage'),right=$('#bookPageRight'),spread=readerStep();
 left.classList.remove('flip-next','flip-prev');right.classList.remove('flip-next','flip-prev');
 left.textContent=pages[page]||'';right.textContent=spread===2?(pages[page+1]||''):'';
 right.hidden=spread===1;
 if(direction&&cfg.animations){const flipping=direction>0?right:left;void flipping.offsetWidth;flipping.classList.add(direction>0?'flip-next':'flip-prev');}
 $('#pageIndicator').textContent=spread===2?`Pages ${page+1}${page+1<pages.length?'–'+Math.min(page+2,pages.length):''} / ${pages.length}`:`Page ${page+1} / ${pages.length}`;
 $('#prevPage').disabled=page===0&&activeChapter===0;
 $('#nextPage').disabled=page+spread>=pages.length&&activeChapter===activeStory.chapters.length-1;
 localStorage.setItem('nv-progress-'+activeStory.id+'-'+activeChapter,page);
}
async function turn(dir){
 if(!activeStory)return;const step=readerStep();const nextPage=page+dir*step;
 if(nextPage>=0&&nextPage<pages.length){page=nextPage;drawPage(dir);}
 else{const next=activeChapter+dir;if(next>=0&&next<activeStory.chapters.length){await openReader(activeStory.id,next,false);if(dir<0){page=Math.floor((pages.length-1)/step)*step;drawPage(dir);}}}
}
// Recherche globale : résultats instantanés sans changement de page.
function updateGlobalSearch(){
 const q=$('#globalSearchInput').value.trim().toLocaleLowerCase('fr');
 const results=$('#globalSearchResults');
 if(!q){results.innerHTML='<p class="search-help">Écris le titre d’une histoire ou le pseudo d’un auteur.</p>';return;}
 const found=stories.filter(st=>!upcoming(st)||isAdmin).filter(st=>[st.title,authorOf(st),st.genre,st.story_format].join(' ').toLocaleLowerCase('fr').includes(q)).slice(0,20);
 results.innerHTML=found.length?found.map(st=>`<button type="button" class="global-search-result" data-search-story="${esc(st.id)}"><strong>${esc(st.title)}</strong><small>par ${esc(authorOf(st))} · ${esc(st.genre||'Histoire')}</small></button>`).join(''):'<p class="search-help">Aucune histoire trouvée.</p>';
}
$('#headerSearch').onclick=()=>{const dlg=$('#globalSearchDialog');if(!dlg.open)dlg.showModal();$('#globalSearchInput').value='';updateGlobalSearch();$('#globalSearchInput').focus();};
$('#globalSearchInput').addEventListener('input',updateGlobalSearch);
$('#globalSearchResults').addEventListener('click',e=>{const b=e.target.closest('[data-search-story]');if(!b)return;$('#globalSearchDialog').close();openStoryDetail(b.dataset.searchStory);});
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();$('#headerSearch').click();}});$('#saveBookmark').onclick=saveBookmark;$('#removeBookmark').onclick=()=>{if(activeStory)removeReadingBookmark(activeStory.id);};$('#search').addEventListener('input',render);$('#genre').addEventListener('change',render);$('#format').addEventListener('change',render);$('#sort').addEventListener('change',render);$('#year').textContent=new Date().getFullYear();$('#siteSeasonSelect').onchange=saveSiteTheme;$('#siteSeasonApply').onclick=saveSiteTheme;$('#bdayClose').onclick=()=>{try{sessionStorage.setItem('nv-bday-closed',bdayKey());}catch(e){}renderBirthdayBanner();};$('#themeSetting').onchange=e=>setSetting('theme',e.target.value);$('#animationsSetting').onchange=e=>setSetting('animations',e.target.checked);$('#fontSetting').oninput=e=>setSetting('font',Number(e.target.value));
$('#accountButton').onclick=()=>$('#accountDialog').showModal();$('#settingsButton').onclick=()=>$('#settingsDialog').showModal();$('#loginForm').onsubmit=async e=>{e.preventDefault();if(!db)return alert('Connexion indisponible sans Supabase.');const f=e.target;const {error}=await db.auth.signInWithPassword({email:f.elements.email.value,password:f.elements.password.value});$('#authStatus').textContent=error?error.message:'Connexion réussie.';if(!error)$('#accountDialog').close();};$('#registerForm').onsubmit=async e=>{e.preventDefault();if(!db)return;const f=e.target;const pseudo=f.elements.pseudo.value.trim();if(!/^[\p{L}\p{N}_-]{3,24}$/u.test(pseudo)){ $('#authStatus').textContent='Pseudo : 3 à 24 caractères, lettres, chiffres, tiret ou underscore.';return;}const {error}=await db.auth.signUp({email:f.elements.email.value,password:f.elements.password.value,options:{data:{pseudo},emailRedirectTo:window.location.origin+'/'}});$('#authStatus').textContent=error?error.message:'Compte créé ! Vérifie ton e-mail si une confirmation est demandée.';};$('#logoutButton').onclick=async()=>{await db.auth.signOut();$('#accountDialog').close();};
$('#deleteMyAccount').onclick=async()=>{if(!user||!db)return;const typed=prompt('Suppression irréversible : écris SUPPRIMER pour confirmer la suppression de ton compte, de tes histoires et de tes données.');if(typed!=='SUPPRIMER')return;if(!confirm('Dernière confirmation : supprimer définitivement ton compte ?'))return;const {error}=await db.rpc('novelya_delete_account',{target_user:user.id});if(error){alert('Suppression impossible : '+error.message);return;}await db.auth.signOut();$('#accountDialog').close();alert('Ton compte a été supprimé.');location.reload();};
$('#prevPage').onclick=()=>turn(-1);$('#nextPage').onclick=()=>turn(1);$('#bookPage').onclick=()=>{if(!String(window.getSelection()).trim())turn(-1);};$('#bookPageRight').onclick=()=>{if(!String(window.getSelection()).trim())turn(1);};$('#chapterSelect').onchange=e=>openReader(activeStory.id,Number(e.target.value),true);
document.addEventListener('click',e=>{const like=e.target.closest('[data-like]');if(like){saveReaction(like.dataset.like,'like');return;}const rate=e.target.closest('[data-rate]');if(rate){saveReaction(rate.dataset.rate,'rating',Number(rate.dataset.score));return;}const d=e.target.closest('[data-detail]');if(d){openStoryDetail(d.dataset.detail);return;}const b=e.target.closest('[data-read]');if(b){openReader(b.dataset.read);return;}const f=e.target.closest('[data-feature]');if(f){const choices=stories.filter(s=>!upcoming(s)&&(s.visibility==='published'||!s.visibility)&&s.chapters.length).sort((a,b)=>counts(b.id).likes-counts(a.id).likes||counts(b.id).avg-counts(a.id).avg);if(choices.length){featureIndex=(featureIndex+Number(f.dataset.feature)+choices.length)%choices.length;renderFeatured();}}const close=e.target.closest('[data-close]');if(close)$('#'+close.dataset.close).close();});document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d)d.close();}));$('#readerBackdrop').addEventListener('click',()=>$('#reader').close());$('#storyDetail').addEventListener('click',e=>{if(e.target===$('#storyDetail'))$('#storyDetail').close();});document.addEventListener('keydown',e=>{if(!$('#reader').open||['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName))return;if(e.key==='ArrowRight')turn(1);if(e.key==='ArrowLeft')turn(-1);});window.addEventListener('resize',()=>{if(activeStory&&$('#reader').open)openReader(activeStory.id,activeChapter,true).catch(console.error);});setInterval(()=>{if(db){loadStories().catch(console.error);loadSiteTheme().catch(console.error);}else updateCountdowns();},30000);init();

// Profils, commentaires et propositions de publication : permissions vérifiées dans Supabase.
async function openReviews(id){const st=stories.find(x=>x.id===id);if(!st)return;$('#reviewsTitle').textContent='Avis — '+st.title;$('#reviewsStory').value=id;$('#reviewsDialog').showModal();await refreshReviews(id);}
async function refreshReviews(id){const box=$('#reviewsList');box.textContent='Chargement…';if(!db){box.textContent='Connexion indisponible.';return;}const {data,error}=await db.from('story_comments').select('id,body,created_at,user_id').eq('story_id',id).eq('status','approved').order('created_at',{ascending:false}).limit(100);if(error){box.textContent='Commentaires indisponibles : '+error.message;return;}box.innerHTML=(data||[]).map(c=>`<article class="review-item"><b>${esc(publicProfiles.find(p=>p.user_id===c.user_id)?.pseudo||'Lecteur')}</b> <small>${new Date(c.created_at).toLocaleDateString('fr-FR')}</small><p>${esc(c.body)}</p><button type="button" data-report-comment="${esc(c.id)}">Signaler</button></article>`).join('')||'<p>Pas encore de commentaires approuvés.</p>';}
$('#reviewForm').onsubmit=async e=>{e.preventDefault();if(!user)return $('#accountDialog').showModal();const f=e.target,body=f.elements.body.value.trim();if(body.length<3||body.length>1500)return alert('Commentaire entre 3 et 1500 caractères.');const {error}=await db.from('story_comments').insert({story_id:$('#reviewsStory').value,user_id:user.id,body});$('#reviewStatus').textContent=error?error.message:'Commentaire envoyé à la modération. Il sera visible après validation.';if(!error)f.reset();};
$('#renameForm').onsubmit=async e=>{e.preventDefault();if(!db||!user)return;const pseudo=e.target.elements.pseudo.value.trim();const {error}=await db.rpc('change_my_pseudo',{new_pseudo:pseudo});$('#renameStatus').textContent=error?error.message:'Pseudonyme modifié.';if(!error){await loadProfile();await loadStories();}};
$('#submitStoryForm').onsubmit=async e=>{e.preventDefault();if(!user)return $('#accountDialog').showModal();const f=e.target;const payload={p_title:f.elements.title.value.trim(),p_description:f.elements.description.value.trim(),p_genre:f.elements.genre.value,p_format:f.elements.story_format.value,p_body:f.elements.body.value.trim()};const {error}=await db.rpc('submit_story_for_review',payload);$('#submitStoryStatus').textContent=error?error.message:'Histoire enregistrée. Publication automatique si aucun problème n’a été détecté ; sinon vérification admin.';if(!error){f.reset();await loadStories();}};
document.addEventListener('click',async e=>{const reviews=e.target.closest('[data-reviews]');if(reviews){openReviews(reviews.dataset.reviews);return;}const report=e.target.closest('[data-report-comment]');if(report){if(!user){$('#accountDialog').showModal();return;}const reason=prompt('Pourquoi signales-tu ce commentaire ?');if(!reason||reason.trim().length<5)return;const {error}=await db.from('comment_reports').insert({comment_id:report.dataset.reportComment,reporter_id:user.id,reason:reason.trim().slice(0,300)});alert(error?error.message:'Signalement transmis aux administrateurs.');}});

$('#submitStoryOpen').onclick=()=>$('#submitStoryDialog').showModal();

// Espace auteur : les RPC Supabase vérifient l'identité du propriétaire.
let authorStoryCache=[],authorChapterCache=[];
async function authorRefresh(){
 if(!user||!db)return;
 const [s,c]=await Promise.all([db.from('stories').select('*').eq('owner_id',user.id).order('created_at',{ascending:false}),db.from('chapters').select('*')]);
 const status=$('#authorStatus');if(s.error||c.error){status.textContent=(s.error||c.error).message;return;}
 authorStoryCache=s.data||[];authorChapterCache=c.data||[];
 $('#myStoriesList').innerHTML=authorStoryCache.map(st=>`<div class="author-item"><b>${esc(st.title)}</b> — ${esc(st.visibility)}<div><button type="button" class="outline" data-author-edit="${esc(st.id)}">✏️ Modifier</button> <button type="button" class="outline" data-author-chapters="${esc(st.id)}">Chapitres</button></div></div>`).join('')||'<p>Tu n’as pas encore proposé d’histoire.</p>';
}
$('#myStoriesOpen').onclick=async()=>{$('#myStoriesDialog').showModal();await authorRefresh();};
async function authorUpload(file){if(!file)return null;if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5*1024*1024)throw Error('Image JPG, PNG ou WebP de 5 Mo maximum.');const ext={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'}[file.type];const path=`authors/${user.id}/${crypto.randomUUID()}.${ext}`;const {error}=await db.storage.from('covers').upload(path,file,{contentType:file.type});if(error)throw error;return db.storage.from('covers').getPublicUrl(path).data.publicUrl;}
document.addEventListener('click',e=>{
 const edit=e.target.closest('[data-author-edit]');if(edit){const st=authorStoryCache.find(s=>String(s.id)===edit.dataset.authorEdit);if(!st)return;const f=$('#authorStoryForm');f.hidden=false;for(const k of ['title','description','genre','story_format'])f.elements[k].value=st[k]||'';f.elements.story_id.value=st.id;$('#authorChapterForm').hidden=true;}
 const chapters=e.target.closest('[data-author-chapters]');if(chapters){const st=authorStoryCache.find(s=>String(s.id)===chapters.dataset.authorChapters);if(!st)return;const f=$('#authorChapterForm');f.hidden=false;f.reset();f.elements.story_id.value=st.id;f.elements.chapter_id.value='';$('#authorChapterHeading').textContent='Ajouter un chapitre à « '+st.title+' »';$('#authorChapterForm').scrollIntoView({behavior:'smooth',block:'center'});const list=authorChapterCache.filter(c=>String(c.story_id)===String(st.id));$('#authorStatus').innerHTML=list.map(c=>`<button type="button" class="outline" data-author-chapter-edit="${esc(c.id)}">${esc(c.title)}</button>`).join(' ')||'Aucun chapitre.';}
 const ch=e.target.closest('[data-author-chapter-edit]');if(ch){const c=authorChapterCache.find(x=>String(x.id)===ch.dataset.authorChapterEdit);if(!c)return;const f=$('#authorChapterForm');f.hidden=false;f.elements.story_id.value=c.story_id;f.elements.chapter_id.value=c.id;f.elements.title.value=c.title;f.elements.body.value=c.body;$('#authorChapterHeading').textContent='Modifier le chapitre';$('#authorChapterForm').scrollIntoView({behavior:'smooth',block:'center'});}
});
$('#authorStoryForm').onsubmit=async e=>{e.preventDefault();const f=e.target;$('#authorStatus').textContent='Enregistrement…';try{const st=authorStoryCache.find(s=>String(s.id)===f.elements.story_id.value);const cover=await authorUpload(f.elements.cover.files[0]);const {error}=await db.rpc('novelya_author_edit_story',{target:st.id,new_title:f.elements.title.value,new_description:f.elements.description.value,new_genre:f.elements.genre.value,new_format:f.elements.story_format.value,new_cover:cover||st.cover_url||null});if(error)throw error;$('#authorStatus').textContent='Histoire enregistrée.';await authorRefresh();await loadStories();}catch(err){$('#authorStatus').textContent='Erreur : '+err.message;}};
$('#authorChapterCancel').onclick=()=>{$('#authorChapterForm').hidden=true;$('#authorStatus').textContent='';};
$('#authorChapterForm').onsubmit=async e=>{e.preventDefault();const f=e.target;$('#authorStatus').textContent='Enregistrement du chapitre…';try{const old=authorChapterCache.find(c=>String(c.id)===f.elements.chapter_id.value);const background=await authorUpload(f.elements.background.files[0]);const {error}=await db.rpc('novelya_author_save_chapter',{target_story:f.elements.story_id.value,target_chapter:f.elements.chapter_id.value||null,new_title:f.elements.title.value,new_body:f.elements.body.value,new_background:background||old?.background_url||null});if(error)throw error;$('#authorStatus').textContent='Chapitre enregistré. Si un mot blacklist est détecté, l’histoire reste en attente de validation admin.';await authorRefresh();await loadStories();$('#authorChapterForm').hidden=true;}catch(err){$('#authorStatus').textContent='Erreur : '+err.message;}};
async function presencePing(){if(!db||!user||document.hidden)return;try{await db.from('novelya_presence').upsert({user_id:user.id,last_seen:new Date().toISOString()},{onConflict:'user_id'});}catch(e){console.warn('Présence indisponible',e);}}
setInterval(presencePing,45000);setTimeout(presencePing,2000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)presencePing();});

/* Carte « À découvrir » : ouverture fiable dès le premier clic */
(function(){
 const box=document.getElementById('featuredStories');if(!box)return;
 let downId=null;
 box.addEventListener('pointerdown',e=>{const b=e.target.closest('.feature-book');downId=b?b.dataset.detail:null;window.__featDown=true;});
 const release=()=>{setTimeout(()=>{window.__featDown=false;},60);};
 window.addEventListener('pointerup',release);window.addEventListener('pointercancel',release);
 box.addEventListener('pointerup',e=>{
  const b=e.target.closest('.feature-book');
  if(b&&downId&&b.dataset.detail===downId){e.preventDefault();downId=null;box.dataset.handled='1';setTimeout(()=>{delete box.dataset.handled;},400);openStoryDetail(b.dataset.detail);}
 });
 // évite l'ouverture en double avec le gestionnaire de clic global
 box.addEventListener('click',e=>{if(box.dataset.handled&&e.target.closest('.feature-book')){e.stopImmediatePropagation();e.stopPropagation();}},true);
})();
