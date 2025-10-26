import React,{ useState } from 'react'
import EnablePushButton from './components/EnablePushButton.jsx'
import TestNotification from './components/TestNotification.jsx'
import { getDeviceId} from './lib/deviceId.js'

import './App.css'

function App() {
  const [deviceId, setDeviceId] = useState(localStorage.getItem('deviceId') || '');
  return (
    <div style={{fontFamily: 'system-uri, sans-serif', padding: '24px'}}>
      <h1>Demo de Notificaciones Push con React + Vite + PWA</h1>
      <p>Activa las notificaciones y suscribete con un <code>deviceId</code> anonimo</p>

      <EnablePushButton onSubcibed={(id) => setDeviceId(id)} />

      <TestNotification />

      {deviceId && (
        <div style={{ marginTop: 16}}>
          <strong>Tu deviceId:</strong>
          <pre style={{ background: '#f5f5f5', padding: 12 , borderRadius: 4}}>{deviceId}</pre>
          <small>Usa este deviceID en el endpoint del server para enviarte una notificacion</small>
        </div>
      )}

      <button 
        style={{ marginTop: 16}}
        onClick={()=>{
          const id = getDeviceId();
          setDeviceId(id);
          alert(`Tu deviceId es: ${id}`);
        }}
      >
        ver mi deviceId
      </button>
    </div>
  )
}

export default App
