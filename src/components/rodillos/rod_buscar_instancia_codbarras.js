import React, { useEffect, useState } from 'react';
import { Row, Col, Form, Button, Container, Table } from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import { Trash } from 'react-bootstrap-icons';
import axios from 'axios';
import BuscarInstancia from './rod_buscar_instancia';

const RodBuscarInstanciaCodBarras = ({lineas_rectificandose, setLineasRectificandose, cerrarListRodillos, show_list_rodillos, rectificacion, datos, cambioCodigo, numeroBar, setNumeroBar, rectificados_pendientes}) => {
    const [token] = useCookies(['tec-token']);
    const [lineasInstancias, setLineasInstancias] = useState([]);
    const [instancias_maquina, setInstanciaMaq] = useState([]);
    const [lineas_rectificacion, setLineasRectificacion] = useState([]);
    const [sumar_ejes, setSumaEjes] = useState();

    useEffect(()=>{
        setLineasRectificacion(lineas_rectificandose);
    }, [token, lineas_rectificandose]);

    useEffect(()=>{
        datos.zona && axios.get(BACKEND_SERVER + `/api/rodillos/instancia_listado/?rodillo__operacion__seccion__maquina__id=${datos.zona}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }
        })
        .then( res => {
            setInstanciaMaq(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token, datos.zona]);

    useEffect(() => {
        if (lineasInstancias) {
            const nuevasLineasInstancias = lineasInstancias.map(linea => ({
                ...linea,
                fecha_estimada: datos.fecha_estimada
            }));
            setLineasInstancias(nuevasLineasInstancias);
        }
        if (lineas_rectificacion && lineas_rectificacion.length > 0) {
            const nuevasLineasRectificacion = lineas_rectificacion.map(linea => {
                Actualizo_LineasRectificacion(linea, datos.fecha_estimada);
                return {
                    ...linea,
                    fecha: datos.fecha_estimada
                };
            });
            setLineasRectificacion(nuevasLineasRectificacion);
        }
    }, [datos.fecha_estimada]);

    useEffect(() => {
        if(lineasInstancias){
            const sumaNumEjes = lineasInstancias.reduce((total, lineasInstancias) => total + lineasInstancias.num_ejes, 0);
            setSumaEjes(sumaNumEjes);
        }
        if(lineas_rectificacion){
            const sumaNumEjes = lineas_rectificacion.reduce((total, lineas_rectificacion) => total + lineas_rectificacion.instancia.rodillo.num_ejes, 0);
            setSumaEjes(sumaNumEjes);
        }
    }, [lineasInstancias, lineas_rectificacion]);

    useEffect(()=>{
        datos.id_instancia && datos.fecha_estimada && axios.get(BACKEND_SERVER + `/api/rodillos/instancia_listado/${datos.id_instancia}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }
        })
        .then( res => {
            const yarectificandose = rectificados_pendientes.filter(l => l.instancia.id === datos.id_instancia);
            const instanciaRepetido = lineasInstancias.filter(l => l.id === datos.id_instancia);
            const instancia_maquina = instancias_maquina.filter(l => l.id === datos.id_instancia);
            
            if(instancia_maquina.length===0){
                alert('Esta instancia no corresponde a la máquina/zona señalada.')
                setNumeroBar({
                    ...numeroBar,
                    id_instancia: ''
                });
            }
            else if(yarectificandose.length!==0){
                alert('Esta instancia ya está en otro parte enviado a rectificar.')
                setNumeroBar({
                    ...numeroBar,
                    id_instancia: ''
                });
            }
            else if(instanciaRepetido.length===0 && instancia_maquina.length!==0){
                setLineasInstancias([...lineasInstancias, {
                    id: res.data.id,
                    nombre: res.data.nombre,
                    diametro: res.data.diametro,
                    diametro_ext: res.data.diametro_ext,
                    ancho: res.data.ancho,
                    fecha_estimada: datos.fecha_estimada,
                    num_ejes: res.data.rodillo.num_ejes,
                    archivo: res.data.archivo,
                }]);
            }
        })
        .catch( err => {
            console.log(err);
        });
    }, [cambioCodigo]);

    const handleInputChange_fecha = (linea) => (event) => {
        const { value } = event.target;
        // Actualiza el estado de lineasInstancias
        setLineasInstancias((prev) =>
            prev.map((instancia) =>
                instancia.id === linea.id ? { ...instancia, fecha_estimada: value } : instancia
            )
        );
    };

    const Actualizo_LineasRectificacion = (linea, fecha) => {
        axios.patch(BACKEND_SERVER + `/api/rodillos/linea_rectificacion/${linea.id}/`, { //Actualizamos fecha
            fecha: fecha,
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }     
        })
        .then( res => {  
            
        })
        .catch(err => { 
            console.error(err);
        })

    };

    const Actualizo_Archivo = (linea, select_Archivo) => {
        const formData = new FormData();
            if (select_Archivo) {
                formData.append('archivo', select_Archivo); // Solo agrega si existe un archivo
            }
            axios.patch(BACKEND_SERVER + `/api/rodillos/instancia_nueva/${linea.instancia.id}/`, formData, {
                headers: {
                    'Authorization': `token ${token['tec-token']}`,
                    'Content-Type': 'multipart/form-data'
                }
            })
            .then(r => {
                alert('Archivo actualizado');
                
            })
            .catch(err => { 
                alert('NO SE ACTUALIZA LA LINEA INSTANCIA, REVISAR');
                console.log(err);
            });
            axios.patch(BACKEND_SERVER + `/api/rodillos/linea_rectificacion/${linea.id}/`, formData, {
                headers: {
                    'Authorization': `token ${token['tec-token']}`,
                    'Content-Type': 'multipart/form-data'
                }
            })
            .then(r => {
                
            })
            .catch(err => { 
                alert('NO SE ACTUALIZA ARCHIVO EN LA LINEA A RECTIFICAR, REVISAR');
                console.log(err);
            });

    };

    const handleInputChange_fecha_rectificado = (linea) => (event) => {
        const { value } = event.target;
        // Actualiza el estado de lineasInstancias
        Actualizo_LineasRectificacion(linea,value);
        setLineasRectificacion((prev) =>
            prev.map((instancia) =>
                instancia.id === linea.id ? { ...instancia, fecha: value } : instancia
            )
        );
    };

    const handleInputChange_archivo = (linea) => (event) => {
        const { files } = event.target; // Obtén los archivos del input
        const selectedFile = files[0]; // Obtén el primer archivo seleccionado
    
        if (selectedFile) {
            // Actualiza el estado de lineasInstancias
            Actualizo_Archivo(linea, selectedFile); // Enviar el archivo en vez del valor
            setLineasRectificacion((prev) =>
                prev.map((instancia) =>
                    instancia.id === linea.id ? { ...instancia, archivo: selectedFile.name } : instancia // Guarda el nombre del archivo para mostrar
                )
            );
        }
    };

    const handleInputChange_arch = (linea) => (event) => {
        const { files } = event.target; // Obtén los archivos del input
        const selectedFile = files[0]; // Obtén el primer archivo seleccionado
    
        if (selectedFile) {
            // Actualiza el estado de lineasInstancias
            setLineasInstancias((prev) =>
                prev.map((instancia) =>
                    instancia.id === linea.id ? { ...instancia, archivo: selectedFile.name } : instancia // Guarda el nombre del archivo para mostrar
                )
            );
        }
    };

    const borrarLinea_rectificado = (linea) => {
        //desactiva el error que da el confirm
        // eslint-disable-next-line no-restricted-globals
        var borrar = confirm('Vas a eliminar un rodillo de la ficha de rectificado, ¿deseas continuar?');
        if(borrar){
            const newLineas = lineas_rectificacion.filter( l => l.id !== linea.id);
            setLineasRectificacion(newLineas);
            axios.delete(BACKEND_SERVER + `/api/rodillos/linea_rectificacion/${linea.id}/`, //eliminamos la linea
            {
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                    }     
            })
            .then( res => {  
                if(newLineas.length===0){
                    axios.delete(BACKEND_SERVER + `/api/rodillos/rectificacion_nueva/${rectificacion.id}/`, //si no quedan lineas, eliminamos la ficha
                        {
                            headers: {
                                'Authorization': `token ${token['tec-token']}`
                                }     
                        })
                        .then( res => {         
                            alert('ELIMINADA TAMBIEN LA FICHA') 
                            window.location.href=`/rodillos/lista_rectificacion/}`;

                        })
                        .catch(err => { 
                            console.error(err);
                        })
                }
                
            })
            .catch(err => { 
                console.error(err);
            })
        }
    }

    const borrar_rectificado = (linea) => {
        //desactiva el error que da el confirm
        // eslint-disable-next-line no-restricted-globals
        var borrar = confirm('Vas a eliminar la ficha de rectificado, ¿deseas continuar?');
        if(borrar){
            axios.delete(BACKEND_SERVER + `/api/rodillos/rectificacion_nueva/${rectificacion.id}/`,
                {
                    headers: {
                        'Authorization': `token ${token['tec-token']}`
                        }     
                })
                .then( res => {         
                    alert('FICHA ELIMINADA') 
                    window.location.href=`/rodillos/lista_rectificacion/}`;

                })
                .catch(err => { 
                    console.error(err);
                })
        }
    }

    const borrarLinea = (linea) => {
        const newLineas = lineasInstancias.filter( l => l.id !== linea.id);
        setLineasInstancias(newLineas);
    }

    const GuardarLineas = async () => {
        if(lineasInstancias.length===0){
            alert('Debes añadir algún rodillo');
            return;
        }
        else{
            for(var x=0;x<lineasInstancias.length;x++){
                const formData = new FormData();
                formData.append('rectificado', rectificacion.id);
                formData.append('instancia', lineasInstancias[x].id);
                formData.append('fecha', lineasInstancias[x].fecha_estimada);
                formData.append('diametro', lineasInstancias[x].diametro);
                formData.append('diametro_ext', lineasInstancias[x].diametro_ext);
                formData.append('ancho', lineasInstancias[x].ancho);
                formData.append('nuevo_diametro', 0);
                formData.append('nuevo_diametro_ext', 0);
                formData.append('nuevo_ancho', 0);
                formData.append('rectificado_por', '');
                formData.append('tipo_rectificado', 'estandar');
                formData.append('finalizado', false);
                if (typeof lineasInstancias[x].archivo === 'string') {
                    try {
                        const response = await fetch(lineasInstancias[x].archivo); // Espera el fetch
                        const blob = await response.blob(); // Espera la conversión a blob para coger el archivo
                        const filename = lineasInstancias[x].archivo.split('/').pop(); // obtenemos el nombre del archivo
                        formData.append('archivo', blob, filename); // Añade el archivo al FormData
                    } catch (error) {
                        console.error(`Error al obtener el archivo para la instancia ${lineasInstancias[x].id}:`, error);
                        continue; // Salta esta instancia si hay un error al obtener el archivo
                    }
                }
    
                try {
                    const res = await axios.post(BACKEND_SERVER + `/api/rodillos/linea_rectificacion/`,formData, { //Grabamos las instancias elegidas
                        headers: {
                            'Authorization': `token ${token['tec-token']}`
                            }     
                    });
                //.then( res => {  
                    alert('FICHA DE RECTIFICADO ENVIADA CORRECTAMENTE.');
                    if(x===lineasInstancias.length-1){
                        const response = await axios.get(BACKEND_SERVER + `/api/rodillos/listado_linea_rectificacion/?rectificado=${rectificacion.id}`,{
                            headers: {
                                'Authorization': `token ${token['tec-token']}`
                                }
                        });
                        //.then( res => {
                        setLineasRectificacion(response.data);
                        setLineasRectificacion([]);
                        setLineasInstancias([]);
                        window.location.href=`/rodillos/lista_rectificacion/}`;
                        //})
                    }
                    
                }
                catch(err){ 
                    console.error(err);
                }
            }
        }
    };

    return(
        <Container className='mt-5 pt-1'>
            <Form.Row className="justify-content-center">                          
                {datos.linea ?
                    <Button variant="danger" type="submit" className={'mx-2'} onClick={GuardarLineas}>Mandar Ficha</Button> :null} 
                {datos.linea || rectificacion  ?
                    <Button variant="danger" type="submit" className={'mx-2'} onClick={borrar_rectificado}>Eliminar Ficha</Button> :null} 
            </Form.Row>
            {datos.linea || rectificacion ?
                <Row>
                    <Col>
                        <h5 className="mb-3 mt-3">Lista de Instancias</h5>
                        <h5 className="text-right">Numero total de rodillos a rectificar: {sumar_ejes}</h5>
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    {/* <th>Id</th> */}
                                    <th>Nombre</th>
                                    <th>Ø Fondo</th>                                
                                    <th>Ø Exterior</th>
                                    <th>Ancho</th>
                                    <th>Num Ejes</th>
                                    <th>Fecha estimada</th>
                                    <th>Archivo</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            {lineas_rectificacion?
                                <tbody>
                                    {lineas_rectificacion.map(linea => {
                                        return (
                                            <tr key={linea.instancia.id}>
                                                {/* <td>{linea.id}</td> */}
                                                <td>{linea.instancia.nombre}</td>
                                                <td>{linea.diametro}</td>
                                                <td>{linea.diametro_ext}</td> 
                                                <td>{linea.ancho}</td>  
                                                <td>{linea.instancia.rodillo.num_ejes}</td> 
                                                <td>
                                                    <Form.Group controlId="fecha_estimada">
                                                        <Form.Control type="date" 
                                                                    name='fecha_estimada' 
                                                                    value={linea.fecha}
                                                                    onChange={handleInputChange_fecha_rectificado(linea)} 
                                                                    placeholder="Fecha estimada" />
                                                    </Form.Group>
                                                </td>
                                                <td>
                                                    <Form.Group controlId="archivo">
                                                        {linea.archivo && (
                                                            <Form.Text className="text-muted d-block">
                                                                Archivo guardado: <a href={linea.archivo} target="_blank" rel="noopener noreferrer">{linea.archivo}</a>
                                                            </Form.Text>
                                                        )}
                                                        <Form.Control type="file" onChange={handleInputChange_archivo(linea)} />
                                                    </Form.Group>
                                                </td>
                                                <td>
                                                    <Trash className="mr-3 pencil"  onClick={event => {borrarLinea_rectificado(linea)}} />
                                                </td>                             
                                            </tr>
                                    )})}
                                </tbody>:
                                // si todavía no he guardado la ficha pinta a partir de aquí
                                <tbody> 
                                    {lineasInstancias.map(linea => {
                                        return (
                                            <tr>
                                                {/* <td>{linea.id}</td> */}
                                                <td>{linea.nombre}</td>
                                                <td>{linea.diametro}</td>
                                                <td>{linea.diametro_ext}</td> 
                                                <td>{linea.ancho}</td>  
                                                <td>{linea.num_ejes}</td> 
                                                <td>
                                                    <Form.Group controlId="fecha_estimada">
                                                        <Form.Control type="date" 
                                                                    name='fecha_estimada' 
                                                                    value={linea.fecha_estimada}
                                                                    onChange={handleInputChange_fecha(linea)} 
                                                                    placeholder="Fecha estimada" />
                                                    </Form.Group>
                                                </td>
                                                <td>
                                                    <Form.Group controlId="archivo">
                                                        {linea.archivo && (
                                                            <Form.Text className="text-muted d-block">
                                                                Archivo guardado: <a href={linea.archivo} target="_blank" rel="noopener noreferrer">{linea.archivo}</a>
                                                            </Form.Text>
                                                        )}
                                                        <Form.Control type="file" onChange={handleInputChange_arch(linea)} />
                                                    </Form.Group>
                                                </td>
                                                <td>
                                                    <Trash className="mr-3 pencil"  onClick={event => {borrarLinea(linea)}} />
                                                </td>                             
                                            </tr>
                                    )})}
                                </tbody>
                            }
                        </Table>
                    </Col>                
                </Row>
            :null}
            <h5 className="text-right">Numero total de rodillos a rectificar: {sumar_ejes}</h5>
            <Form.Row className="justify-content-center">                              
                {datos.linea || rectificacion && lineas_rectificacion.length===0 ?
                    <Button variant="danger" type="submit" className={'mx-2'} onClick={GuardarLineas}>Mandar Ficha</Button> :null} 
            </Form.Row>
            {show_list_rodillos?
                <BuscarInstancia    
                        show={show_list_rodillos}
                        datos_rectificacion={datos}
                        rectificacion={rectificacion}
                        cerrarList={cerrarListRodillos}
                        setLineasInstancias={setLineasInstancias}
                        lineasInstancias={lineasInstancias}
                        rectificados_pendientes={rectificados_pendientes}
                        lineas_rectificandose={lineas_rectificandose}
                        setLineasRectificandose={setLineasRectificandose}/>
            :null}
        </Container>
    );
}
export default RodBuscarInstanciaCodBarras;