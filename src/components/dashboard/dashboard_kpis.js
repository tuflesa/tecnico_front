// dashboard/dashboard_kpis.js
import React from 'react';
import { Row, Col, Card, Spinner } from 'react-bootstrap';

const Delta = ({ valor, invertido = false }) => {
    if (valor === null || valor === undefined) return null;
    const positivo = invertido ? valor < 0 : valor > 0;
    const clase = positivo ? 'text-success' : 'text-danger';
    const flecha = valor > 0 ? '↑' : '↓';
    return (
        <span className={`small ${clase}`}>
            {flecha} {Math.abs(valor)}% vs período anterior
        </span>
    );
};

const KPICard = ({ titulo, valor, unidad, delta, invertido, cargando, icono }) => (
    <Card className="h-100 shadow-sm">
        <Card.Body>
            <div className="text-muted small mb-1">{icono} {titulo}</div>
            {cargando
                ? <Spinner animation="border" size="sm" />
                : <>
                    <div className="fs-3 fw-semibold">
                        {valor ?? '—'}
                        {unidad && <span className="fs-6 text-muted ms-1">{unidad}</span>}
                    </div>
                    <Delta valor={delta} invertido={invertido} />
                </>
            }
        </Card.Body>
    </Card>
);

const DashboardKPIs = ({ kpis, cargando, tieneZona }) => {
    return (
        <>
            {/* Fila de KPIs */}
            <Row className="gy-3 mb-3">
                <Col xs={6} md={2}>
                    <KPICard
                        titulo="Velocidad media"
                        icono="⚡"
                        valor={kpis?.velocidad_media}
                        unidad="m/min"
                        delta={kpis?.delta_velocidad}
                        invertido={false}
                        cargando={cargando}
                    />
                </Col>
                <Col xs={6} md={2}>
                    <KPICard
                        titulo="Tiempo parado"
                        icono="⏸"
                        valor={kpis?.tiempo_parado_min !== undefined
                            ? `${Math.floor(kpis.tiempo_parado_min / 60)}h ${Math.round(kpis.tiempo_parado_min % 60)}m`
                            : null}
                        delta={kpis?.delta_tiempo_parado}
                        invertido={true}
                        cargando={cargando}
                    />
                </Col>
                <Col xs={6} md={2}>
                    <KPICard
                        titulo="Nº paradas"
                        icono="🛑"
                        valor={kpis?.num_paradas}
                        delta={kpis?.delta_paradas}
                        invertido={true}
                        cargando={cargando}
                    />
                </Col>

                {tieneZona ? (
                    <>
                        <Col xs={6} md={2}>
                            <KPICard
                                titulo="Disponibilidad"
                                icono="🏭"
                                valor={kpis?.disponibilidad}
                                unidad="%"
                                cargando={cargando}
                            />
                        </Col>
                        <Col xs={6} md={2}>
                            <KPICard
                                titulo="Rendimiento"
                                icono="📈"
                                valor={kpis?.rendimiento}
                                unidad="%"
                                cargando={cargando}
                            />
                        </Col>
                        <Col xs={6} md={2}>
                            <KPICard
                                titulo="Calidad"
                                icono="✅"
                                valor={kpis?.calidad}
                                unidad="%"
                                cargando={cargando}
                            />
                        </Col>
                    </>
                ) : (
                    <Col xs={12} md={6}>
                        <Card className="h-100 bg-light border-0">
                            <Card.Body className="d-flex align-items-center">
                                <span className="text-muted small">
                                    Selecciona una zona para ver Disponibilidad, Rendimiento, Calidad y OEE
                                </span>
                            </Card.Body>
                        </Card>
                    </Col>
                )}
            </Row>

            {/* OEE destacado — solo si hay zona y datos */}
            {tieneZona && kpis?.rendimiento_oee !== undefined && (
                <Row className="mb-4">
                    <Col xs={12} md={3}>
                        <Card className="border-2 border-dark text-center shadow">
                            <Card.Body>
                                <div className="text-muted small mb-1">OEE</div>
                                {cargando
                                    ? <Spinner animation="border" />
                                    : <>
                                        <div className="display-5 fw-bold">
                                            {kpis.rendimiento_oee ?? '—'}
                                            <span className="fs-5 text-muted ms-1">%</span>
                                        </div>
                                        {kpis.disponibilidad !== undefined && (
                                            <div className="text-muted small mt-1">
                                                {kpis.disponibilidad}% × {kpis.rendimiento}% × {kpis.calidad}%
                                            </div>
                                        )}
                                    </>
                                }
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}
        </>
    );
};

export default DashboardKPIs;