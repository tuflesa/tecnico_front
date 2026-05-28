// dashboard/dashboard_paradas_tipo.jsx
import React from 'react';
import { Card, Spinner } from 'react-bootstrap';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell, LabelList
} from 'recharts';

const TooltipPersonalizado = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
        <div className="bg-white border rounded p-2 shadow-sm small">
            <div className="fw-semibold">{d.tipo_nombre}</div>
            <div>{d.minutos} min</div>
            <div className="text-muted">{d.num_eventos} evento{d.num_eventos !== 1 ? 's' : ''}</div>
        </div>
    );
};

const DashboardParadasTipo = ({ datos, cargando }) => {
    return (
        {/* <Card className="shadow-sm h-100">
            <Card.Body>
                <Card.Title className="fs-6 text-muted mb-3">
                    🛑 Paradas por tipo (minutos)
                </Card.Title>

                {cargando && <Spinner animation="border" size="sm" />}

                {!cargando && (!datos || datos.length === 0) && (
                    <p className="text-muted small">Sin paradas en el período seleccionado.</p>
                )}

                {!cargando && datos && datos.length > 0 && (
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart
                            data={datos}
                            layout="vertical"
                            margin={{ top: 4, right: 60, left: 10, bottom: 4 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis
                                type="number"
                                tick={{ fontSize: 11 }}
                                tickFormatter={v => `${v}m`}
                            />
                            <YAxis
                                type="category"
                                dataKey="tipo_nombre"
                                width={90}
                                tick={{ fontSize: 11 }}
                            />
                            <Tooltip content={<TooltipPersonalizado />} />
                            <Bar dataKey="minutos" radius={[0, 4, 4, 0]} maxBarSize={28}>
                                {datos.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.color || '#6c757d'}
                                        fillOpacity={0.85}
                                    />
                                ))}
                                <LabelList
                                    dataKey="minutos"
                                    position="right"
                                    formatter={v => `${v}m`}
                                    style={{ fontSize: 11, fill: '#555' }}
                                />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </Card.Body>
        </Card> */}
    );
};

export default DashboardParadasTipo;