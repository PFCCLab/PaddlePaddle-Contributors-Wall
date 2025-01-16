#!/bin/bash

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查是否设置了 GITHUB_TOKEN 环境变量
if [ -z "$GITHUB_TOKEN" ]; then
    echo -e "${RED}错误: 未设置 GITHUB_TOKEN 环境变量${NC}"
    echo "请先设置环境变量："
    echo "export GITHUB_TOKEN='你的GitHub个人访问令牌'"
    exit 1
fi

# 检查 Python 版本
python_version=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
if (( $(echo "$python_version < 3.6" | bc -l) )); then
    echo -e "${RED}错误: Python 版本必须 >= 3.6${NC}"
    echo "当前版本: $python_version"
    exit 1
fi

# 检查依赖
echo -e "${BLUE}检查依赖...${NC}"
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt
else
    echo -e "${RED}错误: 未找到 requirements.txt${NC}"
    exit 1
fi

# 获取贡献者数据
echo -e "${BLUE}获取贡献者数据...${NC}"
python3 fetchData.py
if [ $? -ne 0 ]; then
    echo -e "${RED}错误: 获取数据失败${NC}"
    exit 1
fi

# 转换数据格式
echo -e "${BLUE}转换数据格式...${NC}"
python3 json2js.py
if [ $? -ne 0 ]; then
    echo -e "${RED}错误: 转换数据失败${NC}"
    exit 1
fi

# 检查必要文件
required_files=("index.html" "styles.css" "script.js" "data.js")
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo -e "${RED}错误: 未找到必要文件 $file${NC}"
        exit 1
    fi
done

# 启动本地服务器
echo -e "${GREEN}数据更新成功！${NC}"
echo -e "${BLUE}启动本地服务器...${NC}"
echo -e "${GREEN}请访问 http://localhost:8000${NC}"

# 检查端口是否被占用
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${RED}警告: 端口 8000 已被占用${NC}"
    echo "请手动启动服务器或使用其他端口"
else
    python3 -m http.server 8000
fi 