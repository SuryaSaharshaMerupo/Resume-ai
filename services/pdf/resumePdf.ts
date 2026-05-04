import { jsPDF } from "jspdf";

type SectionKey =
  | "summary"
  | "skills"
  | "experience"
  | "projects"
  | "education"
  | "certifications"
  | "achievements"
  | "coursework";

type FontStyle = "normal" | "bold" | "italic" | "bolditalic";

type ParsedResume = {
  name: string;
  contacts: string[];
  sections: Record<SectionKey, string[]>;
};

const SECTION_ORDER: SectionKey[] = [
  "summary",
  "skills",
  "experience",
  "projects",
  "education",
  "certifications",
  "achievements",
  "coursework",
];

const SECTION_TITLES: Record<SectionKey, string> = {
  summary: "Summary",
  skills: "Skills",
  experience: "Experience",
  projects: "Projects",
  education: "Education",
  certifications: "Certifications",
  achievements: "Achievements",
  coursework: "Relevant Coursework",
};

const SECTION_ALIASES = new Map<string, SectionKey>([
  ["SUMMARY", "summary"],
  ["PROFESSIONAL SUMMARY", "summary"],
  ["PROFILE", "summary"],
  ["OBJECTIVE", "summary"],
  ["CAREER OBJECTIVE", "summary"],
  ["SUMMARY / OBJECTIVE", "summary"],
  ["TAILORED SUMMARY", "summary"],
  ["SKILLS", "skills"],
  ["TECHNICAL SKILLS", "skills"],
  ["CORE SKILLS", "skills"],
  ["CORE COMPETENCIES", "skills"],
  ["TECHNOLOGIES", "skills"],
  ["TOOLS", "skills"],
  ["EXPERIENCE", "experience"],
  ["WORK EXPERIENCE", "experience"],
  ["PROFESSIONAL EXPERIENCE", "experience"],
  ["EMPLOYMENT HISTORY", "experience"],
  ["INTERNSHIP EXPERIENCE", "experience"],
  ["PROJECTS", "projects"],
  ["ACADEMIC PROJECTS", "projects"],
  ["PERSONAL PROJECTS", "projects"],
  ["EDUCATION", "education"],
  ["ACADEMIC BACKGROUND", "education"],
  ["CERTIFICATIONS", "certifications"],
  ["CERTIFICATES", "certifications"],
  ["LICENSES", "certifications"],
  ["ACHIEVEMENTS", "achievements"],
  ["AWARDS", "achievements"],
  ["HONORS", "achievements"],
  ["RELEVANT COURSEWORK", "coursework"],
  ["COURSEWORK", "coursework"],
]);

const JUNK_LINE_PATTERNS = [
  /^configure groq_api_key/i,
  /^aligned this resume with the role by emphasizing:/i,
  /^local ai fallback/i,
  /^edit note applied locally:/i,
];

const EMAIL_REGEX = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const PHONE_REGEX = /(?:\+?\d[\d\s().-]{7,}\d)/g;
const LINK_REGEX =
  /(?:https?:\/\/)?(?:www\.)?(?:linkedin\.com|github\.com|gitlab\.com|behance\.net|dribbble\.com|medium\.com|kaggle\.com|leetcode\.com|hackerrank\.com)\/[^\s|,;]+/gi;
const EMAIL_TEST_REGEX = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const PHONE_TEST_REGEX = /(?:\+?\d[\d\s().-]{7,}\d)/;
const LINK_TEST_REGEX =
  /(?:https?:\/\/)?(?:www\.)?(?:linkedin\.com|github\.com|gitlab\.com|behance\.net|dribbble\.com|medium\.com|kaggle\.com|leetcode\.com|hackerrank\.com)\/[^\s|,;]+/i;

const PAGE = {
  marginX: 54,
  top: 46,
  bottom: 54,
  line: 13.2,
};

export function downloadResumePdf(resumeText: string, fileName = "resume.pdf") {
  if (!resumeText.trim()) {
    throw new Error("No resume text available to download");
  }

  const doc = buildResumePdfDocument(resumeText);
  doc.save(toPdfFileName(fileName));
}

export function buildResumePdfDocument(resumeText: string) {
  const resume = parseResumeText(resumeText);
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const renderer = new ResumePdfRenderer(doc);

  renderer.renderHeader(resume.name, resume.contacts);

  for (const key of SECTION_ORDER) {
    const lines = resume.sections[key];
    if (!lines.length) continue;

    renderer.renderSectionHeading(SECTION_TITLES[key]);

    if (key === "summary") {
      renderer.renderSummary(lines);
    } else if (key === "skills" || key === "coursework") {
      renderer.renderInlineSection(lines);
    } else if (key === "experience" || key === "projects") {
      renderer.renderEntrySection(lines);
    } else if (key === "achievements") {
      renderer.renderBulletSection(lines);
    } else {
      renderer.renderSimpleSection(lines);
    }

    renderer.addSectionGap();
  }

  return doc;
}

export function parseResumeText(rawText: string): ParsedResume {
  const lines = toCleanLines(rawText);
  const sections = createEmptySections();

  if (!lines.length) {
    return { name: "Resume", contacts: [], sections };
  }

  const nameIndex = findNameIndex(lines);
  const name = cleanName(lines[nameIndex] ?? "Resume");
  const contacts = extractContacts(lines, nameIndex);

  let currentSection: SectionKey | null = null;
  let hasSeenSection = false;

  for (let index = nameIndex + 1; index < lines.length; index += 1) {
    const line = lines[index];
    const inlineSection = getInlineSection(line);

    if (inlineSection) {
      currentSection = inlineSection.key;
      hasSeenSection = true;
      if (inlineSection.content) {
        sections[currentSection].push(inlineSection.content);
      }
      continue;
    }

    const heading = getSectionKey(line);
    if (heading) {
      currentSection = heading;
      hasSeenSection = true;
      continue;
    }

    if (!hasSeenSection || !currentSection) {
      continue;
    }

    sections[currentSection].push(line);
  }

  if (!hasRenderableContent(sections)) {
    sections.summary.push(lines.slice(nameIndex + 1).join(" "));
  }

  return { name, contacts, sections };
}

class ResumePdfRenderer {
  private readonly pageWidth: number;
  private readonly pageHeight: number;
  private readonly contentWidth: number;
  private y: number;

  constructor(private readonly doc: jsPDF) {
    this.pageWidth = doc.internal.pageSize.getWidth();
    this.pageHeight = doc.internal.pageSize.getHeight();
    this.contentWidth = this.pageWidth - PAGE.marginX * 2;
    this.y = PAGE.top;
  }

  renderHeader(name: string, contacts: string[]) {
    this.doc.setTextColor(25, 25, 25);
    this.setFont(20, "bold");

    const nameLines = this.wrap(name.toUpperCase(), this.contentWidth);
    for (const line of nameLines) {
      this.ensureSpace(22);
      this.doc.text(line, this.pageWidth / 2, this.y, { align: "center" });
      this.y += 22;
    }

    if (contacts.length) {
      this.setFont(9, "normal");
      this.doc.setTextColor(75, 75, 75);
      const contactLines = this.wrap(contacts.join(" | "), this.contentWidth);
      for (const line of contactLines) {
        this.ensureSpace(12);
        this.doc.text(line, this.pageWidth / 2, this.y, { align: "center" });
        this.y += 12;
      }
    }

    this.y += 7;
    this.drawRule();
    this.y += 18;
  }

  renderSectionHeading(title: string) {
    if (this.y > PAGE.top + 8) {
      this.y += 4;
    }

    this.ensureSpace(30);
    this.setFont(10, "bold");
    this.doc.setTextColor(25, 25, 25);
    this.doc.text(title.toUpperCase(), PAGE.marginX, this.y);
    this.y += 5;
    this.drawRule(0.35);
    this.y += 12;
  }

  renderSummary(lines: string[]) {
    const bullets = lines.filter(isBulletLine);
    const paragraphs = lines.filter((line) => !isBulletLine(line));

    if (paragraphs.length) {
      this.renderParagraph(paragraphs.join(" "), 9.6, "normal", 13.6);
    }

    for (const bullet of bullets) {
      this.renderBullet(stripBullet(bullet));
    }
  }

  renderInlineSection(lines: string[]) {
    for (const line of lines) {
      const normalized = normalizeSkillLine(line);
      if (!normalized) continue;
      this.renderParagraph(normalized, 9.4, "normal", 13.4);
    }
  }

  renderEntrySection(lines: string[]) {
    let previousWasHeading = false;

    for (const line of lines) {
      if (isBulletLine(line)) {
        this.renderBullet(stripBullet(line));
        previousWasHeading = false;
        continue;
      }

      const isHeading = !previousWasHeading || looksLikeEntryHeading(line);
      if (isHeading) {
        this.renderParagraph(line, 9.8, "bold", 13.8);
        previousWasHeading = true;
      } else {
        this.renderParagraph(line, 9.4, "normal", 13.2);
      }
    }
  }

  renderBulletSection(lines: string[]) {
    for (const line of lines) {
      this.renderBullet(stripBullet(line));
    }
  }

  renderSimpleSection(lines: string[]) {
    for (const line of lines) {
      if (isBulletLine(line)) {
        this.renderBullet(stripBullet(line));
        continue;
      }

      const style: FontStyle = looksLikeEntryHeading(line) ? "bold" : "normal";
      this.renderParagraph(line, 9.5, style, 13.4);
    }
  }

  addSectionGap() {
    this.y += 4;
  }

  private renderParagraph(
    text: string,
    fontSize: number,
    style: FontStyle,
    lineHeight: number,
  ) {
    this.setFont(fontSize, style);
    this.doc.setTextColor(35, 35, 35);

    for (const line of this.wrap(text, this.contentWidth)) {
      this.ensureSpace(lineHeight);
      this.doc.text(line, PAGE.marginX, this.y);
      this.y += lineHeight;
    }
  }

  private renderBullet(text: string) {
    const bulletX = PAGE.marginX + 4;
    const textX = PAGE.marginX + 15;
    const bulletWidth = this.contentWidth - 15;
    const lines = this.wrap(text, bulletWidth);

    this.setFont(9.4, "normal");
    this.doc.setTextColor(35, 35, 35);

    lines.forEach((line, index) => {
      this.ensureSpace(PAGE.line);
      if (index === 0) {
        this.doc.text("-", bulletX, this.y);
      }
      this.doc.text(line, textX, this.y);
      this.y += PAGE.line;
    });

    this.y += 1;
  }

  private drawRule(width = 0.5) {
    this.doc.setDrawColor(165, 165, 165);
    this.doc.setLineWidth(width);
    this.doc.line(PAGE.marginX, this.y, this.pageWidth - PAGE.marginX, this.y);
  }

  private ensureSpace(requiredHeight: number) {
    if (this.y + requiredHeight <= this.pageHeight - PAGE.bottom) return;
    this.doc.addPage();
    this.y = PAGE.top;
  }

  private wrap(text: string, width: number): string[] {
    return this.doc.splitTextToSize(text, width) as string[];
  }

  private setFont(size: number, style: FontStyle) {
    this.doc.setFont("helvetica", style);
    this.doc.setFontSize(size);
  }
}

function createEmptySections(): Record<SectionKey, string[]> {
  return {
    summary: [],
    skills: [],
    experience: [],
    projects: [],
    education: [],
    certifications: [],
    achievements: [],
    coursework: [],
  };
}

function toCleanLines(rawText: string): string[] {
  return normalizeResumeText(rawText)
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter((line) => line.length > 0)
    .filter((line) => !JUNK_LINE_PATTERNS.some((pattern) => pattern.test(line)));
}

function normalizeResumeText(rawText: string): string {
  return rawText
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\(cid:\d+\)/gi, " | ")
    .replace(/\u00e2\u20ac\u00a2/g, " - ")
    .replace(/\u00e2\u20ac[\u201c\u201d]/g, "-")
    .replace(/\u00c2\u00b7/g, ", ")
    .replace(/\u00c2\u00a7/g, " | ")
    .replace(/\u00c2/g, "")
    .replace(/[\u2022\u25cf\u25e6\u00b7]/g, " - ")
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\t/g, " ")
    .replace(/[ ]{2,}/g, " ");
}

function findNameIndex(lines: string[]): number {
  const index = lines.findIndex((line) => !getSectionKey(line) && !looksLikeContactLine(line));
  return index >= 0 ? index : 0;
}

function cleanName(line: string): string {
  const cleaned = line.replace(/^name\s*[:|-]\s*/i, "").trim();
  return cleaned || "Resume";
}

function extractContacts(lines: string[], nameIndex: number): string[] {
  const contactZoneLines = lines.slice(
    nameIndex + 1,
    Math.min(lines.length, nameIndex + 8),
  );
  const contactZone = contactZoneLines.join(" ");

  const emails = unique(contactZone.match(EMAIL_REGEX) ?? []);
  const phones = unique(
    (contactZone.match(PHONE_REGEX) ?? []).map(cleanPhone).filter(isLikelyPhone),
  );
  const links = unique(contactZone.match(LINK_REGEX) ?? []);
  const location = extractLocation(contactZoneLines);

  return [location, ...phones, ...emails, ...links]
    .filter(Boolean)
    .map((item) => item.trim())
    .filter((item, index, items) => items.indexOf(item) === index);
}

function extractLocation(lines: string[]): string {
  for (const line of lines) {
    const candidate = line
      .replace(EMAIL_REGEX, "")
      .replace(PHONE_REGEX, "")
      .replace(LINK_REGEX, "")
      .replace(/[|#*]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (
      candidate.length > 3 &&
      candidate.length < 90 &&
      /[a-z]/i.test(candidate) &&
      !getSectionKey(candidate)
    ) {
      return candidate.replace(/^[-, ]+|[-, ]+$/g, "");
    }
  }

  return "";
}

function getInlineSection(line: string): { key: SectionKey; content: string } | null {
  const match = line.match(/^([A-Za-z /&]+):\s+(.+)$/);
  if (!match) return null;

  const key = getSectionKey(match[1]);
  if (!key) return null;

  return { key, content: match[2].trim() };
}

function getSectionKey(line: string): SectionKey | null {
  const normalized = normalizeHeading(line);
  return SECTION_ALIASES.get(normalized) ?? null;
}

function normalizeHeading(line: string): string {
  return line
    .replace(/^#+\s*/, "")
    .replace(/\*\*/g, "")
    .replace(/[:|-]\s*$/, "")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

function hasRenderableContent(sections: Record<SectionKey, string[]>): boolean {
  return Object.values(sections).some((lines) => lines.length > 0);
}

function looksLikeContactLine(line: string): boolean {
  return (
    EMAIL_TEST_REGEX.test(line) ||
    PHONE_TEST_REGEX.test(line) ||
    LINK_TEST_REGEX.test(line)
  );
}

function isBulletLine(line: string): boolean {
  return /^[-*]\s+/.test(line.trim());
}

function stripBullet(line: string): string {
  return line.replace(/^[-*]\s+/, "").trim();
}

function looksLikeEntryHeading(line: string): boolean {
  return (
    /\s\|\s/.test(line) ||
    /\b(19|20)\d{2}\b/.test(line) ||
    /\b(present|current|intern|developer|engineer|manager|analyst|lead)\b/i.test(line)
  );
}

function normalizeSkillLine(line: string): string {
  const stripped = stripBullet(line);
  const normalized = stripped
    .split(/\s+-\s+|,\s*/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (stripped.includes(":")) {
    return stripped;
  }

  return normalized.length > 1 ? normalized.join(", ") : stripped;
}

function cleanPhone(phone: string): string {
  return phone.replace(/\s+/g, " ").trim();
}

function isLikelyPhone(phone: string): boolean {
  const digitCount = phone.replace(/\D/g, "").length;
  return digitCount >= 10 && digitCount <= 16;
}

function unique(items: string[]): string[] {
  return items
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item, index, all) => all.indexOf(item) === index);
}

function toPdfFileName(fileName: string): string {
  const cleaned = fileName.replace(/[\\/:*?"<>|]+/g, "_").trim() || "resume.pdf";
  return cleaned.toLowerCase().endsWith(".pdf") ? cleaned : `${cleaned}.pdf`;
}
