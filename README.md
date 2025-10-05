# Origami
Origami is an AI-powered Obsidian plugin that allows you to edit markdown files in a [gingko-like](https://gingkowriter.com/) tree interface with context-aware LLM conversations.

![](https://raw.githubusercontent.com/ycnmhd/obsidian-lineage/docs/docs/media/screenshot.png)

## Usage
To open a file, use the ribbon icon, the file context menu, or the command palette.
To export a file, use the view context menu.


the reason why i ask is because i want to change the uiux most prompt/context engineers interface with. i think somehting to consolidate the meriade of tangential thoughts that surface while debugging would be more akin to the gingko 
interface. which is the src code we are looking at here. I would like to drive/steer ai agents from this obsidian plugin. I would like to chat with an LLM inside of obsidian rather than a vscode fork as I am having AI agents editting my codebase directly while i watch.


These other pllugins are what make the switch to obsidian for agentic driven development more seamless:
https://github.com/sunxvming/obsidian-vscode-editor/fork (read only vscode sync. so i can monitor my codebase without accidentally committing changes.)
https://github.com/polyipseity/obsidian-terminal (an integrated terminal where i can chat with an LLM to drive the development of my codebase, or use vim to edit my files directly. All within obsidian.)

So my ask is that you improve the capabilites of this plugin by integrating LLM agents that I'm running from my terminal session into a synced chat history within the gingko interface. So my chat submission uiux will be on a gingko tree structure rather than a linear list. This will allow me to have a more structured conversation with isolated context windows for respective sub forks of a conversation with my LLM agents while i am developing my codebase. I need all the tools that cursor offers in the chat bar into the gingko interface of this plugin.

This is an ambitious and fascinating project! You're essentially building a tree-structured AI conversation interface inside Obsidian, merging Cursor's agent capabilities with Gingko's branching UI.
Before I can create a solid plan, I need to clarify some critical architectural decisions:
Clarifying Questions
A. LLM Integration Method (most critical)
Which approach for connecting to LLMs?
a) Local LLMs via CLI (ollama, llama.cpp, etc.)
b) Cloud APIs (OpenAI, Anthropic, etc.)
c) Both with provider selection
d) Generic stdio interface to any LLM process
Default assumption: (d) - most flexible for terminal-based agents
B. Terminal Sync Mechanism
How should conversations sync with terminal sessions?
a) Capture I/O from obsidian-terminal plugin
b) Separate background process with IPC
c) Manual copy/paste workflow (Phase 1)
d) WebSocket/HTTP server for bidirectional sync
Default assumption: (c) for MVP, then (d)
C. Feature Priority (scope control)
Which Cursor capabilities are Phase 1?
a) Basic chat + @ file mentions only
b) Add code editing (search/replace in codebase)
c) Add terminal execution + linter integration
d) Full parity with Cursor (all @ mentions, web, git, etc.)
Default assumption: (a) for MVP
D. Context Isolation Model
How should tree branches handle context?
a) Each branch inherits parent context (cumulative)
b) Each branch starts fresh (isolated)
c) User chooses per-branch
d) Smart context based on @ mentions
Default assumption: (a) - most intuitive
Please answer these (just letters if you want), or tell me to proceed with defaults.

context engineering concepts:
https://research.trychroma.com/context-rot
https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents

how to set the obsidian sample plugin pathway:
https://claude.ai/chat/9f3fb2c5-ed24-49d5-984b-cb0a37917b17