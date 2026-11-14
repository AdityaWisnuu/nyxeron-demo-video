// Injected into every page: a visible cursor that follows the mouse, with a ring on each click.
(() => {
  if (window.__curInit) return; window.__curInit = true
  const mk = () => {
    if (document.getElementById('__cur')) return
    const st = document.createElement('style')
    st.textContent = `#__cur{position:fixed;left:0;top:0;width:34px;height:34px;z-index:2147483647;pointer-events:none;transform:translate(-200px,-200px);filter:drop-shadow(0 3px 6px rgba(0,0,0,.45))}
#__cur svg{transition:transform .12s ease;transform-origin:4px 2px}#__cur.down svg{transform:scale(.86)}
.__ring{position:fixed;z-index:2147483646;pointer-events:none;width:18px;height:18px;margin:-9px 0 0 -9px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 2px rgba(0,0,0,.35);animation:__r .55s cubic-bezier(.2,.7,.3,1) forwards}
@keyframes __r{from{transform:scale(.4);opacity:1}to{transform:scale(3.4);opacity:0}}`
    document.documentElement.appendChild(st)
    const c = document.createElement('div'); c.id = '__cur'
    c.innerHTML = '<svg viewBox="0 0 24 24" width="34" height="34"><path d="M4 2.5 L4 19.5 L8.6 15.4 L11.6 22 L14.6 20.7 L11.7 14.2 L18 14.2 Z" fill="#fff" stroke="#111" stroke-width="1.4" stroke-linejoin="round"/></svg>'
    document.documentElement.appendChild(c)
    const p = window.__curPos
    if (p) c.style.transform = `translate(${p[0] - 4}px,${p[1] - 2}px)`
  }
  const move = (e) => { window.__curPos = [e.clientX, e.clientY]; const c = document.getElementById('__cur'); if (c) c.style.transform = `translate(${e.clientX - 4}px,${e.clientY - 2}px)` }
  addEventListener('mousemove', move, true)
  addEventListener('pointermove', move, true)
  addEventListener('mousedown', (e) => { const c = document.getElementById('__cur'); c?.classList.add('down'); const r = document.createElement('div'); r.className = '__ring'; r.style.left = e.clientX + 'px'; r.style.top = e.clientY + 'px'; document.documentElement.appendChild(r); setTimeout(() => r.remove(), 700) }, true)
  addEventListener('mouseup', () => document.getElementById('__cur')?.classList.remove('down'), true)
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mk); else mk()
  setInterval(mk, 500)
})()
