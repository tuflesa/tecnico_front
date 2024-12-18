import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import QSNavBar from "./qs_nav";

const QS_Produccion = () => {
    const [token] = useCookies(['tec-token']);

    useEffect(()=>{
        axios.get(BACKEND_SERVER + `/api/rodillos/montaje_listado/?maquina__id=${4}`,{ // 4 es el id de la mtt2
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            console.log(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token]);

    return (
        <React.Fragment>
            <QSNavBar/>
            
        </React.Fragment>
    )
}

export default QS_Produccion;