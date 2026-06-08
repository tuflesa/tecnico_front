// dashboard/dashboard_cambios.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import moment from 'moment';
import { Container, Row, Col, Spinner, Card, Alert } from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend, Cell
} from 'recharts';

import { BACKEND_SERVER } from '../../constantes';
import DashboardNavBar from './dashboard_navbar';
import DashboardFiltro from './dashboard_filtro';

const C = { total: '#378ADD', turnoA: '#2ecc71', turnoB: '#e67e22' };

const fmtHHMM   = min => {
    if (min == null) return '—';
    const h = Math.floor(min / 60);
    const m = Math.round(min % 60);
    return `${h}h ${m.toString().padStart(2, '0')}min`;
};
const tickHHMM  = min => `${Math.floor(min / 60)}h`;

const TooltipCambios = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border rounded p-2 shadow-sm small">
            <div className="fw-semibold mb-1">{label}</div>
            {payload.map((p, i) => (
                <div key={i} style={{ color: p.color }}>
                    {p.name}: {fmtHHMM(p.value)}
                </div>
            ))}
        </div>
    );
};

// ── Gráfico rango: barras agrupadas de 3 en 3 (CG y CP) ───────────────────
const GraficoRango = ({ titulo, datos, cargando, unidad = 'h' }) => (
    <Card className="shadow-sm h-100">
        <Card.Body>
            <Card.Title className="fs-6 text-muted mb-3">{titulo}</Card.Title>
            {cargando && <Spinner animation="border" size="sm" />}
            {!cargando && (!datos || datos.length === 0) && (
                <p className="text-muted small">Sin datos en el período seleccionado.</p>
            )}
            {!cargando && datos?.length > 0 && (
                <ResponsiveContainer width="100%" height={220}>
                    <BarChart
                        data={datos}
                        margin={{ top: 8, right: 20, left: 0, bottom: 4 }}
                        barCategoryGap="30%"/* espacio ENTRE grupos CG/CP */
                        barGap={2} /* espacio entre barras del mismo grupo */
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="grupo" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 11 }} tickFormatter={tickHHMM} />
                        <Tooltip content={
                            <TooltipCambios  unidad={unidad} />
                        } />
                        <Legend />
                        <Bar dataKey="total"  name="Total"   fill={C.total}  fillOpacity={0.85} radius={[3,3,0,0]} maxBarSize={50} />
                        <Bar dataKey="turnoA" name="Turno A" fill={C.turnoA} fillOpacity={0.85} radius={[3,3,0,0]} maxBarSize={50} />
                        <Bar dataKey="turnoB" name="Turno B" fill={C.turnoB} fillOpacity={0.85} radius={[3,3,0,0]} maxBarSize={50} />
                    </BarChart>
                </ResponsiveContainer>
            )}
        </Card.Body>
    </Card>
);

// ── Gráfico anual ──────────────────────────────────────────────────────────
const GraficoAnual = ({ titulo, datos, cargando, anio, setAnio }) => (
    <Card className="shadow-sm h-100">
        <Card.Body>
            <Card.Title className="fs-6 text-muted mb-3 d-flex justify-content-between align-items-center">
                <span>{titulo}</span>
                <span className="d-flex align-items-center gap-2">
                    <span style={{ cursor: 'pointer', color: '#c0392b', fontSize: '1.2rem' }}
                          onClick={() => setAnio(a => a - 1)}>◀</span>
                    <strong style={{ color: '#c0392b', fontSize: '1.1rem' }}>{anio}</strong>
                    <span style={{ cursor: 'pointer', color: '#c0392b', fontSize: '1.2rem',
                                   opacity: anio >= moment().year() ? 0.3 : 1 }}
                          onClick={() => setAnio(a => Math.min(a + 1, moment().year()))}>▶</span>
                </span>
            </Card.Title>
            {cargando && <Spinner animation="border" size="sm" />}
            {!cargando && (!datos || datos.length === 0) && (
                <p className="text-muted small">Sin datos.</p>
            )}
            {!cargando && datos?.length > 0 && (
                <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={datos} margin={{ top: 8, right: 20, left: 0, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} tickFormatter={tickHHMM} />
                        <Tooltip content={<TooltipCambios  />} />
                        <Legend />
                        <Bar dataKey="total"  name="Total"   fill={C.total}  fillOpacity={0.85} radius={[3,3,0,0]} maxBarSize={18} />
                        <Bar dataKey="turnoA" name="Turno A" fill={C.turnoA} fillOpacity={0.85} radius={[3,3,0,0]} maxBarSize={18} />
                        <Bar dataKey="turnoB" name="Turno B" fill={C.turnoB} fillOpacity={0.85} radius={[3,3,0,0]} maxBarSize={18} />
                    </BarChart>
                </ResponsiveContainer>
            )}
        </Card.Body>
    </Card>
);

// Gráficos 1 y 2: 2 grupos (CG / CP), cada uno con total/turnoA/turnoB
const _barrasRango = (raw, modoClave, enHoras = true) => {
    if (!raw?.length) return null;
    const d = raw[0][modoClave];
    //const conv = enHoras ? minToH : fmtMin;
    return [
        {
            grupo:  'Cambio General',
            total:  d.cg_total,
            turnoA: d.cg_turno_a,
            turnoB: d.cg_turno_b,
        },
        {
            grupo:  'Cambio Parcial',
            total:  d.cp_total,
            turnoA: d.cp_turno_a,
            turnoB: d.cp_turno_b,
        },
    ];
};

// Gráficos 3 y 4: serie mensual en horas
const _serieAnual = (raw, tipoClave) => {
    if (!raw?.length) return [];
    return raw.map(d => ({
        mes:    moment(d.mes, 'YYYY-MM').format('MMM'),
        total:  d.media[`${tipoClave}_total`],
        turnoA: d.media[`${tipoClave}_turno_a`],
        turnoB: d.media[`${tipoClave}_turno_b`],
    }));
};

// ── Componente principal ───────────────────────────────────────────────────
const DashboardCambios = () => {
    const hoy       = moment().format('YYYY-MM-DD');
    const [token]   = useCookies(['tec-token']);
    const [user]    = useCookies(['tec-user']);
    const empresaId = user['tec-user'].perfil.empresa.id;

    const [anio, setAnio] = useState(moment().year());

    const [filtro, setFiltro] = useState({
        fecha_desde: hoy,
        fecha_hasta: hoy,
        zona_id:     null,
    });

    const [loadingRango, setLoadingRango] = useState(false);
    const [loadingAnual, setLoadingAnual] = useState(false);
    const [showLoader,   setShowLoader]   = useState(false);
    const isLoading = loadingRango || loadingAnual;

    const [rawRango, setRawRango] = useState(null);
    const [rawAnual, setRawAnual] = useState(null);
    const [error,    setError]    = useState(null);

    const getHeaders = useCallback(() => ({
        Authorization: `token ${token['tec-token']}`
    }), [token]);

    useEffect(() => {
        if (isLoading) { setShowLoader(true); return; }
        const t = setTimeout(() => setShowLoader(false), 300);
        return () => clearTimeout(t);
    }, [isLoading]);

    useEffect(() => {
        if (!filtro.zona_id || !filtro.fecha_desde || !filtro.fecha_hasta) return;
        let activo = true;
        setLoadingRango(true);
        setError(null);
        axios.get(`${BACKEND_SERVER}/api/velocidad/dashboard/cambios/rango/`, {
            params: {
                zona_id:     filtro.zona_id,
                fecha_desde: filtro.fecha_desde,
                fecha_hasta: filtro.fecha_hasta,
                agrupar:     'rango',
            },
            headers: getHeaders(),
        })
        .then(res  => { if (activo) setRawRango(res.data); })
        .catch(err => { if (activo && err.response?.status !== 400) setError('Error al cargar datos de rango.'); })
        .finally(()=> { if (activo) setLoadingRango(false); });
        return () => { activo = false; };
    }, [filtro.zona_id, filtro.fecha_desde, filtro.fecha_hasta]);

    useEffect(() => {
        if (!filtro.zona_id) return;
        let activo = true;
        setLoadingAnual(true);
        axios.get(`${BACKEND_SERVER}/api/velocidad/dashboard/cambios/anual/`, {
            params: { zona_id: filtro.zona_id, anio },
            headers: getHeaders(),
        })
        .then(res  => { if (activo) setRawAnual(res.data); })
        .catch(err => { if (activo && err.response?.status !== 400) setError('Error al cargar datos anuales.'); })
        .finally(()=> { if (activo) setLoadingAnual(false); });
        return () => { activo = false; };
    }, [filtro.zona_id, anio]);

    // ── Datos derivados ───────────────────────────────────────────────────
    const dataSuma  = _barrasRango(rawRango, 'suma');   // horas
    const dataMedia = _barrasRango(rawRango, 'media');  // horas
    const dataAnualCG = _serieAnual(rawAnual, 'cg');
    const dataAnualCP = _serieAnual(rawAnual, 'cp');

    return (
        <>
            <DashboardNavBar />
            <Container fluid className="px-4">
                <div className="position-relative">

                    {showLoader && (
                        <div className="dashboard-loading-overlay">
                            <div className="text-center">
                                <Spinner animation="border" variant="primary" />
                                <div className="mt-2 text-muted">Cargando datos...</div>
                            </div>
                        </div>
                    )}

                    <DashboardFiltro
                        filtro={filtro}
                        actualizaFiltro={setFiltro}
                        token={token['tec-token']}
                        empresaId={empresaId}
                        mostrarTurno={false}
                        mostrarTipoParada={false}
                    />

                    {error && <Alert variant="danger">{error}</Alert>}

                    {!filtro.zona_id && (
                        <p className="text-muted mt-3">Selecciona una zona para ver los cambios.</p>
                    )}

                    {filtro.zona_id && (
                        <>
                            {/* ── Fila 1: Suma (40%) + CG Anual (60%) ── */}
                            <Row className="mt-3 gy-3">
                                <Col xs={12} md={5}>
                                    <GraficoRango
                                        titulo="Suma de tiempos — Cambio General / Cambio Parcial"
                                        datos={dataSuma}
                                        cargando={loadingRango}
                                        unidad="h"
                                    />
                                </Col>
                                <Col xs={12} md={7}>
                                    <GraficoAnual
                                        titulo="Cambio General mensual — Total media / Turno A / Turno B"
                                        datos={dataAnualCG}
                                        cargando={loadingAnual}
                                        anio={anio}
                                        setAnio={setAnio}
                                    />
                                </Col>
                            </Row>

                            {/* ── Fila 2: Media (40%) + CP Anual (60%) ── */}
                            <Row className="mt-3 gy-3">
                                <Col xs={12} md={5}>
                                    <GraficoRango
                                        titulo="Media de tiempos — Cambio General / Cambio Parcial"
                                        datos={dataMedia}
                                        cargando={loadingRango}
                                        unidad="h"
                                    />
                                </Col>
                                <Col xs={12} md={7}>
                                    <GraficoAnual
                                        titulo="Cambio Parcial mensual — Total media / Turno A / Turno B"
                                        datos={dataAnualCP}
                                        cargando={loadingAnual}
                                        anio={anio}
                                        setAnio={setAnio}
                                    />
                                </Col>
                            </Row>
                        </>
                    )}
                </div>
            </Container>
        </>
    );
};

export default DashboardCambios;