import React, { useEffect, useState} from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import useInterval from '../utilidades/use_interval';
import { Container, Row, Table} from 'react-bootstrap';

const LlamadasLista = () => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);
    const [filtro, setFiltro] = useState('?carga__empresa=' + user['tec-user'].perfil.empresa.id + '&carga__bruto__isnull=true');
    const [llamadas, setLlamadas] = useState([]);
    const [lastcall, setLastcall] = useState(null);
    const [flash, setFlash] = useState(false);
    const [fondo, setFondo] = useState('');
    const [nfondo,setNfondo] = useState(1);

    const actualiza_lista = ()=> {
        axios.get(BACKEND_SERVER + '/api/cargas/ultimas_llamadas/' + filtro, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then(res => {
            if (res.data.length > 0){
                if ((lastcall===null) || lastcall && (res.data[0].id != lastcall.id)){
                    setFlash(true);
                    setLastcall(res.data[0]);
                    setLlamadas(res.data.slice(1));
                }
                else setFlash(false);
            }
            else {
                setLastcall(null);
                setLlamadas([]);
            } 
            console.log(res.data);
            // console.log('ultima llamada: ', lastcall);
            // console.log('llamadas anteriores: ', llamadas);
        })
        .catch(err => { console.log(err);})
    }

    const actualiza_fondo = () => {
        if (flash){
            if (nfondo===1){
                setNfondo(2);
                setFondo("pb-3 pt-3 mt-5 mb-5 bg-danger text-white");
            }
            else{
                setNfondo(1);
                setFondo("pb-3 pt-3 mt-5 mb-5 bg-warning text-white");
            }
        } 
        else{
            setFondo("pb-3 pt-3 mt-5 mb-5 bg-primary text-white");
        }
    }
    useInterval(actualiza_lista,10000);
    useInterval(actualiza_fondo,1000);

    useEffect(()=>{
        actualiza_lista()
    },[token, filtro]);

    return (
        <Container className="vh-100">
            {lastcall ? 
                <React.Fragment>
                    <Row className="justify-content-center">
                        <h1 className={fondo}>Remolque {lastcall.carga.remolque}{lastcall.carga.destino ? ' - Destino ' + lastcall.carga.destino: null} - Puerta {lastcall.puerta} </h1>
                    </Row>
                    <Row>
                        <h5>Llamadas Anteriores</h5>
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>Matricula</th>
                                    <th>Remolque</th>
                                    <th>Destino</th>
                                    <th>Fecha</th>
                                    <th>Hora</th>
                                    <th>Puerta</th>
                                </tr>
                            </thead>
                            <tbody>
                                {llamadas && llamadas.map(llamada => {
                                    return(
                                    <tr key={llamada.id}>
                                        <td>{llamada.carga.matricula}</td>
                                        <td>{llamada.carga.remolque}</td>
                                        <td>{llamada.carga.destino}</td>
                                        <td>{llamada.fecha}</td>
                                        <td>{llamada.hora}</td>
                                        <td>{llamada.puerta}</td>
                                    </tr>)
                                })}
                            </tbody>
                        </Table>
                    </Row>
                </React.Fragment>
                : 
                <React.Fragment>
                    <Row className="justify-content-center">
                        <h2 className="pb-3 pt-3 mt-5">No hay datos</h2>
                    </Row>
                </React.Fragment>}
        </Container>
    )
}

export default LlamadasLista;