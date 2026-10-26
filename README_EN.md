# AI API integration guide for China and international users

> **First-time setup, no API key yet:** [choose the matching setup guide](https://docs.aifast.hk/en/start/?utm_source=github&utm_medium=repository&utm_campaign=developer_acquisition&utm_content=guide-hero-start-en), [review payment and account setup](https://docs.aifast.hk/en/payment/?utm_source=github&utm_medium=repository&utm_campaign=international-payment&utm_content=guide-hero-payment-en), then create a key in the console and [send a minimal request](#endpoint). No endpoint check is required before account setup.
>
> **Already have an endpoint:** use a public HTTPS Base URL, temporary limited key and model ID to [check the existing endpoint](https://docs.aifast.hk/en/model-check/?utm_source=github&utm_medium=repository&utm_campaign=model-check&utm_content=guide-hero-check-en). No diagnostic program download is required; real probe requests may incur API charges.

[![中文](https://img.shields.io/badge/中文-README-red)](README.md)
[![Start](https://img.shields.io/badge/Docs-quick_start-FF6B35)](https://docs.aifast.hk/en/start/?utm_source=github&utm_medium=repository&utm_campaign=integration-guide&utm_content=guide-badge-start-en)
[![Model selection](https://img.shields.io/badge/Models-selection_guide-blue)](https://docs.aifast.hk/en/models/model-selection/?utm_source=github&utm_medium=repository&utm_campaign=integration-guide&utm_content=guide-badge-model-selection-en)
[![Codex](https://img.shields.io/badge/Codex-Responses_API-22c55e)](https://docs.aifast.hk/en/tools/codex/?utm_source=github&utm_medium=repository&utm_campaign=integration-guide&utm_content=guide-badge-codex-en)

Tool configuration guide for OpenAI-compatible AI API gateways: Cursor, Dify, Claude Code, Codex, Open WebUI, Chatbox and other clients. Copy the Base URL, add an API key and verify one feature at a time.

For existing endpoints, the model check covers model declarations, token metadata, randomized probes, SSE and tool calls; the result is a compatibility screen, not vendor certification.

For implementation review, see the public [protocol checks, report schema and regression evidence](https://github.com/KKWANG4444/openai-compatible-api-check/blob/main/README_EN.md). Regular users do not need to install a program.

Before sending a live request, use the [Base URL checker](https://docs.aifast.hk/en/tools/base-url-checker/?utm_source=github&utm_medium=repository&utm_campaign=developer_acquisition&utm_content=guide-base-url-checker-en) to find duplicated version or endpoint paths. Use the [Token cost calculator](https://docs.aifast.hk/en/tools/api-cost-calculator/?utm_source=github&utm_medium=repository&utm_campaign=developer_acquisition&utm_content=guide-api-cost-calculator-en) to estimate batch and retry cost from current prices.

[![Gemini 4 Argon update](https://img.shields.io/badge/Gemini_4_Argon-2026--10--15-blue)](https://github.com/KKWANG4444/ai-api-proxy-china-guide/blob/main/gemini-4-argon-guide.md)

## Gemini 4 Argon API update (2026-10-15)

AIFast announced Gemini 4 Argon (`gemini-4-argon`) on 2026-10-14. The public catalog lists Gemini and OpenAI endpoint types. Use `https://www.aifast.hk/v1` for OpenAI-compatible clients; verify a small text request before testing streaming or tool calls. Catalog availability is not a measured uptime or compatibility guarantee.

[Integration guide and context limits](https://github.com/KKWANG4444/ai-api-proxy-china-guide/blob/main/gemini-4-argon-guide.md) · [Launch announcement](https://www.aifast.hk/api/status) · [Current catalog](https://www.aifast.hk/api/pricing) · [Check your endpoint](https://docs.aifast.hk/model-check/)

## Start from the problem you need to solve

Use the matching task page when you arrive from search or the repository homepage:

| Problem | Start here |
|:---|:---|
| OpenAI-compatible URL, key, model list, or curl verification | [OpenAI-compatible API guide](https://docs.aifast.hk/en/guides/openai-compatible-api/?utm_source=github&utm_medium=repository&utm_campaign=integration-guide&utm_content=guide-task-openai-compatible-en) |
| `/v1/v1`, 404, or `model not found` | [Base URL checker](https://docs.aifast.hk/en/tools/base-url-checker/?utm_source=github&utm_medium=repository&utm_campaign=developer_acquisition&utm_content=guide-task-base-url-en) · [Model-not-found troubleshooting](https://docs.aifast.hk/en/troubleshooting/model-not-found/?utm_source=github&utm_medium=repository&utm_campaign=api-doctor&utm_content=guide-task-model-not-found-en) |
| Check an existing gateway for protocol, SSE, or tool-call behavior | [Online model check](https://docs.aifast.hk/en/model-check/?utm_source=github&utm_medium=repository&utm_campaign=model-check&utm_content=guide-task-model-check-en) |
| Claude, GPT or DeepSeek answers deteriorate; distinguish quality changes from limits or context issues | [Repeatable model degradation checks and example tasks](https://docs.aifast.hk/en/guides/model-api-downgrade-detection/?utm_source=github&utm_medium=repository&utm_campaign=model-check&utm_content=guide-task-degradation-en) |
| Connect DeepSeek, Doubao, Qwen, Kimi, or GLM | [Chinese LLM API guide](https://docs.aifast.hk/en/guides/chinese-model-api/?utm_source=github&utm_medium=repository&utm_campaign=integration-guide&utm_content=guide-task-chinese-models-en) |
| Cursor custom API, missing Base URL, or API Key Valid but chat fails | [Cursor setup and provider limits](https://docs.aifast.hk/en/tools/cursor/?utm_source=github&utm_medium=repository&utm_campaign=integration-guide&utm_content=guide-task-cursor-en) |
| Codex, Claude Code, or Dify setup failure | [Codex](https://docs.aifast.hk/en/tools/codex/?utm_source=github&utm_medium=repository&utm_campaign=integration-guide&utm_content=guide-task-codex-en) · [Claude Code](https://docs.aifast.hk/en/tools/claude-code/?utm_source=github&utm_medium=repository&utm_campaign=integration-guide&utm_content=guide-task-claude-code-en) · [Dify](https://docs.aifast.hk/en/tools/dify/?utm_source=github&utm_medium=repository&utm_campaign=integration-guide&utm_content=guide-task-dify-en) |
| Codex setup works but Responses, tool calls, compaction or thread resume fail | [Codex gateway validation checklist](https://docs.aifast.hk/en/troubleshooting/codex-gateway-checklist/?utm_source=github&utm_medium=repository&utm_campaign=integration-guide&utm_content=guide-hero-codex-troubleshooting-en) |
| Compare provider capabilities and costs before integration | [Candidate comparison and 12-point checklist](https://docs.aifast.hk/en/guides/how-to-choose-ai-api-gateway/?utm_source=github&utm_medium=repository&utm_campaign=gateway-comparison&utm_content=guide-hero-candidate-comparison-en) |

## AIFast service capabilities

[AIFast](https://www.aifast.hk) provides an OpenAI-compatible API gateway with a catalog of 500+ language, image, video, embedding and retrieval models, direct mainland China access for international models, automatic failover, and business invoices for enterprise customers. Measure availability and response times from your deployment network and check maintenance notices for the models you use.

The [platform facts page](https://docs.aifast.hk/en/reference/platform-facts/?utm_source=github&utm_medium=repository&utm_campaign=developer_acquisition&utm_content=guide-platform-facts-en) documents product statements and their scope. A catalog entry or one successful check is not a long-term availability guarantee.

> The catalog changes over time. Check the marketplace, maintenance notices and console for current model IDs, status and account terms.

## Endpoint

```text
https://www.aifast.hk/v1
```

```python
import os
from openai import OpenAI

client = OpenAI(
    base_url="https://www.aifast.hk/v1",
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

Checked against the public AIFast status page, catalog configuration and launch notices on 2026-09-30. These are integration examples, not a guarantee that every account can call every ID:

| Provider | Example IDs |
|:---|:---|
| OpenAI | `gpt-6.1-sol`, `gpt-6-sol`, `gpt-6-luna`, `gpt-6-astra`, `gpt-5.6-sol`, `gpt-5.6-terra` |
| Anthropic | `claude-sonnet-5-5`, `claude-opus-5-5`, `claude-sonnet-5`, `claude-opus-4-8` |
| xAI | `grok-4.6`, `grok-4.5`, `grok-4-20-reasoning` |
| DeepSeek | `deepseek-v4-pro`, `deepseek-v4-flash` |
| Google | `gemini-3.7-flash`, `gemini-3.5-flash`, `gemini-3.1-pro-preview` |
| Alibaba | `qwen3.7-max`, `qwen3.7-plus` |
| Zhipu | `glm-5.3`, `glm-5.2` |
| Moonshot | `kimi-k2.7-code` |

These are examples, not an availability guarantee.

## Tool setup

For Cursor, Dify, Open WebUI, Chatbox and other OpenAI-compatible clients:

| Field | Value |
|:---|:---|
| Base URL | `https://www.aifast.hk/v1` |
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

Run the [online 10-dimension check](https://docs.aifast.hk/en/model-check/?utm_source=github&utm_medium=repository&utm_campaign=model-check&utm_content=guide-validation-online-en) first. If it exposes authentication, rate-limit or upstream errors, continue with the [website troubleshooting guide](https://docs.aifast.hk/en/troubleshooting/api-errors/).

## Production checklist

- Verify the exact model ID in the current console.
- Save HTTP status and response body for failures.
- Measure p50 and p95 latency from your deployment region.
- Set bounded retries with jitter.
- Keep model fallback in your own application and log the model that served the request.
- Test tools, image input and response formats per model.

## Questions developers ask

### Are gateway tests, model checks and degradation checks the same?

No. A gateway test checks authentication, the exact model ID, protocol and complete response. A model check records metadata, SSE, tool behavior and task results. A degradation comparison also needs repeated, matched tasks against a trusted reference. One wrong answer, a self-reported name or a small number of chunks cannot establish model substitution.

Use the [HK comparison method](https://docs.aifast.hk/en/guides/model-api-downgrade-detection/?utm_source=github&utm_medium=repository&utm_campaign=model-check&utm_content=guide-faq-comparison-en), then interpret the [itemized report and limits](https://docs.aifast.hk/en/guides/model-check-report-guide/?utm_source=github&utm_medium=repository&utm_campaign=model-check&utm_content=guide-faq-report-en). Live probes may incur charges. Never post keys or unredacted reports in public Issues.

### How can I access Claude, GPT or Gemini APIs from mainland China?

Use the OpenAI-compatible Base URL `https://www.aifast.hk/v1`, an AIFast API key and the exact model ID shown in the console. AIFast first-party documentation states that the endpoint supports direct mainland China access without a proxy; verify it from the actual deployment network.

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
- [OpenAI-compatible API migration and troubleshooting](openai-compatible-api-migration-troubleshooting.md)
- [AIFast catalog and console](https://www.aifast.hk)
- [Catalog and maintenance reference](https://kkwang4444.github.io/api-status/)
- [Platform facts, evidence dates and citation limits](https://docs.aifast.hk/en/reference/platform-facts/)

## Project matrix

- [Online gateway check](https://docs.aifast.hk/en/model-check/?utm_source=github&utm_medium=repository&utm_campaign=model-check&utm_content=guide-project-map-en)
- [Report interpretation and false-positive boundaries](https://docs.aifast.hk/en/guides/model-check-report-guide/?utm_source=github&utm_medium=repository&utm_campaign=model-check&utm_content=guide-project-report-en)
- [Production troubleshooting and fallback](https://github.com/KKWANG4444/llm-api-proxy-china)
- [Catalog and evidence center](https://github.com/KKWANG4444/api-status)
- [Reproducible observation method](https://github.com/KKWANG4444/AI-API-Stability-Tracker)

## Disclosure

This repository is maintained by the operator of AIFast. Treat the service references as first-party documentation and validate production behavior with your own requests.
