#!/usr/bin/env python3
"""
Live end-to-end test of the placement test, over the SAME HTTP API that both
the Flutter mobile app and the student web app use.

Flow: register throwaway student -> login -> gate decision -> active test ->
sections -> questions (no answer leak) -> start attempt -> answer every
objective question -> complete -> result -> retake policy -> cleanup.

Usage (on the server):
    python3 tests/e2e/placement_live_e2e.py
    API_BASE=https://api.aim-learn.com python3 tests/e2e/placement_live_e2e.py
    KEEP_USER=1 ...   # do not delete the throwaway student afterwards

Needs: python3 (stdlib only), docker access to the `supabase-db` container
(used to read correct answers for the "strong student" check and for cleanup).
"""
import json
import os
import subprocess
import sys
import time
import urllib.error
import urllib.request
import uuid

API = os.environ.get("API_BASE", "https://api.aim-learn.com").rstrip("/")
DB = os.environ.get("DB_CONTAINER", "supabase-db")
KEEP = os.environ.get("KEEP_USER") == "1"

results = []


def check(name, ok, detail=""):
    results.append((name, ok))
    print(f"  [{'PASS' if ok else 'FAIL'}] {name}" + (f"  -> {detail}" if detail and not ok else ""))
    return ok


def call(method, path, body=None, token=None, raw=False):
    req = urllib.request.Request(API + path, method=method)
    req.add_header("Content-Type", "application/json")
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    data = json.dumps(body).encode() if body is not None else None
    try:
        with urllib.request.urlopen(req, data=data, timeout=60) as r:
            payload = r.read()
            return r.status, (payload if raw else unwrap(json.loads(payload)) if payload else None)
    except urllib.error.HTTPError as e:
        payload = e.read()
        try:
            return e.code, json.loads(payload)  # errors keep their envelope
        except Exception:
            return e.code, payload.decode(errors="replace")


def unwrap(body):
    """Backend wraps some responses as {success, data}; placement ones are raw."""
    if isinstance(body, dict) and "data" in body and "success" in body:
        return body["data"]
    return body


def sql(query):
    out = subprocess.run(
        ["docker", "exec", DB, "psql", "-U", "postgres", "-At", "-F", "|", "-c", query],
        capture_output=True, text=True,
    )
    if out.returncode != 0:
        raise RuntimeError(out.stderr)
    return [line.split("|") for line in out.stdout.strip().splitlines() if line]


def cleanup(email):
    """Remove the throwaway student and everything hanging off it."""
    try:
        uid = sql(f"select id from users where email='{email}'")
        auid = sql(f"select id from auth.users where email='{email}'")
        if uid:
            u = uid[0][0]
            sql_exec = (
                "begin;"
                f"delete from placement_audit_log where placement_attempt_id in (select id from placement_attempts where student_id='{u}');"
                f"delete from learning_sessions where placement_result_id in (select r.id from placement_results r join placement_attempts a on a.id=r.placement_attempt_id where a.student_id='{u}');"
                f"delete from placement_attempts where student_id='{u}';"
                f"delete from student_level_state where student_id in (select id from student_profiles where user_id='{u}');"
                f"delete from users where id='{u}';"
                "commit;"
            )
            subprocess.run(["docker", "exec", DB, "psql", "-U", "postgres", "-v", "ON_ERROR_STOP=1", "-c", sql_exec],
                           capture_output=True, text=True)
        if auid:
            subprocess.run(["docker", "exec", DB, "psql", "-U", "postgres", "-c",
                            f"delete from auth.users where id='{auid[0][0]}';"], capture_output=True, text=True)
        left = sql(f"select count(*) from users where email='{email}'")[0][0]
        print(f"\ncleanup: throwaway student removed (app rows left: {left})")
    except Exception as e:  # cleanup must never mask test results
        print(f"\ncleanup WARNING: could not fully remove {email}: {e}")


def main():
    email = f"e2e-placement-{uuid.uuid4().hex[:10]}@local.com"
    password = "E2e-Placement-123"
    print(f"API: {API}\nthrowaway student: {email}\n")

    try:
        print("1. Auth")
        s, b = call("POST", "/auth/register", {"email": email, "password": password, "displayName": "E2E Placement"})
        check("register new student", s in (200, 201), f"{s} {b}")
        s, b = call("POST", "/auth/login", {"email": email, "password": password})
        check("login blocked until email is confirmed", s == 403, f"{s}")
        # simulate the student clicking the confirmation link
        sql(f"update auth.users set email_confirmed_at=now() where email='{email}' returning id")
        s, b = call("POST", "/auth/login", {"email": email, "password": password})
        d = unwrap(b) or {}
        token = d.get("accessToken") if isinstance(d, dict) else None
        check("login returns access token", s in (200, 201) and bool(token), f"{s} {b}")
        if not token:
            return

        print("2. First-login gate")
        s, b = call("GET", "/placement/decision", token=token)
        check("new student sees the placement gate", s == 200 and b.get("should_show_gate") is True, f"{s} {b}")
        s, b = call("POST", "/placement/decision", {"decision": "take_placement"}, token=token)
        check("choose 'take placement' -> gate no longer shown", s == 200 and b.get("should_show_gate") is False, f"{s} {b}")

        print("3. Test content")
        s, test = call("GET", "/placement/active", token=token)
        check("active placement test exists", s == 200 and bool(test), f"{s} {test}")
        s, sections = call("GET", "/placement/active/sections", token=token)
        check("sections returned", s == 200 and len(sections) > 0, f"{s} {sections}")
        s2, sections2 = call("GET", "/placement/sections", token=token)
        check("web alias /placement/sections matches mobile /active/sections", s2 == 200 and sections2 == sections)

        questions = []
        for sec in sections:
            s, qs = call("GET", f"/placement/questions?sectionId={sec['id']}", token=token)
            check(f"questions for section '{sec.get('title', sec['id'])[:30]}'", s == 200 and isinstance(qs, list), f"{s} {qs}")
            questions += qs if isinstance(qs, list) else []
        check("has questions", len(questions) > 0)
        leaked = [q for q in questions if "correct_answer" in q or "skill_code" in q]
        check("no correct_answer / skill_code leaked to students", not leaked)

        print("4. Take the test")
        s, att = call("POST", "/placement/attempts", token=token)
        check("start attempt", s == 201 and att.get("status") == "active", f"{s} {att}")
        aid = att.get("id")
        check("server timer present (expires_at, duration_seconds)", bool(att.get("expires_at")) and att.get("duration_seconds", 0) > 0)
        # Starting again while one is active restarts: old attempt -> abandoned.
        s, att2 = call("POST", "/placement/attempts", token=token)
        check("restart creates a fresh active attempt", s == 201 and att2.get("status") == "active" and att2.get("id") != aid, f"{s}")
        old_status = sql(f"select status from placement_attempts where id='{aid}'")[0][0]
        check("previous attempt is marked abandoned", old_status == "abandoned", old_status)
        aid = att2["id"]

        correct = {r[0]: r[1] for r in sql("select id, correct_answer from placement_questions")}
        types = {r[0]: r[1] for r in sql("select id, question_type from placement_questions")}
        answered = skipped = 0
        all_ok = True
        for q in questions:
            qt = types.get(q["id"])
            if qt in ("writing", "speaking"):   # AI-graded / needs audio: skip, costs money
                skipped += 1
                continue
            s, a = call("POST", f"/placement/attempts/{aid}/answers",
                        {"placement_question_id": q["id"], "answer_value": correct[q["id"]]}, token=token)
            if s != 201:
                if all_ok:
                    print(f"     first answer failure {q['id']} {s} {str(a)[:160]}")
                all_ok = False
            elif "is_correct" in a:
                all_ok = False
                print("     is_correct leaked in answer response")
            answered += 1
        check(f"submitted {answered} answers (skipped {skipped} AI-graded), none leaked is_correct", all_ok and answered > 0)

        print("5. Finish + result")
        s, c = call("POST", f"/placement/attempts/{aid}/complete", token=token)
        check("complete attempt", s == 200, f"{s} {c}")
        s, again = call("POST", f"/placement/attempts/{aid}/complete", token=token)
        n_res = sql(f"select count(*) from placement_results where placement_attempt_id='{aid}'")[0][0]
        check("completing twice is harmless (no duplicate result rows)", s < 500 and n_res == "1", f"HTTP {s}, result rows={n_res}")

        res = None
        for _ in range(10):  # scoring may be async
            s, res = call("GET", f"/placement/attempts/{aid}/result", token=token)
            if s == 200:
                break
            time.sleep(1)
        check("result available", s == 200, f"{s} {res}")
        if s == 200:
            check("result has estimated_level", bool(res.get("estimated_level")), res)
            check("result has skill_mastery_map", bool(res.get("skill_mastery_map")))
            check("result has initial_path_id", bool(res.get("initial_path_id")))
            print(f"     estimated_level = {res.get('estimated_level')}")
        s, latest = call("GET", "/placement/attempts/latest", token=token)
        check("latest attempt is the completed one", s == 200 and latest and latest.get("attemptId") == aid and latest.get("status") == "completed", f"{s} {latest}")

        s, nxt = call("POST", "/placement/attempts", token=token)
        check("retake right after finishing is refused (cooldown)", s == 409 and "PLACEMENT_RETAKE_NOT_ALLOWED" in json.dumps(nxt), f"{s} {nxt}")

        print("6. Security")
        s, _ = call("GET", "/placement/active")
        check("unauthenticated request rejected", s in (401, 403))
        other_email = f"e2e-other-{uuid.uuid4().hex[:8]}@local.com"
        call("POST", "/auth/register", {"email": other_email, "password": password, "displayName": "Other"})
        sql(f"update auth.users set email_confirmed_at=now() where email='{other_email}' returning id")
        s, ob = call("POST", "/auth/login", {"email": other_email, "password": password})
        otoken = (unwrap(ob) or {}).get("accessToken") if s in (200, 201) else None
        if otoken:
            s, _ = call("GET", f"/placement/attempts/{aid}/result", token=otoken)
            check("another student cannot read this result", s in (403, 404), s)
        cleanup(other_email)
    finally:
        if KEEP:
            print(f"\nKEEP_USER=1 -> left {email} in place")
        else:
            cleanup(email)

    failed = [n for n, ok in results if not ok]
    print(f"\n{len(results) - len(failed)}/{len(results)} checks passed")
    if failed:
        print("FAILED:\n  - " + "\n  - ".join(failed))
        sys.exit(1)


if __name__ == "__main__":
    main()
