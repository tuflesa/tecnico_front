// dashboard/dashboard_OEE.js
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

const DashboardOEE = () => {
    const hoy       = moment().format('YYYY-MM-DD');
    const [token]   = useCookies(['tec-token']);
    const [user]    = useCookies(['tec-user']);
    const empresaId = user['tec-user'].perfil.empresa.id;

    
    const [loadingRango, setLoadingRango] = useState(false);
    const [loadingMes, setLoadingMes] = useState(false);
    const isLoading = loadingRango || loadingMes;
    const [showLoader, setShowLoader] = useState(false);

    const [anio, setAnio] = useState(moment().year());

    const [filtro, setFiltro] = useState({
        fecha_desde:    moment().startOf('year').format('YYYY-MM-DD'),
        fecha_hasta:    hoy,
        zona_id:        null,
        turno:          null,
        tipo_parada_id: null,
        hora_inicio:    '06:00',
        hora_fin:       '22:00',
    });

    const [rawDataRango, setRawDataRango] = useState(null);  // ← gráfico rango
    const [rawDataMes,   setRawDataMes]   = useState(null);  // ← gráfico mensual
    const [oeeRango,     setOeeRango]     = useState(null);
    const [oeeMensual,   setOeeMensual]   = useState(null);
    const [error,        setError]        = useState(null);

    const getHeaders = useCallback(() => ({
        Authorization: `token ${token['tec-token']}`
    }), [token]);

        
    useEffect(() => {
        if (isLoading) {
            setShowLoader(true);
        } else {
            const timeout = setTimeout(() => setShowLoader(false), 300);
            return () => clearTimeout(timeout);
        }
    }, [isLoading]);


    // ── Llamada 1: gráfico de rango ───────────────────────────────────────
    useEffect(() => {
        if (!filtro.zona_id || !filtro.fecha_desde || !filtro.fecha_hasta) return;
        let activo = true;
        setLoadingRango(true);
        axios.get(`${BACKEND_SERVER}/api/velocidad/dashboard/oee/`, {
            params: {
                zona_id:     filtro.zona_id,
                fecha_desde: filtro.fecha_desde,
                fecha_hasta: filtro.fecha_hasta,
                agrupar:     'rango',
            },
            headers: getHeaders(),
        })
        .then(res => { 
            if (activo) setRawDataRango(res.data); 
        })
        .catch(err => { if (err.response?.status !== 400) console.error(err); 
        })
        .finally(() => {
            if (activo) setLoadingRango(false);
        });
        return () => { activo = false; };
    }, [filtro.zona_id, filtro.fecha_desde, filtro.fecha_hasta]);

    // ── Llamada 2: gráfico mensual ────────────────────────────────────────
    useEffect(() => {
        if (!filtro.zona_id || !anio) return;
        let activo = true;
        setLoadingMes(true);
        axios.get(`${BACKEND_SERVER}/api/velocidad/dashboard/oee/`, {
            params: {
                zona_id:     filtro.zona_id,
                fecha_desde: `${anio}-01-01`,
                fecha_hasta: `${anio}-12-31`,
                agrupar:     'mes',
            },
            headers: getHeaders(),
        })
        .then(res => { 
            if (activo) setRawDataMes(res.data); 
        })
        .catch(err => { if (err.response?.status !== 400) console.error(err); 

        })            
        .finally(() => {
            if (activo) setLoadingMes(false);
        });

        return () => { activo = false; };
    }, [filtro.zona_id, anio]);

    // ── Calcular gráfico rango ────────────────────────────────────────────
    useEffect(() => {
        if (!rawDataRango || rawDataRango.length === 0) { setOeeRango(null); return; }
        const d = rawDataRango[0];
        setOeeRango([
            { nombre: 'Total',   valor: d.total?.oee     || 0, color: '#378ADD' },
            { nombre: 'Turno A', valor: d.turnos?.A?.oee || 0, color: '#2ecc71' },
            { nombre: 'Turno B', valor: d.turnos?.B?.oee || 0, color: '#e67e22' },
        ]);
    }, [rawDataRango]);

    // ── Calcular gráfico mensual ──────────────────────────────────────────
    useEffect(() => {
        if (!rawDataMes) { setOeeMensual([]); return; }
        setOeeMensual(rawDataMes.map(d => ({
            mes:    moment(d.periodo, 'YYYY-MM').format('MMM'),
            total:  d.total?.oee     || 0,
            turnoA: d.turnos?.A?.oee || 0,
            turnoB: d.turnos?.B?.oee || 0,
        })));
    }, [rawDataMes]);

    // ── Render ────────────────────────────────────────────────────────────
    return (
        <>
            <DashboardNavBar />
            <Container fluid className="px-4">
                
                <div className="position-relative">

                    {showLoader  && (
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
                        <p className="text-muted mt-3">Selecciona una zona para ver el OEE.</p>
                    )}

                    {filtro.zona_id && (
                        <Row className="mt-3 gy-3">

                            {/* Gráfico 1 — OEE del rango */}
                            <Col xs={12} md={4}>
                                <Card className="shadow-sm h-100">
                                    <Card.Body>
                                        <Card.Title className="mb-3">
                                            OEE del período seleccionado
                                        </Card.Title>
                                        {oeeRango ? (
                                            <ResponsiveContainer width="100%" height={220}>
                                                <BarChart data={oeeRango} margin={{ top: 8, right: 30, left: 0, bottom: 4 }}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                    <XAxis dataKey="nombre" tick={{ fontSize: 12 }} />
                                                    <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
                                                    <Tooltip formatter={v => `${v.toFixed(2)}%`} />
                                                    <Bar dataKey="valor" radius={[4, 4, 0, 0]} maxBarSize={60}>
                                                        {oeeRango.map((entry, i) => (
                                                            <Cell key={i} fill={entry.color} fillOpacity={0.85} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <p className="text-muted small">Sin datos.</p>
                                        )}
                                    </Card.Body>
                                </Card>
                            </Col>

                            {/* Gráfico 2 — OEE mensual */}
                            <Col xs={12} md={8}>
                                <Card className="shadow-sm h-100">
                                    <Card.Body>
                                        <Card.Title className="mb-3 d-flex justify-content-between align-items-center">
                                            <span>OEE mensual — Total / Turno A / Turno B</span>
                                            <span className="d-flex align-items-center gap-2">
                                                <span
                                                    style={{ cursor: 'pointer', color: '#c0392b', fontSize: '1.2rem' }}
                                                    onClick={() => setAnio(a => a - 1)}
                                                >
                                                    ◀
                                                </span>
                                                <strong style={{ color: '#c0392b', fontSize: '1.1rem' }}>{anio}</strong>
                                                <span
                                                    style={{ cursor: 'pointer', color: '#c0392b', fontSize: '1.2rem', opacity: anio >= moment().year() ? 0.3 : 1 }}
                                                    onClick={() => setAnio(a => Math.min(a + 1, moment().year()))}
                                                >
                                                    ▶
                                                </span>
                                            </span>
                                        </Card.Title>
                                        {oeeMensual && oeeMensual.length > 0 ? (
                                            <ResponsiveContainer width="100%" height={220}>
                                                <BarChart data={oeeMensual} margin={{ top: 8, right: 20, left: 0, bottom: 4 }}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                    <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                                                    <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
                                                    <Tooltip formatter={v => `${v}%`} />
                                                    <Legend />
                                                    <Bar dataKey="total"  name="Total"   fill="#378ADD" fillOpacity={0.85} radius={[3,3,0,0]} maxBarSize={18} />
                                                    <Bar dataKey="turnoA" name="Turno A" fill="#2ecc71" fillOpacity={0.85} radius={[3,3,0,0]} maxBarSize={18} />
                                                    <Bar dataKey="turnoB" name="Turno B" fill="#e67e22" fillOpacity={0.85} radius={[3,3,0,0]} maxBarSize={18} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <p className="text-muted small">Sin datos.</p>
                                        )}
                                    </Card.Body>
                                </Card>
                            </Col>

                        </Row>
                    )}
                </div>
            </Container>
        </>
    );
};

export default DashboardOEE;