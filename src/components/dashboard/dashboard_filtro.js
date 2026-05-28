// dashboard/dashboard_filtro.js
import React, { useEffect, useState } from 'react';
import { Row, Col, Form, Button, ButtonGroup } from 'react-bootstrap';
import axios from 'axios';
import moment from 'moment';
import { BACKEND_SERVER } from '../../constantes';

const DashboardFiltro = ({filtro, actualizaFiltro: setFiltro, token, empresaId, mostrarTurno = true, mostrarTipoParada = true,}) => {

    const [zonas, setZonas] = useState([]);
    const [tiposParada, setTiposParada] = useState([]);

    useEffect(() => {
        const headers = { Authorization: `token ${token}` };

        axios.get(`${BACKEND_SERVER}/api/velocidad/lineas/?zona__empresa=${empresaId}`, { headers })
            .then(res => setZonas(res.data.map(l => l.zona)));

        axios.get(`${BACKEND_SERVER}/api/velocidad/tipoparada/`, { headers })
            .then(res => setTiposParada(res.data));
    }, [token, empresaId]);

    const rangoRapido = (rango) => {
        const hoy = moment().format('YYYY-MM-DD');
        if (rango === 'hoy') {
            setFiltro(prev => ({ ...prev, fecha_desde: hoy, fecha_hasta: hoy }));
        } else if (rango === 'semana') {
            setFiltro(prev => ({
                ...prev,
                fecha_desde: moment().startOf('isoWeek').format('YYYY-MM-DD'),
                fecha_hasta: hoy,
            }));
        } else if (rango === 'mes') {
            setFiltro(prev => ({
                ...prev,
                fecha_desde: moment().startOf('month').format('YYYY-MM-DD'),
                fecha_hasta: hoy,
            }));
        }
    };

    return (
        <Row className="align-items-end gy-2 mb-3 p-2 bg-light rounded border">

            {/* Zona */}
            <Col xs={12} md={2}>
                <Form.Label>Zona</Form.Label>
                <Form.Control as="select" value={filtro.zona_id || ''}
                    onChange={e => setFiltro(prev => ({ ...prev, zona_id: e.target.value || null }))}>
                    <option value="">Todas</option>
                    {zonas.map(z => (
                        <option key={z.id} value={z.id}>{z.nombre}</option>
                    ))}
                </Form.Control>
            </Col>

            {/* Fecha desde */}
            <Col xs={6} md={2}>
                <Form.Label>Desde</Form.Label>
                <Form.Control type="date" value={filtro.fecha_desde}
                    onChange={e => setFiltro(prev => ({ ...prev, fecha_desde: e.target.value }))} />
            </Col>

            {/* Fecha hasta */}
            <Col xs={6} md={2}>
                <Form.Label>Hasta</Form.Label>
                <Form.Control type="date" value={filtro.fecha_hasta}
                    onChange={e => setFiltro(prev => ({ ...prev, fecha_hasta: e.target.value }))} />
            </Col>

            {/* Turno */}
            {mostrarTurno && (
                <Col xs={6} md={2}>
                    <Form.Label>Turno</Form.Label>
                    <Form.Control as="select" value={filtro.turno || ''}
                        onChange={e => setFiltro(prev => ({ ...prev, turno: e.target.value || null }))}>
                        <option value="">Todos</option>
                        <option value="A">A – Mañana</option>
                        <option value="B">B – Tarde</option>
                        <option value="C">C – Noche</option>
                    </Form.Control>
                </Col>
            )}

            {/* Tipo parada */}
            {mostrarTipoParada && (
                <Col xs={6} md={2}>
                    <Form.Label>Tipo parada</Form.Label>
                    <Form.Control as="select" value={filtro.tipo_parada_id || ''}
                        onChange={e => setFiltro(prev => ({ ...prev, tipo_parada_id: e.target.value || null }))}>
                        <option value="">Todas</option>
                        {tiposParada.map(t => (
                            <option key={t.id} value={t.id}>{t.nombre}</option>
                        ))}
                    </Form.Control>
                </Col>
            )}

            {/* Atajos rápidos */}
            <Col xs={12} md={2}>
                <Form.Label className="d-block">Acceso rápido</Form.Label>
                <ButtonGroup>
                    <Button variant="outline-secondary" onClick={() => rangoRapido('hoy')}>Hoy</Button>
                    <Button variant="outline-secondary" onClick={() => rangoRapido('semana')}>Semana</Button>
                    <Button variant="outline-secondary" onClick={() => rangoRapido('mes')}>Mes</Button>
                </ButtonGroup>
            </Col>

        </Row>
    );
};

export default DashboardFiltro;