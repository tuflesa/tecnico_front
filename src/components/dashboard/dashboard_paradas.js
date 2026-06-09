// dashboard/dashboard_paradas.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import moment from 'moment';
import { Container, Row, Col, Spinner, Card, Alert, Button } from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

import { BACKEND_SERVER } from '../../constantes';
import DashboardNavBar from './dashboard_navbar';
import DashboardFiltro from './dashboard_filtro';

// ── Colores ────────────────────────────────────────────────────────────────
const C = { total: '#378ADD', turnoA: '#2ecc71', turnoB: '#e67e22' };
const TOP_N = 10;
const ALTURA_ITEM = 36;

// ── Formato ────────────────────────────────────────────────────────────────
const fmtHHMM = min => {
    if (min == null) return '—';
    const h = Math.floor(min / 60);
    const m = Math.round(min % 60);
    return `${h}h ${m.toString().padStart(2, '0')}min`;
};
//const tickHHMM = min => `${Math.floor(min / 60)}h`;
const tickHHMM = min => {
    const h = Math.floor(min / 60);
    const m = Math.round(min % 60);
    if (h === 0) return `${m}min`;
    if (m === 0) return `${h}h`;
    return `${h}h${m}`;
};

// ── Tooltip ────────────────────────────────────────────────────────────────
const TooltipParadas = ({ active, payload, label }) => {
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

// ── Gráfico horizontal genérico ────────────────────────────────────────────
// Sirve tanto para palabras clave (dataKey="palabra_clave")
// como para códigos (dataKey="codigo"), con o sin scroll.
const GraficoHorizontal = ({ titulo, datos, campoY, cargando, scrollable = false }) => {
    const [verTodos, setVerTodos] = useState(false);
    // Resetear "ver todos" si cambian los datos
    useEffect(() => { setVerTodos(false); }, [datos]);

    if (cargando) {
        return (
            <Card className="shadow-sm h-100">
                <Card.Body>
                    <Card.Title className="fs-6 text-muted mb-3">{titulo}</Card.Title>
                    <Spinner animation="border" size="sm" />
                </Card.Body>
            </Card>
        );
    }

    if (!datos || datos.length === 0) {
        return (
            <Card className="shadow-sm h-100">
                <Card.Body>
                    <Card.Title className="fs-6 text-muted mb-3">{titulo}</Card.Title>
                    <p className="text-muted small">Sin datos en el período seleccionado.</p>
                </Card.Body>
            </Card>
        );
    }

    const hayMas    = scrollable && datos.length > TOP_N;
    const datosMostrados = scrollable && !verTodos ? datos.slice(0, TOP_N) : datos;
    const altura    = Math.max(220, datosMostrados.length * ALTURA_ITEM);
    const maxScroll = scrollable && verTodos ? 520 : null; // px máximo con scroll

    return (
        <Card className="shadow-sm h-100">
            <Card.Body className="d-flex flex-column">
                <Card.Title className="fs-6 text-muted mb-3 d-flex justify-content-between align-items-center">
                    <span>{titulo}</span>
                    {hayMas && (
                        <Button
                            variant="link"
                            size="sm"
                            className="p-0 text-decoration-none"
                            onClick={() => setVerTodos(v => !v)}
                        >
                            {verTodos
                                ? `▲ Mostrar top ${TOP_N}`
                                : `▼ Ver todos (${datos.length})`}
                        </Button>
                    )}
                </Card.Title>

                <div
                    style={{
                        overflowY: verTodos ? 'auto' : 'visible',
                        maxHeight:  maxScroll,
                        flexGrow:   1,
                    }}
                >
                    <ResponsiveContainer width="100%" height={altura}>
                        <BarChart
                            data={datosMostrados}
                            layout="vertical"
                            margin={{ top: 4, right: 24, left: 8, bottom: 4 }}
                            barCategoryGap="25%"
                            barGap={2}
                        >
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis
                                type="number"
                                tick={{ fontSize: 11 }}
                                tickFormatter={tickHHMM}
                            />
                            <YAxis
                                type="category"
                                dataKey={campoY}
                                tick={{ fontSize: 11 }}
                                width={120}
                            />
                            <Tooltip content={<TooltipParadas />} />
                            <Legend />
                            <Bar dataKey="total"   name="Total"   fill={C.total}  fillOpacity={0.85} radius={[0,3,3,0]} maxBarSize={18} />
                            <Bar dataKey="turno_a" name="Turno A" fill={C.turnoA} fillOpacity={0.85} radius={[0,3,3,0]} maxBarSize={18} />
                            <Bar dataKey="turno_b" name="Turno B" fill={C.turnoB} fillOpacity={0.85} radius={[0,3,3,0]} maxBarSize={18} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card.Body>
        </Card>
    );
};

// ── Componente principal ───────────────────────────────────────────────────
const DashboardParadas = () => {
    const hoy     = moment().format('YYYY-MM-DD');
    const [token] = useCookies(['tec-token']);
    const [user]  = useCookies(['tec-user']);
    const empresaId = user['tec-user'].perfil.empresa.id;

    const [filtro, setFiltro] = useState({
        fecha_desde: hoy,
        fecha_hasta: hoy,
        zona_id:     null,
    });

    const [loadingPC,     setLoadingPC]     = useState(false);
    const [loadingCodigo, setLoadingCodigo] = useState(false);
    const [showLoader,    setShowLoader]    = useState(false);
    const isLoading = loadingPC || loadingCodigo;

    const [rawPC,     setRawPC]     = useState(null);
    const [rawCodigo, setRawCodigo] = useState(null);
    const [error,     setError]     = useState(null);

    const getHeaders = useCallback(() => ({
        Authorization: `token ${token['tec-token']}`
    }), [token]);

    // Spinner con retardo 300 ms
    useEffect(() => {
        if (isLoading) { setShowLoader(true); return; }
        const t = setTimeout(() => setShowLoader(false), 300);
        return () => clearTimeout(t);
    }, [isLoading]);

    // Fetch palabras clave
    useEffect(() => {
        if (!filtro.zona_id || !filtro.fecha_desde || !filtro.fecha_hasta) return;
        let activo = true;
        setLoadingPC(true);
        setError(null);
        axios.get(`${BACKEND_SERVER}/api/velocidad/dashboard/paradas/palabraclave/`, {
            params: {
                zona_id:     filtro.zona_id,
                fecha_desde: filtro.fecha_desde,
                fecha_hasta: filtro.fecha_hasta,
            },
            headers: getHeaders(),
        })
        .then(res  => { if (activo) setRawPC(res.data); })
        .catch(err => { if (activo && err.response?.status !== 400) setError('Error al cargar datos de paradas.'); })
        .finally(()=> { if (activo) setLoadingPC(false); });
        return () => { activo = false; };
    }, [filtro.zona_id, filtro.fecha_desde, filtro.fecha_hasta]);

    // Fetch por código
    useEffect(() => {
        if (!filtro.zona_id || !filtro.fecha_desde || !filtro.fecha_hasta) return;
        let activo = true;
        setLoadingCodigo(true);
        axios.get(`${BACKEND_SERVER}/api/velocidad/dashboard/paradas/codigo/`, {
            params: {
                zona_id:     filtro.zona_id,
                fecha_desde: filtro.fecha_desde,
                fecha_hasta: filtro.fecha_hasta,
            },
            headers: getHeaders(),
        })
        .then(res  => { if (activo) setRawCodigo(res.data); })
        .catch(err => { if (activo && err.response?.status !== 400) setError('Error al cargar datos por código.'); })
        .finally(()=> { if (activo) setLoadingCodigo(false); });
        return () => { activo = false; };
    }, [filtro.zona_id, filtro.fecha_desde, filtro.fecha_hasta]);

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
                        <p className="text-muted mt-3">Selecciona una zona para ver las paradas.</p>
                    )}

                    {filtro.zona_id && (
                        <>
                            {/* ── Fila 1: por palabra clave ── */}
                            <Row className="mt-3 gy-3">
                                <Col xs={12} md={6}>
                                    <GraficoHorizontal
                                        titulo="Incidencias por palabra clave"
                                        datos={rawPC?.incidencia}
                                        campoY="palabra_clave"
                                        cargando={loadingPC}
                                        scrollable={false}
                                    />
                                </Col>
                                <Col xs={12} md={6}>
                                    <GraficoHorizontal
                                        titulo="Averías por palabra clave"
                                        datos={rawPC?.averia}
                                        campoY="palabra_clave"
                                        cargando={loadingPC}
                                        scrollable={false}
                                    />
                                </Col>
                            </Row>

                            {/* ── Fila 2: por código ── */}
                            <Row className="mt-3 gy-3">
                                <Col xs={12} md={6}>
                                    <GraficoHorizontal
                                        titulo="Incidencias por código"
                                        datos={rawCodigo?.incidencia}
                                        campoY="codigo"
                                        cargando={loadingCodigo}
                                        scrollable={true}
                                    />
                                </Col>
                                <Col xs={12} md={6}>
                                    <GraficoHorizontal
                                        titulo="Averías por código"
                                        datos={rawCodigo?.averia}
                                        campoY="codigo"
                                        cargando={loadingCodigo}
                                        scrollable={true}
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

export default DashboardParadas;