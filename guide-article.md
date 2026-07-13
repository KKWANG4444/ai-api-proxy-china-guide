# AI API 接入避坑：从模型 ID 到生产回退

[![模型目录](https://img.shields.io/badge/模型-以当前控制台为准-blue)](https://www.aifast.club)

这篇短指南保留四个真正影响上线的问题：模型名、鉴权、兼容性和回退。固定模型数量、延迟、成功率和“比官方便宜”都没有写，因为这些结论会随时间、地区和账户变化。

## 1. 模型展示名不是 API ID

先在控制台复制精确 ID，再写进请求。以下是 2026-07-13 已核验的样例：

```text
gpt-5.6-terra
claude-sonnet-5
grok-4.5
deepseek-v4-pro
gemini-3.5-flash
```

配置存在不等于在线。生产部署前还要看维护公告并发送真实请求。

## 2. 先跑最小请求

```python
import os
from openai import OpenAI

client = OpenAI(
    base_url="https://www.aifast.club/v1",
    api_key=os.environ["AIFAST_API_KEY"],
)

response = client.chat.completions.create(
    model="gpt-5.6-terra",
    messages=[{"role": "user", "content": "reply with ok"}],
)
print(response.choices[0].message.content)
```

不要一开始就加 streaming、tools、图片和 JSON schema。最小请求成功后，再逐项开启功能。

## 3. 保存完整错误

遇到失败时记录：

- HTTP 状态码；
- 响应体；
- 模型 ID；
- 请求时间和部署网络；
- 是否用了 streaming、tools 或图片。

401 通常先查 Bearer Key；404 先查模型 ID；429 用有上限的指数退避；5xx 只对可安全重复的请求重试。

## 4. 回退放在应用侧

不要依赖网关静默替换模型。模型回退应由应用明确控制：

```python
MODEL_GROUPS = {
    "reasoning": ["claude-opus-4-8", "gpt-5.6-terra"],
    "fast_text": ["gpt-5.6-luna", "deepseek-v4-flash"],
}
```

不同模型的工具调用、图片和输出格式可能不同，回退前需要单独测试并记录最终响应模型。

## 5. 支付规则分地区

国内账户可用方式以控制台当前页面为准。

国际用户只能使用加密货币。**1 个 AI快站余额刀（“1刀”）= 0.07 USDC 或 0.07 USDT。** 国际用户不支持法币支付，付款前必须核对控制台支持的链和充值说明。

## 相关入口

- [AI快站控制台](https://www.aifast.club)
- [完整接入指南](README.md)
- [模型目录与维护参考](https://kkwang4444.github.io/api-status/)
