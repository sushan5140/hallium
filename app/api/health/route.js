// Liveness only. Never expose secrets, user data, database details or deploy metadata.
export const dynamic="force-dynamic";
export function GET(){
 return Response.json({ok:true,service:"hallium"},{status:200,headers:{"Cache-Control":"no-store, max-age=0","X-Content-Type-Options":"nosniff"}});
}
