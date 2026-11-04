#!/usr/bin/env python3
"""
Live end-to-end test of COURSE PAYMENTS and COURSE UNLOCKING, over the same HTTP
API the student web, the Flutter app and the admin dashboard use.

Part A - payment (wallet dropdown -> transaction number + receipt -> admin
         approve/reject -> 30-day window -> expiry resets progress -> pay again)
Part B - unlocking (placement result = where you may start; start lower and
         everything after stays locked; finish a course to open the next one)

Everything is created with throwaway users (e2e-*@local.com) and one wallet
named "E2E TEST WALLET", and removed afterwards.

    python3 tests/e2e/payment_gating_live_e2e.py
    API_BASE=https://api.aim-learn.com KEEP=1 python3 ...   # KEEP=1: skip cleanup

Needs python3 (stdlib only) and docker access to the `supabase-db` container.
"""
import base64
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
KEEP = os.environ.get("KEEP") == "1"
PASSWORD = "E2e-Placement-123"
WALLET_NAME = "E2E TEST WALLET"
PNG = base64.b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
)

results = []


def check(name, ok, detail=""):
    results.append((name, bool(ok)))
    print(f"  [{'PASS' if ok else 'FAIL'}] {name}" + (f"  -> {str(detail)[:230]}" if detail and not ok else ""))
    return bool(ok)


# ---------------------------------------------------------------- http helpers
def _unwrap(b):
    if isinstance(b, dict) and "success" in b and "data" in b:
        return b["data"]
    return b


def call(method, path, body=None, token=None, raw=False, multipart=None):
    headers = {}
    data = None
    if token:
        headers["Authorization"] = f"Bearer {token}"
    if multipart:
        boundary = "----e2e" + uuid.uuid4().hex
        parts = []
        for k, v in multipart["fields"].items():
            parts.append(f'--{boundary}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'.encode())
        fn, ct, content = multipart["file"]["field"], multipart["file"]["type"], multipart["file"]["bytes"]
        parts.append(
            f'--{boundary}\r\nContent-Disposition: form-data; name="{fn}"; filename="receipt.png"\r\nContent-Type: {ct}\r\n\r\n'.encode()
            + content + b"\r\n"
        )
        parts.append(f"--{boundary}--\r\n".encode())
        data = b"".join(parts)
        headers["Content-Type"] = f"multipart/form-data; boundary={boundary}"
    elif body is not None:
        data = json.dumps(body).encode()
        headers["Content-Type"] = "application/json"
    req = urllib.request.Request(API + path, method=method, headers=headers, data=data)
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            payload = r.read()
            if raw:
                return r.status, payload, r.headers.get("Content-Type")
            return r.status, _unwrap(json.loads(payload)) if payload else None
    except urllib.error.HTTPError as e:
        payload = e.read()
        try:
            return e.code, json.loads(payload)
        except Exception:
            return e.code, payload.decode(errors="replace")


def err_code(body):
    if isinstance(body, dict):
        return (body.get("error") or {}).get("code") or body.get("code")
    return None


def sql(query):
    out = subprocess.run(["docker", "exec", DB, "psql", "-U", "postgres", "-At", "-F", "|", "-c", query],
                         capture_output=True, text=True)
    if out.returncode != 0:
        raise RuntimeError(out.stderr)
    return [line.split("|") for line in out.stdout.strip().splitlines() if line]


# ---------------------------------------------------------------- fixtures
def new_user(kind, admin=False):
    email = f"e2e-{kind}-{uuid.uuid4().hex[:8]}@local.com"
    s, b = call("POST", "/auth/register", {"email": email, "password": PASSWORD, "displayName": f"E2E {kind}"})
    assert s in (200, 201), f"register {s} {b}"
    sql(f"update auth.users set email_confirmed_at=now() where email='{email}' returning id")
    if admin:
        sql(f"insert into user_roles (user_id, role_id) select u.id, 'a1000000-0000-0000-0000-000000000003' "
            f"from users u where u.email='{email}' returning id")
    s, b = call("POST", "/auth/login", {"email": email, "password": PASSWORD})
    assert s in (200, 201) and b.get("accessToken"), f"login {s} {b}"
    uid = sql(f"select id from users where email='{email}'")[0][0]
    return {"email": email, "token": b["accessToken"], "id": uid}


def cleanup():
    print("\ncleanup ...")
    stmts = """
begin;
delete from placement_audit_log where placement_attempt_id in (select a.id from placement_attempts a join users u on u.id=a.student_id where u.email like 'e2e-%@local.com');
delete from learning_sessions where placement_result_id in (select r.id from placement_results r join placement_attempts a on a.id=r.placement_attempt_id join users u on u.id=a.student_id where u.email like 'e2e-%@local.com');
delete from lesson_progress where student_id in (select id from users where email like 'e2e-%@local.com');
delete from course_enrollments where student_id::text in (select id::text from users where email like 'e2e-%@local.com' union select supabase_auth_uid::text from users where email like 'e2e-%@local.com');
create temp table rimg as select receipt_image_id as id from course_payment_requests where student_id in (select id from users where email like 'e2e-%@local.com');
delete from course_access where student_id in (select id from users where email like 'e2e-%@local.com');
delete from course_payment_requests where student_id in (select id from users where email like 'e2e-%@local.com');
delete from payment_images where id in (select id from rimg);
delete from payment_wallets where name = 'E2E TEST WALLET';
delete from user_roles where user_id in (select id from users where email like 'e2e-%@local.com');
delete from users where email like 'e2e-%@local.com';
delete from auth.users where email like 'e2e-%@local.com';
commit;
select 'left: users=' || (select count(*) from users where email like 'e2e-%@local.com') || ' wallets=' || (select count(*) from payment_wallets where name='E2E TEST WALLET');
"""
    out = subprocess.run(["docker", "exec", "-i", DB, "psql", "-U", "postgres", "-At", "-v", "ON_ERROR_STOP=1"],
                         input=stmts, capture_output=True, text=True)
    print("  " + (out.stdout.strip().splitlines() or ["(no output)"])[-1] + (f"  ERR {out.stderr[:200]}" if out.returncode else ""))


def course_by_slug(slug):
    r = sql(f"select id, cefr_rank from courses where slug='{slug}'")
    return r[0][0], int(r[0][1])


def courses_view(token):
    s, b = call("GET", "/student/courses", token=token)
    assert s == 200, f"/student/courses {s} {b}"
    rows = b["courses"] if isinstance(b, dict) and "courses" in b else b
    return {c["courseId"]: c for c in rows}


def pay(token, course_id, wallet_id, txn):
    return call("POST", f"/student/courses/{course_id}/payment-requests", token=token,
                multipart={"fields": {"walletId": wallet_id, "transactionNumber": txn},
                           "file": {"field": "receipt", "type": "image/png", "bytes": PNG}})


def complete_course_lessons(user_id, course_id):
    sql(f"""insert into lesson_progress (student_id, lesson_id, percent, completed, completed_at)
            select '{user_id}', les.id, 100, true, now()
            from levels lv join chapters ch on ch.level_id=lv.id join lessons les on les.chapter_id=ch.id
            where lv.course_id='{course_id}'
            on conflict do nothing returning id""")


# ---------------------------------------------------------------- main
def main():
    print(f"API: {API}\n")
    starter, r_starter = course_by_slug("starter")
    a11, r_a11 = course_by_slug("a1-1-beginner-1")
    a12, r_a12 = course_by_slug("a1-2-beginner-2")
    c2, r_c2 = course_by_slug("c2-proficiency")
    print(f"ranks: starter={r_starter} a1.1={r_a11} a1.2={r_a12} c2={r_c2}")
    for c in (starter, a11):
        price = sql(f"select amount from course_prices where course_id='{c}'")
        assert price, "Starter and A1.1 must have a price for this test"

    admin = new_user("admin", admin=True)
    s = new_user("pay")  # student for Part A
    try:
        # ===================================================== Part A: payment
        print("\nA. Payment flow")
        s_w, wallet = call("POST", "/admin/course-billing/wallets", token=admin["token"],
                           body={"name": WALLET_NAME, "accountName": "E2E", "accountNumber": "000", "isActive": True})
        check("admin can add a wallet", s_w in (200, 201) and wallet.get("id"), f"{s_w} {wallet}")
        wid = wallet["id"]

        # a "start from scratch" student may start at the first course
        call("POST", "/placement/decision", {"decision": "start_from_scratch"}, token=s["token"])

        st, wl = call("GET", "/student/billing/wallets", token=s["token"])
        check("student sees the wallet in the dropdown list", st == 200 and any(w["id"] == wid for w in wl), f"{st} {wl}")

        st, bill = call("GET", f"/student/courses/{starter}/billing", token=s["token"])
        check("course shows a price and no access yet", st == 200 and not bill["price"]["isFree"] and bill["access"]["status"] == "none", f"{st} {bill}")

        st, b = call("POST", f"/student/courses/{starter}/payment-requests", token=s["token"],
                     multipart={"fields": {"walletId": wid, "transactionNumber": ""}, "file": {"field": "receipt", "type": "image/png", "bytes": PNG}})
        check("transaction number is required", st == 400, f"{st} {b}")
        st, b = call("POST", f"/student/courses/{starter}/payment-requests", token=s["token"],
                     multipart={"fields": {"walletId": wid, "transactionNumber": "TX-1"}, "file": {"field": "receipt", "type": "text/plain", "bytes": b"not an image"}})
        check("receipt must be an image", st in (400, 415, 422), f"{st} {b}")

        txn = "E2E-" + uuid.uuid4().hex[:8]
        st, req = pay(s["token"], starter, wid, txn)
        check("student submits wallet + transaction number + receipt", st == 201 and req["status"] == "pending", f"{st} {req}")
        rid = req.get("id")
        check("request records the chosen wallet and transaction", req.get("walletName") == WALLET_NAME and req.get("transactionNumber") == txn)
        st, dup = pay(s["token"], starter, wid, txn + "-b")
        check("a second payment while one is pending is refused", st == 409, f"{st} {dup}")

        st, pend = call("GET", "/admin/course-billing/payment-requests?status=pending", token=admin["token"])
        mine = [p for p in (pend or []) if p["id"] == rid]
        check("payment appears in the admin dashboard (pending)", st == 200 and len(mine) == 1, f"{st}")
        if mine:
            check("admin sees student, course, wallet, transaction, amount",
                  mine[0]["studentEmail"] == s["email"] and mine[0]["walletName"] == WALLET_NAME
                  and mine[0]["transactionNumber"] == txn and mine[0]["amount"] > 0, mine[0])
        st, img, ctype = call("GET", f"/admin/course-billing/payment-requests/{rid}/receipt", token=admin["token"], raw=True)
        check("admin can open the receipt image", st == 200 and img.startswith(b"\x89PNG"), f"{st} {ctype}")

        st, b = call("POST", f"/admin/course-billing/payment-requests/{rid}/reject", token=admin["token"], body={})
        check("rejecting requires a note", st == 400, f"{st} {b}")
        # reject first, student sees the reason and can pay again
        st, b = call("POST", f"/admin/course-billing/payment-requests/{rid}/reject", token=admin["token"], body={"note": "Amount does not match"})
        check("admin rejects with a note", st in (200, 201) and b["status"] == "rejected", f"{st} {b}")
        st, bill = call("GET", f"/student/courses/{starter}/billing", token=s["token"])
        check("student sees 'rejected' + the admin's reason", bill["access"]["status"] == "rejected" and "match" in (bill["access"].get("rejectionNote") or ""), bill["access"])
        st, req = pay(s["token"], starter, wid, txn + "-retry")
        check("student can submit again after a rejection", st == 201, f"{st} {req}")
        rid = req["id"]

        before = time.time()
        st, b = call("POST", f"/admin/course-billing/payment-requests/{rid}/approve", token=admin["token"], body={})
        check("admin approves", st in (200, 201) and b["status"] == "approved", f"{st} {b}")
        st, again = call("POST", f"/admin/course-billing/payment-requests/{rid}/approve", token=admin["token"], body={})
        check("approving twice is refused", st == 409, f"{st}")

        st, bill = call("GET", f"/student/courses/{starter}/billing", token=s["token"])
        acc = bill["access"]
        check("access is now active", acc["status"] == "active" and acc["hasAccess"], acc)
        days = acc.get("daysLeft")
        check("the 30-day timer started on approval (daysLeft = 30)", days == 30, acc)
        row = sql(f"select extract(epoch from (expires_at - starts_at))/86400 from course_access where payment_request_id='{rid}'")
        check("window is exactly 30 days long", row and abs(float(row[0][0]) - 30) < 0.01, row)

        st, en = call("POST", f"/courses/{starter}/enroll", token=s["token"])
        check("student can start the paid course after approval", st == 200, f"{st} {en}")

        # --- the student does not finish in time -> fail, progress wiped, pay again
        first_lesson = sql(f"select les.id from levels lv join chapters ch on ch.level_id=lv.id join lessons les on les.chapter_id=ch.id where lv.course_id='{starter}' limit 1")[0][0]
        sql(f"insert into lesson_progress (student_id, lesson_id, percent, completed, completed_at) values ('{s['id']}','{first_lesson}',100,true,now()) returning id")
        sql(f"update course_access set starts_at = now() - interval '31 days', expires_at = now() - interval '1 hour' where payment_request_id='{rid}' returning id")
        courses_view(s["token"])  # any read settles expired windows
        st, bill = call("GET", f"/student/courses/{starter}/billing", token=s["token"])
        check("after 30 days unfinished the course FAILS", bill["access"]["status"] == "failed" and not bill["access"]["hasAccess"], bill["access"])
        left = sql(f"select count(*) from lesson_progress where student_id='{s['id']}' and lesson_id='{first_lesson}'")[0][0]
        check("progress is reset: the student must start from the beginning", left == "0", left)
        st, b = call("POST", f"/lessons/{first_lesson}/progress", {"percent": 10}, token=s["token"])
        check("lessons are closed until they pay again (HTTP 402)", st == 402, f"{st} {b}")
        st, req2 = pay(s["token"], starter, wid, txn + "-repay")
        check("they can pay again", st == 201, f"{st} {req2}")
        call("POST", f"/admin/course-billing/payment-requests/{req2['id']}/approve", token=admin["token"], body={})
        st, bill = call("GET", f"/student/courses/{starter}/billing", token=s["token"])
        check("a fresh 30-day window starts after the second approval", bill["access"]["status"] == "active" and bill["access"]["daysLeft"] == 30, bill["access"])

        # --- finishing in time keeps the course
        s_done = new_user("done")
        call("POST", "/placement/decision", {"decision": "start_from_scratch"}, token=s_done["token"])
        st, rq = pay(s_done["token"], starter, wid, "E2E-" + uuid.uuid4().hex[:8])
        call("POST", f"/admin/course-billing/payment-requests/{rq['id']}/approve", token=admin["token"], body={})
        complete_course_lessons(s_done["id"], starter)
        courses_view(s_done["token"])
        st, a = call("GET", "/admin/course-billing/access", token=admin["token"])
        check("admin 'access' list shows the student's window", st == 200 and any(x["studentEmail"] == s_done["email"] for x in a), f"{st}")

        # ===================================================== Part B: unlocking
        print("\nB. Placement -> which courses are open")
        p = new_user("place")
        call("POST", "/placement/decision", {"decision": "take_placement"}, token=p["token"])
        st, test = call("GET", "/placement/active", token=p["token"])
        st, att = call("POST", "/placement/attempts", token=p["token"])
        aid = att["id"]
        secs = call("GET", "/placement/active/sections", token=p["token"])[1]
        types = {r[0]: (r[1], r[2]) for r in sql("select id, question_type, correct_answer from placement_questions")}
        for sec in secs:
            for q in call("GET", f"/placement/questions?sectionId={sec['id']}", token=p["token"])[1]:
                qt, ok = types[q["id"]]
                if qt in ("writing", "speaking"):
                    continue
                if qt == "fill_blank":
                    wrong = "zzz"
                elif qt == "true_false":
                    wrong = "false" if ok.lower() == "true" else "true"
                else:
                    wrong = "B" if ok.upper() == "A" else "A"
                call("POST", f"/placement/attempts/{aid}/answers", {"placement_question_id": q["id"], "answer_value": wrong}, token=p["token"])
        call("POST", f"/placement/attempts/{aid}/complete", token=p["token"])
        st, res = call("GET", f"/placement/attempts/{aid}/result", token=p["token"])
        level = res.get("estimated_level")
        ceiling = sql(f"select max_unlocked_cefr_rank from student_level_state sls join student_profiles sp on sp.id=sls.student_id where sp.user_id='{p['id']}'")
        ceiling = int(ceiling[0][0]) if ceiling else None
        print(f"     placement result: {level} -> may start up to rank {ceiling}")
        check("placement stored a starting rank", ceiling is not None, res)
        st, again = call("POST", "/placement/attempts", token=p["token"])
        check("retaking straight away is refused (cooldown)", st == 409 and err_code(again) == "PLACEMENT_RETAKE_NOT_ALLOWED", f"{st} {again}")

        view = courses_view(p["token"])
        ranks = {r[0]: int(r[1]) for r in sql("select id, cefr_rank from courses where status='published'")}
        wrong_state = [cid for cid, c in view.items() if (ranks[cid] > ceiling) != c["locked"]]
        check("course list: everything above the placed level is locked, the level and lower are open", not wrong_state,
              [(view[c]['title'], ranks[c], view[c]['locked']) for c in wrong_state][:5])

        # locked course: cannot pay, cannot enroll, cannot read lessons
        locked_id = next(cid for cid in view if ranks[cid] > ceiling)
        st, b = pay(p["token"], locked_id, wid, "E2E-" + uuid.uuid4().hex[:8])
        check("cannot pay for a locked course", st == 403 and err_code(b) == "COURSE_LOCKED", f"{st} {b}")
        st, b = call("POST", f"/courses/{locked_id}/enroll", token=p["token"])
        check("cannot start a locked course", st == 403 and err_code(b) == "COURSE_LOCKED", f"{st} {b}")

        # starting LOWER than the placed level keeps the rest locked
        if ceiling >= 2:
            print("\n   start lower than the placed level")
            st, rq = pay(p["token"], starter, wid, "E2E-" + uuid.uuid4().hex[:8])
            check("student starts at the lowest course (Starter)", st == 201, f"{st} {rq}")
            view = courses_view(p["token"])
            check("starting lower: A1.1 is now locked until Starter is finished", view[a11]["locked"] is True and view[starter]["locked"] is False,
                  {k: view[k]["locked"] for k in (starter, a11)})
            call("POST", f"/admin/course-billing/payment-requests/{rq['id']}/approve", token=admin["token"], body={})
            complete_course_lessons(p["id"], starter)
            view = courses_view(p["token"])
            check("finishing Starter opens exactly the next course (A1.1)", view[a11]["locked"] is False, view[a11]["locked"])
            check("…and the one after that is still locked", view[a12]["locked"] is True, view[a12]["locked"])
        else:
            print("     (placed at the first course; 'start lower' not applicable)")

        # starting AT the placed level: next stays locked until finished
        q = new_user("place2")
        sql(f"""insert into student_profiles (user_id) select '{q['id']}' on conflict do nothing returning id""")
        sql(f"""insert into student_level_state (student_id, track_slug, current_cefr_rank, max_unlocked_cefr_rank, source)
                select id, 'english', {r_a11}, {r_a11}, 'placement' from student_profiles where user_id='{q['id']}' returning id""")
        st, rq = pay(q["token"], a11, wid, "E2E-" + uuid.uuid4().hex[:8])
        check("placed at A1: student can start A1.1 (the placed course)", st == 201, f"{st} {rq}")
        view = courses_view(q["token"])
        check("…and A1.2 stays locked while A1.1 is unfinished", view[a12]["locked"] is True and view[starter]["locked"] is False,
              {k: view[k]["locked"] for k in (starter, a12)})
    finally:
        if KEEP:
            print("\nKEEP=1 -> left test data in place")
        else:
            cleanup()

    failed = [n for n, ok in results if not ok]
    print(f"\n{len(results) - len(failed)}/{len(results)} checks passed")
    if failed:
        print("FAILED:\n  - " + "\n  - ".join(failed))
        sys.exit(1)


if __name__ == "__main__":
    main()
