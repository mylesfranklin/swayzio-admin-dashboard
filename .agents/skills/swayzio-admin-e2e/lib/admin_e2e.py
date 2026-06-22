#!/usr/bin/env python3
"""Swayzio Admin Dashboard E2E helpers.

Read-only helpers for the swayzio-admin-e2e skill — the awkward-from-an-agent-loop bits:

  - inbox-codes : pull the latest N-digit Clerk verification codes from the AgentMail inbox
  - inbox-list  : list recent inbox messages (subject + from, sanitized)

(No upload/synth helpers — the admin dashboard is read-only analytics; sign-in + page
loads + API assertions are driven directly via the `browser-use` CLI, see SKILL.md.)

Secrets live in .e2e/env (gitignored). Nothing here prints tokens or raw payloads.
"""
from __future__ import annotations

import json
import os
import re
import subprocess
import sys
from pathlib import Path


def _find_e2e_dir() -> Path:
    override = os.environ.get("SWAYZIO_E2E_DIR")
    if override:
        return Path(override)
    here = Path(__file__).resolve()
    for base in (here.parent, here.parent.parent, *Path.cwd().resolve().parents, Path.cwd().resolve()):
        candidate = base / ".e2e"
        if (candidate / "env").exists() or candidate.is_dir():
            return candidate
    return Path.cwd() / ".e2e"


E2E_DIR = _find_e2e_dir()
ENV_FILE = E2E_DIR / "env"


def load_env() -> dict[str, str]:
    env: dict[str, str] = {}
    if ENV_FILE.exists():
        for line in ENV_FILE.read_text().splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, _, v = line.partition("=")
            env[k.strip()] = v.strip()
    return env


def _agentmail(args: list[str]) -> dict:
    env = {**os.environ, **load_env()}
    out = subprocess.run(["agentmail", *args], capture_output=True, text=True, env=env)
    if out.returncode != 0:
        raise SystemExit(f"agentmail failed: {out.stderr.strip()[:200]}")
    return json.loads(out.stdout or "{}")


def _inbox_id() -> str:
    return load_env().get("SWAYZIO_E2E_INBOX_ID", "swayzio-admin-qa@agentmail.to")


def inbox_list(limit: int = 10) -> None:
    inbox = _inbox_id()
    data = _agentmail(["inboxes:messages", "list", "--inbox-id", inbox])
    msgs = data.get("messages", [])[:limit]
    print(f"inbox={inbox} count={data.get('count')}")
    for m in msgs:
        subj = (m.get("subject") or "")[:60]
        frm = m.get("from_") or m.get("from") or "?"
        print(f"  {m.get('timestamp','')[:19]}  {frm[:34]:34}  {subj}")


def inbox_codes(digits: int = 6, limit: int = 5) -> None:
    """Print the most recent verification codes found in the inbox (newest first)."""
    inbox = _inbox_id()
    data = _agentmail(["inboxes:messages", "list", "--inbox-id", inbox])
    pat = re.compile(r"\b(\d{%d})\b" % digits)
    found = []
    for m in data.get("messages", []):
        text = " ".join(str(m.get(k) or "") for k in ("subject", "preview"))
        for code in pat.findall(text):
            found.append((m.get("timestamp", ""), code, (m.get("subject") or "")[:40]))
    for ts, code, subj in found[:limit]:
        print(f"{code}  ({ts[:19]}  {subj})")
    if not found:
        print("(no codes found yet — sender may still be in flight)")


def main(argv: list[str]) -> int:
    if not argv:
        print(__doc__)
        return 0
    cmd = argv[0]
    if cmd == "inbox-list":
        inbox_list(int(argv[1]) if len(argv) > 1 else 10)
    elif cmd == "inbox-codes":
        inbox_codes(int(argv[1]) if len(argv) > 1 else 6)
    else:
        print(f"unknown command: {cmd}", file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
