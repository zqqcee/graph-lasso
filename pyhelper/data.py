import json
import random


def parse_graph_file(input_file, output_file):
    # 用于存储节点和边
    nodes_set = set()
    links = []

    # 读取文件内容
    with open(input_file, 'r') as file:
        for line in file:
            # 跳过空行
            line = line.strip()
            if not line:
                continue
            if line.startswith('h'):
                continue
            # 解析每一行，获取 source 和 target
            source, target = line.split()
            if random.random() > 2:
                continue;
            nodes_set.add(source)
            nodes_set.add(target)
            if random.random() > 0:
                links.append({"source": source, "target": target})

    # 将节点集合转为列表，并为每个节点创建对象
    nodes = [{"id": node, "mgmt_ip":node} for node in nodes_set]

    # 创建最终的图结构
    graph = {"nodes": nodes, "links": links}

    # 保存为 JSON 文件
    with open(output_file, 'w') as json_file:
        json.dump(graph, json_file, indent=2)

    print(f"Graph data successfully written to {output_file}")


# 输入和输出文件路径
# input_file = "data/osdata/Email Eu Core Network.txt"  # 输入的图数据文件路径
# input_file = "data/osdata/Wikipedia Vote Network.txt"
input_file = "data/osdata/dimacs10-netscience.txt"

output_file = "data/osdata-trans/case3.json"  # 输出的 JSON 文件路径

# 调用函数
parse_graph_file(input_file, output_file)
