import json
import os
from github import Github, GithubException

# GitHub API 配置
GITHUB_TOKEN = os.getenv('GITHUB_TOKEN')  # 从环境变量中获取 GitHub Token
ORG_NAME = 'paddlepaddle'  # 替换为你的组织名称

# 初始化 GitHub 客户端
g = Github(GITHUB_TOKEN)

def get_user_details(user):
    """获取用户的详细信息"""
    print(f"Fetching details for user: {user.login}")
    return {
        "username": user.login,
        "avatar": user.avatar_url,
        "followers": user.followers,
        "following": user.following,
        "stars": sum(repo.stargazers_count for repo in user.get_repos()),
        "profile": user.html_url
    }

def save_contributors(data, filename="data1.json", mode="a"):
    """保存贡献者信息到文件"""
    print(f"Saving {len(data)} contributors to {filename}...")
    with open(filename, mode, encoding="utf-8") as f:
        for entry in data:
            json.dump(entry, f, ensure_ascii=False)
            f.write("\n")  # 每条数据占一行
    print(f"Successfully saved {len(data)} contributors to {filename}")

def main():
    try:
        # 获取组织
        print(f"Fetching organization: {ORG_NAME}")
        org = g.get_organization(ORG_NAME)
        print(f"Successfully fetched organization: {ORG_NAME}")

        # 存储所有贡献者信息
        contributors_data = []

        # 遍历组织下的所有仓库
        for repo in org.get_repos():
            repo_name = repo.full_name
            print(f"\nProcessing repository: {repo_name}")

            # 获取仓库的贡献者
            print(f"Fetching contributors for repository: {repo_name}")
            contributors = repo.get_contributors()
            print(f"Found {contributors.totalCount} contributors in repository: {repo_name}")

            # 遍历贡献者
            for contributor in contributors:
                username = contributor.login
                print(f"\nFetching details for contributor: {username}")

                # 获取贡献者的详细信息
                user = g.get_user(username)
                user_details = get_user_details(user)
                user_details["repository"] = repo_name  # 添加所属仓库

                # 将贡献者信息添加到列表
                contributors_data.append(user_details)
                print(f"Added contributor {username} to the list")

                # 每 50 条数据保存到 data.json 文件
                if len(contributors_data) % 50 == 0:
                    save_contributors(contributors_data)
                    contributors_data = []  # 清空列表
                    print("Cleared the contributors list")

        # 保存剩余的数据（如果不足 50 条）
        if contributors_data:
            save_contributors(contributors_data)
            print("Saved remaining contributors to data.json")

        print("\nAll contributor details have been saved to data.json.")

    except GithubException as e:
        print(f"\nGitHub API error: {e}")
    except Exception as e:
        print(f"\nAn error occurred: {e}")

if __name__ == "__main__":
    main()