#!/usr/bin/env bash
# 网络恢复后一键完成收录提交（在本目录执行）
set -e
cd "$(dirname "$0")"
P="-c http.proxy=http://45.192.102.18:17913 -c https.proxy=http://45.192.102.18:17913"
for i in 1 2 3; do git $P push https://github.com/240xu/awesome-dsh-plugin.git add-tech-lead && break || git push https://github.com/240xu/awesome-dsh-plugin.git add-tech-lead && break || sleep 60; done
TOKEN=$(python3 -c "import yaml;print(yaml.safe_load(open('$HOME/.config/opencode/GITHUB_TOKEN')))" 2>/dev/null || cat $HOME/.config/opencode/GITHUB_TOKEN)
export GH_TOKEN="$TOKEN"
gh pr create --repo awesome-dsh-plugin/awesome-dsh-plugin \
  --head 240xu:add-tech-lead --base main \
  --title "add tech-lead-skill (workflow): 21 read-only governance tools" \
  --body "Single DSH plugin **@240xu/dsh-tech-lead** (npm, v1.0.0): 21 read-only lifecycle governance tools — task tiering (T0-T2), state/plan/evidence validation, gate precheck/aggregation/reopen, release & install audits, context/progress analysis, critical path, resume reconciliation, mutation preview (always denies execution). Repo: https://github.com/240xu/tech-lead-skill · install: \`dsh plugin add @240xu/dsh-tech-lead\`. Tool count pinned by tests (169→176 passing incl. composition harness TLT-PASS 21/21). Category workflow."
echo "PR done → check https://github.com/awesome-dsh-plugin/awesome-dsh-plugin/pulls"
