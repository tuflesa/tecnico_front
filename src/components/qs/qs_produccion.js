import React, { useState, useEffect } from "react";
import axios from 'axios';
import { Container, Button, Row, Col, Form} from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import QSNavBar from "./qs_nav";
import StandChart2 from "./qs_stand_chart _2";
import FlowerChart2 from "./qs_flor_chart_2";
import HeightChart from "./qs_height_chart";

const QS_Produccion = () => {
    const [token] = useCookies(['tec-token']);
    const [grupos, setGrupos] = useState(null);
    const [grupo, setGrupo] = useState(0);
    const [montajes, setMontajes] = useState(null);
    const [montaje, setMontaje] = useState(null);
    const [montajeActivo, setMontajeActivo] = useState(0);
    const [articulos, setArticulos] = useState(null);
    const [articulo, setArticulo] = useState(0);
    const [diametrosPLC, setDiametrosPLC] = useState(null);
    const [posiciones, setPosiciones] = useState(null);
    const [posicionesSim, setPosicionesSim] = useState(null);
    const [fleje, setFleje] = useState(null);
    const [OP, setOP] = useState(1);
    const [simulador, setSimulador] = useState(false);
    const [datos, setDatos] = useState(null);
    const [gap, setGap] = useState(null);
    const [alturas, setAlturas] = useState(null);

    const leeDiametrosPLC = (event) => {
        // event.preventDefault();
        axios.get(BACKEND_SERVER + '/api/qs/diametros_actuales_PLC/',{
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }
        })
        .then( res => {
                setDiametrosPLC(res.data);
                //console.log(res.data);
        })
    }

    const leePosicionesPLC = (event) => {
        // event.preventDefault();
        axios.get(BACKEND_SERVER + '/api/qs/posiciones_actuales_PLC/',{
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }
        })
        .then( res => {
                console.log('Posiciones PLC ...');
                console.log(res.data);
                setPosiciones(res.data);
        })
    }

    const compara_diametros_PLC_montaje = () => {
        montaje.forEach(o => {
            o.rodillos.forEach(r =>{
                const Df_PC = r.parametros.Df;
                const PLC = diametrosPLC[o.nombre];
                const Df_PLC = PLC[r.eje];
                // if (Math.abs(Df_PC-Df_PLC) > 0.1) {
                //     console.log('Operacion ', o.nombre);
                //     console.log('Eje: ', r.eje);
                //     console.log('Df_PC ', Df_PC);
                //     console.log('Df_PLC ', Df_PLC);
                // }
            });
        });
    }

    const LeeMontaje = (dato) => {
        // Si no hay dato no hacemos nada
        if (!dato) {
            setMontajeActivo(0);
            setMontaje(null);
            setArticulos(null);
            return
        }
        // Si hay dato continuamos
        const temp = []; // Aqui guardo el montaje temporal
        const bancadas = [];
        dato.grupo.bancadas.forEach(b => bancadas.push(b)); // Bancadas del grupo
        bancadas.push(dato.bancadas); // Añadimos la calibradora que viene como bancada sin grupo
        // Guardamos los articulos de montaje
        setArticulos(dato.articulos);
        bancadas.map(b => {
            b.celdas.map(c => {
                const tipo = c.operacion.nombre.substring(0,2);
                const rod = []
                c.conjunto.elementos.map(e => {
                    const num_instancias = e.rodillo.instancias.length;
                    e.rodillo.instancias.filter(i => i.activa_qs==true).map((instancia,i) => { // Instancias activas
                        // Parametros de la instancia
                        const param = {
                            Ancho: instancia.ancho,
                            Df: instancia.diametro,
                            Dext: instancia.diametro_ext,
                            Dc: instancia.diametro_centro
                        }
                        // Añadimos parametros del rodillo
                        e.rodillo.parametros.map(p => param[p.nombre]=p.valor);
                        //Posición del rodillo LAT_OP, SUP, INF etc ...
                        let eje = e.eje.tipo.siglas
                        if (e.eje.numero_ejes > 1) { // más de un eje
                            if (num_instancias === 1) { //rodillos iguales
                                switch (eje) {
                                    case 'LAT':
                                        rod.push({
                                            tipo_plano: e.rodillo.tipo_plano?e.rodillo.tipo_plano.nombre:'NONE',
                                            eje: 'LAT_OP',
                                            parametros: param
                                        });
                                        rod.push({
                                            tipo_plano: e.rodillo.tipo_plano?e.rodillo.tipo_plano.nombre:'NONE',
                                            eje: 'LAT_MO',
                                            parametros: param
                                        });
                                        break;
                                    case 'SUP/INF':
                                        rod.push({
                                            tipo_plano: e.rodillo.tipo_plano?e.rodillo.tipo_plano.nombre:'NONE',
                                            eje: 'SUP',
                                            parametros: param
                                        });
                                        rod.push({
                                            tipo_plano: e.rodillo.tipo_plano?e.rodillo.tipo_plano.nombre:'NONE',
                                            eje: 'INF',
                                            parametros: param
                                        });
                                        break;
                                    case 'SUP':
                                        rod.push({
                                            tipo_plano: e.rodillo.tipo_plano?e.rodillo.tipo_plano.nombre:'NONE',
                                            eje: 'SUP_OP',
                                            parametros: param
                                        });
                                        rod.push({
                                            tipo_plano: e.rodillo.tipo_plano?e.rodillo.tipo_plano.nombre:'NONE',
                                            eje: 'SUP_MO',
                                            parametros: param
                                        });
                                        break;
                                    case 'L_IS':
                                            rod.push({
                                                tipo_plano: e.rodillo.tipo_plano?e.rodillo.tipo_plano.nombre:'NONE',
                                                eje: 'ANCHO',
                                                parametros: param
                                            });
                                            rod.push({
                                                tipo_plano: e.rodillo.tipo_plano?e.rodillo.tipo_plano.nombre:'NONE',
                                                eje: 'ALTO',
                                                parametros: {Df: 0}
                                            });
                                            break;
                                }
                            }
                            else { //Rodillos diferentes
                                console.log('Rodillos diferentes');
                                eje = instancia.posicion;
                                rod.push({
                                    tipo_plano: e.rodillo.tipo_plano?e.rodillo.tipo_plano.nombre:'NONE',
                                    eje: eje,
                                    parametros: param
                                });
                            }
                        }
                        else {
                            rod.push({
                                tipo_plano: e.rodillo.tipo_plano?e.rodillo.tipo_plano.nombre:'NONE',
                                eje: eje,
                                parametros: param
                            });
                        }
                    });
                });
                temp.push({
                    operacion: c.operacion.orden,
                    color: 'blue',
                    tipo: tipo,
                    nombre: c.operacion.nombre,
                    rodillos: rod
                });
            });
        });
        setMontaje(temp.sort((a,b) => a.operacion - b.operacion).filter(o => o.nombre !=='ET'));
    }

    const simular = (event) => {
        event.preventDefault();
        const temp = [...posicionesSim];

        temp.filter(t => t.op ==OP)[0].posiciones.map(p => {
            p.pos = parseFloat(datos[p.eje]);
        });

        setPosicionesSim(temp);
    }
    
    const handleGrupoChange = (event) => {
        event.preventDefault();
        setGrupo(event.target.value);
        setMontajeActivo(0);
        setMontaje(null);
        setArticulos(null);
        setArticulo(0);
    }

    const handleMontajeChange = (event) => {
        event.preventDefault();
        setMontajeActivo(event.target.value);
        const montaje_id = event.target.value;
        LeeMontaje(montajes.filter(m => m.id==montaje_id)[0]);
        setArticulo(0);
    }

    const handleArticuloChange = (event) => {
        event.preventDefault();
        // console.log('cambio de articulo');
        setArticulo(event.target.value);
    }

    const handleOPChange = (event) => {
        event.preventDefault();
        setOP(event.target.value);
    }

    const handleDataChange = (event) => {
        event.preventDefault();
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        });
    }

    // Al inicio: Lectura de grupos
    useEffect(()=>{
        axios.get(BACKEND_SERVER + `/api/rodillos/grupo_only/?maquina=${4}`,{ // 4 es el id de la mtt2
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            setGrupos(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token]);

    // Lectura de montajes del grupo
    useEffect(()=>{
        grupo && axios.get(BACKEND_SERVER + `/api/rodillos/montaje_qs/?maquina__id=${4}&&grupo__id=${grupo}`,{ // 4 es el id de la mtt2
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            //console.log(res.data);
            setMontajes(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token, grupo]);

    // Si cambia el montaje leemos los diametros activos en el PLC para ver si coinciden con el montaje actual
    useEffect(()=>{
        leeDiametrosPLC();
        leePosicionesPLC();
    },[montaje]);

    // Cuando tenemos nuevos diametros del PLC y montaje comparamos si los diametros coinciden
    useEffect(()=>{
        diametrosPLC&&montaje&&compara_diametros_PLC_montaje();
    },[diametrosPLC, montaje]);

    // Actualizar Fleje al cambiar de articulo
    useEffect(() => {
        if (articulo==0) {
            setFleje(null);
        }
        else {
            console.log('montaje ...');
            console.log(montaje);
            const art = articulos.filter(a => a.id == articulo)[0];
            setFleje({
                espesor: parseFloat(art.espesor),
                ancho: art.desarrollo,
                calidad: 'S350',
                color: 'aqua'
            });
        }
    },[articulo]);

    // Calculo del gap y amortiguación entre rodillos
    useEffect(()=>{
        let piston, gap, pos_i, pos_s, dext_i, dext_s, df_i, df_s;
        const gap_list = [];
        // console.log('Calculo de gap ...');
        fleje&&montaje&&montaje.map(m => {
            // console.log(m);
            switch (m.tipo) {
                case 'BD':
                    // console.log('Gap: Break down');
                    piston = 60;
                    // eje_inf = simulador ? ejesSim[m.operacion-1].pos['INF'] : ejes[m.operacion-1].pos['INF'];
                    // eje_sup = simulador ? ejesSim[m.operacion-1].pos['SUP'] : ejes[m.operacion-1].pos['SUP'];
                    // Di = m.rodillos.filter(r => r.eje == 'INF')[0].parametros['Df'];
                    // Ds = m.rodillos.filter(r => r.eje == 'SUP')[0].parametros['Df'];
                    if (!simulador){
                        pos_i = posiciones.filter(p => p.op==m.operacion)[0].posiciones.filter(p => p.eje=='INF')[0].pos;
                        pos_s = posiciones.filter(p => p.op==m.operacion)[0].posiciones.filter(p => p.eje=='SUP')[0].pos;
                    }
                    else {
                        pos_i = posicionesSim.filter(p => p.op==m.operacion)[0].posiciones.filter(p => p.eje=='INF')[0].pos;
                        pos_s = posicionesSim.filter(p => p.op==m.operacion)[0].posiciones.filter(p => p.eje=='SUP')[0].pos;
                    }
                    gap = pos_s + pos_i;
                    // console.log(gap);
                    if (gap < fleje.espesor) {
                        piston = 60 - fleje.espesor + gap;
                        gap = fleje.espesor;
                    }
                    break;
                case 'FP':
                    // console.log('Gap: Fin pass');
                    piston = null;
                    if (!simulador){
                        pos_i = posiciones.filter(p => p.op==m.operacion)[0].posiciones.filter(p => p.eje=='INF')[0].pos;
                        pos_s = posiciones.filter(p => p.op==m.operacion)[0].posiciones.filter(p => p.eje=='SUP')[0].pos;
                    }
                    else {
                        pos_i = posicionesSim.filter(p => p.op==m.operacion)[0].posiciones.filter(p => p.eje=='INF')[0].pos;
                        pos_s = posicionesSim.filter(p => p.op==m.operacion)[0].posiciones.filter(p => p.eje=='SUP')[0].pos;
                    }
                    dext_i = m.rodillos.filter(r => r.eje=='INF')[0].parametros.Dext;
                    dext_s = m.rodillos.filter(r => r.eje=='SUP')[0].parametros.Dext;
                    df_i = m.rodillos.filter(r => r.eje=='INF')[0].parametros.Df;
                    df_s = m.rodillos.filter(r => r.eje=='SUP')[0].parametros.Df;
                    gap = pos_i + pos_s - (dext_i-df_i)/2 - (dext_s-df_s)/2;
                    break;
                default:
                    gap = null;
                    piston = null;
                    break;
            }
            gap_list.push({
                op: m.operacion,
                gap: gap,
                piston: piston
            });
        });
        // console.log('gap_list');
        // console.log(gap_list);
        setGap(gap_list);
    
    },[montaje, posiciones, posicionesSim, simulador, fleje]);

    // Calculo de alturas
    useEffect(()=>{
        // H contiene las distancias de las distintas operaciones de la sección formadora
        const H =[{nombre: 'MIN',
            color:'red', 
            puntos:[{x: 0, y:0, OP: 0, nombre: 'PR'}, {x:1590, y:10, OP:1, nombre: 'BD1'}, {x:2760, y:20, OP:2, nombre: 'BD2'}, {x:6320, y:30, OP:5, nombre: 'FP1'},{x:7570, y:40, OP:7, nombre: 'FP2'},{x:8820, y:50, OP:9, nombre: 'FP3'}, {x:10070, y:40, OP:10, nombre: 'W'}]
           }, 
           {nombre: 'MAX',
            color: 'blue',
            puntos:[{x: 0, y:0, OP: 0, nombre: 'PR'}, {x:1590, y:-10, OP:1, nombre: 'BD1'}, {x:2760, y:-20, OP:2, nombre: 'BD2'}, {x:6320, y:-30, OP:5, nombre: 'FP1'},{x:7570, y:-40, OP:7, nombre: 'FP2'},{x:8820, y:-50, OP:9, nombre: 'FP3'}, {x:10070, y:40, OP:10, nombre: 'W'}]
         }];
         console.log('Fleje ...');
        fleje&&console.log(fleje);
        fleje&&posiciones&&posicionesSim&&montaje&&montaje.map(m => {
            switch (m.tipo) {
                case 'BD':
                    switch (m.rodillos.filter(r => r.eje=='INF')[0].tipo_plano.slice(0,4)) {
                        case 'BD_I':
                            console.log('Alturas: BD Standar ...');
                            H.map(h => {
                                let y,q;
                                if (h.nombre == 'MIN'){
                                    if (simulador) y = -posicionesSim.filter( p => p.op == m.operacion)[0].posiciones.filter(p => p.eje == 'INF')[0].pos;
                                    else y = -posiciones.filter( p => p.op == m.operacion)[0].posiciones.filter(p => p.eje == 'INF')[0].pos;
        
                                    h.puntos.filter(p => p.OP == m.operacion)[0].y = y;
                                }
                                else {
                                    const roll = m.rodillos.filter(r => r.eje=='INF')[0]; // Rodillo interior
                                    const Df = roll.parametros.Df;
                                    const R = roll.parametros.R;
                                    let alfa = roll.parametros.alfa * Math.PI / 180;
                                    let L; // longitud de fleje fuera del radio (tramo recto)
                                    if (R * alfa > fleje.ancho) {
                                        alfa = fleje.ancho / R;
                                        L = 0;
                                        
                                    }
                                    else {
                                        L = fleje.ancho - R * alfa;
                                    }
                                    
                                    if (simulador) q = posicionesSim.filter( p => p.op == m.operacion)[0].posiciones.filter(p => p.eje == 'INF')[0].pos;
                                    else q = posiciones.filter( p => p.op == m.operacion)[0].posiciones.filter(p => p.eje == 'INF')[0].pos;
        
                                    y = R * (1 - Math.cos(alfa/2)) + (L/2) * Math.sin(alfa/2) - q;
                                    h.puntos.filter(p => p.OP == m.operacion)[0].y = y;
                                }
                            });
                            break;
                        case 'BD_W':
                            console.log('Alturas: BD W ...');
                            H.map( h => {
                                let y;
                                if (h.nombre == 'MIN'){
                                    if (simulador) y = -posicionesSim.filter( p => p.op == m.operacion)[0].posiciones.filter(p => p.eje == 'INF')[0].pos;
                                    else y = -posiciones.filter( p => p.op == m.operacion)[0].posiciones.filter(p => p.eje == 'INF')[0].pos;
    
                                    h.puntos.filter(p => p.OP == m.operacion)[0].y = y;
                                }
                                else {
                                    const roll = m.rodillos.filter(r => r.eje=='INF')[0]; // Rodillo interior
                                    const R1 = roll.parametros.R1;
                                    let alfa1 = roll.parametros.alfa1 * Math.PI / 180;
                                    const R2 = roll.parametros.R2;
                                    let alfa2 = roll.parametros.alfa2 * Math.PI / 180;
                                    const Df = roll.parametros.Df;
                                    const Dc = roll.parametros.Dc;
                                    // Calculos
                                    let q; // Posición del rodillo inferior
                                    if (simulador) q = -posicionesSim.filter( p => p.op == m.operacion)[0].posiciones.filter(p => p.eje == 'INF')[0].pos;
                                    else q = -posiciones.filter( p => p.op == m.operacion)[0].posiciones.filter(p => p.eje == 'INF')[0].pos;
                                    const xc1 = - roll.parametros.XC1;
                                    const yc1 = q + R1;
                                    const xc2 = 0;
                                    const yc2 = (Dc-Df)/2 - R2 + q;
                                    const x0 = xc1 + R1 * Math.sin(alfa2);
                                    const y0 = yc1 - R1 * Math.cos(alfa2);
                                    const x1 = xc2 - R2 * Math.sin(alfa2);
                                    const y1 = yc2 + R2 * Math.cos(alfa2);
    
                                    // longitud de fleje fuera del radio (tramo recto)
                                    const d1 = 2* Math.sqrt(Math.pow((x0-x1),2)+Math.pow((y0-y1),2)); // Tramo recto entre radios
                                    const d2 = R2 * 2 * alfa2; // Longitud tramo central
                                    const d3 = 2 * R1 * alfa2; 
                                    const d4 = 2 * R1 * alfa1;
                                    const d5 = d1 + d2 + d3 + d4;
    
                                    let L; 
                                    if (d5 > fleje.ancho) {
                                        alfa1 = alfa1 - (d5 - fleje.ancho)/(2*R1);
                                        L = 0;
                                        
                                    }
                                    else {
                                        L = fleje.ancho - d5;
                                    }
                                    y = yc1 - R1*Math.cos(alfa1);
                                    
                                    h.puntos.filter(p => p.OP == m.operacion)[0].y = y;
                                }
                            });
                            break;
                        case 'BD_2':
                            console.log('Alturas: BD 2R ...');
                            H.map( h => {
                                let y;
                                if (h.nombre == 'MIN'){
                                    if (simulador) y = -posicionesSim.filter( p => p.op == m.operacion)[0].posiciones.filter(p => p.eje == 'INF')[0].pos;
                                    else y = -posiciones.filter( p => p.op == m.operacion)[0].posiciones.filter(p => p.eje == 'INF')[0].pos;
    
                                    h.puntos.filter(p => p.OP == m.operacion)[0].y = y;
                                }
                                else {
                                    const roll = m.rodillos.filter(r => r.eje=='INF')[0]; // Solo usamos el rodillo interior
                                    const R1 = roll.parametros.R1;
                                    let alfa1 = roll.parametros.alfa1 * Math.PI / 180;
                                    const R2 = roll.parametros.R2;
                                    let alfa2 = roll.parametros.alfa2 * Math.PI / 180;
                                    const R3 = roll.parametros.R3;
                                    const Df = roll.parametros.Df;
                                    // Calculos
                                    const xc1 = 0;
                                    let q;
                                    if (simulador) q = -posicionesSim.filter( p => p.op == m.operacion)[0].posiciones.filter(p => p.eje == 'INF')[0].pos;
                                    else q = -posiciones.filter( p => p.op == m.operacion)[0].posiciones.filter(p => p.eje == 'INF')[0].pos;
                                    const yc1 = q + R1;
                                    const xc2 = (R1-R2) * Math.sin(alfa1/2);
                                    const yc2 = yc1 - (R1-R2) * Math.cos(alfa1/2);
                                    const xc3 = xc2 - (R3-R2) * Math.sin(alfa2);
                                    const yc3 = yc2 + (R3-R2) * Math.cos(alfa2);
    
                                    // longitud de fleje fuera del radio (tramo recto)
                                    const d1 = R1 * alfa1; // Longitud tramo central
                                    const d2 = 2 * R2 * alfa2;
                                    const d3 = d1 + d2;
    
                                    let alfa3 = 0;
                                    if (d3 > fleje.ancho) {
                                        alfa2 = (d3 - fleje.ancho)/(2*R2);
                                    }
                                    else {
                                        alfa3 = (fleje.ancho - d3)/(2*R3);
                                    }
                                    
                                    y = yc3 - R3 * Math.cos(alfa2+alfa3);
                                    h.puntos.filter(p => p.OP == m.operacion)[0].y = y;
                                }
                            });
                            break;
                    }
                    break;
                case 'FP':
                    console.log('Alturas: FP ...');
                    H.map( h => {
                        let y;
                        if (h.nombre == 'MIN'){
                            if (simulador) y = -posicionesSim.filter( p => p.op == m.operacion)[0].posiciones.filter(p => p.eje == 'INF')[0].pos;
                            else y = -posiciones.filter( p => p.op == m.operacion)[0].posiciones.filter(p => p.eje == 'INF')[0].pos;
                        }
                        else {
                            if (simulador) y = posicionesSim.filter( p => p.op == m.operacion)[0].posiciones.filter(p => p.eje == 'SUP')[0].pos;
                            else y = posiciones.filter( p => p.op == m.operacion)[0].posiciones.filter(p => p.eje == 'SUP')[0].pos;
                        }
                        h.puntos.filter(p => p.OP == m.operacion)[0].y = y;
                    });
                    break;
                case 'W':
                    console.log('Alturas: W ...');
                    H.map( h => {
                        let y;
                        if (h.nombre == 'MIN'){
                            if (simulador) y = -posicionesSim.filter( p => p.op == m.operacion)[0].posiciones.filter(p => p.eje == 'INF')[0].pos;
                            else y = -posiciones.filter( p => p.op == m.operacion)[0].posiciones.filter(p => p.eje == 'INF')[0].pos;
                        }
                        else {
                            let p_v_op, p_h_op, h_cab;
                            if (simulador) {
                                p_v_op = posicionesSim.filter( p => p.op == m.operacion)[0].posiciones.filter(p => p.eje == 'SUP_V_OP')[0].pos;
                                p_h_op = -posicionesSim.filter( p => p.op == m.operacion)[0].posiciones.filter(p => p.eje == 'SUP_H_OP')[0].pos;
                                h_cab = posicionesSim.filter(p => p.op == m.operacion)[0].posiciones.filter(p => p.eje=='CAB')[0].pos;
                            } 
                            else {
                                p_v_op = posiciones.filter( p => p.op == m.operacion)[0].posiciones.filter(p => p.eje == 'SUP_V_OP')[0].pos;
                                p_h_op = -posiciones.filter( p => p.op == m.operacion)[0].posiciones.filter(p => p.eje == 'SUP_H_OP')[0].pos;
                                h_cab = posiciones.filter(p => p.op == m.operacion)[0].posiciones.filter(p => p.eje=='CAB')[0].pos;
                            }
                            const roll_sop = m.rodillos.filter(r => r.eje=='SUP_OP')[0]; // Rodillo superior
                            const R1_s = roll_sop.parametros.R1;

                            const x1 = p_h_op;
                            const y1 = p_v_op * Math.cos(15*Math.PI/180) + h_cab;
                            const x2 =  p_h_op + p_v_op * Math.sin(15*Math.PI/180);
                            const y2 = h_cab;
                            const x3 = x2;
                            const y3 = y1 - Math.sqrt(R1_s**2 - (x1-x3)**2);
                            let a,b,c; // Parametros para resolver ec de 2 grado
                            a = 1;
                            b = -2*y3;
                            c = y3**2 + x3**2 - R1_s**2
                            y = (-b + Math.sqrt(b**2 - 4*a*c))/(2*a); //Punto de corte con la vertical de radio del rodillo superior
                        }

                        h.puntos.filter(p => p.OP == m.operacion)[0].y = y;
                    });
                    break;
            }
         });
         console.log('alturas ...');
         console.log(H);
         setAlturas(H);
    },[montaje, posiciones, posicionesSim, simulador, fleje]);

    // Paso de posiciones sim a datos
    useEffect(()=>{
        // console.log('Pasamos posiciones sim a datos ...')
            if (!posicionesSim) {
                // console.log('No hay posiciones sim');
                setPosicionesSim(posiciones);
            } 
            if (simulador) {
                const dat = {};
                posicionesSim.filter(p => p.op == OP)[0].posiciones.map(p => {
                    dat[p.eje] =  parseFloat(p.pos).toFixed(2);
                });
                console.log('dat ...');
                console.log(dat);
                setDatos(dat);
            }
        }, [simulador, OP, posiciones]);

    return (
        <React.Fragment>
            <QSNavBar/>
            <Container fluid>
                <Form>
                    <Row>
                        <Col lg={6}>
                            <Row>
                                <Col lg={6}>
                                    <Form.Group controlId="grupo">
                                        <Form.Label>Grupo</Form.Label>
                                        <Form.Control   size="lg"
                                                        as="select" 
                                                        value={grupo}
                                                        name='grupo'
                                                        onChange={handleGrupoChange}>
                                                            <option key={0} value={0}>Ninguno</option>
                                                            {grupos && grupos.map( g => {
                                                                return (
                                                                <option key={g.id} value={g.id}>
                                                                    {g.nombre}
                                                                </option>
                                                                )
                                                            })}
                                        </Form.Control>
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group controlId="montaje">
                                        <Form.Label>Calibradora</Form.Label>
                                        <Form.Control   size="lg"
                                                        as="select" 
                                                        value={montajeActivo}
                                                        name='montaje'
                                                        onChange={handleMontajeChange}>
                                            <option key={0} value={0}>Ninguno</option>                
                                            {montajes && montajes.map( m => {
                                                return (
                                                <option key={m.id} value={m.id}>
                                                    {m.bancadas.dimensiones}
                                                </option>
                                                )
                                            })}
                                        </Form.Control>
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Col>
                        <Col lg={6}>
                            <Row>
                                <Col>
                                    <Form.Group controlId="Articulo">
                                        <Form.Label>Artículo</Form.Label>
                                        <Form.Control   size="lg"
                                                        as="select" 
                                                        value={articulo}
                                                        name='articulo'
                                                        onChange={handleArticuloChange}>
                                            <option key={0} value={0}>Ninguno</option>                
                                            {articulos && articulos.map( a => {
                                                return (
                                                <option key={a.id} value={a.id}>
                                                    {a.nombre}
                                                </option>
                                                )
                                            })}
                                        </Form.Control>
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    {
                    montaje&&articulo&&fleje&&posiciones&&posicionesSim&&<React.Fragment>
                    <Row>
                        <Col lg={3}>
                            <Form.Group controlId="operacion">
                                <Form.Control as="select" 
                                                value={OP}
                                                name='operacion'
                                                onChange={handleOPChange}>
                                    {montaje && montaje.map( m => {
                                        return (
                                        <option key={m.operacion} value={m.operacion}>
                                            {m.nombre}
                                        </option>
                                        )
                                    })}
                                </Form.Control>
                            </Form.Group>
                        </Col>
                        <Col lg={2}>            
                            <Form.Check // prettier-ignore
                                    type="switch"
                                    id="custom-switch"
                                    label="Simulador"
                                    onClick={(event) => {
                                        // event.preventDefault();
                                        setSimulador(event.target.checked);
                                    }}
                            />
                        </Col>
                        {simulador && 
                        <React.Fragment>
                            <Col lg={1}>
                                <Button variant="info" type="submit" className={'mx-2'} onClick={simular}>Simular</Button>
                            </Col>
                        </React.Fragment>}  
                    </Row>
                    <Row>
                        <Col lg={6}>
                            <StandChart2 
                                montaje={montaje.filter(m => m.operacion == OP)}
                                posiciones={simulador ? posicionesSim&&posicionesSim.filter(p => p.op==OP)[0].posiciones:posiciones&&posiciones.filter(p => p.op==OP)[0].posiciones}
                                simulador={simulador}
                                gap = {gap&&gap.filter(g => g.op == OP)}
                                fleje={fleje}/> 
                        </Col>
                        <Col className="col-6">
                            <FlowerChart2 montaje={montaje}
                                        posiciones={simulador ? posicionesSim : posiciones}
                                        fleje={fleje}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col lg={6}>
                            <Row>
                                {simulador&&posicionesSim&&posicionesSim.filter(p => p.op==OP)[0].posiciones.map((p,i) => {
                                    return (
                                        <Col  key={i} className="col-3">
                                            <Form.Group controlId={p.eje}>
                                                <Form.Label>{p.eje}</Form.Label>
                                                <Form.Control type="number" 
                                                            name={p.eje} 
                                                            value={datos&&datos[p.eje]}
                                                            onChange={handleDataChange} 
                                                            placeholder= {p.eje}
                                                            autoFocus
                                                    />
                                            </Form.Group>
                                        </Col>
                                    )
                                })}
                            </Row>
                        </Col>
                    </Row> 
                    <Row>
                        <Col className="col-12">
                            <HeightChart alturas={alturas}/>
                        </Col>
                    </Row>
                    </React.Fragment>
                    }
                </Form>
            </Container>
        </React.Fragment>
    )
}

export default QS_Produccion;