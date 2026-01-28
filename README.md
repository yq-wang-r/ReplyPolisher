# ReplyPolisher (回复润色) ✍️✨

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/frontend-React_18-61DAFB.svg)
![Flutter](https://img.shields.io/badge/desktop-Flutter-02569B.svg)

**ReplyPolisher** 是一个跨平台的 AI 辅助写作工具，旨在将您的粗糙草稿转化为得体、专业的职场回复。

无论您是面对导师、老板、客户还是同事，只需输入您的草稿和内心真实想法（潜台词），ReplyPolisher 就能根据选定的角色口吻（Persona），利用 Google Gemini 或 OpenAI 兼容模型为您生成完美的回复。

![App Screenshot](./screenshot.png)
*(建议在此处上传一张运行截图)*

## ✨ 核心功能

*   **🎭 多重角色口吻**：
    *   **导师/教授 (Advisor)**：真诚、主动、行动导向。
    *   **老板/上司 (Boss)**：专业、简练、结果导向。
    *   **客户/甲方 (Client)**：服务意识、客气、周到。
    *   **同事 (Colleague)**：协作、清晰、友好。
    *   **前辈 (Senior Peer)**：尊重、得体、不卑不亢。
*   **🧠 内心潜台词 (Inner Thoughts)**：输入您的真实情绪（如愤怒、厌烦），AI 会将其转化为高情商的职场语言。
*   **🌍 双语支持**：完整支持中文和英文界面及回复生成。
*   **🤖 多模型支持**：
    *   **Google Gemini** (默认推荐)
    *   **OpenAI 兼容接口** (支持 DeepSeek, ChatGPT, Local LLMs 等)
*   **🖥️ 跨平台**：
    *   **Web 版**：基于 React + Vite + Tailwind CSS。
    *   **桌面版**：基于 Flutter，支持全局快捷键唤起。
*   **🔒 隐私安全**：API Key 仅保存在浏览器本地存储 (LocalStorage) 中，不会上传至任何服务器。

---

## 🚀 快速开始 (Web 版)

Web 版本基于 React 和 Vite 构建。

### 1. 安装依赖

确保您已安装 Node.js (v18+)，然后在项目根目录运行：

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

打开浏览器访问 `http://localhost:5173` 即可使用。

### 3. 构建与部署 (Deployment)

要将项目部署到生产环境（如 Vercel, Netlify, GitHub Pages 或自己的服务器），请运行构建命令：

```bash
npm run build
```

该命令会在项目根目录下生成一个 `dist` 文件夹。
*   **静态托管**：直接将 `dist` 文件夹中的内容上传至您的托管服务即可。
*   **本地预览**：您可以通过 `npm run preview` 在本地预览构建后的效果。

---

## 🖥️ 桌面版开发 (Flutter)

桌面端应用位于根目录，使用 Flutter 构建，支持 Windows 和 macOS。

### 前置要求
*   Flutter SDK (3.0+)
*   相应的桌面开发环境 (Visual Studio for Windows / Xcode for macOS)

### 运行

```bash
# 获取依赖
flutter pub get

# 运行 macOS 版
flutter run -d macos

# 运行 Windows 版
flutter run -d windows
```

### 桌面版特性
*   **全局快捷键**：默认使用 `Alt + X` (或配置的快捷键) 快速唤起窗口。
*   **自动捕获**：唤起时自动模拟 `Ctrl+C` 读取选中文字作为上下文。

---

## ⚙️ 配置说明

点击界面右上角的 **设置 (Settings)** 图标进行配置：

1.  **AI Provider**：选择 Google Gemini 或 OpenAI 兼容商。
2.  **API Key**：填入您的密钥。
3.  **Base URL** (可选)：
    *   如果是 Google，留空即可（除非使用代理）。
    *   如果是 OpenAI/DeepSeek，填入如 `https://api.deepseek.com/v1/chat/completions`。
4.  **Model Name**：自定义模型名称 (如 `gemini-1.5-pro`, `gpt-4o`, `deepseek-chat`)。

---

## 🛠️ 技术栈

*   **Frontend**: React, TypeScript, Tailwind CSS (via CDN for simplicity), Lucide Icons
*   **Build Tool**: Vite
*   **Desktop Shell**: Flutter, `window_manager`, `hotkey_manager`
*   **AI Integration**: `@google/genai` SDK, Standard Fetch API

## 📄 License

MIT License.
