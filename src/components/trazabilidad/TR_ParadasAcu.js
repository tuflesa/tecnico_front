import axios from 'axios';
import React, {useState, useEffect} from 'react';
import { Form, Table} from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import { PencilFill } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';

const ParadasAcu = ({Paradas, paradasSeleccionadas, setParadasSeleccionadas}) => {
    const [token] = useCookies(['tec-token']);
    const [paradasSeleccionadas, setParadasSeleccionadas] = useState([]);
    
    const formatearFechaHoraLocal = (s) => {
        if (!s || typeof s !== 'string') return { fecha: '—', hora: '—' };
        const isoLike = s.replace(' ', 'T');
        const d = new Date(isoLike);

        if (isNaN(d)) return { fecha: '—', hora: '—' };

        const fecha = d.toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' });
        const hora = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        return { fecha, hora };
    };

    const handleChange = (event) => {
        // console.log('parada id: ', event.target.id);
        // console.log(event.target.checked);
        const nuevaSeleccion = [...paradasSeleccionadas];
        if (event.target.checked) {
            nuevaSeleccion.push({
                id: event.target.id,
                checked: event.target.checked
            });
        }
        else {
            const filtrada = nuevaSeleccion.filter(p => p.id !== event.target.id);
            setParadasSeleccionadas(filtrada);
            return; 
        }
        setParadasSeleccionadas(nuevaSeleccion);
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
                <th>Acciones</th>
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
                            <td>
                                <Form.Check
                                    inline
                                    name="grupo2"
                                    type={'checkbox'}
<<<<<<< HEAD
                                    id={pdb.id}
                                    onChange ={handleChange}
=======
                                    id={String(pdb.id)}
                                    disabled={Number(pdb.duracion)<10 || pdb.codigo==="Desconocido"?false:true}
                                    checked={paradasSeleccionadas.includes(String(pdb.id))}
                                    onChange={handleChange}
>>>>>>> 46478d40f087d695233803e89e22c99d5b26fd95
                                />
                               { pdb.codigo==="Desconocido"? <Link to={``}><PencilFill className="mr-3 pencil"/></Link> : ''}
                            </td>
                        </tr>
                    )
                })}
            </tbody>
        </Table>
    )
}

export default ParadasAcu