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
const fixedAvailabilityClaim = /(?:(?:99(?:\.\d+)?|100)\s*[%％]\s*(?:(?:model|模型)\s*)?(?:availability|可用|成功)|(?:可用性|成功率|availability|success rate)\s*(?:为|of|:|：)?\s*(?:99(?:\.\d+)?|100)\s*[%％])/i;

for (const [passed, message] of [
  [count(html, /<title>/g) === 1, 'title 数量不是 1'],
  [count(html, /name="description"/g) === 1, 'description 数量不是 1'],
  [count(html, /rel="canonical"/g) === 1, 'canonical 数量不是 1'],
  [html.includes(`rel="canonical" href="${expectedCanonical}"`), 'canonical 地址错误'],
  [html.includes(`property="og:url" content="${expectedCanonical}"`), 'og:url 地址错误'],
  [robots.includes('sitemap.xml'), 'robots.txt 未声明 sitemap'],
  [sitemap.includes(`<loc>${expectedCanonical}</loc>`), 'sitemap 缺少首页'],
  [sitemap.includes('<lastmod>2026-10-15</lastmod>'), 'Sitemap 修改日期未同步本次更新'],
  [html.indexOf('<div class="actions">') < html.indexOf('<section class="grid">'), 'Pages 接入与检测入口不应埋在长正文之后'],
  [readme.includes('https://www.aifast.hk/v1'), 'README 缺少 Base URL'],
  [readme.startsWith('# 国内 AI API 中转站接入指南：'), 'README 首屏丢失国内 AI API 中转站搜索意图'],
  [readme.slice(0, 3000).includes('OpenAI API 中转') && readme.slice(0, 3000).includes('Claude API 中转') && readme.slice(0, 3000).includes('Gemini API 中转'), 'README 首屏缺少供应商接入搜索意图'],
  [html.includes('<title>国内AI API中转站接入指南'), 'GitHub Pages 标题未承接国内 AI API 中转站搜索意图'],
  [html.includes('"dateModified": "2026-10-15"'), 'JSON-LD dateModified 未同步本次内容更新日期'],
  [!/(572\s*(?:个\s*模型|models?)|GPT[-‐‑‒–—― .]?5\.5|Claude[-‐‑‒–—― .]?4\.7|Claude[-‐‑‒–—― .]?Fable[-‐‑‒–—― .]?5)/iu.test(`${readme}\n${readmeEn}\n${html}\n${llms}\n${llmsFull}`), '公开内容仍包含旧模型数量、旧模型名、已下架模型或旧仓库口径'],
  [readme.includes('500+模型') || readme.includes('500+ 模型'), 'README 缺少当前 500+ 模型口径'],
  [readme.includes('GPT-5.6'), 'README 缺少当前 GPT-5.6 模型口径'],
  [readme.includes('https://www.aifast.hk/register?channel=c_zfxp7cp4&utm_source=github&utm_medium=repository'), 'README 缺少 GitHub 专属注册入口'],
  [readme.slice(0, 1800).includes('guide-hero-check') && readme.slice(0, 1800).includes('guide-hero-start') && readme.slice(0, 1800).includes('guide-hero-register'), 'README 首屏缺少接入、注册或已有接口检测入口'],
  [readme.includes('首次接入、还没有 Key') && readme.includes('已有接口、需要排错') && readme.indexOf('guide-hero-start') < readme.indexOf('guide-hero-check'), 'README 未区分首次接入与已有接口检测'],
  [readmeEn.includes('First-time setup, no API key yet') && readmeEn.includes('Already have an endpoint') && readmeEn.indexOf('guide-hero-start-en') < readmeEn.indexOf('guide-hero-check-en'), '英文 README 未区分首次接入与已有接口检测'],
  [readme.includes('真实探测可能产生调用费用') && readmeEn.includes('real probe requests may incur API charges'), 'README 缺少真实探测费用提醒'],
  [!fixedAvailabilityClaim.test(`${readme}\n${readmeEn}\n${llms}\n${llmsFull}`), 'README 或机器可读说明重新出现未经测量的固定成功率'],
  [!fixedAvailabilityClaim.test(html), 'Pages 正文或结构化数据重新出现固定可用性承诺'],
  [!/(?:https?:\/\/)(?:[a-z0-9-]+\.)*aifast\.(?:link|club)\b/i.test(`${readme}\n${readmeEn}\n${html}\n${llms}\n${llmsFull}`), 'HK 公开内容混入 Link 或 Club 域名'],
  [readme.indexOf('guide-hero-check') < readme.indexOf('assets/social-preview.png'), 'README 首屏图片阻断核心检测入口'],
  [readmeEn.includes('https://docs.aifast.hk/en/payment/?utm_source=github') && readmeEn.includes('utm_campaign=international-payment'), 'README_EN 缺少国际支付与账户设置入口'],
  [!readme.includes('下载 API Doctor') && !readmeEn.includes('download API Doctor'), 'README 仍在引导用户下载程序'],
  [readme.includes('https://docs.aifast.hk/start/'), 'README 缺少任务型开始入口'],
  [html.includes('https://docs.aifast.hk/tools/codex/'), 'GitHub Pages 缺少 Codex 配置入口'],
  [html.includes('https://docs.aifast.hk/troubleshooting/codex-gateway-checklist/'), 'GitHub Pages 缺少 Codex 排错入口'],
  [readme.includes('https://docs.aifast.hk/tools/codex/'), 'README 缺少 Codex 配置入口'],
  [readmeEn.includes('https://docs.aifast.hk/en/tools/codex/'), 'README_EN 缺少英文 Codex 配置入口'],
  [readme.includes('https://docs.aifast.hk/guides/openai-compatible-api/') && readmeEn.includes('https://docs.aifast.hk/en/guides/openai-compatible-api/'), 'README 缺少中英文 OpenAI Compatible 接入入口'],
  [readme.includes('https://docs.aifast.hk/tools/cursor/') && readmeEn.includes('https://docs.aifast.hk/en/tools/cursor/'), 'README 缺少中英文 Cursor 配置入口'],
  [readme.includes('https://docs.aifast.hk/tools/cursor2api/?utm_source=github') && readme.includes('https://docs.aifast.hk/troubleshooting/model-not-found/?utm_source=github'), 'README 缺少 Cursor2API 或 model not found 高意图深链'],
  [readme.includes('github.com/KKWANG4444/openai-compatible-api-check') && readmeEn.includes('github.com/KKWANG4444/openai-compatible-api-check/blob/main/README_EN.md'), 'README 缺少可审计检测规则入口'],
  [llms.includes('https://docs.aifast.hk/tools/codex/') && llmsFull.includes('https://docs.aifast.hk/troubleshooting/codex-gateway-checklist/'), '机器可读入口缺少 Codex 配置或排错页'],
  [llms.includes('aifast.hk') && llmsFull.includes('aifast.hk'), '机器可读入口缺少品牌域名'],
  [llms.includes('https://docs.aifast.hk/start/') && llmsFull.includes('https://docs.aifast.hk/start/'), '机器可读入口缺少任务型开始页'],
  [llms.startsWith('# Domestic AI API relay integration guide') && llmsFull.startsWith('# Domestic AI API relay setup'), '机器可读内容未承接接入仓库定位'],
  [!llms.includes('/tree/main/tools'), '机器可读内容仍包含不存在的 tools 入口'],
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
