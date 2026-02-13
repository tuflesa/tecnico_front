import {useState, useEffect} from 'react';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';
import { Form, Table, Container} from 'react-bootstrap';
import { PencilFill, Receipt, PlusSquare, Trash } from 'react-bootstrap-icons';
import ordenarLista from '../utilidades/ordenar_paradas';
import ModalEditarParada from '../velocidad/vel_modal_editar_parada';
import ModalAñadirParada from '../velocidad/vel_modal_añadir_parada';
import ModalObservacionesParada from '../velocidad/vel_modal_observaciones_parada';
import { useCookies } from 'react-cookie';

const ParadasAcu = ({Paradas, paradasSeleccionadas, setParadasSeleccionadas, acciones, onSaved}) => {
    const [user] = useCookies(['tec-user']);
    const [token] = useCookies(['tec-token']);
    const tieneEdionParadas = user['tec-user'].perfil.destrezas_velocidad.some(
        destreza => destreza.nombre === 'edicion_paradas'
    );

    const [showModal, setShowModal] = useState(false);
    const [paradasModal, setParadaModal] = useState(null);
    const [showModalObs, setShowModalObs] = useState(false);
    const [observacionActual, setObservacionActual] = useState('');
    const [showModalEditar, setShowModalEditar] = useState(false);
    const [paradasModalEditar, setParadaModalEditar] = useState(null);
    const [periodos, setPeriodos] = useState('');

    // console.log('paradas: ', Paradas);

    const handleOpenModalAñadir = (parada) => {
        setParadaModal(parada);
        setShowModal(true);
    };

    const handleOpenModalEditar = (parada) => {
        setParadaModalEditar(parada);
        setShowModalEditar(true);
    };

    const handleOpenModalObs = (obs) => {
        setObservacionActual(obs || 'Sin observaciones guardadas.');
        setShowModalObs(true);
    };

    const handleCloseModal = () => setShowModal(false);

    const handleCloseModalEditar = () => setShowModalEditar(false);

    const handleCloseModalObs = () => setShowModalObs(false);
    
    const formatearFechaHoraLocal = (s) => {
        if (!s || typeof s !== 'string') return { fecha: '—', hora: '—' };
        const isoLike = s.replace(' ', 'T');
        const d = new Date(isoLike);

        if (isNaN(d)) return { fecha: '—', hora: '—' };

        const fecha = d.toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' });
        const hora = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        return { fecha, hora };
    };

    const handleChange = (event, fechaInicio, horaInicio, fechaFin, horaFin, duracion) => {
        let nuevaSeleccion = [...paradasSeleccionadas];

        if (event.target.checked) {
            nuevaSeleccion.push({
                id: event.target.id,
                checked: event.target.checked,
                fechaInicio,
                fechaFin,
                horaInicio,
                horaFin,
                duracion,
            });
        } else {
            const filtrada = nuevaSeleccion.filter(p => p.id !== event.target.id);
            setParadasSeleccionadas(ordenarLista(filtrada));
            return;
        }
        setParadasSeleccionadas(ordenarLista(nuevaSeleccion));
    };
    
    const estaseleccionado = (id) => {
        return paradasSeleccionadas.some(p => String(p.id) === String(id));
    }

    const InicializarParada = async (parada) => {
        if (!parada) return;

        try {
            // 1. Buscamos los periodos de esa parada
            const resPeriodos = await axios.get(`${BACKEND_SERVER}/api/velocidad/periodo/?parada=${parada.id}`, {
                headers: { 'Authorization': `token ${token['tec-token']}` }
            });
            const periodos = resPeriodos.data;

            // 2. Actualizamos la parada original a código 1 = Desconocido
            const periodo0 = periodos[0];
            const codigoP0 = (periodo0.velocidad > 0)? 2 : 1;
            await axios.patch(`${BACKEND_SERVER}/api/velocidad/paradas/${parada.id}/`, 
                { codigo: codigoP0 }, 
                { headers: { 'Authorization': `token ${token['tec-token']}` } }
            );

            // 3. Si hay más de un periodo....
            if (periodos.length > 1) {
                // Empezamos desde el índice 1, porque el índice 0 se queda con la parada original
                for (let i = 1; i < periodos.length; i++) {
                    const periodoActual = periodos[i];
                    const codigoParaEstePeriodo = (periodoActual.velocidad > 0) ? 2 : 1;
                    // Crear una nueva parada para este periodo
                    const resNuevaParada = await axios.post(`${BACKEND_SERVER}/api/velocidad/paradas/`, {
                        codigo: codigoParaEstePeriodo,
                        zona: parada.zona_id,
                        observaciones: parada.observaciones,
                    }, {
                        headers: { 'Authorization': `token ${token['tec-token']}` }
                    });

                    const nuevaParadaId = resNuevaParada.data.id;

                    // Vincular el periodo actual a la nueva parada
                    await axios.patch(`${BACKEND_SERVER}/api/velocidad/periodo/${periodoActual.id}/`, 
                        { parada: nuevaParadaId }, 
                        { headers: { 'Authorization': `token ${token['tec-token']}` } }
                    );
                }
            }
            
            // Refrescar la lista
            if (onSaved) onSaved(); 
            alert("Parada deshecha con éxito");

        } catch (err) {
            console.error("Error en el proceso:", err);
            alert("Hubo un error al procesar la parada.");
        }
    };

    return (
        <Container>
            <Table striped bordered hover>
                <thead>
                    <tr>
                    <th>Pos</th>
                    <th>Fecha Inicio - Hora Inicio</th>
                    <th>Fecha Fin - Hora Fin</th>
                    <th>Duración</th>
                    <th>Descripción</th>
                    {acciones || tieneEdionParadas?<th>Acciones</th>:<th>Observaciones</th>}
                    </tr>
                </thead>
                <tbody>
                    {Paradas&&Paradas.map((pdb, index) => {
                        const { fecha: fechaInicio, hora: horaInicio } = formatearFechaHoraLocal(pdb.inicio);
                        const { fecha: fechaFin, hora: horaFin } = formatearFechaHoraLocal(pdb.fin);
                        const paradaParaModal = {
                            ...pdb,
                            fechaInicio,
                            horaInicio,
                            fechaFin,
                            horaFin
                        };
                        const posicionInvertida = Paradas.length - index;
                        return (
                            <tr key={index}>
                                <td>{posicionInvertida}</td>
                                <td>{fechaInicio +' - '+ horaInicio}</td>
                                <td>{fechaFin +' - '+ horaFin}</td>
                                <td>{Number(pdb.duracion).toFixed(2)}</td>
                                <td>{pdb.palabra_clave !== '' ? pdb.palabra_clave + ' - ' + pdb.codigo : pdb.codigo}</td>
                                {acciones?(
                                    <td>
                                        <Form.Check
                                            inline
                                            name="grupo2"
                                            type={'checkbox'}
                                            id={pdb.id}
                                            checked={estaseleccionado(pdb.id)}
                                            onChange={(event) => handleChange(event, fechaInicio, horaInicio, fechaFin, horaFin, pdb.duracion, pdb.observaciones)}
                                        />
                                    </td>
                                ):(
                                    <td>
                                        {tieneEdionParadas?(
                                            <>
                                                <PlusSquare style={{ cursor: 'pointer', color: '#007bff', marginRight: '15px'}} onClick={() => handleOpenModalAñadir(paradaParaModal)}/>
                                                <PencilFill style={{ color:'#007bff', marginRight: '15px'}} onClick={() => handleOpenModalEditar(paradaParaModal)}/>
                                                <Trash style={{ 
                                                    cursor: pdb.codigo==='Desconocido'?'not-allowed':'pointer', 
                                                    color:pdb.codigo==='Desconocido'?'gray':'#007bff'}} 
                                                    onClick={pdb.codigo==='Desconocido'? undefined:() => InicializarParada(paradaParaModal)}/>
                                            </>
                                        ):
                                            <Receipt style={{ cursor: 'pointer', color: pdb.observaciones && pdb.observaciones.trim() !== '' ? '#007bff' : 'gray' }} onClick={() => handleOpenModalObs(pdb.observaciones)}/>
                                        }
                                    </td>
                                )}
                            </tr>
                        )
                    })}
                </tbody>
            </Table>
            
            <ModalAñadirParada
                show={showModal}    
                onHide={handleCloseModal}
                parada={paradasModal}
                onSaved={onSaved}
            />
            <ModalEditarParada
                show={showModalEditar}    
                onHide={handleCloseModalEditar}
                parada={paradasModalEditar}
            />
            <ModalObservacionesParada
                observacion={observacionActual}
                showObs={showModalObs}
                onHideObs={handleCloseModalObs}
            />
        </Container>
    )
}

export default ParadasAcu