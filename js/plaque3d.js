/* =============================================================================
   PLAQUE3D.JS — canvas 2D com uma "plaquinha" gravada em pseudo-3D, girando
   sozinha e arrastável com mouse/dedo (sem depender de biblioteca externa).
   Desliga inteiro com prefers-reduced-motion (o wrapper some via CSS).
   ============================================================================= */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (reduceMotion) return;
    var canvas = document.getElementById("plaque3d-canvas");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    var SIZE = 260;
    var DPR = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = SIZE * DPR;
    canvas.height = SIZE * DPR;
    canvas.style.width = SIZE + "px";
    canvas.style.height = SIZE + "px";
    ctx.scale(DPR, DPR);

    var BASE_SPEED = 0.006;
    var angle = 0.35;
    var velocity = BASE_SPEED;
    var dragging = false;
    var lastX = 0;

    function draw() {
      ctx.clearRect(0, 0, SIZE, SIZE);
      var scaleX = Math.cos(angle);
      var front = scaleX >= 0;
      var w = 190, h = 128;

      ctx.save();
      ctx.translate(SIZE / 2, SIZE / 2);
      ctx.scale(Math.max(Math.abs(scaleX), 0.05), 1);

      roundRect(ctx, -w / 2, -h / 2, w, h, 16);
      var grad = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
      grad.addColorStop(0, front ? "#0f1730" : "#141b30");
      grad.addColorStop(1, front ? "#060912" : "#0a0e1c");
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.shadowBlur = 16;
      ctx.shadowColor = front ? "rgba(47,255,154,.55)" : "rgba(63,169,255,.4)";
      ctx.strokeStyle = front ? "rgba(47,255,154,.65)" : "rgba(63,169,255,.5)";
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      if (front) {
        ctx.fillStyle = "rgba(234,240,255,.92)";
        ctx.font = "700 25px 'Share Tech Mono', monospace";
        ctx.shadowColor = "rgba(47,255,154,.5)";
        ctx.shadowBlur = 8;
        ctx.fillText("ACMER S1", 0, -8);
        ctx.shadowBlur = 0;
        ctx.font = "400 11px 'Share Tech Mono', monospace";
        ctx.fillStyle = "rgba(138,147,178,.9)";
        ctx.fillText("GRAVAÇÃO A LASER", 0, 16);
      } else {
        ctx.fillStyle = "rgba(138,147,178,.6)";
        ctx.font = "400 11px 'Share Tech Mono', monospace";
        ctx.fillText("ARRASTE PRA GIRAR", 0, 0);
      }
      ctx.restore();
    }

    function loop() {
      if (!dragging) {
        velocity += (BASE_SPEED - velocity) * 0.02;
        angle += velocity;
      }
      draw();
      requestAnimationFrame(loop);
    }

    canvas.addEventListener("pointerdown", function (e) {
      dragging = true;
      lastX = e.clientX;
      canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var dx = e.clientX - lastX;
      lastX = e.clientX;
      angle += dx * 0.012;
      velocity = dx * 0.002;
    });
    function release() { dragging = false; }
    canvas.addEventListener("pointerup", release);
    canvas.addEventListener("pointercancel", release);

    requestAnimationFrame(loop);
  });
})();
