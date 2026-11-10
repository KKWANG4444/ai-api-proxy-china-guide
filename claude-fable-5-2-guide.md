# Claude Fable 5.2 API 国内接入：模型 ID、Claude Code 与分组排错

核验日期：2026-11-10。本文由 AI快站 HK 运营方维护，只对应 `www.aifast.hk`。English setup: [Claude API guide](https://docs.aifast.hk/en/providers/claude-api/?utm_source=github&utm_medium=repository&utm_campaign=fable-5-2&utm_content=guide-en).

**直接答案：** HK [公开模型目录](https://www.aifast.hk/api/pricing)已列出 `claude-fable-5-2`，标记 `available: true`，声明支持 `anthropic` 和 `openai` 两种端点。目录列出的分组是 `Claude-Code-1`、`Claude-Code-2`、`Claude-Code-3`；实际权限和价格仍取决于账号与所选分组。

## 新模型适合什么任务

[Anthropic 官方发布说明](https://www.anthropic.com/claude-fable-and-mythos-5-2)于 2026-11-09 发布 Fable 5.2，定位于复杂技术工作，包括编程、推理和研究。官方发布信息不是 HK 的性能测试，不能用来承诺网关的速度、长上下文、Fast mode 或工具调用均已通过验收。

本次只核对公开目录，没有使用付费 Key 发送生成请求。模型目录可用不等于实时成功率；Claude Fable 与 Claude Mythos 也不能互相当作账号授权。

## Base URL 怎么填

| 使用方式 | 配置地址 | 最终请求路径 |
| --- | --- | --- |
| OpenAI SDK 或兼容客户端 | `https://www.aifast.hk/v1` | `/v1/chat/completions` |
| Claude Code 的 `ANTHROPIC_BASE_URL` | `https://www.aifast.hk` | `/v1/messages` |
| 模型字段 | `claude-fable-5-2` | 必须使用精确 ID，不填 `Claude Fable 5.2` |

Claude Code 的完整认证与配置优先级见 [HK 配置教程](https://docs.aifast.hk/tools/claude-code/?utm_source=github&utm_medium=repository&utm_campaign=fable-5-2&utm_content=guide-claude-code)。使用 HK 签发的临时限额 Key，检查 `/status`；不要删除已有登录或把其他站点的 Key 混进来。

## OpenAI Compatible 最小请求

先在本地密钥管理器或环境变量设置 `AIFAST_API_KEY`，确认该 Key 的分组可访问模型，再执行。下列请求会消耗额度，本轮没有代你执行。

```bash
(
  set -eu
  : "${AIFAST_API_KEY:?请先在本地设置 HK 临时限额 Key}"
  curl --fail-with-body --silent --show-error \
    --connect-timeout 10 --max-time 60 \
    https://www.aifast.hk/v1/chat/completions \
    -H "Authorization: Bearer $AIFAST_API_KEY" \
    -H "Content-Type: application/json" \
    --data '{"model":"claude-fable-5-2","max_tokens":128,"messages":[{"role":"user","content":"只回复 FABLE_READY"}]}'
)
```

检查 HTTP 状态和 `choices`；响应中的 `model` 名称并不认证底层模型身份。普通文本成功后，再分别验收 SSE 完整结束、工具调用及账单，不要把一次成功扩大为所有客户端兼容。

## 为什么目录有模型，客户端却不能用

| 现象 | 先核对 | 后续入口 |
| --- | --- | --- |
| `model not found` 或无权限 | 精确 ID、Key 分组、账号模型列表；目录标记不能代替账号权限 | [模型不存在排错](https://docs.aifast.hk/troubleshooting/model-not-found/?utm_source=github&utm_medium=repository&utm_campaign=fable-5-2&utm_content=guide-model-not-found) |
| `401` | 是否为 HK Key；OpenAI 使用 Bearer，Claude Code 核对认证变量及覆盖关系 | [401 排错](https://docs.aifast.hk/troubleshooting/401-invalid-api-key/?utm_source=github&utm_medium=repository&utm_campaign=fable-5-2&utm_content=guide-401) |
| `404`、HTML 或 `/v1/v1/messages` | 客户端自动拼接后的最终地址 | [无密钥 Base URL 检查器](https://docs.aifast.hk/tools/base-url-checker/?utm_source=github&utm_medium=repository&utm_campaign=fable-5-2&utm_content=guide-path-check) |
| `429` 或并发受限 | 账号并发、额度及当前分组，不盲目增加重试 | [429 排错](https://docs.aifast.hk/troubleshooting/429-rate-limit/?utm_source=github&utm_medium=repository&utm_campaign=fable-5-2&utm_content=guide-429) |

## 价格、证据与下一步

- [当前模型与价格](https://www.aifast.hk/pricing?utm_source=github&utm_medium=repository&utm_campaign=fable-5-2&utm_content=guide-pricing)：按所选分组核对输入、输出及缓存计费，不把官方价格当本站报价。
- [HK Claude API 教程](https://docs.aifast.hk/providers/claude-api/?utm_source=github&utm_medium=repository&utm_campaign=fable-5-2&utm_content=guide-docs)：SDK 接入与分项验收。
- [创建 HK 账号](https://www.aifast.hk/register?channel=c_zfxp7cp4&utm_source=github&utm_medium=repository&utm_campaign=fable-5-2&utm_content=guide-register)：首次接入先创建独立 Key；不要求先运行付费检测。

发布证据与目录观察均注明日期；本页不宣称实测成功率、模型身份认证或未经验证的折扣。
