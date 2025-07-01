import React, {useState, useEffect} from 'react';
import axios from 'axios';
import { Button, Row, Col, Form, Table} from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';

const FlejesAcu = ({Flejes}) => {
    const [token] = useCookies(['tec-token']);

    const [flejeSeleccionado, setFlejeSeleccionado] = useState(null);

    const handleChange = (event) =>{
        // console.log(Acumulador);
        const fid = event.target.id; 
        // console.log('fid', fid);
        const fs = Flejes.filter(f => f.idProduccion == fid)[0];
        console.log(fs.tubos);
        setFlejeSeleccionado(fs);
    }

    // useEffect(()=>{
    //     console.log(Flejes);
    // },[])

    return (
        <Table striped bordered hover>
            <thead>
                <tr>
                <th>Pos</th>
                <th>ID Produccion</th>
                <th>Descripcion</th>
                <th>Peso</th>
                <th>Metros teorico</th>
                <th>Metros medidos</th>
                <th>Metros tubo</th>
                <th>% Merma</th>
                <th>Check</th>
                </tr>
            </thead>
            <tbody>
                {Flejes&&Flejes.map(fdb => {
                    return (
                        <tr key={fdb.of + ':' + fdb.pos}>
                            <td>{fdb.pos}</td>
                            <td>{fdb.idProduccion}</td>
                            <td>{fdb.descripcion}</td>
                            <td>{fdb.peso}</td>
                            <td className="bg-secondary text-white">{fdb.metros_teorico.toFixed(1)}</td>
                            <td className={fdb.metros_medido<fdb.metros_teorico?("bg-warning text-dark"):
                                        fdb.metros_medido>=fdb.metros_teorico*1.1?("bg-danger text-white"):("bg-success text-white")}>{fdb.metros_medido.toFixed(1)}</td>
                            <td>{fdb.metros_tubo.toFixed(1)}</td>
                            <td>{((1-fdb.metros_tubo/fdb.metros_medido)*100).toFixed(1)}</td>           
                            <td>
                                <Form.Check
                                    inline
                                    name="group1"
                                    type={'radio'}
                                    id={fdb.idProduccion}
                                    onChange ={handleChange}
                                />
                            </td>
                        </tr>
                    )
                })}
            </tbody>
        </Table>
    )
}

export default FlejesAcu