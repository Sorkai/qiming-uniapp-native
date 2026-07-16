(function () {
  "use strict";

  var mode = document.body.dataset.lab || "particle";
  var app = document.getElementById("app");
  var definitions = {
    particle: {
      title: "粒子运动实验",
      description: "移动手指或鼠标观察粒子的吸引与回弹，调节数量比较系统负载。"
    },
    snake: {
      title: "贪吃蛇",
      description: "使用方向键或屏幕按钮控制方向，观察离散网格中的碰撞检测。"
    },
    cube: {
      title: "3D 旋转立方体",
      description: "调节动画周期，观察透视、旋转轴和三维面的空间关系。"
    },
    physics: {
      title: "弹球物理模拟",
      description: "点击画布添加小球，改变重力，观察速度、碰撞与能量衰减。"
    },
    memory: {
      title: "记忆翻牌",
      description: "依次翻开两张卡片，寻找相同图案并尽量减少尝试次数。"
    },
    wave: {
      title: "波浪叠加实验",
      description: "改变振幅和频率，观察两列波叠加后的实时形态。"
    },
    molecule: {
      title: "分子结构观察",
      description: "切换常见分子并拖动旋转，理解原子间的空间连接关系。"
    },
    typing: {
      title: "打字速度训练",
      description: "准确输入目标文字，系统会实时计算速度、准确率和用时。"
    }
  };

  var definition = definitions[mode] || definitions.particle;

  function shell(toolbar, stageClass) {
    app.innerHTML =
      '<main class="lab-shell">' +
      '<header class="lab-header"><div><h1 class="lab-title">' + definition.title +
      '</h1><p class="lab-description">' + definition.description +
      '</p></div><div class="lab-status" id="status">准备就绪</div></header>' +
      '<section class="lab-toolbar">' + toolbar + '</section>' +
      '<section class="' + (stageClass || "lab-stage") + '" id="stage"></section>' +
      '</main>';
    return {
      stage: document.getElementById("stage"),
      status: document.getElementById("status")
    };
  }

  function button(id, label, secondary) {
    return '<button class="lab-button' + (secondary ? " secondary" : "") +
      '" id="' + id + '" type="button">' + label + '</button>';
  }

  function range(id, label, min, max, value, step) {
    return '<label class="lab-control">' + label +
      '<input id="' + id + '" type="range" min="' + min + '" max="' + max +
      '" value="' + value + '" step="' + (step || 1) + '"><output id="' +
      id + '-value">' + value + '</output></label>';
  }

  function setupCanvas(stage) {
    var canvas = document.createElement("canvas");
    canvas.className = "lab-canvas";
    stage.appendChild(canvas);
    var context = canvas.getContext("2d");
    var size = { width: 1, height: 1, ratio: 1 };

    function resize() {
      var rect = canvas.getBoundingClientRect();
      var ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(rect.width * ratio));
      canvas.height = Math.max(1, Math.round(rect.height * ratio));
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      size.width = rect.width;
      size.height = rect.height;
      size.ratio = ratio;
    }

    resize();
    window.addEventListener("resize", resize);
    return { canvas: canvas, context: context, size: size, resize: resize };
  }

  function bindRange(id, callback) {
    var input = document.getElementById(id);
    var output = document.getElementById(id + "-value");
    input.addEventListener("input", function () {
      output.textContent = input.value;
      callback(Number(input.value));
    });
    return input;
  }

  function particleLab() {
    var ui = shell(range("count", "粒子数量", 20, 160, 72, 1) + button("toggle", "暂停"));
    var surface = setupCanvas(ui.stage);
    var particles = [];
    var pointer = { x: -1000, y: -1000, active: false };
    var paused = false;

    function reset(count) {
      particles = Array.from({ length: count }, function () {
        return {
          x: Math.random() * surface.size.width,
          y: Math.random() * surface.size.height,
          vx: (Math.random() - 0.5) * 1.2,
          vy: (Math.random() - 0.5) * 1.2,
          radius: 1.5 + Math.random() * 2.5
        };
      });
      ui.status.textContent = count + " 个粒子";
    }

    function setPointer(event) {
      var rect = surface.canvas.getBoundingClientRect();
      var source = event.touches ? event.touches[0] : event;
      pointer.x = source.clientX - rect.left;
      pointer.y = source.clientY - rect.top;
      pointer.active = true;
    }

    surface.canvas.addEventListener("pointermove", setPointer);
    surface.canvas.addEventListener("pointerleave", function () { pointer.active = false; });
    surface.canvas.addEventListener("touchmove", setPointer, { passive: true });
    bindRange("count", reset);
    document.getElementById("toggle").addEventListener("click", function (event) {
      paused = !paused;
      event.currentTarget.textContent = paused ? "继续" : "暂停";
    });

    function frame() {
      var ctx = surface.context;
      var width = surface.size.width;
      var height = surface.size.height;
      ctx.fillStyle = "#071426";
      ctx.fillRect(0, 0, width, height);
      if (!paused) {
        particles.forEach(function (particle) {
          if (pointer.active) {
            var dx = pointer.x - particle.x;
            var dy = pointer.y - particle.y;
            var distance = Math.max(30, Math.hypot(dx, dy));
            if (distance < 180) {
              particle.vx += dx / distance * 0.014;
              particle.vy += dy / distance * 0.014;
            }
          }
          particle.vx *= 0.995;
          particle.vy *= 0.995;
          particle.x += particle.vx;
          particle.y += particle.vy;
          if (particle.x < 0 || particle.x > width) particle.vx *= -1;
          if (particle.y < 0 || particle.y > height) particle.vy *= -1;
          particle.x = Math.max(0, Math.min(width, particle.x));
          particle.y = Math.max(0, Math.min(height, particle.y));
        });
      }
      particles.forEach(function (particle, index) {
        for (var next = index + 1; next < particles.length; next += 1) {
          var other = particles[next];
          var distance = Math.hypot(particle.x - other.x, particle.y - other.y);
          if (distance < 85) {
            ctx.strokeStyle = "rgba(96, 165, 250," + (1 - distance / 85) * 0.35 + ")";
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        }
        ctx.fillStyle = "#7dd3fc";
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      requestAnimationFrame(frame);
    }

    reset(72);
    frame();
  }

  function snakeLab() {
    var pad = '<div class="direction-pad">' +
      '<button class="direction-button" data-direction="up">上</button>' +
      '<button class="direction-button" data-direction="left">左</button>' +
      '<button class="direction-button" data-direction="down">下</button>' +
      '<button class="direction-button" data-direction="right">右</button></div>';
    var ui = shell(button("restart", "开始 / 重置") + '<span class="lab-control">分数 <strong id="score">0</strong></span>' + pad);
    var surface = setupCanvas(ui.stage);
    var cells = 20;
    var snake;
    var food;
    var direction;
    var nextDirection;
    var timer = 0;

    function newFood() {
      do {
        food = { x: Math.floor(Math.random() * cells), y: Math.floor(Math.random() * cells) };
      } while (snake.some(function (part) { return part.x === food.x && part.y === food.y; }));
    }

    function reset() {
      snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
      direction = { x: 1, y: 0 };
      nextDirection = direction;
      document.getElementById("score").textContent = "0";
      ui.status.textContent = "运行中";
      newFood();
      clearInterval(timer);
      timer = window.setInterval(step, 135);
      draw();
    }

    function setDirection(name) {
      var map = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };
      var candidate = map[name];
      if (candidate && (candidate.x + direction.x !== 0 || candidate.y + direction.y !== 0)) {
        nextDirection = candidate;
      }
    }

    function step() {
      direction = nextDirection;
      var head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
      var hitWall = head.x < 0 || head.y < 0 || head.x >= cells || head.y >= cells;
      var hitSelf = snake.some(function (part) { return part.x === head.x && part.y === head.y; });
      if (hitWall || hitSelf) {
        clearInterval(timer);
        ui.status.textContent = "碰撞结束";
        return;
      }
      snake.unshift(head);
      if (head.x === food.x && head.y === food.y) {
        document.getElementById("score").textContent = String((snake.length - 3) * 10);
        newFood();
      } else {
        snake.pop();
      }
      draw();
    }

    function draw() {
      var ctx = surface.context;
      var width = surface.size.width;
      var height = surface.size.height;
      var unit = Math.min(width, height) / cells;
      var offsetX = (width - unit * cells) / 2;
      var offsetY = (height - unit * cells) / 2;
      ctx.fillStyle = "#071426";
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = "rgba(148, 163, 184, .08)";
      for (var index = 0; index <= cells; index += 1) {
        ctx.beginPath();
        ctx.moveTo(offsetX + index * unit, offsetY);
        ctx.lineTo(offsetX + index * unit, offsetY + cells * unit);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(offsetX, offsetY + index * unit);
        ctx.lineTo(offsetX + cells * unit, offsetY + index * unit);
        ctx.stroke();
      }
      ctx.fillStyle = "#fb7185";
      ctx.beginPath();
      ctx.arc(offsetX + (food.x + 0.5) * unit, offsetY + (food.y + 0.5) * unit, unit * 0.34, 0, Math.PI * 2);
      ctx.fill();
      snake.forEach(function (part, index) {
        ctx.fillStyle = index === 0 ? "#34d399" : "#10b981";
        ctx.fillRect(offsetX + part.x * unit + 1, offsetY + part.y * unit + 1, unit - 2, unit - 2);
      });
    }

    document.getElementById("restart").addEventListener("click", reset);
    document.querySelectorAll("[data-direction]").forEach(function (control) {
      control.addEventListener("click", function () { setDirection(control.dataset.direction); });
    });
    window.addEventListener("keydown", function (event) {
      var keys = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right" };
      if (keys[event.key]) {
        event.preventDefault();
        setDirection(keys[event.key]);
      }
    });
    reset();
  }

  function cubeLab() {
    var ui = shell(range("speed", "旋转周期(秒)", 2, 16, 8, 1) + button("toggle", "暂停"), "cube-stage");
    ui.stage.innerHTML = '<div class="cube" id="cube">' +
      '<div class="cube-face">前</div><div class="cube-face">后</div>' +
      '<div class="cube-face">右</div><div class="cube-face">左</div>' +
      '<div class="cube-face">上</div><div class="cube-face">下</div></div>';
    var cube = document.getElementById("cube");
    bindRange("speed", function (value) {
      cube.style.animationDuration = value + "s";
      ui.status.textContent = value + " 秒 / 周期";
    });
    document.getElementById("toggle").addEventListener("click", function (event) {
      cube.classList.toggle("paused");
      event.currentTarget.textContent = cube.classList.contains("paused") ? "继续" : "暂停";
    });
    ui.status.textContent = "8 秒 / 周期";
  }

  function physicsLab() {
    var ui = shell(range("gravity", "重力", 0, 1.2, 0.35, 0.05) + button("add", "添加小球") + button("clear", "清空", true));
    var surface = setupCanvas(ui.stage);
    var gravity = 0.35;
    var balls = [];

    function addBall(x, y) {
      balls.push({
        x: x == null ? surface.size.width * (0.2 + Math.random() * 0.6) : x,
        y: y == null ? 40 : y,
        vx: (Math.random() - 0.5) * 6,
        vy: -2 - Math.random() * 3,
        radius: 10 + Math.random() * 12,
        color: ["#38bdf8", "#34d399", "#fbbf24", "#fb7185"][balls.length % 4]
      });
      ui.status.textContent = balls.length + " 个小球";
    }

    bindRange("gravity", function (value) { gravity = value; });
    document.getElementById("add").addEventListener("click", function () { addBall(); });
    document.getElementById("clear").addEventListener("click", function () {
      balls = [];
      ui.status.textContent = "0 个小球";
    });
    surface.canvas.addEventListener("pointerdown", function (event) {
      var rect = surface.canvas.getBoundingClientRect();
      addBall(event.clientX - rect.left, event.clientY - rect.top);
    });

    function frame() {
      var ctx = surface.context;
      var width = surface.size.width;
      var height = surface.size.height;
      ctx.fillStyle = "#071426";
      ctx.fillRect(0, 0, width, height);
      balls.forEach(function (ball) {
        ball.vy += gravity;
        ball.x += ball.vx;
        ball.y += ball.vy;
        if (ball.x - ball.radius < 0 || ball.x + ball.radius > width) {
          ball.vx *= -0.88;
          ball.x = Math.max(ball.radius, Math.min(width - ball.radius, ball.x));
        }
        if (ball.y + ball.radius > height) {
          ball.y = height - ball.radius;
          ball.vy *= -0.78;
          ball.vx *= 0.99;
        }
        ctx.fillStyle = ball.color;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      requestAnimationFrame(frame);
    }
    addBall();
    addBall();
    frame();
  }

  function memoryLab() {
    var ui = shell(button("restart", "重新洗牌") + '<span class="lab-control">尝试 <strong id="moves">0</strong> 次</span>', "memory-stage");
    var symbols = ["A", "B", "C", "D", "E", "F", "G", "H"];
    var first = null;
    var lock = false;
    var matches = 0;
    var moves = 0;

    function shuffle(values) {
      for (var i = values.length - 1; i > 0; i -= 1) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = values[i];
        values[i] = values[j];
        values[j] = temp;
      }
      return values;
    }

    function reset() {
      first = null;
      lock = false;
      matches = 0;
      moves = 0;
      document.getElementById("moves").textContent = "0";
      ui.status.textContent = "0 / 8 组";
      ui.stage.innerHTML = "";
      shuffle(symbols.concat(symbols)).forEach(function (symbol) {
        var card = document.createElement("button");
        card.className = "memory-card";
        card.type = "button";
        card.textContent = symbol;
        card.dataset.symbol = symbol;
        card.addEventListener("click", function () { reveal(card); });
        ui.stage.appendChild(card);
      });
    }

    function reveal(card) {
      if (lock || card === first || card.classList.contains("matched")) return;
      card.classList.add("revealed");
      if (!first) {
        first = card;
        return;
      }
      moves += 1;
      document.getElementById("moves").textContent = String(moves);
      if (first.dataset.symbol === card.dataset.symbol) {
        first.classList.add("matched");
        card.classList.add("matched");
        first = null;
        matches += 1;
        ui.status.textContent = matches + " / 8 组";
        if (matches === 8) ui.status.textContent = moves + " 次完成";
        return;
      }
      lock = true;
      window.setTimeout(function () {
        first.classList.remove("revealed");
        card.classList.remove("revealed");
        first = null;
        lock = false;
      }, 650);
    }

    document.getElementById("restart").addEventListener("click", reset);
    reset();
  }

  function waveLab() {
    var ui = shell(range("amplitude", "振幅", 10, 90, 45, 1) + range("frequency", "频率", 1, 8, 3, 0.2));
    var surface = setupCanvas(ui.stage);
    var amplitude = 45;
    var frequency = 3;
    var time = 0;
    bindRange("amplitude", function (value) { amplitude = value; });
    bindRange("frequency", function (value) { frequency = value; });

    function frame() {
      var ctx = surface.context;
      var width = surface.size.width;
      var height = surface.size.height;
      ctx.fillStyle = "#071426";
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = "rgba(148, 163, 184, .22)";
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      function drawWave(color, phase, scale) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (var x = 0; x <= width; x += 3) {
          var y = height / 2 + Math.sin(x / width * Math.PI * 2 * frequency + time + phase) * amplitude * scale;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      drawWave("#38bdf8", 0, 1);
      drawWave("#34d399", Math.PI / 2, 0.62);
      time += 0.035;
      ui.status.textContent = "f = " + frequency.toFixed(1);
      requestAnimationFrame(frame);
    }
    frame();
  }

  function moleculeLab() {
    var options = '<label class="lab-control">分子<select id="molecule">' +
      '<option value="water">水 H2O</option><option value="methane">甲烷 CH4</option>' +
      '<option value="carbon">二氧化碳 CO2</option></select></label>' + button("toggle", "暂停");
    var ui = shell(options);
    var surface = setupCanvas(ui.stage);
    var current = "water";
    var paused = false;
    var angle = 0;
    var pointerStart = null;

    var models = {
      water: [
        { p: [0, 0, 0], r: 25, c: "#ef4444", t: "O" },
        { p: [-80, 55, 20], r: 16, c: "#f8fafc", t: "H", link: 0 },
        { p: [80, 55, -20], r: 16, c: "#f8fafc", t: "H", link: 0 }
      ],
      methane: [
        { p: [0, 0, 0], r: 24, c: "#334155", t: "C" },
        { p: [-70, -55, 45], r: 15, c: "#f8fafc", t: "H", link: 0 },
        { p: [70, -55, -45], r: 15, c: "#f8fafc", t: "H", link: 0 },
        { p: [-70, 60, -45], r: 15, c: "#f8fafc", t: "H", link: 0 },
        { p: [70, 60, 45], r: 15, c: "#f8fafc", t: "H", link: 0 }
      ],
      carbon: [
        { p: [0, 0, 0], r: 22, c: "#334155", t: "C" },
        { p: [-105, 0, 0], r: 25, c: "#ef4444", t: "O", link: 0 },
        { p: [105, 0, 0], r: 25, c: "#ef4444", t: "O", link: 0 }
      ]
    };

    function project(point) {
      var cos = Math.cos(angle);
      var sin = Math.sin(angle);
      var x = point[0] * cos - point[2] * sin;
      var z = point[0] * sin + point[2] * cos;
      var scale = 420 / (420 + z);
      return { x: surface.size.width / 2 + x * scale, y: surface.size.height / 2 + point[1] * scale, z: z, scale: scale };
    }

    function frame() {
      var ctx = surface.context;
      ctx.fillStyle = "#071426";
      ctx.fillRect(0, 0, surface.size.width, surface.size.height);
      var atoms = models[current].map(function (atom) { return { atom: atom, screen: project(atom.p) }; });
      atoms.forEach(function (item) {
        if (item.atom.link == null) return;
        var target = atoms[item.atom.link].screen;
        ctx.strokeStyle = "#94a3b8";
        ctx.lineWidth = 8 * item.screen.scale;
        ctx.beginPath();
        ctx.moveTo(item.screen.x, item.screen.y);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();
      });
      atoms.sort(function (a, b) { return a.screen.z - b.screen.z; }).forEach(function (item) {
        var radius = item.atom.r * item.screen.scale;
        ctx.fillStyle = item.atom.c;
        ctx.beginPath();
        ctx.arc(item.screen.x, item.screen.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = item.atom.t === "H" ? "#17304f" : "#ffffff";
        ctx.font = "700 " + Math.max(11, radius * 0.8) + "px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(item.atom.t, item.screen.x, item.screen.y);
      });
      if (!paused) angle += 0.012;
      requestAnimationFrame(frame);
    }

    document.getElementById("molecule").addEventListener("change", function (event) {
      current = event.target.value;
      ui.status.textContent = event.target.selectedOptions[0].textContent;
    });
    document.getElementById("toggle").addEventListener("click", function (event) {
      paused = !paused;
      event.currentTarget.textContent = paused ? "继续" : "暂停";
    });
    surface.canvas.addEventListener("pointerdown", function (event) { pointerStart = event.clientX; });
    surface.canvas.addEventListener("pointermove", function (event) {
      if (pointerStart == null) return;
      angle += (event.clientX - pointerStart) * 0.012;
      pointerStart = event.clientX;
    });
    window.addEventListener("pointerup", function () { pointerStart = null; });
    ui.status.textContent = "水 H2O";
    frame();
  }

  function typingLab() {
    var challenges = [
      "持续练习可以让复杂技能逐渐变成稳定习惯。",
      "认真观察数据变化，才能理解实验背后的规律。",
      "清晰的表达来自准确的思考和有条理的组织。"
    ];
    var ui = shell(button("next", "换一段") + '<span class="lab-control">速度 <strong id="speed">0</strong> 字/分</span><span class="lab-control">准确率 <strong id="accuracy">100</strong>%</span>', "typing-stage");
    ui.stage.innerHTML = '<p class="typing-target" id="target"></p><textarea class="typing-input" id="typing" placeholder="在这里输入上面的文字" autocomplete="off"></textarea>';
    var target = document.getElementById("target");
    var input = document.getElementById("typing");
    var startedAt = 0;
    var challengeIndex = -1;

    function next() {
      challengeIndex = (challengeIndex + 1) % challenges.length;
      target.textContent = challenges[challengeIndex];
      input.value = "";
      startedAt = 0;
      document.getElementById("speed").textContent = "0";
      document.getElementById("accuracy").textContent = "100";
      ui.status.textContent = "等待输入";
      input.focus();
    }

    input.addEventListener("input", function () {
      if (!startedAt) startedAt = Date.now();
      var typed = input.value;
      var expected = target.textContent;
      var correct = 0;
      for (var index = 0; index < typed.length; index += 1) {
        if (typed[index] === expected[index]) correct += 1;
      }
      var minutes = Math.max((Date.now() - startedAt) / 60000, 1 / 60);
      var speed = Math.round(typed.length / minutes);
      var accuracy = typed.length ? Math.round(correct / typed.length * 100) : 100;
      document.getElementById("speed").textContent = String(speed);
      document.getElementById("accuracy").textContent = String(accuracy);
      ui.status.textContent = typed === expected ? "完成" : typed.length + " / " + expected.length;
      if (typed === expected) input.blur();
    });
    document.getElementById("next").addEventListener("click", next);
    next();
  }

  var runners = {
    particle: particleLab,
    snake: snakeLab,
    cube: cubeLab,
    physics: physicsLab,
    memory: memoryLab,
    wave: waveLab,
    molecule: moleculeLab,
    typing: typingLab
  };
  (runners[mode] || particleLab)();
})();
