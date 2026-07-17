# 怎么验证 API 中转站的模型是不是真的

[← 返回主页](README.md)

用户最担心的一个问题是：API 中转站返回的到底是不是它声称的那个模型？用廉价模型冒充热门模型、截断输出、跳过工具调用，这些现象在社区里都有讨论。

这篇不空讲道理，给出几种不同维度的验证方法，从最轻量的 curl 命令到协议层面的黑盒检测。每种方法我都会写清楚它验证了什么、不能验证什么。

---

## 1. 先声明模型名

最基础但最容易被忽视的一步。请求时显式发一份自己的文本验证：

```bash
curl -s https://www.aifast.club/v1/chat/completions \
  -H "Authorization: Bearer $AIFAST_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-sonnet-5",
    "messages": [{"role": "user", "content": "What is your exact model name? Reply with one word."}],
    "stream": false
  }' | python3 -c "import sys,json; print(json.load(sys.stdin)['choices'][0]['message']['content'])"
```

如果响应里自报的模型名和请求的 model 不一致，就是警告信号。

但只看自报模型名不够——中转站可以改响应流中的 model 字段。所以还要测能力边界。

---

## 2. 知识边界测试

不同大模型的训练数据和知识截止日期不同。用下面几个简单问题做边界测试：

```python
BOUNDARY_TESTS = [
    ("What is the exact date of your knowledge cutoff?", "2025"),  # 不同模型差异明显
    ("Who won the Super Bowl in 2024?", "Kansas City"),           # 2024 年的知识
    ("What happened after September 2025 that you know about?", "2025"),  # 最新知识窗口
]
```

每个答案都有明显的模型特征。Claude 的回应风格和 GPT 不一样，Gemini 也有自己的习惯。

---

## 3. Tokenizer 对比

模型的 tokenizer（分词器）是公开的。把一个测试文本通过中转返回后，再用官方 tokenizer 解码，看结果是否一致。

```python
import tiktoken  # OpenAI
# pip install anthropic  # Claude

# 先用中转站生成一段文本
response = client.chat.completions.create(
    model="claude-sonnet-5",
    messages=[{"role": "user", "content": "写一段关于量子计算的中文介绍，50字左右。"}],
)
text = response.choices[0].message.content

# 用 Claude 的 tokenizer 看 encode/decode
import anthropic
tokenizer = anthropic.claude_tokenizer_256k()
ids = tokenizer.encode(text)
decoded = tokenizer.decode(ids)

if decoded != text:
    print("警告：tokenizer 不一致，可能不是真实模型")
else:
    print("tokenizer 一致 ✅")
```

tiktoken（GPT BPE）和 anthropic tokenizer 的行为不同。如果请求写 claude 但 tokenizer 跑 tiktoken 反而更一致，就可能有问题。

---

## 4. 协议行为检查

### 流式 SSE 格式

```bash
curl -s https://www.aifast.club/v1/chat/completions \
  -H "Authorization: Bearer $AIFAST_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-5.6-luna",
    "messages": [{"role": "user", "content": "Count from 1 to 5."}],
    "stream": true
  }' | head -20
```

正常流式返回每行以 `data: ` 开头，最后一行是 `data: [DONE]`。如果中转站把非流式结果缓存后伪装成流式返回，分片的数量会异常少（长时间才有一次刷新），跳过 token 级的逐步输出。

### 工具调用（tool calling）

```python
response = client.chat.completions.create(
    model="gpt-5.6-terra",
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

如果 `tool_choice="required"` 返回的内容里没有 tool_calls 字段，说明该 endpoint 不支持工具调用。一些廉价中转直接用 LLM 的文字回复冒充工具调用输出。

---

## 5. 随机动态题

```python
# 生成随机动态问题，每次不同
import random
numbers = [random.randint(1, 200) for _ in range(5)]
question = f"Calculate: {numbers[0]} × {numbers[1]} + {numbers[2]} - {numbers[3]} ÷ {numbers[4]}"

response = client.chat.completions.create(
    model="deepseek-v4-pro",
    messages=[{"role": "user", "content": question}],
)
# 验证计算结果
answer = response.choices[0].message.content
expected = numbers[0] * numbers[1] + numbers[2] - numbers[3] / numbers[4]
```

如果数学题反复答错或者模式化输出，就值得怀疑。对于简单的数学，主流旗舰模型很少算错。每次用随机数可以防止中转站把特定答案写死。

---

## 6. 对比同一模型在不同平台的输出

更可靠的验证：在 AI快站 和官方平台同时请求同一提示语，比较：

- 首字延迟
- 输出长度
- tokenizer 解码一致性
- 响应中的 model 字段
- 风格特征（列表格式、语气、用词偏好）

如果两个输出高度一致，基本能确定是真实模型。

---

## 7. 在线检测工具（直接可用）

不想写代码，可以直接用现成的检测。

[大模型 API 中转站在线检测 →](https://docs.aifast.club/model-check/)

填入 base_url、临时限额的 API key 和模型 ID，检测会覆盖：

- 模型声明
- Token 字段
- 随机动态题
- SSE 流式输出
- 工具调用

每个维度都有分项通过/不通过，检测后生成可分享的报告。

---

## 总结

| 验证方式 | 覆盖率 | 可自动化 |
|:---|:---:|:---:|
| 自报模型名 | 低 | ✅ |
| 知识边界测试 | 中 | ✅ |
| Tokenizer 对比 | 高 | ✅ |
| 流式分片检查 | 中 | ✅ |
| 工具调用测试 | 高 | ✅ |
| 随机动态题 | 中 | ✅ |
| 跨平台对比 | 最高 | ⚠️ |
| 在线检测工具 | 全面 | ✅ |

没有一种方法是绝对充分的。几种方法组合使用、不定期抽查，是比较务实的做法。

---

## 参考

- [AI快站模型目录与维护公告](https://kkwang4444.github.io/api-status/)
- [OpenAI-compatible 接口验证矩阵](README.md#配置完成后的验收矩阵)
- [AI 快站生产排错指南](https://github.com/KKWANG4444/llm-api-proxy-china)
