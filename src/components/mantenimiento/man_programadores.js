import React, { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import { Container } from 'react-bootstrap';

const ManProgramadores = () => {
    const [token] = useCookies(['tec-token']);
    const [linea_parte, setLineaparte] = useState(null);

    useEffect(() => {
        axios.get(BACKEND_SERVER + `/api/mantenimiento/lineas_parte_contrabajador/?fecha_inicio__gte=2024-12-31&fecha_inicio__lte=2025-03-25`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            setLineaparte(res.data);
            
        })
        .catch( err => {
            console.log(err);
        });
    }, [token]);

    const mostrar_cambios = () => {
        for(var x=0;x<linea_parte.length;x++){
            if(linea_parte[x].fecha_fin!==null){
                if(linea_parte[x].lineas.length!==0){
                    for(var y=0; y<linea_parte[x].lineas.length;y++){
                        if(linea_parte[x].lineas[y].fecha_inicio!==linea_parte[x].fecha_inicio){
                        }
                    }
                }
                
            }
        }
        /* for(var x=0;x<linea_parte.length;x++){
            if(linea_parte[x].fecha_fin===null){
                if(linea_parte[x].lineas.length!==0){
                    for(var y=0; y<linea_parte[x].lineas.length;y++){
                        if(linea_parte[x].lineas[y].fecha_fin===null){
                            console.log('esta tiene fecha en la linea del parte pero null la fecha del trabajador----> : ',linea_parte[x].lineas[y]);
                        }
                    }
                }
                
            }
        } */
    }

    const hacer_cambios = () => {
        for(var x=0;x<linea_parte.length;x++){
            if(linea_parte[x].fecha_fin!==null){
                if(linea_parte[x].lineas.length!==0){
                    for(var y=0; y<linea_parte[x].lineas.length;y++){
                        if(linea_parte[x].lineas[y].fecha_inicio!==linea_parte[x].fecha_inicio){
                            axios.patch(BACKEND_SERVER + `/api/mantenimiento/trabajadores_linea/${linea_parte[x].lineas[y].id}/`,{
                                fecha_inicio: linea_parte[x].fecha_inicio,
                            },
                            {
                                headers: {
                                    'Authorization': `token ${token['tec-token']}`
                                }
                            })
                            .then( r => {
                                console.log('cambios realizados en: ', r.data)
                            })
                            .catch( err => {
                                console.log(err);
                            })
                        }
                    }
                }
                
            }
        }
    }
    return(
        <Container>
            <br></br>
            <br></br>
            <br></br>
            <br></br>
            <h5>hola estamos en la pantalla de los programadores</h5>
            <button type="button" onClick={event => {mostrar_cambios()}}>Mostrar cambios</button>
            <button type="button" onClick={event => {hacer_cambios()}}>Hacer cambios</button>
        </Container>
    )

}
 
export default ManProgramadores;