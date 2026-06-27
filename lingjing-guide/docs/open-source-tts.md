# 开源免费语音模型接入说明

项目游客端已经接入“本地开源 TTS 优先，浏览器语音回退”的语音引擎。

默认请求地址：

```text
http://127.0.0.1:8080/v1/audio/speech
```

请求格式采用 OpenAI-compatible TTS 风格：

```json
{
  "model": "cosyvoice",
  "input": "要播报的中文文本",
  "voice": "中文女导游",
  "response_format": "mp3",
  "speed": 1
}
```

返回值要求是 `audio/mp3` 或 `audio/wav` 二进制音频。

## 推荐模型

### CosyVoice

适合中文导游讲解，音色自然度较高，适合参赛演示。可以使用社区已有 FastAPI/OpenAI-compatible 包装服务，也可以自行封装 `/v1/audio/speech`。

### ChatTTS

适合中文对话式语音，语气更自然，适合数字人闲聊与安抚场景。建议部署本地 Web API 后，在页面中把接口地址填入语音模型面板。

### IndexTTS

适合追求更强中文表现和音色一致性的演示。若显卡资源允许，可以作为决赛版本的主推语音模型。

### LocalAI

如果你希望统一成 OpenAI-compatible 接口，可以用 LocalAI 包装本地 TTS 模型，然后保持前端地址为 `/v1/audio/speech`。

## 页面中如何使用

1. 启动本地 TTS 服务，确保接口允许 `http://127.0.0.1:5173` 跨域访问。
2. 打开游客端。
3. 在“开源语音模型”面板选择“本地开源 TTS”。
4. 填入接口地址、模型名和音色名。
5. 点击快捷问题或发送问题，AI 数字人会优先调用本地开源 TTS。
6. 如果本地服务不可用，系统自动回退浏览器语音，不影响演示流程。

## 最小 FastAPI 包装示例

下面只是接口形状示例，真实模型推理部分替换成 CosyVoice、ChatTTS 或 IndexTTS 的推理代码。

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class SpeechRequest(BaseModel):
    model: str
    input: str
    voice: str = "中文女导游"
    response_format: str = "mp3"
    speed: float = 1

@app.post("/v1/audio/speech")
def speech(request: SpeechRequest):
    audio_bytes = run_your_open_source_tts_model(request.input)
    return Response(content=audio_bytes, media_type="audio/mpeg")
```

运行：

```bash
uvicorn server:app --host 127.0.0.1 --port 8080
```
