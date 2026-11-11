# Gemini 4 Carbon API 国内接入：模型 ID、最小请求与分组排错

更新日期：2026-11-11。

AI快站已上架 `gemini-4-carbon`。需要接入 Gemini API 中转时，先确认 Key 权限和精确模型 ID，再验证一个短文本请求，不必先迁移整套 Agent 工作流。

## 已核对的目录信息

| 项目 | 2026-11-11 公开记录 |
| --- | --- |
| 精确模型 ID | `gemini-4-carbon` |
| 目录状态 | `available=true` |
| 接口类型标签 | `gemini`、`openai` |
| 分组 | `Aistudio-Gemini-2`、`Aistudio-Gemini-3`、`Aistudio-Gemini-4`、`Vertex-Gemini-2`、`Vertex-Gemini-3` |
| OpenAI-compatible Base URL | `https://www.aifast.hk/v1` |
| 上架公告 | `模型上架：gemini-4-carbon`，发布时间 `2026-11-11T07:32:50.826Z` |

来源：[HK 模型目录](https://www.aifast.hk/api/pricing)、[上架公告](https://www.aifast.hk/api/announcements)。这些记录说明公开目录已收录该模型，不证明每个 Key 都有访问权限，也不代表已经完成生成、SSE 或工具调用实测。分组名称应逐项核对，不要把展示名称当成模型 ID。

[Google 在 2026-11-10 的发布说明](https://blog.google/innovation-and-ai/technology/developers-tools/gemini-4-carbon-developers/)把 Carbon 定位于软件工程、长任务 Agent 和科学研究等多步骤任务。这是模型厂商的定位，不是本仓库对中转接口的性能测量；这里不填写未经验证的价格、跑分或上下文上限。

## 用最小请求确认接入

在本地环境或密钥管理器设置临时限额的 `AIFAST_API_KEY`，不要把真实 Key 放进仓库、截图或工单。下面是供你执行的配置示例，本轮没有代你执行付费生成请求；真实请求可能产生费用。

```bash
: "${AIFAST_API_KEY:?请先在本地设置临时限额 AIFAST_API_KEY}"
curl --silent --show-error --fail-with-body \
  --connect-timeout 10 --max-time 60 \
  'https://www.aifast.hk/v1/chat/completions' \
  -H "Authorization: Bearer ${AIFAST_API_KEY}" \
  -H 'Content-Type: application/json' \
  --data '{"model":"gemini-4-carbon","messages":[{"role":"user","content":"用两句话解释 API 幂等性。"}],"stream":false}'
```

这里的连接和总超时只是首次排错的应用设置，不是服务响应时间承诺；超时也不证明上游任务已经取消。示例不自动重试，避免把多次请求或重复费用隐藏起来。

使用 OpenAI SDK 或自定义 provider 时填写 `https://www.aifast.hk/v1`，由客户端补上 `/chat/completions`。curl 示例直接填写完整路径。不要同时在 Base URL 和客户端路由中重复 `/v1`。

## 再检查流式、工具与 Agent

先查看 HTTP 状态、响应结构、正文、结束原因和 usage；HTTP 200 或模型自报名称不能单独证明任务完成或底层模型身份。短文本通过后，再分别测试 SSE 正常结束、客户端取消、工具参数、工具结果回传和实际任务输出。

目录中的 `openai` 标签不等于所有 OpenAI 接口都受支持，不能据此推断 Responses API、Codex 或 Claude Code 兼容。`gemini` 标签也不提供完整的原生请求路径或参数约定；切换 Google 原生 SDK 前，应核对当前网关文档。Agent 先用只读工具，写文件、花钱或对外发送信息前保留人工确认。

## 按错误处理

- `401` / `403`：核对 Key 是否启用、账户权限和认证头，不要把密钥发到公开问题区。
- `404` / `model not found`：核对 `gemini-4-carbon`、最终 URL 和 Key 分组；公开目录可用不代表当前账号有权限。
- `400`：移除可选参数，用上面的短文本请求对照；不要直接套用另一模型的 thinking 或工具参数。
- `429`：根据响应正文区分余额、配额、并发与暂时限流；只对可重试错误使用有上限的退避。
- `5xx` / 超时：保留时间、请求 ID、协议和脱敏错误正文。先确认是否已经处理，再决定是否重复请求。

[当前价格](https://www.aifast.hk/pricing?utm_source=github&utm_medium=repository&utm_campaign=gemini-4-carbon&utm_content=guide-carbon-detail-pricing) · [注册并创建 Key](https://www.aifast.hk/register?channel=c_zfxp7cp4&utm_source=github&utm_medium=repository&utm_campaign=gemini-4-carbon&utm_content=guide-carbon-detail-register) · [检测现有接口](https://docs.aifast.hk/model-check/?utm_source=github&utm_medium=repository&utm_campaign=gemini-4-carbon&utm_content=guide-carbon-detail-check)

在线检测使用临时限额 Key，提交前阅读检测页的隐私说明，测试后撤销 Key。黑盒检测能发现协议与行为差异，不能独立认证底层模型。本仓库由 AI快站运营方维护，属于第一方接入说明。

[返回接入指南](README.md) · [English overview](README_EN.md) · [生产排错](https://github.com/KKWANG4444/llm-api-proxy-china)
