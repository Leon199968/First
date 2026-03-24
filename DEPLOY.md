# GitHub部署指南

## 📋 部署步骤

### 1. 创建GitHub仓库
1. 登录 [GitHub](https://github.com)
2. 点击右上角的 "+" 按钮，选择 "New repository"
3. 填写仓库信息：
   - Repository name: `speed-touch-game` （或您喜欢的名称）
   - Description: `一款基于HTML5 Canvas的射击类反应速度游戏`
   - 设置为 Public
   - 勾选 "Add a README file"（可选，我们已有README.md）
4. 点击 "Create repository"

### 2. 上传游戏文件
有两种方式上传文件：

#### 方式一：使用GitHub网页界面
1. 在新创建的仓库页面，点击 "uploading an existing file"
2. 将以下文件拖拽到上传区域：
   - `index.html`
   - `style.css`
   - `game.js`
   - `README.md`
   - `LICENSE`
3. 填写commit信息：`Add speed touch shooting game files`
4. 点击 "Commit changes"

#### 方式二：使用Git命令行
```bash
# 克隆新仓库到本地
git clone https://github.com/您的用户名/speed-touch-game.git
cd speed-touch-game

# 将游戏文件复制到此目录中
# 然后提交文件
git add .
git commit -m "Add speed touch shooting game files"
git push origin main
```

### 3. 启用GitHub Pages
1. 在仓库页面，点击 "Settings" 选项卡
2. 在左侧菜单中找到 "Pages"
3. 在 "Source" 部分选择：
   - Source: `Deploy from a branch`
   - Branch: `main` (或 `master`)
   - Folder: `/ (root)`
4. 点击 "Save"

### 4. 访问游戏
等待几分钟后，您的游戏将可以通过以下链接访问：
```
https://您的用户名.github.io/speed-touch-game/
```

## 🔧 文件清单

确保您的仓库包含以下文件：

```
speed-touch-game/
├── index.html          # 游戏主页面
├── style.css           # 样式文件
├── game.js             # 游戏逻辑
├── README.md           # 项目说明
├── LICENSE             # 开源许可证
└── DEPLOY.md           # 部署指南（本文件）
```

## 🎯 测试游戏

部署完成后，请测试以下功能：
- [ ] 页面正常加载
- [ ] 瞄准镜正常显示和跟踪
- [ ] 难度选择正常工作
- [ ] 音效可以开启/关闭
- [ ] 射击和爆破效果正常
- [ ] ESC暂停功能正常
- [ ] 成绩记录和显示正常
- [ ] 移动设备兼容性

## 🚀 优化建议

### SEO优化
在 `index.html` 的 `<head>` 中添加更多SEO标签：
```html
<meta property="og:title" content="极速触点 · 射击游戏">
<meta property="og:description" content="使用专业瞄准镜精准射击彩色移动目标！">
<meta property="og:type" content="website">
<meta property="og:url" content="https://您的用户名.github.io/speed-touch-game/">
```

### 性能优化
- 所有资源已内联，无需外部依赖
- CSS和JS已压缩优化
- 使用requestAnimationFrame确保流畅动画

## 🎮 分享游戏

游戏部署成功后，您可以：
1. 将链接分享给朋友
2. 在社交媒体上宣传
3. 添加到个人作品集
4. 提交到游戏展示平台

## 🛠️ 自定义修改

如需修改游戏：
1. 编辑相应文件
2. 提交更改到GitHub
3. GitHub Pages将自动更新

祝您部署顺利，游戏大受欢迎！🎯