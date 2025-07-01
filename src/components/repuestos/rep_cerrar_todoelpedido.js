import { useState, useEffect} from 'react';
import { BACKEND_SERVER } from '../../constantes';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import { useCookies } from 'react-cookie';

function CerrarTodoElPedido({ pedido, show, onClose, updatePedido }) {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);

    const [almacenes, setAlmacenes] = useState([]);
    const hoy = () => new Date().toISOString().split('T')[0];
    const lineasPedido = pedido?.lineas_pedido?.filter(linea => linea.por_recibir > 0);
    const lineasAdicionales = pedido?.lineas_adicionales?.filter(linea => linea.por_recibir > 0);

    const [datos, setDatos] = useState({
        almacen: '',
        albaran: '',
        fecha: hoy(),
    });

    useEffect(()=>{
        if(pedido?.lineas_pedido?.length>0){
            const empresaUsuario = user['tec-user']?.perfil?.empresa?.id;
            // Obtener todos los almacenes únicos de la primera línea y de la empresa del usuario
            const primeraLinea = pedido.lineas_pedido[0];
            const almacenesCandidatos = primeraLinea.repuesto.stocks_minimos
                .map(stock => stock.almacen)
                .filter(almacen => almacen.empresa === empresaUsuario);
            // Filtrar solo los que aparecen en todas las líneas y de la empresa del usuario
            const almacenesEnTodasLineas = almacenesCandidatos.filter(almacenCandidato => {
                return pedido.lineas_pedido.every(linea => {
                    return linea.repuesto.stocks_minimos.some(stock => 
                        stock.almacen.id === almacenCandidato.id && 
                        stock.almacen.empresa === empresaUsuario
                    );
                });
            });
            setAlmacenes(almacenesEnTodasLineas);
        }
    },[token]);

    const guardarMovimiento = () => {
        if(lineasPedido.length>0 && almacenes.length===0){
            alert('No están todos los repuestos en el mismo almacén, no se puede llevar a cabo esta acción.');
            onClose();
            resetDatos();
            return;
        }        
        else if (lineasPedido.length>0 && (!datos.albaran || !datos.almacen)) {
            alert("Debes completar ambos campos.");
            return;
        }
        if (lineasPedido.length === 0 && lineasAdicionales.length === 0) {
            alert("No hay repuestos pendientes por recibir.");
            resetDatos();
            return;
        }

        const promesas = [];

        if (lineasPedido.length > 0) {
            promesas.push(
                ...lineasPedido.map(async (linea) => {
                    await axios.post(`${BACKEND_SERVER}/api/repuestos/movimiento/`, {
                        fecha: datos.fecha ? datos.fecha : hoy(),
                        cantidad: linea.por_recibir,
                        almacen: datos.almacen,
                        usuario: user['tec-user'].id,
                        linea_pedido: linea.id,
                        linea_inventario: '',
                        albaran: datos.albaran,
                    }, {
                        headers: { Authorization: `token ${token['tec-token']}` }
                    });
                    return axios.patch(`${BACKEND_SERVER}/api/repuestos/linea_pedido/${linea.id}/`, {
                        por_recibir: 0,
                        cantidad: linea.cantidad,
                    }, {
                        headers: { Authorization: `token ${token['tec-token']}` }
                    });
                })
            );
        }

        if (lineasAdicionales.length > 0) {
            promesas.push(
                ...lineasAdicionales.map(async (linea) => {
                    await axios.post(`${BACKEND_SERVER}/api/repuestos/entrega/`, {
                        linea_adicional: linea.id,
                        fecha: datos.fecha ? datos.fecha : hoy(),
                        cantidad: linea.por_recibir,
                        usuario: user['tec-user'].id,
                        albaran: datos.albaran,
                    }, {
                        headers: { Authorization: `token ${token['tec-token']}` }
                    });
                    return axios.patch(`${BACKEND_SERVER}/api/repuestos/linea_adicional_pedido/${linea.id}/`, {
                        por_recibir: 0,
                        cantidad: linea.cantidad,
                    }, {
                        headers: { Authorization: `token ${token['tec-token']}` }
                    });
                })
            );
        }

        Promise.all(promesas)
            .then(() => {
                updatePedido();
                onClose();
                resetDatos();
            })
            .catch(err => {
                console.error(err);
                alert("Error al registrar movimientos.");
            });
    };

    const resetDatos = () => {
        setDatos({
            almacen: '',
            albaran: '',
            fecha: hoy(),
        });
    };

    const CerrarModal = () => {
        resetDatos();
        onClose();
    }

    const handleInputChange = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })
    }

    return (
        <Modal show={show} onHide={onClose} backdrop="static" keyboard={ false } animation={false} size="xl">
            <Modal.Header closeButton>
                <Modal.Title>Confirmar datos de recepción</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group controlId="fecha">
                        <Form.Label>Fecha de entrega (*)</Form.Label>
                        <Form.Control type="date" 
                                    name='fecha' 
                                    value={datos.fecha}
                                    onChange={handleInputChange} 
                                    placeholder="Fecha entrega" />
                    </Form.Group>
                    <Form.Group controlId="albaran">
                        <Form.Label>Número de albarán (*)</Form.Label>
                        <Form.Control
                            name='albaran'
                            value={datos.albaran}
                            onChange={handleInputChange}
                            placeholder="Ej. ALB-2025-001"
                        />
                    </Form.Group>
                    {lineasPedido?.length>0?
                        <Form.Group controlId="almacen">
                            <Form.Label>Almacén (*)</Form.Label>
                            <Form.Control as="select" 
                                        name='almacen' 
                                        value={datos.almacen}
                                        onChange={handleInputChange} >
                                <option key={0} value={''}>{almacenes.length===0?'No están todos los repuestos en el mismo almacén, no se puede llevar a cabo esta acción.':'-- Selecciona un almacén --'}</option>
                                {almacenes && almacenes.map( almacen => {
                                    return (
                                    <option key={almacen.id} value={almacen.id}>
                                        {almacen.nombre}
                                    </option>
                                    )
                                })}   
                            </Form.Control>         
                        </Form.Group>
                    :''}
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={CerrarModal}>Cancelar</Button>
                <Button variant="primary" onClick={guardarMovimiento}>Confirmar</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default CerrarTodoElPedido;
