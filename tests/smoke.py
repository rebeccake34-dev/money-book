#!/usr/bin/env python3
"""冒烟测试：用假数据在手机(400px)和电脑(1300px)尺寸打开 index.html，点一遍主要功能，检查有没有报错。
用法：python3 build.py && python3 tests/smoke.py   （需要 pip install playwright && playwright install chromium）
所有数据都是编的，不要把真实记录写进这个文件。"""
import asyncio, datetime, json, os, sys
from playwright.async_api import async_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
URL = "file://" + os.path.join(ROOT, "index.html")
today = datetime.date.today()
def k(n): return (today - datetime.timedelta(days=n)).isoformat()

days = {k(i): {"meal": 1} for i in range(0, 30)}
days[k(1)].update({"coffee": 2, "b-sugar": 1}); days[k(8)].update({"b-meal": 2})
SEED = {
    "habit-ledger": {"days": days, "amts": {}, "notes": [{"id": "n1", "text": "测试便签", "at": 1}],
                     "settings": {"vals": {}, "custom": [], "transfers": {}, "hidden": [], "groups": [], "hiddenGroups": [], "cur": "AUD", "rate": 4.68}},
    "expenses-v1": {"months": {today.isoformat()[:7]: [{"id": "e1", "date": k(0), "amt": 12.5, "cat": "餐饮", "note": "午饭", "src": ""}]}, "budget": 600, "wk": {"餐饮": 10}},
    "savings-v1": {"goal": 10000, "goalNote": "", "start": 2000, "startDate": k(30), "entries": [{"id": "s1", "date": k(20), "amt": 300, "note": ""}], "pct": 10, "costs": []},
    "year-end-planner-v1": {"shortcuts": None, "days": {k(0): [{"id": "p1", "cat": "other", "sub": "", "name": "买牛奶", "note": "", "done": False, "start": "09:00", "end": "09:30"}]}, "memos": []},
    "cycle-v1": {"periods": [{"s": k(40), "e": k(36)}, {"s": k(12), "e": k(8)}], "logs": {}, "set": {}, "at": 5},
    "cut-day-" + k(1): {"food": [{"name": "虾 去壳 熟100g", "kcal": 100, "pro": 24, "t": 1}], "water": [], "ex": {}},
    "cut-day-" + k(2): {"food": [{"name": "虾 去壳 熟100g", "kcal": 100, "pro": 24, "t": 1}], "water": [], "ex": {}},
}
fails = []
def check(name, ok):
    print(("  ok   " if ok else "  FAIL ") + name)
    if not ok: fails.append(name)

async def page(b, w, h, seed=True):
    ctx = await b.new_context(viewport={"width": w, "height": h})
    await ctx.route("**/*", lambda r: r.continue_() if r.request.url.startswith("file:") else r.abort())
    pg = await ctx.new_page(); pg.errs = []
    pg.on("pageerror", lambda e: pg.errs.append(str(e)))
    if seed:
        await pg.add_init_script('const S=%s;if(!localStorage.getItem("seeded")){for(const k in S)localStorage.setItem(k,JSON.stringify(S[k]));localStorage.setItem("seeded","1")}' % json.dumps(SEED))
    await pg.goto(URL); await pg.wait_for_timeout(1800)
    return pg

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for w, h in [(400, 800), (1300, 900)]:
            print("宽度 %d" % w)
            pg = await page(b, w, h)
            check("默认打开「今天」", await pg.get_attribute("#tabToday", "aria-selected") == "true")
            await pg.click("#tdH-meal"); await pg.wait_for_timeout(300)
            check("习惯点一下 +1", "×2" in await pg.inner_text("#tdH-meal"))
            await pg.click("#tdU-meal"); await pg.wait_for_timeout(300)
            check("习惯撤销", "×1" in await pg.inner_text("#tdH-meal"))
            await pg.click("#tdW0"); await pg.wait_for_timeout(300)
            check("喝水", "250 /" in await pg.inner_text("#td-fit"))
            await pg.fill("#tdFoodQ", "蓝莓"); await pg.wait_for_timeout(200); await pg.click(".td-fitem"); await pg.wait_for_timeout(300)
            check("搜索食物并记录", "热量 70/" in await pg.inner_text("#td-food"))
            await pg.fill("#tdExpAmt", "7"); await pg.click("#td-exp button[type=submit]"); await pg.wait_for_timeout(300)
            check("记一笔开支", "$19.50" in await pg.inner_text("#td-exp"))
            await pg.click("#tdP-p1"); await pg.wait_for_timeout(400)
            check("计划打勾", "1/1" in await pg.inner_text("#td-plan"))
            check("本周和本月小结", "净省下" in await pg.inner_text("#td-week") and "净省下" in await pg.inner_text("#td-month"))
            for t in ["tabLedger", "tabCut", "tabPlan", "tabCycle", "tabSet"]:
                await pg.click("#" + t); await pg.wait_for_timeout(400)
            check("页面没有横向溢出", not await pg.evaluate("document.documentElement.scrollWidth>window.innerWidth+1"))
            check("整理习惯列表", "一次都没点过" in await pg.inner_text("#tidyBody"))
            # 备份 -> 另一个空白浏览器导入
            txt = await pg.evaluate('(()=>{const B=window.__bk,o={app:"money-book",v:1,at:Date.now(),data:{}};for(const k in B)o.data[k]=B[k].dump();return JSON.stringify(o)})()')
            pg2 = await page(b, w, h, seed=False)
            await pg2.click("#tabSet"); await pg2.click("#bkPaste"); await pg2.fill("#bkPasteTa", txt); await pg2.click("#bkRead"); await pg2.click("#bkDo"); await pg2.wait_for_timeout(1000)
            check("导入合并", "合并完成" in await pg2.inner_text("#toast"))
            await pg2.click("#bkPaste"); await pg2.fill("#bkPasteTa", txt); await pg2.click("#bkRead"); await pg2.click("#bkDo"); await pg2.wait_for_timeout(600)
            check("重复导入不重复记", "已经一致" in await pg2.inner_text("#toast"))
            check("没有脚本报错", not pg.errs and not pg2.errs)
            if pg.errs or pg2.errs: print(pg.errs, pg2.errs)
        await b.close()
    print("全部通过" if not fails else "有 %d 项没通过" % len(fails)); sys.exit(1 if fails else 0)
asyncio.run(main())
