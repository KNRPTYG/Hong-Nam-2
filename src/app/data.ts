export interface Restroom {
  id: string;
  name: string;
  building: string;
  floor: string;
  location: string;
  facilities: string[];
  accessibility: string;
  notes: string;
  photo?: string;
  ratings?: number[];
}

export function fmtAvg(ratings?: number[]): string {
  if (!ratings || !Array.isArray(ratings) || ratings.length === 0) return "4.5";
  const sum = ratings.reduce((a, b) => a + b, 0);
  return (sum / ratings.length).toFixed(1);
}

export function ratingFor(r: Restroom): string {
  return fmtAvg(r?.ratings);
}

export const INITIAL_RESTROOMS: Restroom[] = [
  {
    id: "1",
    name: "ห้องน้ำชั้น 1 อาคารเรียนรวม",
    building: "อาคารเรียนรวม (CB)",
    floor: "ชั้น 1",
    location: "ข้างลิฟต์ตัวหน้า",
    facilities: ["สายฉีดชำระ", "กระดาษทิชชู่", "สบู่ล้างมือ"],
    accessibility: "รองรับผู้ใช้รถเข็น / มีราวจับ",
    notes: "สะอาด มีแม่บ้านดูแลตลอดวัน",
  },
  {
    id: "2",
    name: "ห้องน้ำชั้น 2 คณะวิศวกรรมศาสตร์",
    building: "คณะวิศวกรรมศาสตร์",
    floor: "ชั้น 2",
    location: "ฝั่งทิศตะวันออก",
    facilities: ["สายฉีดชำระ", "สบู่ล้างมือ"],
    accessibility: "ทั่วไป",
    notes: "คนใช้น้อย ทำความสะอาดสม่ำเสมอ",
  },
];
