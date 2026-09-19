import { ImageResponse } from "next/og";

export const alt = "Hallim — Structured Korean. Evidence-led progression.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div style={{
        width:"100%",height:"100%",display:"flex",flexDirection:"column",justifyContent:"space-between",
        padding:"72px 78px",background:"#f7f6f2",color:"#151821",fontFamily:"sans-serif"
      }}>
        <div style={{display:"flex",alignItems:"center",gap:18}}>
          <div style={{width:70,height:70,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:22,background:"#315dce",color:"white",fontSize:40,fontWeight:800}}>ㅎ</div>
          <div style={{display:"flex",alignItems:"baseline",gap:14}}>
            <span style={{fontSize:38,fontWeight:800}}>Hallim</span>
            <span style={{fontSize:24,color:"#6f7684"}}>한림</span>
          </div>
        </div>

        <div style={{display:"flex",flexDirection:"column"}}>
          <div style={{display:"flex",flexDirection:"column",fontSize:72,lineHeight:1.02,fontWeight:800,letterSpacing:"-3px",maxWidth:980}}>
            <span>Structured Korean.</span>
            <span>Evidence-led progression.</span>
          </div>
          <div style={{display:"flex",gap:14,marginTop:32}}>
            {["15 units","76 lessons + checkpoints","5 learning bands","Adaptive review"].map((x) => (
              <span key={x} style={{padding:"12px 16px",border:"1px solid #e7e5df",borderRadius:14,background:"white",fontSize:18,color:"#315dce",fontWeight:700}}>{x}</span>
            ))}
          </div>
        </div>

        <div style={{display:"flex",fontSize:20,color:"#6f7684"}}>hallium.vercel.app</div>
      </div>
    ),
    size,
  );
}
