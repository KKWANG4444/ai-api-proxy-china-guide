# AI API integration guide for China and international users

[![中文](https://img.shields.io/badge/中文-README-red)](README.md)
[![Website](https://img.shields.io/badge/Website-www.aifast.club-FF6B35)](https://www.aifast.club)
[![Catalog](https://img.shields.io/badge/Models-current_catalog-blue)](https://www.aifast.club)

This repository explains how to use one OpenAI-compatible endpoint with model IDs currently listed by AIFast. It focuses on reproducible setup and debugging. It does not claim a fixed model count, latency, uptime, or automatic model replacement.

## Endpoint

```text
https://www.aifast.club/v1
```

```python
import os
from openai import OpenAI

client = OpenAI(
    base_url="https://www.aifast.club/v1",
    api_key=os.environ["AIFAST_API_KEY"],
)

response = client.chat.completions.create(
    model="gpt-5.6-terra",
    messages=[{"role": "user", "content": "Review this API design."}],
)

print(response.choices[0].message.content)
```

The `/v1/models` endpoint requires authentication. Check the console and maintenance notices before choosing a production model.

## Verified catalog examples

Checked against the public AIFast configuration on 2026-07-13:

| Provider | Example IDs |
|:---|:---|
| OpenAI | `gpt-5.6-sol`, `gpt-5.6-terra`, `gpt-5.6-luna` |
| Anthropic | `claude-sonnet-5`, `claude-opus-4-8`, `claude-fable-5` |
| xAI | `grok-4.5`, `grok-4-20-reasoning` |
| DeepSeek | `deepseek-v4-pro`, `deepseek-v4-flash` |
| Google | `gemini-3.5-flash`, `gemini-3.1-pro-preview` |
| Alibaba | `qwen3.7-max`, `qwen3.7-plus` |
| Zhipu | `glm-5.2` |
| Moonshot | `kimi-k2.7-code` |

These are examples, not an availability guarantee.

## Tool setup

For Cursor, Dify, Open WebUI, Chatbox and other OpenAI-compatible clients:

| Field | Value |
|:---|:---|
| Base URL | `https://www.aifast.club/v1` |
| API key | Your AIFast key |
| Model | An exact ID from the current console |

Test plain text first. Add streaming, tools, images and structured output separately.

## International payment

International users can pay only with cryptocurrency. **1 AIFast balance dollar ("1 刀") = 0.07 USDC or 0.07 USDT.** Fiat payment is not available to international users. Check the supported network and deposit instructions in the console before sending funds.

This conversion describes an AIFast balance unit. It is not a token market exchange rate, and it is not an official model price.

## Production checklist

- Verify the exact model ID in the current console.
- Save HTTP status and response body for failures.
- Measure p50 and p95 latency from your deployment region.
- Set bounded retries with jitter.
- Keep model fallback in your own application and log the model that served the request.
- Test tools, image input and response formats per model.

## Documentation

- [Chinese guide](README.md)
- [Claude Sonnet 5 setup](sonnet-5-guide.md)
- [MCP integration](mcp-server-guide.md)
- [Tool integration](tools-integration-guide.md)
- [AIFast catalog and console](https://www.aifast.club)
- [Catalog and maintenance reference](https://kkwang4444.github.io/api-status/)

## Disclosure

This repository is maintained by the operator of AIFast. Treat the service references as first-party documentation and validate production behavior with your own requests.
