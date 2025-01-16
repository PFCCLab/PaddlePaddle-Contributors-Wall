# Contributors Wall

一个炫酷的开源贡献者展示墙，支持展示组织下所有仓库的贡献者信息。

## 特性

- 🎨 黑客风格设计
- 📱 响应式布局
- ⚡️ 性能优化
- 🔄 无限滚动加载
- 🔍 实时搜索
- 📊 贡献者统计
- 🏷️ 仓库分类
- 💫 动态效果

## 使用方法

### 1. 环境要求

- Python 3.6+
- GitHub Personal Access Token
- 现代浏览器（支持 CSS Grid 和 Intersection Observer）

### 2. 配置

1. 创建 GitHub Personal Access Token:
   - 访问 [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
   - 生成新的 token，需要以下权限：
     - `repo`
     - `read:org`
     - `read:user`
     - `read:project`

2. 设置环境变量：
```bash
export GITHUB_TOKEN="你的GitHub Token"
```

### 3. 安装依赖

```bash
pip install -r requirements.txt
```

### 4. 运行

可以使用自动执行脚本：
```bash
./update_wall.sh
```

或者手动执行以下步骤：

1. 获取贡献者数据：
```bash
python fetchData.py
```

2. 转换数据格式：
```bash
python json2js.py
```

3. 启动本地服务器：
```bash
python -m http.server 8000
```

4. 访问页面：
打开浏览器访问 `http://localhost:8000`

## 功能说明

### 导航栏
- 左侧：仓库分页和分类
- 右侧：搜索功能（支持按用户名或仓库名搜索）

### 分类功能
- 按贡献者数量降序排列
- 显示每个仓库的贡献者数量
- 每页显示5个仓库
- "All" 视图显示所有不重复的贡献者

### 贡献者展示
- 悬浮显示用户名
- 点击跳转到 GitHub 主页
- 悬浮显示详细信息（followers、following、stars）
- 每次加载100个贡献者
- 滚动自动加载更多

### 搜索功能
- 实时搜索
- 支持按用户名搜索
- 支持按仓库名搜索
- 搜索结果实时过滤

## 自定义配置

可以在 `styles.css` 中修改以下变量来自定义样式：
```css
:root {
    --primary-color: #00ff00;      /* 主色调 */
    --secondary-color: #1a1a1a;    /* 次要色调 */
    --background-color: #000000;   /* 背景色 */
    --text-color: #00ff00;         /* 文字颜色 */
    --hover-color: #00ff9d;        /* 悬浮色调 */
    --grid-gap: 30px;              /* 网格间距 */
}
```

## 注意事项

1. 首次加载可能需要较长时间，具体取决于组织的仓库数量和贡献者数量
2. 建议定期更新数据以保持最新状态
3. 请勿频繁请求 GitHub API，注意遵守 API 限制
4. 对于大型组织，建议增加请求延迟以避免触发 API 限制 