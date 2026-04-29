export interface Project {
  id: string;
  title: string;
  description: string;
  category: "Security Tools" | "Bug Bounty" | "Vulnerability Research" | "Full-Stack";
  tech: string[];
  github?: string;
  demo?: string;
  featured: boolean;
  date: string;
  challenge?: string;
}

export interface Certification {
  id: string;
  title: string;
  fullName: string;
  issuer: string;
  date: string;
  status: "earned" | "in-progress" | "planned";
  icon?: string;
}

export interface Skill {
  name: string;
  level?: number;
}

export interface SkillCategory {
  title: string;
  skills: Skill[];
}

export interface HBox {
  name: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Insane";
  os: "Linux" | "Windows";
  tags: string[];
}

export interface Resource {
  title: string;
  description: string;
  url: string;
  category: "fork" | "reference" | "learning";
}

export interface SocialLink {
  label: string;
  href: string;
  icon: string;
}
