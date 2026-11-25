(function(){
var d=document,h=d.documentElement,w=window;
var RM=matchMedia('(prefers-reduced-motion:reduce)').matches,ED=h.classList.contains('ed');
var $=function(s,r){return (r||d).querySelector(s)},$$=function(s,r){return Array.prototype.slice.call((r||d).querySelectorAll(s))};
function ready(){d.body.classList.add('ready')}
/* intro */
if(h.classList.contains('intro-on')){
  var done=false,fin=function(){if(done)return;done=true;h.classList.add('intro-out');setTimeout(ready,250);setTimeout(function(){h.classList.remove('intro-on','intro-out')},1100)};
  setTimeout(fin,2700);d.addEventListener('visibilitychange',function(){if(d.hidden)fin()});
  $('.intro')&&$('.intro').addEventListener('click',fin);
}else ready();
/* header */
var hd=$('#hd');function onS(){if(hd)hd.classList.toggle('solid',w.scrollY>30)}
/* contact card from the logo */
var hm=$('.hm'),card=$('#card');
function setCard(o){if(!card)return;card.classList.toggle('open',o);hm.setAttribute('aria-expanded',o?'true':'false')}
if(hm&&card){
  hm.addEventListener('click',function(e){e.stopPropagation();hm.classList.remove('spin');void hm.offsetWidth;hm.classList.add('spin');setTimeout(function(){hm.classList.remove('spin')},1250);setCard(!card.classList.contains('open'))});
  $('.card-x',card).addEventListener('click',function(){setCard(false);hm.focus()});
  d.addEventListener('click',function(e){if(card.classList.contains('open')&&!card.contains(e.target))setCard(false)});
  d.addEventListener('keydown',function(e){if(e.key==='Escape'){setCard(false);closeMn();closeLb()}});
}
/* mobile menu */
var bg=$('.bg'),mn=$('#mn');
function closeMn(){if(!mn)return;mn.classList.remove('open');mn.setAttribute('aria-hidden','true');bg&&bg.setAttribute('aria-expanded','false');d.body.style.overflow=''}
if(bg&&mn){bg.addEventListener('click',function(){var o=!mn.classList.contains('open');mn.classList.toggle('open',o);mn.setAttribute('aria-hidden',o?'false':'true');bg.setAttribute('aria-expanded',o?'true':'false');d.body.style.overflow=o?'hidden':''});$$('a',mn).forEach(function(a){a.addEventListener('click',closeMn)})}
/* music */
var mu=$('.mu'),au=null,fadeT;
function store(k,v){try{if(v==null)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){return null}}
function fadeTo(v,ms,cb){clearInterval(fadeT);var s=au.volume,st=Date.now();fadeT=setInterval(function(){var p=Math.min(1,(Date.now()-st)/ms);au.volume=s+(v-s)*p;if(p>=1){clearInterval(fadeT);cb&&cb()}},40)}
function play(){if(!au){au=new Audio(mu.getAttribute('data-src'));au.loop=true;au.preload='auto';au.volume=0}var p=au.play();if(p&&p.catch)p.catch(function(){setMu(false)});fadeTo(.32,2600);setMu(true)}
function stop(){if(!au)return setMu(false);fadeTo(0,900,function(){au.pause()});setMu(false)}
function setMu(o){mu.setAttribute('aria-pressed',o?'true':'false')}
if(mu&&!ED){
  mu.addEventListener('click',function(){var on=mu.getAttribute('aria-pressed')!=='true';on?play():stop();store('mm-music',on?'1':'0')});
  var pref=store('mm-music');
  if(pref==='1'){var once=function(e){if(e.target.closest&&e.target.closest('.mu'))return;play();rm()},rm=function(){d.removeEventListener('pointerdown',once,true);d.removeEventListener('keydown',once,true)};d.addEventListener('pointerdown',once,true);d.addEventListener('keydown',once,true)}
  else if(pref==null){setTimeout(function(){mu.classList.add('hint')},4200)}
}
/* reveals */
var rv=$$('.rv');
if(ED||RM||!('IntersectionObserver' in w)||d.hidden){rv.forEach(function(e){e.classList.add('in')})}
else{var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{rootMargin:'0px 0px -8% 0px',threshold:.04});rv.forEach(function(e){io.observe(e)});setTimeout(function(){rv.forEach(function(e){var r=e.getBoundingClientRect();if(r.top<innerHeight&&r.bottom>0)e.classList.add('in')})},3200)}
/* 3D marks: pause off screen, follow the pointer */
var big=$$('.bya-m,.sh-m');
if('IntersectionObserver' in w){var io2=new IntersectionObserver(function(es){es.forEach(function(e){e.target.classList.toggle('paused',!e.isIntersecting)})});big.concat($$('.hd-l')).forEach(function(e){io2.observe(e)})}
if(!RM&&matchMedia('(hover:hover) and (pointer:fine)').matches){big.forEach(function(b){var m=$('.m3',b);b.addEventListener('pointermove',function(e){var r=b.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;m.style.transform='rotateX('+(-y*16)+'deg) rotateZ('+(x*4)+'deg)'});b.addEventListener('pointerleave',function(){m.style.transform=''});m.style.transition='transform .9s cubic-bezier(.22,.61,.36,1)'})}
/* sessions thread drawn by scroll */
var xs=$('.xs'),th=xs&&$('.thread path',xs);
function onThread(){if(!th)return;var r=xs.getBoundingClientRect(),p=Math.min(1,Math.max(0,(innerHeight*.6-r.top)/r.height));th.style.setProperty('--th',(1-p).toFixed(4))}
var tick=false;w.addEventListener('scroll',function(){if(tick)return;tick=true;requestAnimationFrame(function(){tick=false;onS();onThread()})},{passive:true});onS();onThread();
/* lightbox */
var lb=$('.lbx'),lbi=lb&&$('img',lb),lbc=lb&&$('.lbx-c',lb),last=null;
function closeLb(){if(!lb||lb.hidden)return;lb.classList.remove('open');setTimeout(function(){lb.hidden=true;lbi.removeAttribute('src')},300);d.body.style.overflow='';last&&last.focus&&last.focus()}
if(lb){$$('img[data-view]').forEach(function(im){var t=im.closest('figure,.po-fi')||im;t.style.cursor='zoom-in';t.addEventListener('click',function(){if(ED)return;last=t;var best=im.currentSrc||im.src,ss=im.getAttribute('srcset');if(ss){var c=ss.split(',').map(function(x){x=x.trim().split(/\s+/);return [parseInt(x[1]),x[0]]}).sort(function(a,b){return b[0]-a[0]});best=c[0][1]}lbi.src=best;lbi.alt=im.alt;lbc.textContent=im.alt;lb.hidden=false;requestAnimationFrame(function(){lb.classList.add('open')});d.body.style.overflow='hidden';$('.lbx-x',lb).focus()})});lb.addEventListener('click',function(e){if(e.target!==lbi)closeLb()})}
/* sessions composer */
$$('[data-pick]').forEach(function(a){a.addEventListener('click',function(){var n=+a.getAttribute('data-pick'),r=$$('.cmp input[name=path]')[n-1];if(r)r.checked=true})});
var f=$('.cmp');if(f)f.addEventListener('submit',function(e){e.preventDefault();var p=(f.querySelector('input[name=path]:checked')||{}).value||'',n=f.name.value.trim(),m=f.msg.value.trim(),en=h.lang==='en';
  var body=(en?'Hello,\n\nI am interested in: ':'Καλησπέρα σας,\n\nΜε ενδιαφέρει: ')+p+'\n\n'+(m?m+'\n\n':'')+(n||'');
  location.href='mailto:'+f.getAttribute('data-mail')+'?subject='+encodeURIComponent('.mer(made). — '+p)+'&body='+encodeURIComponent(body)});
/* copy link */
$$('.cp').forEach(function(b){b.addEventListener('click',function(){var u=b.getAttribute('data-url')||location.href;(navigator.clipboard?navigator.clipboard.writeText(u):Promise.reject()).then(function(){var t=b.textContent;b.textContent=h.lang==='en'?'Copied ✓':'Αντιγράφηκε ✓';setTimeout(function(){b.textContent=t},1800)},function(){})})});
/* trial discard */
$$('[data-trial-off]').forEach(function(b){b.addEventListener('click',function(){try{localStorage.removeItem('mm-trial')}catch(e){}location.reload()})});
})();
