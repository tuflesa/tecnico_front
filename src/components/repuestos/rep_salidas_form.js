import React , { useState, useEffect } from "react";
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { Link, useHistory } from 'react-router-dom';
import { BACKEND_SERVER } from '../../constantes';
import { Container, Row, Col, Table, Button, Form } from 'react-bootstrap';
import { Trash, PlusSquare, DashSquare, PlusCircle, PencilFill } from 'react-bootstrap-icons';
import BuscarRepuestos from "./rep_salida_buscar";
import LineaGastosMantenimiento from "../mantenimiento/man_linea_gastos";

const RepSalidas = ({alm}) => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);
    const history = useHistory();

    const [almacenes, setAlmacenes] = useState(null);
    const [show_listrepuestos, setShowListRepuestos] = useState(null);
    const [lineasSalida, setLineasSalida] = useState([]);
    const [lineasGastos, setLineasGastos] = useState([]);
    const [cambioCodigo, setCambioCodigo] = useState(false);
    const [almacenesBloqueado, setAlmacenesBloqueado] = useState(false);
    const [salida, setSalida] = useState(null);
    const [num_parte, setNum_parte] = useState(null);
    const [id_parte, setID_parte] = useState(null);
    const soyMentenimiento = user['tec-user'].perfil.puesto.nombre==='Director Técnico'||user['tec-user'].perfil.puesto.nombre==='Técnico'||user['tec-user'].perfil.puesto.nombre==='Mantenimiento'?true:false;
    const [linea_completa, setLineaCompleta] = useState(null);
    const [linea_GastoEditar, setLineaGastoEditar] = useState(null);
    const [show_linea_mantenimiento, setShowLineaMantenimiento] = useState(false);
    const [lineasSalida_anteriores, setLineasSalidasAnteriores] = useState([]);

    const [numeroBar, setNumeroBar] = useState({
        id: '',
        almacen:'',
        idCod: '',
    });
    const [datos, setDatos] = useState({
        usuario: user['tec-user'],
        almacen: '',
        id: '',
        nombre: '',
        stock: '',
        critico: '',
        cantidad: '',
        usuario_elegido: '',
        observaciones:'',
    }); 

    useEffect(()=>{
        // Cargar gastos existentes si venimos de mantenimiento
        if (num_parte && id_parte) {
            axios.get(BACKEND_SERVER + `/api/mantenimiento/lineas_gastos/?parte=${id_parte}`, {
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }     
            })
            .then(res => { 
                setLineasGastos(res.data);
            })
            .catch(err => { console.log(err);})
        }
    },[num_parte, id_parte, token]);

    useEffect(()=>{
        // Cargar lineas de salida existentes si venimos de mantenimiento
        if (num_parte && id_parte) {
            axios.get(BACKEND_SERVER + `/api/repuestos/lineas_salidas/?salida__num_parte__id=${id_parte}`, {
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }     
            })
            .then(res => { 
                setLineasSalidasAnteriores(res.data);
            })
            .catch(err => { console.log(err);})
        }
    },[num_parte, id_parte, token]);

    useEffect(() => {
        const limpiarStorage = () => {
            sessionStorage.removeItem('parte');
            sessionStorage.removeItem('datos_salida');
        };

        window.addEventListener('beforeunload', limpiarStorage);

        return () => {
            window.removeEventListener('beforeunload', limpiarStorage);
            limpiarStorage();
        };
    }, []);

    useEffect(() => {
        const datosStr = sessionStorage.getItem('datos_salida');
        if (datosStr) {
            const datosRecuperados = JSON.parse(datosStr);
            setNum_parte(datosRecuperados?.parte?.num_parte);
            setID_parte(datosRecuperados?.parte?.id);
            setLineaCompleta(datosRecuperados?.linea_completa);
            
            if (datosRecuperados?.linea_completa?.observaciones_trab) {
                setDatos(prevDatos => ({
                    ...prevDatos,
                    observaciones: datosRecuperados.linea_completa.observaciones_trab
                }));
            }
        }
    }, []);

    useEffect(()=>{
        axios.get(BACKEND_SERVER + `/api/repuestos/almacen/?empresa=${datos.usuario.perfil.empresa.id}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => { 
            let newAlmacenes = [];
            if (alm) {
                newAlmacenes = res.data.filter( a => a.id === parseInt(alm));
                setNumeroBar({
                    ...numeroBar,
                    almacen: alm
                })
                setAlmacenesBloqueado(true);
            }
            else newAlmacenes = res.data;
            setAlmacenes(newAlmacenes); 
        })
        .catch(err => { console.log(err);})
    },[token, alm]);
    
    useEffect(()=>{
        datos.id && datos.almacen && axios.get(BACKEND_SERVER + `/api/repuestos/stocks_minimos/?repuesto=${datos.id}&almacen=${datos.almacen}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }
        })
        .then( res => {
            if(res.data.length === 0){
                alert('Este Repuesto NO existe en este almacen, revise almacen seleccionado');
                numeroBar.id='';
                numeroBar.almacen='';
                numeroBar.codRepuesto='';
                datos.id='';
                datos.almacen='';
            }
            else{
                axios.get(BACKEND_SERVER + `/api/repuestos/detalle/${res.data[0].repuesto}/`,{
                    headers: {
                        'Authorization': `token ${token['tec-token']}`
                        }
                })
                .then( r => {
                    const repuestoRepetido = lineasSalida.filter(l => l.repuesto === datos.id);
                    if( repuestoRepetido.length===0){
                        setLineasSalida([...lineasSalida, {
                            repuesto: datos.id, 
                            almacen: datos.almacen, 
                            cantidad: 1,
                            nombre: r.data.nombre,
                            stock: res.data[0].stock_act,
                            critico: r.data.es_critico ? 'Si' : 'No' }]);
                    }
                    else {
                        const newLineas = [...lineasSalida];
                        newLineas.forEach( l => {
                            if (l.repuesto === res.data[0].repuesto) l.cantidad = l.cantidad + 1;
                        });
                        setLineasSalida(newLineas);
                    }
                })
                .catch( err => {
                    console.log(err);
                });
            }
        })
        .catch( err => {
            console.log(err);
        });
    }, [token, cambioCodigo]);

    const handleInputChange = (event) => { 
        setNumeroBar ({
            ...numeroBar,
            [event.target.name] : event.target.value                
        });
        if(numeroBar.id.length===11){
            setDatos({
                ...datos,
                id: parseInt(numeroBar.id),
                almacen: numeroBar.almacen
            });
            setNumeroBar({
                ...numeroBar,
                id: ''
            });
            setCambioCodigo(!cambioCodigo);
        }
    }

    const updateCantidad = (cantidad, linea) => {
        const newLineas = [...lineasSalida];
        newLineas.forEach( l => {
            if (l.repuesto === linea.repuesto){
                l.cantidad += cantidad;
                if (l.cantidad < 1) l.cantidad = 1;
            } 
        });
        setLineasSalida(newLineas);
    }

    const borrarLinea = (linea) => {
        const newLineas = lineasSalida.filter( l => l.repuesto !== linea.repuesto);
        setLineasSalida(newLineas);
    }

    const agregarLineaGasto = (lineaGasto) => {
        if (lineaGasto.id) {
            // Si tiene id, es una edición
            const nuevasLineas = lineasGastos.map(l => 
                l.id === lineaGasto.id ? lineaGasto : l
            );
            setLineasGastos(nuevasLineas);
        } else {
            const nuevaLinea = {
                ...lineaGasto,
                id: `temp_${Date.now()}`, // ID temporal
                esNueva: true
            };
            setLineasGastos([...lineasGastos, nuevaLinea]);
        }
    }

    const borrarLineaGasto = (linea) => {
        if (window.confirm('¿Está seguro de eliminar esta línea de gasto?')) {
            const nuevasLineas = lineasGastos.filter(l => l.id !== linea.id);
            setLineasGastos(nuevasLineas);
            axios.delete(BACKEND_SERVER + `/api/mantenimiento/lineas_gastos/${linea.id}/`, {
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }     
            })
            .then(res => { 
            })
            .catch(err => { console.log(err);})
        }
    }

    const editarLineaGasto = (linea) => {
        setLineaGastoEditar(linea);
        setShowLineaMantenimiento(true);
    }

    const grabarLineasGastos = async () => {
        if (lineasGastos.length === 0) return;

        try {
            const promises = lineasGastos.map(async (linea) => {
                if (linea.esNueva) {
                    return axios.post(
                        BACKEND_SERVER + `/api/mantenimiento/gastos/`,
                        {
                            parte: id_parte,
                            linea: linea_completa?linea_completa.id?linea_completa.id:'':'',
                            descripcion: linea.descripcion,
                            cantidad: parseFloat(linea.cantidad),
                            precio: parseFloat(linea.precio),
                            descuento: parseFloat(linea.descuento),
                            total: parseFloat(linea.total),
                            //creado_por: user['tec-user'].id,
                            creado_por: linea.creado_por,
                        },
                        {
                            headers: {
                                'Authorization': `token ${token['tec-token']}`
                            }
                        }
                    )
                    .then(res => {
                        console.log(res.data)
                    })
                } else {
                    // Actualizar línea existente
                    return axios.patch(
                        BACKEND_SERVER + `/api/mantenimiento/gastos/${linea.id}/`,
                        {
                            parte: id_parte,
                            linea: linea_completa?linea_completa.id?linea_completa.id:'':'',
                            descripcion: linea.descripcion,
                            cantidad: parseFloat(linea.cantidad),
                            precio: parseFloat(linea.precio),
                            descuento: parseFloat(linea.descuento),
                            total: parseFloat(linea.total),
                            //creado_por: linea.creado_por? linea.creado_por : user['tec-user'].id,
                            creado_por: typeof linea.creado_por === 'object' ? linea.creado_por?.id : linea.creado_por || user['tec-user'].id,
                        },
                        {
                            headers: {
                                'Authorization': `token ${token['tec-token']}`
                            }
                        }
                    );
                }
            });

            await Promise.all(promises);
            
        } catch (err) {
            console.error('Error al guardar líneas de gastos:', err);
            throw err;
        }
    }
   
    const GenerarSalida = async () => {
        try {
            // 1. Grabar líneas de gastos si existen
            if (num_parte && lineasGastos.length > 0) {
                await grabarLineasGastos();
            }

            if (lineasSalida.length > 0) {                
                // Obtener todos los precios y descuentos de una vez
                const repuestoIds = lineasSalida.map(l => l.repuesto);
                let preciosMap = {};
                let descuentosMap = {};
                
                try {
                    const preciosRes = await axios.post(
                        BACKEND_SERVER + `/api/repuestos/precios-batch/`,
                        { repuestos: repuestoIds },
                        { 
                            headers: { 
                                'Authorization': `token ${token['tec-token']}` 
                            } 
                        }
                    );
                    preciosMap = preciosRes.data.precios || {};
                    descuentosMap = preciosRes.data.descuentos || {};
                } catch (err) {
                    console.warn('No se pudieron obtener los precios:', err);
                    console.error('Detalles del error:', err.response?.data);
                }
                
                const salidaRes = await axios.post(BACKEND_SERVER + `/api/repuestos/salida/`, {
                    nombre: 'Salida de almacen',
                    responsable: datos.usuario_elegido ? datos.usuario_elegido : user['tec-user'].id,
                    num_parte: id_parte ? id_parte : '',
                    num_linea_tarea: linea_completa ? linea_completa.id : '',
                }, {
                    headers: {
                        'Authorization': `token ${token['tec-token']}`
                    }     
                });
                
                const promises = lineasSalida.map(async (l) => {
                    // Obtener precio y descuento para este repuesto
                    const precio = preciosMap[l.repuesto] || 0;
                    const descuento = descuentosMap[l.repuesto] || 0;                    
                    const lineaRes = await axios.post(BACKEND_SERVER + `/api/repuestos/lineasalida/`, {
                        salida: salidaRes.data.id,
                        repuesto: l.repuesto,
                        almacen: l.almacen,
                        cantidad: l.cantidad,
                        consumido_en: l.consumido_en,
                        precio_ultima_compra: precio ? parseFloat(precio.toFixed(2)) : null,
                        descuento_ultima_compra: descuento ? parseFloat(descuento.toFixed(2)) : null,
                    }, {
                        headers: {
                            'Authorization': `token ${token['tec-token']}`
                        }     
                    });

                    await axios.post(BACKEND_SERVER + `/api/repuestos/movimiento/`, {
                        cantidad: -lineaRes.data.cantidad,
                        almacen: lineaRes.data.almacen,
                        usuario: salidaRes.data.responsable,
                        linea_salida: lineaRes.data.id
                    }, {
                        headers: {
                            'Authorization': `token ${token['tec-token']}`
                        }     
                    });
                });

                await Promise.all(promises);
                alert("Salida realizada con éxito!!!!");
            }

            // 3. Guardar observaciones si venimos de mantenimiento
            if (num_parte && linea_completa) {
                const datosRetorno = {
                    observaciones: datos.observaciones,
                    volverConObservacion: true,
                    linea_completa: linea_completa 
                };
                sessionStorage.setItem('datos_retorno_salida', JSON.stringify(datosRetorno));
                sessionStorage.removeItem('parte');
                sessionStorage.removeItem('datos_salida');
            }
            
            if (lineasSalida.length === 0 && lineasGastos.length > 0) {
                alert("Gastos guardados con éxito!!!!");
            }
            
            window.location.href = "javascript:history.go(-1)";

        } catch (err) {
            console.log(err);
            alert("Error al procesar la operación: " + (err.response?.data?.detail || err.message));
        }
    }

    const aceptar = async () => {
        try {
            // 1. Grabar líneas de gastos si existen
            if (num_parte && lineasGastos.length > 0) {
                await grabarLineasGastos();
            }

            // 2. Guardar observaciones
            const datosRetorno = {
                observaciones: datos.observaciones,
                volverConObservacion: true,
                linea_completa: linea_completa 
            };
            sessionStorage.setItem('datos_retorno_salida', JSON.stringify(datosRetorno));
            
            // Limpiar datos de entrada
            sessionStorage.removeItem('parte');
            sessionStorage.removeItem('datos_salida');
            
            // Mensaje de éxito
            if (lineasGastos.length > 0) {
                alert("Datos guardados con éxito!!!!");
            }
            
            // Volver
            window.location.href = "javascript:history.go(-1)";
            
        } catch (err) {
            console.log(err);
            alert("Error al guardar los datos: " + (err.response?.data?.detail || err.message));
        }
    }

    const abrirListRepuestos = () => {
        setShowListRepuestos(true);
    }

    const cerrarListRepuestos = () => {
        setShowListRepuestos(false);
    }

    const abrirListMantenimiento = () => {
        setLineaGastoEditar(null); // Limpiar para crear nueva
        setShowLineaMantenimiento(true);
    }

    const cerrarListMantenimiento = () => {
        setShowLineaMantenimiento(false);
        setLineaGastoEditar(null);
    }

    const elegirRepuesto = (r) => {      
        datos.id=r;
        datos.almacen=numeroBar.almacen;
        setCambioCodigo(!cambioCodigo);
        cerrarListRepuestos();      
    }

    const cancelar = ()=>{
        sessionStorage.removeItem('parte');
        sessionStorage.removeItem('datos_salida');
        setNum_parte(null)
        setLineaCompleta(null)
        setID_parte(null);
        if (soyMentenimiento) {
            window.location.href = "javascript:history.go(-1)";
        } else {
            history.push('/home');
        }
    }

    const handleInputChangeText = (event) => {
        setDatos({
            ...datos,
            [event.target.name]: event.target.value
        });
    };

    const formatNumber = (numero) =>{
        return new Intl.NumberFormat('de-DE',{ style: 'currency', currency: 'EUR' }).format(numero)
    }

    //Calcular total de gastos
    const calcularTotalGastos = () => {
        return lineasGastos.reduce((total, linea) => total + parseFloat(linea.total || 0), 0);
    }

    return (
        <Container className="mt-5">
            <Row>
                {num_parte?
                    <Col xs="auto">
                        <Form.Group controlId="num_parte">
                            <Form.Label>Número Parte</Form.Label>
                            <Form.Control type="text" 
                                        name='num_parte' 
                                        disabled
                                        value={num_parte}
                                        style={{ width: 'fit-content' }}/>
                        </Form.Group>
                    </Col>
                :''}   
                {num_parte?
                    <Col xs="auto">
                        <Form.Group controlId="linea">
                            <Form.Label>Tarea</Form.Label>
                            <Form.Control type="text" 
                                        name='linea' 
                                        disabled
                                        value={linea_completa?.tarea.nombre}/>
                        </Form.Group>
                    </Col>
                :''} 
            </Row>
            <Row>  
                {num_parte && linea_completa?
                    <Col>
                        <Form.Group id="observaciones">
                            <Form.Label>Conclusiones Personal Mantenimiento</Form.Label>
                            <Form.Control 
                                as="textarea" 
                                rows={3}
                                name='observaciones' 
                                value={datos.observaciones}
                                onChange={handleInputChangeText} 
                                placeholder="Conclusiones"
                            />
                        </Form.Group>
                    </Col>
                :''}
            </Row>

            <Row>                
                <Col>
                    <Form.Group>
                        <Form.Label className="mt-2">Almacén</Form.Label>
                        <Form.Control as="select"
                                    tabIndex={1}  
                                    name='almacen' 
                                    value={numeroBar.almacen}
                                    disabled = {lineasSalida.length>0 || almacenesBloqueado}
                                    placeholder="Almacén"
                                    onChange={handleInputChange}
                                    autoFocus> 
                                    {!alm && <option key={0} value={''}>
                                            ----
                                    </option>}
                                    {almacenes && almacenes.map( almacen => {
                                        return (
                                        <option key={almacen.id} value={almacen.id}>
                                            {almacen.nombre}                                            
                                        </option>                                        
                                        )
                                    })}                                                                                                                                                          
                        </Form.Control>
                    </Form.Group>
                </Col>     
                {numeroBar.almacen ?                            
                <Col>
                    <Form.Group>
                        <Form.Label className="mt-2">Código Barras (con lector) </Form.Label>
                        <Form.Control
                                    type="text"
                                    id="prueba"
                                    tabIndex={2}
                                    name='id' 
                                    value={numeroBar.id}
                                    onChange={handleInputChange}
                                    placeholder="Codigo de barras" 
                                    autoFocus/>
                    </Form.Group>
                </Col>: null}                    
                <Col >
                <br></br>
                    {numeroBar.almacen? <Button variant="info" tabIndex={3} className={'btn-lg'} onClick={event => {abrirListRepuestos()}}>Buscar Repuesto</Button> : null}                 
                </Col>
            </Row>  
            <Row>
                <Col>
                    <h5 className="mb-3 mt-3">Lista de Repuestos</h5>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Stock Actual</th>                                
                                <th>Crítico</th>
                                <th>Cantidad</th>
                                <th>Consumido en:</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lineasSalida.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center text-muted">
                                        No hay repuestos en la lista
                                    </td>
                                </tr>
                            ) : (
                                lineasSalida.map((linea, index)  => {
                                    return (
                                        <tr key={index}>
                                            <td>{linea.nombre}</td>
                                            <td>{linea.stock}</td>
                                            <td>{linea.critico}</td> 
                                            <td>{linea.cantidad}</td> 
                                            <td>
                                                <Form.Control
                                                    type="text"
                                                    value={linea.consumido_en || ""}
                                                    onChange={e => {
                                                        const nuevasLineas = [...lineasSalida];
                                                        nuevasLineas[index] = {
                                                            ...nuevasLineas[index],
                                                            consumido_en: e.target.value,
                                                        };
                                                        setLineasSalida(nuevasLineas);
                                                    }}
                                                />
                                            </td>  
                                            <td>
                                                <PlusSquare className="mr-3 pencil"  onClick={event => {updateCantidad(1, linea)}} />
                                                <DashSquare className="mr-3 pencil"  onClick={event => {updateCantidad(-1, linea)}} />
                                                <Trash className="mr-3 pencil"  onClick={event => {borrarLinea(linea)}} />
                                            </td>                             
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </Table>
                </Col>                
            </Row>
            {num_parte && lineasSalida_anteriores.length !== 0?
                <Row>
                    <Col>
                        <h5 className="mb-3 mt-3">Lista de Repuestos descontados anterioremente</h5>
                        <Table bordered hover>
                            <thead>
                                <tr>
                                    <th>Repuesto</th> 
                                    <th>Cantidad</th>
                                    <th>Precio</th>
                                    <th>Descuento</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lineasSalida_anteriores.map((linea, index)  => {
                                        return (
                                            <tr key={index}>
                                                <td>{linea.repuesto.nombre}</td>
                                                <td>{linea.cantidad}</td> 
                                                <td>{linea.precio_ultima_compra? Number(linea.precio_ultima_compra).toFixed(2) + '€':0.00 + '€'}</td> 
                                                <td>{linea.descuento_ultima_compra? linea.descuento_ultima_compra + '€':0.00 + '%'}</td>    
                                                <td>{Number((linea.precio_ultima_compra * linea.cantidad)-(linea.precio_ultima_compra * linea.cantidad*linea.descuento_ultima_compra/100)).toFixed(2) + '€'}</td>                        
                                            </tr>
                                        )
                                    })
                                }
                            </tbody>
                        </Table>
                    </Col>                
                </Row>
            :null}
            {num_parte? (
                <>
                    <Row>
                        <Col>
                            <h5 className="pb-3 pt-1 mt-2">Gastos de Mantenimiento:</h5>
                        </Col>
                        <Col className="d-flex flex-row-reverse align-content-center flex-wrap">
                            <PlusCircle className="plus mr-2" size={30} onClick={abrirListMantenimiento}/>
                        </Col>
                    </Row>
                    <Table bordered hover>
                        <thead>
                            <tr>
                                <th>Descripción</th>
                                <th >Cantidad</th>
                                <th >Precio</th>
                                <th >Descuento</th>
                                <th >Total</th>
                                <th >Acciones</th>
                            </tr>
                        </thead> 
                        <tbody>
                            {lineasGastos.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center text-muted">
                                        No hay gastos registrados
                                    </td>
                                </tr>
                            ) : (
                                lineasGastos.map((lineaGasto) => {
                                    return (
                                        <tr key={lineaGasto.id}>
                                            <td>{lineaGasto.descripcion}</td>
                                            <td>{parseFloat(lineaGasto.cantidad).toFixed(2)}</td>
                                            <td>{Number(lineaGasto.precio).toFixed(2)}</td>
                                            <td>{lineaGasto.descuento}%</td>
                                            <td>{Number(lineaGasto.total).toFixed(2)}</td>
                                            <td>
                                                <PencilFill className="mr-3 pencil" onClick={() => editarLineaGasto(lineaGasto)}/>
                                                <Trash className="trash" onClick={() => borrarLineaGasto(lineaGasto)} />
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </Table>
                </>
            ):null}

            <Form.Row className="justify-content-center mt-4">
                {(lineasSalida.length > 0 || lineasGastos.length > 0) ? 
                    <Button variant="info" type="submit" className={'mx-2'} onClick={GenerarSalida}>
                        {num_parte ? 'Hacer Salida / Guardar Todo' : 'Hacer Salida'}
                    </Button> :
                    num_parte ? <Button variant="warning" type="submit" className={'mx-2'} onClick={aceptar}>Aceptar</Button> : ''
                }
                <Button variant="warning" onClick={cancelar}>Cancelar</Button>               
            </Form.Row>

            <BuscarRepuestos    
                show={show_listrepuestos}
                cerrarListRepuestos={cerrarListRepuestos}
                almacen={numeroBar.almacen}
                elegirRepuesto={elegirRepuesto}
            /> 
            
            {num_parte? (
                <LineaGastosMantenimiento  
                    show={show_linea_mantenimiento}
                    num_parte={{id: id_parte}}
                    num_linea_tarea={linea_completa}
                    cerrarListMantenimiento={cerrarListMantenimiento}
                    linea_mantenimiento={linea_GastoEditar}
                    agregarLineaGasto={agregarLineaGasto}
                />
            ):null}
        </Container>
    )
}

export default RepSalidas;