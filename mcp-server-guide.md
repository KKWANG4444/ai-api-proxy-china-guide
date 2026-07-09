# MCP Server 接入指南 · 用中转站接入 MCP 协议 · Cursor / Claude Desktop 配置

> MCP (Model Context Protocol) 是 2026 年最火的 AI 协议标准，让 AI 应用可以无缝调用工具、访问数据源。一个中转 API Key，通吃所有 MCP 服务。

[![www.aifast.club](https://img.shields.io/badge/国内直连-572个模型-FF6B35)](https://www.aifast.club)
[![文章更新](https://img.shields.io/badge/更新-2026--07--09-green)](https://github.com/KKWANG4444/ai-api-proxy-china-guide)

---

## 目录

- [什么是 MCP？](#什么是-mcp)
- [MCP + 中转站 = 王炸组合](#mcp--中转站--王炸组合)
- [Cursor MCP 配置](#cursor-mcp-配置)
- [Claude Desktop MCP 配置](#claude-desktop-mcp-配置)
- [Windsurf / Cline MCP 配置](#windsurf--cline-mcp-配置)
- [常用 MCP Server 推荐](#常用-mcp-server-推荐)
- [MCP + 中转 FAQ](#mcp--中转-faq)

---

## 什么是 MCP？

MCP 全称 Model Context Protocol，由 Anthropic 在 2025 年提出，现在已成为 AI 工具链的事实标准。它定义了一套统一的协议，让 AI 模型能够：

- 调用外部工具（搜索引擎、数据库、文件系统）
- 读取外部数据源（本地文件、API、知识库）
- 执行跨平台操作（浏览器、终端、IDE）

简单说：**MCP 让 AI 从"聊天机器人"变成了"能动手的智能助手"。**

目前支持 MCP 的主流工具包括：

| 工具 | 类型 | MCP 支持度 |
|:---|:---|:---:|
| Cursor | AI 编辑器 | ✅ 原生支持 |
| Claude Desktop | 桌面客户端 | ✅ 原生支持 |
| Windsurf | AI 编辑器 | ✅ 原生支持 |
| VS Code + Cline | 编辑器插件 | ✅ 支持 |
| Continue.dev | AI 插件 | ✅ 支持 |

## MCP + 中转站 = 王炸组合

MCP 本身只解决"协议"问题，不解决"连接"问题。你在国内调 MCP 服务，一样面临：

- 官方 API 区域封锁
- 需要海外支付
- 多模型切换复杂

**中转站 + MCP = 国内直接使用 MCP 生态。**

配置方法极其简单——所有 MCP 客户端都支持自定义 API Base URL。把地址改成中转站的地址就行：

```
https://www.aifast.club/v1
```

一个 Key 通吃 Claude Opus 4.7、GPT-5.5、DeepSeek V4 等所有 MCP 服务，无需切换。下面逐个工具教你怎么配。

---

## Cursor MCP 配置

Cursor 在 2026 年已经完全拥抱 MCP 协议。你可以直接在设置里配置 MCP Server。

### 操作步骤

1. 打开 Cursor → `Settings` → `Features` → `MCP`
2. 添加 MCP Server：

```json
{
  "mcpServers": {
    "web-search": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-web-search"],
      "env": {
        "ANTHROPIC_BASE_URL": "https://www.aifast.club/v1",
        "ANTHROPIC_API_KEY": "你的APIKey"
      }
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-filesystem", "/path/to/project"]
    }
  }
}
```

3. 保存后，Cursor 会自动连接到 MCP Server
4. 在对话中 Cursor 会自动调用这些工具

### 验证

在 Cursor 中问："搜索一下最新的 Python 3.13 特性"。如果能正常返回搜索结果，就说明 MCP 配通了。

### 生产建议

如果你在生产环境用，推荐用环境变量的方式注入 API Key，避免写在配置里：

```bash
# .zshrc 或 .bashrc
export ANTHROPIC_BASE_URL="https://www.aifast.club/v1"
export ANTHROPIC_API_KEY="你的APIKey"
```

---

## Claude Desktop MCP 配置

Claude Desktop 是 MCP 的"亲爹"，支持最完善。

### 操作步骤

1. 打开 Claude Desktop → `Settings` → `Developer` → `Edit Config`
2. 编辑 `claude_desktop_config.json`：

```json
{
  "mcpServers": {
    "web-search": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-web-search"],
      "env": {
        "ANTHROPIC_BASE_URL": "https://www.aifast.club/v1",
        "ANTHROPIC_API_KEY": "你的APIKey"
      }
    },
    "sqlite": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-sqlite", "/Users/you/data.db"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-github"],
      "env": {
        "GITHUB_TOKEN": "你的GitHubToken"
      }
    }
  }
}
```

3. 重启 Claude Desktop
4. 对话中会自动出现工具调用

### 验证

在 Claude Desktop 里说："帮我看看这个数据库里有哪些表"。如果能正常查询 SQLite 数据库，就说明 MCP 配置成功了。

---

## Windsurf / Cline MCP 配置

Windsurf 和 Cline（VS Code 插件）都支持 MCP 协议。

### Windsurf 配置

1. 打开 Windsurf → `Settings` → `MCP Servers`
2. 添加 Server，配置方式和 Cursor 基本一致

### Cline (VS Code) 配置

1. VS Code → 安装 Cline 插件
2. 打开 Cline 设置 → `MCP Servers`
3. 添加：

```json
{
  "mcpServers": {
    "sequelize": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-sequelize"],
      "env": {
        "ANTHROPIC_BASE_URL": "https://www.aifast.club/v1",
        "ANTHROPIC_API_KEY": "你的APIKey"
      }
    }
  }
}
```

---

## 常用 MCP Server 推荐

以下是我实测好用的 MCP Server，全部可以用中转站 + 国内环境跑通：

| MCP Server | 用途 | 安装方式 |
|:---|:---|:---|
| `@anthropic/mcp-web-search` | 联网搜索 | `npx -y @anthropic/mcp-web-search` |
| `@anthropic/mcp-filesystem` | 文件操作 | `npx -y @anthropic/mcp-filesystem <path>` |
| `@anthropic/mcp-sqlite` | 数据库查询 | `npx -y @anthropic/mcp-sqlite <db_path>` |
| `@anthropic/mcp-github` | GitHub 操作 | `npx -y @anthropic/mcp-github` |
| `@anthropic/mcp-sequelize` | ORM 查询 | `npx -y @anthropic/mcp-sequelize` |
| `@anthropic/mcp-slack` | Slack 集成 | `npx -y @anthropic/mcp-slack` |
| `@modelcontextprotocol/mcp-puppeteer` | 浏览器自动化 | `npx -y @modelcontextprotocol/mcp-puppeteer` |
| `@modelcontextprotocol/mcp-server-brave-search` | Brave 搜索 | 需安装 `brave-search` |

> 💡 **提示：** 所有需要 `ANTHROPIC_BASE_URL` 和 `ANTHROPIC_API_KEY` 的 MCP Server，都可以用 `https://www.aifast.club/v1` 和你的中转站 API Key 直接对接。

---

## MCP + 中转 FAQ

**Q: 中转站能用 MCP 吗？会不会不兼容？**

能。MCP 底层走的就是 OpenAI 兼容接口（`/v1/messages`），中转站也是 OpenAI 兼容的，完全兼容。

**Q: 为什么有的 MCP Server 配置后没反应？**

检查几件事：
- API Key 有没有过期
- Base URL 末尾有没有加 `/v1`
- MCP Server 的 `command` 是不是已安装（用 `npx` 需要联网）

**Q: MCP 调用走中转站会不会慢？**

不会。国内节点直连，TTFT 一般在 200-400ms，比起直连海外要快 5-10 倍。

**Q: 免费试用能不能测 MCP？**

注册就送体验额度，足够你把所有主流 MCP Server 测一遍。

---

> 🔗 **[www.aifast.club](https://www.aifast.club) — 一个 API Key，接入 572 个模型，支持 MCP 协议，国内直连。**

[![Gitee镜像](https://img.shields.io/badge/Gitee-国内镜像-red)](https://gitee.com/kkwwww4444/ai-api-proxy-china-guide)
