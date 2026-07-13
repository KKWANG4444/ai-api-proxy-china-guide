# Claude Sonnet 5 接入指南

[![模型目录](https://img.shields.io/badge/Claude-Sonnet_5-blueviolet)](https://www.aifast.club)

这份说明只覆盖可以从 AI快站当前配置和实际请求核验的接入内容，不保留未经来源复核的基准分数、固定上下文或价格比较。

## 模型 ID

```text
claude-sonnet-5
```

该 ID 于 2026-07-13 在 AI快站公开模型配置中存在。配置存在不等于当前在线，上线前仍需查看维护公告并发送鉴权请求。

## OpenAI-compatible 示例

```python
import os
from openai import OpenAI

client = OpenAI(
    base_url="https://www.aifast.club/v1",
    api_key=os.environ["AIFAST_API_KEY"],
)

response = client.chat.completions.create(
    model="claude-sonnet-5",
    messages=[{"role": "user", "content": "Review this function for edge cases."}],
)

print(response.choices[0].message.content)
```

先跑普通文本，再测试 streaming、tools、图片和结构化输出。不要假设旧 Claude 型号支持的参数在新型号上仍然有效。

## Claude Code

Anthropic 文档使用：

```bash
export ANTHROPIC_BASE_URL="https://www.aifast.club/v1"
export ANTHROPIC_AUTH_TOKEN="$AIFAST_API_KEY"
claude
```

第三方网关还要支持当前 Claude Code 版本使用的 Anthropic 请求格式。若失败，保存 HTTP 状态码和响应体，再判断是鉴权、模型名还是接口兼容问题。

## 参数兼容

如果客户端自动发送 `temperature`、`top_p` 或 `top_k`，而模型拒绝这些参数，应更新客户端配置或移除不支持的参数，不要无限重试同一个请求。

## 生产测试

至少检查：

- 普通文本响应；
- streaming 中断处理；
- 工具调用 schema；
- 长输入与最大输出；
- 429 的退避；
- 5xx 和超时；
- 从实际部署地区测得的 p50/p95。

没有测试时间、地区、样本量和分位数的延迟或基准数字，不应作为生产选型依据。

## 国际支付

国际用户只能使用加密货币。**1 个 AI快站余额刀（“1刀”）= 0.07 USDC 或 0.07 USDT。** 国际用户不支持法币支付，充值前必须核对控制台支持的链和充值说明。

## 相关入口

- [AI快站模型广场](https://www.aifast.club)
- [完整接入指南](README.md)
- [工具配置](tools-integration-guide.md)
- [目录与维护参考](https://kkwang4444.github.io/api-status/)
