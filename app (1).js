(()=>{
"use strict";
const K="gitscript:v3",$=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const ago=t=>{const s=(Date.now()-t)/1e3;return s<60?"just now":s<3600?(s/60|0)+"m ago":s<86400?(s/3600|0)+"h ago":(s/86400|0)+"d ago"};
const IC={"terminal-square":'<path d="m7 11 2-2-2-2M11 13h4"/><rect x="3" y="3" width="18" height="18" rx="2"/>',layers:'<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/>',globe:'<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20"/>',radio:'<circle cx="12" cy="12" r="2"/><path d="M16.2 7.8a6 6 0 0 1 0 8.4M7.8 16.2a6 6 0 0 1 0-8.4M19 5a10 10 0 0 1 0 14M5 19A10 10 0 0 1 5 5"/>',user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',plus:'<path d="M12 5v14M5 12h14"/>',save:'<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/>',trash:'<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>',copy:'<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/>',download:'<path d="M12 3v12m0 0-4-4m4 4 4-4M4 21h16"/>',upload:'<path d="M12 15V3m0 0L8 7m4-4 4 4M4 21h16"/>',search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',refresh:'<path d="M21 12a9 9 0 0 1-15 6.7L3 16M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M3 21v-5h5"/>',logout:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',zap:'<path d="M13 2 3 14h8l-1 8 10-12h-8z"/>',history:'<path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5M12 7v5l3 2"/>',back:'<path d="m15 18-6-6 6-6"/>',cloud:'<path d="M18 10a6 6 0 0 0-11.7-1.5A4.5 4.5 0 0 0 7 18h11a4 4 0 0 0 0-8z"/>'};
const i=(n,c="")=>`<svg class="ic ${c}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n]||""}</svg>`;
const EXT={lua:"lua",javascript:"js",python:"py",bash:"sh",html:"html",css:"css",json:"json",text:"txt"};
let S,mem,pend=0;
const U={tab:"lib",id:null,d:null,q:"",sort:"updated",nq:"",st:"off",net:{st:"idle",list:[],err:""}};
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const load=()=>{try{S=JSON.parse(localStorage.getItem(K))}catch(e){}S=S&&Array.isArray(S.scripts)?S:mem||{scripts:[],online:false,token:null,user:null}};
const save=()=>{mem=S;try{localStorage.setItem(K,JSON.stringify(S))}catch(e){toast("Browser storage is blocked or full. Download your scripts to keep them.")}};
const find=id=>S.scripts.find(s=>s.id===id);
function toast(m){const t=document.createElement("div");t.className="toast";t.innerHTML=i("zap","c")+"<span>"+esc(m)+"</span>";$("#toasts").appendChild(t);setTimeout(()=>{t.classList.add("out");setTimeout(()=>t.remove(),300)},4200)}
function ask(title,body,ok,cb){const m=document.createElement("div");m.className="modal";m.innerHTML=`<div class="card" role="dialog" aria-modal="true"><h3 class="h">${esc(title)}</h3><p class="mute">${esc(body)}</p><div class="row"><button class="btn bad">${esc(ok)}</button><button class="btn">Cancel</button></div></div>`;document.body.appendChild(m);const b=m.querySelectorAll("button");b[0].onclick=()=>{m.remove();cb()};b[1].onclick=()=>m.remove();b[1].focus()}
const busy=d=>{pend+=d;$("#bar").className=pend>0?"on":""};
async function api(p,o={}){const c=new AbortController(),t=setTimeout(()=>c.abort(),8000);busy(1);
 try{const r=await fetch("/api/"+p,{method:o.method||"GET",signal:c.signal,headers:{"content-type":"application/json",...(S.token?{authorization:"Bearer "+S.token}:{})},body:o.body?JSON.stringify(o.body):undefined});
  let d={};try{d=await r.json()}catch(e){}
  if(!r.ok){if(r.status===401&&S.token&&p!=="login"&&p!=="signup"){S.token=S.user=null;save()}throw new Error(d.error||"Server returned "+r.status)}
  return d}
 catch(e){throw new Error(e.name==="AbortError"?"Server timed out":/fetch|network/i.test(e.message)?"Can’t reach the server":e.message)}
 finally{clearTimeout(t);busy(-1)}}

const isDirty=()=>{const s=find(U.id),d=U.d;return !!(s&&d&&(s.title!==d.title||s.desc!==d.desc||s.lang!==d.lang||s.code!==d.code))};
function top(){const lab=U.st==="busy"?"Connecting":S.online?(S.user?"@"+S.user:"Online"):"Offline";
 $("#top").innerHTML=`<div class="wrap hd"><button data-a="tab" data-v="lib" class="logo" aria-label="GitScript home"><img class="mk" src="logo.png" alt="" width="32" height="32"><b>git<span>script</span></b></button><nav class="nav"><button data-a="tab" data-v="lib" class="${U.tab!=="net"?"on":""}">${i("layers")}<span>Scripts</span></button><button data-a="tab" data-v="net" class="${U.tab==="net"?"on":""}">${i("globe")}<span>Network</span></button></nav><button data-a="pill" class="pill ${S.online?"live":""} ${U.st==="busy"?"busy":""}" aria-pressed="${S.online}" title="Turn online mode on or off">${i("radio")}<span>${esc(lab)}</span></button></div>`}
function card(s){return `<article class="card rp" data-a="ed" data-id="${s.id}" tabindex="0" role="button" aria-label="Open ${esc(s.title)}"><div class="row"><b>${esc(s.title)}</b><span class="sp"></span><span class="tag">${esc(s.lang)}</span></div><p class="mute">${esc(s.desc||"No description")}</p><div class="row sm mute"><span>${s.code.split("\n").length} lines</span><span>·</span><span>${ago(s.updated)}</span>${s.remote?`<span class="sp"></span><span class="tag net">${i("cloud")} on network</span>`:""}</div></article>`}
function lib(){const q=U.q.toLowerCase(),L=S.scripts.filter(s=>(s.title+" "+s.desc+" "+s.lang+" "+s.code).toLowerCase().includes(q)).sort((a,b)=>U.sort==="title"?a.title.localeCompare(b.title):b[U.sort]-a[U.sort]);
 const o=(v,l)=>`<option value="${v}" ${U.sort===v?"selected":""}>${l}</option>`;
 return `<div class="wrap"><div class="tools"><div class="sbox">${i("search")}<input id="sq" class="in" placeholder="Search scripts" aria-label="Search scripts" value="${esc(U.q)}"></div><select id="so" class="in" aria-label="Sort scripts">${o("updated","Recently updated")}${o("created","Newest")}${o("title","Title")}</select><button data-a="new" class="btn pri">${i("plus")}<span>New script</span></button></div>${L.length?`<div class="grid">${L.map(card).join("")}</div>`:`<div class="card empty"><h2 class="h" style="justify-content:center">${S.scripts.length?"No scripts match that search":"No scripts yet"}</h2><p>${S.scripts.length?"Try a different word.":"Write your first script. It saves in this browser, and you can publish it from the Network tab."}</p>${S.scripts.length?"":`<button data-a="new" class="btn pri">${i("plus")}Create a script</button>`}</div>`}</div>`}
function edit(){const s=find(U.id);if(!s){U.tab="lib";return lib()}const d=U.d;
 const L=Object.keys(EXT).map(l=>`<option ${l===d.lang?"selected":""}>${l}</option>`).join("");
 return `<div class="wrap"><div class="row" style="margin-bottom:.75rem"><button data-a="back" class="btn">${i("back")}Scripts</button><span id="dirty" class="tag warn" ${isDirty()?"":"hidden"}>Unsaved changes</span><span class="sp"></span>${s.remote?`<span class="tag net">${i("cloud")} on network</span>`:""}</div>
 <div class="card"><div class="fx"><div><label for="et">Title</label><input id="et" class="in" maxlength="60" value="${esc(d.title)}"></div><div><label for="el">Language</label><select id="el" class="in">${L}</select></div></div><label for="edesc">Description</label><input id="edesc" class="in" maxlength="160" value="${esc(d.desc)}" placeholder="What does this script do?">
 <div class="code"><pre class="gut" id="gut" aria-hidden="true"></pre><textarea id="ec" spellcheck="false" wrap="off" aria-label="Script code" placeholder="Write your script here">${esc(d.code)}</textarea></div>
 <div class="acts"><button data-a="save" class="btn pri">${i("save")}Save</button><button data-a="pub" class="btn">${i("upload")}${s.remote?"Update on network":"Publish"}</button><button data-a="copy" class="btn">${i("copy")}Copy</button><button data-a="dl" class="btn">${i("download")}Download</button><button data-a="dup" class="btn">${i("layers")}Duplicate</button><button data-a="del" class="btn bad">${i("trash")}Delete</button></div></div>
 <div class="card"><h3 class="h">${i("history")}Version history</h3>${s.rev.length?s.rev.map((r,k)=>`<div class="rev"><span>${new Date(r.t).toLocaleString()}</span><span class="mute sm">${r.code.split("\n").length} lines</span><span class="sp"></span><button data-a="rev" data-k="${k}" class="btn">Restore</button></div>`).join(""):`<p class="mute">Each time you save changed code, the previous version is kept here.</p>`}</div></div>`}
function netv(){const N=U.net;if(!S.online)return `<div class="wrap"><div class="card gate"><h2 class="h" style="justify-content:center">${i("globe")}Online mode is off</h2><p class="mute">Go online to publish scripts to the shared network and pull scripts other people published. Your local scripts keep working offline.</p><button data-a="pill" class="btn pri">${i("radio")}Go online</button></div></div>`;
 const auth=S.user?`<div class="card"><div class="row"><span>${i("user")} Signed in as <b class="c" style="color:var(--c)">@${esc(S.user)}</b></span><span class="sp"></span><button data-a="refresh" class="btn">${i("refresh")}Refresh</button><button data-a="logout" class="btn">${i("logout")}Log out</button></div></div>`:`<div class="card"><h2 class="h">${i("user")}Log in or create an account</h2><p class="mute sm">An account lets you publish and update scripts. Anyone can browse and pull public scripts without one.</p><div class="auth"><div><label for="au">Username</label><input id="au" class="in" autocomplete="username" maxlength="20" placeholder="3 to 20 letters, numbers, _"></div><div><label for="ap">Password</label><input id="ap" class="in" type="password" autocomplete="current-password" placeholder="At least 8 characters"></div></div><div class="row" style="margin-top:.75rem"><button data-a="login" class="btn pri">Log in</button><button data-a="signup" class="btn">Create account</button><span class="sp"></span><button data-a="refresh" class="btn">${i("refresh")}Refresh</button></div></div>`;
 const q=U.nq.toLowerCase(),L=N.list.filter(x=>((x.title||"")+(x.desc||"")+(x.author||"")+(x.lang||"")).toLowerCase().includes(q));
 const body=N.st==="load"?`<div class="empty mute">Loading scripts…</div>`:N.st==="err"?`<div class="card empty"><p>${esc(N.err)}</p><button data-a="refresh" class="btn">${i("refresh")}Try again</button></div>`:L.length?`<div class="grid">${L.map(x=>{const mine=x.author===S.user;return `<article class="card"><div class="row"><b>${esc(x.title)}</b><span class="sp"></span><span class="tag">${esc(x.lang)}</span></div><p class="mute">${esc(x.desc||"No description")}</p><div class="sm mute">by @${esc(x.author)} · ${x.lines} lines · ${ago(x.updated)}</div><div class="row"><button data-a="pull" data-id="${esc(x.id)}" class="btn">${i("download")}Pull</button>${mine?`<button data-a="unpub" data-id="${esc(x.id)}" class="btn bad">Unpublish</button><span class="tag net">yours</span>`:""}</div></article>`}).join("")}</div>`:`<div class="card empty"><h2 class="h" style="justify-content:center">${N.list.length?"No scripts match":"Nothing published yet"}</h2><p>${N.list.length?"Try a different search.":"Publish a script from the editor to start the network."}</p></div>`;
 return `<div class="wrap">${auth}<div class="tools" style="grid-template-columns:1fr"><div class="sbox">${i("search")}<input id="nq" class="in" placeholder="Search the network" aria-label="Search the network" value="${esc(U.nq)}"></div></div>${body}</div>`}
function render(){top();$("#app").innerHTML=U.tab==="edit"?edit():U.tab==="net"?netv():lib();if(U.tab==="edit")wire()}
function dirt(){const b=$("#dirty");if(b)b.hidden=!isDirty()}
function wire(){const t=$("#ec"),g=$("#gut"),num=()=>{g.textContent=Array.from({length:t.value.split("\n").length},(_,k)=>k+1).join("\n")};num();
 t.oninput=()=>{U.d.code=t.value;num();dirt()};t.onscroll=()=>{g.scrollTop=t.scrollTop};
 t.onkeydown=e=>{if(e.key==="Tab"){e.preventDefault();t.setRangeText("  ",t.selectionStart,t.selectionEnd,"end");t.oninput()}};
 $("#et").oninput=e=>{U.d.title=e.target.value;dirt()};$("#edesc").oninput=e=>{U.d.desc=e.target.value;dirt()};$("#el").onchange=e=>{U.d.lang=e.target.value;dirt()}}
function openEd(id){const s=find(id);U.tab="edit";U.id=id;U.d={title:s.title,desc:s.desc,lang:s.lang,code:s.code}}
function commit(){const s=find(U.id),d=U.d;if(!d.title.trim())d.title="untitled";if(s.code!==d.code){s.rev.unshift({t:Date.now(),code:s.code});s.rev=s.rev.slice(0,15)}Object.assign(s,{title:d.title.trim(),desc:d.desc.trim(),lang:d.lang,code:d.code,updated:Date.now()});save();return s}
async function refresh(){U.net.st="load";render();try{U.net.list=(await api("scripts")).sort((a,b)=>b.updated-a.updated);U.net.st="ready"}catch(e){U.net.st="err";U.net.err=e.message}render()}
async function connect(quiet){U.st="busy";render();
 try{const d=await api("ping");if(!d.ok)throw new Error("No GitScript backend found on this host");S.online=true;U.st="on";save();if(S.token)try{await api("me")}catch(e){}
  if(!quiet)toast(S.user?"Online as @"+S.user:"Online. Log in from the Network tab to publish.")}
 catch(e){S.online=false;U.st="off";save();toast(e.message+". Online mode needs the Cloudflare backend, see README.md.")}
 render();if(S.online&&U.tab==="net")refresh()}
async function auth(kind){const u=$("#au").value.trim(),p=$("#ap").value;if(!u||!p)return toast("Enter a username and password");
 try{const d=await api(kind,{method:"POST",body:{username:u,password:p}});S.token=d.token;S.user=d.user;save();toast(kind==="signup"?"Account created. Welcome, @"+d.user:"Logged in as @"+d.user);render();refresh()}catch(e){toast(e.message)}}
async function publish(){if(!S.online)return toast("Turn on Online mode first");if(!S.user){U.tab="net";render();return toast("Log in or create an account to publish")}
 const s=commit();try{const d=await api("scripts",{method:"POST",body:{id:s.remote,title:s.title,desc:s.desc,lang:s.lang,code:s.code}});s.remote=d.id;save();toast("Published to the network");render()}catch(e){toast(e.message);render()}}
async function pull(id){try{const d=await api("scripts/"+id),n=uid();S.scripts.unshift({id:n,title:d.title,desc:d.desc,lang:d.lang,code:d.code,created:Date.now(),updated:Date.now(),rev:[],remote:d.author===S.user?d.id:null});save();toast("Pulled “"+d.title+"” into your scripts");render()}catch(e){toast(e.message)}}
const A={
 tab:d=>{U.tab=d.v;if(d.v==="net"&&S.online){setTimeout(refresh,0)}},
 new:()=>{const t=Date.now(),s={id:uid(),title:"untitled",desc:"",lang:"lua",code:"",created:t,updated:t,rev:[],remote:null};S.scripts.unshift(s);save();openEd(s.id)},
 ed:d=>openEd(d.id),
 back:()=>{if(isDirty())return ask("Discard changes?","You have unsaved changes in this script.","Discard",()=>{U.tab="lib";render()}),false;U.tab="lib"},
 save:()=>{commit();toast("Saved");},
 del:()=>{const s=find(U.id);ask("Delete this script?","“"+s.title+"” and its history will be removed from this browser."+(s.remote?" Its public copy stays on the network until you unpublish it.":""),"Delete",()=>{S.scripts=S.scripts.filter(x=>x.id!==s.id);save();U.tab="lib";U.id=null;toast("Script deleted");render()});return false},
 dup:()=>{const s=commit(),t=Date.now(),n={...JSON.parse(JSON.stringify(s)),id:uid(),title:s.title+" copy",created:t,updated:t,rev:[],remote:null};S.scripts.unshift(n);save();openEd(n.id);toast("Duplicated")},
 copy:()=>{navigator.clipboard.writeText(U.d.code).then(()=>toast("Copied to clipboard"),()=>toast("Copy isn’t available here"));return false},
 dl:()=>{const b=new Blob([U.d.code],{type:"text/plain"}),a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=(U.d.title.trim()||"script").replace(/[^\w.-]+/g,"-")+"."+EXT[U.d.lang];a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1e3);return false},
 rev:d=>{U.d.code=find(U.id).rev[d.k].code;toast("Version restored. Press Save to keep it.")},
 pub:()=>{publish();return false},
 pill:()=>{if(S.online){S.online=false;U.st="off";save();toast("Offline mode. Local scripts still work.")}else{connect();return false}},
 refresh:()=>{refresh();return false},
 login:()=>{auth("login");return false},signup:()=>{auth("signup");return false},
 logout:()=>{S.token=S.user=null;save();toast("Logged out")},
 pull:d=>{pull(d.id);return false},
 unpub:d=>{ask("Unpublish this script?","It will be removed from the public network. Your local copy stays.","Unpublish",async()=>{try{await api("scripts/"+d.id,{method:"DELETE"});S.scripts.forEach(s=>{if(s.remote===d.id)s.remote=null});save();toast("Unpublished");refresh()}catch(e){toast(e.message)}});return false}
};
document.addEventListener("click",e=>{const el=e.target.closest("[data-a]");if(!el||!A[el.dataset.a])return;if(A[el.dataset.a](el.dataset)!==false){save();render()}});
document.addEventListener("keydown",e=>{const el=e.target;if((e.key==="Enter"||e.key===" ")&&el.matches&&el.matches("[role=button][data-a]")){e.preventDefault();el.click()}
 if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="s"&&U.tab==="edit"){e.preventDefault();A.save();render()}
 if(e.key==="Enter"&&el.id==="ap")auth("login")});
document.addEventListener("input",e=>{const id=e.target.id;if(id!=="sq"&&id!=="nq")return;if(id==="sq")U.q=e.target.value;else U.nq=e.target.value;const p=e.target.selectionStart;render();const n=$("#"+id);n.focus();n.setSelectionRange(p,p)});
document.addEventListener("change",e=>{if(e.target.id==="so"){U.sort=e.target.value;render()}});
window.addEventListener("beforeunload",e=>{if(U.tab==="edit"&&isDirty()){e.preventDefault();e.returnValue=""}});
load();render();if(S.online)connect(true);
})();
