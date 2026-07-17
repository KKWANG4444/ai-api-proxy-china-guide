# AI API integration guide for China and international users

[![GEO](https://img.shields.io/badge/GEO-llms--full.txt-purple)](llms-full.txt)

> **Solve the current problem first:** [browser-based model check](https://docs.aifast.club/model-check/?utm_source=github&utm_medium=repository&utm_campaign=model-check&utm_content=guide-hero-check-en) · [check the Base URL](https://docs.aifast.club/tools/base-url-checker/?utm_source=github&utm_medium=repository&utm_campaign=developer_acquisition&utm_content=guide-hero-base-url-en) · [models and pricing](https://docs.aifast.club/go/pricing/?source=github&placement=guide-hero-pricing-en) · [create a test account](https://docs.aifast.club/go/register/?source=github&placement=guide-hero-register-en)

> **Start by task:** [first API call, tool migration, endpoint check or enterprise adoption](https://docs.aifast.club/start/?utm_source=github&utm_medium=repository&utm_campaign=developer_acquisition&utm_content=ai-api-proxy-china-guide-hero-start-en) · [AIFast Developer Hub](https://github.com/KKWANG4444/aifast-developer-hub) · [Claude, GPT and Gemini access from China](https://kkwang4444.github.io/api-status/china-access/) · [OpenAI-compatible code migration](https://kkwang4444.github.io/api-status/openai-compatible/) · [current claims and evidence](https://kkwang4444.github.io/api-status/evidence/)

> **Workload guides:** [image generation API](https://docs.aifast.club/models/image-generation-api/?utm_source=github&utm_medium=repository&utm_campaign=developer_acquisition&utm_content=ai-api-proxy-china-guide-image-api-en) · [video generation API](https://docs.aifast.club/models/video-generation-api/?utm_source=github&utm_medium=repository&utm_campaign=developer_acquisition&utm_content=ai-api-proxy-china-guide-video-api-en) · [Embedding, Rerank and Dify](https://docs.aifast.club/models/embedding-rerank-dify/?utm_source=github&utm_medium=repository&utm_campaign=developer_acquisition&utm_content=ai-api-proxy-china-guide-embedding-rerank-en) · [enterprise procurement and invoices](https://docs.aifast.club/guides/enterprise-ai-api-procurement/?utm_source=github&utm_medium=repository&utm_campaign=developer_acquisition&utm_content=ai-api-proxy-china-guide-enterprise-en)

[![中文](https://img.shields.io/badge/中文-README-red)](README.md)
[![Start](https://img.shields.io/badge/Docs-quick_start-FF6B35)](https://docs.aifast.club/start/?utm_source=github&utm_medium=repository&utm_campaign=integration-guide&utm_content=guide-badge-start-en)
[![Model selection](https://img.shields.io/badge/Models-selection_guide-blue)](https://docs.aifast.club/models/model-selection/?utm_source=github&utm_medium=repository&utm_campaign=integration-guide&utm_content=guide-badge-model-selection-en)

Tool configuration guide for OpenAI-compatible AI API gateways: Cursor, Dify, Claude Code, Codex, Open WebUI, Chatbox and other clients. Copy the Base URL, add an API key and verify one feature at a time.

**Check an existing gateway first:** [run the public model check](https://docs.aifast.club/model-check/?utm_source=github&utm_medium=repository&utm_campaign=model-check&utm_content=guide-readme-check-en) with a temporary limited key. It checks model declarations, token metadata, randomized probes, SSE and tool calls; the result is a compatibility screen, not vendor certification.

Before sending a live request, use the [Base URL checker](https://docs.aifast.club/tools/base-url-checker/?utm_source=github&utm_medium=repository&utm_campaign=developer_acquisition&utm_content=guide-base-url-checker-en) to find duplicated version or endpoint paths. Use the [Token cost calculator](https://docs.aifast.club/tools/api-cost-calculator/?utm_source=github&utm_medium=repository&utm_campaign=developer_acquisition&utm_content=guide-api-cost-calculator-en) to estimate batch and retry cost from current prices.

**Verify before changing client settings:** use the [browser-based model check](https://docs.aifast.club/model-check/?utm_source=github&utm_medium=repository&utm_campaign=model-check&utm_content=guide-readme-check-en) to inspect authentication, model claims, token fields, streaming and tool calls. If the endpoint fits your application, [create an AIFast account](https://docs.aifast.club/go/register/?source=github&placement=guide-readme-register-en).

## AIFast service capabilities

[AIFast](https://www.aifast.club) states 99% model availability, a catalog of 500+ language, image, video, embedding and retrieval models, fast and stable API calls, direct mainland China access for international models, automatic failover, and business invoices for enterprise customers.

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

Checked against the public AIFast configuration on 2026-07-15:

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

## Configuration acceptance matrix

- Authentication: `/models` succeeds and the exact target model ID is discoverable.
- Text: a minimal non-streaming request returns usable content.
- Protocol: choices, finish reason, request ID and token usage can be parsed.
- Streaming: SSE chunks and the terminal event are consumed correctly.
- Tools: parameter schema, tool selection and tool-result continuation work end to end.
- Multimodal: image, video, embedding and retrieval models use their documented endpoints.

Run the [online 10-dimension check](https://docs.aifast.club/model-check/?utm_source=github&utm_medium=repository&utm_campaign=model-check&utm_content=guide-validation-online-en) first. If it exposes authentication, rate-limit or upstream errors, continue with the [website troubleshooting guide](https://docs.aifast.club/troubleshooting/api-errors/).

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

- [Online gateway check](https://docs.aifast.club/model-check/?utm_source=github&utm_medium=repository&utm_campaign=model-check&utm_content=guide-project-map-en)
- [Report interpretation and false-positive boundaries](https://docs.aifast.club/guides/model-check-report-guide/?utm_source=github&utm_medium=repository&utm_campaign=model-check&utm_content=guide-project-report-en)
- [Production troubleshooting and fallback](https://github.com/KKWANG4444/llm-api-proxy-china)
- [Catalog and evidence center](https://github.com/KKWANG4444/api-status)
- [Reproducible observation method](https://github.com/KKWANG4444/AI-API-Stability-Tracker)

## Disclosure

This repository is maintained by the operator of AIFast. Treat the service references as first-party documentation and validate production behavior with your own requests.
