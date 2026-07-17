# OpenAI SDK 配置实战：timeout、retry 与排错

[← 返回主页](README.md)

调用大模型 API 报超时、偶发失败是生产环境最常见的问题。很多人遇到报错就怀疑中转或网络，其实 SDK 的默认值不一定适合你的场景。这篇说清楚怎么调 timeout 和 retry，以及出现问题从哪里开始查。

---

## 1. SDK 默认值

```python
from openai import OpenAI

client = OpenAI(
    api_key="sk-...",
    base_url="https://www.aifast.club/v1",
)
# 默认 timeout=600s（10 分钟），connect=5s
# 默认 max_retries=2
# 初始退避 0.5s，最大 8.0s
```

建 client 时不传任何参数，OpenAI SDK 的行为是：

- **超时**：总超时 600 秒，连接超时 5 秒。短文本请求几百毫秒就返回，600s 基本不起作用；但流式输出一个长文档时，如果中途没有数据分片，SDK 会等到 600s 才报错。
- **自动重试**：默认最多重试 2 次，总共最多发 3 次请求。SDK 会对连接错误、408、409、429 和 5xx 自动重试，并用带抖动的指数退避控制间隔。401、400、404 这类配置或请求错误不会靠重试解决。具体默认值以当前 `openai-python` 源码为准。

对大多数场景已经够用。但如果你的服务对响应时间敏感，或需要处理慢模型的长请求，就值得调一调。

---

## 2. 超时配置

### 连接超时

```python
from openai import OpenAI
import httpx

# 只改连接超时，其他保持默认
client = OpenAI(
    base_url="https://www.aifast.club/v1",
    http_client=httpx.Client(timeout=httpx.Timeout(600, connect=3.0)),
)
```

`connect` 控制 TCP 握手时长。国内网络调用国外 API 时有抖动，connect=5s 已经很宽松了。如果 5s 连不上，建议先检查网络，不要改成 60s——那样等一分钟才知道连不上，不值得。

### 总超时

```python
# 短模型默认足够
client = OpenAI(api_key="sk-...")

# 慢模型或长输出适当放宽总超时
client = OpenAI(
    api_key="sk-...",
    timeout=900.0,  # 15 分钟
)
```

### 流式请求

```python
stream = client.chat.completions.create(
    model="claude-sonnet-5",
    messages=[{"role": "user", "content": "写一篇 5000 字的长文..."}],
    stream=True,
    timeout=httpx.Timeout(300, read=120),
)
for chunk in stream:
    print(chunk.choices[0].delta.content or "", end="")
```

流式模式下，`read` 超时控制两个分片之间的最大等待时间。如果一个模型生成过程卡住超过 120s 不发新分片，SDK 就会报 `ReadTimeout`。这个值建议 60-120s，太短容易误报。

---

## 3. 重试配置

### 提高重试次数

```python
client = OpenAI(
    api_key="sk-...",
    base_url="https://www.aifast.club/v1",
    max_retries=3,  # 最多 3 次重试，总共 4 次尝试
)
```

### 带上日志看重试是否发生

```python
import logging
import httpx

logger = logging.getLogger("openai")

def log_request(request: httpx.Request) -> None:
    logger.info(f"→ {request.method} {request.url}")

def log_response(response: httpx.Response) -> None:
    request_id = response.headers.get("x-request-id", "?")
    logger.info(f"← {response.status_code} request_id={request_id}")

client = OpenAI(
    api_key="sk-...",
    base_url="https://www.aifast.club/v1",
    http_client=httpx.Client(
        event_hooks={"request": [log_request], "response": [log_response]}
    ),
    max_retries=3,
)
```

加了日志之后，403、429、503 等在终端都能看到，不用猜。

### 不同错误码的行为

| 状态码 | 原因 | SDK 是否重试 |
|:---|:---|:---:|
| 连接错误 | DNS、连接失败或网络中断 | ✅ 自动重试 |
| 401 | API Key 无效或未传 | ❌ 不重试 |
| 400 | 请求格式错误 | ❌ 不重试 |
| 404 | 模型不存在或路径错 | ❌ 不重试 |
| 408 / 409 | 请求超时或资源冲突 | ✅ 自动重试 |
| 429 | 请求频率超限 | ✅ 自动重试 |
| 5xx | 服务端异常 | ✅ 自动重试 |

如果收到 429 但 SDK 重试后还是 429，说明需要降低频率，而不是继续加大 retries。

---

## 4. 常见故障排查流程

### 问题 1：偶发 connection timeout

```
openai.APITimeoutError: Request timed out.
```

改短 connect 超时 + 加日志，判断是偶尔超时还是持续不行。

```python
client = OpenAI(
    http_client=httpx.Client(timeout=httpx.Timeout(600, connect=3.0)),
    max_retries=2,
)
```

如果 2 次都连不上，可能是网络问题，检查：

- 能否 ping 通 `www.aifast.club`
- 是否用了代理但 SDK 没走代理
- DNS 能否解析

### 问题 2：所有请求都 401

```json
{
    "error": {
        "message": "Incorrect API key provided",
        "type": "invalid_request_error",
        "code": "invalid_api_key"
    }
}
```

- Key 是否复制完整（AI 快站控制台复制，不要手打）
- Key 是否已在控制台启用
- 请求头 `Authorization: Bearer` 前有多余空格

### 问题 3：模型不存在

```
openai.NotFoundError: Error code: 404 - {'error': {'message': 'The model `claude-3-opus` does not exist'}}
```

模型展示名不是 API ID。AI快站控制台展示的精确模型 ID 是：

```text
# 正确——精确 ID
claude-sonnet-5、gpt-5.6-terra、deepseek-v4-pro

# 错误——展示名不是 ID
Claude Sonnet 5、GPT-5.6 Terra、DeepSeek V4 Pro
```

先去控制台模型广场复制精确 ID，再写进代码。

### 问题 4：429 反复出现

```
openai.RateLimitError: Error code: 429
```

- 确认是否超过平台限流。如果只是偶尔碰到，SDK 默认重试 2 次一般能过去
- 如果连续 429，在应用层加限速

```python
import openai
from time import sleep


def call_with_backoff():
    for i in range(5):
        try:
            return client.chat.completions.create(...)
        except openai.RateLimitError:
            if i == 4:
                raise
            sleep(2 ** i)  # 指数退避
```

### 问题 5：请求卡住直到超时

```
openai.APITimeoutError: Request timed out.
```

出现在响应极慢的过程模型或长文档生成时。先确认是否收到 `choices` 的第一个分片；如果完全没有分片，可能是鉴权或模型加载阻塞。

先用 curl 验证基本连通：

```bash
curl -s -w "\n%{http_code}" https://www.aifast.club/v1/chat/completions \
  -H "Authorization: Bearer $AIFAST_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"gpt-5.6-luna","messages":[{"role":"user","content":"hi"}],"stream":true}'
```

有分片回来就说明接口正常工作，问题在客户端。

---

## 5. 建议参数模板

把以下文件放到项目根目录作为默认配置：

```python
# config.py
from openai import OpenAI, AsyncOpenAI
import httpx
from httpx import AsyncClient

DEFAULT_TIMEOUT = httpx.Timeout(timeout=600, connect=5.0)

def create_client(api_key: str, base_url: str = "https://www.aifast.club/v1") -> OpenAI:
    return OpenAI(
        api_key=api_key,
        base_url=base_url,
        http_client=httpx.Client(timeout=DEFAULT_TIMEOUT),
        max_retries=2,
    )

def create_async_client(api_key: str, base_url: str = "https://www.aifast.club/v1") -> AsyncOpenAI:
    return AsyncOpenAI(
        api_key=api_key,
        base_url=base_url,
        http_client=AsyncClient(timeout=DEFAULT_TIMEOUT),
        max_retries=2,
    )
```

需要调长超时的慢模型单独初始化。

---

## 参考

- [OpenAI Python SDK GitHub](https://github.com/openai/openai-python) — 默认值见 `src/openai/_constants.py`
- [AI快站完整接入指南](README.md)
- [API 错误排查与回退策略](https://github.com/KKWANG4444/llm-api-proxy-china)
- [OpenAI 错误码官方文档](https://platform.openai.com/docs/guides/error-codes)
