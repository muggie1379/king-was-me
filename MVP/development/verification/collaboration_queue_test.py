import hashlib
import json
import subprocess
import sys
import tempfile
from pathlib import Path

script = Path(sys.argv[1]).resolve()
if True:
    directory = sys.argv[2]
    root = Path(directory)
    verification = root / "MVP/development/verification"
    reviews = root / "MVP/development/collaboration/reviews"
    verification.mkdir(parents=True)
    reviews.mkdir(parents=True)
    (root / "MVP/development/KING_WAS_ME_MVP.html").write_text("baseline", encoding="utf-8")
    review = verification / "v1_claude_review.md"
    review.write_text("Review one", encoding="utf-8")
    result = verification / "setup_codex_report.md"
    result.write_text("Verified", encoding="utf-8")
    digest = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()

    def run(command, *args, success=True):
        p = subprocess.run([sys.executable, "-X", "utf8", str(script), command,
                            "--root", str(root), *args], capture_output=True, encoding="utf-8")
        assert (p.returncode == 0) == success, (p.stdout, p.stderr)
        return p.stdout

    before = sorted((str(p.relative_to(root)), p.stat().st_mtime_ns) for p in root.rglob("*") if p.is_file())
    initial = json.loads(run("scan"))
    assert len(initial["pendingReviews"]) == 1
    assert before == sorted((str(p.relative_to(root)), p.stat().st_mtime_ns) for p in root.rglob("*") if p.is_file())
    run("complete", "--review", "MVP/development/verification/v1_claude_review.md",
        "--expected-sha", digest(review), "--result", "MVP/development/verification/setup_codex_report.md")
    assert not json.loads(run("scan"))["pendingReviews"]
    old = digest(review)
    review.write_text("Review two", encoding="utf-8")
    run("complete", "--review", "MVP/development/verification/v1_claude_review.md",
        "--expected-sha", old, "--result", "MVP/development/verification/setup_codex_report.md", success=False)
    assert len(json.loads(run("scan"))["pendingReviews"]) == 1
    (root / "_shared").mkdir()
    (root / "_shared/protected.md").write_text("Protected", encoding="utf-8")
    run("complete", "--review", "_shared/protected.md", "--expected-sha", digest(root / "_shared/protected.md"),
        "--result", "MVP/development/verification/setup_codex_report.md", success=False)
    h = digest(root / "MVP/development/KING_WAS_ME_MVP.html")
    run("acquire", "--owner", "codex", "--token", "one", "--expected-html-sha", "stale", success=False)
    run("acquire", "--owner", "codex", "--token", "one", "--expected-html-sha", h)
    run("acquire", "--owner", "claude", "--token", "two", "--expected-html-sha", h, success=False)
    run("release", "--token", "two", success=False)
    assert json.loads(run("scan"))["activeWork"]["token"] == "one"
    run("release", "--token", "one")
    assert json.loads(run("scan"))["activeWork"] is None
print("PASS: read-only scan, review deduplication, changed-review retry, stale digest rejection, protected path rejection, stale HTML rejection, exclusive ownership, owner-only release")
