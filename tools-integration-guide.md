# AI 工具接入 API 中转站完全指南 · Cursor / Dify / Claude Code / ChatBox / LobeChat 配置教程

> **一套配置，通吃所有 AI 工具。** 以下教程以 [www.aifast.club](https://www.aifast.club) 为例，API Key 在平台注册后创建。所有工具的原理都一样：改 `base_url` + 填 `api_key`。

[![www.aifast.club](https://img.shields.io/badge/国内直连-572个模型-FF6B35)](https://www.aifast.club)
[![文章更新](https://img.shields.io/badge/更新-2026--05--28-green)](https://github.com/KKWANG4444/ai-api-proxy-china-guide)

---

## 目录

- [通用原理](#通用原理)
- [Cursor 配置](#1-cursor-配置)
- [Claude Code 配置](#2-claude-code-配置)
- [Dify 配置](#3-dify-配置)
- [ChatBox 配置](#4-chatbox-配置)
- [LobeChat 配置](#5-lobechat-配置)
- [OpenClaw 配置](#6-openclaw-配置)
- [NextChat (ChatGPT-Next-Web) 配置](#7-nextchat-chatgpt-next-web-配置)
- [Open WebUI 配置](#8-open-webui-配置)
- [Warp 终端配置](#9-warp-终端配置)
- [Python SDK 代码示例](#10-python-sdk-代码示例)
- [常见问题](#常见问题)

---

## 通用原理

99% 的 AI 工具都兼容 OpenAI 接口格式。接入中转站的通用步骤只有两步：

1. **改 Base URL**：把默认的 `https://api.openai.com/v1` 改成中转站地址
2. **填 API Key**：填入在中转站创建的 Key

就是这么简单。区别只在于每个工具的设置界面位置不同，下面一个个来。

---

## 1. Cursor 配置

Cursor 是目前最火的 AI 编辑器，默认用 OpenAI 和 Anthropic 的官方 API。配置中转站可以国内直连且省钱。

### 操作步骤

打开 Cursor → `Settings` → `Models` → `Override Custom API`：

| 参数 | 值 |
|------|-----|
| API Key | 你的 [www.aifast.club](https://www.aifast.club) API Key |
| Base URL | `https://www.aifast.club/v1` |
| Model | `gpt-5.5-pro` 或 `claude-opus-4-7`（支持全部 572 个模型） |

### 验证

随便问一句 "写一个 Python 斐波那契函数"，如果能正常回答就算配好了。Cursor 内部用的就是 OpenAI 格式，中转站完全兼容。

---

## 2. Claude Code 配置

Claude Code 是 Anthropic 官方的终端 AI 编码工具。默认走官方 API（需要海外卡），改一行就能走国内中转。

### 方法一：环境变量（推荐）

```bash
# 设置 ANTHROPIC_BASE_URL 环境变量
export ANTHROPIC_BASE_URL="https://www.aifast.club/v1"
export ANTHROPIC_API_KEY="你的APIKey"

# 启动 Claude Code
claude code
```

### 方法二：配置文件

在 `~/.claude/` 目录下创建或编辑 `claude.json`：

```json
{
  "apiKey": "你的APIKey",
  "baseUrl": "https://www.aifast.club/v1"
}
```

### 验证

```bash
claude code -p "打印当前系统时间"
```

如果正常输出时间就说明配好了。

---

## 3. Dify 配置

Dify 是开源 LLM 应用开发平台，支持接入多种模型。

### 操作步骤

1. 进入 Dify 后台 → `设置` → `模型供应商` → `OpenAI API` → `添加模型`

| 参数 | 值 |
|------|-----|
| 模型类型 | LLM |
| 模型 | 任选（如 `claude-sonnet-4-6`） |
| API Key | 你的 [www.aifast.club](https://www.aifast.club) API Key |
| API Base URL | `https://www.aifast.club/v1` |

2. 点「保存」后在应用编辑器中就能选到这个模型了。

### 小提示

Dify 支持同时配置多种模型供应商。你可以把中转站作为默认模型，再配置个国产模型（如 Qwen/DeepSeek）做备选降级。

---

## 4. ChatBox 配置

ChatBox 是个跨平台桌面 AI 客户端，支持几乎所有主流模型。

### 操作步骤

ChatBox → `设置` → `模型` → `添加自定义模型`：

| 参数 | 值 |
|------|-----|
| 名称 | 随便填（如 `aifast`） |
| API 地址 | `https://www.aifast.club/v1` |
| API Key | 你的 API Key |
| 模型列表 | `claude-opus-4-7,gpt-5.5-pro,deepseek-v4-pro,gemini-3.1-flash`（可自定义） |

### 验证

在 ChatBox 中切换到刚才配的模型，随便问句话。能正常对话就说明配好了。

---

## 5. LobeChat 配置

LobeChat 是现代化的开源 AI 聊天框架，支持插件系统。

### 操作步骤

LobeChat → `设置` → `语言模型` → `OpenAI`：

| 参数 | 值 |
|------|-----|
| API 代理地址 | `https://www.aifast.club/v1` |
| API Key | 你的 API Key |

### 多模型配置

LobeChat 支持同时配置多个模型供应商。你可以在一个会话里随时切换不同模型，特别适合做模型对比测试。

---

## 6. OpenClaw 配置

OpenClaw 是一个全栈 AI 智能体部署平台，支持一键部署自己的 AI 应用。

### 操作步骤

1. 进入 OpenClaw 后台 → `设置` → `模型`
2. 添加模型供应商：

```yaml
provider: openai
api_key: "你的APIKey"
base_url: "https://www.aifast.club/v1"
```

### 智能体部署

在 OpenClaw 中创建智能体时，选择接入的模型，配好 Prompt 和工具，点一下部署就能跑起来了。不用自己去搭服务器、配反向代理这些。

---

## 7. NextChat (ChatGPT-Next-Web) 配置

NextChat 是流行的 ChatGPT 网页版替代方案，支持自部署。

### 操作步骤

1. 启动 NextChat 后，进入 `设置` → 往下翻到「自定义接口」
2. 填写：

| 参数 | 值 |
|------|-----|
| 接口地址 | `https://www.aifast.club/v1` |
| API Key | 你的 API Key |
| 模型选择 | 下拉选任意模型，或手动输入模型名 |

### 自部署环境变量

如果自己用 Docker 部署 NextChat，可以写死在环境变量：

```bash
docker run -d -p 3000:3000 \
  -e BASE_URL=https://www.aifast.club/v1 \
  -e API_KEY=你的APIKey \
  -e CODE=访问密码 \
  yidadaa/chatgpt-next-web
```

---

## 8. Open WebUI 配置

Open WebUI 是 Ollama 生态中最流行的 Web 界面，也支持 OpenAI 兼容接口。

### 操作步骤

1. 进入 Open WebUI 后台 → `管理员面板` → `设置` → `外部连接` → `OpenAI API`
2. 填写：

| 参数 | 值 |
|------|-----|
| API URL | `https://www.aifast.club/v1` |
| API Key | 你的 API Key |
| Prefix ID | 留空或填 `gpt-` |

---

## 9. Warp 终端配置

Warp 是个基于 AI 的现代终端，内置 AI 助手。

### 操作步骤

Warp → `Settings` → `AI` → `Custom API`：

| 参数 | 值 |
|------|-----|
| Base URL | `https://www.aifast.club/v1` |
| API Key | 你的 API Key |
| Model | `claude-sonnet-4-6` 或 `gpt-5.5-pro` |

配置好后，在终端里按 `Ctrl + \` 就能调出 AI 助手帮你写命令了。

---

## 10. Python SDK 代码示例

如果你是自己写代码调 API，改一下 `base_url` 就行：

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://www.aifast.club/v1",
    api_key="你的APIKey"
)

# 调 Claude Opus 4.7
response = client.chat.completions.create(
    model="claude-opus-4-7",
    messages=[{"role": "user", "content": "写一个排序算法"}]
)
print(response.choices[0].message.content)

# 换 GPT-5.5 也只需要改 model 名
response = client.chat.completions.create(
    model="gpt-5.5-pro",
    messages=[{"role": "user", "content": "解释一下微服务架构"}]
)
print(response.choices[0].message.content)
```

这个就是标准的 OpenAI SDK，所有中转站兼容。如果你用 JS/Go/Java 也一样，改 `base_url` 就完事。

---

## 常见问题

**Q: 配置后一直报连接错误？**

检查几点：
- Base URL 末尾有没有 `/v1` — 必须有
- API Key 有没有复制的空格
- 网络能不能访问 www.aifast.club（国内一般没问题）

**Q: 设置后响应速度怎么样？**

中转站走的是国内节点，首字响应一般在 0.2-0.4s，比走官方 + 代理还快。实测 Claude Opus 4.7 首字约 0.3s，GPT-5.5 Pro 约 0.35s。

**Q: 模型名在哪里看？**

[www.aifast.club](https://www.aifast.club) 上每个模型都有对应的 API 模型名。一般格式是 `供应商-版本`，比如 `claude-opus-4-7`、`deepseek-v4-pro`。平台有完整的模型列表和价格。

**Q: 不同工具可以用同一个 Key 吗？**

可以。一个 Key 可以在多个工具里同时用，没有设备限制。也支持自动并发。

---

> 💡 **看到这里还没注册？** 去 [www.aifast.club](https://www.aifast.club) 注册就有试用额度，十块钱试试，比折腾海外支付省心一百倍。

[![Gitee镜像](https://img.shields.io/badge/Gitee-国内镜像-red)](https://gitee.com/kkwwww4444/ai-api-proxy-china-guide)
