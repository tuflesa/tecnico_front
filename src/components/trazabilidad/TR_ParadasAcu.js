import axios from 'axios';
import { Form, Table} from 'react-bootstrap';
import { useCookies } from 'react-cookie';

const ParadasAcu = ({Paradas}) => {
    const [token] = useCookies(['tec-token']);
    
    const formatearFechaHoraLocal = (s) => {
        if (!s || typeof s !== 'string') return { fecha: '—', hora: '—' };
        const isoLike = s.replace(' ', 'T');
        const d = new Date(isoLike);

        if (isNaN(d)) return { fecha: '—', hora: '—' };

        const fecha = d.toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' });
        const hora = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        return { fecha, hora };
    };

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
                                    name="group1"
                                    type={'checkbox'}
                                    id={pdb.id}
                                    //onChange ={handleChange}
                                />
                            </td>
                        </tr>
                    )
                })}
            </tbody>
        </Table>
    )
}

export default ParadasAcu