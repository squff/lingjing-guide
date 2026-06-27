export type VoiceEngine = "open-source-local" | "browser";

export type VoiceConfig = {
  engine: VoiceEngine;
  endpoint: string;
  model: string;
  voice: string;
  format: "mp3" | "wav";
};

export type VoiceResult = {
  engine: VoiceEngine;
  ok: boolean;
  message: string;
};

export const defaultVoiceConfig: VoiceConfig = {
  engine: "open-source-local",
  endpoint: "http://127.0.0.1:8080/v1/audio/speech",
  model: "cosyvoice",
  voice: "中文女导游",
  format: "mp3",
};

let currentAudio: HTMLAudioElement | null = null;

export async function speakWithVoiceEngine(text: string, config: VoiceConfig): Promise<VoiceResult> {
  if (config.engine === "open-source-local") {
    const localResult = await speakWithOpenSourceTts(text, config);
    if (localResult.ok) {
      return localResult;
    }
    const browserResult = speakWithBrowserVoice(text);
    return {
      ...browserResult,
      message: `${localResult.message}；已回退到浏览器语音`,
    };
  }

  return speakWithBrowserVoice(text);
}

async function speakWithOpenSourceTts(text: string, config: VoiceConfig): Promise<VoiceResult> {
  try {
    stopCurrentAudio();
    const endpoint = config.endpoint.trim();
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(buildPayload(endpoint, text, config)),
    });

    if (!response.ok) {
      return {
        engine: "open-source-local",
        ok: false,
        message: `本地 TTS 返回 ${response.status}`,
      };
    }

    const blob = await response.blob();
    if (!blob.type.startsWith("audio") && blob.size < 1024) {
      return {
        engine: "open-source-local",
        ok: false,
        message: "本地 TTS 未返回有效音频",
      };
    }

    const url = URL.createObjectURL(blob);
    currentAudio = new Audio(url);
    currentAudio.onended = () => URL.revokeObjectURL(url);
    await currentAudio.play();

    return {
      engine: "open-source-local",
      ok: true,
      message: "已使用本地开源 TTS 播放",
    };
  } catch (error) {
    return {
      engine: "open-source-local",
      ok: false,
      message: error instanceof Error ? error.message : "本地 TTS 调用失败",
    };
  }
}

function buildPayload(endpoint: string, text: string, config: VoiceConfig) {
  if (endpoint.endsWith("/tts")) {
    return {
      input: text,
      model: config.model,
      voice: config.voice,
      format: config.format,
    };
  }

  return {
    model: config.model,
    input: text,
    voice: config.voice,
    response_format: config.format,
    speed: 1,
  };
}

function speakWithBrowserVoice(text: string): VoiceResult {
  if (!("speechSynthesis" in window)) {
    return {
      engine: "browser",
      ok: false,
      message: "当前浏览器不支持语音合成",
    };
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text.slice(0, 220));
  utterance.lang = "zh-CN";
  utterance.rate = 1;
  utterance.pitch = 1.05;
  window.speechSynthesis.speak(utterance);

  return {
    engine: "browser",
    ok: true,
    message: "已使用浏览器语音播放",
  };
}

export function stopCurrentAudio() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}
