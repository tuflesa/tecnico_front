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
import calculo_OEE from '../velocidad/vel_calculo_OEE';

// Traduce nuestro formato de fechas al que espera calculo_OEE
const toFiltroOEE = (fechaDesde, fechaHasta) => ({
    fecha:       fechaDesde,
    fecha_fin:   fechaHasta,
    hora_inicio: '00:00',
    hora_fin:    '23:59',
});

const redondear = v => Math.round(v * 10) / 10;

// ─────────────────────────────────────────────────────────────────────────────
// Componente
// ─────────────────────────────────────────────────────────────────────────────

const DashboardOEE = () => {
    const hoy       = moment().format('YYYY-MM-DD');
    const [token]   = useCookies(['tec-token']);
    const [user]    = useCookies(['tec-user']);
    const empresaId = user['tec-user'].perfil.empresa.id;

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

    const [rawData,    setRawData]    = useState(null);
    const [oeeRango,   setOeeRango]   = useState(null);
    const [oeeMensual, setOeeMensual] = useState(null);
    const [cargando,   setCargando]   = useState(false);
    const [error,      setError]      = useState(null);

    const getHeaders = useCallback(() => ({
        Authorization: `token ${token['tec-token']}`
    }), [token]);

    // ── Fetch datos del backend ───────────────────────────────────────────
    const fetchOEEData = useCallback((f, year) => {
        if (!f.zona_id) {
            setRawData(null);
            setOeeRango(null);
            setOeeMensual(null);
            return;
        }
        setCargando(true);
        setError(null);
        axios.get(`${BACKEND_SERVER}/api/velocidad/dashboard/oee-data/`, {
            params: {
                zona:        f.zona_id,
                fecha_desde: `${year}-01-01`,
                fecha_hasta: `${year}-12-31`,
            },
            headers: getHeaders(),
        })
        .then(res => setRawData(res.data))
        .catch(() => setError('Error al cargar los datos OEE.'))
        .finally(() => setCargando(false));
    }, [getHeaders]);

    // ── Calcular gráficos cuando llegan datos o cambia el filtro ─────────
    useEffect(() => {
        if (!rawData) return;

        // Gráfico 1 — rango seleccionado por el usuario
        const filtroOEE = toFiltroOEE(filtro.fecha_desde, filtro.fecha_hasta);
        const ind       = calculo_OEE(rawData, filtroOEE);

        console.log('ind completo:', ind);
        console.log('ind.OEE:', ind.OEE);

        const turnoA = ind.OEE.turnos.find(t => t.turno === 'A')?.oee ?? 0;
        const turnoB = ind.OEE.turnos.find(t => t.turno === 'B')?.oee ?? 0;

        setOeeRango([
            { nombre: 'OEE Total', valor: redondear(ind.OEE.porcentaje),    color: '#378ADD' },
            { nombre: 'Turno A',   valor: redondear(turnoA * 100),          color: '#2ecc71' },
            { nombre: 'Turno B',   valor: redondear(turnoB * 100),          color: '#e67e22' },
        ]);

        // Gráfico 2 — mes a mes del año
        const meses = [];
        for (let m = 0; m < 12; m++) {
            const inicioMes = moment({ year: anio, month: m }).startOf('month').format('YYYY-MM-DD');
            const finMes    = moment({ year: anio, month: m }).endOf('month').format('YYYY-MM-DD');
            const indMes    = calculo_OEE(rawData, toFiltroOEE(inicioMes, finMes));
            const tA        = indMes.OEE.turnos.find(t => t.turno === 'A')?.oee ?? 0;
            const tB        = indMes.OEE.turnos.find(t => t.turno === 'B')?.oee ?? 0;
            meses.push({
                mes:    moment({ year: anio, month: m }).format('MMM'),
                total:  redondear(indMes.OEE.porcentaje),
                turnoA: redondear(tA * 100),
                turnoB: redondear(tB * 100),
            });
        }
        setOeeMensual(meses);

    }, [rawData, filtro.fecha_desde, filtro.fecha_hasta, anio]);

    // ── Refetch cuando cambia zona o año ─────────────────────────────────
    useEffect(() => {
        fetchOEEData(filtro, anio);
    }, [filtro.zona_id, anio]);

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
                    mostrarTurno={false}
                    mostrarTipoParada={false}
                />

                {error && <Alert variant="danger">{error}</Alert>}

                {!filtro.zona_id && (
                    <p className="text-muted mt-3">Selecciona una zona para ver el OEE.</p>
                )}

                {cargando && (
                    <div className="text-center mt-5">
                        <Spinner animation="border" />
                        <p className="text-muted mt-2">Calculando OEE...</p>
                    </div>
                )}

                {!cargando && filtro.zona_id && (
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
                                                <Tooltip formatter={v => `${v}%`} />
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
                                    {oeeMensual ? (
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
            </Container>
        </>
    );
};

export default DashboardOEE;