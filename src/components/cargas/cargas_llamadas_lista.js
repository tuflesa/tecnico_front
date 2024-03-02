import React, { useEffect, useState} from 'react';
// import axios from 'axios';
// import { useCookies } from 'react-cookie';
// import { BACKEND_SERVER } from '../../constantes';
// import useInterval from '../utilidades/use_interval';
import { Container} from 'react-bootstrap';

const LlamadasLista = () => {
    // const [token] = useCookies(['tec-token']);
    // const [user] = useCookies(['tec-user']);
    // const [filtro, setFiltro] = useState('?carga__empresa=' + user['tec-user'].perfil.empresa.id);
    // const [llamadas, setLlamadas] = useState([]);

    // const actualiza_lista = ()=> {
    //     axios.get(BACKEND_SERVER + '/api/cargas/ultimas_llamadas/' + filtro, {
    //         headers: {
    //             'Authorization': `token ${token['tec-token']}`
    //           }
    //     })
    //     .then(res => {
    //         console.log(res.data);
    //         setLlamadas(res.data);
    //     })
    // }

    // useInterval(actualiza_lista,10000);

    // useEffect(()=>{
    //     filtro && axios.get(BACKEND_SERVER + '/api/cargas/ultimas_llamadas/' + filtro, {
    //         headers: {
    //             'Authorization': `token ${token['tec-token']}`
    //           }
    //     })
    //     .then(res => {
    //         console.log(res.data);
    //         setLlamadas(res.data);
    //     })
    // },[token, filtro]);

    return (
        <Container>
            <h1>Lista de llamadas</h1>
        </Container>
    )
}

export default LlamadasLista;