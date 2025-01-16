import json

# 输入JSON文件路径
input_file = "data.json"
# 输出JS文件路径
output_file = "data.js"

# 读取JSON数据并转换为JS格式
def convert_json_to_js(input_file, output_file):
    # 打开并读取输入JSON文件
    with open(input_file, 'r', encoding='utf-8') as file:
        data = file.readlines()
    
    # 解析JSON数据并按 repository 进行分组
    grouped_data = {}
    for line in data:
        entry = json.loads(line.strip())
        repo_name = entry['repository'].split('/')[1].lower()
        if repo_name not in grouped_data:
            grouped_data[repo_name] = []
        # 移除 repository 字段
        entry.pop('repository')
        grouped_data[repo_name].append(entry)
    
    # 转换为JS格式
    js_content = "const contributorsData = {\n"
    for repo, contributors in grouped_data.items():
        js_content += f'    "{repo}": {json.dumps(contributors, indent=8)},\n'
    js_content = js_content.rstrip(",\n") + "\n};"
    
    # 写入到输出JS文件
    with open(output_file, 'w', encoding='utf-8') as file:
        file.write(js_content)

# 执行转换
convert_json_to_js(input_file, output_file)

print(f"Conversion completed! Check the output file: {output_file}")
