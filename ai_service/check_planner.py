import trip_planner as tp
df = tp.load_places("data/destination_AI.csv")

def check(plan, budget, interests, sel=None):
    errs = []; ids = []
    for d in plan["days"]:
        if d["stops"] and len(d["stops"]) != 3 and not plan["warnings"]:
            errs.append(f"ngày {d['day']} thiếu điểm mà không có cảnh báo")
        regs = set()
        for s in d["stops"]:
            ids.append(s["id"]); row = df[df.id == s["id"]].iloc[0]; regs.add(row.region)
            if interests and row.interest_group not in interests and s["id"] not in (sel or []): errs.append(f"{s['name']} sai nhóm")
            if s["start"] < tp.hm(row.open_time) or s["end"] > tp.hm(row.close_time): errs.append(f"{s['name']} ngoài giờ")
            if s["start"] > s["end"]: errs.append("giờ bắt đầu sau giờ kết thúc")
        if len(regs) > 1: errs.append(f"ngày {d['day']} trộn vùng")
    if len(ids) != len(set(ids)): errs.append("trùng địa điểm")
    if plan["total_cost_pp"] > budget: errs.append("vượt ngân sách")
    if sel:
        got = set(ids)
        for i in sel:
            if i not in got and not any(str(i) in w or "Không" in w for w in plan["warnings"]):
                errs.append(f"điểm đã chọn {i} biến mất không báo")
    return errs

scen = [
    dict(num_days=2, budget_pp=3_000_000, interests=["Biển & đảo", "Ẩm thực"]),
    dict(num_days=3, budget_pp=2_000_000, interests=["Văn hóa & lịch sử"]),
    dict(num_days=1, budget_pp=500_000, interests=["Ẩm thực"]),
    dict(num_days=3, budget_pp=5_000_000, interests=[]),
    dict(num_days=2, budget_pp=1_000_000, interests=["Thiên nhiên & khám phá", "Vui chơi & check-in"]),
    dict(num_days=2, budget_pp=1_000_000, interests=["Biển & đảo", "Ẩm thực"], selected_ids=[32, 24]),
    dict(num_days=3, budget_pp=2_000_000, interests=["Văn hóa & lịch sử"], selected_ids=[1, 2, 3]),
]
allok = True
for s in scen:
    p = tp.make_plan(df, **s)
    e = check(p, s["budget_pp"], s["interests"], s.get("selected_ids"))
    allok &= not e
    print(f"{s}\n  chi phí/người {p['total_cost_pp']:,} | cảnh báo: {p['warnings'] or 'không'}\n  KIỂM TRA: {'ĐẠT' if not e else e}\n")
print("TẤT CẢ ĐẠT" if allok else "CÓ LỖI")
