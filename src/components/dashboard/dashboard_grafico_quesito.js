// components/dashboard/dashboard_grafico_quesito.js
// Componente reutilizable de gráfico de quesito (pie chart).
// Úsalo tantas veces como quieras con distintos datos y configuración.
//
// Props:
//   titulo      – string: título de la card
//   datos       – array de objetos con los datos a pintar
//   campoValor  – string: nombre del campo numérico (p.ej. 'num_eventos', 'minutos')
//   campoNombre – string: nombre del campo para las etiquetas (p.ej. 'tipo_nombre')
//   colorCampo  – string (opcional): campo que contiene el color de cada sector
//   colorFijo   – string (opcional): color por defecto si no hay colorCampo
//   etiqueta    – string (opcional): sufijo para los valores ('min', 'paradas'...)
//   mostrarLeyenda – bool (opcional): mostrar leyenda debajo (defecto true)
//   cargando    – bool: muestra spinner mientras carga
//   altura      – number (opcional): altura en px (defecto 280)

import React from 'react';
import { Card, Spinner } from 'react-bootstrap';
import {
    PieChart, Pie, Cell, Tooltip,
    Legend, ResponsiveContainer
} from 'recharts';

// Etiqueta personalizada dentro de cada sector
const EtiquetaSector = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null; // no mostrar si el sector es muy pequeño
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
            fontSize={12} fontWeight="bold">
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

const TooltipPersonalizado = ({ active, payload, etiqueta }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
        <div className="bg-white border rounded p-2 shadow-sm small">
            <div className="fw-semibold">{d._nombre}</div>
            <div>{d._valor} {etiqueta || ''}</div>
            <div className="text-muted">{(payload[0].percent * 100).toFixed(1)}%</div>
        </div>
    );
};

const GraficoQuesito = ({
    titulo,
    datos,
    campoValor,
    campoNombre,
    colorCampo,
    colorFijo      = '#378ADD',
    etiqueta       = '',
    mostrarLeyenda = true,
    cargando       = false,
    altura         = 280,
}) => {
    const datosNormalizados = datos?.map(item => ({
        _nombre: item[campoNombre],
        _valor:  item[campoValor],
        _color:  colorCampo ? (item[colorCampo] || colorFijo) : colorFijo,
    })).filter(d => d._valor > 0) || [];

    return (
        <Card className="shadow-sm h-100">
            <Card.Body>
                {titulo && (
                    <Card.Title className="fs-6 text-muted mb-3">
                        {titulo}
                    </Card.Title>
                )}

                {cargando && <Spinner animation="border" size="sm" />}

                {!cargando && datosNormalizados.length === 0 && (
                    <p className="text-muted small">Sin datos en el período seleccionado.</p>
                )}

                {!cargando && datosNormalizados.length > 0 && (
                    <ResponsiveContainer width="100%" height={altura}>
                        <PieChart>
                            <Pie
                                data={datosNormalizados}
                                dataKey="_valor"
                                nameKey="_nombre"
                                cx="50%"
                                cy="50%"
                                outerRadius={altura / 3}
                                labelLine={false}
                                label={EtiquetaSector}
                            >
                                {datosNormalizados.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry._color}
                                        fillOpacity={0.88}
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                content={({ active, payload }) => (
                                    <TooltipPersonalizado
                                        active={active}
                                        payload={payload}
                                        etiqueta={etiqueta}
                                    />
                                )}
                            />
                            {mostrarLeyenda && (
                                <Legend
                                    formatter={(value, entry) => (
                                        <span style={{ fontSize: 12, color: '#374151' }}>
                                            {entry.payload._nombre}
                                        </span>
                                    )}
                                />
                            )}
                        </PieChart>
                    </ResponsiveContainer>
                )}
            </Card.Body>
        </Card>
    );
};

export default GraficoQuesito;