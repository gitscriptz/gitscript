// Cloudflare Pages Function: GitScript accounts + shared script network.
// Needs a KV namespace bound to this project with the variable name GS.
const J=(d,s=200)=>new Response(JSON.stringify(d),{status:s,headers:{"content-type":"application/json","cache-control":"no-store"}});
const hex=b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("");
const rnd=n=>hex(crypto.getRandomValues(new Uint8Array(n)));
async function hash(pw,salt){
  const k=await crypto.subtle.importKey("raw",new TextEncoder().encode(pw),"PBKDF2",false,["deriveBits"]);
  return hex(await crypto.subtle.deriveBits({name:"PBKDF2",salt:new TextEncoder().encode(salt),iterations:100000,hash:"SHA-256"},k,256));
}
export async function onRequest({request,env}){
  if(!env.GS)return J({error:"KV binding GS is missing on the server"},500);
  const p=new URL(request.url).pathname.replace(/^\/api\/?/,"").split("/").filter(Boolean),m=request.method;
  const body=async()=>{try{return await request.json()}catch(e){return{}}};
  const auth=async()=>{const t=(request.headers.get("authorization")||"").replace("Bearer ","");return t?await env.GS.get("tok:"+t):null};
  try{
    if(p[0]==="ping")return J({ok:true});
    if(p[0]==="me"){const me=await auth();return me?J({user:me}):J({error:"Signed out"},401)}
    if(p[0]==="signup"||p[0]==="login"){
      const b=await body(),name=String(b.username||"").toLowerCase(),pw=String(b.password||"");
      if(!/^[a-z0-9_]{3,20}$/.test(name))return J({error:"Username must be 3 to 20 letters, numbers or underscores"},400);
      if(pw.length<8||pw.length>128)return J({error:"Password must be 8 to 128 characters"},400);
      const cur=await env.GS.get("user:"+name,"json");
      if(p[0]==="signup"){
        if(cur)return J({error:"That username is taken"},409);
        const salt=rnd(16);await env.GS.put("user:"+name,JSON.stringify({salt,hash:await hash(pw,salt)}));
      }else if(!cur||(await hash(pw,cur.salt))!==cur.hash)return J({error:"Wrong username or password"},401);
      const token=rnd(32);await env.GS.put("tok:"+token,name,{expirationTtl:2592000});
      return J({token,user:name});
    }
    if(p[0]==="scripts"){
      if(m==="GET"&&!p[1]){const l=await env.GS.list({prefix:"pub:",limit:1000});return J(l.keys.map(k=>({id:k.name.slice(4),...(k.metadata||{})})))}
      if(m==="GET"){const s=await env.GS.get("pub:"+p[1],"json");return s?J(s):J({error:"Script not found"},404)}
      const me=await auth();if(!me)return J({error:"Log in first"},401);
      if(m==="POST"){
        const b=await body(),code=String(b.code||"");
        if(code.length>60000)return J({error:"Script is over 60 KB"},413);
        let id=/^[a-z0-9]+$/.test(String(b.id||""))?b.id:null;
        if(id){const old=await env.GS.get("pub:"+id,"json");if(old&&old.author!==me)return J({error:"You don’t own that script"},403)}
        else id=Date.now().toString(36)+rnd(3);
        const meta={title:String(b.title||"untitled").slice(0,60),desc:String(b.desc||"").slice(0,160),lang:String(b.lang||"text").slice(0,12),author:me,updated:Date.now(),lines:code.split("\n").length};
        await env.GS.put("pub:"+id,JSON.stringify({...meta,id,code}),{metadata:meta});
        return J({id});
      }
      if(m==="DELETE"){
        const old=await env.GS.get("pub:"+p[1],"json");
        if(!old)return J({error:"Script not found"},404);
        if(old.author!==me)return J({error:"You don’t own that script"},403);
        await env.GS.delete("pub:"+p[1]);return J({ok:true});
      }
    }
    return J({error:"Not found"},404);
  }catch(e){return J({error:"Server error"},500)}
}
