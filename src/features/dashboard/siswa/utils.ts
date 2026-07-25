import { santriList } from "../../../data/santriData";

export function getSiswaProfile(userId: string) {
  const numericId = userId.match(/\d+/)?.[0]?.padStart(2, "0");
  const byLoginId = numericId
    ? santriList.find((item) => item.id.endsWith(`S${numericId}`))
    : null;
  return byLoginId ?? santriList[0];
}

export function shortId(id: string) {
  return id.replace("IN_HSIBS_", "");
}
