import React, { useState, useEffect } from "react";
import axios from 'axios';
import { Container, Button, Row, Col, Form, Table} from 'react-bootstrap';
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
    const [montajePLC_OK, setMontajePLC_OK] = useState(false);
    const [articulos, setArticulos] = useState(null);
    const [articulo, setArticulo] = useState(0);
    const [diametrosPLC, setDiametrosPLC] = useState(null);
    const [diametrosPC, setDiametrosPC] = useState(null);
    const [posiciones, setPosiciones] = useState(null);
    const [posicionesSim, setPosicionesSim] = useState(null);
    const [fleje, setFleje] = useState(null);
    const [OP, setOP] = useState(1);
    const [simulador, setSimulador] = useState(false);
    const [datos, setDatos] = useState(null);
    const [gap, setGap] = useState(null);
    const [alturas, setAlturas] = useState(null);
    const [Dst, setDst] = useState(null);
    const [desarrollosModelo, setDesarrollosModelo] = useState(null); // Desarrollos del fleje en cada paso basados en el modelo
    const [desarrollosTeorico, setDesarrollosTeorico] = useState(null); // Desarrollos teoricos segun el calculo de desarrollos

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
        let montaje_OK = true;
        montaje.forEach(o => {
            o.rodillos.forEach(r =>{
                const Df_PC = r.parametros.Df;
                const PLC = diametrosPLC[o.nombre];
                const Df_PLC = PLC[r.eje];
                if (Math.abs(Df_PC-Df_PLC) > 0.1) {
                    console.log('Operacion ', o.nombre);
                    console.log('Eje: ', r.eje);
                    console.log('Df_PC ', Df_PC);
                    console.log('Df_PLC ', Df_PLC);
                    montaje_OK = false;
                }
            });
        });
        setMontajePLC_OK(montaje_OK);
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
        console.log('dato ...');
        console.log(dato);
        const temp = []; // Aqui guardo el montaje temporal
        const bancadas = [];
        dato.grupo.bancadas.forEach(b => bancadas.push(b)); // Bancadas del grupo
        bancadas.push(dato.bancadas); // Añadimos la calibradora que viene como bancada sin grupo
        // Guardamos los articulos de montaje
        console.log('Articulos ...');
        console.log(dato.articulos);
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
                    color: c.operacion.color,
                    tipo: tipo,
                    nombre: c.operacion.nombre,
                    rodillos: rod
                });
            });
        });
        setMontaje(temp.sort((a,b) => a.operacion - b.operacion).filter(o => o.nombre !=='ET'));
    }

    // Calculo de posiciones estándar
    const CalculaPosicionEstandar = ()=>{
        console.log('Calculo de posiciones estandar ...');
        if (!desarrollosTeorico || !fleje || !montaje || !alturas || !articulo) {
            return;
        }
        let R, R1, R2, R3, R1_s, R2_s, R3_s, R4;
        let Df, Dc, Df_s, Df_i, Dext_s, Dext_i;
        let alfa, alfa1, alfa2, alfa3, alfa1_s, alfa2_s, alfa3_s;
        let C, C1, Hc;
        let x0, y, x1, y1, yc, xc1, yc1, xc2, yc2, xc3, yc3, x3, y3, xcr, x_i;
        let gap;
        let pos_i, pos_s, ancho, alto;
        let Dt; // Desarrollo teorico de una operacion
        let roll_s, roll_i, roll_lat;
        let anchoFP1, anchoFP2, anchoFP3;
        let rod_sup_inf, rod_lat;

        const tubo = articulos.filter(a => a.id==articulo)[0];
        console.log('montaje ...');
        console.log(montaje);
        console.log('desarrollos teorico ...');
        console.log(desarrollosTeorico);
        console.log('posiciones...');
        console.log(posicionesSim);
        console.log('fleje ...');
        console.log(fleje);
        console.log('tubo ...');
        console.log(tubo);
        const pos_STD = [];
        // Soldadura
        Dt = desarrollosTeorico['W']/Math.PI; // Desarrollo en soldadura teorico
        const T = fleje.espesor;
        gap = 6 + 9*(T-2)/8; // Establece el gap deseado en función del espesor
        // Rodillos
        const rod_sup = montaje.filter(m => m.nombre=='W')[0].rodillos.filter(r => r.eje == 'SUP_OP')[0];
        // Parametros
        C1 = rod_sup.parametros.C1;
        Dc = rod_sup.parametros.Dc;
        Df = rod_sup.parametros.Df;
        // Calculos
        x1 = gap/2 - C1;
        x0 = x1 + Dc * Math.cos(75*Math.PI/180)/2;
        const pos_h = x0 - Df*Math.sin(15*Math.PI/180)/2;

        pos_STD.push({
            op: 10,
            nombre: 'W',
            posiciones: [
                {eje: 'CAB', pos: 0},
                {eje: 'LAT_OP', pos: Dt/2},
                {eje: 'LAT_MO', pos: Dt/2},
                {eje: 'INF', pos: Dt/2},
                {eje: 'SUP_V_OP', pos: Dt/2},
                {eje: 'SUP_V_MO', pos: Dt/2},
                {eje: 'SUP_H_OP', pos: pos_h},
                {eje: 'SUP_H_MO', pos: pos_h}
            ]
        });

        // Cuchillas
        montaje.filter(m => m.tipo=='FP').map(fp => {
            // console.log(fp);
            Dt = desarrollosTeorico[fp.nombre]; // Desarrollo teorico

            // Rodillos
            roll_i = fp.rodillos.filter(r => r.eje == 'INF')[0];
            roll_s = fp.rodillos.filter(r => r.eje == 'SUP')[0];

            // Parametros
            R1 = roll_i.parametros.R1;
            R2 = roll_i.parametros.R2;
            R3 = roll_i.parametros.R3;
            alfa1 = roll_i.parametros.alfa1 * Math.PI / 180;
            alfa2 = roll_i.parametros.alfa2 * Math.PI / 180;
            alfa3 = roll_i.parametros.alfa3 * Math.PI / 180;
            Df_i = roll_i.parametros.Df;
            Dext_i = roll_i.parametros.Dext;
            
            R1_s = roll_s.parametros.R1;
            R2_s = roll_s.parametros.R2;
            R3_s = roll_s.parametros.R3;
            alfa1_s = roll_s.parametros.alfa1 * Math.PI / 180;
            alfa2_s = roll_s.parametros.alfa2 * Math.PI / 180;
            alfa3_s = roll_s.parametros.alfa3 * Math.PI / 180;
            Df_s = roll_s.parametros.Df;
            Dext_s = roll_s.parametros.Dext;
            C = roll_s.parametros.cuchilla;

            // Calulos
            let alfa_c = 0;
            if (R1_s != 0) {
            alfa_c = Math.asin(C/(2*R1_s));
            }
            const L0 = R1*alfa1 + 2*R2*((Math.PI-alfa1)/2 - alfa3) + 2*R2_s*(alfa2_s-alfa3_s) + 2*R1_s*(alfa1_s/2-alfa_c); // Parte fija del desarrollo
            const L = Dt - L0;
            R4 = L/(4*alfa3);
            y3 = -R4 * Math.sin(alfa3);
            yc2 = y3 + R2 * Math.sin(alfa3);
            xc2 = (R2-R1) * Math.sin(alfa1/2);
            x3 = xc2 - R2 * Math.cos(alfa3);
            xcr = x3 - (1/Math.tan(alfa3)) * y3;
            yc = yc2 - (R2-R1) * Math.cos(alfa1/2);
            pos_i = -(yc - R1);
            gap = pos_i - (Dext_i-Df_i)/2; // Es la mitad del gap en realidad
            pos_s = gap + (Dext_s-Df_s)/2;
            switch (fp.nombre) { // Ancho en el centro de máquina de cada cuchilla para posicionar IS2 e IS3
                case 'FP1':
                    anchoFP1 = 2*(R4-xcr);
                    // console.log('Ancho FP1: ', anchoFP1);
                    break;
                case 'FP2':
                    anchoFP2 = 2*(R4-xcr);
                    // console.log('Ancho FP2: ', anchoFP2);
                    break;
                case 'FP3':
                    anchoFP3 = 2*(R4-xcr);
                    // console.log('Ancho FP3: ', anchoFP3);
                    break;
            }
            console.log('gap_i: ', gap);
            console.log('pos_s: ', pos_s);
            pos_STD.push({
                op: fp.operacion,
                nombre: fp.nombre,
                posiciones: [
                    {eje: 'INF', pos: pos_i},
                    {eje: 'SUP', pos: pos_s}
                ]
            });
        });

        // Pendiente de la recta con origen en PR y final en la posición inferior de FP1
        const pos_fp1_inf = pos_STD.filter(p => p.nombre=='FP1')[0].posiciones.filter(p => p.eje=='INF')[0].pos;
        const x_fp1 = alturas.filter(a => a.nombre=='MIN')[0].puntos.filter(p => p.nombre=='FP1')[0].x;
        const m = pos_fp1_inf/x_fp1;
        // console.log('pendiente: ', m);

        // Break Down
        montaje.filter(m => m.tipo=='BD').map(bd => {
            console.log(bd);
            // Calculos
            x_i = alturas.filter(a => a.nombre=='MIN')[0].puntos.filter(p => p.nombre==bd.nombre)[0].x;
            pos_i = m * x_i;
            pos_s = -(pos_i + 10) + T;

            pos_STD.push({
                op: bd.operacion,
                nombre: bd.nombre,
                posiciones: [
                    {eje: 'INF', pos: pos_i},
                    {eje: 'SUP', pos: pos_s}
                ]
            });
        });

        // ISs
        console.log(montaje);
        const tipo_bd2 = montaje.filter(m => m.nombre=='BD2')[0].rodillos.filter(r => r.eje=='INF')[0].tipo_plano.slice(0,4);
        montaje.filter(m => m.tipo=='IS').map(is => {
            console.log(is);
            switch (is.nombre) {
                case 'IS1':
                    roll_i = montaje.filter(m=>m.nombre=='BD2')[0].rodillos.filter(r => r.eje=='INF')[0]; // Rodillo interior
                    const pos_bd2_inf = -pos_STD.filter(p => p.nombre=='BD2')[0].posiciones.filter(p => p.eje=='INF')[0].pos;
                    switch (tipo_bd2) {
                        case 'BD_I': 
                            Df = roll_i.parametros.Df;
                            R = roll_i.parametros.R;
                            alfa = roll_i.parametros.alfa * Math.PI / 180;
                            let L; // longitud de fleje fuera del radio (tramo recto)
                            if (R * alfa > fleje.ancho) {
                                alfa = fleje.ancho / R;
                                L = 0;
                            }
                            else {
                                L = fleje.ancho - R * alfa;
                            }
                            y = R * (1 - Math.cos(alfa/2)) + (L/2) * Math.sin(alfa/2) - pos_bd2_inf;
                            x0 = R * Math.sin(alfa/2) + (L/2) * Math.cos(alfa/2);
                            break;
                        case 'BD_2':
                            R1 = roll_i.parametros.R1;
                            alfa1 = roll_i.parametros.alfa1 * Math.PI / 180;
                            R2 = roll_i.parametros.R2;
                            alfa2 = roll_i.parametros.alfa2 * Math.PI / 180;
                            alfa3 = roll_i.parametros.alfa3 * Math.PI / 180;
                            R3 = roll_i.parametros.R3;
                            Df = roll_i.parametros.Df;
                            // Calculos
                            xc1 = 0;
                            yc1 = pos_bd2_inf + R1;
                            xc2 = (R1-R2) * Math.sin(alfa1/2);
                            yc2 = yc1 - (R1-R2) * Math.cos(alfa1/2);
                            xc3 = xc2 - (R3-R2) * Math.sin(alfa2);
                            yc3 = yc2 + (R3-R2) * Math.cos(alfa2);

                            // longitud de fleje fuera del radio (tramo recto)
                            const d1 = R1 * alfa1; // Longitud tramo central
                            const d2 = 2 * R2 * alfa2;
                            const d3 = d1 + d2;

                            alfa3 = 0;
                            if (d3 > fleje.ancho) {
                                alfa2 = (d3 - fleje.ancho)/(2*R2);
                            }
                            else {
                                alfa3 = (fleje.ancho - d3)/(2*R3);
                            }
                            
                            y = yc3 - R3 * Math.cos(alfa2+alfa3);

                            xc2 = (R1-R2) * Math.sin(alfa1/2);
                            xc3 = xc2 - (R3-R2) * Math.sin(alfa2);
                            x0 = xc3 + R3 * Math.sin(alfa2+alfa3);
                            break;
                    }
                    roll_lat = montaje.filter(m=>m.nombre=='IS1')[0].rodillos.filter(r => r.eje=='ANCHO')[0]; // Rodillo lateral
                    Hc = roll_lat.parametros.Hc;
                    alfa1 = roll_lat.parametros.alfa1 * Math.PI / 180;
                    R1 = roll_lat.parametros.R1;
                    R2 = roll_lat.parametros.R2;
                    console.log(roll_lat);
                    console.log('parametros lat ... ', Hc, alfa2, R1, R2);
                    y1 = y - Hc + (R1+R2)*Math.sin(alfa1);

                    ancho = 2*x0;
                    alto = y1 + 310 + 10; // +10 es la ditancia que debe quedar entre el angulo del rodillo y el fleje
                    break;
                case 'IS2':
                    alto = 0;
                    ancho = anchoFP2;
                    break;
                case 'IS3':
                    alto = 0;
                    ancho = anchoFP3;
                    break;
            }
            pos_STD.push({
                op: is.operacion,
                nombre: is.nombre,
                posiciones: [
                    {eje: 'ANCHO', pos: ancho},
                    {eje: 'ALTO', pos: alto}
                ]
            });
        });
        
        // Lineal: Calculamos con regresión lineal
        const Ds =  fleje.ancho/Math.PI;

        const l_in_alto = 0.34*Ds - 41.35;
        const l_in_ancho = 2.08*Ds + 200;
        const l_in_sup = -0.4*Ds - 1.185;
        const l_out_alto = 0.73*Ds - 56.44;
        const l_out_ancho = 0.9*Ds + 322;
        const l_out_sup = -0.53*Ds - 2.41;
        const rod_inf_in = -0.43*Ds -4.12;
        const rod_inf_center = -0.4961*Ds - 5.252;
        const rod_inf_out = -0.57*Ds -6.07;
        pos_STD.push({
            op: 4,
            nombre: 'LINEAL',
            posiciones: [
                {eje: 'ENTRADA_ALTO', pos: l_in_alto},
                {eje: 'ENTRADA_ANCHO', pos: l_in_ancho},
                {eje: 'ENTRADA_SUP', pos: l_in_sup},
                {eje: 'SALIDA_ALTO', pos: l_out_alto},
                {eje: 'SALIDA_ANCHO', pos: l_out_ancho},
                {eje: 'SALIDA_SUP', pos: l_out_sup},
                {eje: 'RODILLO_INF_ENTRADA', pos: rod_inf_in},
                {eje: 'RODILLO_INF_CENTRO', pos: rod_inf_center},
                {eje: 'RODILLO_INF_SALIDA', pos: rod_inf_out},
            ]
        });

        // Calibradora
        montaje.filter(m => m.tipo=='CB').map(cb => {
            const ancho = tubo.dim1;
            const alto = tubo.dim2;
            let factor = 1;
            if (ancho==0){ //Tubo redondo
                // console.log('CB: ', cb);
                // alert('TODO');
                switch (cb.rodillos[0].tipo_plano) {
                    case 'CB-R-2-S':
                        rod_sup_inf = cb.rodillos[0].parametros.R1;
                        rod_lat = 200;
                        break;
                    case 'CB-R-2-L':
                        rod_sup_inf = 200;
                        rod_lat = cb.rodillos[0].parametros.R1;
                        break;
                    default:
                        rod_sup_inf = cb.rodillos[0].parametros.R1;
                        rod_lat = cb.rodillos[0].parametros.R1;
                }
            }
            else { // Cuadrado - rectangular
                switch (cb.nombre){
                    case 'CB1':
                        factor = 1.18;
                        break;
                    case 'CB2':
                        factor = 1.09;
                        break;
                    case 'CB3':
                        factor = 1.045;
                        break;
                    case 'CB4':
                        factor = 1;
                }
                rod_sup_inf = alto/2 * factor;
                rod_lat = ancho/2 * factor;
            }

            pos_STD.push({
                op: cb.operacion,
                nombre: cb.nombre,
                posiciones: [
                    {eje: 'SUP', pos: rod_sup_inf},
                    {eje: 'INF', pos: rod_sup_inf},
                    {eje: 'LAT_OP', pos: rod_lat},
                    {eje: 'LAT_MO', pos: rod_lat},
                ]
            });
        });

        // Pinch roll
        pos_STD.push({
            op: 0,
            nombre: 'PR',
            posiciones: [
                {eje: 'INF', pos: 0},
                {eje: 'PRES', pos: 60}
            ]
        });

        function compare( a, b ) {
            if ( a.op < b.op ){
              return -1;
            }
            if ( a.op > b.op ){
              return 1;
            }
            return 0;
          }
        // console.log('posiciones calculadas ...');
        // console.log(pos_STD.sort(compare));
        setPosicionesSim(pos_STD.sort(compare));
    }

    // Guardar Variante 
    const GuardarVariante = () => {
        if (!montajePLC_OK && !simulador){
            alert('Los rodillos del PLC no coinciden con el montaje actual');
        }
        else {
            console.log('posiciones ', posiciones);
            console.log('posicionesSim ', posicionesSim);
            const data = simulador ? [...posicionesSim] : [...posiciones];
            var now = new Date();
            const nombre = simulador ? 'Simulador ' + now.toLocaleString() : 'PLC ' + now.toLocaleString();
            const montaje = montajeActivo;
            // const articulo = articulo;
            const pr_inf = data.filter(p => p.nombre=='PR')[0].posiciones.filter(p =>p.eje=='INF')[0].pos;
            const pr_presion = data.filter(p => p.nombre=='PR')[0].posiciones.filter(p =>p.eje=='PRES')[0].pos; //TODO: falta lectura real para cuando no estamos en simulación
            const bd1_sup = data.filter(p => p.nombre=='BD1')[0].posiciones.filter(p =>p.eje=='SUP')[0].pos;
            const bd1_inf = data.filter(p => p.nombre=='BD1')[0].posiciones.filter(p =>p.eje=='INF')[0].pos;
            const bd2_sup = data.filter(p => p.nombre=='BD2')[0].posiciones.filter(p =>p.eje=='SUP')[0].pos;
            const bd2_inf = data.filter(p => p.nombre=='BD2')[0].posiciones.filter(p =>p.eje=='INF')[0].pos;
            const is1_ancho = data.filter(p => p.nombre=='IS1')[0].posiciones.filter(p =>p.eje=='ANCHO')[0].pos;
            const is1_alto = data.filter(p => p.nombre=='IS1')[0].posiciones.filter(p =>p.eje=='ALTO')[0].pos;
            const l_entrada_sup = data.filter(p => p.nombre=='LINEAL')[0].posiciones.filter(p =>p.eje=='ENTRADA_SUP')[0].pos;
            const l_entrada_ancho = data.filter(p => p.nombre=='LINEAL')[0].posiciones.filter(p =>p.eje=='ENTRADA_ANCHO')[0].pos;
            const l_entrada_alto = data.filter(p => p.nombre=='LINEAL')[0].posiciones.filter(p =>p.eje=='ENTRADA_ALTO')[0].pos;
            const l_entrada_rod_inf = data.filter(p => p.nombre=='LINEAL')[0].posiciones.filter(p =>p.eje=='RODILLO_INF_ENTRADA')[0].pos;
            const l_centro_rod_inf = data.filter(p => p.nombre=='LINEAL')[0].posiciones.filter(p =>p.eje=='RODILLO_INF_CENTRO')[0].pos;
            const l_salida_sup = data.filter(p => p.nombre=='LINEAL')[0].posiciones.filter(p =>p.eje=='SALIDA_SUP')[0].pos;
            const l_salida_ancho = data.filter(p => p.nombre=='LINEAL')[0].posiciones.filter(p =>p.eje=='SALIDA_ANCHO')[0].pos;
            const l_salida_alto = data.filter(p => p.nombre=='LINEAL')[0].posiciones.filter(p =>p.eje=='SALIDA_ALTO')[0].pos;
            const l_salida_rod_inf = data.filter(p => p.nombre=='LINEAL')[0].posiciones.filter(p =>p.eje=='RODILLO_INF_SALIDA')[0].pos;
            const fp1_sup = data.filter(p => p.nombre=='FP1')[0].posiciones.filter(p =>p.eje=='SUP')[0].pos;
            const fp1_inf = data.filter(p => p.nombre=='FP1')[0].posiciones.filter(p =>p.eje=='INF')[0].pos;
            let is2_ancho, is2_alto, is3_ancho, is3_alto;
            if (data.filter(p => p.nombre=='IS2')[0]) {
                is2_ancho = data.filter(p => p.nombre=='IS2')[0].posiciones.filter(p =>p.eje=='ANCHO')[0].pos;
                is2_alto = data.filter(p => p.nombre=='IS2')[0].posiciones.filter(p =>p.eje=='ALTO')[0].pos;
            }
            else {
                is2_ancho = 250;
                is2_alto = 0;
            }
            const fp2_sup = data.filter(p => p.nombre=='FP2')[0].posiciones.filter(p =>p.eje=='SUP')[0].pos;
            const fp2_inf = data.filter(p => p.nombre=='FP2')[0].posiciones.filter(p =>p.eje=='INF')[0].pos;
            if (data.filter(p => p.nombre=='IS3')[0]) {
                is3_ancho = data.filter(p => p.nombre=='IS3')[0].posiciones.filter(p =>p.eje=='ANCHO')[0].pos;
                is3_alto = data.filter(p => p.nombre=='IS3')[0].posiciones.filter(p =>p.eje=='ALTO')[0].pos;
            }
            else {
                is3_ancho = 250;
                is3_alto = 0;
            }
            const fp3_sup = data.filter(p => p.nombre=='FP3')[0].posiciones.filter(p =>p.eje=='SUP')[0].pos;
            const fp3_inf = data.filter(p => p.nombre=='FP3')[0].posiciones.filter(p =>p.eje=='INF')[0].pos;
            const w_inf = data.filter(p => p.nombre=='W')[0].posiciones.filter(p =>p.eje=='INF')[0].pos;
            const w_lat_op = data.filter(p => p.nombre=='W')[0].posiciones.filter(p =>p.eje=='LAT_OP')[0].pos;
            const w_lat_mo = data.filter(p => p.nombre=='W')[0].posiciones.filter(p =>p.eje=='LAT_MO')[0].pos;
            const w_sup_op_v = data.filter(p => p.nombre=='W')[0].posiciones.filter(p =>p.eje=='SUP_V_OP')[0].pos;
            const w_sup_op_h = data.filter(p => p.nombre=='W')[0].posiciones.filter(p =>p.eje=='SUP_H_OP')[0].pos;
            const w_sup_mo_v = data.filter(p => p.nombre=='W')[0].posiciones.filter(p =>p.eje=='SUP_V_MO')[0].pos;
            const w_sup_mo_h = data.filter(p => p.nombre=='W')[0].posiciones.filter(p =>p.eje=='SUP_H_MO')[0].pos;
            const w_cab = data.filter(p => p.nombre=='W')[0].posiciones.filter(p =>p.eje=='CAB')[0].pos;
            const cb1_sup = data.filter(p => p.nombre=='CB1')[0].posiciones.filter(p =>p.eje=='SUP')[0].pos;
            const cb1_inf = data.filter(p => p.nombre=='CB1')[0].posiciones.filter(p =>p.eje=='INF')[0].pos;
            const cb1_lat_op = data.filter(p => p.nombre=='CB1')[0].posiciones.filter(p =>p.eje=='LAT_OP')[0].pos;
            const cb1_lat_mo = data.filter(p => p.nombre=='CB1')[0].posiciones.filter(p =>p.eje=='LAT_MO')[0].pos;
            const cb2_sup = data.filter(p => p.nombre=='CB2')[0].posiciones.filter(p =>p.eje=='SUP')[0].pos;
            const cb2_inf = data.filter(p => p.nombre=='CB2')[0].posiciones.filter(p =>p.eje=='INF')[0].pos;
            const cb2_lat_op = data.filter(p => p.nombre=='CB2')[0].posiciones.filter(p =>p.eje=='LAT_OP')[0].pos;
            const cb2_lat_mo = data.filter(p => p.nombre=='CB2')[0].posiciones.filter(p =>p.eje=='LAT_MO')[0].pos;
            const cb3_sup = data.filter(p => p.nombre=='CB3')[0].posiciones.filter(p =>p.eje=='SUP')[0].pos;
            const cb3_inf = data.filter(p => p.nombre=='CB3')[0].posiciones.filter(p =>p.eje=='INF')[0].pos;
            const cb3_lat_op = data.filter(p => p.nombre=='CB3')[0].posiciones.filter(p =>p.eje=='LAT_OP')[0].pos;
            const cb3_lat_mo = data.filter(p => p.nombre=='CB3')[0].posiciones.filter(p =>p.eje=='LAT_MO')[0].pos;
            const cb4_sup = data.filter(p => p.nombre=='CB4')[0].posiciones.filter(p =>p.eje=='SUP')[0].pos;
            const cb4_inf = data.filter(p => p.nombre=='CB4')[0].posiciones.filter(p =>p.eje=='INF')[0].pos;
            const cb4_lat_op = data.filter(p => p.nombre=='CB4')[0].posiciones.filter(p =>p.eje=='LAT_OP')[0].pos;
            const cb4_lat_mo = data.filter(p => p.nombre=='CB4')[0].posiciones.filter(p =>p.eje=='LAT_MO')[0].pos;
            axios.post(BACKEND_SERVER + `/api/qs/variante/`, {
                nombre: nombre ,
                montaje: montajeActivo,
                articulo: articulo,
                pr_inf: pr_inf, 
                pr_presion: pr_presion,
                bd1_sup: bd1_sup,
                bd1_inf: bd1_inf,
                bd2_sup: bd2_sup,
                bd2_inf: bd2_inf,
                is1_ancho: is1_ancho,
                is1_alto: is1_alto,
                l_entrada_sup: l_entrada_sup,
                l_entrada_ancho: l_entrada_ancho,
                l_entrada_alto: l_entrada_alto,
                l_entrada_rod_inf: l_entrada_rod_inf,
                l_centro_rod_inf: l_centro_rod_inf,
                l_salida_sup: l_salida_sup,
                l_salida_ancho: l_salida_ancho,
                l_salida_alto: l_salida_alto,
                l_salida_rod_inf: l_salida_rod_inf,
                fp1_sup: fp1_sup,
                fp1_inf: fp1_inf,
                is2_ancho: is2_ancho,
                is2_alto: is2_alto,
                fp2_sup: fp2_sup,
                fp2_inf: fp2_inf,
                is3_ancho: is3_ancho,
                is3_alto: is3_alto,
                fp3_sup: fp3_sup,
                fp3_inf: fp3_inf,
                w_inf: w_inf,
                w_lat_op: w_lat_op,
                w_lat_mo: w_lat_mo,
                w_sup_op_v: w_sup_op_v,
                w_sup_op_h: w_sup_op_h,
                w_sup_mo_v: w_sup_mo_v,
                w_sup_mo_h: w_sup_mo_h,
                w_cab: w_cab,
                cb1_sup: cb1_sup,
                cb1_inf: cb1_inf,
                cb1_lat_op: cb1_lat_op,
                cb1_lat_mo: cb1_lat_mo,
                cb2_sup: cb2_sup,
                cb2_inf: cb2_inf,
                cb2_lat_op: cb2_lat_op,
                cb2_lat_mo: cb2_lat_mo,
                cb3_sup: cb3_sup,
                cb3_inf: cb3_inf,
                cb3_lat_op: cb3_lat_op,
                cb3_lat_mo: cb3_lat_mo,
                cb4_sup: cb4_sup,
                cb4_inf: cb4_inf,
                cb4_lat_op: cb4_lat_op,
                cb4_lat_mo: cb4_lat_mo
            }, {
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                  }     
            })
            .then( res => { 
                console.log('POST variantes: ',res.data);  
                alert('Variante guardada con exito ...');          
                
            })
            .catch(err => { console.log(err);})
        }
    }

    // Enviar Variante al PLC - TODO
    const EnviarPLC = () => {
        const data = simulador?posicionesSim:posiciones;
        console.log('datos enviados ...');
        console.log(data);
        console.log('Diametros PC ...');
        console.log(diametrosPC);
        axios.post(BACKEND_SERVER + `/api/qs/enviar_variante_PLC/`, {
            pr_inf: data.filter(p => p.nombre=='PR')[0].posiciones.filter(p =>p.eje=='INF')[0].pos,
            pr_press: data.filter(p => p.nombre=='PR')[0].posiciones.filter(p =>p.eje=='PRES')[0].pos,
            bd1_inf: data.filter(p => p.nombre=='BD1')[0].posiciones.filter(p =>p.eje=='INF')[0].pos,
            bd1_sup: data.filter(p => p.nombre=='BD1')[0].posiciones.filter(p =>p.eje=='SUP')[0].pos,
            bd2_inf: data.filter(p => p.nombre=='BD2')[0].posiciones.filter(p =>p.eje=='INF')[0].pos,
            bd2_sup: data.filter(p => p.nombre=='BD2')[0].posiciones.filter(p =>p.eje=='SUP')[0].pos,
            is1_ancho: data.filter(p => p.nombre=='IS1')[0].posiciones.filter(p =>p.eje=='ANCHO')[0].pos,
            is1_alto: data.filter(p => p.nombre=='IS1')[0].posiciones.filter(p =>p.eje=='ALTO')[0].pos,
            lineal_entrada_ancho: data.filter(p => p.nombre=='LINEAL')[0].posiciones.filter(p =>p.eje=='ENTRADA_ANCHO')[0].pos,
            lineal_entrada_alto: data.filter(p => p.nombre=='LINEAL')[0].posiciones.filter(p =>p.eje=='ENTRADA_ALTO')[0].pos,
            lineal_entrada_superior: data.filter(p => p.nombre=='LINEAL')[0].posiciones.filter(p =>p.eje=='ENTRADA_SUP')[0].pos,
            lineal_salida_ancho: data.filter(p => p.nombre=='LINEAL')[0].posiciones.filter(p =>p.eje=='SALIDA_ANCHO')[0].pos,
            lineal_salida_alto: data.filter(p => p.nombre=='LINEAL')[0].posiciones.filter(p =>p.eje=='SALIDA_ALTO')[0].pos,
            lineal_salida_superior: data.filter(p => p.nombre=='LINEAL')[0].posiciones.filter(p =>p.eje=='SALIDA_SUP')[0].pos,
            lineal_rodillo_entrada: data.filter(p => p.nombre=='LINEAL')[0].posiciones.filter(p =>p.eje=='RODILLO_INF_ENTRADA')[0].pos,
            lineal_rodillo_centro: data.filter(p => p.nombre=='LINEAL')[0].posiciones.filter(p =>p.eje=='RODILLO_INF_CENTRO')[0].pos,
            lineal_rodillo_salida: data.filter(p => p.nombre=='LINEAL')[0].posiciones.filter(p =>p.eje=='RODILLO_INF_SALIDA')[0].pos,
            fp1_inf: data.filter(p => p.nombre=='FP1')[0].posiciones.filter(p =>p.eje=='INF')[0].pos,
            fp1_sup: data.filter(p => p.nombre=='FP1')[0].posiciones.filter(p =>p.eje=='SUP')[0].pos,
            is2_ancho: data.filter(p => p.nombre=='IS2')[0].posiciones.filter(p =>p.eje=='ANCHO')[0].pos,
            is2_alto: data.filter(p => p.nombre=='IS2')[0].posiciones.filter(p =>p.eje=='ALTO')[0].pos,
            fp2_inf: data.filter(p => p.nombre=='FP2')[0].posiciones.filter(p =>p.eje=='INF')[0].pos,
            fp2_sup: data.filter(p => p.nombre=='FP2')[0].posiciones.filter(p =>p.eje=='SUP')[0].pos,
            is3_ancho: data.filter(p => p.nombre=='IS3')[0].posiciones.filter(p =>p.eje=='ANCHO')[0].pos,
            is3_alto: data.filter(p => p.nombre=='IS3')[0].posiciones.filter(p =>p.eje=='ALTO')[0].pos,
            fp3_inf: data.filter(p => p.nombre=='FP3')[0].posiciones.filter(p =>p.eje=='INF')[0].pos,
            fp3_sup: data.filter(p => p.nombre=='FP3')[0].posiciones.filter(p =>p.eje=='SUP')[0].pos,
            w_cab: data.filter(p => p.nombre=='W')[0].posiciones.filter(p =>p.eje=='CAB')[0].pos,
            w_lat_op: data.filter(p => p.nombre=='W')[0].posiciones.filter(p =>p.eje=='LAT_OP')[0].pos,
            w_lat_mo: data.filter(p => p.nombre=='W')[0].posiciones.filter(p =>p.eje=='LAT_MO')[0].pos,
            w_inf: data.filter(p => p.nombre=='W')[0].posiciones.filter(p =>p.eje=='INF')[0].pos,
            w_sup_v_op: data.filter(p => p.nombre=='W')[0].posiciones.filter(p =>p.eje=='SUP_V_OP')[0].pos,
            w_sup_v_mo: data.filter(p => p.nombre=='W')[0].posiciones.filter(p =>p.eje=='SUP_V_MO')[0].pos,
            w_sup_h_op: data.filter(p => p.nombre=='W')[0].posiciones.filter(p =>p.eje=='SUP_H_OP')[0].pos,
            w_sup_h_mo: data.filter(p => p.nombre=='W')[0].posiciones.filter(p =>p.eje=='SUP_H_MO')[0].pos,
            cb1_sup: data.filter(p => p.nombre=='CB1')[0].posiciones.filter(p =>p.eje=='SUP')[0].pos,
            cb1_inf: data.filter(p => p.nombre=='CB1')[0].posiciones.filter(p =>p.eje=='INF')[0].pos,
            cb1_lat_op: data.filter(p => p.nombre=='CB1')[0].posiciones.filter(p =>p.eje=='LAT_OP')[0].pos,
            cb1_lat_mo: data.filter(p => p.nombre=='CB1')[0].posiciones.filter(p =>p.eje=='LAT_MO')[0].pos,
            cb2_sup: data.filter(p => p.nombre=='CB2')[0].posiciones.filter(p =>p.eje=='SUP')[0].pos,
            cb2_inf: data.filter(p => p.nombre=='CB2')[0].posiciones.filter(p =>p.eje=='INF')[0].pos,
            cb2_lat_op: data.filter(p => p.nombre=='CB2')[0].posiciones.filter(p =>p.eje=='LAT_OP')[0].pos,
            cb2_lat_mo: data.filter(p => p.nombre=='CB2')[0].posiciones.filter(p =>p.eje=='LAT_MO')[0].pos,
            cb3_sup: data.filter(p => p.nombre=='CB3')[0].posiciones.filter(p =>p.eje=='SUP')[0].pos,
            cb3_inf: data.filter(p => p.nombre=='CB3')[0].posiciones.filter(p =>p.eje=='INF')[0].pos,
            cb3_lat_op: data.filter(p => p.nombre=='CB3')[0].posiciones.filter(p =>p.eje=='LAT_OP')[0].pos,
            cb3_lat_mo: data.filter(p => p.nombre=='CB3')[0].posiciones.filter(p =>p.eje=='LAT_MO')[0].pos,
            cb4_sup: data.filter(p => p.nombre=='CB4')[0].posiciones.filter(p =>p.eje=='SUP')[0].pos,
            cb4_inf: data.filter(p => p.nombre=='CB4')[0].posiciones.filter(p =>p.eje=='INF')[0].pos,
            cb4_lat_op: data.filter(p => p.nombre=='CB4')[0].posiciones.filter(p =>p.eje=='LAT_OP')[0].pos,
            cb4_lat_mo: data.filter(p => p.nombre=='CB4')[0].posiciones.filter(p =>p.eje=='LAT_MO')[0].pos,
            ...diametrosPC
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => { 
            console.log('POST variantes: ',res.data);         
            
        })
        .catch(err => { console.log(err);})
    }

    const simular = (event) => {
        event.preventDefault();
        const temp = [...posicionesSim];

        temp.filter(t => t.op ==OP)[0].posiciones.map(p => {
            p.pos = parseFloat(datos[p.eje]);
        });

        setPosicionesSim([...temp]);
    }
    
    const handleGrupoChange = (event) => {
        event.preventDefault();
        setGrupo(event.target.value);
        setMontajeActivo(0);
        setMontaje(null);
        setArticulos(null);
        setArticulo(0);
        setPosiciones(null);
        setPosicionesSim(null);
        setSimulador(false);
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

    // Si cambia el montaje leemos los diametros y posiciones activos en el PLC.
    // También leemos los diametros activos en el montaje acutal PC 
    useEffect(()=>{
        leeDiametrosPLC();
        leePosicionesPLC();
        let temp = {};
        montaje&&montaje.forEach(o => {
            o.rodillos.forEach(r =>{
                const Df_PC = r.parametros.Df;
                temp = {
                    ...temp,
                    [o.nombre + '_' + r.eje + '_D']: r.parametros.Df,
                }
            });
        });
        setDiametrosPC(temp);
    },[montaje]);

    // Cuando tenemos nuevos diametros del PLC y montaje comparamos si los diametros coinciden
    useEffect(()=>{
        diametrosPLC&&montaje&&compara_diametros_PLC_montaje();
    },[diametrosPLC, montaje]);

    // Actualizar Fleje al cambiar de articulo
    useEffect(() => {
        if (articulo==0) {
            setFleje(null);
            setDst(null);
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
            setDst(art.Dst);
        }
    },[articulo]);

    // Calculo del gap y amortiguación entre rodillos
    useEffect(()=>{
        let piston, gap, pos_i, pos_s, dext_i, dext_s, df_i, df_s;
        let pos_v_op, pos_h_op, pos_v_mo, pos_h_mo, pos_ancho;
        let h_cab;
        let xc, yc, x0, y0, x1, y1;
        let L1_mo, C1_mo, R1_mo, Dc_mo, Df_mo, L1_op, C1_op, R1_op, Dc_op, Df_op, Df, Dext;
        let gap_mo, gap_op;

        const gap_list = [];
        // console.log('Calculo de gap ...');
        fleje&&montaje&&posiciones&&posicionesSim&&montaje.map(m => {
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
                case 'W':
                    // Posiciones
                    if (!simulador){
                        pos_v_mo = posiciones.filter(p => p.op==m.operacion)[0].posiciones.filter(p => p.eje=='SUP_V_MO')[0].pos;
                        pos_h_mo = posiciones.filter(p => p.op==m.operacion)[0].posiciones.filter(p => p.eje=='SUP_H_MO')[0].pos;
                        pos_v_op = posiciones.filter(p => p.op==m.operacion)[0].posiciones.filter(p => p.eje=='SUP_V_OP')[0].pos;
                        pos_h_op = posiciones.filter(p => p.op==m.operacion)[0].posiciones.filter(p => p.eje=='SUP_H_OP')[0].pos;
                        h_cab = posiciones.filter(p => p.op==m.operacion)[0].posiciones.filter(p => p.eje=='CAB')[0].pos;
                    }
                    else {
                        pos_v_mo = posicionesSim.filter(p => p.op==m.operacion)[0].posiciones.filter(p => p.eje=='SUP_V_MO')[0].pos;
                        pos_h_mo = posicionesSim.filter(p => p.op==m.operacion)[0].posiciones.filter(p => p.eje=='SUP_H_MO')[0].pos;
                        pos_v_op = posicionesSim.filter(p => p.op==m.operacion)[0].posiciones.filter(p => p.eje=='SUP_V_OP')[0].pos;
                        pos_h_op = posicionesSim.filter(p => p.op==m.operacion)[0].posiciones.filter(p => p.eje=='SUP_H_OP')[0].pos;
                        h_cab = posicionesSim.filter(p => p.op==m.operacion)[0].posiciones.filter(p => p.eje=='CAB')[0].pos;
                    }
                    
                    // Lado Motor
                    // Parametros
                    Df_mo = m.rodillos.filter(r => r.eje=='SUP_MO')[0].parametros.Df;
                    Dc_mo = m.rodillos.filter(r => r.eje=='SUP_MO')[0].parametros.Dc;
                    L1_mo = m.rodillos.filter(r => r.eje=='SUP_MO')[0].parametros.L1;
                    C1_mo = m.rodillos.filter(r => r.eje=='SUP_MO')[0].parametros.C1;
                    R1_mo = m.rodillos.filter(r => r.eje=='SUP_MO')[0].parametros.R1;

                    // Calculos
                    y0 = h_cab + (pos_v_mo + Df_mo/2) *Math.cos(15*Math.PI/180);
                    x0 = pos_h_mo + (Df_mo/2) *Math.sin(15*Math.PI/180);
                    x1 = x0 - Dc_mo * Math.cos(75*Math.PI/180)/2;
                    y1 = y0 - Dc_mo * Math.sin(75*Math.PI/180)/2;
                    xc = x1;
                    yc = y1 - L1_mo;
                    gap_mo = x1 + C1_mo;

                    // Lado Operador
                    // Parametros
                    Df_op = m.rodillos.filter(r => r.eje=='SUP_OP')[0].parametros.Df;
                    Dc_op = m.rodillos.filter(r => r.eje=='SUP_OP')[0].parametros.Dc;
                    L1_op = m.rodillos.filter(r => r.eje=='SUP_OP')[0].parametros.L1;
                    C1_op = m.rodillos.filter(r => r.eje=='SUP_OP')[0].parametros.C1;
                    R1_op = m.rodillos.filter(r => r.eje=='SUP_OP')[0].parametros.R1;

                    y0 = h_cab + (pos_v_op + Df_op/2) *Math.cos(15*Math.PI/180);
                    x0 = -pos_h_op - (Df_op/2) *Math.sin(15*Math.PI/180);
                    x1 = x0 + Dc_op * Math.cos(75*Math.PI/180)/2;
                    y1 = y0 - Dc_op * Math.sin(75*Math.PI/180)/2;
                    xc = x1;
                    yc = y1 - L1_op;
                    gap_op = -(x1 - C1_op);

                    gap = gap_op + gap_mo;
                    piston = null;
                    break;
                case 'IS':
                    console.log('IS calculo de gap');
                    // Posiciones
                    if (!simulador){
                        pos_ancho = posiciones.filter(p => p.op==m.operacion)[0].posiciones.filter(p => p.eje=='ANCHO')[0].pos;
                    }
                    else {
                        pos_ancho = posicionesSim.filter(p => p.op==m.operacion)[0].posiciones.filter(p => p.eje=='ANCHO')[0].pos;
                    }

                    // Parametros
                    Df = m.rodillos.filter(r => r.eje=='ANCHO')[0].parametros.Df;
                    Dext = m.rodillos.filter(r => r.eje=='ANCHO')[0].parametros.Dext;

                    // Calculo
                    gap = pos_ancho + Df - Dext;
                    piston = null;
                    break;
                case 'CB':
                    piston = null;
                    switch(m.rodillos[0].tipo_plano){
                        case 'CB-R-2-S':
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
                        case 'CB-R-2-L':
                            gap = null;
                            if (!simulador){
                                pos_i = posiciones.filter(p => p.op==m.operacion)[0].posiciones.filter(p => p.eje=='LAT_OP')[0].pos;
                                pos_s = posiciones.filter(p => p.op==m.operacion)[0].posiciones.filter(p => p.eje=='LAT_MO')[0].pos;
                            }
                            else {
                                pos_i = posicionesSim.filter(p => p.op==m.operacion)[0].posiciones.filter(p => p.eje=='LAT_OP')[0].pos;
                                pos_s = posicionesSim.filter(p => p.op==m.operacion)[0].posiciones.filter(p => p.eje=='LAT_MO')[0].pos;
                            }
                            dext_i = m.rodillos.filter(r => r.eje=='LAT_OP')[0].parametros.Dext;
                            dext_s = m.rodillos.filter(r => r.eje=='LAT_MO')[0].parametros.Dext;
                            df_i = m.rodillos.filter(r => r.eje=='LAT_OP')[0].parametros.Df;
                            df_s = m.rodillos.filter(r => r.eje=='LAT_MO')[0].parametros.Df;
                            gap = pos_i + pos_s - (dext_i-df_i)/2 - (dext_s-df_s)/2;
                            break;
                        default:
                            gap = null;
                    }
                    break;
                default:
                    gap = null;
                    piston = null;
                    break;
            }
            gap_list.push({
                op: m.operacion,
                nombre: m.nombre,
                gap: gap,
                piston: piston
            });
        });
        // console.log('gap_list', gap_list);
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
                                    console.log('Calculo alturas BD2R y:', y);
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

         setAlturas(H);
    },[montaje, posiciones, posicionesSim, simulador, fleje]);

    // Paso de posicionesSim a datos
    useEffect(()=>{
        // console.log('Pasamos posiciones sim a datos ...')
        if (posiciones) {
            if (!posicionesSim) {
                console.log('No hay posiciones sim');
                const temp = [...posiciones];
                setPosicionesSim(temp);
            } 
            if (simulador) {
                const dat = {};
                posicionesSim.filter(p => p.op == OP)[0].posiciones.map(p => {
                    dat[p.eje] =  parseFloat(p.pos).toFixed(2);
                });
                setDatos(dat);
                console.log('posiciones ...');
                console.log(posiciones);
            }
        }
    }, [simulador, OP, posiciones]);

     // Calculo de desarrollo teoricos:
     useEffect(()=>{
        if (!Dst || !fleje){
            setDesarrollosTeorico(null);
            return;
        } 
        const des_W = Dst*Math.PI;
        const des_lineal = fleje.ancho + 0.863428+2.255361*fleje.espesor;
        const red_W = 1;
        const red_FP = (des_lineal - (des_W+1))/3;
        const dT = {
            'W': Dst*Math.PI,
            'FP3': des_lineal - 3*red_FP,
            'FP2': des_lineal - 2*red_FP,
            'FP1': des_lineal - 1*red_FP,
            'Lineal': des_lineal,
            'Fleje': fleje.ancho,
        }
        setDesarrollosTeorico(dT);
    },[Dst, fleje]);

    // Desarrollos modelo
    useEffect(()=>{
        desarrollosModelo&&console.log('Desarrollos modelo: ',desarrollosModelo);
    },[desarrollosModelo]);

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
                                <Col lg={6}>
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
                                <Col>
                                    <Form.Group controlId="Articulo">
                                        <Form.Label>Variante</Form.Label>
                                        <Form.Control   size="lg"
                                                        as="select" 
                                                        value={null}
                                                        name='variante'
                                                        onChange={null}>
                                            <option key={0} value={0}>Ninguno</option>                
                                            {}
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
                            <Form.Group as={Row} controlId="operacion">
                                <Form.Label column>Operación</Form.Label>
                                <Col>
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
                                </Col>
                            </Form.Group>
                        </Col>
                        <Col lg={1}>            
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
                            <Col lg={2}> 
                                <Button variant="info"  type= 'submit' className={'mx-2 float-right'} onClick={simular}>Simular</Button>
                                <Button variant="info" className={'mx-2 float-right'} onClick={CalculaPosicionEstandar}>Calcula PE</Button>
                            </Col>
                            
                        </React.Fragment>}  
                        {!simulador && 
                        <React.Fragment>
                            <Col lg={2}>
                                <Button variant={montajePLC_OK ? "success" : "danger"} className={'mx-2 float-right'} enabled={false}>Rodillos OK</Button>
                            </Col>
                        </React.Fragment>}
                            <Col lg={6}>
                                <Button variant="info" className={'mx-2 float-right'} onClick={GuardarVariante}>Guardar Variante</Button>
                                <Button variant="info" className={'mx-2 float-right'} onClick={EnviarPLC}>Enviar PLC</Button>
                            </Col>
                    </Row>
                    <Row>
                        <Col lg={6}>
                            <StandChart2 
                                montaje={montaje.filter(m => m.operacion == OP)}
                                posiciones={simulador ? posicionesSim&&posicionesSim.filter(p => p.op==OP)[0].posiciones:posiciones&&posiciones.filter(p => p.op==OP)[0].posiciones}
                                gap = {gap&&gap.filter(g => g.op == OP)}
                                fleje={fleje}/> 
                        </Col>
                        <Col>
                            <FlowerChart2 montaje={montaje}
                                        posiciones={simulador ? posicionesSim : posiciones}
                                        fleje={fleje}
                                        setDesarrollosModelo={setDesarrollosModelo}/>
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
                        <Col lg={6}>
                            <HeightChart alturas={alturas}/>
                        </Col>
                        <Col>
                            {desarrollosModelo && desarrollosTeorico && fleje &&
                            <React.Fragment>
                                <Table striped bordered hover>
                                    <thead>
                                        <tr>
                                            <th className={"w-40"}>Origen</th>
                                            <th className={"w-10"}>Desarrollo</th>
                                            <th className={"w-10"}>Lineal</th>
                                            <th className={"w-10"}>FP1</th>
                                            <th className={"w-10"}>FP2</th>
                                            <th className={"w-10"}>FP3</th>
                                            <th className={"w-10"}>W</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>Modelo</td>
                                            <td>{fleje.ancho}</td>
                                            <td>{desarrollosModelo.Lineal.toFixed(1)}</td>
                                            <td>{desarrollosModelo.FP1.toFixed(1)}</td>
                                            <td>{desarrollosModelo.FP2.toFixed(1)}</td>
                                            <td>{desarrollosModelo.FP3.toFixed(1)}</td>
                                            <td>{desarrollosModelo.W.toFixed(1)}</td>
                                        </tr>
                                        <tr>
                                            <td>Teórico</td>
                                            <td>{fleje.ancho}</td>
                                            <td>{desarrollosTeorico.Lineal.toFixed(1)}</td>
                                            <td>{desarrollosTeorico.FP1.toFixed(1)}</td>
                                            <td>{desarrollosTeorico.FP2.toFixed(1)}</td>
                                            <td>{desarrollosTeorico.FP3.toFixed(1)}</td>
                                            <td>{desarrollosTeorico.W.toFixed(1)}</td>
                                        </tr>
                                    </tbody>
                                </Table> 
                            </React.Fragment>}
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