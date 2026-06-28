# 灵境导游 - 景区导览服务 AI 数字人

面向中国软件杯 A5「景区导览服务 AI 数字人」赛题的可运行参赛原型。项目已经内置游客端、管理端、Live2D 互动导游、景区 2D 导览图、模拟导航、景点照片详情、语音播报适配层、知识库问答、个性化路线推荐和运营看板。

## 克隆当前配置

仓库地址：

```bash
git clone https://github.com/squff/lingjing-guide.git
cd lingjing-guide
```

当前主分支：

```bash
git checkout master
```

推荐环境：

```text
Node.js 20+
npm 10+
Windows 11 / macOS / Linux 均可运行
```

安装依赖：

```bash
npm ci
```

启动本地开发服务：

```bash
npm run dev
```

默认访问地址：

```text
入口选择页：http://127.0.0.1:5173/#/
游客端：http://127.0.0.1:5173/#/visitor
管理端：http://127.0.0.1:5173/#/admin
```

生产构建：

```bash
npm run build
```

本地预览构建产物：

```bash
npm run preview
```

## 当前仓库已包含的资源

克隆后不需要额外下载核心演示素材，以下资源已经放在 `public/` 目录：

- Live2D Cubism 运行核心：`public/live2d/live2dcubismcore.min.js`
- 多个 Live2D 模型：`public/live2d/foxgirl`、`mori_suit`、`ruri_miko`、`mori_mikoc`、`senko`
- 景区 2D 导览图：`public/maps/lingshan-guide-map.png`
- 景点照片：`public/spots/*.jpg`
- 开源语音接入说明：`docs/open-source-tts.md`

## 功能入口

游客端 `/#/visitor`：

- AI 数字人桌宠式导览
- 多角色 Live2D 模型切换
- 文本问答、语音输入演示、语音播报
- 景区 2D 地图导航和模拟前进
- 点击景点展示照片、简介、热度、讲解与导航按钮
- 个性化路线推荐、行程时间轴、拍照建议、应急服务
- 手机端底部导航和响应式布局

管理端 `/#/admin`：

- 运营总览看板
- 知识库质量与问答命中展示
- 满意度、消费结构、热门问题和 AI 运营建议
- 决赛答辩驾驶舱、评分矩阵和演示脚本

## 技术栈

- React 19
- TypeScript
- Vite
- Recharts
- lucide-react
- live2d-renderer
- 原生 CSS 响应式界面

## 常用命令

```bash
npm ci
npm run dev
npm run build
npm run preview
```

如果 `npm ci` 因本地 npm 版本差异失败，可改用：

```bash
npm install
```

## 语音模型配置

项目内置浏览器语音兜底，并提供 OpenAI-compatible TTS 适配层。可以接入 CosyVoice、ChatTTS、IndexTTS、LocalAI 等免费开源语音服务。

详细配置见：

```text
docs/open-source-tts.md
```

没有启动本地 TTS 服务时，项目仍然可以正常运行，语音功能会使用浏览器可用能力或演示状态。

## 素材来源与使用边界

Live2D 模型素材主要来自：

```text
https://github.com/Eikanya/Live2d-model
```

景区照片和地图素材用于参赛原型演示。正式公开发布、商业使用或提交长期维护版本前，建议替换为团队自制素材、景区官方授权素材或明确可商用授权素材，并在文档中保留来源说明。

## 克隆后看不到效果时

1. 确认命令在项目根目录执行：`lingjing-guide`
2. 确认依赖已安装：`npm ci`
3. 确认端口地址是 `http://127.0.0.1:5173/#/visitor`
4. 如果 5173 被占用，Vite 会提示新的端口，按终端输出访问
5. 如果 Live2D 没显示，先确认 `public/live2d` 目录存在且浏览器控制台没有资源 404

## 当前推送位置

```text
GitHub：https://github.com/squff/lingjing-guide.git
分支：master
```
