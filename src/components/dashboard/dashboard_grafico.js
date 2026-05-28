// components/dashboard/grafico_barras.js
// Componente reutilizable de barras horizontales.
// Úsalo tantas veces como quieras con distintos datos y configuración.
//
// Props:
//   titulo      – string: título de la card
//   datos       – array de objetos con los datos a pintar
//   campoX      – string: nombre del campo numérico para el eje X (p.ej. 'minutos')
//   campoY      – string: nombre del campo para el eje Y / etiquetas (p.ej. 'tipo_nombre')
//   colorCampo  – string (opcional): nombre del campo que contiene el color de cada barra
//   colorFijo   – string (opcional): color fijo para todas las barras si no hay colorCampo
//   etiquetaX   – string (opcional): unidad o sufijo para las etiquetas del eje X (p.ej. 'min', 'uds')
//   formatoX    – function (opcional): función para formatear los valores del eje X
//   cargando    – bool: muestra spinner mientras carga
//   altura      – number (opcional): altura del gráfico en px (por defecto 260)

import React from 'react';
import { Card, Spinner } from 'react-bootstrap';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell, LabelList
} from 'recharts';

const TooltipPersonalizado = ({ active, payload, etiquetaX }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
        <div className="bg-white border rounded p-2 shadow-sm small">
            <div className="fw-semibold">{d[payload[0].name === 'valor' ? '_campoY' : payload[0].name]}</div>
            <div>{payload[0].value} {etiquetaX || ''}</div>
        </div>
    );
};

const GraficoBarras = ({
    titulo,
    datos,
    campoX,
    campoY,
    colorCampo,
    colorFijo   = '#378ADD',
    etiquetaX   = '',
    formatoX,
    cargando    = false,
    altura      = 260,
}) => {
    // Normalizamos los datos para recharts usando nombres fijos internos
    // así el componente es independiente del nombre real de los campos
    const datosNormalizados = datos?.map(item => ({
        _etiqueta: item[campoY],          // eje Y
        _valor:    item[campoX],          // eje X
        _color:    colorCampo ? (item[colorCampo] || colorFijo) : colorFijo,
        _original: item,                  // datos originales por si el tooltip los necesita
    })) || [];

    const formateadorX = formatoX || (v => `${v}${etiquetaX ? ' ' + etiquetaX : ''}`);

    // Calcular ancho del eje Y según la etiqueta más larga
    const anchoEjeY = Math.min(
        120,
        Math.max(60, ...datosNormalizados.map(d => (d._etiqueta || '').length * 7))
    );

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
                        <BarChart
                            data={datosNormalizados}
                            layout="vertical"
                            margin={{ top: 4, right: 70, left: 10, bottom: 4 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis
                                type="number"
                                tick={{ fontSize: 11 }}
                                tickFormatter={formateadorX}
                            />
                            <YAxis
                                type="category"
                                dataKey="_etiqueta"
                                width={anchoEjeY}
                                tick={{ fontSize: 11 }}
                            />
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (!active || !payload?.length) return null;
                                    const d = payload[0].payload;
                                    return (
                                        <div className="bg-white border rounded p-2 shadow-sm small">
                                            <div className="fw-semibold">{d._etiqueta}</div>
                                            <div>{d._valor} {etiquetaX}</div>
                                        </div>
                                    );
                                }}
                            />
                            <Bar
                                dataKey="_valor"
                                radius={[0, 4, 4, 0]}
                                maxBarSize={28}
                            >
                                {datosNormalizados.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry._color}
                                        fillOpacity={0.85}
                                    />
                                ))}
                                <LabelList
                                    dataKey="_valor"
                                    position="right"
                                    formatter={formateadorX}
                                    style={{ fontSize: 11, fill: '#555' }}
                                />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </Card.Body>
        </Card>
    );
};

export default GraficoBarras;