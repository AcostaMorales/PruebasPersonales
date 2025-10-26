import express from 'express'
import { Router } from 'express'
import webpush from '../config/webpush.js'
import Subscription from '../models/Subscription.js'
import { basicAuth } from '../middlewares/basicAuth.js'

const router = Router()

// Protege todo /admin con Basic Auth
router.use(basicAuth)

// GET: formulario
router.get('/notify', (req, res) => {
  res.type('html').send(`
<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Admin · Enviar notificaciones</title>
<style>
  body{font-family:system-ui,sans-serif;background:#f7fafc;margin:0;padding:32px;color:#111}
  .card{max-width:720px;margin:0 auto;background:#fff;border-radius:16px;padding:24px;box-shadow:0 10px 30px rgba(0,0,0,.06)}
  h1{margin:0 0 6px} .muted{color:#666;margin-top:0}
  form{display:grid;gap:12px}
  label{font-weight:600}
  input,textarea,select{width:100%;padding:10px 12px;border:1px solid #e5e7eb;border-radius:10px;font:inherit}
  textarea{min-height:90px}
  .row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  .actions{display:flex;gap:12px;align-items:center}
  button{background:#0ea5e9;color:#fff;border:0;padding:10px 14px;border-radius:10px;cursor:pointer}
  .result{white-space:pre-wrap;background:#0b10261a;border-radius:12px;padding:12px}
</style>
</head>
<body>
  <div class="card">
    <h1>Enviar notificaciones</h1>
    <p class="muted">Panel interno. Protegido con Basic Auth.</p>

    <form method="post" action="/api/admin/notify">
      <div class="row">
        <div>
          <label>Modo</label>
          <select name="mode" id="mode">
            <option value="single">A un deviceId</option>
            <option value="broadcast">Broadcast</option>
          </select>
        </div>
        <div id="deviceWrap">
          <label>deviceId</label>
          <input name="deviceId" placeholder="pega el deviceId" />
        </div>
      </div>

      <div class="row">
        <div>
          <label>Título</label>
          <input name="title" value="Hola 👋" />
        </div>
        <div>
          <label>Icon (opcional)</label>
          <input name="icon" value="/icons/icon-192.png" />
        </div>
      </div>

      <label>Cuerpo</label>
      <textarea name="body">Notificación de prueba</textarea>

      <label>URL al clicar</label>
      <input name="url" value="/" />

      <label>Data (JSON opcional)</label>
      <textarea name="data">{}</textarea>

      <div class="actions">
        <button type="submit">Enviar</button>
      </div>
    </form>
  </div>
  <script>
    const mode = document.getElementById('mode')
    const deviceWrap = document.getElementById('deviceWrap')
    const toggle = () => deviceWrap.style.display = mode.value === 'single' ? 'block' : 'none'
    mode.addEventListener('change', toggle); toggle()
  </script>
</body>
</html>`)
})

// Necesitamos parsear application/x-www-form-urlencoded
router.use(express.urlencoded({ extended: true }))

// POST: procesa el formulario
router.post('/notify', async (req, res) => {
  try {
    const { mode, deviceId, title, body, icon, url } = req.body
    let data = {}
    try { data = req.body.data ? JSON.parse(req.body.data) : {} } catch { /* ignore */ }

    const payload = JSON.stringify({ title, body, icon, url, data })

    if (mode === 'single') {
      if (!deviceId) return res.status(400).send('Falta deviceId')
      const sub = await Subscription.findOne({ deviceId })
      if (!sub) return res.status(404).send(`No existe deviceId: ${deviceId}`)

      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: sub.keys },
        payload
      )

      return res.type('html').send(htmlResult(`✅ Enviado a ${deviceId}`))
    }

    // broadcast
    const subs = await Subscription.find({}, { endpoint:1, keys:1, deviceId:1 })
    const results = await Promise.allSettled(
      subs.map(s => webpush.sendNotification({ endpoint: s.endpoint, keys: s.keys }, payload))
    )
    // limpia expirados 404/410
    const toDelete = results
      .map((r, i) => ({ r, s: subs[i] }))
      .filter(x => x.r.status === 'rejected' && [404,410].includes(x.r.reason?.statusCode))
      .map(x => ({ deviceId: x.s.deviceId }))
    if (toDelete.length) await Subscription.deleteMany({ $or: toDelete })

    return res.type('html').send(htmlResult(`✅ Broadcast enviado.\nTotal: ${subs.length}\nRemovidos: ${toDelete.length}`))

  } catch (e) {
    console.error('Admin notify error:', e)
    return res.status(500).type('html').send(htmlResult('❌ Error: ' + e.message))
  }
})

function htmlResult(text) {
  return `<!doctype html><meta charset="utf-8"/><style>
  body{font-family:system-ui,sans-serif;padding:24px} pre{white-space:pre-wrap;background:#0b10261a;padding:12px;border-radius:8px}
  a{display:inline-block;margin-top:12px}
  </style><h2>Resultado</h2><pre>${escapeHtml(text)}</pre><a href="/api/admin/notify">Volver</a>`
}
function escapeHtml(s=''){return s.replace(/[&<>"']/g,m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]))}

export default router
