// Run explicitly with HALLIUM_BASE_URL=https://... node scripts/check-production.mjs
const target=process.env.HALLIUM_BASE_URL;
if(!target){console.error("Set HALLIUM_BASE_URL explicitly.");process.exitCode=2;}
else{
 const origin=new URL(target);
 if(origin.protocol!=="https:"&&!["localhost","127.0.0.1"].includes(origin.hostname)){throw Error("Use an HTTPS base URL.");}
 for(const [path,expect] of [["/api/health",200],["/offline",200],["/community",200]]){
  try{
   const response=await fetch(new URL(path,origin),{redirect:"manual",signal:AbortSignal.timeout(8000),headers:{"Cache-Control":"no-cache"}});
   const ok=response.status===expect;
   console.log(path,ok?"PASS":"FAIL",response.status);
   if(path==="/api/health"&&response.headers.get("cache-control")?.includes("no-store")!==true){console.log("FAIL health cache policy");process.exitCode=1;}
   if(!ok)process.exitCode=1;
  }catch(e){console.log(path,"FAIL",e.message);process.exitCode=1;}
 }
}
