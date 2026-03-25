import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import Modal from './Modal';
import styles from './ColocarBobina.module.css';

const empty = { codigo: '', material: '', ref_proveedor: '',
  ancho_mm: '', espesor_mm:'', colada: '', proveedor: '', observaciones: '',
};

function ColocarBobina({ posicionId, altura, columna, token, onClose, onColocada }) {
  const [form,        setForm]       = useState(empty);
  const [error,       setError]      = useState('');
  const [guardando,   setGuardando]  = useState(false);
  const [materiales,  setMateriales] = useState([]);
  const [proveedores, setProveedores] = useState([]);

  const headers = { Authorization: `token ${token}` };
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    axios.get(`${BACKEND_SERVER}/api/foso/materiales/`, { headers })
      .then(r => setMateriales(r.data))
      .catch(() => {});
    axios.get(`${BACKEND_SERVER}/api/foso/proveedores/`, { headers })
      .then(r => setProveedores(r.data))
      .catch(() => {});
  }, []); // eslint-disable-line

  const handleGuardar = async () => {
    if (!form.codigo.trim()) { setError('El código es obligatorio.'); return; }
    setError('');
    setGuardando(true);
    try {
      const payload = {
        codigo:        form.codigo.trim(),
        material:      form.material      || null,
        ref_proveedor: form.ref_proveedor || null,
        ancho_mm:      form.ancho_mm      ? parseFloat(form.ancho_mm)      : null,
        colada:        form.colada        || null,
        proveedor:     form.proveedor     || null,
        observaciones: form.observaciones || null,
        espesor_mm: form.espesor_mm ? parseFloat(form.espesor_mm) : null,
      };
      const bobina = await axios.post(`${BACKEND_SERVER}/api/foso/bobinas/`, payload, { headers });
      await axios.post(
        `${BACKEND_SERVER}/api/foso/ocupaciones/colocar/`,
        { bobina_id: bobina.data.id, posicion_id: posicionId },
        { headers }
      );
      onColocada();
    } catch (e) {
      const errores = {
        'This field must be unique.':'Este código ya existe.',
        'Bobina with this codigo already exists.':'Ya existe una bobina con este código.',
      };

      const msgRaw = e?.response?.data?.codigo?.[0]
                  || e?.response?.data?.detail
                  || 'Error al guardar.';

      const msg = errores[msgRaw] || msgRaw;
      setError(msg);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal title="Nueva bobina" onClose={onClose} width={680}>
      <div className={styles.badge}>Alt. {altura} · Col. {columna}</div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.grid}>

        <Campo label="Código *" full>
          <input value={form.codigo} onChange={set('codigo')} placeholder="Ej: B-015" autoFocus />
        </Campo>

        <Campo label="Material">
          <select value={form.material} onChange={set('material')}>
            <option value="">— Selecciona —</option>
            {materiales.map(m => (
              <option key={m.id} value={m.id}>{m.nombre}</option>
            ))}
          </select>
        </Campo>

        <Campo label="Proveedor">
          <select value={form.proveedor} onChange={set('proveedor')}>
            <option value="">— Selecciona —</option>
            {proveedores.map(p => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
        </Campo>

        <Campo label="Colada">
          <input value={form.colada} onChange={set('colada')} placeholder="C-2024-015" />
        </Campo>

        <Campo label="Ref. proveedor">
          <input value={form.ref_proveedor} onChange={set('ref_proveedor')} placeholder="Ref. del proveedor" />
        </Campo>

        <Campo label="Ancho (mm)">
          <input value={form.ancho_mm} onChange={set('ancho_mm')} type="number" placeholder="1000" />
        </Campo>

        <Campo label="Espesor (mm)">
          <input value={form.espesor_mm} onChange={set('espesor_mm')} type="number" placeholder="2.5" step="0.01" />
        </Campo>

        <Campo label="Observaciones" full>
          <textarea
            value={form.observaciones}
            onChange={set('observaciones')}
            rows={2}
            placeholder="Notas adicionales..."
            style={{ resize: 'vertical' }}
          />
        </Campo>

      </div>

      <div className={styles.actions}>
        <button className={styles.btnCancel} onClick={onClose}>Cancelar</button>
        <button className={styles.btnGuardar} onClick={handleGuardar} disabled={guardando}>
          {guardando ? 'Guardando...' : 'Colocar bobina'}
        </button>
      </div>
    </Modal>
  );
}

function Campo({ label, children, full }) {
  return (
    <div className={styles.campo} style={full ? { gridColumn: 'span 2' } : {}}>
      <label className={styles.campoLbl}>{label}</label>
      {children}
    </div>
  );
}

export default ColocarBobina;