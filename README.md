# RPM 包一键构建系统

本项目是一个前后端分离的 Web 系统，支持通过输入 Git 仓库 URL 和分支名，一键自动拉取源码并构建 RPM 包，支持实时日志推送和 RPM 包打包下载。

## 目录结构

```
rpmbuild/
├── frontend/         # 前端 React + Vite 项目
│   ├── src/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server/           # 后端 Flask + SocketIO 服务
│   ├── app.py
│   ├── requirements.txt
│   └── startup.sh
└── rpmbuild.sh       # RPM 构建核心 Shell 脚本
```

## 功能简介

- 输入 Git 仓库 URL 和分支名（支持 master、main、dev、test 及自定义）
- 实时显示构建日志
- 构建完成后可一键下载所有 RPM 包（zip 格式）

## 环境准备

### 1. RPM 构建环境（建议在 CentOS/RHEL/openEuler 等 RPM 系 Linux 下运行）

```bash
sudo yum install -y git rpm-build rpmdevtools yum-utils dnf-plugins-core
rpmdev-setuptree
```

### 2. 后端依赖

```bash
cd server
pip3 install -r requirements.txt  -i https://pypi.tuna.tsinghua.edu.cn/simple
```

### 3. Node.js 环境（推荐 nvm 管理）

如未安装 Node.js，推荐使用 nvm（Node Version Manager）进行安装和管理：

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
source ~/.nvm/nvm.sh
nvm list-remote --lts      # 列出可用的 LTS 版本
nvm list                   # 查看已安装的版本
nvm install --lts          # 安装最新 LTS 版本
nvm use --lts              # 使用最新 LTS 版本
node -v                    # 查看当前 node 版本
```

### 4. 前端依赖

```bash
cd frontend
npm install
```

## 启动方式

### 1. 启动后端

```bash
cd server
python3 app.py
```
默认监听 5000 端口。

### 2. 启动前端（开发模式）

```bash
cd frontend
npm run dev -- --host
```
开发环境下前端会自动代理 WebSocket 和下载接口到后端。

### 3. 前端打包（生产部署）

```bash
cd frontend
npm run build
```
打包产物在 `frontend/dist`，由 Flask 后端自动托管。

## 使用方法

1. 浏览器访问前端页面（如 http://localhost:5173 或 http://localhost:5000）
2. 输入 Git 仓库 URL 和分支名（可选 master、main、dev、test 或自定义）
3. 点击“开始构建”，实时查看日志
4. 构建完成后点击“下载全部RPM包”获取 zip 包

## Shell 脚本说明

- `rpmbuild.sh <仓库URL> <分支名>`
- 自动拉取源码、查找 spec 文件、下载源码、安装依赖、构建 RPM 包并清理临时目录
- 构建产物默认输出到 `~/rpmbuild/RPMS/`

## 注意事项

- 需保证目标仓库包含合法的 spec 文件
- 需有 RPM 构建环境权限
- Python 版本 3.7 及以上

## 许可证

本项目采用MIT License，详见LICENSE文件。
