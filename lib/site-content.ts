import { copyFile, mkdir, readFile, readdir, rename, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';
import { parseWorkingHours, normalizePhone, siteContentSchema, type SiteContent } from './site-content-schema';

const contentPath = path.join(process.cwd(), 'content', 'site.json');
const backupDir = path.join(process.cwd(), 'backups', 'content');
export const worksUploadDir = path.join(process.cwd(), 'public', 'images', 'works');

export async function getSiteContent(): Promise<SiteContent> {
  const raw = await readFile(contentPath, 'utf8');
  return siteContentSchema.parse(JSON.parse(raw));
}

function ensureHttpUrl(value: string): string {
  const trimmed = (value || '').trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function canonicalizeSiteContent(input: unknown): SiteContent {
  const candidate = structuredClone(input) as SiteContent;
  const phone = normalizePhone(candidate.business.phoneDisplay);
  const hours = parseWorkingHours(candidate.business.workingHours.label);
  candidate.business.phoneE164 = phone;
  candidate.business.workingHours.opens = hours.opens;
  candidate.business.workingHours.closes = hours.closes;

  if (candidate.links.vk) candidate.links.vk = ensureHttpUrl(candidate.links.vk);
  if (candidate.links.telegram) candidate.links.telegram = ensureHttpUrl(candidate.links.telegram);
  if (candidate.links.max) candidate.links.max = ensureHttpUrl(candidate.links.max);
  if (candidate.links.dikidi) candidate.links.dikidi = ensureHttpUrl(candidate.links.dikidi);
  if (candidate.links.yandexMaps) candidate.links.yandexMaps = ensureHttpUrl(candidate.links.yandexMaps);
  if (candidate.links.whatsapp) {
    candidate.links.whatsapp = ensureHttpUrl(candidate.links.whatsapp);
  } else {
    candidate.links.whatsapp = `https://wa.me/${phone.replace(/\D/g, '')}`;
  }

  return siteContentSchema.parse(candidate);
}


async function createBackup() {
  await mkdir(backupDir, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await copyFile(contentPath, path.join(backupDir, `site-${timestamp}.json`));
  const entries = await readdir(backupDir);
  const files = await Promise.all(entries.filter((name) => name.endsWith('.json')).map(async (name) => {
    const filePath = path.join(backupDir, name);
    return { filePath, modified: (await stat(filePath)).mtimeMs };
  }));
  for (const old of files.sort((a, b) => b.modified - a.modified).slice(50)) {
    await rm(old.filePath, { force: true });
  }
}

export async function writeSiteContent(input: unknown): Promise<SiteContent> {
  const content = canonicalizeSiteContent(input);
  await createBackup();
  const temporaryPath = `${contentPath}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(content, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 });
  await rename(temporaryPath, contentPath);
  return content;
}

export async function processAndSaveWorkPhoto(
  buffer: Buffer,
  title: string,
  alt: string
): Promise<{ src: string; title: string; alt: string }> {
  await mkdir(worksUploadDir, { recursive: true });

  const image = sharp(buffer);
  const metadata = await image.metadata();

  if (!metadata.format || !['jpeg', 'png', 'webp', 'avif'].includes(metadata.format)) {
    throw new Error('Поддерживаются только форматы JPEG, PNG, WebP и AVIF.');
  }

  const filename = `work-${crypto.randomUUID().slice(0, 12)}.webp`;
  const targetPath = path.join(worksUploadDir, filename);

  await image
    .rotate()
    .resize({ width: 1400, height: 1800, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 85, effort: 4 })
    .toFile(targetPath);

  const src = `/images/works/${filename}`;
  const currentContent = await getSiteContent();
  currentContent.works.unshift({
    src,
    title: title.trim() || 'Новая работа',
    alt: alt.trim() || title.trim() || 'Работа мастера',
  });

  await writeSiteContent(currentContent);
  return { src, title, alt };
}

