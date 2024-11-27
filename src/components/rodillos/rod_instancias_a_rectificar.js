import React, { useEffect, useState } from 'react';
import { Row, Col, Form, Container, Table } from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import { CloudArrowUp} from 'react-bootstrap-icons';
import axios from 'axios';
import {invertirFecha} from '../utilidades/funciones_fecha';

const RodInstanciasRectificar = () => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);

    const [lineas_rectificacion, setLineasRectificacion] = useState([]);
    const [operaciones, setOperaciones] = useState([]);
    const [empresas, setEmpresas] = useState([user['tec-user'].perfil.empresa.id]);
    const [secciones, setSecciones] = useState([]);
    const [zonas, setZonas] = useState([]);
    const [proveedores, setProveedores] = useState([]);
    const [filtro, setFiltro] = useState(`?finalizado=${false}&instancia__rodillo__operacion__seccion__maquina__empresa__id=${[user['tec-user'].perfil.empresa.id]}`);
    const [proveedorSeleccionado, setProveedorSeleccionado] = useState(false);

    const [datos, setDatos] = useState({
        id:'',
        nombre: '',
        empresa: user['tec-user'].perfil.empresa.id,
        maquina: '',
        seccion: '',
        operacion: '',
        finalizado: false,
        rectificado_por: '',
        id_instancia:'',
        fuera: false,
        proveedor:'',
    });

    useEffect(() => {
        axios.get(BACKEND_SERVER + `/api/rodillos/listado_linea_rectificacion` + filtro, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }
        })
        .then(res => {
            const updatedLineas = res.data.map(linea => {
                    return {
                        ...linea,      
                        fuera: linea.proveedor !== null // Si `proveedor` es null, fuera: será false, de lo contrario true
                    };
                })
            setLineasRectificacion(updatedLineas);
        })
        .catch(err => {
            console.log(err);
        });
    }, [token, filtro]);

    useEffect(()=>{
        axios.get(BACKEND_SERVER + `/api/repuestos/proveedor/?de_rectificado=${true}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }
        })
        .then( res => {
            setProveedores(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token]);

    useEffect(() => {
        let filtro = `?finalizado=${datos.finalizado}&instancia__id=${datos.id_instancia}&proveedor=${datos.proveedor}&instancia__rodillo__operacion__seccion__maquina__empresa__id=${datos.empresa}&instancia__rodillo__operacion__seccion__maquina__id=${datos.maquina}&instancia__rodillo__operacion__seccion__id=${datos.seccion}&instancia__rodillo__operacion__id=${datos.operacion}&instancia__nombre__icontains=${datos.nombre}&full_name=${datos.rectificado_por ? datos.rectificado_por : ''}`;   
        actualizaFiltro(filtro);
    }, [datos]);
    

    const actualizaFiltro = str => {
        setFiltro(str);
    }

    useEffect(() => {
        axios.get(BACKEND_SERVER + '/api/estructura/empresa/',{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            setEmpresas(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token]);

    useEffect(() => {
        if (datos.empresa === '') {
            setZonas([]);
            setDatos({
                ...datos,
                maquina: '',
                seccion: '',
                operacion: ''
            });
        }
        else {
            axios.get(BACKEND_SERVER + `/api/estructura/zona/?empresa=${datos.empresa}`,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }
            })
            .then( res => {
                setZonas(res.data);
                setDatos({
                    ...datos,
                    maquina: '',
                    seccion: '',
                    operacion: ''
                });
            })
            .catch( err => {
                console.log(err);
            });
        }
    }, [token, datos.empresa]);

    useEffect(() => {
        if (datos.maquina === '') {
            setSecciones([]);
            setDatos({
                ...datos,
                seccion: '',
                operacion: '',
            });
        }
        else {
            axios.get(BACKEND_SERVER + `/api/rodillos/seccion/?maquina__id=${datos.maquina}`,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }
            })
            .then( res => {
                setSecciones(res.data);
                setDatos({
                    ...datos,
                    seccion: '',
                    operacion: '',
                });
            })
            .catch( err => {
                console.log(err);
            });
        }
    }, [token, datos.maquina]);

    useEffect(() => {
        if (datos.seccion === '') {
            setOperaciones([]);
        }
        else {
            axios.get(BACKEND_SERVER + `/api/rodillos/operacion/?seccion__id=${datos.seccion}`,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }
            })
            .then( res => {
                setOperaciones(res.data);
            })
            .catch( err => {
                console.log(err);
            });
        }
    }, [token, datos.seccion]);

    const Actualizo_LineasRectificacion = (linea, fecha) => {
        axios.patch(BACKEND_SERVER + `/api/rodillos/listado_linea_rectificacion/${linea.id}/`, { //Actualizamos fecha
            fecha: fecha,
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }     
        })
        .then( res => {  
            window.location.reload(); //actualizo página
        })
        .catch(err => { 
            console.error(err);
        })

    };

    const Actualizo_Proveedor = (linea, proveedor) => {
        axios.patch(BACKEND_SERVER + `/api/rodillos/linea_rectificacion/${linea.id}/`, { //Actualizamos proveedor
            proveedor: proveedor,
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }     
        })
        .then( res => {  
            window.location.reload(); //actualizo página
        })
        .catch(err => { 
            console.error(err);
        })

    };

    const handleInputChange_fecha_rectificado = (linea) => (event) => {
        const { value } = event.target;
        // Actualiza el estado de lineasInstancias
        Actualizo_LineasRectificacion(linea,value);
        setLineasRectificacion((prev) =>
            prev.map((instancia) =>
                instancia.id === linea.id ? { ...instancia, fecha: value } : instancia
            )
        );
    };

    const handleInputChange = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })
    }

    const handleInputChange_finalizado = (event) => {
        const { name, value } = event.target;
        setDatos((prevDatos) => ({
            ...prevDatos,
            [name]: name === 'finalizado' ? (value === '' ? undefined : value === 'true') : value 
        }));
    };

    const handleInputChange_fuera = (linea) => (event) => {
        const { value } = event.target;
        // Convertimos el valor a booleano
        const booleanValue = value === 'true'; // 'true' se convierte en true, 'false' en false

        // Actualizamos el estado de `fuera` de la línea
        setLineasRectificacion((prev) =>
            prev.map((instancia) =>
                instancia.id === linea.id ? { ...instancia, fuera: booleanValue } : instancia
            )
        );

        // Si el valor de `fuera` es 'true', habilitamos la opción de elegir proveedor
        if (booleanValue === true) {
            setProveedorSeleccionado(true);
        } else {
            setProveedorSeleccionado(false);
        }
    };

    const handleInputChange_proveedor = (linea) => (event) => {
        const { value } = event.target;
        setLineasRectificacion((prev) =>
            prev.map((instancia) =>
                instancia.id === linea.id ? { ...instancia, proveedor: value } : instancia
            )
        );
        if (value !== '') {
            Actualizo_Proveedor(linea,value);
        }
    };

    const handleInputChange_archivo = (linea) => async (event) => {
        const { files } = event.target;
        const selectedFile = files[0];
        if (selectedFile) {
            try {
                const archivoUrl = await Actualizo_Archivo(linea, selectedFile);
                if (archivoUrl) {
                    setLineasRectificacion((prev) =>
                        prev.map((instancia) =>
                            instancia.id === linea.id ? { ...instancia, archivo: archivoUrl } : instancia
                        )
                    );
                }
            } catch (error) {
                console.error('Error al actualizar el archivo:', error);
            }
        }
    };

    const Actualizo_Archivo = async (linea, select_Archivo) => {
        const formData = new FormData();
        formData.append('archivo', select_Archivo);
        try {
            // Actualiza en el rodillo el nuevo archivo
            const responseInstancia = await axios.patch(
                `${BACKEND_SERVER}/api/rodillos/rodillo_nuevo/${linea.instancia.rodillo.id}/`,
                formData,
                {
                    headers: {
                        'Authorization': `token ${token['tec-token']}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            // Luego, actualiza en linea_rectificacion
            for(var x=0; x<lineas_rectificacion.length; x++){
                if(lineas_rectificacion[x].instancia.rodillo.id===linea.instancia.rodillo.id){
                    const responseLinea = await axios.patch(`${BACKEND_SERVER}/api/rodillos/linea_rectificacion/${lineas_rectificacion[x].id}/`,formData,{
                        headers: {
                            'Authorization': `token ${token['tec-token']}`,
                            'Content-Type': 'multipart/form-data'
                        }
                    });
                    // Verifica si ambas respuestas contienen la URL correcta
                    const archivoUrl = responseInstancia.data.archivo || responseLinea.data.archivo;
                    if (archivoUrl) {
                        setLineasRectificacion((prev) =>
                            prev.map((instancia) =>
                                instancia.instancia.rodillo.id === linea.instancia.rodillo.id ? { ...instancia, archivo: archivoUrl } : instancia // Guarda la URL completa en lugar del nombre
                            )
                        );
                    }
                    //return archivoUrl; // Devuelve la URL completa para actualizar el estado en el frontend
                }
            }
            alert('Archivo actualizado correctamente');
        } catch (err) {
            alert('Error al actualizar el archivo, revisa los logs del servidor');
            console.error(err);
        }
        return null; // Retorna null si hubo error
    };   

    const [numeroBar, setNumeroBar] = useState({
        id_instancia: '',
        idCod: '',
    });
    
    const handleInputChangeCodBarras = (event) => { 
        setNumeroBar ({
            ...numeroBar,
            [event.target.name] : event.target.value                
        });
        if(numeroBar.id_instancia.length===11){
            setDatos({
                ...datos,
                id_instancia: parseInt(numeroBar.id_instancia),
            });
            setNumeroBar({
                ...numeroBar,
                id_instancia: ''
            });
        }
    }

    return(
        <Container className='mt-5 pt-1'>
            <Row>
                <Col xs={6}>
                    <Form.Group>
                        <Form.Label className="mt-2">Codigo Barras (con lector) </Form.Label>
                        <Form.Control
                                    type="text"
                                    id="id_instancia"
                                    tabIndex={2}
                                    name='id_instancia' 
                                    value={numeroBar.id_instancia}
                                    onChange={handleInputChangeCodBarras}
                                    placeholder="Codigo de barras" 
                                    autoFocus/>
                    </Form.Group>
                </Col>
            </Row>
            <Row className="mb-3">                  
                <Col>
                    <Form.Group controlId="formNombre">
                        <Form.Label>Nombre Contiene</Form.Label>
                        <Form.Control type="text" 
                                    name='nombre' 
                                    value={datos.nombre}
                                    onChange={handleInputChange}                                        
                                    placeholder="Nombre contiene"/>
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group controlId="rectificado_por">
                        <Form.Label>Rectificado_por Contiene</Form.Label>
                        <Form.Control type="text" 
                                    name='rectificado_por' 
                                    value={datos.rectificado_por}
                                    onChange={handleInputChange}                                        
                                    placeholder="Rectificado_por contiene"/>
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group controlId="finalizado">
                        <Form.Label>Rectificado</Form.Label>
                        <Form.Control as="select" 
                                        value={datos.finalizado}
                                        name='finalizado'
                                        onChange={handleInputChange_finalizado}>
                            <option key={0} value={''}>Todos</option>
                            <option key={1} value={true}>Si</option>
                            <option key={2} value={false}>No</option>
                        </Form.Control>
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group controlId="proveedor">
                        <Form.Label>Proveedor</Form.Label>
                        <Form.Control as="select" 
                                        value={datos.proveedor}
                                        name='proveedor'
                                        onChange={handleInputChange}>
                            <option key={0} value={''}>Todos</option>
                            {proveedores && proveedores.map(proveedor => {
                                return (
                                    <option key={proveedor.id} value={proveedor.id}>
                                        {proveedor.nombre}
                                    </option>
                                )
                            })}
                        </Form.Control> 
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Form.Group controlId="empresa">
                        <Form.Label>Empresa</Form.Label>
                        <Form.Control as="select"  
                                    name='empresa' 
                                    value={datos.empresa}
                                    onChange={handleInputChange}
                                    placeholder="Empresa">
                                    <option key={0} value={''}>Todas</option>    
                                    {empresas && empresas.map( empresa => {
                                        return (
                                        <option key={empresa.id} value={empresa.id}>
                                            {empresa.nombre}
                                        </option>
                                        )
                                    })}
                    </Form.Control>
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group controlId="maquina">
                        <Form.Label>Máquina</Form.Label>
                        <Form.Control as="select" 
                                        value={datos.maquina}
                                        name='maquina'
                                        onChange={handleInputChange}>
                            <option key={0} value={''}>Todas</option>
                            {zonas && zonas.map( zona => {
                                return (
                                <option key={zona.id} value={zona.id}>
                                    {zona.siglas}
                                </option>
                                )
                            })}
                        </Form.Control>
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group controlId="seccion">
                        <Form.Label>Sección</Form.Label>
                        <Form.Control as="select" 
                                        value={datos.seccion}
                                        name='seccion'
                                        onChange={handleInputChange}>
                            <option key={0} value={''}>Todas</option>
                            {secciones && secciones.map( seccion => {
                                return (
                                <option key={seccion.id} value={seccion.id}>
                                    {seccion.nombre}
                                </option>
                                )
                            })}
                        </Form.Control>
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group controlId="operacion">
                        <Form.Label>Operación</Form.Label>
                        <Form.Control as="select" 
                                        value={datos.operacion}
                                        name='operacion'
                                        onChange={handleInputChange}>
                            <option key={0} value={''}>Todos</option>
                            {operaciones && operaciones.map( operacion => {
                                return (
                                <option key={operacion.id} value={operacion.id}>
                                    {operacion.nombre}
                                </option>
                                )
                            })}
                        </Form.Control>
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col>
                    <h5 className="mb-3 mt-3">Lista de Rodillos a rectificar</h5>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Id</th>
                                <th>Nombre</th>
                                <th>Diámetro Fondo</th> 
                                {datos.finalizado !== false && <th style={{ backgroundColor: '#DBFAC9' }}>Nuevo Diámetro Fondo</th>}                                
                                <th>Diámetro Exterior</th>
                                {datos.finalizado !== false && <th style={{ backgroundColor: '#DBFAC9' }}>Nuevo Diámetro Exterior</th>}
                                <th>Ancho</th>
                                {datos.finalizado !== false && <th style={{ backgroundColor: '#DBFAC9' }}>Nuevo Ancho</th>}
                                <th>Centro</th>
                                {datos.finalizado !== false && <th style={{ backgroundColor: '#DBFAC9' }}>Nuevo Centro</th>}
                                <th>Num rodillos</th>
                                {datos.finalizado !== false && <th style={{ backgroundColor: '#DBFAC9' }}>Rectificado por</th>}
                                <th>Fecha estimada</th>
                                {datos.finalizado !== false && <th style={{ backgroundColor: '#DBFAC9' }}>Fecha Rectificado</th>}
                                <th>Archivo rectificado</th>
                                {datos.finalizado === false? <th>Rectificado fuera</th> :''}
                            </tr>
                        </thead>
                        <tbody>
                            {lineas_rectificacion.map(linea => {
                                return (
                                    <tr key={linea.id}>
                                        <td>{linea.instancia.id}</td>
                                        <td>{linea.instancia.nombre}</td>
                                        <td>{linea.diametro}</td>
                                        {datos.finalizado !== false && <td style={{ backgroundColor: '#DBFAC9' }}>{linea.nuevo_diametro}</td>}
                                        <td>{linea.diametro_ext}</td> 
                                        {datos.finalizado !== false && <td style={{ backgroundColor: '#DBFAC9' }}>{linea.nuevo_diametro_ext}</td>}
                                        <td>{linea.ancho}</td>
                                        {datos.finalizado !== false && <td style={{ backgroundColor: '#DBFAC9' }}>{linea.nuevo_ancho}</td>} 
                                        <td>{linea.centro}</td>
                                        {datos.finalizado !== false && <td style={{ backgroundColor: '#DBFAC9' }}>{linea.nuevo_centro}</td>}
                                        <td>{linea.instancia.rodillo.num_ejes}</td> 
                                        {datos.finalizado !== false && <td style={{ backgroundColor: '#DBFAC9' }}>{linea.rectificado_por?linea.rectificado_por.get_full_name:''}</td>} 
                                        <td>
                                            <Form.Group controlId="fecha_estimada">
                                                <Form.Control type="date" 
                                                            name='fecha_estimada' 
                                                            value={linea.fecha}
                                                            onChange={handleInputChange_fecha_rectificado(linea)} 
                                                            placeholder="Fecha estimada" 
                                                            disabled={linea.finalizado===true?true:false}/>
                                            </Form.Group>
                                        </td>
                                        {datos.finalizado !== false && <td style={{ backgroundColor: '#DBFAC9' }}>{linea.fecha_rectificado?invertirFecha(String(linea.fecha_rectificado)):''}</td>} 
                                        <td>
                                            <Form.Group controlId="archivo">
                                                {linea.archivo && (
                                                    <Form.Text >
                                                        Archivo guardado: 
                                                        <a href={linea.archivo} target="_blank" rel="noopener noreferrer">
                                                            {linea.archivo.split('/').pop()}
                                                        </a>
                                                    </Form.Text>
                                                )}
                                                {linea.finalizado === false ?
                                                    <>
                                                        <input
                                                        type="file"
                                                        id={`file-input-${linea.id}`}
                                                        style={{ display: "none" }}
                                                        onChange={handleInputChange_archivo(linea)}
                                                        />
                                                        <CloudArrowUp
                                                        className="mr-3 pencil"
                                                        onClick={() => document.getElementById(`file-input-${linea.id}`).click()}
                                                        />
                                                    </>
                                                :''}
                                            </Form.Group>
                                            {linea.fuera === true && 
                                                <Form.Group controlId="proveedor">
                                                    <Form.Label>Proveedor</Form.Label>
                                                    <Form.Control as="select" 
                                                                    value={linea.proveedor?linea.proveedor.id || linea.proveedor:'' || ""}
                                                                    name='proveedor'
                                                                    onChange={handleInputChange_proveedor(linea)}
                                                                    className="dropdown-green">
                                                        <option key={0} value={''}>Todos</option>
                                                        {proveedores && proveedores.map(proveedor => {
                                                            return (
                                                                <option key={proveedor.id} value={proveedor.id}>
                                                                    {proveedor.nombre}
                                                                </option>
                                                            )
                                                        })}
                                                    </Form.Control>
                                                </Form.Group>
                                            }
                                        </td>  
                                        {datos.finalizado === false?
                                            <td>
                                                <Form.Group controlId="fuera">
                                                    <Form.Control as="select" 
                                                                value={linea.fuera}
                                                                name='fuera'
                                                                onChange={handleInputChange_fuera(linea)}
                                                                disabled={linea.fuera}>
                                                        <option key={1} value={true}>Si</option>
                                                        <option key={2} value={false}>No</option>
                                                    </Form.Control>
                                                </Form.Group>
                                            </td>
                                        :''}                       
                                    </tr>
                            )})}
                        </tbody>
                    </Table>
                </Col>                
            </Row>
        </Container>
    )
}

export default RodInstanciasRectificar;