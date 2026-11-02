import sys, json
import os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import payment_gating_live_e2e as h
call, sql, check = h.call, h.sql, h.check
try:
    st = h.new_user("practice"); ad = h.new_user("padmin", admin=True)
    s, b = call("GET", "/student/practice/topics?kind=speaking", token=st["token"])
    check("no course -> 402 payment/course required", s == 402, f"{s} {b}")
    cid, _ = h.course_by_slug("a2-1-elementary-1")  # free course
    sql(f"insert into course_enrollments (student_id, course_id) values ('{st['id']}','{cid}') returning id")
    for kind in ("speaking", "writing"):
        s, b = call("GET", f"/student/practice/topics?kind={kind}", token=st["token"])
        check(f"{kind} topics list (6)", s == 200 and len(b) == 6, f"{s} {str(b)[:200]}")
        leak = [t for t in (b if isinstance(b, list) else []) if "ai_prompt" in t or "aiPrompt" in t]
        check(f"{kind}: ai_prompt not leaked", not leak)
    s, ar = call("GET", "/student/practice/topics?kind=writing", token=st["token"], ) 
    s2, b2 = call("GET", "/student/practice/topics?kind=writing", token=st["token"])
    s3, bar = call("GET", "/student/practice/topics?kind=writing", token=st["token"])
    s, spk = call("GET", "/student/practice/topics?kind=speaking", token=st["token"])
    s, a = call("POST", "/student/practice/speaking/start", {"topicId": spk[0]["id"]}, token=st["token"])
    check("speaking start", s == 201, f"{s} {str(a)[:300]}")
    if s == 201:
        aid = a.get("attemptId") or a.get("id")
        s, c = call("POST", f"/student/practice/speaking/{aid}/complete", token=st["token"])
        check("speaking complete too early is refused politely (400, no XP)", s == 400, f"{s} {str(c)[:300]}")
    s, w = call("POST", "/student/practice/writing/submit", {"topicId": b2[0]["id"], "text": " ".join(["I like to read books in the evening because it helps me relax after a long day at work and I learn new words."]*3)}, token=st["token"])
    check("writing submit marked by AI", s == 200, f"{s} {str(w)[:300]}")
    print("   writing result:", str(w)[:300])
    s, l = call("GET", "/admin/practice/topics", token=ad["token"])
    check("admin lists topics", s == 200 and len(l) >= 12, f"{s} {str(l)[:200]}")
    s, l2 = call("GET", "/admin/practice/topics", token=st["token"])
    check("student blocked from admin topics", s in (401, 403), s)
finally:
    sql(f"delete from practice_attempts where student_id in (select id from users where email like 'e2e-%@local.com') returning id")
    h.cleanup()
    p = len(h.results); f = [n for n, ok in h.results if not ok]
    print(f"{p-len(f)}/{p} passed", f)
