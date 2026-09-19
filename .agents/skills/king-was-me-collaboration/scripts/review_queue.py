"""KING WAS ME review queue: scans are read-only; acknowledgments are digest-checked."""
import argparse
import hashlib
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def read_json(path, default):
    return json.loads(path.read_text(encoding="utf-8-sig")) if path.exists() else default


def timestamp():
    return datetime.now(timezone.utc).isoformat()


def allowed_file(root, relative):
    candidate = (root / relative).resolve()
    allowed = [root / "MVP/development/verification", root / "MVP/development/collaboration/reviews"]
    if not any(candidate.is_relative_to(p.resolve()) for p in allowed):
        raise ValueError("Review/result path must stay inside permitted review directories")
    if not candidate.is_file():
        raise ValueError("File does not exist")
    return candidate


def scan(root):
    base = root / "MVP/development/collaboration"
    state = read_json(base / "codex_state.json", {"processed": {}})
    files = list((root / "MVP/development/verification").glob("*claude_review*.md"))
    files += list((base / "reviews").glob("*.md"))
    reviews = []
    for p in sorted([p for p in files if not p.name.endswith("_codex_response.md")], key=lambda f: (f.stat().st_mtime_ns, str(f))):
        allowed_file(root, p.relative_to(root))
        relative = p.relative_to(root).as_posix()
        digest = sha(p)
        if state.get("processed", {}).get(relative, {}).get("sha256") != digest:
            reviews.append({"path": relative, "sha256": digest})
    tasks = read_json(base / "tasks.json", {"tasks": []})["tasks"]
    controls = [read_json(p, {}) for p in sorted((base / "controls").glob("*.json"))]
    instructions = [read_json(p, {}) for p in sorted((base / "instructions").glob("*.json"))]
    pending_instructions = [i for i in instructions if any(
        a.get("status") == "pending" for a in i.get("agents", {}).values())]
    return {"htmlSha256": sha(root / "MVP/development/KING_WAS_ME_MVP.html"),
            "pendingReviews": reviews,
            "pendingTasks": [t for t in tasks if t.get("status") == "pending"],
            "pendingControls": [t for t in controls if t.get("status") == "pending"],
            "pendingInstructions": pending_instructions,
            "activeWork": read_json(base / "active_work.json", None)}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    subs = parser.add_subparsers(dest="command", required=True)
    for command in ["scan", "complete", "acquire", "release"]:
        child = subs.add_parser(command)
        child.add_argument("--root", required=True)
        if command == "complete":
            child.add_argument("--review", required=True)
            child.add_argument("--expected-sha", required=True)
            child.add_argument("--result", required=True)
        if command == "acquire":
            child.add_argument("--owner", choices=["codex", "claude"], required=True)
            child.add_argument("--token", required=True)
            child.add_argument("--expected-html-sha", required=True)
        if command == "release":
            child.add_argument("--token", required=True)
    args = parser.parse_args()
    root = Path(args.root).resolve()
    base = root / "MVP/development/collaboration"
    if args.command == "scan":
        print(json.dumps(scan(root), ensure_ascii=False, indent=2))
        return
    base.mkdir(parents=True, exist_ok=True)
    lock = base / "active_work.json"
    if args.command == "acquire":
        if sha(root / "MVP/development/KING_WAS_ME_MVP.html") != args.expected_html_sha:
            raise ValueError("HTML changed before acquiring work")
        data = {"owner": args.owner, "token": args.token, "startedAt": timestamp(),
                "baseHtmlSha256": args.expected_html_sha}
        with lock.open("x", encoding="utf-8") as stream:
            json.dump(data, stream, ensure_ascii=False, indent=2)
        # Catch a concurrent edit during acquisition; do not retain our lock.
        if sha(root / "MVP/development/KING_WAS_ME_MVP.html") != args.expected_html_sha:
            lock.unlink()
            raise ValueError("HTML changed during work acquisition")
        print("Acquired")
    elif args.command == "release":
        if read_json(lock, {}).get("token") != args.token:
            raise ValueError("Not the lock owner")
        lock.unlink()
        print("Released")
    elif args.command == "complete":
        p = allowed_file(root, args.review)
        result = allowed_file(root, args.result)
        if sha(p) != args.expected_sha:
            raise ValueError("Review changed during processing")
        state_path = base / "codex_state.json"
        state = read_json(state_path, {"processed": {}})
        state.setdefault("processed", {})[p.relative_to(root).as_posix()] = {
            "sha256": args.expected_sha, "result": result.relative_to(root).as_posix(),
            "processedAt": timestamp()}
        temporary = state_path.with_suffix(".tmp")
        with temporary.open("x", encoding="utf-8") as stream:
            json.dump(state, stream, ensure_ascii=False, indent=2)
        os.replace(temporary, state_path)
        print("Completed")


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError, KeyError) as exc:
        print(f"FAIL: {exc}", file=sys.stderr)
        sys.exit(1)
