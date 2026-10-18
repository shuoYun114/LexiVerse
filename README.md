# 🌌 LexiVerse — 3D 赛博星云与艾宾浩斯智能背单词 Web 应用

<div align="center">

![LexiVerse Cover](https://img.shields.io/badge/LexiVerse-3D%20Cyber%20Nebula-6366f1?style=for-the-badge&logo=react)
![License](https://img.shields.io/badge/License-MIT-06b6d4?style=for-the-badge)
![React 18](https://img.shields.io/badge/React-18.3-38bdf8?style=for-the-badge&logo=react)
![Three.js](https://img.shields.io/badge/Three.js-r168-39d353?style=for-the-badge&logo=three.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178c6?style=for-the-badge&logo=typescript)

<p align="center">
  <b>融合 Three.js 3D WebGL 粒子星云、SuperMemo-2 (SM-2) 艾宾浩斯遗忘曲线算法与 GitHub 风格打卡热力图的现代化背单词平台。</b>
</p>

[🌐 访问在线 Demo (Live Demo)](https://shuoyun114.github.io/LexiVerse/) · [📖 架构设计](#-系统架构设计-architecture) · [🚀 快速开始](#-安装指南-installation)

</div>

---

## 📸 运行截图与演示 (Screenshots & Demo)

<div align="center">
  <img src="https://raw.githubusercontent.com/shuoYun114/LexiVerse/main/public/favicon.svg" width="120" alt="LexiVerse Logo" />
  <p><i>🌌 3D 赛博星云视界与 SM-2 智能闪卡交互界面</i></p>
</div>

> [!NOTE]
> 🌐 **在线体验入口 (Live Demo)**: [https://shuoyun114.github.io/LexiVerse/](https://shuoyun114.github.io/LexiVerse/)  
> *(注：GitHub Pages 静态托管线为 **3D Demo 体验版**，出于安全保护不开放新账号注册；在本地/局域网部署运行将解锁完整账号注册、登录及多设备局域网自动同步功能)*

---

## ✨ 核心功能特性 (Features)

### 📊 1. GitHub 风格 365 天打卡热力图 (Contribution Heatmap)
- **赛博绿阶梯色彩**：从深色背景透明度过渡到高亮赛博绿（支持赛博极光绿与霓光魅紫蓝双重 Mode 切换）。
- **打卡连胜 (Streak)**：实时统计并突出显示当前连续打卡天数 (Current Streak) 和历史最高连胜天数，伴有发光火花脉冲动画。
- **动态 Tooltip**：鼠标悬停任意日期格，精确显示当天打卡数、复习数和新掌握词汇数。

### 🌌 2. Three.js 3D 赛博单词星云 (WordNebula3D)
- **WebGL 粒子球体**：成百上千个英文单词散落在 3D 宇宙星云中，以颜色区分掌握状态（已掌握-赛博绿 / 复习中-霓虹紫 / 新词-冰蓝）。
- **全方位交互**：支持 360 度鼠标拖拽旋转、滚轮视距缩放、点击节点聚焦单词卡片及语音发音。

### 🧠 3. 艾宾浩斯 SM-2 智能记忆引擎 (FlashcardEngine)
- **3D 翻转记忆卡片**：快捷键空格翻牌，结合例句挖空填空测试。
- **5 阶熟练度打分**（1分完全遗忘 ～ 5分脱口而出），依据 SuperMemo-2 算法实时推算下一次最佳复习日期 (Next Review Date)。
- **彩带喷洒动效**：当完美掌握单词时触发 Confetti 彩带喷洒效果！

### 🎮 4. 赛博打字速记游戏 (CyberShooterGame)
- 单词从星云中徐徐降落，玩家盲打敲击键盘拼写，触发击碎特效、音效与 Combo 连击加成。
- 提供 **轻松休闲**、**标准挑战**、**极限竞速** 三档速度模式。

### 🎖️ 5. 赛博成就勋章系统 (Cyber Badges)
- 内置【初入词域】、【七日连胜】、【星云探索者】、【极速盲打】等多款发光质感勋章。

### 🔐 6. 账号系统与局域网多设备自动同步
- 支持本地局域网无感多端同步，手机、平板与桌面端进度时刻统一。

### 📚 7. 丰富的内置词库与主流教材
- **全量初高中主流教材**：北师大版 (BNU) 初中全套、人教版 (PEP) 初中全套、高中必修系列。
- **升学权威词库**：中考、高考冲刺、考研英语一/二、四六级、雅思、程序员专业词汇与西班牙语入门库。

---

## 🏗️ 系统架构设计 (Architecture)

LexiVerse 采用模块化分层设计，确保 3D 渲染主循环与 SM-2 业务计算解耦运行：

```mermaid
graph TD
    A[用户输入层 (UI / 交互)] --> B[应用路由与状态管理 (React 18 / Hooks)]
    B --> C[3D 渲染引擎 (Three.js WebGL Particle Nebula)]
    B --> D[核心计算引擎 (SM-2 Spaced Repetition Engine)]
    B --> E[打卡看板与游戏模块 (365-Day Heatmap / CyberShooter)]
    C --> F[Canvas WebGL Viewport]
    D --> G[Local Storage / IndexedDB 本地持久化]
    D --> H[局域网 Peer Sync 同步服务]
```

---

## 🛠️ 安装指南 (Installation)

### 1. 准备环境 (Prerequisites)
- [Node.js](https://nodejs.org/) >= 18.0.0
- npm / pnpm / yarn

### 2. 获取源码与安装依赖

```bash
# 克隆仓库
git clone https://github.com/shuoYun114/LexiVerse.git
cd LexiVerse

# 安装依赖
npm install
```

---

## 🚀 使用指南 (Usage)

### 1. 本地开发服务器启动

```bash
# 启动 Vite 开发服务
npm run dev
```

在终端输出的本地地址打开浏览器（通常为 `http://localhost:3000` 或 `http://localhost:5173`），即可直接体验 3D 赛博星云与艾宾浩斯智能背单词系统。

### 2. 生产环境构建

```bash
# 构建优化后的生产静态产物
npm run build

# 预览生产构建
npm run preview
```

---

## 🧪 单元测试 (Testing)

项目采用自动化测试套件对核心算法（如 SM-2 间隔重复推算、连续打卡 Streak 计算）进行验证：

```bash
# 执行单元测试
npm run test
```

---

## 🚢 部署说明 (Deployment)

### GitHub Pages 静态自动化部署

项目已配置 GitHub Pages 部署流，产物通过 `dist/` 目录静态托管：

```bash
# 构建并一键部署
npm run deploy
```

---

## 📡 API 与接口设计 (API)

内置轻量数据接口规范，支持外部 JSON 词库批量导入：

```typescript
interface WordItem {
  id: string;
  word: string;
  phonetic?: string;
  translation: string;
  exampleSentence?: string;
  difficulty?: number; // 1-5
  repetitions: number;
  interval: number; // days
  easeFactor: number;
  nextReviewDate: string; // ISO 8601
}
```

---

## 📄 开源许可证 (License)

本项目遵循 [MIT License](LICENSE) 开源许可。欢迎提交 Issue 与 Pull Request！
