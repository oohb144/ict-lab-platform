# codex、claude配置教程（Windows）

> codex和claude的教程。claude和codex本质是框架，相当于把ai做成一个全流程的配件，用起来方便，你下载好之后填入api就能用，花钱主要是用来买api。这俩原装的有自己的api，是国外的，很好用，但是相对贵一点，claude最nb，写专业代码用；codex相对便宜一点，可以用来学电路和写论文；也可以接入deepseek的api，很便宜，平时写作业可以问，写论文也可以。
>
> codex配置相对麻烦一点点，需要自己装mcp
>
> claude有插件可以直接装

## 1. 环境准备（必做）

| 项目 | 你要做的事 | 验证方式（在终端执行） | 参考/来源 |
|---|---|---|---|
| Git | 安装 Git for Windows（默认选项即可） | `git --version` | `https://git-scm.com/install/windows` |
| Node.js | 安装 Node.js（Windows 推荐 `.msi`，默认选项即可） | `node -v`、`npm -v` | `https://nodejs.cn/download/` |
| Python | 确保已安装 Python（用于安装 `uv`、运行 Serena） | `python --version` 或 `py --version` |（按你的系统已有为准） |

具体操作

1. 按下键盘上的win+r键，输入cmd，在按下ctrl+shift+enter打开这个**（以管理员权限打开）**

​	![image-20260311133657282](G:\教程\ai\整合版_Codex_配置与MCP教程.assets\image-20260311133657282.png)

2. 安装内容

   1. 安装git

      https://git-scm.com/install/windows

       下载 Git for Windows 安装包， 运行安装程序，全程使用默认选项即可

      装好了验证git，用第一步打卡的命令行，输入

      `git --version`

      ![image-20260311134313555](G:\教程\ai\整合版_Codex_配置与MCP教程.assets\image-20260311134313555.png)

      返回版本号就表示安装好了

   2. 安装Node.js

      1. 下载链接[下载 | Node.js 中文网](https://nodejs.cn/download/)

      2. 下载对应系统的安装包（Windows 选择 .msi），下载对应系统的安装包（Windows 选择 .msi）

      3. 安装完成后验证：

         `node -v`

         `npm -v`

         ![image-20260311134556862](G:\教程\ai\整合版_Codex_配置与MCP教程.assets\image-20260311134556862.png)

   3. ccswitch安装（在文件里面有）
   4. python安装（你应该有）

---



## 3. 准备中转站信息（URL + API Key）

采用“中转站”方式使用模型购买api（需要注册与充值）。用之前最好先冲1两块钱

你需要准备两项信息：

| 名称 | 示例 | 说明 |
|---|---|---|
| Base URL | `https://www.openclaudecode.cn/` | 中转站站点地址 |
| API Key / Token | `sk-***` | 每个人不同，不要泄露 |

我用的是这个中转站https://www.openclaudecode.cn，作者认识，不太容易跑路；你也可以到网上找一些中转站，不过注意辨别，有的可能会降智或者跑路。按照下面图片操作就行

##### 米醋api

![image-20260311190851813](G:\教程\ai\整合版_Codex_配置与MCP教程.assets\image-20260311190851813.png)

![image-20260311191017544](G:\教程\ai\整合版_Codex_配置与MCP教程.assets\image-20260311191017544.png)

![image-20260311191110500](G:\教程\ai\整合版_Codex_配置与MCP教程.assets\image-20260311191110500.png)

![image-20260311191153351](G:\教程\ai\整合版_Codex_配置与MCP教程.assets\image-20260311191153351.png)

框选中的sk开头的东西就是密钥，等下需要

##### deepseekapi

deepseek的便宜，这个可以接入来用。但是注意，codex和claude的api一般只能不能接入别的模型，容易被封，要用claude的api就只在claude里面用。deepseek随意

网站https://platform.deepseek.com/usage

![image-20260311191420142](G:\教程\ai\整合版_Codex_配置与MCP教程.assets\image-20260311191420142.png)

创建就行。

**一定记得，api不要透露出去，这个就是你用钱**

## 4. 使用 CCswitch 配置中转站（推荐）

本目录含 `CC-Switch-v3.8.2-Windows-Portable`（便携版），常见做法是用它管理“API Key + 请求地址”。

| 步骤 | 操作 |
|---|---|
| 1 | 打开 CCswitch |
| 2 | 右上角“添加” |
| 3 | 选择“自定义配置”，填写：`apikey` + `api请求地址（建议带 /v1）` |

![image-20260311191536046](G:\教程\ai\整合版_Codex_配置与MCP教程.assets\image-20260311191536046.png)

![image-20260311191625572](G:\教程\ai\整合版_Codex_配置与MCP教程.assets\image-20260311191625572.png)

##### 对claude

![image-20260311191714076](G:\教程\ai\整合版_Codex_配置与MCP教程.assets\image-20260311191714076.png)

- 用我发的中转站的话，

  供应商名字随便写

  上面填你的apikey（前面复制的）

  请求地址写https://www.openclaudecode.cn

- 用deepseek官方的话，选中直接填api就行

![image-20260311191937379](G:\教程\ai\整合版_Codex_配置与MCP教程.assets\image-20260311191937379.png)

##### 对codex

![image-20260311192014948](G:\教程\ai\整合版_Codex_配置与MCP教程.assets\image-20260311192014948.png)

其他都一样，就用米醋的话需要把请求地址改成这个https://www.openclaudecode.cn/v1

deepseek跟上面没区别

>
>
>完成第一步之后，就可以选择安装了，选择cloude或者codex，也可以都下
>
>下载的时候一直使用管理员权限打开cmd（命令行，powershell）

# 安装codex

## 安装

在 `cmd` 或 PowerShell 中执行：

```bash
npm install -g @openai/codex
```

验证

`codex --version`

![image-20260311134740319](G:\教程\ai\整合版_Codex_配置与MCP教程.assets\image-20260311134740319.png)

---



---

## 6. 配置 Codex 目录（`.codex`）

按 `Win + R`，输入并回车打开配置目录：

```bash
%userprofile%\.codex
```

![image-20260311200807823](G:\教程\ai\整合版_Codex_配置与MCP教程.assets\image-20260311200807823.png)

常见文件说明：

| 文件 | 用途 |
|---|---|
| `config.toml` | Codex 核心配置（含 MCP 配置） |
| `auth.json` | 可用于配置鉴权信息（有些人用环境变量替代它） |
| `AGENTS.md` | 全局工作指南/提示词（影响 Codex 行为）（需要自己手动创建） |

`AGENTS.md` 模板（可直接粘贴）

```md
# Codex全局工作指南

## 回答风格:
 - 回答必须使用中文
 - 对总结、Plan、Task、以及长内容的输出，优先进行逻辑整理后使用美观的Table格式整齐输出;普通内容正常输出

## 工具使用:
1. 文件与代码检索:使用serena mcp来进行文件与代码的检索
2. 文件相关操作:对文件的创建、读取、编辑、删除等操作
    - 优先使用apply_patch工具进行
    - 读文件，apply_patch工具报错或出现问题的情况下使用desktop-commander mcp
    - 任何情况下，禁止使用cmd、powershell或者python来进行文件相关操作
```

---

## 7. 配置 MCP（把 Serena/desktop-commander 接入 Codex）

打开`%userprofile%\.codex\config.toml`，在文件末尾追加下面片段（整合自教程，并加了超时建议）：

```toml
[mcp_servers.desktop-commander]
type = "stdio"
command = "cmd"
args = ["/c", "npx", "-y", "@wonderwhy-er/desktop-commander@latest", "--no-onboarding"]

[mcp_servers.desktop-commander.env]
SystemRoot = "C:\\Windows"

[mcp_servers.Serena]
type = "http"
url = "http://127.0.0.1:9121/mcp"
```

---

## 8. 安装并启动 Serena MCP Server（本机 9121 端口）

### 8.1 安装 uv

```bash
pip install uv
```

### 8.2 拉取 Serena 仓库

在你希望存放代码的位置新建一个目录（例如 `D:\MCP`），然后执行：

```bash
git clone https://github.com/oraios/serena.git
```

如果你安装失败了，跟我说我把包直接分享给你

### 8.3 启动 MCP Server

要在这个目录下启动这个命令

![image-20260311192619740](G:\教程\ai\整合版_Codex_配置与MCP教程.assets\image-20260311192619740.png)

![image-20260311192644816](G:\教程\ai\整合版_Codex_配置与MCP教程.assets\image-20260311192644816.png)

```bash
uv run serena start-mcp-server --context codex --transport streamable-http --port 9121
```

保持该窗口运行（每次都要打开）；然后在另一个终端窗口里运行 Codex 即可使用 MCP。

这个是codex必须要有的东西，不然他没办法自动读取你本地文件；如果装claude的话不需要。

启动后是这个样子

![image-20260311202618773](G:\教程\ai\整合版_Codex_配置与MCP教程.assets\image-20260311202618773.png)

---

## 9. 开始使用 Codex

| 场景 | 做法 |
|---|---|
| 在某个项目目录里使用 | 在资源管理器进入该目录，在地址栏输入 `cmd` 打开终端，然后输入 `codex` |
| 仅对话/问答 | 直接 `codex`，交互方式类似聊天 |
| 让它读代码/改代码 | 在你的项目目录里启动 `codex`，给出明确任务（例如“修复报错并运行测试”） |

我教你的是使用命令行配置使用，在文件夹里面打开可以读取整个文件夹并写入写出。以下是两种打开方式

![image-20260311202314247](G:\教程\ai\整合版_Codex_配置与MCP教程.assets\image-20260311202314247.png)

![image-20260311202336959](G:\教程\ai\整合版_Codex_配置与MCP教程.assets\image-20260311202336959.png)

打开终端后，直接输入`codex`

![image-20260311202711175](G:\教程\ai\整合版_Codex_配置与MCP教程.assets\image-20260311202711175.png)

就正常进入了。这个报错不用管，是mcp的问题，只要你打开了就没啥问题，可以无视

你可以先问问他能不能读取本地，看看配置好了没

![image-20260311202856377](G:\教程\ai\整合版_Codex_配置与MCP教程.assets\image-20260311202856377.png)

# 安装claude

## 安装

打开命令行，输入

```powershell
npm install -g @anthropic-ai/claude-code
```

验证

 ```powershell
 claude --version
 ```

![image-20260311201357364](G:\教程\ai\整合版_Codex_配置与MCP教程.assets\image-20260311201357364.png)

## 配置

快速初始化

```
npx zcf
```

这个可以自动完成各项配置

![image-20260311202002564](G:\教程\ai\整合版_Codex_配置与MCP教程.assets\image-20260311202002564.png)

![image-20260311202200909](G:\教程\ai\整合版_Codex_配置与MCP教程.assets\image-20260311202200909.png)

## 使用

具体看上面的2.59开始使用 Codex

然后不一样的是需要输入这个：`claude`

![image-20260311202918726](G:\教程\ai\整合版_Codex_配置与MCP教程.assets\image-20260311202918726.png)这个是问是否信任这个文件夹，直接选1就行

这样就可以用了

我用的deepseek的来玩，便宜一点![image-20260311203015201](G:\教程\ai\整合版_Codex_配置与MCP教程.assets\image-20260311203015201.png)

配置完成之后可以去b站搜搜美化教程，把命令行美化一下
