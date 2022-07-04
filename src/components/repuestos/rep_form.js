import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import { PlusCircle, Trash, GeoAltFill, Receipt} from 'react-bootstrap-icons';
import './repuestos.css';
import StockMinimoForm from './rep_stock_minimo';
import EquipoForm from './rep_equipo';
import ProveedorForm from './rep_proveedor';
import RepPorAlmacen from './rep_por_almacen';
import { useBarcode } from 'react-barcodes';

const RepuestoForm = ({repuesto, setRepuesto}) => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);

    const [datos, setDatos] = useState({
        id: repuesto.id ? repuesto.id : null,
        nombre: repuesto.nombre,
        nombre_comun: repuesto.nombre_comun? repuesto.nombre_comun : '',
        fabricante: repuesto.fabricante ? repuesto.fabricante : '',
        modelo: repuesto.modelo ? repuesto.modelo : '',
        //stock: repuesto.stock,
        stock_T: 0,
        stocks_minimos: repuesto.stocks_minimos,
        es_critico: repuesto.es_critico,
        descatalogado: repuesto.descatalogado,
        tipo_repuesto: repuesto.tipo_repuesto,
        tipo_unidad: repuesto.tipo_unidad,
        equipos: repuesto.equipos,
        proveedores: repuesto.proveedores,
        observaciones: repuesto.observaciones ? repuesto.observaciones : ''
    });
    const [tiposRepuesto, setTiposRepuesto] = useState(null);
    const [tiposUnidad, setTiposUnidad] = useState(null);
    const [show_stock, setShowStock] = useState(false);
    const [show_equipo, setShowEquipo] = useState(false);
    const [show_proveedor, setShowProveedor] = useState(false);
    const [stock_editar, setStockEditar] = useState(null);
    const [stock_minimo_editar, setStockMinimoEditar] = useState(null);
    const [empresas, setEmpresas] = useState(null);
    const [stock_empresa, setStockEmpresa] = useState(null);
    const [show_listalmacen, setShowListAlmacen] = useState(null);
    const [almacenes_empresa, setAlmacenesEmpresa] = useState(null);
    
    
    useEffect(()=>{
        axios.get(BACKEND_SERVER + `/api/repuestos/tipo_repuesto/`, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => { 
            setTiposRepuesto(res.data);
        })
        .catch(err => { console.log(err);})
    },[token]);

    useEffect(()=>{
        axios.get(BACKEND_SERVER + `/api/repuestos/tipo_unidad/`, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => { 
            setTiposUnidad(res.data);
        })
        .catch(err => { console.log(err);})
    },[token]);

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

    useEffect(()=>{
        setDatos({
            id: repuesto.id ? repuesto.id : null,
            nombre: repuesto.nombre,
            nombre_comun: repuesto.nombre_comun ? repuesto.nombre_comun : '',
            fabricante: repuesto.fabricante ? repuesto.fabricante : '',
            modelo: repuesto.modelo ? repuesto.modelo : '',
            //stock: repuesto.stock,
            stock_T: 0,
            stocks_minimos: repuesto.stocks_minimos,
            es_critico: repuesto.es_critico,
            descatalogado: repuesto.descatalogado,
            tipo_repuesto: repuesto.tipo_repuesto,
            tipo_unidad: repuesto.tipo_unidad,
            equipos: repuesto.equipos,
            proveedores: repuesto.proveedores,
            observaciones: repuesto.observaciones ? repuesto.observaciones : ''
        });
    },[repuesto]);

    useEffect(()=>{
        let stock_T = 0;
        datos.stocks_minimos && datos.stocks_minimos.forEach(element => {
            stock_T += element.stock_act;           
        });        
        setDatos({
            ...datos,
            stock_T : stock_T
        })        
    },[datos.stocks_minimos]);

    useEffect(()=>{
        const stock_por_empresa = [];
        datos.stocks_minimos && empresas && empresas.map( empresa => {
            const almacenes_por_empresa = repuesto.stocks_minimos.filter( s => s.almacen.empresa_id === empresa.id);
            const stock_empresa = almacenes_por_empresa.reduce((a, b) => a + b.stock_act, 0);
            const stock_minimo_empresa = almacenes_por_empresa.reduce((a, b) => a + b.cantidad, 0);
            if(almacenes_por_empresa.length>0){
                stock_por_empresa.push({empresa: empresa, stock: stock_empresa, stock_minimo: stock_minimo_empresa});            
            }
        });
        setStockEmpresa(stock_por_empresa);        
    },[repuesto, empresas]);

    const updateRepuesto = () => {
        axios.get(BACKEND_SERVER + `/api/repuestos/detalle/${datos.id}/`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => { 
            setRepuesto(res.data);
            //setShowHeGuardado(true);
        })
        .catch(err => { console.log(err);})
    }

    const handleInputChange = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })
    }

    const handleCritico = (event) => {
        setDatos({
            ...datos,
            es_critico : !datos.es_critico
        })
    }

    const handleDescatalogar = (event) => {
        setDatos({
            ...datos,
            descatalogado : !datos.descatalogado
        })
    }

    const actualizarDatos = (event) => {
        event.preventDefault();
        if(user['tec-user'].perfil.puesto.nombre!=='Operador'){
            axios.put(BACKEND_SERVER + `/api/repuestos/detalle/${datos.id}/`, {
                nombre: datos.nombre,
                nombre_comun: datos.nombre_comun,
                fabricante: datos.fabricante,
                modelo: datos.modelo,
                es_critico: datos.es_critico,
                descatalogado: datos.descatalogado,
                tipo_repuesto: datos.tipo_repuesto,
                tipo_unidad: datos.tipo_unidad,
                stocks_minimos: datos.stocks_minimos? datos.stocks_minimos:null,
                observaciones: datos.observaciones
            }, {
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }     
            })
            .then( res => { 
                setRepuesto(res.data);
                window.location.href = "/repuestos/listado";
                //window.location.href="javascript: history.go(-1)"
            })
            .catch(err => { console.log(err);})
        }
        else{
            alert('No tienes permisos para modificar, no se guardará ningún cambio efectuado');
        }
    }

    const crearDatos = (event) => {
        event.preventDefault();
        axios.post(BACKEND_SERVER + `/api/repuestos/detalle/`, {
            nombre: datos.nombre,
            nombre_comun: datos.nombre_comun,
            fabricante: datos.fabricante,
            modelo: datos.modelo,
            es_critico: datos.es_critico,
            descatalogado: datos.descatalogado,
            tipo_repuesto: datos.tipo_repuesto,
            tipo_unidad: datos.tipo_unidad,
            observaciones: datos.observaciones
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => { 
            setRepuesto(res.data);            
            setShowStock(true);
        })
        .catch(err => { console.log(err);})
    }

    const handleCloseStock = () => {
        if(datos.stocks_minimos.length > 0 || stock_empresa.length > 0 || setShowStock===false){            
            setShowStock(false);
            setStockEditar(null);
            setStockMinimoEditar(null);
        }
    }

    const abrirNuevoStock = () => {
        setStockEditar(null);
        setStockMinimoEditar(null);
        setShowStock(true);
    }

    const abrirAddEquipo = () => {
        setShowEquipo(true);
    }

    const cerrarAddEquipo = () => {
        setShowEquipo(false);
    }

    const abrirAddProveedor = () => {
        setShowProveedor(true);
    }

    const cerrarAddProveedor = () => {
        setShowProveedor(false);
    }

    const abrirListAlmacen = (empresa) => {
        setAlmacenesEmpresa(empresa);
        setShowListAlmacen(true);
    }

    const cerrarListAlmacen = () => {
        setShowListAlmacen(false);
        updateRepuesto();
    }
    
    const handlerBorrarEquipo = (id) => {
        let newEquipos = [];
        datos.equipos && datos.equipos.forEach( e => {
            if (e.id !== id) {
                newEquipos.push(e.id);
            }
        });
        
        axios.patch(BACKEND_SERVER + `/api/repuestos/lista/${repuesto.id}/`, {
            equipos: newEquipos
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => { 
                updateRepuesto();
            }
        )
        .catch(err => { console.log(err);});
    }

    const handlerBorrarProveedor = (id) => {
        let newProveedores = [];
        datos.proveedores && datos.proveedores.forEach( p => {
            if (p.id !== id) {
                newProveedores.push(p.id);
            }
        });
        
        axios.patch(BACKEND_SERVER + `/api/repuestos/lista/${repuesto.id}/`, {
            proveedores: newProveedores
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => { 
                updateRepuesto();
            }
        )
        .catch(err => { console.log(err);});
    }

    
    function Barcode({datos}) {
        /* var descripcion;
        if(datos.nombre_comun){
            descripcion=datos.nombre_comun;
        }
        else {descripcion = datos.nombre;} */
        const {inputRef}  = useBarcode({
          value: String(datos.id).padStart(12,'0'),
          options: {
            format: "ean13",
            flat: true,
            height: 60,
            // width: 1.2,
            fontSize: 16,
            //text: datos.id + ' - ' + datos.nombre
            //text: datos.id + ' - ' + descripcion
            //text: Barcode.data
          }            
        }); 
        return <svg id="barcode-canvas" ref={inputRef}/>;
    };   

    const ImprimirBarcode = () => {
        var descripcion;
        if(datos.nombre_comun){
            descripcion=datos.nombre_comun;
        }
        else {descripcion = datos.nombre;}
        var container = document.getElementById('barcode');
        // var mySVG = document.getElementById("barcode-canvas");
        var width = "90%";
        var height = "90%";
        var printWindow = window.open('', 'PrintMap',
        'width=' + width + ',height=' + height);
        printWindow.document.writeln('<center>'+container.innerHTML + '</br>' + datos.id + '-' + descripcion + '</center>');
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
    }

    return (
        <Container>
            <Row className="justify-content-center"> 
            {repuesto.id ?
                <h5 className="pb-3 pt-1 mt-2">Repuesto Detalle</h5>:
                <h5 className="pb-3 pt-1 mt-2">Nuevo Repuesto</h5>}
            </Row>
            <Row className="justify-content-center">
                <Col>
                    <h5 className="pb-3 pt-1 mt-2">Datos básicos:</h5>
                    <Form >
                        <Row>
                            <Col>
                                <Form.Group id="nombre">
                                    <Form.Label>Descripción Proveedor (*)</Form.Label>
                                    <Form.Control type="text" 
                                                name='nombre' 
                                                value={datos.nombre}
                                                onChange={handleInputChange} 
                                                placeholder="Nombre"
                                                autoFocus
                                    />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group id="nombre_comun">
                                    <Form.Label>Descripción Etiqueta</Form.Label>
                                    <Form.Control type="text" 
                                                name='nombre_comun' 
                                                value={datos.nombre_comun}
                                                onChange={handleInputChange} 
                                                placeholder="Descripción Etiqueta"
                                    />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group id="tipo">
                                    <Form.Label>Tipo  (*)</Form.Label>
                                    <Form.Control as="select"  
                                                name='tipo_repuesto' 
                                                value={datos.tipo_repuesto}
                                                onChange={handleInputChange}
                                                placeholder="Tipo repuesto">
                                                {tiposRepuesto && tiposRepuesto.map( tipo => {
                                                    return (
                                                    <option key={tipo.id} value={tipo.id}>
                                                        {tipo.nombre}
                                                    </option>
                                                    )
                                                })}
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Form.Group id="fabricante">
                                    <Form.Label>Fabricante</Form.Label>
                                    <Form.Control type="text" 
                                                name='fabricante' 
                                                value={datos.fabricante}
                                                onChange={handleInputChange} 
                                                placeholder="Fabricante"
                                    />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group id="model">
                                    <Form.Label>Modelo</Form.Label>
                                    <Form.Control type="text" 
                                                name='modelo' 
                                                value={datos.modelo}
                                                onChange={handleInputChange} 
                                                placeholder="Modelo"
                                    />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group id="tipound">
                                    <Form.Label>Unidades (*)</Form.Label>
                                    <Form.Control as="select"  
                                                name='tipo_unidad' 
                                                value={datos.tipo_unidad}
                                                onChange={handleInputChange}
                                                placeholder="Tipo unidad">
                                                {tiposUnidad && tiposUnidad.map( tipo => {
                                                    return (
                                                    <option key={tipo.id} value={tipo.id}>
                                                        {tipo.nombre}
                                                    </option>
                                                    )
                                                })}
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Form.Group id="stock_T">
                                    <Form.Label>Stock</Form.Label>
                                    <Form.Control type="text" 
                                                name='stock_T' 
                                                value={datos.stock_T}
                                                // onChange={handleInputChange} 
                                                placeholder="Stock Total"
                                                disabled
                                    />
                                </Form.Group>
                            </Col>
                            <Col>
                                <div id='barcode'>
                                    {datos.id && <Barcode datos={datos}/>}
                                </div>
                            </Col>
                            <Col>
                                <Form.Group id="observaciones">
                                    <Form.Label>Observaciones</Form.Label>
                                    <Form.Control type="text" 
                                                name='observaciones' 
                                                value={datos.observaciones}
                                                onChange={handleInputChange} 
                                                placeholder="Observaciones"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Form.Group className="mb-3" id="es_critico">
                                    <Form.Check type="checkbox" 
                                                label="Es crítico"
                                                checked = {datos.es_critico}
                                                onChange = {handleCritico} />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group className="mb-3" id="descatalogado">
                                    <Form.Check type="checkbox" 
                                                label="Descatalogado"
                                                checked = {datos.descatalogado}
                                                onChange = {handleDescatalogar} />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Row className="justify-content-center">
                            {repuesto.id ? 
                                <Button variant="info" type="submit" className={'mx-2'} onClick={actualizarDatos}>Actualizar</Button> :
                                <Button variant="info" type="submit" className={'mx-2'} onClick={crearDatos}>Guardar</Button>
                            }
                            <Button variant="info" type="submit" className={'mx-2'} href="javascript: history.go(-1)">Cancelar / Volver</Button>
                            {/* <Link to='/repuestos/listado'>
                                <Button variant="warning" >
                                    Cancelar / Cerrar
                                </Button>
                            </Link> */}
                            {datos.id && <Button variant='info' className={'mx-2'} onClick={ImprimirBarcode}>Imprimir Etiqueta</Button>}
                        </Form.Row>

                        {repuesto.id ?
                            <React.Fragment>
                                <Form.Row>
                                    <Col>
                                        <Row>
                                            <Col>
                                            <h5 className="pb-3 pt-1 mt-2">Stock por empresa:</h5>
                                            </Col>
                                            <Col className="d-flex flex-row-reverse align-content-center flex-wrap">
                                                {(user['tec-user'].perfil.puesto.nombre!=='Operador')?
                                                <PlusCircle className="plus mr-2" size={30} onClick={abrirNuevoStock}/>
                                                :null}
                                            </Col>
                                        </Row>
                                    </Col>
                                </Form.Row>
                                <Table striped bordered hover>
                                    <thead>
                                        <tr>
                                            <th>Empresa</th>
                                            <th>Stock Actual</th>
                                            <th>Stock Mínimo</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stock_empresa && stock_empresa.map( stock => {
                                            return (                                                
                                                <tr key={stock.empresa.id}>
                                                    <td>{stock.empresa.nombre}</td>
                                                    <td>{stock.stock}</td>
                                                    <td>{stock.stock_minimo}</td>
                                                    <td>
                                                        <GeoAltFill className="mr-3 pencil" onClick={event => {abrirListAlmacen(stock.empresa.id)}}/>                                                        
                                                    </td>
                                                </tr>
                                            )})
                                        }
                                    </tbody>
                                </Table>
                            </React.Fragment> : null}

                        {repuesto.id ?
                            <React.Fragment>                              
                                <Form.Row>
                                    <Col>
                                        <Row>
                                            <Col>
                                                <h5 className="pb-3 pt-1 mt-2">Es repuesto de:</h5>
                                            </Col>
                                            <Col className="d-flex flex-row-reverse align-content-center flex-wrap">
                                                {(user['tec-user'].perfil.puesto.nombre!=='Operador')?
                                                    <PlusCircle className="plus mr-2" size={30} onClick={abrirAddEquipo}/>
                                                :null}
                                            </Col>
                                        </Row>
                                        <Table striped bordered hover>
                                            <thead>
                                                <tr>
                                                    <th>Zona</th>
                                                    <th>Seccion</th>
                                                    <th>Equipo</th>
                                                    {(user['tec-user'].perfil.puesto.nombre!=='Operador')?
                                                        <th>Acciones</th>
                                                    :null}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {datos.equipos && datos.equipos.map( equipo => {
                                                    return (
                                                        <tr key={equipo.id}>
                                                            <td>{equipo.siglas_zona}</td>
                                                            <td>{equipo.seccion_nombre}</td>
                                                            <td>{equipo.nombre}</td>
                                                            {(user['tec-user'].perfil.puesto.nombre!=='Operador')?
                                                                <td>
                                                                    <Trash className="trash"  onClick={event => {handlerBorrarEquipo(equipo.id)}} />
                                                                </td>
                                                            :null}
                                                        </tr>
                                                    )})
                                                }
                                            </tbody>
                                        </Table>
                                    </Col>
                                    <Col>
                                        <Row>
                                            <Col>
                                            <h5 className="pb-3 pt-1 mt-2">Proveedores:</h5>
                                            </Col>
                                            <Col className="d-flex flex-row-reverse align-content-center flex-wrap">
                                                {(user['tec-user'].perfil.puesto.nombre!=='Operador')?
                                                    <PlusCircle className="plus mr-2" size={30} onClick={abrirAddProveedor}/>
                                                :null}
                                            </Col>
                                        </Row>
                                        <Table striped bordered hover>
                                            <thead>
                                                <tr>
                                                    <th>Nombre</th>
                                                    {(user['tec-user'].perfil.puesto.nombre!=='Operador')?
                                                        <th>Acciones</th>
                                                    :null}
                                                    
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {datos.proveedores && datos.proveedores.map( p => {
                                                    return (
                                                        <tr key={p.id}>
                                                            <td>{p.nombre}</td>
                                                            {(user['tec-user'].perfil.puesto.nombre!=='Operador')?
                                                                <td>
                                                                    <Trash className="trash"  onClick={event => {handlerBorrarProveedor(p.id)}} />
                                                                </td>
                                                            :null}
                                                        </tr>
                                                    )})
                                                }
                                            </tbody>
                                        </Table>
                                    </Col>
                                </Form.Row>
                            </React.Fragment>
                        : null}
                    </Form>
                </Col>
            </Row>        

            <StockMinimoForm show={show_stock}
                             handleCloseStock = {handleCloseStock}
                             repuesto_id = {repuesto.id}
                             stock = {stock_editar}
                             stock_minimo =  {stock_minimo_editar}
                             updateRepuesto = {updateRepuesto}
                             stocks_utilizados = {datos.stocks_minimos}
                             setShowStock = {setShowStock}/>

            <EquipoForm show={show_equipo}
                        handleCloseEquipo={cerrarAddEquipo}
                        repuesto_id = {repuesto.id}
                        equiposAsignados={datos.equipos}
                        updateRepuesto = {updateRepuesto}/>

            <ProveedorForm show={show_proveedor}
                           handleCloseProveedor={cerrarAddProveedor}
                           proveedoresAsignados={datos.proveedores}
                           repuesto_id={repuesto.id}
                           updateRepuesto = {updateRepuesto}/>

            <RepPorAlmacen  show={show_listalmacen}
                            cerrarListAlmacen={cerrarListAlmacen}
                            repuesto={repuesto}
                            setRepuesto={setRepuesto}
                            empresa={almacenes_empresa}/> 
        </Container> 
    )
}

export default RepuestoForm;