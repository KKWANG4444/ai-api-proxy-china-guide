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

比“让模型自报身份”更有价值的是保存原始响应：

```python
response = client.chat.completions.create(
    model="claude-sonnet-5",
    messages=[{"role": "user", "content": "只回复 ok"}],
)

print("request model:", "claude-sonnet-5")
print("response model:", response.model)
print("request id:", getattr(response, "_request_id", None))
print("usage:", response.usage)
```

检查请求模型、响应模型、request ID、finish reason 和 usage 是否存在且格式稳定。字段缺失或前后矛盾只能说明协议或路由异常，仍不能单独证明底层模型身份。

不要用“把任意文本 encode 后再 decode 是否还原”做鉴真。任何正确实现的 tokenizer 对普通文本都应当能往返还原，这不能说明文本由哪个模型生成。未经模型官方支持的 tokenizer 方法也不应写进可运行教程。

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

## 6. 官方端点做对照组

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
| 响应元数据检查 | 低 | ✅ |
| 流式分片检查 | 中 | ✅ |
| 工具调用测试 | 中 | ✅ |
| 随机动态题 | 中 | ✅ |
| 官方端点对照组 | 较高 | ⚠️ |
| 在线检测工具 | 多维信号 | ✅ |

没有一种方法是绝对充分的。几种方法组合使用、不定期抽查，是比较务实的做法。

---

## 参考

- [AI快站模型目录与维护公告](https://kkwang4444.github.io/api-status/)
- [OpenAI-compatible 接口验证矩阵](README.md#配置完成后的验收矩阵)
- [AI 快站生产排错指南](https://github.com/KKWANG4444/llm-api-proxy-china)
