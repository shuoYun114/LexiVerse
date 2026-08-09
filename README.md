# 🌌 LexiVerse — 3D 赛博星云与艾宾浩斯智能背单词 Web 应用

![LexiVerse Cover](https://img.shields.io/badge/LexiVerse-3D%20Cyber%20Nebula-6366f1?style=for-the-badge&logo=react)
![License](https://img.shields.io/badge/License-MIT-06b6d4?style=for-the-badge)
![React 18](https://img.shields.io/badge/React-18.3-38bdf8?style=for-the-badge&logo=react)
![Three.js](https://img.shields.io/badge/Three.js-r168-39d353?style=for-the-badge&logo=three.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178c6?style=for-the-badge&logo=typescript)

打造一款现代、高颜值、3D 交互且功能强大的英语背单词 Web 应用 **LexiVerse**。应用融合了 Three.js 3D WebGL 粒子星云、 SuperMemo-2 (SM-2) 艾宾浩斯遗忘曲线算法、赛博打字速记游戏，以及**媲美 GitHub 风格的高颜值 365 天数据热力图与多维统计看板**。

---

## ✨ 核心特色亮点 (Features)

### 📊 1. GitHub 风格 365 天打卡热力图 (Contribution Heatmap)
- **赛博绿阶梯色彩**：从深色背景透明度过渡到高亮赛博绿（支持赛博极光绿与霓光魅紫蓝双重 Mode 切换）。
- **打卡连胜 (Streak)**：实时统计并突出显示当前连续打卡天数 (Current Streak) 和历史最高连胜天数，伴有发光火花脉冲动画。
- **动态 Tooltip**：鼠标悬停任意日期格，精确显示当天打卡数、复习数和新掌握词汇数。

### 🌌 2. Three.js 3D 赛博单词星云 (WordNebula3D)
- **WebGL 粒子球体**：将成百上千个英文单词散落在 3D 宇宙星云中，以颜色区分掌握状态（已掌握-赛博绿 / 复习中-霓虹紫 / 新词-冰蓝）。
- **全方位交互**：支持 365 度鼠标拖拽旋转、滚轮视距缩放、点击节点聚焦单词卡片及语音发音。

### 🧠 3. 艾宾浩斯 SM-2 智能记忆引擎 (FlashcardEngine)
- **3D 翻转记忆卡片**：快捷键空格翻牌，结合例句挖空填空测试。
- **5 阶熟练度打分**（1分完全遗忘 ～ 5分脱口而出），依据 SuperMemo-2 算法实时推算下一次最佳复习日期 (Next Review Date)。
- **彩带放花**：当完美掌握单词时触发 Confetti 彩带喷撒效果！

### 🎮 4. 赛博打字速记游戏 (CyberShooterGame)
- 单词从星云中徐徐降落，玩家盲打敲击键盘拼写，触发击碎特效、音效与 Combo 连击加成。
- 练习盲打拼写的同时加深记忆，自动记录打卡高分与解锁勋章。

### 🎖️ 5. 赛博成就勋章系统 (Cyber Badges)
- 内置【初入词域】、【七日连胜】、【星云探索者】、【极速盲打】等多款发光质感勋章。

### 📚 6. 丰富的内置词库与 JSON 导入导出
- 内置 CET-4 四级、CET-6 六级、IELTS 雅思及 **程序员高频英语词库**。
- 支持一键导出 JSON 备份与导入个人学习进度。

---

## 🚀 快速开始 (Quick Start)

### 环境要求
- Node.js >= 18.0.0
- npm / pnpm / yarn

### 安装与本地运行

```bash
# 1. 克隆项目
git clone https://github.com/shuoYun114/LexiVerse.git
cd LexiVerse

# 2. 安装依赖
npm install

# 3. 启动 Vite 开发服务器
npm run dev
```

打开浏览器访问 `http://localhost:3000` 即可开始体验！

---

## 🛠️ 技术栈 (Tech Stack)

- **Core Framework**: React 18 + TypeScript + Vite
- **3D & Canvas**: Three.js (WebGL Particle System) + HTML5 Canvas
- **Analytics & Heatmap**: Modern SVG & CSS Flex Grid Contribution Calendar
- **Speech**: Web Speech API (en-US & en-GB)
- **Effects**: canvas-confetti + Lucide React Icons

---

## 📄 开源许可证

Licensed under the [MIT License](LICENSE).
