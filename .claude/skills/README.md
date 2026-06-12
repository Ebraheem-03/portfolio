# Skills & MCP for this project

Two different mechanisms — keep them straight:

## SKILLS (stitch, impeccable)
A subagent only sees a skill if that skill is named in its `skills:` frontmatter (already done
in iris.md). Confirm they exist in your base skills dir:

```bash
ls ~/.claude/skills/
# expect: stitch  impeccable   (folder names may differ — adjust iris.md to match)
```

Skills load at session start. Restart Claude Code, then verify:

```
> what skills do you have available?
```

## MCP (21st.dev Magic)
21st.dev Magic is an MCP SERVER, not a skill. It needs an API key from the 21st.dev Magic
console. Pick ONE scope:

**Option A — user scope (recommended for a solo project; key stays out of git):**
```bash
claude mcp add magic --scope user --env API_KEY="YOUR_21ST_DEV_KEY" -- npx -y @21st-dev/magic@latest
```

**Option B — project scope (reproducible, committable):**
A safe `.mcp.json` is already at the project root. It reads the key from an env var so no secret
is committed. Export the key before launching Claude Code:
```bash
export MAGIC_API_KEY="YOUR_21ST_DEV_KEY"
claude
```

Then restart Claude Code and verify the server connected:
```
> /mcp            # should list "magic"
claude --debug    # if it doesn't connect, check the API key / quota
```

## How iris reaches the Magic MCP tools
iris has **no `tools:` field**, so it inherits every tool from the main session — including
`mcp__magic__*`. If you ever add an explicit `tools:` allow-list to iris, you MUST also add the
Magic tool names or it will lose MCP access, e.g.:
```yaml
tools: Read, Write, Edit, Bash, Glob, Grep, mcp__magic__21st_magic_component_builder, mcp__magic__21st_magic_component_refiner, mcp__magic__21st_magic_component_inspiration, mcp__magic__logo_search
```
(Adjust the `magic` segment if you named the server differently.)

## Notes
- Helios and Vesper intentionally have NO skills and NO MCP — they don't need them, and unused
  tools just cost context.
- If your Claude Code version complains about `memory: project` in an agent file, delete that one
  line; the agent still works (you just lose its persistent MEMORY.md).
