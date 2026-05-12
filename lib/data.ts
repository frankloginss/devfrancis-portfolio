import type { Project, Certification, SkillCategory, HBox, Resource, SocialLink, BlogPost } from "./types";

// ============ SOCIAL LINKS ============

export const socialLinks: SocialLink[] = [
  { label: "GitHub", href: "https://github.com/frankloginss", icon: "github" },
  { label: "LinkedIn", href: "https://linkedin.com/in/francisuonyido392b27192", icon: "linkedin" },
  { label: "Email", href: "mailto:devfrancis04@gmail.com", icon: "mail" },
];

// ============ PROJECTS ============

export const projects: Project[] = [
  {
    id: "placeholder-tool-1",
    title: "[Tool Name]",
    description: "Automated reconnaissance tool combining subdomain enumeration, port scanning, and vulnerability detection for bug bounty workflows.",
    category: "Security Tools",
    tech: ["Python", "Nuclei", "Subfinder"],
    github: "https://github.com/frankloginss",
    featured: true,
    date: "2026-06-01",
    challenge: "Streamline the reconnaissance phase of bug bounty hunting into a single automated pipeline.",
  },
  {
    id: "placeholder-bugbounty-1",
    title: "[Bug Bounty: Vulnerability Name]",
    description: "Discovered and responsibly disclosed a critical vulnerability in a major web application. Full writeup pending public disclosure.",
    category: "Bug Bounty",
    tech: ["Burp Suite", "OWASP"],
    featured: true,
    date: "2026-05-15",
    challenge: "Identified an authentication bypass affecting thousands of users.",
  },
  {
    id: "placeholder-cve-1",
    title: "[CVE-XXXX-XXXX PoC]",
    description: "Proof-of-concept exploit for a discovered vulnerability. Developed and tested in a controlled lab environment.",
    category: "Vulnerability Research",
    tech: ["Python", "Exploit Development"],
    github: "https://github.com/frankloginss",
    featured: false,
    date: "2026-04-01",
    challenge: "Developed a reliable exploit chain from initial vulnerability discovery to full system compromise.",
  },
  // TODO: Add real projects here. Remove placeholders.
];

// ============ CERTIFICATIONS ============

export const certifications: Certification[] = [
  {
    id: "htb-academy-apps",
    title: "HTB Academy",
    fullName: "Attacking Common Applications",
    issuer: "HackTheBox",
    date: "2025-12-01",
    status: "earned",
  },
  {
    id: "oscp",
    title: "OSCP",
    fullName: "Offensive Security Certified Professional",
    issuer: "OffSec",
    date: "",
    status: "planned",
  },
  {
    id: "htb-cpts",
    title: "HTB CPTS",
    fullName: "Hack The Box Certified Penetration Tester Specialist",
    issuer: "HackTheBox",
    date: "",
    status: "in-progress",
    image: "/certs/htb-cpts.png",
  },
];

// ============ SKILLS ============

export const skillCategories: SkillCategory[] = [
  {
    title: "Offensive Security",
    skills: [
      { name: "Penetration Testing", level: 90 },
      { name: "Web Application Security", level: 85 },
      { name: "Active Directory Exploitation", level: 75 },
      { name: "Network Pentesting", level: 80 },
      { name: "Bug Bounty Hunting", level: 70 },
    ],
  },
  {
    title: "Tools & Technologies",
    skills: [
      { name: "Burp Suite Pro" },
      { name: "Nuclei" },
      { name: "WPScan" },
      { name: "Metasploit Framework" },
      { name: "Python" },
      { name: "Bash" },
      { name: "Nmap" },
      { name: "HackTheBox" },
    ],
  },
  {
    title: "Methodology",
    skills: [
      { name: "OWASP Top 10 Testing" },
      { name: "CVE Research & Exploitation" },
      { name: "Privilege Escalation" },
      { name: "OSINT & Reconnaissance" },
    ],
  },
];

// ============ HTB MACHINES (Learning) ============

export const htbBoxes: HBox[] = [
  { name: "Cap", difficulty: "Easy", os: "Linux", tags: ["IDOR", "Capabilities"] },
  { name: "Kobold", difficulty: "Easy", os: "Linux", tags: ["LFI", "PrivEsc"] },
  { name: "DevArea", difficulty: "Medium", os: "Linux", tags: ["Web App", "Lateral Movement"] },
  { name: "Facts", difficulty: "Easy", os: "Linux", tags: ["OSINT", "Enumeration"] },
  { name: "Snapped", difficulty: "Easy", os: "Linux", tags: ["Backup Files", "Data Exposure"] },
  { name: "Garfield", difficulty: "Medium", os: "Linux", tags: ["Web Exploit", "Sudo"] },
  { name: "VariaType", difficulty: "Medium", os: "Linux", tags: ["Type Juggling", "PrivEsc"] },
  { name: "CCTV", difficulty: "Medium", os: "Linux", tags: ["Network", "Pivoting"] },
  { name: "Silentium", difficulty: "Easy", os: "Linux", tags: ["CVE Chain", "Flowise", "Gogs"] },
  { name: "Pirate", difficulty: "Medium", os: "Linux", tags: ["Active"] },
];

// ============ RESOURCES ============

export const resources: Resource[] = [
  {
    title: "HackTricks Cloud",
    description: "Fork with personal notes and additional techniques for cloud pentesting.",
    url: "https://github.com/frankloginss",
    category: "fork",
  },
  {
    title: "PayloadsAllTheThings",
    description: "Useful fork with custom payloads and methodology notes.",
    url: "https://github.com/frankloginss",
    category: "fork",
  },
  {
    title: "PortSwigger Web Security Academy",
    description: "Primary learning resource for web application security testing techniques.",
    url: "https://portswigger.net/web-security",
    category: "learning",
  },
  {
    title: "HackTricks",
    description: "Comprehensive pentesting methodology and technique reference.",
    url: "https://book.hacktricks.wiki/",
    category: "reference",
  },
  {
    title: "OWASP Testing Guide",
    description: "Standard methodology for web application security assessments.",
    url: "https://owasp.org/www-project-web-security-testing-guide/",
    category: "reference",
  },
];

// ============ BIO ============

export const bio = {
  name: "Francis Onyido",
  fullName: "Francis Onyido",
  tagline: "Security Researcher & Penetration Tester",
  summary:
    "Cybersecurity professional specializing in penetration testing, web application security, and vulnerability research. I actively hone my skills through HackTheBox, bug bounty programs, and building custom security tools. My focus areas include OWASP Top 10, Active Directory attacks, and developing automated reconnaissance frameworks.",
  resumeUrl: "#", // TODO: Add resume PDF link
};

// ============ BLOG POSTS ============

export const blogPosts: BlogPost[] = [
  {
    id: "htb-cap-walkthrough",
    title: "HackTheBox: Cap — Full Walkthrough",
    excerpt: "Exploiting an IDOR vulnerability to leak FTP credentials from PCAP captures, then escalating to root via misconfigured Linux capabilities on python3.8.",
    date: "2026-03-29",
    category: "Writeup",
    readTime: "8 min",
    tags: ["HackTheBox", "IDOR", "Capabilities", "PrivEsc", "Linux"],
    url: "/blog/htb-cap-walkthrough",
  },
  {
    id: "htb-devarea-walkthrough",
    title: "HTB — DevArea: CVE-2022-46364 to Root",
    excerpt: "Chaining CVE-2022-46364 (MTOM/XOP LFI) for credential theft, Hoverfly middleware RCE, and a world-writable /bin/bash for root via SUID python3.",
    date: "2026-03-30",
    category: "Writeup",
    readTime: "10 min",
    tags: ["HackTheBox", "CVE-2022-46364", "SOAP", "SUID", "Linux"],
    url: "/blog/htb-devarea-walkthrough",
  },
  {
    id: "htb-pirate-walkthrough",
    title: "HTB — Pirate: Pre2k to Domain Admin",
    excerpt: "Full AD attack chain — Pre2k abuse, gMSA dump, Ligolo-ng pivot, RBCD via NTLM relay, WriteSPN abuse, and S4U2Proxy + altservice to Domain Admin. Zero CVEs.",
    date: "2026-04-26",
    category: "Writeup",
    readTime: "15 min",
    tags: ["HackTheBox", "Active Directory", "RBCD", "gMSA", "S4U2Proxy", "Windows"],
    url: "/blog/htb-pirate-walkthrough",
  },
  {
    id: "htb-silentium-walkthrough",
    title: "HTB — Silentium: Flowise RCE to Gogs Symlink Privesc",
    excerpt: "Chaining CVE-2025-58434 (Flowise token leak), CVE-2025-59528 (Flowise RCE), and CVE-2025-8110 (Gogs symlink write to root authorized_keys) for full system compromise.",
    date: "2026-05-04",
    category: "Writeup",
    readTime: "12 min",
    tags: ["HackTheBox", "CVE-2025-58434", "CVE-2025-59528", "CVE-2025-8110", "Flowise", "Gogs", "Linux"],
    url: "/blog/htb-silentium-walkthrough",
  },
];
