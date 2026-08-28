import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import { useCookies } from 'react-cookie';
import { Button, Form, Col, Row, Container, Table } from 'react-bootstrap';
import logo from '../../assets/Bornay.svg';
import logoTuf from '../../assets/logo_tuflesa.svg';

const EP_FORMA = '/api/articulos/formas/';
const EP_CALIDAD = '/api/articulos/calidad/';
const EP_ACABADO = '/api/articulos/acabado/';
const EP_NORMA = '/api/articulos/norma/';
const EP_ARTICULO = '/api/articulos/articulos/';
// filtro de montajes por grupo
const EP_MONTAJES_POR_GRUPO = (grupoId) => `/api/rodillos/montaje/?grupo=${grupoId}`;

// Esta función deja el resultado siempre como array para que no de errores
const extractList = (data) => {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.results)) return data.results;
    return [];
};

const RodArticulo = () => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);

    const [datos, setDatos] = useState({
        nombre: '',
        forma: '',
        forma_siglas: '',
        dim1: '',
        dim2: '',
        espesor: '',
        calidad: '',
        calidad_nombre: '',
        acabado: '',
        acabado_nombre: '',
        norma: '',
        norma_nombre: '',
        desarrollo: '',
        dst: '',
    });

    // Listas de desplegables
    const [formas, setFormas] = useState([]);
    const [calidades, setCalidades] = useState([]);
    const [acabados, setAcabados] = useState([]);
    const [normas, setNormas] = useState([]);

    // Filtro en cascada para localizar montajes
    const [empresas, setEmpresas] = useState([]);
    const [zonas, setZonas] = useState([]);
    const [grupos, setGrupos] = useState([]);
    const [filtro, setFiltro] = useState({
        empresa: '',
        zona: '',
        grupo: '',
    });

    // Montajes disponibles para el grupo elegido, y checkboxes marcados en ese listado
    const [montajesDisponibles, setMontajesDisponibles] = useState([]);
    const [montajesMarcados, setMontajesMarcados] = useState([]);

    // Montajes ya añadidos al artículo
    const [montajesSeleccionados, setMontajesSeleccionados] = useState([]);

    // ---------- Carga de catálogos ----------
    useEffect(() => {
        axios.get(BACKEND_SERVER + EP_FORMA, {
            headers: { 'Authorization': `token ${token['tec-token']}` }
        })
        .then(res => setFormas(extractList(res.data)))
        .catch(err => console.log(err));

        axios.get(BACKEND_SERVER + EP_CALIDAD, {
            headers: { 'Authorization': `token ${token['tec-token']}` }
        })
        .then(res => setCalidades(extractList(res.data)))
        .catch(err => console.log(err));

        axios.get(BACKEND_SERVER + EP_ACABADO, {
            headers: { 'Authorization': `token ${token['tec-token']}` }
        })
        .then(res => setAcabados(extractList(res.data)))
        .catch(err => console.log(err));

        axios.get(BACKEND_SERVER + EP_NORMA, {
            headers: { 'Authorization': `token ${token['tec-token']}` }
        })
        .then(res => setNormas(extractList(res.data)))
        .catch(err => console.log(err));

        axios.get(BACKEND_SERVER + '/api/estructura/empresa/', {
            headers: { 'Authorization': `token ${token['tec-token']}` }
        })
        .then(res => setEmpresas(extractList(res.data)))
        .catch(err => console.log(err));
    }, [token]);

    // ---------- Cascada zona (según empresa) ----------
    useEffect(() => {
        if (!filtro.empresa) {
            setZonas([]);
            setFiltro(f => ({ ...f, zona: '', grupo: '' }));
            return;
        }
        axios.get(BACKEND_SERVER + `/api/estructura/zona/?empresa__id=${filtro.empresa}`, {
            headers: { 'Authorization': `token ${token['tec-token']}` }
        })
        .then(res => {
            setZonas(extractList(res.data));
            setFiltro(f => ({ ...f, zona: '', grupo: '' }));
        })
        .catch(err => console.log(err));
    }, [token, filtro.empresa]);

    // ---------- Cascada grupo (según zona) ----------
    useEffect(() => {
        if (!filtro.zona) {
            setGrupos([]);
            setFiltro(f => ({ ...f, grupo: '' }));
            return;
        }
        axios.get(BACKEND_SERVER + `/api/rodillos/grupo_nuevo/?maquina=${filtro.zona}`, {
            headers: { 'Authorization': `token ${token['tec-token']}` }
        })
        .then(res => {
            setGrupos(extractList(res.data));
            setFiltro(f => ({ ...f, grupo: '' }));
        })
        .catch(err => console.log(err));
    }, [token, filtro.zona]);

    // ---------- Montajes disponibles (según grupo) ----------
    useEffect(() => {
        setMontajesMarcados([]);
        if (!filtro.grupo) {
            setMontajesDisponibles([]);
            return;
        }
        axios.get(BACKEND_SERVER + EP_MONTAJES_POR_GRUPO(filtro.grupo), {
            headers: { 'Authorization': `token ${token['tec-token']}` }
        })
        .then(res => setMontajesDisponibles(extractList(res.data)))
        .catch(err => console.log(err));
    }, [token, filtro.grupo]);

    // ---------- Cambios de datos del artículo ----------
    const handleInputChange = (event) => {
        setDatos({
            ...datos,
            [event.target.name]: event.target.value,
        });
    };

    const handleInputChangeForma = (event) => {
        const [id, siglas] = event.target.value.split(',');
        setDatos({
            ...datos,
            forma: id,
            forma_siglas: siglas,
        });
    };

    const handleInputChangeCalidad = (event) => {
        const [id, nombre] = event.target.value.split(',');
        setDatos({
            ...datos,
            calidad: id,
            calidad_nombre: nombre,
        });
    };

    const handleInputChangeAcabado = (event) => {
        const [id, nombre] = event.target.value.split(',');
        setDatos({
            ...datos,
            acabado: id,
            acabado_nombre: nombre,
        });
    };

    const handleInputChangeNorma = (event) => {
        const [id, nombre] = event.target.value.split(',');
        setDatos({
            ...datos,
            norma: id,
            norma_nombre: nombre,
        });
    };

    // Monta el nombre automáticamente cuando ya tenemos todos los datos que lo
    // dejando que lo puedna modificar los usuarios
    useEffect(() => {
        if (datos.nombre) return;
        if (datos.forma_siglas && datos.dim1 && datos.dim2 && datos.espesor
            && datos.calidad_nombre && datos.acabado_nombre && datos.norma_nombre
            && datos.desarrollo) {
            const dimensiones = datos.dim1 !== '0'
                ? `${datos.dim1}x${datos.dim2}x${datos.espesor}`
                : `${datos.dim2}x${datos.espesor}`;
            const nombreGenerado = `${datos.forma_siglas} ${dimensiones} ${datos.calidad_nombre} ${datos.acabado_nombre} ${datos.norma_nombre} - D${datos.desarrollo}`;
            setDatos(prev => ({ ...prev, nombre: nombreGenerado }));
        }
    }, [datos.forma_siglas, datos.dim1, datos.dim2, datos.espesor,
        datos.calidad_nombre, datos.acabado_nombre, datos.norma_nombre,
        datos.desarrollo, datos.nombre]);

    // ---------- Cambios en el filtro de montajes ----------
    const handleFiltroEmpresa = (event) => {
        setFiltro({ empresa: event.target.value, zona: '', grupo: '' });
    };

    const handleFiltroZona = (event) => {
        setFiltro(f => ({ ...f, zona: event.target.value, grupo: '' }));
    };

    const handleFiltroGrupo = (event) => {
        setFiltro(f => ({ ...f, grupo: event.target.value }));
    };

    const toggleMontajeMarcado = (montaje) => {
        setMontajesMarcados(prev =>
            prev.some(m => m.id === montaje.id)
                ? prev.filter(m => m.id !== montaje.id)
                : [...prev, montaje]
        );
    };

    const añadirMontajesMarcados = () => {
        setMontajesSeleccionados(prev => {
            const idsExistentes = prev.map(m => m.id);
            const nuevos = montajesMarcados.filter(m => !idsExistentes.includes(m.id));
            return [...prev, ...nuevos];
        });
        setMontajesMarcados([]);
    };

    const quitarMontajeSeleccionado = (id) => {
        setMontajesSeleccionados(prev => prev.filter(m => m.id !== id));
    };

    // ---------- Guardar ----------
    const GuardarArticulo = (event) => {
        console.log('que datos tengo: ', datos);
        console.log('que montajes tengo: ', montajesSeleccionados);
        event.preventDefault();

        if (!datos.nombre) {
            alert('El nombre del artículo es obligatorio');
            return;
        }

        axios.get(BACKEND_SERVER + `${EP_ARTICULO}?nombre=${datos.nombre}`, {
            headers: { 'Authorization': `token ${token['tec-token']}` }
        })
        .then(res => {
            if (extractList(res.data).length !== 0) {
                alert('Este artículo ya existe');
                return;
            }

            const payload = {
                nombre: datos.nombre,
                forma: datos.forma ? parseInt(datos.forma) : '',
                dim1: datos.dim1,
                dim2: datos.dim2,
                espesor: datos.espesor,
                calidad: datos.calidad ? parseInt(datos.calidad) : '',
                acabado: datos.acabado ? parseInt(datos.acabado) : '',
                norma: datos.norma ? parseInt(datos.norma) : '',
                desarrollo: datos.desarrollo ? parseInt(datos.desarrollo) : '',
                Dst: datos.dst ? parseFloat(datos.dst) : null,
                montajes: montajesSeleccionados.map(m => m.id),
            };

            axios.post(BACKEND_SERVER + EP_ARTICULO, payload, {
                headers: { 'Authorization': `token ${token['tec-token']}` }
            })
            .then(() => {
                alert('Artículo creado correctamente');
                window.location.href = `/rodillos/articulos/`;
            })
            .catch(err => {
                console.log(err);
                alert('Faltan datos, por favor rellena todos los datos que tengan *');
            });
        })
        .catch(err => console.log(err));
    };

    return (
        <Container className='mt-5'>
            <img src={user['tec-user'].perfil.empresa.id === 1 ? logo : logoTuf} width="200" height="200" alt="logo" />
            <h5 className='mt-5'>Crear Artículo</h5>

            <Form>
                <Row>
                    <Form.Group as={Col} md={6} controlId="nombre">
                        <Form.Label>Nombre del artículo *</Form.Label>
                        <Form.Control type="text"
                                      name='nombre'
                                      value={datos.nombre}
                                      onChange={handleInputChange}
                                      placeholder="Ej: Red. 100x3.0 S275 Negro EN10.219" />
                    </Form.Group>
                </Row>

                <Row>
                    <Col>
                        <Form.Group controlId="forma">
                            <Form.Label>Forma *</Form.Label>
                            <Form.Control as="select"
                                          value={`${datos.forma},${datos.forma_siglas}`}
                                          name='forma'
                                          onChange={handleInputChangeForma}>
                                <option key={0} value={',' }>Selecciona</option>
                                {formas.map(forma => (
                                    <option key={forma.id} value={`${forma.id},${forma.siglas}`}>
                                        {forma.nombre}
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="dim1">
                            <Form.Label>Dimensión 1 * {datos.forma_siglas === 'R' ? '(0 si es redondo)' : ''}</Form.Label>
                            <Form.Control type="text"
                                          name='dim1'
                                          value={datos.dim1}
                                          onChange={handleInputChange}
                                          placeholder="Dim1" />
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="dim2">
                            <Form.Label>Dimensión 2 *</Form.Label>
                            <Form.Control type="text"
                                          name='dim2'
                                          value={datos.dim2}
                                          onChange={handleInputChange}
                                          placeholder="Dim2" />
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="espesor">
                            <Form.Label>Espesor *</Form.Label>
                            <Form.Control type="text"
                                          name='espesor'
                                          value={datos.espesor}
                                          onChange={handleInputChange}
                                          placeholder="Espesor" />
                        </Form.Group>
                    </Col>
                </Row>

                <Row>
                    <Col>
                        <Form.Group controlId="calidad">
                            <Form.Label>Calidad *</Form.Label>
                            <Form.Control as="select"
                                          value={`${datos.calidad},${datos.calidad_nombre}`}
                                          name='calidad'
                                          onChange={handleInputChangeCalidad}>
                                <option key={0} value={','}>Selecciona</option>
                                {calidades.map(calidad => (
                                    <option key={calidad.id} value={`${calidad.id},${calidad.nombre}`}>
                                        {calidad.nombre}
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="acabado">
                            <Form.Label>Acabado *</Form.Label>
                            <Form.Control as="select"
                                          value={`${datos.acabado},${datos.acabado_nombre}`}
                                          name='acabado'
                                          onChange={handleInputChangeAcabado}>
                                <option key={0} value={','}>Selecciona</option>
                                {acabados.map(acabado => (
                                    <option key={acabado.id} value={`${acabado.id},${acabado.nombre}`}>
                                        {acabado.nombre}
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="norma">
                            <Form.Label>Norma *</Form.Label>
                            <Form.Control as="select"
                                          value={`${datos.norma},${datos.norma_nombre}`}
                                          name='norma'
                                          onChange={handleInputChangeNorma}>
                                <option key={0} value={','}>Selecciona</option>
                                {normas.map(norma => (
                                    <option key={norma.id} value={`${norma.id},${norma.nombre}`}>
                                        {norma.nombre}
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                    </Col>
                </Row>

                <Row>
                    <Col md={4}>
                        <Form.Group controlId="desarrollo">
                            <Form.Label>Desarrollo *</Form.Label>
                            <Form.Control type="number"
                                          name='desarrollo'
                                          value={datos.desarrollo}
                                          onChange={handleInputChange}
                                          placeholder="Desarrollo" />
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                        <Form.Group controlId="dst">
                            <Form.Label>Dst (diámetro en soldadura teórico)</Form.Label>
                            <Form.Control type="number"
                                          step="0.01"
                                          name='dst'
                                          value={datos.dst}
                                          onChange={handleInputChange}
                                          placeholder="Dst" />
                        </Form.Group>
                    </Col>
                </Row>

                <hr className='mt-4' />
                <h6>Montajes asociados</h6>
                <p className='text-muted' style={{ fontSize: 'smaller' }}>
                    Filtra por empresa, zona y grupo para localizar los montajes y marca los que quieras añadir al artículo.
                </p>

                <Row>
                    <Col>
                        <Form.Group controlId="filtro_empresa">
                            <Form.Label>Empresa</Form.Label>
                            <Form.Control as="select"
                                          value={filtro.empresa}
                                          onChange={handleFiltroEmpresa}>
                                <option key={0} value={''}>Todas</option>
                                {empresas.map(empresa => (
                                    <option key={empresa.id} value={empresa.id}>
                                        {empresa.nombre}
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="filtro_zona">
                            <Form.Label>Zona</Form.Label>
                            <Form.Control as="select"
                                          value={filtro.zona}
                                          onChange={handleFiltroZona}
                                          disabled={!filtro.empresa}>
                                <option key={0} value={''}>Todas</option>
                                {zonas.map(zona => (
                                    <option key={zona.id} value={zona.id}>
                                        {zona.siglas}
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="filtro_grupo">
                            <Form.Label>Grupo</Form.Label>
                            <Form.Control as="select"
                                          value={filtro.grupo}
                                          onChange={handleFiltroGrupo}
                                          disabled={!filtro.zona}>
                                <option key={0} value={''}>Todos</option>
                                {grupos.map(grupo => (
                                    <option key={grupo.id} value={grupo.id}>
                                        {grupo.nombre}
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                    </Col>
                </Row>

                {filtro.grupo ? (
                    montajesDisponibles.length === 0 ? (
                        <p className='text-muted mt-2'>No hay montajes para este grupo.</p>
                    ) : (
                        <>
                            <Table size="sm" className='mt-2'>
                                <thead>
                                    <tr>
                                        <th></th>
                                        <th>Montaje</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {montajesDisponibles
                                        .filter(m => !montajesSeleccionados.some(sel => sel.id === m.id))
                                        .map(montaje => (
                                        <tr key={montaje.id}>
                                            <td>
                                                <Form.Check type="checkbox"
                                                            checked={montajesMarcados.some(m => m.id === montaje.id)}
                                                            onChange={() => toggleMontajeMarcado(montaje)} />
                                            </td>
                                            <td>{montaje.nombre}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                            <Button variant="outline-secondary"
                                    size="sm"
                                    disabled={montajesMarcados.length === 0}
                                    onClick={añadirMontajesMarcados}>
                                Añadir montajes marcados
                            </Button>
                        </>
                    )
                ) : ''}

                <hr className='mt-4' />
                <h6>Montajes seleccionados ({montajesSeleccionados.length})</h6>
                {montajesSeleccionados.length === 0 ? (
                    <p className='text-muted'>Todavía no has añadido ningún montaje.</p>
                ) : (
                    <Table size="sm">
                        <thead>
                            <tr>
                                <th>Montaje</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {montajesSeleccionados.map(montaje => (
                                <tr key={montaje.id}>
                                    <td>{montaje.nombre}</td>
                                    <td>
                                        <Button variant="outline-danger"
                                                size="sm"
                                                onClick={() => quitarMontajeSeleccionado(montaje.id)}>
                                            Quitar
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}

                <Row className='mt-4'>
                    <Col>
                        <Button variant="outline-primary" className='mx-2' href="javascript: history.go(-1)">
                            Cancelar / Volver
                        </Button>
                        <Button variant="outline-primary" onClick={GuardarArticulo}>
                            Guardar
                        </Button>
                    </Col>
                </Row>
            </Form>
        </Container>
    );
}

export default RodArticulo;