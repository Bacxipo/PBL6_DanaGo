"""check_planner.py - kiểm tra ràng buộc của lập lịch có nơi nghỉ và bữa ăn."""
import random
import trip_planner as tp

df = tp.load_places("data/destination_AI.csv")
lo = tp.load_lodging("data/lodging_AI.csv")
hmin = lambda s: int(s[:2]) * 60 + int(s[3:])


def check(plan, budget, num_days, nights_expected=True):
    errs = []
    atts_ids = []
    infeasible = any("không xếp được" in w for w in plan["warnings"])
    if not infeasible and sum(1 for d in plan["days"] if d["night"]) != (num_days - 1 if nights_expected else 0):
        errs.append("số đêm nghỉ không đúng")
    if plan["days"] and plan["days"][-1]["night"]:
        errs.append("ngày cuối không được có đêm nghỉ")
    for d in plan["days"]:
        if not d["items"]:
            continue  # ngày không xếp được đã có cảnh báo
        prev_end = 0
        for it in d["items"]:
            st, en = hmin(it["start"]), hmin(it["end"])
            if st < prev_end:
                errs.append(f"ngày {d['day']}: {it['label']} bắt đầu trước khi mục trước kết thúc")
            prev_end = en
            if it["type"] == "attraction":
                atts_ids.append(it["id"])
                row = df[df.id == it["id"]].iloc[0]
                if st < int(row.open_time) or en > int(row.close_time):
                    errs.append(f"{it['name']} ngoài giờ mở cửa")
            if it["type"] in ("breakfast", "lunch", "dinner") and "khách sạn" not in it["label"]:
                row = df[df.id == it["id"]].iloc[0]
                if st < int(row.open_time) or en > int(row.close_time):
                    errs.append(f"quán {it['name']} ngoài giờ mở cửa")
        if not any(i["type"] == "dinner" for i in d["items"]):
            errs.append(f"ngày {d['day']} thiếu bữa tối")
        if prev_end > tp.DAY_END:
            errs.append(f"ngày {d['day']} kết thúc sau 21:30")
    if len(atts_ids) != len(set(atts_ids)):
        errs.append("trùng điểm tham quan")
    if plan["total_cost_pp"] > budget:
        errs.append(f"vượt ngân sách {plan['total_cost_pp']} > {budget}")
    return errs


if __name__ == "__main__":
    scen = [(1, 1_000_000), (2, 2_000_000), (3, 3_000_000), (3, 5_000_000), (4, 6_000_000)]
    ok = True
    for nd, b in scen:
        p = tp.make_plan(df, nd, b, interests=["Biển & đảo", "Ẩm thực"], lodging_df=lo)
        e = check(p, b, nd)
        ok &= not e
        print(f"{nd} ngày {b:,}đ: {'ĐẠT' if not e else e} | cảnh báo: {p['warnings'] or 'không'}")

    # kiểm tra ngẫu nhiên
    rnd = random.Random(7)
    groups = tp.INTERESTS
    fails, total = 0, 0
    for _ in range(60):
        nd = rnd.choice([1, 2, 3, 4])
        b = rnd.choice([800_000, 1_500_000, 2_500_000, 4_000_000, 6_000_000])
        ints = rnd.sample(groups, rnd.choice([0, 1, 2]))
        region = rnd.choice([None, "Đà Nẵng nội thành", "Hội An - Điện Bàn"])
        sel = rnd.sample(list(df[~df.is_food].id), rnd.choice([0, 0, 2]))
        lods = rnd.sample(list(lo.id), 1) if rnd.random() < 0.3 else []
        p = tp.make_plan(df, nd, b, interests=ints, region=region, selected_ids=sel,
                         lodging_df=lo, lodging_ids=lods)
        e = check(p, b, nd)
        total += 1
        if e:
            fails += 1
            if fails <= 5:
                print("LỖI:", nd, b, ints, region, e[:2])
    print(f"\nNgẫu nhiên: {total - fails}/{total} đạt")
    print("KẾT QUẢ CHÍNH:", "ĐẠT" if ok else "CÓ LỖI")