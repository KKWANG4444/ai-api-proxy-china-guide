# 生产环境 API 请求容错：重试、熔断与优雅降级

[← 返回主页](README.md)

调第三方 API 没有不出错的。网络抖、限流、服务端过载、模型升级期间的短暂不可用——这些都是常态。线上服务跟个人测试不一样，不能等到报错再人工处理。

这篇给出可直接用的容错代码模板，覆盖重试、熔断和降级三个层级。

---

## 1. 重试——解决临时失败

### 用 SDK 自带的重试

OpenAI SDK 默认会对连接错误、408、409、429 和 5xx 自动重试 2 次，这是第一道防线。如果使用本节后面的自定义重试器，应把 SDK 的 `max_retries` 设为 `0`，否则两层重试会相乘：装饰器尝试 4 次、SDK 每次再尝试 3 次，最坏会发出 12 个请求。

```python
from openai import OpenAI

client = OpenAI(
    api_key="sk-...",
    base_url="https://www.aifast.club/v1",
    max_retries=0,  # 由下面的装饰器统一控制，避免双重重试
)
```

对于大多数场景已经够用。但如果应用里的请求耗时差异大——短文本几百毫秒，长上下文几秒——你可能需要的不是一律重试 2 次，而是区分对待。

### 自定义重试装饰器

```python
import time
import random
from openai import (
    APIConnectionError,
    APITimeoutError,
    RateLimitError,
    InternalServerError,
)

def retry(max_attempts=3, base_delay=1.0, max_delay=30.0):
    def decorator(func):
        def wrapper(*args, **kwargs):
            last_error = None
            for attempt in range(1, max_attempts + 1):
                try:
                    return func(*args, **kwargs)
                except (APIConnectionError, RateLimitError, InternalServerError, APITimeoutError) as e:
                    last_error = e
                    if attempt == max_attempts:
                        raise
                    delay = min(base_delay * (2 ** (attempt - 1)), max_delay)
                    jitter = random.uniform(0, delay * 0.1)
                    time.sleep(delay + jitter)
            raise last_error
        return wrapper
    return decorator

@retry(max_attempts=4, base_delay=0.5, max_delay=16.0)
def call_model(prompt: str) -> str:
    response = client.chat.completions.create(
        model="gpt-5.6-luna",
        messages=[{"role": "user", "content": prompt}],
    )
    return response.choices[0].message.content
```

**要点：**

- 只重试可安全重复的请求（幂等）。如果请求副作用不可重做（发送邮件、扣减余额），重试前先确认服务端是否已处理。
- 四次尝试之间只会等待三次：0.5s → 1s → 2s。第四次失败后立即抛错，不会再等待；
- 加随机抖动，避免所有客户端同时重试；
- 设上限，不要无限重试。

### 只重试幂等请求

```python
SAFE_TO_RETRY = {APIConnectionError, RateLimitError, InternalServerError, APITimeoutError}

def safe_retry(func, max_attempts=3):
    last_error = None
    for i in range(max_attempts):
        try:
            return func()
        except tuple(SAFE_TO_RETRY) as e:
            last_error = e
            if i == max_attempts - 1:
                raise
            time.sleep(2 ** i)
        except Exception as e:
            raise  # 401、400 等不重试
```

---

## 2. 熔断——防止雪崩

重试只能解决临时问题。如果上游持续不可用（比如服务宕机 10 分钟），一直重试只会浪费配额、拖垮客户端连接池。

熔断器的作用：连续失败达到阈值后，直接拒绝请求一段时间，让系统有机会恢复。

```python
import time

class CircuitBreaker:
    def __init__(self, threshold=5, recovery_time=30):
        self.threshold = threshold
        self.recovery_time = recovery_time
        self.failures = 0
        self.last_failure_time = 0
        self.state = "closed"  # closed → open → half-open

    def call(self, func):
        if self.state == "open":
            if time.time() - self.last_failure_time > self.recovery_time:
                self.state = "half-open"
            else:
                raise RuntimeError("Circuit breaker is open")

        try:
            result = func()
            self.failures = 0
            self.state = "closed"
            return result
        except (APIConnectionError, RateLimitError, InternalServerError, APITimeoutError):
            self.failures += 1
            self.last_failure_time = time.time()
            if self.failures >= self.threshold:
                self.state = "open"
            raise

cb = CircuitBreaker(threshold=5, recovery_time=30)

# 使用
response = cb.call(lambda: client.chat.completions.create(
    model="claude-sonnet-5",
    messages=[{"role": "user", "content": "hi"}],
))
```

连续出现 5 次可重试错误后，熔断器会在 30 秒内直接拒绝请求，30 秒后进入半开状态试一次。401、400、404 等配置错误不会计入熔断；这类错误应该立即暴露并修正。

这个示例适合单线程演示。多线程或多协程共享同一个熔断器时，`failures` 和 `state` 的读写必须加锁，或直接使用经过并发测试的熔断库，避免多个请求同时进入半开状态。

---

## 3. 降级——跨模型回退

如果所有重试都失败，或者熔断器打开，最后一个兜底是使用备用模型。AI快站提供 500+ 模型，按能力分组做回退：

```python
MODEL_FALLBACK = {
    "reasoning": ["claude-opus-4-8", "gpt-5.6-terra", "deepseek-v4-pro"],
    "fast_text": ["gpt-5.6-luna", "deepseek-v4-flash", "gemini-3.5-flash"],
    "coding": ["claude-sonnet-5", "gpt-5.6-terra", "deepseek-v4-pro"],
}

def call_with_fallback(models, messages, max_retries_per_model=2):
    last_error = None
    for model in models:
        for attempt in range(max_retries_per_model):
            try:
                response = client.chat.completions.create(
                    model=model,
                    messages=messages,
                )
                return response.choices[0].message.content, model
            except (APIConnectionError, RateLimitError, InternalServerError, APITimeoutError) as e:
                last_error = e
                time.sleep(2 ** attempt)
            except Exception as e:
                # 非可重试错误——换下一个模型
                last_error = e
                break
    raise last_error

# 使用
content, used_model = call_with_fallback(
    MODEL_FALLBACK["reasoning"],
    [{"role": "user", "content": "解释一下量子纠缠"}],
)
print(f"响应模型：{used_model}")
```

记录实际响应的模型 ID 不是小题大做。不同模型在工具调用、图片输入和输出格式上可能不同。回退前要单独测试兼容性，回退后要记日志，才知道最终用了哪个。

---

## 4. 三层容错的使用顺序

```text
第一层：重试（秒级）
  请求失败 → 指数退避重试 2~4 次
  ↓ 都失败

第二层：熔断（分钟级）
  5~10 次连续失败 → 熔断器打开 30~60s
  ↓ 超时后尝试

第三层：降级（业务级）
  使用备用模型组回退
  ↓ 全部失败

通知开发者
```

```python
def resilient_call(messages, models, cb, max_retries=3):
    for model in models:
        for attempt in range(max_retries):
            try:
                return cb.call(lambda: client.chat.completions.create(
                    model=model, messages=messages,
                ))
            except Exception:
                if attempt == max_retries - 1:
                    break  # 换模型
                time.sleep(2 ** attempt)
    raise RuntimeError(f"All models failed: {models}")
```

---

## 5. 容错不是银弹

几个常见的错误认知：

- **重试可以解决 401/404。** 不能。这些是配置错误，重试只会放大账单。
- **回退模型能力等价。** 不同模型的工具调用、系统和输出结果有差异，回退前必须做兼容性测试。
- **日志不是容错。** 很多项目在报错时只 print 不处理，线上出问题时毫无办法。至少记录 HTTP 状态码、响应体、模型 ID、请求时间，以及最终是哪个模型响应的。

---

## 参考

- [OpenAI SDK 重试与超时配置](openai-sdk-advanced-config.md)
- [AI快站模型目录（按能力筛选）](https://www.aifast.club)
- [常见错误码排除清单](https://github.com/KKWANG4444/llm-api-proxy-china#常见错误)
- [应用侧模型分组与回退（指南）](README.md#自动故障切换与应用回退)
