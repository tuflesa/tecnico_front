import {useEffect} from 'react';
import { Form, Table} from 'react-bootstrap';
import { PencilFill } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import ordenarLista from '../utilidades/ordenar_paradas';

const ParadasAcu = ({Paradas, paradasSeleccionadas, setParadasSeleccionadas, acciones}) => {

    // useEffect(()=>{console.log('Paradas seleccionadas ',paradasSeleccionadas)},[paradasSeleccionadas]);
    
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
        // console.log('nueva seleccion: ', nuevaSeleccion);
        setParadasSeleccionadas(ordenarLista(nuevaSeleccion));
    };
    
    const estaseleccionado =(id)=>{
        let resultado = false;
        paradasSeleccionadas.map(p =>{
            if (p.id == id) {
                resultado = true;
            }
        });
        return resultado;
    }

    return (
        <Table striped bordered hover>
            <thead>
                <tr>
                <th>Pos</th>
                <th>Fecha Inicio - Hora Inicio</th>
                <th>Fecha Fin - Hora Fin</th>
                <th>Duración</th>
                <th>Descripción</th>
                {acciones?<th>Acciones</th>:''}
                </tr>
            </thead>
            <tbody>
                {Paradas&&Paradas.map((pdb, index) => {
                    const { fecha: fechaInicio, hora: horaInicio } = formatearFechaHoraLocal(pdb.inicio);
                    const { fecha: fechaFin, hora: horaFin } = formatearFechaHoraLocal(pdb.fin);
                    const posicionInvertida = Paradas.length - index;
                    return (
                        <tr key={index}>
                            <td>{posicionInvertida}</td>
                            <td>{fechaInicio +' - '+ horaInicio}</td>
                            <td>{fechaFin +' - '+ horaFin}</td>
                            <td>{Number(pdb.duracion).toFixed(2)}</td>
                            <td>{pdb.codigo}</td>
                            {acciones?<td>
                                <Form.Check
                                    inline
                                    name="grupo2"
                                    type={'checkbox'}
                                    id={pdb.id}
                                    checked={estaseleccionado(pdb.id)}
                                    onChange={(event) => handleChange(event, fechaInicio, horaInicio, fechaFin, horaFin, pdb.duracion)}
                                />
                               {/* { pdb.codigo==="Desconocido"? <Link to={``}><PencilFill className="mr-3 pencil"/></Link> : ''} */}
                            </td>:''}
                        </tr>
                    )
                })}
            </tbody>
        </Table>
    )
}

export default ParadasAcu