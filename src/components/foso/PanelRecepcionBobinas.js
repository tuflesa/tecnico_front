import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import styles from './PanelRecepcionBobinas.module.css';

function PanelRecepcionBobinas({ token, cola, setCola, onColocar, onClose }) {
  const [codigo, setCodigo] = useState('');
  const [error, setError]   = useState('');
  const [creando, setCreando] = useState(false);
  const inputRef = useRef(null);
  const [repetidas, setRepetidas] = useState([]);

  const headers = { Authorization: `token ${token}` };
    
  const traducciones = {
  'Bobina with this codigo already exists.':
      'Ya existe una bobina con este código.',
  };


  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const crearBobina = async () => {
    const cod = codigo.trim();
    if (!cod || creando) return;

    setCreando(true);
    setError('');

    try {
      const r = await axios.post(
        `${BACKEND_SERVER}/api/foso/bobinas/`,
        { codigo: cod },
        { headers }
      );

      setCola(c => [...c, { id: r.data.id, codigo: r.data.codigo }]);
      setCodigo('');

    } catch (e) {
        const msgRaw =
          e?.response?.data?.codigo?.[0] ||
          e?.response?.data?.detail ||
          'Esta bobina ya existe.';
        const msg = traducciones[msgRaw] || msgRaw;
        setError(msg);
        setRepetidas(r =>
            r.includes(cod) ? r : [...r, cod]
        );
        // 👉 limpiar input para seguir leyendo
        setCodigo('')

    } finally {
      setCreando(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') crearBobina();
  };

  const eliminarBobina = async (bobinaId) => {
    try {
      await axios.delete(
        `${BACKEND_SERVER}/api/foso/bobinas/${bobinaId}/`,
        { headers }
      );

      setCola(c => c.filter(b => b.id !== bobinaId));

    } catch (e) {
      alert(
        e?.response?.data?.detail ||
        'No se puede eliminar esta bobina.'
      );
    }
  };

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} />

      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <span className={styles.panelTitle}>Recepción de bobinas nuevas</span>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.body}>
          <label className={styles.lbl}>Código de bobina</label>
          <input
            ref={inputRef}
            className={styles.input}
            value={codigo}
            onChange={e => setCodigo(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escanear o escribir código"
          />
          <small className={styles.hint}>Pulsa Enter para añadir</small>

          {error && <div className={styles.error}>{error}</div>}
        </div>

        <div className={styles.lista}>
          <div className={styles.listaHeader}>
            Pendientes de colocar ({cola.length})
          </div>

          {cola.length === 0 && (
            <p className={styles.empty}>No hay bobinas pendientes.</p>
          )}

          {cola.map(b => (
            <div key={b.id} className={styles.item}>
              <div className={styles.codigo}>{b.codigo}</div>

              <div className={styles.actions}>
                <button
                  className={styles.btnColocar}
                  onClick={() => onColocar(b)}
                >
                  Colocar
                </button>
                <button
                  className={styles.btnEliminar}
                  onClick={() => eliminarBobina(b.id)}
                  title="Eliminar de la cola"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
          {repetidas.length > 0 && (
            <div className={styles.repetidas}>
                <div className={styles.listaHeader}>
                Bobinas repetidas / ya existentes ({repetidas.length})
                </div>

                {repetidas.map(cod => (
                <div key={cod} className={styles.itemRepetida}>
                    {cod}
                </div>
                ))}
            </div>
            )}
        </div>
      </div>
    </>
  );
}

export default PanelRecepcionBobinas;