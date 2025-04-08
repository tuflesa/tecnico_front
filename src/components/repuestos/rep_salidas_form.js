import React , { useState, useEffect } from "react";
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { Link, useHistory } from 'react-router-dom';
import { BACKEND_SERVER } from '../../constantes';
import { Container, Row, Col, Table, Button, Form } from 'react-bootstrap';
import { Trash, PlusSquare, DashSquare } from 'react-bootstrap-icons';
import BuscarRepuestos from "./rep_salida_buscar";

const RepSalidas = ({alm}) => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);
    const history = useHistory();

    const [almacenes, setAlmacenes] = useState(null);
    const [show_listrepuestos, setShowListRepuestos] = useState(null);
    const [lineasSalida, setLineasSalida] = useState([]);
    const [cambioCodigo, setCambioCodigo] = useState(false);
    const [almacenesBloqueado, setAlmacenesBloqueado] = useState(false);
    const [salida, setSalida] = useState(null);
    const [num_parte, setNum_parte] = useState(null);
    const [id_parte, setID_parte] = useState(null);
    //const [movimientos, setMovimientos] = useState([]);

    const [numeroBar, setNumeroBar] = useState({
        id: '',
        //almacen: alm ? alm : '',
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
    }); 

    useEffect(() => {
        const parteStr = sessionStorage.getItem('parte');
    
        if (parteStr) {
            const Parte = JSON.parse(parteStr);
            setNum_parte(Parte.num_parte);
            setID_parte(Parte.id);
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

    useEffect(()=>{
        let contador =0;
        lineasSalida.length>0 && lineasSalida.forEach(l => {
            axios.post(BACKEND_SERVER + `/api/repuestos/lineasalida/`, {
                salida: salida.id,
                repuesto: l.repuesto,
                almacen: l.almacen,
                cantidad: l.cantidad,
            }, {
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                    }     
            })
            .then( res => { 
                axios.post(BACKEND_SERVER + `/api/repuestos/movimiento/`,{
                    cantidad : -res.data.cantidad,
                    almacen : res.data.almacen,
                    usuario : salida.responsable,
                    linea_salida: res.data.id
                    }, {
                        headers: {
                            'Authorization': `token ${token['tec-token']}`
                            }     
                })
                .then( res => { 
                    contador+=1;
                    if(lineasSalida.length===contador){
                        alert("Salida realizada con exito!!!!");
                        window.location.href = "javascript: history.go(-1)";
                    }
                })
                .catch( err => {console.log(err)});
            })
            .catch(err => { console.log(err)});
        });        
    },[salida]);

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

    const GenerarSalida = () => {
        if (lineasSalida.length > 0) {
            axios.post(BACKEND_SERVER + `/api/repuestos/salida/`, {
                nombre: 'Salida de almacen',
                responsable: user['tec-user'].id,
                num_parte: id_parte?id_parte:'',
            }, {
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                  }     
            })
            .then( res => { 
                setSalida(res.data);
            })
            .catch(err => { console.log(err);})
        }
        setNum_parte(null);
        sessionStorage.removeItem('num_parte');
    }    

    const abrirListRepuestos = () => {
        setShowListRepuestos(true);
    }

    const cerrarListRepuestos = () => {
        setShowListRepuestos(false);
    }

    const elegirRepuesto = (r) => {      
        datos.id=r;
        datos.almacen=numeroBar.almacen;
        setCambioCodigo(!cambioCodigo);
        cerrarListRepuestos();      
    }

    const cancelar = ()=>{
        sessionStorage.removeItem('num_parte'); // ← limpia almacenamiento
        setNum_parte(null)
        history.push('/home');
    }

    return (
        <Container className="mt-5">
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
                {num_parte?
                    <Col>
                        <Form.Group controlId="num_parte">
                            <Form.Label>Numero Parte</Form.Label>
                            <Form.Control type="text" 
                                        name='num_parte' 
                                        disabled
                                        value={num_parte}/>
                        </Form.Group>
                    </Col>
                :''}           
                {numeroBar.almacen ?                            
                <Col>
                    <Form.Group>
                        <Form.Label className="mt-2">Codigo Barras (con lector) </Form.Label>
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
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lineasSalida.map(linea => {
                                return (
                                        <tr>
                                            <td>{linea.nombre}</td>
                                            <td>{linea.stock}</td>
                                            <td>{linea.critico}</td> 
                                            <td>{linea.cantidad}</td>    
                                            <td>
                                                <PlusSquare className="mr-3 pencil"  onClick={event => {updateCantidad(1, linea)}} />
                                                <DashSquare className="mr-3 pencil"  onClick={event => {updateCantidad(-1, linea)}} />
                                                <Trash className="mr-3 pencil"  onClick={event => {borrarLinea(linea)}} />
                                            </td>                             
                                        </tr>
                            )})}
                        </tbody>
                    </Table>
                </Col>                
            </Row>
            <Form.Row className="justify-content-center">
                {lineasSalida.length>0 ? 
                    <Button variant="info" type="submit" className={'mx-2'} onClick={GenerarSalida}>Hacer Salida</Button> :
                    null
                }
                <Button variant="warning" onClick={cancelar}> Cancelar </Button>               
            </Form.Row>
            <BuscarRepuestos    show={show_listrepuestos}
                                cerrarListRepuestos={cerrarListRepuestos}
                                almacen={numeroBar.almacen}
                                elegirRepuesto={elegirRepuesto}/> 
        </Container>
    )
}

export default RepSalidas;