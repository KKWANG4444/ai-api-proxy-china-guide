# 中转站测试与模型检测：怎么验证 API 模型、排查 GPT 降智

[← 返回主页](README.md)

用户最担心的一个问题是：API 中转站返回的到底是不是它声称的那个模型？本页将身份声明、接口兼容和回答质量分开核对，不凭一次回答给服务商下真假结论。

**先说结论：模型检测不是身份认证。** “中转站测试”先检查鉴权、模型 ID、协议和完整响应；“GPT 降智检测”再比较同参数、多轮对照题。自报名称、响应字段、低分或分片数量都不能独立证明底层模型身份。

本文示例仅使用 HK 的 `https://www.aifast.hk/v1`。先准备临时限额 Key，将当前账号可用的精确 ID 设置为 `AIFAST_MODEL`。生成与检测请求可能产生实际费用；示例不代表任何模型已经通过实测认证。请将原始记录保存在本地，分享前删除 Key、认证头、个人提示词和账户信息。

---

## 1. 先核对模型 ID 与当前 Key 权限

先用发生问题的同一个 Key 读取模型列表，不生成内容。列表成功只证明当前鉴权请求通过，不代表每个模型的所有能力都已验收：

```bash
curl --fail-with-body --silent --show-error \
  --connect-timeout 10 --max-time 30 \
  https://www.aifast.hk/v1/models \
  -H "Authorization: Bearer ${AIFAST_API_KEY:?先设置 HK 限额 Key}"
```

逐字核对 ID 和分组。模型自报“我是谁”受训练与提示词影响，响应里的 `model` 也可能被网关改写；两者一致或不一致，都不是鉴真的充分证据。列表返回 401 时先修认证，`model not found` 则继续检查权限、精确 ID 和接口类型。

---

## 2. 知识边界只能做辅助信号

模型自报的知识截止日期、身份和“我是否知道某件事”都可能受系统提示、联网检索、缓存或网关改写影响。若要使用知识边界题，至少做到：

1. 题目来自厂商公开模型卡中明确列出的知识截止范围；
2. 同一题在官方端点和待测端点各跑多次；
3. 禁用联网搜索与外部工具；
4. 保存原始响应、时间、参数和 request ID；
5. 只把结果写成相似性信号，不下“已证明是真模型”的结论。

风格、措辞和单道知识题都很容易误判。它们适合发现明显异常，不适合单独鉴定身份。

---

## 3. 响应元数据与使用量字段

下面的 Python 片段使用已安装的 `openai` SDK。先在同一个 Python 文件或交互会话执行这段初始化，再运行后续片段。SDK 设置 30 秒网络超时并关闭自动重试，避免排错时隐式重复请求；这不是整个流式任务的总时长上限。

```python
import os
from openai import OpenAI

client = OpenAI(
    base_url="https://www.aifast.hk/v1",
    api_key=os.environ["AIFAST_API_KEY"],
    timeout=30.0,
    max_retries=0,
)
model = os.environ["AIFAST_MODEL"]

response = client.chat.completions.create(
    model=model,
    messages=[{"role": "user", "content": "只回复 ok"}],
)

print("request model:", model)
print("response model:", response.model)
print("request id:", getattr(response, "_request_id", None))
print("usage:", response.usage)
```

检查请求模型、响应模型、request ID、finish reason 和 usage 是否符合该端点的协议约定。可选字段缺失不一定是异常；必需字段缺失或前后矛盾需要排查协议和路由，仍不能单独证明底层模型身份。

不要用“把任意文本 encode 后再 decode 是否还原”做鉴真。任何正确实现的 tokenizer 对普通文本都应当能往返还原，这不能说明文本由哪个模型生成。未经模型官方支持的 tokenizer 方法也不应写进可运行教程。

---

## 4. 协议行为检查

### 流式 SSE 格式

```python
finish_reasons = []
final_usage = None
with client.chat.completions.create(
    model=model,
    messages=[{"role": "user", "content": "从 1 数到 5。"}],
    stream=True,
    stream_options={"include_usage": True},
) as stream:
    for chunk in stream:
        if chunk.usage is not None:
            final_usage = chunk.usage
        for choice in chunk.choices:
            if choice.finish_reason is not None:
                finish_reasons.append(choice.finish_reason)
            if choice.delta.content:
                print(choice.delta.content, end="", flush=True)
print("\nfinish_reasons:", finish_reasons)
print("usage:", final_usage)
```

完整消费流后再检查结束原因和用量，不截断前几行就判断结束标记丢失。Chat Completions 的原始 SSE 可包含空行、结束标记和空 `choices` 的用量块，SDK 会解析这些事件；Responses、Messages 需要各自的事件处理方式。

若网关不支持 `include_usage`，应记录为参数兼容问题，按其协议文档单独核验；流中断时也可能收不到最终用量。SDK 正常退出不等于模型身份已验证，`length` 等结束原因也不等于任务完整完成。分片少可能来自短输出、缓冲或网络聚合，不能据此断言“假流式”或模型被替换。

### 工具调用（tool calling）

```python
response = client.chat.completions.create(
    model=model,
    messages=[{"role": "user", "content": "What is the weather like in Beijing?"}],
    tools=[{
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "获取天气",
            "parameters": {
                "type": "object",
                "properties": {"city": {"type": "string"}},
                "required": ["city"],
            },
        },
    }],
    tool_choice="required",  # 强制触发工具调用
)
print(response.choices[0].message.tool_calls)
```

如果声明支持该模式的模型在成功响应中没有 `tool_calls`，先记录为本次工具选择未满足预期，核查参数、模型能力、网关转换与结束原因。单次失败不足以断言整个端点不支持工具，更不能证明模型被替换。收到工具名称和参数之后，还需要在应用中验证参数、执行受控工具并回传结果；本片段没有执行外部工具。

---

## 5. 随机动态题

```python
# 生成随机动态问题，每次不同
import random
numbers = [random.randint(1, 200) for _ in range(5)]
question = f"Calculate: {numbers[0]} × {numbers[1]} + {numbers[2]} - {numbers[3]} ÷ {numbers[4]}"

response = client.chat.completions.create(
    model=model,
    messages=[{"role": "user", "content": question}],
)
# 保留模型回答与参考答案，尚未自动判分
answer = response.choices[0].message.content
expected = numbers[0] * numbers[1] + numbers[2] - numbers[3] / numbers[4]
```

随机题降低固定答案命中的可能，但不构成防缓存或身份保证。本片段仅生成题目和参考答案，没有自动判分；比较时需处理输出格式、运算顺序、精度容差与样本量。多次错误应触发进一步质量排查，不直接归因于模型被替换。

---

## 6. 官方端点做对照组

做 GPT 降智检测或模型降智测试时，先排除上下文截断、限流、缓存、工具开关、推理参数和客户端差异，再讨论回答质量。没有可信参考端点时，只能报告本次任务表现，不能宣称已测出相对官方模型的退化。

更可靠的办法是在官方端点与待测端点上使用同一模型、同一参数和同一组动态题，重复采样并比较：

- 协议字段与 usage 结构；
- tools、流式和结构化输出行为；
- 动态题的错误类型和稳定性；
- request ID、响应模型字段与可追溯日志；
- 在注明时间、地区、网络、样本量后比较延迟分布。

输出文字相似或风格相近仍不能证明底层身份。黑盒测试只能给出一致性证据；最终结论还需要供应链记录、服务商披露或可审计的上游凭据。

---

## 7. 在线检测工具（直接可用）

不想写代码，可以直接用现成的检测。

[大模型 API 中转站在线检测 →](https://docs.aifast.hk/model-check/?utm_source=github&utm_medium=repository&utm_campaign=model-check&utm_content=authenticity-online)

填入 base_url、临时限额的 API key 和模型 ID，检测会覆盖：

- 模型声明
- Token 字段
- 随机动态题
- SSE 流式输出
- 工具调用

结果按维度列出通过、失败、异常或未测项目。分享报告前检查并脱敏；未执行或证据不足的项目不应当作通过。网页检查主要面向 Chat Completions，不替代 Claude Code 的 Messages 或 Codex 的 Responses 验收。

---

## 总结

| 验证方式 | 可以观察什么 | 不能单独证明什么 |
|:---|:---|:---|
| 自报模型名、响应字段 | 对外声明是否一致 | 底层模型身份 |
| 知识边界、动态题 | 指定任务的回答表现 | 与官方相同或已经降智 |
| SSE 完整消费 | 协议解析、结束原因、用量 | 分片数量对应模型真伪 |
| 工具调用 | 指定参数与模型组合的工具行为 | 所有模型、所有协议都兼容 |
| 官方端点对照组 | 控制条件下的多次差异 | 供应链身份认证或长期保证 |
| 在线检测工具 | 实际执行项目的分项证据 | 未执行项目的通过结果 |

没有一种方法是绝对充分的。几种方法组合使用、不定期抽查，是比较务实的做法。

---

## 参考

- [AI快站模型目录与维护公告](https://kkwang4444.github.io/api-status/)
- [OpenAI-compatible 接口验证矩阵](README.md#配置完成后的验收矩阵)
- [AI 快站生产排错指南](https://github.com/KKWANG4444/llm-api-proxy-china)
- [HK 模型降智检测对照方法](https://docs.aifast.hk/guides/model-api-downgrade-detection/?utm_source=github&utm_medium=repository&utm_campaign=model-check&utm_content=authenticity-comparison)
- [HK 检测报告判读与误判边界](https://docs.aifast.hk/guides/model-check-report-guide/?utm_source=github&utm_medium=repository&utm_campaign=model-check&utm_content=authenticity-report)
- [OpenAI Chat Completions 参数与结束原因](https://developers.openai.com/api/reference/resources/chat/subresources/completions/methods/create)
- [OpenAI 流式响应说明](https://developers.openai.com/api/docs/guides/streaming-responses)
