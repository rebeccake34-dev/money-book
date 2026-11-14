#!/usr/bin/env python3
"""把 src/ 里的各部分按文件名顺序拼成 index.html（单文件，直接可发布）。
用法：python3 build.py          生成 index.html
      python3 build.py --check  只检查 index.html 是否和 src/ 一致
.css 会包进 <style>，.js 会包进 <script>，.html 原样写入。"""
import os, sys
here = os.path.dirname(os.path.abspath(__file__))
src = os.path.join(here, "src")
wrap = {"css": ("<style>", "</style>"), "js": ("<script>", "</script>"), "html": ("", "")}
out = []
for fn in sorted(os.listdir(src)):
    ext = fn.rsplit(".", 1)[-1]
    if ext not in wrap:
        continue
    with open(os.path.join(src, fn), encoding="utf8", newline="") as f:
        a, b = wrap[ext]
        out.append(a + f.read().strip("\n") + b)
html = "\n".join(out) + "\n"
target = os.path.join(here, "index.html")
if "--check" in sys.argv:
    with open(target, encoding="utf8", newline="") as f:
        same = f.read() == html
    print("index.html 和 src/ 一致" if same else "index.html 和 src/ 不一致，请运行 python3 build.py")
    sys.exit(0 if same else 1)
with open(target, "w", encoding="utf8", newline="") as f:
    f.write(html)
print("已生成 index.html（%d 字节）" % len(html.encode("utf8")))
