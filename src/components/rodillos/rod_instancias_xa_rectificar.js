import React, { useEffect, useState } from 'react';
import { Row, Col, Form, Container, Table } from 'react-bootstrap';
import { Tools, CloudDownload } from 'react-bootstrap-icons';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';
import {invertirFecha} from '../utilidades/funciones_fecha';
import RodCerrarRectificado from './rod_rectificado_cerrar';
import logo from '../../assets/Bornay.svg';
import logoTuf from '../../assets/logo_tuflesa.svg';
import debounce from 'lodash.debounce';

const RodInstanciasXaRectificar = () => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);

    const [lineas_rectificacion, setLineasRectificacion] = useState([]);
    const [operaciones, setOperaciones] = useState([]);
    const [empresas, setEmpresas] = useState([user['tec-user'].perfil.empresa.id]);
    const [secciones, setSecciones] = useState([]);
    const [zonas, setZonas] = useState([]);
    const [filtro, setFiltro] = useState(`?finalizado=${false}&instancia__rodillo__operacion__seccion__maquina__empresa__id=${[user['tec-user'].perfil.empresa.id]}`);
    const [abrirFiltro, setabrirFiltro] = useState(false);
    const [show_datos_nuevos, setShowDatosNuevos] = useState(false);
    const [hoy] = useState(new Date());
    const soyMantenimiento = user['tec-user'].perfil.puesto.nombre==='Mantenimiento'?true:false;
    const [proveedores, setProveedores] = useState([]);
    const [datos_finalizar, setDatosFinalizar] = useState([]);

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
        proveedor: '',
    });

    useEffect(()=>{
        axios.get(BACKEND_SERVER + `/api/rodillos/listado_linea_rectificacion`+filtro,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }
        })
        .then( res => {
            setLineasRectificacion(res.data);
        })
        .catch( err => {
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

    useEffect(()=>{
        const filtro = `?finalizado=${datos.finalizado}&instancia__id=${datos.id_instancia}&proveedor=${datos.proveedor}&instancia__rodillo__operacion__seccion__maquina__empresa__id=${datos.empresa}&instancia__rodillo__operacion__seccion__maquina__id=${datos.maquina}&instancia__rodillo__operacion__seccion__id=${datos.seccion}&instancia__rodillo__operacion__id=${datos.operacion}&instancia__nombre__icontains=${datos.nombre}&full_name=${datos.rectificado_por?datos.rectificado_por:''}`
        actualizaFiltro(filtro);
    },[datos.finalizado, datos.id_instancia, datos.proveedor, datos.empresa, datos.maquina, datos.seccion, datos.operacion]);

    useEffect(() => {
        const debounceFiltro = debounce(() => {
            const filtro = `?finalizado=${datos.finalizado}&instancia__id=${datos.id_instancia}&proveedor=${datos.proveedor}&instancia__rodillo__operacion__seccion__maquina__empresa__id=${datos.empresa}&instancia__rodillo__operacion__seccion__maquina__id=${datos.maquina}&instancia__rodillo__operacion__seccion__id=${datos.seccion}&instancia__rodillo__operacion__id=${datos.operacion}&instancia__nombre__icontains=${datos.nombre}&full_name=${datos.rectificado_por || ''}`;
            actualizaFiltro(filtro);
        }, 500);

        debounceFiltro();

        return () => debounceFiltro.cancel();
    }, [datos.nombre, datos.rectificado_por]);

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
            axios.get(BACKEND_SERVER + `/api/estructura/zona/?empresa=${datos.empresa}&es_maquina_tubo=${true}`,{
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
            [name]: name === 'finalizado' ? (value === '' ? undefined : value === 'true') : value  // Convierte el valor en booleano o undefined para finalizado
        }));
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
    
    async function descargarArchivo(url) {
        try {
            // Primero eliminar el contenido de la carpeta
            //await eliminarContenido();
    
            // Luego, proceder a descargar el archivo
            const response = await fetch(url, { mode: 'no-cors' });
            const blob = await response.blob();
            const urlBlob = window.URL.createObjectURL(blob);
    
            const link = document.createElement('a');
            link.href = urlBlob;
            link.download = url.split('/').pop();
            document.body.appendChild(link);
            link.click();
    
            // Limpia
            link.remove();
            window.URL.revokeObjectURL(urlBlob);
        } catch (error) {
            console.error("Error al descargar el archivo:", error);
        }
    }    

    async function eliminarContenido() {
        try {
            const response = await fetch(BACKEND_SERVER + `/api/rodillos/eliminar/eliminar_archivos/`, { //llamada diferente por la programación del back, solo está en views y urls
                method: 'POST',
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }
            });
            if (!response.ok) {
                throw new Error('Error al eliminar los archivos');
            }
        } catch (error) {
            console.error('Error en la eliminación:', error);
            throw error;
        }
    }   
    
    const FinalizoRodillo = (linea) => { 
        setDatosFinalizar(linea);
        setShowDatosNuevos(true);
    }

    const abroFiltro = () => {
        setabrirFiltro(!abrirFiltro);
    }

    const CerrarModal = () => {
        setShowDatosNuevos(false);
    }

    const Actualizo_LineasRectificacion_obs = (linea, observaciones) => {
        axios.patch(BACKEND_SERVER + `/api/rodillos/linea_rectificacion/${linea.id}/`, { //Actualizamos observaciones
            observaciones: observaciones,
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }     
        })
        .then( res => {  
            
        })
        .catch(err => { 
            console.error(err);
        })

    };

    const handleInputChange_observaciones = (linea, event) => {
        const { value } = event.target; // Valor del campo
        Actualizo_LineasRectificacion_obs(linea,value);
        setLineasRectificacion((prevLineas) =>
            prevLineas.map((item) =>
                item.instancia.id === linea.instancia.id
                    ? { ...item, observaciones: value } // Actualizar solo la línea modificada
                    : item
            )
        );
    };

    return(
        <Container className='mt-5 pt-1'>
            <img src ={user['tec-user'].perfil.empresa.id===1?logo:logoTuf} width="200" height="200"></img><br></br>
            <button type="button" className='mt-5' onClick={event => {abroFiltro()}}>Ver Filtros</button>
            {abrirFiltro? 
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
            :''}
            {abrirFiltro? 
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
            :''}
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
            <Row>
                <Col>
                    <h5 className="mb-3 mt-3">Lista de Rodillos xa rectificar</h5>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Diámetro Fondo</th> 
                                {datos.finalizado !== false && <th style={{ backgroundColor: '#DBFAC9' }}>Nuevo Diámetro Fondo</th>}                                
                                <th>Diámetro Exterior</th>
                                {datos.finalizado !== false && <th style={{ backgroundColor: '#DBFAC9' }}>Nuevo Diámetro Exterior</th>}
                                <th>Ancho</th>
                                {datos.finalizado !== false && <th style={{ backgroundColor: '#DBFAC9' }}>Nuevo Ancho</th>}
                                <th>Num rodillos</th>
                                {datos.finalizado !== false && <th style={{ backgroundColor: '#DBFAC9' }}>Rectificado por</th>}
                                <th>Fecha estimada</th>
                                {datos.finalizado !== false && <th style={{ backgroundColor: '#DBFAC9' }}>Fecha Rectificado</th>}
                                <th>Observaciones</th>
                                <th>Archivo rectificado</th>
                                {datos.finalizado === false && <th>Acciones</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {lineas_rectificacion.map(linea => {
                                return (
                                    <tr key={linea.id}>
                                        <td>{linea.instancia.nombre}</td>
                                        <td>{linea.diametro}</td>
                                        {datos.finalizado !== false && <td style={{ backgroundColor: '#DBFAC9' }}>{linea.nuevo_diametro}</td>}
                                        <td>{linea.diametro_ext}</td> 
                                        {datos.finalizado !== false && <td style={{ backgroundColor: '#DBFAC9' }}>{linea.nuevo_diametro_ext}</td>}
                                        <td>{linea.ancho}</td>
                                        {datos.finalizado !== false && <td style={{ backgroundColor: '#DBFAC9' }}>{linea.nuevo_ancho}</td>} 
                                        <td>{linea.instancia.rodillo.num_ejes}</td> 
                                        {datos.finalizado !== false && <td style={{ backgroundColor: '#DBFAC9' }}>{linea.rectificado_por ? linea.rectificado_por.get_full_name : ''}</td>} 
                                        <td>
                                            <Form.Group controlId="fecha_estimada">
                                                <Form.Control type="date" 
                                                            name='fecha_estimada' 
                                                            value={linea.fecha}
                                                            onChange={handleInputChange_fecha_rectificado(linea)} 
                                                            placeholder="Fecha estimada" 
                                                            disabled={linea.finalizado === true ? true : soyMantenimiento?true:false}/>
                                            </Form.Group>
                                        </td>
                                        {datos.finalizado !== false && <td style={{ backgroundColor: '#DBFAC9' }}>{linea.fecha_rectificado ? invertirFecha(String(linea.fecha_rectificado)) : ''}</td>} 
                                        <td>
                                            <Form.Group controlId="observaciones">
                                                <Form.Control
                                                    as="textarea"
                                                    rows={2} // Establece una altura inicial
                                                    name="observaciones"
                                                    value={linea.observaciones}
                                                    onChange={(e) => handleInputChange_observaciones(linea, e)}
                                                    onInput={(e) => {
                                                        e.target.style.height = "auto"; // Restablece la altura para calcular la nueva
                                                        e.target.style.height = `${e.target.scrollHeight}px`; // Ajusta según el contenido
                                                    }}
                                                    placeholder="Observaciones"
                                                    disabled={linea.finalizado === true ? true : soyMantenimiento?true:false}
                                                    //style={{ resize: "none" }} // impide que el usuario cambie el tamaño manualmente
                                                />
                                            </Form.Group>
                                        </td>
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
                                                <>
                                                    <input
                                                        type="file"
                                                        id={`file-input-${linea.id}`}
                                                        style={{ display: "none" }}
                                                        />
                                                    <CloudDownload className="mr-3 pencil"  onClick={() => descargarArchivo(linea.archivo)}/>
                                                    {linea.proveedor?<tr style={{ color: 'red' }}>Proveedor: {linea.proveedor.nombre}</tr>:''}
                                                </>
                                            </Form.Group>
                                        </td>
                                        {datos.finalizado === false && <td><Tools className="mr-3 pencil"  onClick={event =>{FinalizoRodillo(linea)}}/></td>}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                </Col>                
            </Row>
            {show_datos_nuevos?
                <RodCerrarRectificado    
                        show={show_datos_nuevos}
                        datos_finalizar={datos_finalizar}
                        CerrarModal={CerrarModal}
                        donde={'vengo de xa rectificar'}
                        lineas_rectificacion={lineas_rectificacion}/>
            :null}
        </Container>
    )
}

export default RodInstanciasXaRectificar;