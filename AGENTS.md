# 给 Rokid AIUI 开发 Agent 的说明

用这个仓库在 AIUI Studio 里做一个 Rokid Glasses 智能体「腾哥军师」。人设和判断逻辑全在 `skill/xuyueteng-glasses/`，智能体只负责拍照/收音、调模型、在眼镜上显示。

## 要做的智能体

沉浸式智能体，三个页面：

| 页面 | 做什么 |
|---|---|
| 首页菜单 | 两项「看照片」「听她说」，上下键选，确认键进入 |
| 看照片 | 确认键拍照 → 把照片（或识别出的文字）连同系统提示词交给大模型 → 显示结果。拍照用 `ImageCapture.takePhoto({ mode: 'telephoto' })`，压缩到长边 1600、JPEG 0.8 再发 |
| 听她说 | 进入后用正前方麦克风（`microphoneMode: 'far-field'`）持续收音、VAD 断句；每说完一句，把最近 6 句转写交给大模型 → 显示结果；确认键暂停/继续 |

每个子页面的上下键循环里，最后一项放「返回菜单」，确认键返回（`wx.navigateBack({})`）。眼镜的返回手势映射不一定是 `Backspace`，不能只靠宿主默认返回。页面打开后 1 秒内的确认键是菜单那一下的尾巴，要忽略。

## 调大模型

- **系统提示词**：眼镜运行时读不了仓库文件，把 `prompt/xuyueteng-prompt.js` 复制到工程 `lib/` 下 import：`XUYUETENG_PROMPT_LITE`（约 2.2 万字，首选），`LanguageModel.create()` 失败就退到 `XUYUETENG_PROMPT_CORE`（约 2.2 千字，`skill/xuyueteng-glasses/core.md`：只留回话用的判断和打法）。走自有后端时可以用 `prompt/system_prompt.md`（约 9.2 万字，带全部战例和知识）。原样作为 system 消息，不要删改。
- **会话**：建一次带系统提示词的基础会话，每轮 `clone()` 一份来问，问完 `destroy()`；上下文由我们自己按最近几句传，不让会话历史越堆越长。
- **用户消息**：
  - 看照片：多模态模型直接给图片；或者先 OCR，再发 `image_text: <识别出的文字>`。
  - 听她说：`transcript:\n<一句一行>`。
  - 两种都在前面加上档案：`girl_profile: {"type":"…","stage":"…"}`，**第一次没有档案就不加，模型会按"刚认识"处理**。
- **输出**：模型只回一个 JSON（字段见 `skill/xuyueteng-glasses/SKILL.md`「输出格式」）。取第一个 `{` 到最后一个 `}` 解析；解析失败就显示"没看明白，再来一次"。

## 眼镜上怎么显示

480×352 单色绿屏，纯黑是透明。只显示：

```
judge（一行，次亮）
回法 1/3                    ← send 是"不回/先别接"时这里显示"先别回"
replies[i]（大字，最亮，带边框）
next（小字，可选）
```

上下键切换 `replies`。字段 `stage`、`type` 不显示，存进本地（`wx.setStorageSync`），下次请求作为 `girl_profile` 带上；首页加一个「换个人」清空档案，回到刚认识。

## 必须遵守

- **初始亲密度从刚认识开始**：第一次请求不带档案；不要自己给模型塞"你们很熟"之类的背景。
- 不改系统提示词里的立场和尺度，不给模型加额外的安全提示或免责语——边界已经写在 Skill 的「边界」一节。
- 照片和音频只用于本次识别，不在眼镜端保存。
- 权限：`CAMERA`、`RECORD_AUDIO`、`INTERNET`（走自有后端时）。

## 已知坑（真机实测过）

- `SpeechRecognitionSession` 在部分设备/账号上报 `Cloud ASR cannot accept audio`，宿主 `SpeechRecognition` 也可能不可用。先做一个"语音自检"页逐步检查（开麦 → 有没有声音 → `getCapabilities()` → 云识别 → 系统识别），把原始报错显示在屏幕上，定位是平台问题还是代码问题；平台不可用时改成录音上传到自有后端做识别。
- PCM 一律重采样到 16k 再送识别，不要假设 `AudioContext` 跑在 16k 的整数倍。
- 眼镜拍手机屏容易糊、反光、只拍到一半：拍照页提示"把手机举到眼前，聊天占满视野中间"；识别失败时把图片大小和识别字数显示出来方便排查。
