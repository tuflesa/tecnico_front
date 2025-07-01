import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import { Container, Row, Col, Table } from 'react-bootstrap';
import { Trash, PencilFill, Clipboard } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import PedidosFiltro from './rep_pedidos_filtro';
import {invertirFecha} from '../utilidades/funciones_fecha';
import { useHistory } from 'react-router-dom';


const PedLista = () => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);
    const [pedidos, setPedidos] = useState(null);
    const [show, setShow] = useState(false);
    const [filtroII, setFiltroII] = useState(`?empresa=${user['tec-user'].perfil.empresa.id}&finalizado=${false}&creado_por=${user['tec-user'].perfil.usuario}`);
    const [filtro, setFiltro] = useState('');
    const [buscando, setBuscando] = useState(false);
    const history = useHistory(); // para redirigir luego
    const [hoy] = useState(new Date());
    const nextMonth = new Date(hoy.getFullYear(), hoy.getMonth() + 1, hoy.getDate());
    let filtroPag=(null);
    const [count, setCount] = useState(null);

    const [datos, setDatos] = useState({
            pagina: 1,
            total_pag:0,
        });

    useEffect(()=>{
        filtroPag = (`&page=${datos.pagina}`);
        if (!buscando){
            setFiltro(filtroII + filtroPag);
        }
    },[buscando, filtroII, datos.pagina]);
    
    useEffect(()=>{
        if (filtro){
            setBuscando(true);
            axios.get(BACKEND_SERVER + `/api/repuestos/lista_pedidos_fuera_fecha/` + filtro,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }
            })
            .then( res => {
                setPedidos(res.data.results);
                setCount(res.data.count);
                setBuscando(false);
            })
            .catch( err => {
                console.log(err);
            });
        }
    },[filtro, token]); 

        /* eslint-disable react-hooks/exhaustive-deps */
    useEffect(()=>{
        if(count % 20 === 0){
            setDatos({
                ...datos,
                total_pag:Math.trunc(count/20),
            })
        }
        else if(count % 20 !== 0){
            setDatos({
                ...datos,
                total_pag:Math.trunc(count/20)+1,
            })
        }
    }, [count, filtro]);
    /* eslint-disable react-hooks/exhaustive-deps */

    
    const cambioPagina = (pag) => {
        if(pag<=0){
            pag=1;
        }
        if(pag>count/20){
            if(count % 20 === 0){
                pag=Math.trunc(count/20);
            }
            if(count % 20 !== 0){
                pag=Math.trunc(count/20)+1;
            }
        }
        if(pag>0){
            setDatos({
                ...datos,
                pagina: pag,
            })
        }
    } 

    const actualizaFiltro = str => {
        setFiltroII(str);
    } 
    
    const BorrarP = (pedido)=>{
        axios.get(BACKEND_SERVER + `/api/repuestos/pedido_detalle/${pedido.id}/`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }
        })
        .then( res => {
            borrarPedido(res.data);    
        })
        .catch( err => {
            console.log(err);
        });
    }

    const borrarPedido = (pedido) =>{
        var y=0;
        do{
            if(pedido.lineas_pedido.length===0){
                y=pedido.lineas_pedido.length;
            }
            else if(pedido.lineas_pedido[y].cantidad === pedido.lineas_pedido[y].por_recibir){
                y++;
            }
            else{
                return alert ('no se puede borrar el pedido,hay lineas con movimientos de recepción');
            }
        }while (y<pedido.lineas_pedido.length);
        if (y===pedido.lineas_pedido.length||pedido.lineas_pedido.length===0){            
            var confirmacion = window.confirm('¿Deseas eliminar el pedido?');
            if(confirmacion){
                fetch (BACKEND_SERVER + `/api/repuestos/pedido_detalle/${pedido.id}/`,{
                    method: 'DELETE',
                    headers: {
                        'Authorization': `token ${token['tec-token']}`
                    }
                })
                .then( res => {  
                    //return alert('Se va a borrar el pedido'); 
                })
                .catch( err => {
                    console.log(err);
                });
            }
            setShow(!show);
        }

    }

    const copiarPedido = async (pedido) => {
        var duplicar = window.confirm('Va a duplicar el pedido, ¿desea continuar?');
        if(duplicar){    
            try {
                // Paso 1: Obtener detalles del pedido original (con líneas)
                const response = await axios.get(`${BACKEND_SERVER}/api/repuestos/pedido_detalle/${pedido.id}/`, {
                    headers: {
                        'Authorization': `token ${token['tec-token']}`
                    }
                });
                const original = response.data;

                // Paso 2: Crear nuevo pedido (cabecera)
                const nuevoPedidoPayload = {
                    proveedor: original.proveedor.id,
                    empresa: original.empresa.id,
                    descripcion: original.descripcion,
                    fecha_entrega: null,
                    fecha_prevista_entrega: `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}-${String(nextMonth.getDate()).padStart(2, '0')}`,
                    fecha_creacion: hoy.getFullYear() + '-'+String(hoy.getMonth()+1).padStart(2,'0') + '-' + String(hoy.getDate()).padStart(2,'0'),
                    finalizado: false,
                    creado_por: user['tec-user'].id,
                    direccion_envio: original.direccion_envio?.id || null,
                    contacto: original.contacto?.id|| null,
                    observaciones: original.observaciones,
                    observaciones2: original.observaciones2,
                    intervencion: original.intervencion,
                    revisado: original.revisado,
                };

                let nuevoPedido = null;

                try {
                    const nuevoPedidoRes = await axios.post(
                        `${BACKEND_SERVER}/api/repuestos/pedido/`,
                        nuevoPedidoPayload,
                        {
                            headers: {
                                'Authorization': `token ${token['tec-token']}`
                            }
                        }
                    );
                    nuevoPedido = nuevoPedidoRes.data;
                    }catch( err ) {
                        console.log(err);
                    }
                // Paso 3: Clonar líneas
                for (const linea of original.lineas_pedido) {
                    const nuevaLineaPayload = {
                        pedido: nuevoPedido.id,
                        repuesto: linea.repuesto.id,
                        cantidad: linea.cantidad || 0,
                        descripcion_proveedor: linea.descripcion_proveedor || '',
                        modelo_proveedor: linea.modelo_proveedor || '',
                        observaciones: linea.observaciones || '',
                        por_recibir: linea.cantidad,
                        precio: linea.precio || 0,
                        descuento: linea.descuento || 0,
                        total: linea.total,
                        tipo_unidad: linea.tipo_unidad,
                    };
                    try {
                        await axios.post(`${BACKEND_SERVER}/api/repuestos/linea_pedido/`, nuevaLineaPayload, {
                            headers: {
                                'Authorization': `token ${token['tec-token']}`
                            }
                        });
                    }catch( err ) {
                        console.log(err);
                    }
                }
                // Paso 4: Clonar líneasAdicionales
                for (const linea_adicional of original.lineas_adicionales) {
                    const nuevaLineaadicionalPayload = {
                        pedido: nuevoPedido.id,
                        descripcion: linea_adicional.descripcion,
                        cantidad: linea_adicional.cantidad,
                        precio: linea_adicional.precio || 0,
                        por_recibir: linea_adicional.cantidad,
                        descuento: linea_adicional.descuento || 0,
                        total: linea_adicional.total,
                    };
                    try {
                        await axios.post(`${BACKEND_SERVER}/api/repuestos/linea_adicional_pedido/`, nuevaLineaadicionalPayload, {
                            headers: {
                                'Authorization': `token ${token['tec-token']}`
                            }
                        });
                    } catch (err) {
                        console.log(err);
                    }
                }
                alert("Pedido duplicado correctamente.");
                history.push(`/repuestos/pedido_detalle/${nuevoPedido.id}`);
            } catch (error) {
                console.log(error);
            }
        }
    };
   
    return (
        <Container className="mt-5">
            <Row>
                <Col>
                    <PedidosFiltro actualizaFiltro={actualizaFiltro}/>
                </Col>
            </ Row>
            <table>
                <th><button type="button" className="btn btn-default" value={datos.pagina} name='pagina_anterior' onClick={event => {cambioPagina(datos.pagina=datos.pagina-1)}}>Pág Anterior</button></th> 
                <th><button type="button" className="btn btn-default" value={datos.pagina} name='pagina_posterior' onClick={event => {cambioPagina(datos.pagina=datos.pagina+1)}}>Pág Siguiente</button></th> 
                <th>Número páginas: {datos.pagina} / {datos.total_pag===0?1:datos.total_pag} - Registros: {count}</th>
            </table>
            <Row>
                <Col>
                    <h5 className="mb-3 mt-3">Lista de Pedidos</h5>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th style={{width:130}}>Num-Pedido</th>
                                <th>Creado por</th>
                                <th>Empresa</th>
                                <th>Proveedor</th>
                                <th>Descripción</th>
                                <th style={{width:110}}>Fecha Pedido</th>
                                <th style={{width:110}}>Fecha Entrega</th>
                                <th style={{width:110}}>Fecha Prevista Entrega</th>
                                <th>Finalizado</th>
                                <th style={{width:90}}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pedidos && pedidos.map( pedido => {
                                return (
                                    <tr key={pedido.id}>
                                        <td>{pedido.numero}</td>
                                        <td>{pedido.creado_por.get_full_name}</td>
                                        <td>{pedido.empresa.nombre}</td>
                                        <td>{pedido.proveedor.nombre}</td>
                                        <td>{pedido.descripcion}</td>
                                        <td>{invertirFecha(String(pedido.fecha_creacion))}</td>
                                        <td>{pedido.fecha_entrega && invertirFecha(String(pedido.fecha_entrega))}</td>                                        
                                        <td>{pedido.fecha_prevista_entrega && invertirFecha(String(pedido.fecha_prevista_entrega))}</td> 
                                        <td>{pedido.finalizado ? 'Si' : 'No'}</td>
                                        <td>
                                            <Link to={`/repuestos/pedido_detalle/${pedido.id}`} target="_blank" rel="noopener noreferrer">
                                                <PencilFill className="mr-3 pencil"/>
                                            </Link>
                                            <Trash className="trash"  onClick={event =>{BorrarP(pedido)}} />
                                            <svg
                                                className="bi bi-copy mr-3"
                                                onClick={() => copiarPedido(pedido)}
                                                style={{ cursor: 'pointer' }}
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="16"
                                                height="16"
                                                fill="currentColor"
                                                viewBox="0 0 16 16"
                                            >
                                                <path d="M10 1.5A1.5 1.5 0 0 1 11.5 3v9A1.5 1.5 0 0 1 10 13.5H5A1.5 1.5 0 0 1 3.5 12V3A1.5 1.5 0 0 1 5 1.5h5Zm0 1H5A.5.5 0 0 0 4.5 3v9a.5.5 0 0 0 .5.5h5a.5.5 0 0 0 .5-.5V3a.5.5 0 0 0-.5-.5Z"/>
                                                <path d="M12 4a1 1 0 0 1 1 1v8a2 2 0 0 1-2 2H5a1 1 0 0 1-1-1v-1h1v1h6a1 1 0 0 0 1-1V5h1Z"/>
                                            </svg>
                                        </td>
                                    </tr>
                                )})
                            }
                        </tbody>
                    </Table>
                </Col>
            </Row> 
        </Container>
    )
}

export default PedLista;