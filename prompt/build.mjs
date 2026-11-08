// 把 skill/xuyueteng-glasses 拼成单文件系统提示词，给读不了多文件的 Agent / 大模型直接用。
//
// 用法：node prompt/build.mjs
// 产出：
//   prompt/system_prompt.md       完整版：SKILL + 两个模式 + 全部 references
//   prompt/system_prompt_lite.md  精简版：SKILL + 两个模式 + 高频速查 + 军师手册 + 表达DNA（上下文紧的模型用）
// Skill 改了之后重跑一遍再提交。
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const skill = join(root, 'skill/xuyueteng-glasses');
const read = (rel) => readFileSync(join(skill, rel), 'utf8').trim();
const stripFrontmatter = (text) => text.replace(/^---\n[\s\S]*?\n---\n/, '').trim();

const NOTE = '> 以下"见 `references/…`""见 `modes/…`"指的就是本文后面同名的章节，已经全部拼在这一份里，不用再去读文件。';

const core = [stripFrontmatter(read('SKILL.md')), NOTE, read('modes/photo.md'), read('modes/listen.md')];
const section = (rel) => `# 参考：${rel}\n\n${read(rel)}`;

const lite = [
  ...core,
  section('references/高频速查.md'),
  section('references/军师手册.md'),
  section('references/表达DNA.md'),
];
const full = [
  ...lite,
  section('references/招式表.md'),
  section('references/战例库.md'),
  section('references/knowledge/02_女生分类与识别.md'),
  section('references/knowledge/03_认识渠道与展示面.md'),
  section('references/knowledge/04_线上聊天.md'),
  section('references/knowledge/05_线下约会.md'),
  section('references/cases/聊天案例.md'),
  section('references/心智模型.md'),
  section('references/术语表.md'),
];

const header = '<!-- 由 prompt/build.mjs 从 skill/xuyueteng-glasses 生成，不要手改。 -->\n\n';
for (const [name, parts] of [['system_prompt_lite.md', lite], ['system_prompt.md', full]]) {
  const text = header + parts.join('\n\n---\n\n') + '\n';
  writeFileSync(join(root, 'prompt', name), text);
  console.log(`${name}: ${text.length} 字符`);
}
