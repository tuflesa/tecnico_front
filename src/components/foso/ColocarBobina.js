import React, { useState } from 'react';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import Modal from './Modal';
import styles from './ColocarBobina.module.css';

const empty = {
  codigo: '', material: '', peso_kg: '', diametro_mm: '',
  ancho_mm: '', colada: '', proveedor: '', observaciones: '',
};

function ColocarBobina({ posicionId, altura, columna, token, onClose, onColocada }) {
  const [form,      setForm]      = useState(empty);
  const [error,     setError]     = useState('');
  const [guardando, setGuardando] = useState(false);

  const headers = { Authorization: `token ${token}` };
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleGuardar = async () => {
    if (!form.codigo.trim()) { setError('El código es obligatorio.'); return; }
    setError('');
    setGuardando(true);
    try {
      const payload = {
        codigo:        form.codigo.trim(),
        material:      form.material      || undefined,
        peso_kg:       form.peso_kg       ? parseFloat(form.peso_kg)       : undefined,
        diametro_mm:   form.diametro_mm   ? parseFloat(form.diametro_mm)   : undefined,
        ancho_mm:      form.ancho_mm      ? parseFloat(form.ancho_mm)      : undefined,
        colada:        form.colada        || undefined,
        proveedor:     form.proveedor     || undefined,
        observaciones: form.observaciones || undefined,
      };
      const bobina = await axios.post(`${BACKEND_SERVER}/api/foso/bobinas/`, payload, { headers });
      await axios.post(`${BACKEND_SERVER}/api/foso/ocupaciones/colocar/`,
        { bobina_id: bobina.data.id, posicion_id: posicionId },
        { headers }
      );
      onColocada();
    } catch (e) {
      const msg = e?.response?.data?.codigo?.[0]
               || e?.response?.data?.detail
               || 'Error al guardar.';
      setError(msg);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal title="Nueva bobina" onClose={onClose} width={500}>
      <div className={styles.badge}>Alt. {altura} · Col. {columna}</div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.grid}>
        <Campo label="Código *" full>
          <input value={form.codigo} onChange={set('codigo')} placeholder="Ej: B-015" autoFocus />
        </Campo>
        <Campo label="Material">
          <input value={form.material} onChange={set('material')} placeholder="Acero S235" />
        </Campo>
        <Campo label="Colada">
          <input value={form.colada} onChange={set('colada')} placeholder="C-2024-015" />
        </Campo>
        <Campo label="Peso (kg)">
          <input value={form.peso_kg} onChange={set('peso_kg')} type="number" placeholder="2500" />
        </Campo>
        <Campo label="Diámetro (mm)">
          <input value={form.diametro_mm} onChange={set('diametro_mm')} type="number" placeholder="1200" />
        </Campo>
        <Campo label="Ancho (mm)">
          <input value={form.ancho_mm} onChange={set('ancho_mm')} type="number" placeholder="1000" />
        </Campo>
        <Campo label="Proveedor" full>
          <input value={form.proveedor} onChange={set('proveedor')} placeholder="Nombre del proveedor" />
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