import {redirect} from "next/navigation";
export const metadata={title:"Korean Companion — Hallium",description:"Continue Hallium's existing everyday Korean lessons without resetting your progress."};
export default function KoreanCompanion(){redirect("/?view=companion")}
