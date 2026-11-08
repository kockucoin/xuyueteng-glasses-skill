# xuyueteng-glasses-skill

情感导师「腾」（腾哥）Skill 的 **AI 眼镜版**。用户戴着 Rokid Glasses 聊天时，眼镜拍一张照片或听她说几句话，就在眼前给出一句判断和 2~3 条能直接发、直接说的话。

由 xuyueteng Skill 改编：方法论、立场、尺度不变（腾子研学营第 3~5 期 17 节课 + 约 1200 张课程截图提炼，腾本人授权），只改了输入和输出。

## 和原版的区别

| | 原版 xuyueteng | 眼镜版 |
|---|---|---|
| 模式 | 答疑、回复建议、开场白、看她、自我成长、知识库、测验，共 7 个 | **看照片**（聊天截图 / 她的朋友圈主页 / 现场画面）、**听她说**（当面语音转写），共 2 个 |
| 输出 | 分段讲解：局面、回不回、回复、下一步 | 一段 JSON：`judge` 一句判断 + `replies` 2~3 条 + `next`，给眼镜小屏 |
| 初始状态 | 按材料判断阶段 | **一律从刚认识开始**，有明确信号才往后挪 |
| 知识 | 全部专题 + 79 个问答案例 + 题库 | 只带回复用得上的：军师手册、招式表、战例库、高频速查、女生分类、渠道、线上聊天、线下约会、聊天案例 |

## 结构

```
AGENTS.md                         给 Rokid AIUI 开发 Agent 的说明：页面、怎么调模型、怎么显示
skill/xuyueteng-glasses/
├── SKILL.md                      入口：身份、口吻、初始亲密度、硬规则、诊断内核、输出格式、边界
├── modes/photo.md                看照片
├── modes/listen.md               听她说
└── references/                   军师手册、招式表、战例库、高频速查、knowledge/02~05、聊天案例……
prompt/
├── build.mjs                     把 Skill 拼成单文件提示词
├── system_prompt_lite.md         精简版（约 2.3 万字）
├── xuyueteng-prompt.js           眼镜工程直接 import 的 JS 模块（LITE + CORE 两档）
└── system_prompt.md              完整版（约 9.2 万字）
```

## 怎么用

**在 Rokid AIUI Studio 里做眼镜智能体**：让 AIUI CODING 先读 `AGENTS.md`，照着做。系统提示词用 `prompt/system_prompt_lite.md`。

**在别的 Agent 里当 Skill 用**（Claude Code 等）：

```bash
cp -R skill/xuyueteng-glasses ~/.claude/skills/
```

**改了 Skill 之后**重新生成单文件提示词：

```bash
node prompt/build.mjs
```

## 输出示例

```json
{"mode":"listen","type":"判断不出","stage":"刚认识","send":"现在说",
 "judge":"她主动问你口味，是给你递话头，接住别查户口",
 "replies":["那你推荐，我第一次来就信你的","甜的我一般，得看谁推荐","你常来这家，是一个人来还是带人来"],
 "next":"她多聊自己就顺着问，再找机会摇骰子"}
```
