// dashboard/dashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import moment from 'moment';
import { Container, Alert } from 'react-bootstrap';
import { useCookies } from 'react-cookie';

import { BACKEND_SERVER } from '../../constantes';
import DashboardNavBar from './dashboard_navbar';
import DashboardFiltro from './dashboard_filtro';

const Cambios = () => {
    const hoy = moment().format('YYYY-MM-DD');
    const [token] = useCookies(['tec-token']);
    const [user]  = useCookies(['tec-user']);
    const empresaId = user['tec-user'].perfil.empresa.id;
    const [error, setError] = useState(null);

    const [filtro, setFiltro] = useState({
        fecha_desde:    hoy,
        fecha_hasta:    hoy,
        zona_id:        null,
        turno:          null,
        tipo_parada_id: null,
        hora_inicio:    '06:00',
        hora_fin:       '22:00',
    });

    const getHeaders = useCallback(() => ({
        Authorization: `token ${token['tec-token']}`
    }), [token]);

    // ── Ajuste automático de horas al cambiar turno ───────────────────────
    useEffect(() => {
        if (!filtro.turno) {
            setFiltro(prev => ({ ...prev, hora_inicio: '06:00', hora_fin: '22:00' }));
            return;
        }

        if (!filtro.zona_id) {
            if (filtro.turno === 'A') setFiltro(prev => ({ ...prev, hora_inicio: '06:00', hora_fin: '14:00' }));
            if (filtro.turno === 'B') setFiltro(prev => ({ ...prev, hora_inicio: '14:00', hora_fin: '22:00' }));
            if (filtro.turno === 'C') setFiltro(prev => ({ ...prev, hora_inicio: '22:00', hora_fin: '06:00',
                fecha_hasta: moment(filtro.fecha_desde).add(1, 'days').format('YYYY-MM-DD') }));
            return;
        }

        axios.get(`${BACKEND_SERVER}/api/velocidad/horariodia/?zona=${filtro.zona_id}&fecha=${filtro.fecha_desde}`, {
            headers: getHeaders()
        }).then(res => {
            const horario = res.data[0];
            if (!horario) return;

            const inicio  = horario.inicio.substring(0, 5);
            const fin     = horario.fin.substring(0, 5);
            const cambio1 = horario.cambio_turno_1.substring(0, 5);
            const cambio2 = horario.cambio_turno_2?.substring(0, 5);

            if (filtro.turno === 'A') {
                setFiltro(prev => ({ ...prev, hora_inicio: inicio, hora_fin: cambio1 }));
            } else if (filtro.turno === 'B') {
                setFiltro(prev => ({ ...prev, hora_inicio: cambio1, hora_fin: cambio2 || fin }));
            } else if (filtro.turno === 'C' && cambio2) {
                setFiltro(prev => ({
                    ...prev,
                    hora_inicio: cambio2,
                    hora_fin:    fin,
                    fecha_hasta: moment(prev.fecha_desde).add(1, 'days').format('YYYY-MM-DD'),
                }));
            }
        }).catch(() => {
            if (filtro.turno === 'A') setFiltro(prev => ({ ...prev, hora_inicio: '06:00', hora_fin: '14:00' }));
            if (filtro.turno === 'B') setFiltro(prev => ({ ...prev, hora_inicio: '14:00', hora_fin: '22:00' }));
            if (filtro.turno === 'C') setFiltro(prev => ({ ...prev, hora_inicio: '22:00', hora_fin: '06:00',
                fecha_hasta: moment(filtro.fecha_desde).add(1, 'days').format('YYYY-MM-DD') }));
        });
    }, [filtro.turno, filtro.zona_id, filtro.fecha_desde]);

    return (
        <>
            <DashboardNavBar />
            <Container fluid className="px-4">
                <div style={{
                    display: 'inline-block',
                    padding: '8px 20px',
                    border: '2px solid #333',
                    borderRadius: '4px',
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    marginBottom: '16px',
                    background: '#fff',
                }}>
                    CAMBIOS
                </div>
                <DashboardFiltro
                    filtro={filtro}
                    actualizaFiltro={setFiltro}
                    token={token['tec-token']}
                    empresaId={empresaId}
                />
                {error && (
                    <Alert variant="danger" className="mb-3">{error}</Alert>
                )}
            </Container>
        </>
    );
};

export default Cambios;