/* Interactive demos + UI mocks for teaching pages */
window.LESSON_DEMOS = {
  1: {
    title: "界面示意：Jupyter 读表四件套",
    mount(root) {
      root.innerHTML = `
        <div class="ui-mock">
          <div class="ui-mock-bar"><span class="dot r"></span><span class="dot y"></span><span class="dot g"></span>
            <em>lesson01.ipynb</em></div>
          <div class="ui-mock-body">
            <div class="ui-cell">
              <div class="ui-prompt">In [1]:</div>
              <pre>df = pd.read_csv("data.csv")
print(df.shape)
print(df.head())</pre>
            </div>
            <div class="ui-out" id="demo1-out">点击下方按钮，模拟输出</div>
          </div>
        </div>
        <div class="demo-actions">
          <button type="button" class="demo-run" data-act="run1">▶ 运行读表</button>
        </div>`;
      root.querySelector("[data-act=run1]").onclick = () => {
        root.querySelector("#demo1-out").textContent =
          "Out[1]:\n(150, 5)\n   sepal_l  sepal_w  petal_l  petal_w  species\n0      5.1      3.5      1.4      0.2   setosa\n1      4.9      3.0      1.4      0.2   setosa\n2      4.7      3.2      1.3      0.2   setosa";
      };
    },
  },

  2: {
    title: "界面示意：环境自检",
    mount(root) {
      root.innerHTML = `
        <div class="ui-mock dark">
          <div class="ui-mock-bar"><em>Terminal</em></div>
          <pre class="term" id="demo2-out">$ python -c "import sklearn; print(sklearn.__version__)"
(等待运行…)</pre>
        </div>
        <div class="demo-actions">
          <button type="button" class="demo-run" data-act="run2">▶ 执行环境检查</button>
        </div>`;
      root.querySelector("[data-act=run2]").onclick = () => {
        root.querySelector("#demo2-out").textContent =
          `$ python -c "import sklearn; print(sklearn.__version__)"
1.5.2
$ python -c "import sys; print(sys.executable)"
C:\\Users\\you\\miniconda3\\python.exe
✓ 库可用，解释器路径已确认`;
      };
    },
  },

  3: {
    title: "互动：选图看数据形态",
    mount(root) {
      root.innerHTML = `
        <div class="demo-row">
          <label>图表类型
            <select id="demo3-type">
              <option value="hist">直方图（看分布）</option>
              <option value="box">箱线图（看异常）</option>
              <option value="scatter">散点图（看关系）</option>
            </select>
          </label>
          <button type="button" class="demo-run" id="demo3-run">▶ 绘制</button>
        </div>
        <canvas id="demo3-canvas" width="640" height="280"></canvas>
        <p class="demo-caption" id="demo3-cap"></p>`;
      const canvas = root.querySelector("#demo3-canvas");
      const ctx = canvas.getContext("2d");
      const data = Array.from({ length: 80 }, () => 20 + Math.random() * 40 + (Math.random() < 0.08 ? 50 : 0));
      const ys = data.map((x) => 0.8 * x + 10 + (Math.random() - 0.5) * 18);

      function draw() {
        const type = root.querySelector("#demo3-type").value;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#f7faf8";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = "#c5d4ce";
        ctx.strokeRect(40, 20, 560, 230);
        if (type === "hist") {
          const bins = new Array(10).fill(0);
          data.forEach((v) => bins[Math.min(9, Math.floor((v - 20) / 8))]++);
          const max = Math.max(...bins);
          bins.forEach((c, i) => {
            const h = (c / max) * 180;
            ctx.fillStyle = "#1a4540";
            ctx.fillRect(60 + i * 52, 240 - h, 40, h);
          });
          root.querySelector("#demo3-cap").textContent = "直方图：可见右偏/极端高值。建模前先看分布。";
        } else if (type === "box") {
          const sorted = [...data].sort((a, b) => a - b);
          const q = (p) => sorted[Math.floor((sorted.length - 1) * p)];
          const q1 = q(0.25), med = q(0.5), q3 = q(0.75);
          const scale = (v) => 60 + ((v - 15) / 90) * 500;
          ctx.strokeStyle = "#0e2f2c";
          ctx.lineWidth = 2;
          ctx.strokeRect(scale(q1), 110, scale(q3) - scale(q1), 60);
          ctx.beginPath();
          ctx.moveTo(scale(med), 110);
          ctx.lineTo(scale(med), 170);
          ctx.stroke();
          ctx.fillStyle = "#d97706";
          data.filter((v) => v > q3 + 1.5 * (q3 - q1)).forEach((v) => {
            ctx.beginPath();
            ctx.arc(scale(v), 140, 4, 0, Math.PI * 2);
            ctx.fill();
          });
          root.querySelector("#demo3-cap").textContent = "箱线图：橙色点是候选异常，先问业务再决定删不删。";
        } else {
          ctx.fillStyle = "#1a4540";
          data.forEach((x, i) => {
            ctx.beginPath();
            ctx.arc(60 + x * 5.5, 240 - ys[i] * 2.2, 3.5, 0, Math.PI * 2);
            ctx.fill();
          });
          root.querySelector("#demo3-cap").textContent = "散点图：整体有上升趋势，提示可用回归建模。";
        }
      }
      root.querySelector("#demo3-run").onclick = draw;
      draw();
    },
  },

  4: {
    title: "界面示意：预处理流水线",
    mount(root) {
      root.innerHTML = `
        <div class="pipeline">
          <div class="pipe-step">读入</div><span>→</span>
          <div class="pipe-step">清洗</div><span>→</span>
          <div class="pipe-step">编码</div><span>→</span>
          <div class="pipe-step on">划分</div><span>→</span>
          <div class="pipe-step warn">仅训练集 fit 缩放</div><span>→</span>
          <div class="pipe-step">transform 测试集</div>
        </div>
        <div class="demo-actions">
          <button type="button" class="demo-run" id="demo4-run">▶ 演示一次错误 vs 正确</button>
        </div>
        <pre class="demo-out" id="demo4-out">点击按钮查看对比输出</pre>`;
      root.querySelector("#demo4-run").onclick = () => {
        root.querySelector("#demo4-out").textContent =
`✗ 错误做法：先对全数据 StandardScaler.fit，再 train_test_split
  → 测试集均值/方差已泄漏进训练，分数虚高

✓ 正确做法：
  X_train, X_test = split(...)
  scaler.fit(X_train)          # 只看训练集
  X_train_s = scaler.transform(X_train)
  X_test_s  = scaler.transform(X_test)`;
      };
    },
  },

  5: {
    title: "互动实验：点击训练线性回归（最小二乘）",
    mount(root) {
      root.innerHTML = `
        <p class="demo-lead">画布中是带噪声的样本点。点击「训练模型」，用最小二乘拟合直线，并输出系数与误差。</p>
        <canvas id="demo5-canvas" width="640" height="320"></canvas>
        <div class="demo-actions">
          <button type="button" class="demo-run" id="demo5-fit">▶ 训练模型 fit()</button>
          <button type="button" class="demo-ghost" id="demo5-noise">打乱噪声重采样</button>
        </div>
        <pre class="demo-out" id="demo5-out">等待训练…</pre>`;

      const canvas = root.querySelector("#demo5-canvas");
      const ctx = canvas.getContext("2d");
      let pts = [];
      let model = null;

      function sample() {
        pts = [];
        for (let i = 0; i < 40; i++) {
          const x = Math.random() * 10;
          const y = 1.6 * x + 2.5 + (Math.random() - 0.5) * 3.5;
          pts.push({ x, y });
        }
        model = null;
        draw();
        root.querySelector("#demo5-out").textContent = "数据已就绪。真实近似关系：y ≈ 1.6x + 2.5（含噪声）";
      }

      function fitOLS() {
        const n = pts.length;
        const mx = pts.reduce((s, p) => s + p.x, 0) / n;
        const my = pts.reduce((s, p) => s + p.y, 0) / n;
        let num = 0, den = 0;
        pts.forEach((p) => {
          num += (p.x - mx) * (p.y - my);
          den += (p.x - mx) ** 2;
        });
        const w = num / den;
        const b = my - w * mx;
        let sse = 0, sst = 0;
        pts.forEach((p) => {
          const pred = w * p.x + b;
          sse += (p.y - pred) ** 2;
          sst += (p.y - my) ** 2;
        });
        const r2 = 1 - sse / sst;
        const mae = pts.reduce((s, p) => s + Math.abs(p.y - (w * p.x + b)), 0) / n;
        model = { w, b, sse, r2, mae };
        draw();
        root.querySelector("#demo5-out").textContent =
`model.fit(X, y) 完成（普通最小二乘）
系数 w = ${w.toFixed(4)}
截距 b = ${b.toFixed(4)}
SSE  = ${sse.toFixed(3)}
MAE  = ${mae.toFixed(3)}
R²   = ${r2.toFixed(4)}

解读：找到使 Σ(y - ŷ)² 最小的直线。`;
      }

      function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#f7faf8";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const x0 = 50, y0 = 280, sx = 52, sy = 12;
        ctx.strokeStyle = "#c5d4ce";
        ctx.beginPath();
        ctx.moveTo(x0, 20);
        ctx.lineTo(x0, y0);
        ctx.lineTo(600, y0);
        ctx.stroke();
        ctx.fillStyle = "#1a4540";
        pts.forEach((p) => {
          ctx.beginPath();
          ctx.arc(x0 + p.x * sx, y0 - p.y * sy, 4, 0, Math.PI * 2);
          ctx.fill();
        });
        if (model) {
          ctx.strokeStyle = "#c6e26e";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(x0, y0 - (model.b) * sy);
          ctx.lineTo(x0 + 10 * sx, y0 - (model.w * 10 + model.b) * sy);
          ctx.stroke();
          ctx.lineWidth = 1;
        }
      }

      root.querySelector("#demo5-fit").onclick = fitOLS;
      root.querySelector("#demo5-noise").onclick = sample;
      sample();
    },
  },

  6: {
    title: "互动：用同一组数字算清 Support / Confidence / Lift",
    mount(root) {
      root.innerHTML = `
        <p class="demo-lead">默认就是讲义例子：100 笔订单，尿布∪啤酒=3，尿布=10，啤酒=20。改数字后点计算，看三个指标怎么变。</p>
        <div class="demo-grid3">
          <label>总订单数 N <input id="d6n" type="number" value="100"></label>
          <label>同时买 A 和 B <input id="d6ab" type="number" value="3"></label>
          <label>买了 A（尿布） <input id="d6a" type="number" value="10"></label>
          <label>买了 B（啤酒） <input id="d6b" type="number" value="20"></label>
        </div>
        <div class="demo-actions"><button type="button" class="demo-run" id="d6run">▶ 逐步计算</button></div>
        <div class="demo-metrics" id="d6out"></div>
        <pre class="demo-out" id="d6steps"></pre>`;
      root.querySelector("#d6run").onclick = () => {
        const N = +root.querySelector("#d6n").value;
        const ab = +root.querySelector("#d6ab").value;
        const a = +root.querySelector("#d6a").value;
        const b = +root.querySelector("#d6b").value;
        if (N <= 0 || a <= 0 || b <= 0) {
          root.querySelector("#d6steps").textContent = "请保证 N、A、B 都大于 0。";
          return;
        }
        if (ab > a || ab > b || ab > N) {
          root.querySelector("#d6steps").textContent =
            "数据不合理：同时购买数不能大于「只含 A / 只含 B / 总数」。";
          return;
        }
        const sup = ab / N;
        const conf = ab / a;
        const base = b / N;
        const lift = conf / base;
        let verdict = "接近独立，业务价值有限。";
        if (lift > 1.2) verdict = "正向关联较强，可考虑推荐/捆绑。";
        else if (lift < 0.8) verdict = "负向关联：买了 A 反而更少买 B。";
        root.querySelector("#d6out").innerHTML = `
          <div><b>Support</b><span>${sup.toFixed(3)}</span></div>
          <div><b>Confidence</b><span>${conf.toFixed(3)}</span></div>
          <div><b>Lift</b><span>${lift.toFixed(3)}</span></div>
          <p>${verdict}</p>`;
        root.querySelector("#d6steps").textContent =
`【第1步 Support｜全场常见吗？】
  Support = 同时买A和B / 总订单 = ${ab}/${N} = ${sup.toFixed(3)}
  人话：全部订单里，有 ${(sup * 100).toFixed(1)}% 同时买了 A 和 B。

【第2步 Confidence｜买了A后跟B稳吗？】
  Confidence = 同时买A和B / 买了A = ${ab}/${a} = ${conf.toFixed(3)}
  人话：买了 A 的人里，有 ${(conf * 100).toFixed(1)}% 也买了 B。

【第3步 Lift｜比瞎猜买B更强吗？】
  先看全场买 B 的基准 Support(B) = ${b}/${N} = ${base.toFixed(3)}
  Lift = Confidence / Support(B) = ${conf.toFixed(3)}/${base.toFixed(3)} = ${lift.toFixed(3)}
  人话：有 A 时买 B 的可能性，大约是随机买 B 的 ${lift.toFixed(2)} 倍。

记住：置信度高 ≠ 一定有用；还要看 Lift 是否明显大于 1。`;
      };
      root.querySelector("#d6run").click();
    },
  },

  7: {
    title: "互动实验：K-Means 分群（点击迭代）",
    mount(root) {
      root.innerHTML = `
        <canvas id="d7c" width="640" height="320"></canvas>
        <div class="demo-actions">
          <button type="button" class="demo-run" id="d7step">▶ 迭代一步</button>
          <button type="button" class="demo-run" id="d7run">▶ 运行到收敛</button>
          <button type="button" class="demo-ghost" id="d7reset">重置</button>
        </div>
        <pre class="demo-out" id="d7out"></pre>`;
      const canvas = root.querySelector("#d7c");
      const ctx = canvas.getContext("2d");
      const colors = ["#1a4540", "#d97706", "#3b82f6"];
      let pts = [], centers = [], labels = [], step = 0;

      function reset() {
        pts = [];
        for (let i = 0; i < 90; i++) {
          const g = i % 3;
          const cx = [160, 320, 480][g] + (Math.random() - 0.5) * 90;
          const cy = [120, 220, 140][g] + (Math.random() - 0.5) * 70;
          pts.push({ x: cx, y: cy });
        }
        centers = [
          { x: 200, y: 160 },
          { x: 300, y: 160 },
          { x: 400, y: 160 },
        ];
        labels = pts.map(() => 0);
        step = 0;
        assign();
        draw();
        root.querySelector("#d7out").textContent = "已初始化 3 个中心。点「迭代一步」观察分配→更新。";
      }

      function assign() {
        labels = pts.map((p) => {
          let best = 0, bd = Infinity;
          centers.forEach((c, i) => {
            const d = (p.x - c.x) ** 2 + (p.y - c.y) ** 2;
            if (d < bd) { bd = d; best = i; }
          });
          return best;
        });
      }

      function update() {
        centers = centers.map((_, i) => {
          const mem = pts.filter((_, j) => labels[j] === i);
          if (!mem.length) return centers[i];
          return {
            x: mem.reduce((s, p) => s + p.x, 0) / mem.length,
            y: mem.reduce((s, p) => s + p.y, 0) / mem.length,
          };
        });
      }

      function draw() {
        ctx.fillStyle = "#f7faf8";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        pts.forEach((p, i) => {
          ctx.fillStyle = colors[labels[i]];
          ctx.beginPath();
          ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
          ctx.fill();
        });
        centers.forEach((c, i) => {
          ctx.strokeStyle = colors[i];
          ctx.lineWidth = 3;
          ctx.strokeRect(c.x - 8, c.y - 8, 16, 16);
        });
      }

      root.querySelector("#d7step").onclick = () => {
        assign();
        update();
        step += 1;
        draw();
        root.querySelector("#d7out").textContent = `第 ${step} 步：先按最近中心分配，再把中心移到簇均值。`;
      };
      root.querySelector("#d7run").onclick = () => {
        for (let i = 0; i < 12; i++) { assign(); update(); step++; }
        draw();
        root.querySelector("#d7out").textContent = `已迭代 ${step} 步，中心基本稳定。记得：簇编号无业务含义，要做簇画像。`;
      };
      root.querySelector("#d7reset").onclick = reset;
      reset();
    },
  },

  8: {
    title: "互动：决策树 vs 随机森林（二维分类）",
    mount(root) {
      root.innerHTML = `
        <div class="demo-row">
          <label>模型
            <select id="d8m">
              <option value="tree">单决策树（深）</option>
              <option value="forest">随机森林（21棵浅树）</option>
            </select>
          </label>
          <button type="button" class="demo-run" id="d8run">▶ 训练并可视化</button>
        </div>
        <canvas id="d8c" width="640" height="320"></canvas>
        <pre class="demo-out" id="d8out"></pre>`;
      const canvas = root.querySelector("#d8c");
      const ctx = canvas.getContext("2d");

      // toy data: two moons-ish
      function makeData() {
        const data = [];
        for (let i = 0; i < 60; i++) {
          data.push({ x: 120 + Math.random() * 160, y: 80 + Math.random() * 100, yLabel: 0 });
          data.push({ x: 320 + Math.random() * 180, y: 140 + Math.random() * 120, yLabel: 1 });
        }
        // sprinkle noise
        for (let i = 0; i < 10; i++) {
          data.push({ x: 100 + Math.random() * 440, y: 40 + Math.random() * 240, yLabel: Math.random() < 0.5 ? 0 : 1 });
        }
        return data;
      }

      function gini(arr) {
        if (!arr.length) return 0;
        const p = arr.filter((d) => d.yLabel === 1).length / arr.length;
        return 1 - p * p - (1 - p) * (1 - p);
      }

      function bestSplit(data, maxFeat) {
        let best = null;
        const feats = Math.random() < 0.5 || maxFeat ? ["x", "y"] : (Math.random() < 0.5 ? ["x"] : ["y"]);
        const use = maxFeat ? (Math.random() < 0.5 ? ["x"] : ["y"]) : ["x", "y"];
        for (const f of use) {
          const vals = [...new Set(data.map((d) => Math.round(d[f] / 20) * 20))];
          for (const thr of vals) {
            const left = data.filter((d) => d[f] <= thr);
            const right = data.filter((d) => d[f] > thr);
            if (!left.length || !right.length) continue;
            const g = (left.length * gini(left) + right.length * gini(right)) / data.length;
            if (!best || g < best.g) best = { f, thr, g, left, right };
          }
        }
        return best;
      }

      function buildTree(data, depth, maxDepth, randomFeat) {
        const maj = data.filter((d) => d.yLabel === 1).length >= data.length / 2 ? 1 : 0;
        if (depth >= maxDepth || gini(data) < 0.02 || data.length < 4) return { type: "leaf", pred: maj };
        const sp = bestSplit(data, randomFeat);
        if (!sp) return { type: "leaf", pred: maj };
        return {
          type: "node",
          f: sp.f,
          thr: sp.thr,
          left: buildTree(sp.left, depth + 1, maxDepth, randomFeat),
          right: buildTree(sp.right, depth + 1, maxDepth, randomFeat),
        };
      }

      function predictTree(tree, p) {
        if (tree.type === "leaf") return tree.pred;
        return p[tree.f] <= tree.thr ? predictTree(tree.left, p) : predictTree(tree.right, p);
      }

      function predictForest(trees, p) {
        const votes = trees.reduce((s, t) => s + predictTree(t, p), 0);
        return votes >= trees.length / 2 ? 1 : 0;
      }

      root.querySelector("#d8run").onclick = () => {
        const data = makeData();
        const mode = root.querySelector("#d8m").value;
        let predictor;
        if (mode === "tree") {
          const tree = buildTree(data, 0, 8, false);
          predictor = (p) => predictTree(tree, p);
        } else {
          const trees = [];
          for (let t = 0; t < 21; t++) {
            const bag = Array.from({ length: data.length }, () => data[Math.floor(Math.random() * data.length)]);
            trees.push(buildTree(bag, 0, 3, true));
          }
          predictor = (p) => predictForest(trees, p);
        }

        const img = ctx.createImageData(canvas.width, canvas.height);
        for (let y = 0; y < canvas.height; y += 4) {
          for (let x = 0; x < canvas.width; x += 4) {
            const pred = predictor({ x, y });
            const color = pred ? [198, 226, 110] : [26, 69, 64];
            for (let dy = 0; dy < 4; dy++) for (let dx = 0; dx < 4; dx++) {
              const i = ((y + dy) * canvas.width + (x + dx)) * 4;
              img.data[i] = color[0]; img.data[i + 1] = color[1]; img.data[i + 2] = color[2]; img.data[i + 3] = 70;
            }
          }
        }
        ctx.putImageData(img, 0, 0);
        data.forEach((p) => {
          ctx.fillStyle = p.yLabel ? "#c6e26e" : "#0e2f2c";
          ctx.beginPath();
          ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
          ctx.fill();
        });
        let correct = 0;
        data.forEach((p) => { if (predictor(p) === p.yLabel) correct++; });
        root.querySelector("#d8out").textContent =
          mode === "tree"
            ? `单棵深树训练准确率≈${(correct / data.length * 100).toFixed(1)}%\n边界可能更曲折，更容易贴噪声。`
            : `随机森林(21棵浅树)训练准确率≈${(correct / data.length * 100).toFixed(1)}%\n边界通常更平滑稳妥——这就是投票的好处。`;
      };
      root.querySelector("#d8run").click();
    },
  },

  9: {
    title: "互动：朴素贝叶斯垃圾邮件判别",
    mount(root) {
      root.innerHTML = `
        <p class="demo-lead">勾选邮件中出现的词，点击预测。模型用极简词表先验做演示。</p>
        <div class="chip-row" id="d9words"></div>
        <div class="demo-actions"><button type="button" class="demo-run" id="d9run">▶ predict / predict_proba</button></div>
        <pre class="demo-out" id="d9out"></pre>`;
      const vocab = [
        { w: "中奖", spam: 0.7, ham: 0.05 },
        { w: "发票", spam: 0.55, ham: 0.08 },
        { w: "会议", spam: 0.05, ham: 0.35 },
        { w: "作业", spam: 0.04, ham: 0.4 },
        { w: "免费", spam: 0.6, ham: 0.1 },
        { w: "项目", spam: 0.08, ham: 0.3 },
      ];
      const priorSpam = 0.4;
      const box = root.querySelector("#d9words");
      vocab.forEach((v, i) => {
        const id = `d9w${i}`;
        box.insertAdjacentHTML(
          "beforeend",
          `<label class="chip"><input type="checkbox" id="${id}"> ${v.w}</label>`
        );
      });
      root.querySelector("#d9run").onclick = () => {
        let logSpam = Math.log(priorSpam);
        let logHam = Math.log(1 - priorSpam);
        const chosen = [];
        vocab.forEach((v, i) => {
          const on = root.querySelector(`#d9w${i}`).checked;
          if (on) {
            chosen.push(v.w);
            logSpam += Math.log(v.spam);
            logHam += Math.log(v.ham);
          } else {
            logSpam += Math.log(1 - v.spam);
            logHam += Math.log(1 - v.ham);
          }
        });
        // softmax of logs
        const m = Math.max(logSpam, logHam);
        const es = Math.exp(logSpam - m);
        const eh = Math.exp(logHam - m);
        const ps = es / (es + eh);
        const pred = ps >= 0.5 ? "垃圾邮件" : "正常邮件";
        root.querySelector("#d9out").textContent =
`选中词: ${chosen.join("、") || "（无）"}
predict       → ${pred}
predict_proba → P(垃圾)=${ps.toFixed(3)}, P(正常)=${(1 - ps).toFixed(3)}

说明：这是教学用的伯努利朴素贝叶斯直觉演示，不是生产级过滤。`;
      };
    },
  },

  10: {
    title: "互动：神经网络前向传播（可调权重）",
    mount(root) {
      root.innerHTML = `
        <div class="nn-wrap">
          <svg id="d10svg" viewBox="0 0 640 260" width="100%"></svg>
          <div class="demo-grid3">
            <label>x1 <input id="d10x1" type="range" min="-2" max="2" step="0.1" value="1"></label>
            <label>x2 <input id="d10x2" type="range" min="-2" max="2" step="0.1" value="-0.5"></label>
            <label>w 强度 <input id="d10w" type="range" min="0.2" max="2" step="0.1" value="1"></label>
          </div>
          <div class="demo-actions"><button type="button" class="demo-run" id="d10run">▶ 前向计算输出</button></div>
          <pre class="demo-out" id="d10out"></pre>
        </div>`;
      const svg = root.querySelector("#d10svg");
      function relu(z) { return Math.max(0, z); }
      function sigmoid(z) { return 1 / (1 + Math.exp(-z)); }

      function draw(h1, h2, yhat) {
        svg.innerHTML = `
          <rect x="0" y="0" width="640" height="260" fill="#f7faf8"/>
          <text x="40" y="30" fill="#5a726c" font-size="14">输入层</text>
          <text x="260" y="30" fill="#5a726c" font-size="14">隐藏层 (ReLU)</text>
          <text x="480" y="30" fill="#5a726c" font-size="14">输出 (Sigmoid)</text>
          <circle cx="70" cy="90" r="18" fill="#1a4540"/><text x="62" y="95" fill="#fff" font-size="12">x1</text>
          <circle cx="70" cy="180" r="18" fill="#1a4540"/><text x="62" y="185" fill="#fff" font-size="12">x2</text>
          <circle cx="300" cy="90" r="22" fill="#0e2f2c"/><text x="286" y="95" fill="#c6e26e" font-size="12">${h1.toFixed(2)}</text>
          <circle cx="300" cy="180" r="22" fill="#0e2f2c"/><text x="286" y="185" fill="#c6e26e" font-size="12">${h2.toFixed(2)}</text>
          <circle cx="530" cy="135" r="26" fill="#d97706"/><text x="512" y="140" fill="#fff" font-size="12">${yhat.toFixed(2)}</text>
          <line x1="88" y1="90" x2="278" y2="90" stroke="#9bb0a9"/>
          <line x1="88" y1="90" x2="278" y2="180" stroke="#9bb0a9"/>
          <line x1="88" y1="180" x2="278" y2="90" stroke="#9bb0a9"/>
          <line x1="88" y1="180" x2="278" y2="180" stroke="#9bb0a9"/>
          <line x1="322" y1="90" x2="504" y2="135" stroke="#9bb0a9"/>
          <line x1="322" y1="180" x2="504" y2="135" stroke="#9bb0a9"/>`;
      }

      function run() {
        const x1 = +root.querySelector("#d10x1").value;
        const x2 = +root.querySelector("#d10x2").value;
        const s = +root.querySelector("#d10w").value;
        // fixed tiny net
        const h1 = relu(s * (0.8 * x1 - 0.5 * x2 + 0.1));
        const h2 = relu(s * (-0.4 * x1 + 0.9 * x2 + 0.2));
        const yhat = sigmoid(0.7 * h1 + 0.6 * h2 - 0.3);
        draw(h1, h2, yhat);
        root.querySelector("#d10out").textContent =
`x = [${x1.toFixed(1)}, ${x2.toFixed(1)}]
隐藏层 h = [${h1.toFixed(3)}, ${h2.toFixed(3)}]  ← ReLU 把负数截成 0
输出 ŷ = ${yhat.toFixed(3)}  ← Sigmoid 压到 (0,1)
预测类别: ${yhat >= 0.5 ? 1 : 0}`;
      }
      root.querySelector("#d10run").onclick = run;
      root.querySelector("#d10x1").oninput = run;
      root.querySelector("#d10x2").oninput = run;
      root.querySelector("#d10w").oninput = run;
      run();
    },
  },

  11: {
    title: "互动：分词 → 词袋向量 → 分类",
    mount(root) {
      root.innerHTML = `
        <label class="full">输入一句中文
          <input id="d11t" type="text" value="这门课程的作业太难了，但我学到很多" style="width:100%">
        </label>
        <div class="demo-actions"><button type="button" class="demo-run" id="d11run">▶ 执行文本流水线</button></div>
        <pre class="demo-out" id="d11out"></pre>`;
      // tiny lexicon tokenizer
      const dict = ["课程", "作业", "太难", "学到", "很多", "喜欢", "讨厌", "垃圾", "推荐", "无聊", "有用"];
      const pos = new Set(["学到", "很多", "喜欢", "推荐", "有用", "课程"]);
      const neg = new Set(["太难", "讨厌", "垃圾", "无聊"]);

      root.querySelector("#d11run").onclick = () => {
        const text = root.querySelector("#d11t").value.trim();
        const tokens = [];
        let i = 0;
        while (i < text.length) {
          let hit = null;
          for (const w of dict) {
            if (text.startsWith(w, i)) { hit = w; break; }
          }
          if (hit) { tokens.push(hit); i += hit.length; }
          else i += 1;
        }
        const vec = dict.map((w) => (tokens.includes(w) ? 1 : 0));
        let score = 0;
        tokens.forEach((t) => {
          if (pos.has(t)) score += 1;
          if (neg.has(t)) score -= 1;
        });
        const label = score >= 0 ? "偏正向" : "偏负向";
        root.querySelector("#d11out").textContent =
`原始文本: ${text}
分词结果: ${tokens.join(" / ") || "（词典未命中，可换词试试）"}
词袋向量(0/1): [${vec.join(", ")}]
维度=词表大小=${dict.length}
简易情感判别: ${label}（score=${score}）

注意：真实课要用 jieba + TfidfVectorizer；向量化器只能在训练集 fit。`;
      };
      root.querySelector("#d11run").click();
    },
  },
};
