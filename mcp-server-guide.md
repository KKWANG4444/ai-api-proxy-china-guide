# MCP 接入 AI 模型：配置、权限与排错

[![模型目录](https://img.shields.io/badge/模型-以当前控制台为准-blue)](https://www.aifast.club)

MCP 负责把工具和数据源暴露给模型，模型 API 负责推理。两者是不同链路。排错时要先判断失败发生在 MCP server、MCP client，还是模型请求。

## 基础结构

```text
MCP client
  ├─ model API: https://www.aifast.club/v1
  └─ MCP servers: filesystem / GitHub / database / browser
```

## 模型 API 配置

```python
import os
from openai import OpenAI

client = OpenAI(
    base_url="https://www.aifast.club/v1",
    api_key=os.environ["AIFAST_API_KEY"],
)
```

模型 ID 要从当前控制台复制。公开配置存在不代表模型此刻在线。

## MCP server 配置原则

- 使用最小权限；
- 文件系统 server 只开放需要的目录；
- GitHub token 限制仓库和权限范围；
- 数据库优先只读账号；
- 浏览器自动化不要默认允许任意下载或提交；
- 密钥放环境变量，不写进仓库。

## 排错顺序

### 1. MCP server 是否能独立启动

先运行 server 自带的 health check 或最小命令，确认不是本地依赖或权限问题。

### 2. Client 是否发现工具

检查工具列表和 schema。模型看不到工具时，先别调 API 延迟。

### 3. 模型是否支持当前工具格式

用一个最简单的函数测试。复杂 schema、嵌套对象和严格 JSON 输出要分别验证。

### 4. 保存完整错误

至少记录：模型 ID、工具 schema、HTTP 状态、响应体和 MCP server 日志。

## 回退策略

模型回退应由应用显式控制。不同模型的工具调用格式和遵循度可能不同，不能假设替换后行为一致。

## 性能说明

不要使用没有时间、测试地区和样本量的固定延迟。MCP 调用总耗时包含模型推理、工具执行和网络往返，应分别测量。

## 账户与交易信息

账户、价格和交易规则可能调整，接入文档不保存具体换算。操作前以当前控制台和官方客服确认为准。

## 相关入口

- [AI快站控制台](https://www.aifast.club)
- [工具接入指南](tools-integration-guide.md)
- [完整接入指南](README.md)
