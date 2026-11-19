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
    "pay-sync-v1": {"payslips": [], "shifts": [{"date": k(-2), "start": "09:00", "end": "17:00", "store": "测试店", "cash": True}], "syncedAt": None},
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
            check("排班自动进日常计划", await pg.evaluate('window.__workOn("%s")' % k(-2)) == [{"start": "09:00", "end": "17:00"}])
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
            check("本周小结", "净省下" in await pg.inner_text("#td-week"))
            check("主线卡显示", "0 / 6 小时" in await pg.inner_text("#td-lines"))
            await pg.click("#tdLn-ln1-30"); await pg.wait_for_timeout(300)
            check("主线 +30 分", "0.5 / 6 小时" in await pg.inner_text("#td-lines"))
            await pg.click("#tdLnU-ln1"); await pg.wait_for_timeout(300)
            check("主线撤销", "0 / 6 小时" in await pg.inner_text("#td-lines"))
            check("成长卡显示", "Lv.1" in await pg.inner_text("#td-game"))
            x0 = await pg.evaluate("window.__game.calc().today.xp")
            for _ in range(4):
                await pg.click("#tdLn-ln1-60"); await pg.wait_for_timeout(250)
            check("主线用时加经验", await pg.evaluate("window.__game.calc().today.xp") == x0 + 240)
            a0 = await pg.evaluate("window.__game.calc().avail")
            await pg.click("#gmShop"); await pg.wait_for_timeout(250)
            await pg.click("#gmR-r3"); await pg.wait_for_timeout(250)
            check("超预算要再点一次", "确认兑换" in await pg.inner_text("#gmR-r3"))
            await pg.click("#gmR-r3"); await pg.wait_for_timeout(400)
            check("兑换扣经验", await pg.evaluate("window.__game.calc().avail") == a0 - 200)
            check("兑换自动记开支", "$26.50" in await pg.inner_text("#td-exp"))
            await pg.click("#gmRU"); await pg.wait_for_timeout(400)
            check("撤销兑换", await pg.evaluate("window.__game.calc().avail") == a0 and "$19.50" in await pg.inner_text("#td-exp"))
            for _ in range(4):
                await pg.click("#tdLnU-ln1"); await pg.wait_for_timeout(250)
            for t in ["tabLedger", "tabCut", "tabPlan", "tabCycle", "tabSet"]:
                await pg.click("#" + t); await pg.wait_for_timeout(400)
                if t == "tabLedger":
                    check("每周回顾有主线对比", "计划对比实际" in await pg.inner_text("#lineWeek"))
                if t == "tabPlan":
                    await pg.evaluate('(()=>{const s=document.getElementById("plln-p1");s.value="ln3";s.dispatchEvent(new Event("change"))})()'); await pg.wait_for_timeout(300)
                    check("计划归到主线并记用时", await pg.evaluate('document.getElementById("plmin-p1").value') == "30")
                if t == "tabSet":
                    await pg.fill("#lnH-ln1", "8"); await pg.press("#lnH-ln1", "Tab"); await pg.wait_for_timeout(300)
            await pg.click("#tabToday"); await pg.wait_for_timeout(400)
            tl = await pg.inner_text("#td-lines")
            check("设置改计划小时", "0 / 8 小时" in tl)
            check("计划的用时算进主线", "0.5 / 3" in tl)
            await pg.click("#tabSet"); await pg.wait_for_timeout(300)
            check("页面没有横向溢出", not await pg.evaluate("document.documentElement.scrollWidth>window.innerWidth+1"))
            check("整理习惯列表", "一次都没点过" in await pg.inner_text("#tidyBody"))
            await pg.click("#ordBtn"); await pg.wait_for_timeout(200)
            await pg.click("#ordU-secBackup"); await pg.wait_for_timeout(200)
            ids = await pg.evaluate('[...document.querySelectorAll("#setView>section")].map(e=>e.id)')
            check("设置页调整顺序", ids.index("secBackup") < ids.index("secTheme"))
            await pg.click("#ordReset"); await pg.wait_for_timeout(200)
            ids = await pg.evaluate('[...document.querySelectorAll("#setView>section")].map(e=>e.id)')
            check("恢复默认顺序", ids.index("secTheme") < ids.index("secBackup")); await pg.click("#ordDone")
            await pg.click("#tabCut"); await pg.wait_for_timeout(400)
            ids = await pg.evaluate('[...document.querySelectorAll("#cut>section,#cut>details")].map(e=>e.id)')
            check("运动页常用在前", ids.index("cutCardio") < ids.index("cutFood") and ids.index("planEditor") == ids.index("cutTrain") + 1)
            await pg.evaluate('document.getElementById("cutCardio").classList.remove("folded")')
            await pg.fill("#burnQ", "羽毛球"); await pg.wait_for_timeout(200)
            await pg.click("#burnRes .burn-item"); await pg.wait_for_timeout(500)
            check("运动消耗记录", "kcal" in await pg.inner_text("#burnList") and await pg.is_checked("#cardioDone"))
            await pg.click("#burnList .burn-x"); await pg.wait_for_timeout(400)
            check("删除运动消耗", (await pg.inner_text("#burnList")).strip() == "")
            await pg.click("#tabToday"); await pg.wait_for_timeout(400)
            await pg.click("#gmFold"); await pg.wait_for_timeout(250)
            check("成长卡收起", not await pg.is_visible("#gmShop") and "连击" in await pg.inner_text("#td-game"))
            await pg.click("#gmFold"); await pg.wait_for_timeout(250)
            check("成长卡展开", await pg.is_visible("#gmShop"))
            x1 = await pg.evaluate("window.__game.calc().today.xp")
            await pg.click("#mdF4"); await pg.wait_for_timeout(300)
            check("记心情", await pg.get_attribute("#mdF4", "aria-pressed") == "true" and "不错" in await pg.inner_text("#td-mood"))
            await pg.click("#mdT0"); await pg.wait_for_timeout(300)
            check("心情原因", await pg.evaluate("window.__mood.get().tags[0]") == "睡眠")
            check("心情加经验", await pg.evaluate("window.__game.calc().today.xp") == x1 + 5)
            await pg.click("#mdF2"); await pg.wait_for_timeout(300)
            check("换心情留下之前的记录", await pg.evaluate("window.__mood.get().log.length") == 2 and await pg.evaluate("window.__mood.get().tags[0]") == "睡眠")
            await pg.click("#mdF2"); await pg.wait_for_timeout(200)
            check("再点同一个不会删除", await pg.evaluate("window.__mood.get().v") == 2)
            await pg.click("#mdHist"); await pg.wait_for_timeout(300)
            check("心情历史日历", await pg.locator("#td-mood .md-cd").count() >= 28)
            await pg.locator("#td-mood .md-day").nth(5).click(); await pg.wait_for_timeout(300)
            await pg.click("#mdF5"); await pg.wait_for_timeout(300)
            yk = await pg.evaluate("(()=>{const d=new Date();d.setDate(d.getDate()-1);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')})()")
            check("补记昨天的心情", await pg.evaluate("window.__mood.get('%s').v" % yk) == 5)
            await pg.click("#mdToday"); await pg.wait_for_timeout(300)
            await pg.click("#mdMore"); await pg.wait_for_timeout(200)
            if not await pg.is_visible("#mdClear"): await pg.click("#mdMore"); await pg.wait_for_timeout(200)
            await pg.click("#mdClear"); await pg.wait_for_timeout(150); await pg.click("#mdClear"); await pg.wait_for_timeout(300)
            check("清除今天的心情", await pg.evaluate("window.__mood.get()") is None)
            await pg.click("#tdBlocks"); await pg.wait_for_timeout(400)
            await pg.click("#blk-td-mood"); await pg.click("#blk-tabCycle"); await pg.wait_for_timeout(300)
            await pg.click("#tabToday"); await pg.wait_for_timeout(400)
            check("隐藏板块和页面", not await pg.is_visible("#td-mood") and not await pg.is_visible("#tabCycle") and not await pg.is_visible("#td-cyc"))
            await pg.click("#tabSet"); await pg.wait_for_timeout(300); await pg.click("#blkAll"); await pg.wait_for_timeout(300)
            await pg.click("#tabToday"); await pg.wait_for_timeout(400)
            check("在设置里找回", await pg.is_visible("#td-mood") and await pg.is_visible("#tabCycle"))
            await pg.click("#tabLedger"); await pg.wait_for_timeout(300); await pg.click("#ordBtn"); await pg.wait_for_timeout(200)
            await pg.click("#ordH-secAes"); await pg.wait_for_timeout(200)
            check("账本页目录里隐藏板块", not await pg.is_visible("#secAes"))
            await pg.click("#ordH-secAes"); await pg.wait_for_timeout(200); await pg.click("#ordBtn")
            await pg.click("#tabToday"); await pg.wait_for_timeout(300)
            # 备份 -> 另一个空白浏览器导入
            txt = await pg.evaluate('(()=>{const B=window.__bk,o={app:"money-book",v:1,at:Date.now(),data:{}};for(const k in B)o.data[k]=B[k].dump();return JSON.stringify(o)})()')
            pg2 = await page(b, w, h, seed=False)
            await pg2.click("#tabSet"); await pg2.wait_for_timeout(300)
            check("设置板块默认收起", "folded" in (await pg2.get_attribute("#secBackup", "class")))
            await pg2.click("#secBackup > h2"); await pg2.wait_for_timeout(200)
            check("设置板块可展开", await pg2.is_visible("#bkPaste"))
            await pg2.click("#bkPaste"); await pg2.fill("#bkPasteTa", txt); await pg2.click("#bkRead"); await pg2.click("#bkDo"); await pg2.wait_for_timeout(1000)
            check("导入合并", "合并完成" in await pg2.inner_text("#toast"))
            await pg2.click("#bkPaste"); await pg2.fill("#bkPasteTa", txt); await pg2.click("#bkRead"); await pg2.click("#bkDo"); await pg2.wait_for_timeout(600)
            check("重复导入不重复记", "已经一致" in await pg2.inner_text("#toast"))
            check("没有脚本报错", not pg.errs and not pg2.errs)
            if pg.errs or pg2.errs: print(pg.errs, pg2.errs)
        await b.close()
    print("全部通过" if not fails else "有 %d 项没通过" % len(fails)); sys.exit(1 if fails else 0)
asyncio.run(main())
