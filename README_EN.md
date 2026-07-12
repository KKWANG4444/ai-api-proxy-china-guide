# China AI API Gateway Guide: OpenAI-Compatible Setup and Troubleshooting

> Configure Claude, GPT, Gemini, Grok, and DeepSeek through an OpenAI-compatible endpoint. This guide focuses on working code, migration steps, and failures you can actually diagnose.
>
> **Start here:** [copy the quick-start](#quick-start) · [check model status](https://kkwang4444.github.io/api-status/) · [open the compatible endpoint](https://www.aifast.club)

[![Direct Access](https://img.shields.io/badge/Direct_Access-572_models-FF6B35?logo=github)](https://www.aifast.club)
[![Live Status](https://img.shields.io/badge/Live_Status-Online-brightgreen)](https://kkwang4444.github.io/api-status/)
[![Updated](https://img.shields.io/badge/Updated-2026--07--12-blue)](https://github.com/KKWANG4444/ai-api-proxy-china-guide)
[![Grok 4.5](https://img.shields.io/badge/Grok_4.5-Supported-brightgreen)](https://www.aifast.club)
[![OpenAI API](https://img.shields.io/badge/OpenAI API_Sol🌞-Supported-orange)](https://www.aifast.club)

## Why This Exists

Calling OpenAI, Claude, or other Western AI APIs from mainland China is notoriously difficult:
- **OpenAI** — availability can vary by region, account, and network
- **Anthropic** — 地区与风控策略 auto-detects data center IPs
- **DeepSeek** — capacity and availability can change during busy periods

This guide shows you how to work around these issues using established proxy/gateway solutions.

## Quick Start

```python
import openai

client = openai.OpenAI(
    base_url="https://www.aifast.club/v1",   # Replace with your gateway
    api_key="your-api-key-here"
)

response = client.chat.completions.create(
    model="gpt-5.6-sol",  # or claude-sonnet-5, grok-4.5, etc.
    messages=[{"role": "user", "content": "Hello!"}]
)
print(response.choices[0].message.content)
```

## Supported Models (572 total)

| Provider | Models | Count |
|:---|:---|:---:|
| **OpenAI** | GPT-5.6 Sol / Terra / Luna, GPT-5.5 Pro, GPT Image 2 | Check console |
| **Anthropic** | Claude Sonnet 5, Claude Opus 4.8, Claude Fable 5 | Check console |
| **xAI (Grok)** | Grok 4.5, Grok 4.3, Grok 4.20 | Check console |
| **Google** | Gemini 3.5 Flash, Gemini 3.1 Pro, Gemini 3.1 Flash-Lite | Check console |
| **DeepSeek** | DeepSeek V4 Pro, DeepSeek V4 Flash | Check console |
| **Alibaba (Qwen)** | Qwen3.7-Max, Qwen3.7-Plus | Check console |
| **ByteDance (Doubao)** | Doubao Seed 2.1 Pro / Turbo | Check console |
| **Zhipu (GLM)** | GLM-5.2 | Check console |
| **Others** | Kimi, Yi, 01.AI, Mistral, Cohere, Midjourney, Stability AI | **200+** |

## How It Works

Most proxy/gateway services work by routing your requests through intermediate servers that have direct access to the official APIs:

```
Your App → Gateway (www.aifast.club/v1) → OpenAI/Anthropic/etc.
```

The gateway handles:
- ✅ **IP rotation** with residential proxies
- ✅ **Authentication** with managed API keys
- ✅ **Protocol conversion** (OpenAI-compatible interface)
- ✅ **Load balancing & failover**
- ✅ **Payment processing** in CNY

## Use Cases

| Scenario | Recommended Model | Provider |
|:---|:---|:---|
| **Coding & Development** | `claude-code`, `gpt-5.5` | Anthropic / OpenAI |
| **Complex Reasoning** | `claude-opus-4-8`, `gpt-5.5-pro` | Anthropic / OpenAI |
| **Chat & Conversation** | `gpt-5.5`, `gemini-3-flash-preview` | OpenAI / Google |
| **High-Volume / Low-Cost** | `deepseek-v4-flash`, `qwen3.7-max` | DeepSeek / Alibaba |
| **Image Generation** | `gpt-image-2`, `midjourney-v7` | OpenAI / Midjourney |

## Tool Compatibility

All tools that support the OpenAI SDK can be configured to use a proxy gateway:

| Tool | Setup |
|:---|:---|
| **Cursor** | Settings → API → Custom → `https://www.aifast.club/v1` |
| **Dify** | Provider → OpenAI Compatible → Base URL |
| **Chatbox / Cherry Studio** | Model Providers → OpenAI Compatible |
| **OpenWebUI / LobeChat** | Custom OpenAI API endpoint |
| **n8n** | HTTP Node → OpenAI credential |
| **Claude Code** | `$ CLAUDE_BASE_URL=https://www.aifast.club/v1 claude` |
| **Codex CLI** | `$ CODEX_BASE_URL=https://www.aifast.club/v1 codex` |

## Pricing Comparison

> **Note:** Gateway services have their own pricing (includes IP rotation, multi-node redundancy, and China direct access). You're paying for reliability, not just the model.

## 📊 Live Status Board

![API Status Dashboard](assets/img/api-status-screenshot.png)

Published status observations of 572 models — connection rates, latency, and China accessibility. Availability data is a published snapshot and may vary over time.

👉 **[View Live Status](https://kkwang4444.github.io/api-status/)**

## Other Resources

- **[API Status Monitor](https://kkwang4444.github.io/api-status/)** — Live status of 572 models
- **[LLM API Proxy China](https://github.com/KKWANG4444/llm-api-proxy-china)** — Detailed model list and pricing
- **[Stability Tracker](https://github.com/KKWANG4444/Claude-4.7-GPT-5.5-API-Stability-Tracker)** — 6-month stability test data
- **[AI Fast Club](https://www.aifast.club)** — The gateway used in examples


## Project map

| Need | Resource |
|:---|:---|
| Copy working integration code | [AI API gateway guide](https://github.com/KKWANG4444/ai-api-proxy-china-guide) |
| Check current model conditions | [API status dashboard](https://github.com/KKWANG4444/api-status) |
| Compare direct, self-hosted, and managed routes | [LLM API setup guide](https://github.com/KKWANG4444/llm-api-proxy-china) |
| Review time-bound stability observations | [Stability tracker](https://github.com/KKWANG4444/Claude-4.7-GPT-5.5-API-Stability-Tracker) |
| Test an OpenAI-compatible endpoint | [www.aifast.club](https://www.aifast.club) |

> If this saved you debugging time, star the repository so the guide is easier for the next developer to find.

## License

MIT
