# AI 工具接入参考：Cursor、Dify、Claude Code 与 Codex

[![模型目录](https://img.shields.io/badge/模型-以当前控制台为准-blue)](https://www.aifast.club)

不同工具的设置页名称会变化，但排错顺序不应变化：先确认 API Key 和模型 ID，再确认 Base URL，最后测试工具特有功能。

## 通用 OpenAI-compatible 配置

| 字段 | 内容 |
|:---|:---|
| Base URL | `https://www.aifast.club/v1` |
| API Key | 控制台创建的 Key |
| Model | 控制台当前展示的精确模型 ID |

适用于 Cursor、Dify、Open WebUI、Chatbox、LobeChat 等支持 OpenAI-compatible provider 的工具。

## Cursor

1. 打开模型或 API 设置；
2. 选择 OpenAI-compatible / custom provider；
3. 填写 Base URL 和 API Key；
4. 先添加一个当前模型 ID；
5. 用短文本测试，再测试长上下文和工具调用。

客户端版本不同，设置入口可能变化。不要把旧截图当作当前 UI 的唯一依据。

## Dify

Dify 保存 provider 时通常会发出校验请求。失败时保存完整响应，不要一次修改多个字段。

```text
Base URL: https://www.aifast.club/v1
Model: claude-sonnet-5
```

## Claude Code

Anthropic 文档使用：

```bash
export ANTHROPIC_BASE_URL="https://www.aifast.club/v1"
export ANTHROPIC_AUTH_TOKEN="$AIFAST_API_KEY"
claude
```

环境变量设置正确不代表所有 Claude Code 功能自动兼容。网关还需支持当前版本使用的 Anthropic 请求格式。

## Codex CLI

Codex 使用自定义 provider 配置。不同版本的字段可能变化，请以当前 Codex 配置参考为准，重点核对：

- `model_provider`；
- provider Base URL；
- API Key 对应的环境变量；
- 是否使用 Responses API 或 Chat Completions。

## 常见故障

### 401

检查 Bearer Key、账户状态和 Key 是否启用。

### 404 / model not found

使用控制台里的精确 ID，不要填展示名称。

### 429

使用指数退避和随机抖动，限制重试次数。

### 工具调用失败

先用普通文本确认基础接口，再测试 tools。不同模型和 provider 对 schema 的支持可能不同。

## 性能测试

不要引用脱离测试条件的固定延迟。应从实际部署区域记录：

- 测试时间；
- 模型 ID；
- 样本量；
- p50 / p95；
- HTTP 状态分布；
- 是否使用 streaming、tools 或图片。

## 账户与交易信息

账户、价格和交易规则可能调整，工具配置文档不保存具体换算。操作前以当前控制台和官方客服确认为准。

## 相关入口

- [AI快站控制台](https://www.aifast.club)
- [完整接入指南](README.md)
- [模型目录与维护参考](https://kkwang4444.github.io/api-status/)
