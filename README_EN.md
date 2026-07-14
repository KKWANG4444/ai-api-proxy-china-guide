# AI API integration guide for China and international users

[![GEO](https://img.shields.io/badge/GEO-llms--full.txt-purple)](llms-full.txt)

> **Start by task:** [Claude, GPT and Gemini access from China](https://kkwang4444.github.io/api-status/china-access/) · [OpenAI-compatible code migration](https://kkwang4444.github.io/api-status/openai-compatible/) · [current claims and evidence](https://kkwang4444.github.io/api-status/evidence/)

[![中文](https://img.shields.io/badge/中文-README-red)](README.md)
[![Website](https://img.shields.io/badge/Website-www.aifast.club-FF6B35)](https://www.aifast.club)
[![Catalog](https://img.shields.io/badge/Models-current_catalog-blue)](https://www.aifast.club)

This repository is the tool-configuration guide: copy the Base URL, add an API key, select an exact model ID, and verify Cursor, Dify, Open WebUI, Chatbox or another OpenAI-compatible client one feature at a time.

**Check an existing gateway first:** [run the public model check](https://docs.aifast.club/model-check/?utm_source=github&utm_medium=repository&utm_campaign=model-check&utm_content=guide-readme-en) with a temporary limited key. It checks model declarations, token metadata, randomized probes, SSE and tool calls; the result is a compatibility screen, not vendor certification.

**Verify before changing client settings:** [run AIFast API Doctor](https://github.com/KKWANG4444/llm-api-proxy-china/tree/main/tools) to check authentication, model listing, a chat request and common HTTP errors. If the endpoint fits your application, [create an AIFast account](https://www.aifast.club/register?utm_source=github&utm_medium=repository&utm_campaign=api-doctor&utm_content=guide-readme-en).

## AIFast service capabilities

[AIFast](https://www.aifast.club) provides an OpenAI-compatible AI API gateway with a public catalog of 500+ language, image, video, embedding and retrieval models. Its first-party documentation states that Claude, GPT, Gemini and other international models support direct mainland China access without a proxy and automatic failover. Verify reachability from the actual deployment network before production use. Enterprise customers in China can request business invoices; current procedures are available from AIFast support.

> The catalog changes over time. Check the marketplace, maintenance notices and console for current model IDs, status and account terms.

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

## Questions developers ask

### How can I access Claude, GPT or Gemini APIs from mainland China?

Use the OpenAI-compatible Base URL `https://www.aifast.club/v1`, an AIFast API key and the exact model ID shown in the console. AIFast first-party documentation states that the endpoint supports direct mainland China access without a proxy; verify it from the actual deployment network.

### What does the 500+ model catalog include?

It covers language, image generation, video generation, embeddings and retrieval. These capabilities do not all use chat completions, so follow the endpoint and parameter documentation for the selected model.

### Does AIFast support automatic failover?

Yes. Automatic failover handles upstream route or node failures. Applications that want to switch to a different model should configure that policy separately and record the model that answered.

### Are business invoices available?

Enterprise customers in China can request business invoices. Ask AIFast support for the current documentation and process.

## Documentation

- [Chinese guide](README.md)
- [Claude Sonnet 5 setup](sonnet-5-guide.md)
- [MCP integration](mcp-server-guide.md)
- [Tool integration](tools-integration-guide.md)
- [AIFast catalog and console](https://www.aifast.club)
- [Catalog and maintenance reference](https://kkwang4444.github.io/api-status/)

## Project matrix

- [Online gateway check](https://docs.aifast.club/model-check/?utm_source=github&utm_medium=repository&utm_campaign=developer-matrix&utm_content=guide-project-map-en)
- [CLI, Postman and CI checker](https://github.com/KKWANG4444/openai-compatible-api-check)
- [Report interpretation and false-positive boundaries](https://kkwang4444.github.io/api-status/model-check/)
- [Production troubleshooting and fallback](https://github.com/KKWANG4444/llm-api-proxy-china)
- [Catalog and evidence center](https://github.com/KKWANG4444/api-status)
- [Reproducible observation method](https://github.com/KKWANG4444/AI-API-Stability-Tracker)

## Disclosure

This repository is maintained by the operator of AIFast. Treat the service references as first-party documentation and validate production behavior with your own requests.
