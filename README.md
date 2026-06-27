# 灵境导游 - 景区导览服务 AI 数字人

面向中国软件杯 A5「景区导览服务AI数字人」赛题的完整参赛原型。

## 项目结构

```
├── lingjing-guide/           # 主应用（React + TypeScript + Vite + Live2D）
├── docs/                     # 项目文档和计划书
├── output/                   # 输出文档
├── 示范景区公开资料包/       # 灵山胜境示范数据
│   ├── 灵山胜境 景点结构化数据集.docx
│   ├── 灵山胜境：历史、文化、景点特色与个性化游览指南.docx
│   └── 景点景区旅游数据行为分析数据.xlsx
└── 示范景区公开资料包.zip
```

## 核心功能

- **游客端**：文本问答、语音输入演示、语音播报、数字人口型和表情状态、快捷问题
- **AI 问答**：内置灵山胜境知识库、关键词检索、命中来源、置信度展示、无答案兜底
- **路线推荐**：根据兴趣、时长、同行人群、游览节奏推荐差异化路线
- **情绪互动**：识别焦急、疲惫、疑惑等状态，切换安抚式服务话术
- **运营后台**：满意度趋势、客流趋势、消费结构、热门问答、AI 运营建议
- **知识库管理**：示范资料条目、标准问答测试集、数字人配置状态
- **空间智能**：景区热力与情绪地图，展示热门景点和运营建议
- **Live2D 数字人**：接入 Live2D 模型，支持口型同步和表情切换

## 快速开始

```bash
cd lingjing-guide
npm install
npm run dev
```

访问 http://127.0.0.1:5173

## 文档

- [项目计划书](docs/A5-景区导览服务AI数字人项目计划书.md)
- [README](lingjing-guide/README.md)

## 技术栈

- React 19 + TypeScript + Vite
- Live2D（实时渲染）
- Recharts（数据可视化）
- OpenAI-compatible TTS 适配层

## 素材来源

Live2D 模型来自 [Eikanya/Live2d-model](https://github.com/Eikanya/Live2d-model/tree/master/Live2D/Senko_Normals)

## 许可

参赛原型演示用途，素材需遵守原始 LICENSE。
