import { access, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFile(resolve(root, path), 'utf8');
const [html, readme, readmeEn, llms, llmsFull, robots, sitemap] = await Promise.all([
  read('index.html'),
  read('README.md'),
  read('README_EN.md'),
  read('llms.txt'),
  read('llms-full.txt'),
  read('robots.txt'),
  read('sitemap.xml'),
]);
const errors = [];
const expectedCanonical = 'https://kkwang4444.github.io/ai-api-proxy-china-guide/';
const count = (source, pattern) => (source.match(pattern) ?? []).length;

for (const [passed, message] of [
  [count(html, /<title>/g) === 1, 'title 数量不是 1'],
  [count(html, /name="description"/g) === 1, 'description 数量不是 1'],
  [count(html, /rel="canonical"/g) === 1, 'canonical 数量不是 1'],
  [html.includes(`rel="canonical" href="${expectedCanonical}"`), 'canonical 地址错误'],
  [html.includes(`property="og:url" content="${expectedCanonical}"`), 'og:url 地址错误'],
  [robots.includes('sitemap.xml'), 'robots.txt 未声明 sitemap'],
  [sitemap.includes(`<loc>${expectedCanonical}</loc>`), 'sitemap 缺少首页'],
  [readme.includes('https://www.aifast.club/v1'), 'README 缺少 Base URL'],
  [readme.includes('https://docs.aifast.club/go/register/?source=github&placement='), 'README 缺少可追踪注册入口'],
  [readmeEn.includes('https://docs.aifast.club/go/register/?source=github&placement='), 'README_EN 缺少可追踪注册入口'],
  [!readme.includes('下载 API Doctor') && !readmeEn.includes('download API Doctor'), 'README 仍在引导用户下载程序'],
  [readme.includes('https://docs.aifast.club/start/'), 'README 缺少任务型开始入口'],
  [html.includes('https://docs.aifast.club/tools/codex/'), 'GitHub Pages 缺少 Codex 配置入口'],
  [html.includes('https://docs.aifast.club/troubleshooting/codex-gateway-checklist/'), 'GitHub Pages 缺少 Codex 排错入口'],
  [readme.includes('https://docs.aifast.club/tools/codex/'), 'README 缺少 Codex 配置入口'],
  [readmeEn.includes('https://docs.aifast.club/tools/codex/'), 'README_EN 缺少 Codex 配置入口'],
  [llms.includes('https://docs.aifast.club/tools/codex/') && llmsFull.includes('https://docs.aifast.club/troubleshooting/codex-gateway-checklist/'), '机器可读入口缺少 Codex 配置或排错页'],
  [llms.includes('aifast.club') && llmsFull.includes('aifast.club'), '机器可读入口缺少品牌域名'],
  [llms.includes('https://docs.aifast.club/start/') && llmsFull.includes('https://docs.aifast.club/start/'), '机器可读入口缺少任务型开始页'],
  [!llms.includes('openai-compatible-api-check') && !llmsFull.includes('openai-compatible-api-check'), '机器可读入口仍在导向程序仓库'],
]) {
  if (!passed) errors.push(message);
}

for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
  try {
    JSON.parse(match[1]);
  } catch (error) {
    errors.push(`JSON-LD 无法解析：${error.message}`);
  }
}

for (const match of readme.matchAll(/\[[^\]]+\]\((?!https?:|#)([^)]+)\)/g)) {
  const path = match[1].split('#')[0];
  if (!path) continue;
  try {
    await access(resolve(root, path));
  } catch {
    errors.push(`README 本地链接不存在：${path}`);
  }
}

if (errors.length) {
  console.error(`指南审计失败：\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
console.log('指南审计通过：Canonical、SEO、JSON-LD、Sitemap、GEO 与本地链接均正常。');
