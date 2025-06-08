import { BrainCircuit, BookOpenText, Microscope, Palette, Music, Globe, LucideIcon } from "lucide-react";

// This maps your subjects to specific icons and color gradients
export const getSubjectUI = (subject: string): { Icon: LucideIcon; gradientFrom: string; gradientTo: string; } => {
  const lowerSubject = subject.toLowerCase();
  if (lowerSubject.includes("math")) {
    return { Icon: BrainCircuit, gradientFrom: "from-blue-400", gradientTo: "to-purple-500" };
  }
  if (lowerSubject.includes("read") || lowerSubject.includes("story")) {
    return { Icon: BookOpenText, gradientFrom: "from-pink-400", gradientTo: "to-rose-500" };
  }
  if (lowerSubject.includes("science")) {
    return { Icon: Microscope, gradientFrom: "from-green-400", gradientTo: "to-emerald-500" };
  }
  if (lowerSubject.includes("art")) {
    return { Icon: Palette, gradientFrom: "from-orange-400", gradientTo: "to-red-500" };
  }
  if (lowerSubject.includes("music")) {
    return { Icon: Music, gradientFrom: "from-violet-400", gradientTo: "to-purple-500" };
  }
  // Default case
  return { Icon: Globe, gradientFrom: "from-cyan-400", gradientTo: "to-blue-500" };
};