chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.action === 'startCapture') {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (!tabs[0]) return
      await chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: injectSelector,
      })
    })
  }

  if (msg.action === 'areaSelected') {
    handleAreaSelected(msg.rect)
  }
})

async function handleAreaSelected(rect) {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
  if (!tabs[0]) return
  chrome.tabs.captureVisibleTab(tabs[0].windowId, { format: 'png' }, async (dataUrl) => {
    if (chrome.runtime.lastError || !dataUrl) return
    try {
      const croppedUrl = await cropImage(dataUrl, rect)
      await chrome.storage.session.set({ capturedImage: croppedUrl })
      try {
        await chrome.action.openPopup()
      } catch (_) {}
    } catch (e) {
      console.error('Bar Reader crop error:', e)
    }
  })
}

async function cropImage(dataUrl, rect) {
  const response = await fetch(dataUrl)
  const blob = await response.blob()
  const bitmap = await createImageBitmap(blob)
  const w = Math.max(1, rect.width)
  const h = Math.max(1, rect.height)
  const canvas = new OffscreenCanvas(w, h)
  const ctx = canvas.getContext('2d')
  ctx.drawImage(bitmap, rect.x, rect.y, w, h, 0, 0, w, h)
  const croppedBlob = await canvas.convertToBlob({ type: 'image/png' })
  const arrayBuffer = await croppedBlob.arrayBuffer()
  const bytes = new Uint8Array(arrayBuffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return 'data:image/png;base64,' + btoa(binary)
}

function injectSelector() {
  if (document.getElementById('bar-reader-overlay')) return

  const style = document.createElement('style')
  style.id = 'bar-reader-style'
  style.textContent = `
    #bar-reader-overlay {
      position: fixed;
      inset: 0;
      z-index: 2147483647;
      cursor: crosshair;
      background: rgba(0,0,0,0.35);
    }
    #bar-reader-selection {
      position: fixed;
      border: 2px solid #6c63ff;
      background: rgba(108,99,255,0.12);
      pointer-events: none;
      display: none;
      z-index: 2147483647;
      box-sizing: border-box;
    }
    #bar-reader-hint {
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0,0,0,0.85);
      color: #fff;
      padding: 9px 18px;
      border-radius: 8px;
      font-size: 14px;
      font-family: system-ui, sans-serif;
      pointer-events: none;
      z-index: 2147483647;
      white-space: nowrap;
      box-shadow: 0 2px 12px rgba(0,0,0,0.4);
    }
  `
  document.head.appendChild(style)

  const overlay = document.createElement('div')
  overlay.id = 'bar-reader-overlay'

  const selection = document.createElement('div')
  selection.id = 'bar-reader-selection'

  const hint = document.createElement('div')
  hint.id = 'bar-reader-hint'
  hint.textContent = 'Drag to select the barcode / QR code area  •  Esc to cancel'

  document.body.appendChild(overlay)
  document.body.appendChild(selection)
  document.body.appendChild(hint)

  let startX, startY, drawing = false

  function getRect(x1, y1, x2, y2) {
    return {
      x: Math.min(x1, x2),
      y: Math.min(y1, y2),
      width: Math.abs(x2 - x1),
      height: Math.abs(y2 - y1),
    }
  }

  function cleanup() {
    overlay.remove()
    selection.remove()
    hint.remove()
    style.remove()
    document.removeEventListener('keydown', onKeyDown)
  }

  overlay.addEventListener('mousedown', (e) => {
    e.preventDefault()
    drawing = true
    startX = e.clientX
    startY = e.clientY
    selection.style.display = 'block'
    selection.style.left = startX + 'px'
    selection.style.top = startY + 'px'
    selection.style.width = '0'
    selection.style.height = '0'
  })

  overlay.addEventListener('mousemove', (e) => {
    if (!drawing) return
    const r = getRect(startX, startY, e.clientX, e.clientY)
    selection.style.left = r.x + 'px'
    selection.style.top = r.y + 'px'
    selection.style.width = r.width + 'px'
    selection.style.height = r.height + 'px'
  })

  overlay.addEventListener('mouseup', (e) => {
    if (!drawing) return
    drawing = false
    const r = getRect(startX, startY, e.clientX, e.clientY)
    cleanup()
    if (r.width < 5 || r.height < 5) return
    const dpr = window.devicePixelRatio || 1
    chrome.runtime.sendMessage({
      action: 'areaSelected',
      rect: {
        x: Math.round(r.x * dpr),
        y: Math.round(r.y * dpr),
        width: Math.round(r.width * dpr),
        height: Math.round(r.height * dpr),
      },
    })
  })

  function onKeyDown(e) {
    if (e.key === 'Escape') {
      cleanup()
    }
  }
  document.addEventListener('keydown', onKeyDown)
}
