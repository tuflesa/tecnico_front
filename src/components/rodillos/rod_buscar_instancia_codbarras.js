import React, { useEffect, useState } from 'react';
import { Row, Col, Form, Button, Container, Table } from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import { Trash, Tools } from 'react-bootstrap-icons';
import axios from 'axios';
import BuscarInstancia from './rod_buscar_instancia';
import {invertirFecha} from '../utilidades/funciones_fecha';
import RodCerrarRectificado from './rod_rectificado_cerrar';
import JSZip from 'jszip';

const RodBuscarInstanciaCodBarras = ({proveedor, lineas_rectificandose, setLineasRectificandose, cerrarListRodillos, show_list_rodillos, rectificacion, datos, cambioCodigo, numeroBar, setNumeroBar, rectificados_pendientes}) => {
    const [token] = useCookies(['tec-token']);
    const [lineasInstancias, setLineasInstancias] = useState([]);
    const [instancias_maquina, setInstanciaMaq] = useState([]);
    const [lineas_rectificacion, setLineasRectificacion] = useState([]);
    const [sumar_ejes, setSumaEjes] = useState();
    const [user] = useCookies(['tec-user']);
    const soyTecnico = user['tec-user'].perfil.puesto.nombre==='Técnico'||user['tec-user'].perfil.puesto.nombre==='Director Técnico'?true:false;
    const soySuperTecnico = user['tec-user'].perfil.puesto.nombre==='Director Técnico'?true:false;
    const [show_datos_nuevos, setShowDatosNuevos] = useState(false);
    const [linea_a_finalizar, setLineaFinalizar] = useState([]);

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
                fecha_estimada: datos.fecha_estimada,
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
                    diametro_centro: res.data.diametro_centro,
                    fecha_estimada: datos.fecha_estimada,
                    num_ejes: res.data.rodillo.num_ejes,
                    archivo: res.data.rodillo.archivo,
                    rodillo_id: res.data.rodillo.id,
                    observaciones:'',
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
    
    const handleInputChange_obs = (linea, event) => {
        const { value } = event.target;
        // Actualiza el estado de lineasInstancias
        setLineasInstancias((prev) =>
            prev.map((item) =>
                item.id === linea.id ? { ...item, observaciones: value } : item
            )
        );
    };
    
    const handleInputChange_observaciones = (linea, event) => {
        const { value } = event.target; // Valor del campo
        Actualizo_LineasRectificacion_obs(linea,value);
        setLineasRectificacion((prevLineas) =>
            prevLineas.map((item) =>
                item.instancia.id === linea.instancia.id
                    ? { ...item, observaciones: value } // Actualizar solo la línea modificada
                    : item
            )
        );
    };

    const Actualizo_LineasRectificacion_obs = (linea, observaciones) => {
        axios.patch(BACKEND_SERVER + `/api/rodillos/linea_rectificacion/${linea.id}/`, { //Actualizamos observaciones
            observaciones: observaciones,
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

    const borrarLinea_rectificado = (linea) => {
        if(linea.finalizado){
            alert('Este rodillo ya está rectificado, no se puede eliminar');
        }
        else{
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
                                window.location.href=`/rodillos/lista_rectificacion/}`;

                            })
                            .catch(err => { 
                                console.error(err);
                            })
                    }
                    else{
                        window.location.reload();
                    }
                    
                })
                .catch(err => { 
                    console.error(err);
                })
            }
        }
    }

    const borrar_rectificado = () => {
        const borrar_ficha = lineas_rectificacion?lineas_rectificacion.filter(linea => linea.finalizado === true):'';
        if(borrar_ficha.length===0){
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
                        window.location.href=`/rodillos/lista_rectificacion/}`;

                    })
                    .catch(err => { 
                        console.error(err);
                    })
            }
        }
        else{
            alert('No se puede borrar ya se han rectificado rodillos');
        }
    }

    const borrarLinea = (linea) => {
        const newLineas = lineasInstancias.filter( l => l.id !== linea.id);
        setLineasInstancias(newLineas);
        window.location.reload();
    }

    const GuardarLineas = async () => {
        if (lineasInstancias.length === 0) {
            alert('Debes añadir algún rodillo');
            return;
        } else {
            for (var x = 0; x < lineasInstancias.length; x++) {
                const formData = new FormData();
                formData.append('rectificado', rectificacion.id);
                formData.append('instancia', lineasInstancias[x].id);
                formData.append('fecha', lineasInstancias[x].fecha_estimada);
                formData.append('diametro', lineasInstancias[x].diametro);
                formData.append('diametro_ext', lineasInstancias[x].diametro_ext);
                formData.append('ancho', lineasInstancias[x].ancho);
                formData.append('diametro_centro', lineasInstancias[x].diametro_centro);
                formData.append('nuevo_diametro', 0);
                formData.append('nuevo_diametro_ext', 0);
                formData.append('nuevo_ancho', 0);
                formData.append('nuevo_diametro_centro', 0);
                formData.append('rectificado_por', '');
                formData.append('tipo_rectificado', 'estandar');
                formData.append('finalizado', false);
                formData.append('proveedor', proveedor?proveedor:'');
                formData.append('observaciones', lineasInstancias[x].observaciones?lineasInstancias[x].observaciones:'');
                // Agrega el archivo solo si existe y es un objeto File
               
                if (typeof lineasInstancias[x].archivo === 'string') {
                    const response = await fetch(lineasInstancias[x].archivo);
                    const blob = await response.blob();
                    let filename = lineasInstancias[x].archivo.split('/').pop();                        
                    formData.append('archivo', blob, filename); // Usa el nombre del archivo extraído o el nombre por defecto
                }
    
                try {
                    const res = await axios.post(BACKEND_SERVER + `/api/rodillos/linea_rectificacion/`, formData, {
                        headers: {
                            'Authorization': `token ${token['tec-token']}`
                        }
                    });
                    if (x === lineasInstancias.length - 1) {
                        const response = await axios.get(BACKEND_SERVER + `/api/rodillos/listado_linea_rectificacion/?rectificado=${rectificacion.id}`, {
                            headers: {
                                'Authorization': `token ${token['tec-token']}`
                            }
                        });
                        setLineasRectificacion(response.data);
                        setLineasRectificacion([]);
                        setLineasInstancias([]); // Reinicia el estado de instancias
                        window.location.href = `/rodillos/lista_rectificacion/`;
                    }
    
                } catch (err) {
                    console.error('Error al guardar la línea:', err);
                    alert('Error al guardar la línea, por favor revisa la consola para más detalles.');
                }
            }
            alert('FICHA DE RECTIFICADO ENVIADA CORRECTAMENTE.');
        }
    };

    const DescargarPlanos = async () => { 
        let archivos = []; 
        // Paso 1: Acumulando las URLs de los archivos
        for (let x = 0; x < lineas_rectificandose.length; x++) {
            const rodilloId = lineas_rectificandose[x].instancia.rodillo.id;
            const rodilloNombre = lineas_rectificandose[x].instancia.rodillo.nombre;
            try {
                const res = await axios.get(BACKEND_SERVER + `/api/rodillos/revision_planos_reciente/?plano__rodillos=${rodilloId}&plano__xa_rectificado=true`, {
                    headers: {
                        'Authorization': `token ${token['tec-token']}`,
                    }
                });
                if (res.data && res.data.length > 0) { // Verificamos si hay archivo
                    for(let y = 0; y< res.data.length; y++){
                        const archivo = res.data[y].archivo; // Recoge el archivo
                        archivos.push(`${BACKEND_SERVER}${archivo}`); // Agregar el archivo
                    }
                } else { //Si no hay archivo.
                    alert(`El rodillo con Nombre:  ${rodilloNombre} no tiene archivo asociado. Revisa el registro.`);
                    archivos=[];
                    break;
                }

            } catch (err) {
                console.log('Error al obtener los planos:', err);
            }
        }
        // Paso 2: Descargar los archivos y agregarlos al zip
        if (archivos.length >0) {
            const zip = new JSZip();  // Crear el objeto zip
            let archivosDescargados = 0; // Contador de archivos descargados
            for (let i = 0; i < archivos.length; i++) {
                const archivoUrl = archivos[i];
                try {
                    const response = await axios.get(archivoUrl, { 
                        responseType: 'blob',
                    }); // Descargar el archivo
                    const fileName = archivoUrl.split('/').pop(); // Obtener el nombre del archivo
                    zip.file(fileName, response.data); // Agregar el archivo al zip
                    archivosDescargados++; // Incrementar contador
                } catch (err) {
                    console.log('Error al descargar el archivo:', err);
                }
            }
            // Paso 3: Crear el archivo zip y permitir la descarga automática
            if (archivosDescargados > 0) {
                zip.generateAsync({ type: 'blob' })
                    .then(function(content) {
                        // El Blob es necesario para la descarga automáticamente
                        const blob = content;
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement("a"); // Crear un enlace invisible para la descarga automática
                        a.style.display = "none"; // Escondemos el enlace
                        a.href = url;
                        a.download = 'planos.zip'; // Nombre del archivo zip
                        document.body.appendChild(a);// Agregar el enlace al DOM
                        a.click();
                        window.URL.revokeObjectURL(url); // Liberar el objeto URL
                        document.body.removeChild(a); // Eliminar el enlace del DOM
                    })
                    .catch(function(err) {
                        console.log('Error al generar el archivo zip:', err);
                    });
            } else {
                console.log('No se han encontrado archivos para agregar al zip.');
            }
        } else {
            console.log('No hay archivos, revisar el get.');
        }
    };

    const FinalizoRodillo = (linea) => { 
        setLineaFinalizar(linea);
        setShowDatosNuevos(true);
    }

    const CerrarModal = () => {
        setShowDatosNuevos(false);
    }

    return(
        <Container className='mt-5 pt-1'>
            <Form.Row className="justify-content-center">                          
                {datos.linea ?
                    <Button variant="danger" type="submit" className={'mx-2'} onClick={GuardarLineas}>Mandar Orden</Button> :null} 
                {datos.linea ?
                    <Button variant="danger" type="submit" className={'mx-2'} onClick={borrar_rectificado}>Eliminar Orden</Button> :
                    datos.activado===true && soySuperTecnico && !datos.disabled? <Button variant="danger" type="submit" className={'mx-2'} onClick={borrar_rectificado}>Eliminar Orden</Button>: null} 
                {datos.activado && soySuperTecnico && lineas_rectificacion?
                    <Button variant="primary" type="submit" className={'mx-2'} onClick={DescargarPlanos}>Descargar planos</Button> :null} 
            </Form.Row>
            {datos.linea || rectificacion ?
                <Row>
                    <Col>
                        <h5 className="mb-3 mt-3">Lista de Rodillos</h5>
                        <h5 className="text-right">Numero total de rodillos a rectificar: {sumar_ejes}</h5>
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th colSpan= {2}>Ø Fondo</th>                                
                                    <th colSpan= {2} >Ø Exterior</th>
                                    <th colSpan= {2} >Ancho</th>
                                    <th colSpan= {2} >Ø Centro</th>
                                    <th>Num Rodillos</th>
                                    <th>Fecha estimada</th>
                                    {lineas_rectificacion?<th>Fecha rectificado</th>:''}
                                    <th>Observaciones</th>
                                    {soySuperTecnico?<th>Acciones</th>:''}
                                </tr>
                            </thead>
                            {lineas_rectificacion?
                                <tbody>
                                    {lineas_rectificacion.map(linea => {
                                        return (
                                            <tr key={linea.instancia.id} style={linea?.proveedor !== null ? { backgroundColor: '#DBFAC9' } : undefined}>
                                                <td>{linea.instancia.nombre}</td>
                                                <td>{linea.diametro}</td>
                                                <td style={{ color: 'blue' }}>{linea.nuevo_diametro}</td>
                                                <td>{linea.diametro_ext}</td> 
                                                <td style={{ color: 'blue' }}>{linea.nuevo_diametro_ext}</td>
                                                <td>{linea.ancho}</td> 
                                                <td style={{ color: 'blue' }}>{linea.nuevo_ancho}</td>
                                                <td>{linea.diametro_centro}</td> 
                                                <td style={{ color: 'blue' }}>{linea.nuevo_diametro_centro}</td>
                                                <td>{linea.instancia.rodillo.num_ejes}</td> 
                                                <td>
                                                    <Form.Group controlId="fecha_estimada">
                                                        <Form.Control type="date" 
                                                                    name='fecha_estimada' 
                                                                    value={linea.fecha}
                                                                    onChange={handleInputChange_fecha_rectificado(linea)} 
                                                                    placeholder="Fecha estimada" 
                                                                    disabled={!soyTecnico || linea.nuevo_diametro!==0}/>
                                                    </Form.Group>
                                                </td>
                                                <td>{linea.fecha_rectificado?invertirFecha(String(linea.fecha_rectificado)):''}</td>
                                                <td>
                                                    <Form.Group controlId="observaciones">
                                                        <Form.Control
                                                            as="textarea"
                                                            rows={2} // Establece una altura inicial
                                                            name="observaciones"
                                                            value={linea.observaciones}
                                                            onChange={(e) => handleInputChange_observaciones(linea, e)}
                                                            onInput={(e) => {
                                                                e.target.style.height = "auto"; // Restablece la altura para calcular la nueva
                                                                e.target.style.height = `${e.target.scrollHeight}px`; // Ajusta según el contenido
                                                            }}
                                                            placeholder="Observaciones"
                                                            disabled={linea.nuevo_diametro!==0}
                                                            //style={{ resize: "none" }} // impide que el usuario cambie el tamaño manualmente
                                                        />
                                                    </Form.Group>
                                                </td>
                                                {soySuperTecnico?  
                                                    <td>
                                                        {rectificacion.empresa===2 || soySuperTecnico?
                                                            <Tools className="mr-3 pencil"  onClick={event =>{FinalizoRodillo(linea)}}/>
                                                        :''}
                                                        <Trash className="mr-3 pencil"  onClick={event => {borrarLinea_rectificado(linea)}} />
                                                    </td>:''}                             
                                            </tr>
                                    )})}
                                </tbody>:


                                // si todavía no he guardado la ficha pinta a partir de aquí
                                <tbody> 
                                    {lineasInstancias.map(linea => {
                                        return (
                                            <tr>
                                                <td>{linea.nombre}</td>
                                                <td>{linea.diametro}</td>
                                                <td style={{ color: 'blue' }}>{0}</td>
                                                <td>{linea.diametro_ext}</td> 
                                                <td style={{ color: 'blue' }}>{0}</td>
                                                <td>{linea.ancho}</td> 
                                                <td style={{ color: 'blue' }}>{0}</td>
                                                <td>{linea.diametro_centro}</td>  
                                                <td style={{ color: 'blue' }}>{0}</td>
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
                                                {lineas_rectificacion?<td>{invertirFecha(String(linea.fecha_rectificado))}</td>:''}
                                                <td>
                                                    <Form.Group controlId="observaciones">
                                                        <Form.Control
                                                            as="textarea"
                                                            rows={2} // Establece una altura inicial
                                                            name="observaciones"
                                                            value={linea.observaciones}
                                                            onChange={(e) => handleInputChange_obs(linea, e)}
                                                            onInput={(e) => {
                                                                e.target.style.height = "auto"; // Restablece la altura para calcular la nueva
                                                                e.target.style.height = `${e.target.scrollHeight}px`; // Ajusta según el contenido
                                                            }}
                                                            placeholder="Observaciones"
                                                        />
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
                    <Button variant="danger" type="submit" className={'mx-2'} onClick={GuardarLineas}>Mandar Orden</Button> :null} 
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
            {show_datos_nuevos?
                <RodCerrarRectificado    
                        show={show_datos_nuevos}
                        datos_finalizar={linea_a_finalizar}
                        CerrarModal={CerrarModal}
                        donde={'vengo de codbarras'}
                        lineas_rectificacion={lineas_rectificacion}/>
            :null}
        </Container>
    );
}
export default RodBuscarInstanciaCodBarras;