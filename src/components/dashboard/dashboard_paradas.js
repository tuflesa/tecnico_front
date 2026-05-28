// dashboard/dashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import moment from 'moment';
import { Container, Row, Col, Alert } from 'react-bootstrap';
import { useCookies } from 'react-cookie';

import { BACKEND_SERVER } from '../../constantes';
import DashboardNavBar      from './dashboard_navbar';
import DashboardFiltro      from './dashboard_filtro';
import DashboardGrafico     from './dashboard_grafico';
import GraficoQuesito       from './dashboard_grafico_quesito';

const Paradas = () => {
    const hoy = moment().format('YYYY-MM-DD');
    const [token] = useCookies(['tec-token']);
    const [user]  = useCookies(['tec-user']);
    const empresaId = user['tec-user'].perfil.empresa.id;
    const [paradasCodigo, setParadasCodigo] = useState(null);
    const [cargandoParadasCodigo, setCargandoParadasCodigo] = useState(false);
    const [paradasPalabraClave, setParadasPalabraClave] = useState(null);
    const [cargandoParadasPalabraClave, setCargandoParadasPalabraClave] = useState(false);

    // ── Filtros ───────────────────────────────────────────────────────────
    const [filtro, setFiltro] = useState({
        fecha_desde:    hoy,
        fecha_hasta:    hoy,
        zona_id:        null,
        turno:          null,
        tipo_parada_id: null,
        hora_inicio:    '06:00',
        hora_fin:       '22:00',
    });

    useEffect(() => {
        if (!filtro.turno) {
            setFiltro(prev => ({ ...prev, hora_inicio: '06:00', hora_fin: '22:00' }));
            return;
        }

        // Sin zona concreta: usar valores por defecto
        if (!filtro.zona_id) {
            if (filtro.turno === 'A') setFiltro(prev => ({ ...prev, hora_inicio: '06:00', hora_fin: '14:00' }));
            if (filtro.turno === 'B') setFiltro(prev => ({ ...prev, hora_inicio: '14:00', hora_fin: '22:00' }));
            if (filtro.turno === 'C') setFiltro(prev => ({ ...prev, hora_inicio: '22:00', hora_fin: '06:00',
                fecha_hasta: moment(filtro.fecha_desde).add(1, 'days').format('YYYY-MM-DD') }));
            return;
        }

        // Con zona concreta: consultar HorarioDia
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

    // ── Estado ────────────────────────────────────────────────────────────
    const [paradasTipo, setParadasTipo] = useState(null);
    const [error,       setError]       = useState(null);

    const [cargandoParadasTipo, setCargandoParadasTipo] = useState(false);

    // ── Helpers ───────────────────────────────────────────────────────────
    const getHeaders = useCallback(() => ({
        Authorization: `token ${token['tec-token']}`
    }), [token]);

    const buildParams = useCallback((f = filtro) => {
        const params = new URLSearchParams({
            fecha_desde: f.fecha_desde,
            fecha_hasta: f.fecha_hasta,
            hora_inicio: f.hora_inicio,
            hora_fin:    f.hora_fin,
        });
        if (f.zona_id)        params.append('zona',        f.zona_id);
        if (f.turno)          params.append('turno',       f.turno);
        if (f.tipo_parada_id) params.append('tipo_parada', f.tipo_parada_id);
        return params.toString();
    }, [filtro]);

    // ── Fetch Paradas por tipo ────────────────────────────────────────────
    const fetchParadasTipo = useCallback((f = filtro) => {
        setCargandoParadasTipo(true);
        axios.get(
            `${BACKEND_SERVER}/api/velocidad/dashboard/paradas-por-tipo/?${buildParams(f)}`,
            { headers: getHeaders() }
        )
            .then(res => { setParadasTipo(res.data); setError(null); })
            .catch(() => setError('Error al cargar las paradas por tipo.'))
            .finally(() => setCargandoParadasTipo(false));
    }, [buildParams, getHeaders]);

    // ── Fetch paradas código ──────────────────────────────────────────────
    const fetchParadasCodigo = useCallback((f = filtro) => {
        setCargandoParadasCodigo(true);
        axios.get(
            `${BACKEND_SERVER}/api/velocidad/dashboard/paradas-por-codigo/?${buildParams(f)}`,
            { headers: getHeaders() }
        )
            .then(res => setParadasCodigo(res.data))
            .catch(() => {})
            .finally(() => setCargandoParadasCodigo(false));
    }, [buildParams, getHeaders]);

    // ── Fetch paradas por palabras clave ──────────────────────────────────
    const fetchParadasPalabraClave = useCallback((f = filtro) => {
        setCargandoParadasPalabraClave(true);
        axios.get(
            `${BACKEND_SERVER}/api/velocidad/dashboard/paradas-por-palabraclave/?${buildParams(f)}`,
            { headers: getHeaders() }
        )
            .then(res => setParadasPalabraClave(res.data))
            .catch(() => {})
            .finally(() => setCargandoParadasPalabraClave(false));
    }, [buildParams, getHeaders]);

    // ── Fetch todo ────────────────────────────────────────────────────────
    const fetchTodo = useCallback((f = filtro) => {
        fetchParadasTipo(f);
        fetchParadasCodigo(f);
        fetchParadasPalabraClave(f);
    }, [fetchParadasTipo, fetchParadasCodigo, fetchParadasPalabraClave]);

    useEffect(() => {
        fetchTodo(filtro);
    }, [filtro]);

    // ── Render ────────────────────────────────────────────────────────────
    return (
        <>
            <DashboardNavBar />
            <Container fluid className="px-4">
                <DashboardFiltro
                    filtro={filtro}
                    actualizaFiltro={setFiltro}
                    token={token['tec-token']}
                    empresaId={empresaId}
                />

                {error && (
                    <Alert variant="danger" className="mb-3">{error}</Alert>
                )}

                <Row>
                    <Col xs={12} md={6}>
                        <DashboardGrafico
                            titulo="⏱ Tiempo parado por tipo"
                            datos={paradasTipo}
                            campoX="minutos"
                            campoY="tipo_nombre"
                            colorCampo="color"
                            etiquetaX="min"
                            cargando={cargandoParadasTipo}
                        />
                    </Col>
                    <Col xs={12} md={6}>
                        <DashboardGrafico
                            titulo="🛑 Nº paradas por palabra clave"
                            datos={paradasPalabraClave}
                            campoX="num_eventos"
                            campoY="pc_nombre"
                            colorCampo="color"
                            etiquetaX="paradas"
                            cargando={cargandoParadasPalabraClave}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12} md={4}>
                        <GraficoQuesito
                            titulo="🛑 Nº paradas por tipo"
                            datos={paradasTipo}
                            campoValor="num_eventos"
                            campoNombre="tipo_nombre"
                            colorCampo="color"
                            etiqueta="paradas"
                            cargando={cargandoParadasTipo}
                        />
                    </Col>
                    <Col xs={12} md={8}>
                        <DashboardGrafico
                            titulo="⏱ Tiempo parado por código"
                            datos={paradasCodigo}
                            campoX="minutos"
                            campoY="codigo_nombre"
                            colorCampo="color"
                            etiquetaX="min"
                            cargando={cargandoParadasCodigo}
                        />
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default Paradas;