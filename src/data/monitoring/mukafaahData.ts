import { santriList } from "../santriData";

export interface MukafaahRecord {
  santriId: string;
  name: string;
  unit: string;
  loc: string;
  learnCompleted: number;
  targetLearn: number;
  projectsApproved: number;
  targetProjects: number;
  reportsOnTime: number;
  targetReports: number;
  adabScore: number;
  eligible: boolean;
  notes: string;
}

export function generateMukafaahData(): MukafaahRecord[] {
  return santriList.map((s) => {
    const learnCompleted = Math.floor(Math.random() * 4);
    const projectsApproved = Math.floor(Math.random() * 3);
    const reportsOnTime = Math.floor(Math.random() * 5);
    const adabScore = Math.floor(Math.random() * 3) + 2;
    const eligible = learnCompleted >= 3 && projectsApproved >= 1 && reportsOnTime >= 3 && adabScore >= 3;
    const reasons: string[] = [];
    if (learnCompleted < 3) reasons.push(`Learn ${learnCompleted}/3`);
    if (projectsApproved < 1) reasons.push(`Projek ${projectsApproved}/1`);
    if (reportsOnTime < 3) reasons.push(`Report ${reportsOnTime}/3`);
    if (adabScore < 3) reasons.push(`Adab ${adabScore}/5`);

    return {
      santriId: s.id,
      name: s.name,
      unit: s.unit,
      loc: s.loc,
      learnCompleted,
      targetLearn: 3,
      projectsApproved,
      targetProjects: 1,
      reportsOnTime,
      targetReports: 3,
      adabScore,
      eligible,
      notes: eligible ? "" : `Belum eligible: ${reasons.join(", ")}`,
    };
  });
}
