import React, { useEffect, useRef} from 'react';
import {
    select,
    scaleLinear,
    axisBottom,
    axisLeft,
    path
  } from 'd3';
import './qs.css';
import useResizeObserver from '../utilidades/use_resizeObserver';

const FlowerChart2 = ({montaje, posiciones, fleje}) => {

    const svgRef = useRef();
    const wrapperRef = useRef();
    const dimensions = useResizeObserver(wrapperRef);

    useEffect(()=>{
        if (!dimensions) return;
        const width = dimensions.width
            , height = dimensions.height
        const margin = {top: 20, right: 20, bottom: 20, left: 20};
        const innerWidth = width - margin.left - margin.right
        const innerHeight = height - margin.top - margin.bottom;

        const svg =svgRef.current;

        const limite = fleje.ancho/2;
                
        const xScale = scaleLinear()
            .domain([-limite, limite])
            .range([0, innerWidth]);
        
        const yScale = scaleLinear()
            .domain([-limite, limite])
            .range([innerHeight, 0]);

        const rScale = scaleLinear()
            .domain([0, 2*limite])
            .range([0, innerWidth]);

        const ejeX = axisBottom(xScale);
        const ejeY = axisLeft(yScale);

        select(svg).select('.grafico')
        .attr('transform', `translate(${margin.left},${margin.top})`);

        select(svg).select('.eje-x')
        .attr('transform',`translate(${margin.left},${margin.top + innerHeight / 2})`)
        .call(ejeX);

        select(svg).select('.eje-y')
        .attr('transform', `translate(${margin.left + innerWidth / 2},${margin.top})`)
        .call(ejeY);

        function make_x_gridlines() {
            return axisBottom(xScale)
                .ticks(10)
          }

        function make_y_gridlines() {
            return axisLeft(yScale)
                .ticks(10)
          }

        function draw_BD(m, i) {
            const r = path();
            // Variables 
            let L; // longitud de fleje fuera del radio (tramo recto)
            let Df, Dc, Dext;
            let alfa, alfa1, alfa2;
            let R, R1, R2, R3;
            let x0, y0, x1, y1, x2, y2, x3, y3, x4, y4, x5, y5;
            let xc, yc, xc1, yc1, xc2, yc2, xc3, yc3;
            let d1, d2, d3, d4, d5;
            let Ancho;

            // Definición del rodillo
            const roll = m.rodillos.filter(r => r.eje=='INF')[0]; // Solo usamos el rodillo interior

            // posicion del rodillo inferior
            let pos = -posiciones.filter(p => p.op == m.operacion)[0].posiciones.filter(p => p.eje=='INF')[0].pos; 

            switch (roll.tipo_plano.slice(0,4)) {
                case 'BD_I':
                    R = roll.parametros.R;
                    alfa = roll.parametros.alfa * Math.PI / 180;
                    if (R * alfa > fleje.ancho) {
                        alfa = fleje.ancho / R;
                        L = 0;
                    }
                    else {
                        L = fleje.ancho - R * alfa;
                    }

                    Df = roll.parametros.Df;
                
                    // Calculos
                    xc = 0;
                    yc = pos + R;
                    // const pos = R - yc; // Posición del fondo del rodillo respecto al centro de máquina
                    x0 = R * Math.sin(alfa/2) + (L/2) * Math.cos(alfa/2);
                    y0 = R * (1 - Math.cos(alfa/2)) + (L/2) * Math.sin(alfa/2) - pos;
                    y1 = y0 + fleje.espesor * Math.cos(alfa/2);
                    x1 = x0 - fleje.espesor * Math.sin(alfa/2);//+ (y1-y0) / Math.tan((Math.PI + alfa)/2);
                    x2 = 0;
                    y2 = y1 - x1 / Math.tan((Math.PI - alfa)/2);
                    

                    // Centro de masas
                    const M1 = alfa * (Math.pow(R,2) - Math.pow((R-fleje.espesor),2)) / 2; // Area de la sección circular
                    const ycm1 = yc - ((2/(3*M1))*(Math.pow(R,3) - Math.pow((R-fleje.espesor),3)) * Math.sin(alfa/2)); // Centro de masas;

                    const M2 = fleje.espesor * L;
                    const yi = R * (1 - Math.cos(alfa/2)) - pos;
                    const ycm2 = yi + (L/4) + Math.sin(alfa/2) + (fleje.espesor/2) * Math.cos(alfa/2);

                    const ycm = (ycm1*M1 + ycm2*M2) /(M1+M2);
                    console.log('ycm: ', ycm);
                    
                
                    // Dibujo r.arc(xScale(xc), yScale(yc), rScale(R), (Math.PI - alfa)/2, (alfa + Math.PI)/2);
                    r.lineTo(xScale(-x0), yScale(y0));
                    r.lineTo(xScale(-x1), yScale(y1));
                    r.arcTo(xScale(x2), yScale(y2), xScale(x1), yScale(y1), rScale(R - fleje.espesor));
                    r.lineTo(xScale(x1), yScale(y1));
                    r.lineTo(xScale(x0), yScale(y0));
                    r.closePath();

                    break;
                case 'BD_W':
                    R1 = roll.parametros.R1;
                    alfa1 = roll.parametros.alfa1 * Math.PI / 180;
                    R2 = roll.parametros.R2;
                    alfa2 = roll.parametros.alfa2 * Math.PI / 180;
                    Df = roll.parametros.Df;
                    Dc = roll.parametros.Dc;
                    Ancho = roll.parametros.Ancho;

                    // Calculos
                    xc1 = - roll.parametros.XC1;
                    yc1 = pos + R1;
                    xc2 = 0;
                    yc2 = (Dc-Df)/2 - R2 + pos;
                    x0 = xc1 + R1 * Math.sin(alfa2);
                    y0 = yc1 - R1 * Math.cos(alfa2);
                    x1 = xc2 - R2 * Math.sin(alfa2);
                    y1 = yc2 + R2 * Math.cos(alfa2);

                    // longitud de fleje fuera del radio (tramo recto)
                    d1 = 2* Math.sqrt(Math.pow((x0-x1),2)+Math.pow((y0-y1),2)); // Tramo recto entre radios
                    d2 = R2 * 2 * alfa2; // Longitud tramo central
                    d3 = 2 * R1 * alfa2; 
                    d4 = 2 * R1 * alfa1;
                    d5 = d1 + d2 + d3 + d4;

                    if (d5 > fleje.ancho) {
                        alfa1 = alfa1 - (d5 - fleje.ancho)/(2*R1);
                        L = 0;
                    }
                    else {
                        L = fleje.ancho - d5;
                    }

                    x2 = -xc1 + R1 * Math.sin(alfa1);
                    y2 = yc1 - R1 * Math.cos(alfa1);
                    x3 = x2 - fleje.espesor * Math.sin(alfa1);
                    y3 = y2 + fleje.espesor * Math.cos(alfa1);
                    x4 = -x1 - fleje.espesor * Math.sin(alfa2);
                    y4 = y1 + fleje.espesor * Math.cos(alfa2);
                    x5 = x0 - fleje.espesor * Math.sin(alfa2);
                    y5 = y0 + fleje.espesor * Math.cos(alfa2);

                    // // Dibujo
                    r.arc(xScale(xc1), yScale(yc1), rScale(R1), Math.PI/2 + alfa1, Math.PI/2 - alfa2, true);
                    r.lineTo(xScale(x1), yScale(y1));
                    r.arc(xScale(xc2), yScale(yc2), rScale(R2), 3*Math.PI/2 - alfa2, 3*Math.PI/2 + alfa2);
                    r.lineTo(xScale(-x0), yScale(y0));
                    r.arc(xScale(-xc1), yScale(yc1), rScale(R1), Math.PI/2 + alfa2, Math.PI/2 - alfa1, true);
                    r.lineTo(xScale(x3), yScale(y3));
                    r.arc(xScale(-xc1), yScale(yc1), rScale(R1 - fleje.espesor), Math.PI/2 - alfa1, Math.PI/2 + alfa2);
                    r.lineTo(xScale(x4), yScale(y4));
                    r.arc(xScale(xc2), yScale(yc2), rScale(R2 + fleje.espesor), 3*Math.PI/2 + alfa2, 3*Math.PI/2 - alfa2, true);
                    r.lineTo(xScale(x5), yScale(y5));
                    r.arc(xScale(xc1), yScale(yc1), rScale(R1-fleje.espesor), Math.PI/2 - alfa2, Math.PI/2 + alfa1);
                    r.closePath();

                    break;
                    case 'BD_2':
                        R1 = roll.parametros.R1;
                        alfa1 = roll.parametros.alfa1 * Math.PI / 180;
                        R2 = roll.parametros.R2;
                        alfa2 = roll.parametros.alfa2 * Math.PI / 180;
                        R3 = roll.parametros.R3;
                        Dext = roll.parametros.Dext;
                        Df = roll.parametros.Df;

                        // Calculos
                        xc1 = 0;
                        yc1 = pos + R1;
                        xc2 = (R1-R2) * Math.sin(alfa1/2);
                        yc2 = yc1 - (R1-R2) * Math.cos(alfa1/2);
                        xc3 = xc2 - (R3-R2) * Math.sin(alfa2);
                        yc3 = yc2 + (R3-R2) * Math.cos(alfa2);

                        // longitud de fleje fuera del radio (tramo recto)
                        d1 = R1 * alfa1; // Longitud tramo central
                        d2 = 2 * R2 * alfa2;
                        d3 = d1 + d2;

                        let alfa3 = 0;
                        if (d3 > fleje.ancho) {
                            alfa2 = (d3 - fleje.ancho)/(2*R2);
                        }
                        else {
                            alfa3 = (fleje.ancho - d3)/(2*R3);
                        }
                        
                        x0 = xc3 + R3 * Math.sin(alfa2+alfa3);
                        y0 = yc3 - R3 * Math.cos(alfa2+alfa3);
                        x1 = x0 - fleje.espesor * Math.sin(alfa2+alfa3);
                        y1 = y0 + fleje.espesor * Math.cos(alfa2+alfa3);
                        // const x4 = -x1 - fleje.espesor * Math.sin(alfa2);
                        // const y4 = y1 + fleje.espesor * Math.cos(alfa2);
                        // const x5 = x0 - fleje.espesor * Math.sin(alfa2);
                        // const y5 = y0 + fleje.espesor * Math.cos(alfa2);

                        // // Centro de masas
                        // const M1 = alfa * (Math.pow(R,2) - Math.pow((R-fleje.espesor),2)) / 2; // Area de la sección circular
                        // const ycm1 = yc - ((2/(3*M1))*(Math.pow(R,3) - Math.pow((R-fleje.espesor),3)) * Math.sin(alfa/2)); // Centro de masas;

                        // const M2 = fleje.espesor * L;
                        // const yi = R * (1 - Math.cos(alfa/2)) - pos;
                        // const ycm2 = yi + (L/4) + Math.sin(alfa/2) + (fleje.espesor/2) * Math.cos(alfa/2);

                        // const ycm = (ycm1*M1 + ycm2*M2) /(M1+M2);
                        // console.log('ycm: ', ycm);
                        
                    
                        // // Dibujo
                        r.arc(xScale(xc1), yScale(yc1), rScale(R1), (Math.PI + alfa1)/2, (Math.PI - alfa1)/2, true);
                        r.arc(xScale(xc2), yScale(yc2), rScale(R2), (Math.PI - alfa1)/2, Math.PI/2 - alfa2, true);
                        r.arc(xScale(xc3), yScale(yc3), rScale(R3), Math.PI/2 - alfa2,  Math.PI/2 - alfa2 - alfa3, true);
                        r.lineTo(xScale(x1), yScale(y1));
                        r.arc(xScale(xc3), yScale(yc3), rScale(R3-fleje.espesor), Math.PI/2 - alfa2 - alfa3, Math.PI/2 - alfa2);
                        r.arc(xScale(xc2), yScale(yc2), rScale(R2-fleje.espesor), Math.PI/2 - alfa2, (Math.PI - alfa1)/2);
                        r.arc(xScale(xc1), yScale(yc1), rScale(R1-fleje.espesor), (Math.PI - alfa1)/2, (Math.PI + alfa1)/2);
                        r.arc(xScale(-xc2), yScale(yc2), rScale(R2-fleje.espesor), (Math.PI + alfa1)/2, Math.PI/2 + alfa2);
                        r.arc(xScale(-xc3), yScale(yc3), rScale(R3-fleje.espesor),  Math.PI/2 + alfa2, Math.PI/2 + alfa2 + alfa3);
                        r.lineTo(xScale(-x0), yScale(y0));
                        r.arc(xScale(-xc3), yScale(yc3), rScale(R3), Math.PI/2 + alfa2 + alfa3, Math.PI/2 + alfa2, true);
                        r.arc(xScale(-xc2), yScale(yc2), rScale(R2), Math.PI/2 + alfa2, (Math.PI + alfa1)/2, true);
                        r.closePath();

                        break;
                }

            return r.toString()
        }

        function draw_FP(m, i) {
            // Rodillos
            const roll_i = m.rodillos.filter(r => r.eje=='INF')[0];
            const roll_s = m.rodillos.filter(r => r.eje=='SUP')[0];

            // posiciones de los rodillos
            const pos_i = -posiciones.filter(p => p.op == m.operacion)[0].posiciones.filter(p => p.eje=='INF')[0].pos; 
            const pos_s = posiciones.filter(p => p.op == m.operacion)[0].posiciones.filter(p => p.eje=='SUP')[0].pos; 

            // Dibujo rodillo inferior
            // Variables
            let xc, yc, xc2, yc2;
            let xc1_s, yc1_s, xc2_s, yc2_s;
            let x1, y1, x2, y2, x3, y3;//, x4, y4, x5, y5, x6, y6;
            let xcr, ycr; // Centro de los rodillos
            let Dext_i, Df_i, Dc_i, C, D_cuchilla;
            let Dext_s, Df_s, Dc_s
            let R1, alfa1, R2, alfa2, R3, alfa3, R4;
            let R1_s, alfa1_s, R2_s, alfa2_s, R3_s, alfa3_s;

            // Parametros
            R1 = roll_i.parametros.R1;
            R2 = roll_i.parametros.R2;
            R3 = roll_i.parametros.R3;
            alfa1 = roll_i.parametros.alfa1 * Math.PI / 180;
            alfa2 = roll_i.parametros.alfa2 * Math.PI / 180;
            alfa3 = roll_i.parametros.alfa3 * Math.PI / 180;

            Dext_i = roll_i.parametros.Dext;
            Df_i = roll_i.parametros.Df;
            Dc_i = roll_i.parametros.Dc;
            Dext_s = roll_s.parametros.Dext;
            Df_s = roll_s.parametros.Df;
            Dc_s = roll_s.parametros.Dc;

            // Calculos
            // pos_i = -AxisPos0_i + Df_i / 2;
            ycr = ((pos_s + Df_s/2 - Dc_s/2) + (pos_i - Df_i/2 + Dc_i/2)) / 2; 
            xc = 0;
            yc = pos_i + R1;
            xc2 = (R2-R1) * Math.sin(alfa1/2);
            yc2 = yc + (R2-R1) * Math.cos(alfa1/2);
            x3 = xc2 - R2 * Math.cos(alfa3);
            y3 = yc2 - R2 * Math.sin(alfa3);
            xcr = x3 + (1/Math.tan(alfa3)) * (ycr - y3);
            R4 = Math.sqrt(Math.pow(x3-xcr,2)+Math.pow(y3 - ycr,2));

            Df_s = roll_s.parametros.Df
            R1_s = roll_s.parametros.R1;
            R2_s = roll_s.parametros.R2;
            R3_s = roll_s.parametros.R3;
            alfa1_s = roll_s.parametros.alfa1 * Math.PI / 180;
            alfa2_s = roll_s.parametros.alfa2 * Math.PI / 180;
            alfa3_s = roll_s.parametros.alfa3 * Math.PI / 180;
            C = roll_s.parametros.cuchilla;

            let alfa_c = 0;
             if (R1_s != 0) {
                alfa_c = Math.asin(C/(2*R1_s));
             }
            
            // pos_s = AxisPos0_s - Df_s / 2;
            x1 = -C/2;
            y1 = pos_s;
            
            xc1_s = 0;
            
            if (R1_s===0){
                xc2_s = R2_s * Math.cos(alfa2_s) - C/2;
                yc2_s = y1 - R2_s * Math.sin(alfa2_s);
                x2 = x1 + fleje.espesor*Math.cos(alfa2_s);
                y2 = y1 - fleje.espesor*Math.sin(alfa2_s);
            }
            else{
                yc1_s = pos_s - Math.sqrt(Math.pow(R1_s,2)-Math.pow(C/2,2));
                xc2_s = (R2_s-R1_s) * Math.cos(alfa2_s);
                yc2_s = yc1_s - (R2_s-R1_s) * Math.sin(alfa2_s);
                x2 = x1 + fleje.espesor*Math.sin(alfa_c);
                y2 = y1 - fleje.espesor*Math.cos(alfa_c);
            }

            const Desarrollo = R1*alfa1 + 2*R2*((Math.PI-alfa1)/2 - alfa3) + 2*R4*(2*alfa3) + 2*R2_s*(alfa2_s-alfa3_s) + 2*R1_s*(alfa1_s/2-alfa_c);
            // console.log(m.nombre + ' desarrollo: ', Desarrollo); 

            // Solo dibujamos si los rodillos no se tocan
            let gap = pos_s - pos_i - (Dext_i-Df_i)/2 - (Dext_s-Df_s)/2;

            const r = path();
            if (gap > 0.0) {
                r.arc(xScale(xc), yScale(yc), rScale(R1), (Math.PI - alfa1)/2, (Math.PI + alfa1)/2);
                r.arc(xScale(xc2), yScale(yc2), rScale(R2), (Math.PI+alfa1)/2, Math.PI - alfa3);
                r.arc(xScale(xcr), yScale(ycr), rScale(R4), Math.PI - alfa3, Math.PI + alfa3); 
                r.arc(xScale(xc2_s), yScale(yc2_s), rScale(R2_s), Math.PI + alfa3_s, Math.PI + alfa2_s);
                if(R1_s!==0){
                    r.arc(xScale(xc1_s), yScale(yc1_s), rScale(R1_s), Math.PI + alfa2_s, (3*Math.PI/2) - alfa_c);
                    r.lineTo(xScale(x2), yScale(y2));
                    r.arc(xScale(xc1_s), yScale(yc1_s), rScale(R1_s-fleje.espesor), 3*Math.PI/2 - alfa_c, Math.PI + alfa2_s, true);
                }
                else{
                    r.lineTo(xScale(x2), yScale(y2));
                }
                r.arc(xScale(xc2_s), yScale(yc2_s), rScale(R2_s-fleje.espesor), Math.PI + alfa2_s, Math.PI + alfa3_s, true);
                r.arc(xScale(xcr), yScale(ycr), rScale(R4-fleje.espesor), Math.PI + alfa3 , Math.PI - alfa3, true);
                r.arc(xScale(xc2), yScale(yc2), rScale(R2-fleje.espesor), Math.PI - alfa3, (Math.PI+alfa1)/2, true);
                r.arc(xScale(xc), yScale(yc), rScale(R1-fleje.espesor), (Math.PI + alfa1)/2, (Math.PI - alfa1)/2, true);
                r.arc(xScale(-xc2), yScale(yc2), rScale(R2-fleje.espesor), (Math.PI-alfa1)/2, alfa3, true);
                r.arc(xScale(-xcr), yScale(ycr), rScale(R4-fleje.espesor), alfa3 , - alfa3 , true);
                r.arc(xScale(-xc2_s), yScale(yc2_s), rScale(R2_s-fleje.espesor), -alfa3_s, -alfa2_s, true);
                if(R1_s!==0){
                    r.arc(xScale(-xc1_s), yScale(yc1_s), rScale(R1_s-fleje.espesor), -alfa2_s, 3*Math.PI/2+ alfa_c,true);
                    r.lineTo(xScale(-x1), yScale(y1));
                    r.arc(xScale(-xc1_s), yScale(yc1_s), rScale(R1_s), 3*Math.PI/2+ alfa_c, -alfa2_s);
                }
                else{
                    r.lineTo(xScale(-x1), yScale(y1));
                }
                r.arc(xScale(-xc2_s), yScale(yc2_s), rScale(R2_s), -alfa2_s, -alfa3_s,);
                r.arc(xScale(-xcr), yScale(ycr), rScale(R4), -alfa3 ,  alfa3);
                r.arc(xScale(-xc2), yScale(yc2), rScale(R2), alfa3, (Math.PI-alfa1)/2);
            }
            return r.toString()
        }

        function draw_W(m,i) { //Soldadura
            const r = path();

            // Rodillos
            const roll_lop = m.rodillos.filter(r => r.eje=='LAT_OP')[0]; // Lateral OP
            const roll_lmo = m.rodillos.filter(r => r.eje=='LAT_MO')[0]; // Lateral OP
            const roll_i = m.rodillos.filter(r => r.eje=='INF')[0]; // Inferior
            const roll_sop = m.rodillos.filter(r => r.eje=='SUP_OP')[0];
            const roll_smo = m.rodillos.filter(r => r.eje=='SUP_MO')[0];

            // Posiciones
            const pos_inf = posiciones.filter(p => p.op == m.operacion)[0].posiciones.filter(p => p.eje=='INF')[0].pos;
            const pos_lop = posiciones.filter(p => p.op == m.operacion)[0].posiciones.filter(p => p.eje=='LAT_OP')[0].pos;
            const pos_lmo = posiciones.filter(p => p.op == m.operacion)[0].posiciones.filter(p => p.eje=='LAT_MO')[0].pos;
            const pos_h_op = posiciones.filter(p => p.op == m.operacion)[0].posiciones.filter(p => p.eje=='SUP_H_OP')[0].pos;
            const pos_v_op = posiciones.filter(p => p.op == m.operacion)[0].posiciones.filter(p => p.eje=='SUP_V_OP')[0].pos;
            const pos_h_mo = posiciones.filter(p => p.op == m.operacion)[0].posiciones.filter(p => p.eje=='SUP_H_MO')[0].pos;
            const pos_v_mo = posiciones.filter(p => p.op == m.operacion)[0].posiciones.filter(p => p.eje=='SUP_V_MO')[0].pos;
            const h_cab = posiciones.filter(p => p.op == m.operacion)[0].posiciones.filter(p => p.eje=='CAB')[0].pos;

            // Espesor
            const e = fleje.espesor;

            // Parametros
            const R1_l = roll_lop.parametros.R1;
            const R1_s = roll_sop.parametros.R1;

            // Calculos
            let dibujar = true;
            //Superior OP
            const x1 = -pos_h_op;
            const y1 = pos_v_op * Math.cos(15*Math.PI/180) + h_cab;
            const x2 =  -pos_h_op + pos_v_op * Math.sin(15*Math.PI/180);
            const y2 = h_cab;
            const x3 = x2;
            const y3 = y1 - Math.sqrt(R1_s**2 - (x1-x3)**2);
            let a,b,c; // Parametros para resolver ec de 2 grado
            a = 1;
            b = -2*y3;
            c = y3**2 + x3**2 - R1_s**2;
            const x0 = 0;
            const y0 = (-b + Math.sqrt(b**2 - 4*a*c))/(2*a); //Punto de corte con la vertical de radio del rodillo superior

            const x4 = R1_l - pos_lop;
            const y4 = h_cab;
            const m1 = (x3-x4)/(y4-y3);
            const b1 = (R1_s**2 - R1_l**2 + x4**2 + y4**2 - x3**2 - y3**2)/(2*(y4-y3));
            a = 1 + m1**2;
            b = 2*(m1*b1 - x3 - m1*y3);
            c = (b1-y3)**2 + x3**2 - R1_s**2;
            const x5 = (-b - Math.sqrt(b**2 - 4*a*c))/(2*a);
            const y5 = m1*x5 + b1;
            const alfa1 = Math.atan((y5-y4)/(x4-x5));
            const alfa2 = Math.atan((y5-y3)/(x3-x5));
            const alfa3 = Math.atan((y0-y3)/(x3-x0));
            
            // Inferior OP
            let R2, alfa4;
            let x6,y6;
            if (pos_lop<pos_inf){
                R2 = (R1_l**2 - (R1_l - pos_lop)**2 - pos_inf**2)/(2*(R1_l - pos_inf));
                alfa4 = Math.atan((pos_inf-R2)/(R1_l-pos_lop));
                x6 = 0;
                y6 = R2 - pos_inf + h_cab;
            }
            else {
                if (pos_lop == pos_inf){
                    R2 = pos_lop;
                    alfa4 = Math.PI/2;
                    x6 = 0;
                    y6 = h_cab;
                }
                else {
                    R2 = (R1_l**2 - (R1_l - pos_inf)**2 - pos_lop**2)/(2*(R1_l - pos_lop));
                    alfa4 = Math.atan((R1_l-pos_inf)/(pos_lop-R2));
                    x6 = -(pos_lop - R2);
                    console.log('x6: ', x6);
                    y6 = h_cab;
                }
            }
            const x7 = 0;
            const y7 = R1_l - pos_inf + h_cab;
            if (alfa4 < 0) dibujar=false;

            // Inferior motor
            let R2m, alfa4m;
            let x6m,y6m;
            const x4m = pos_lmo - R1_l;
            const y4m = h_cab;
            if (pos_lmo<pos_inf){
                R2m = (R1_l**2 - (R1_l - pos_lmo)**2 - pos_inf**2)/(2*(R1_l - pos_inf));
                alfa4m = Math.atan((pos_inf-R2)/(R1_l-pos_lmo));
                x6m = 0;
                y6m = R2m - pos_inf + h_cab;
            }
            else {
                if (pos_lmo == pos_inf){
                    R2m = pos_lmo;
                    alfa4m = Math.PI/2;
                    x6m = 0;
                    y6m = h_cab;
                }
                else {
                    R2m = (R1_l**2 - (R1_l - pos_inf)**2 - pos_lmo**2)/(2*(R1_l - pos_lmo));
                    alfa4m = Math.atan((R1_l-pos_inf)/(pos_lmo-R2));
                    x6m = pos_lmo - R2;
                    y6m = h_cab;
                }
            }
            const x7m = 0;
            const y7m = R1_l - pos_inf + h_cab;

            // Superior MO
            const x1m = pos_h_mo;
            const y1m = pos_v_mo * Math.cos(15*Math.PI/180) + h_cab;
            const x2m =  pos_h_op - pos_v_op * Math.sin(15*Math.PI/180);
            const y2m = h_cab;
            const x3m = x2m;
            const y3m = y1m - Math.sqrt(R1_s**2 - (x1m-x3m)**2);
            // Parametros para resolver ec de 2 grado
            a = 1;
            b = -2*y3;
            c = y3**2 + x3**2 - R1_s**2;
            const x0m = 0;
            const y0m = (-b + Math.sqrt(b**2 - 4*a*c))/(2*a); //Punto de corte con la vertical de radio del rodillo superior

            const m1m = (x4m-x3m)/(y3m-y4m);
            const b1m = (R1_s**2 - R1_l**2 + x4m**2 + y4m**2 - x3m**2 - y3m**2)/(2*(y4m-y3m));
            a = 1 + m1m**2;
            b = 2*(m1m*b1m - x3m - m1m*y3m);
            c = (b1m-y3m)**2 + x3m**2 - R1_s**2;
            const x5m = (-b + Math.sqrt(b**2 - 4*a*c))/(2*a);
            const y5m = m1m*x5m + b1m;
            const alfa1m = Math.atan((y5m-y4m)/(x5m-x4m));
            const alfa2m = Math.atan((y5m-y3m)/(x5m-x3m));
            const alfa3m = Math.atan((y0m-y3m)/(x0m-x3m));

            // Condiciones para dibujar
            // if (y0 < Math.abs(pos_lop) || y0 > y02) dibujar = false;

            // Dibujo
            if (dibujar){
                // r.moveTo(xScale(x1), yScale(y1));
                // r.lineTo(xScale(x2), yScale(y2));
                // r.lineTo(xScale(x3), yScale(y3));
                // Superior OP
                r.arc(xScale(x3), yScale(y3), rScale(R1_s), Math.PI + alfa3, Math.PI + alfa2, true);
                r.arc(xScale(x4), yScale(y4), rScale(R1_l), Math.PI + alfa1, Math.PI, true);   
                // Inferior OP   
                if (pos_lop<pos_inf){
                    r.arc(xScale(x4), yScale(y4), rScale(R1_l), Math.PI, Math.PI - alfa4, true);
                    r.arc(xScale(x6), yScale(y6), rScale(R2), Math.PI - alfa4, Math.PI/2, true);
                }
                else {
                    r.arc(xScale(x6), yScale(y6), rScale(R2), Math.PI, Math.PI - alfa4, true);
                    r.arc(xScale(x7), yScale(y7), rScale(R1_l), Math.PI - alfa4, Math.PI/2, true);
                }
                // Inferior MO
                if (pos_lmo<pos_inf){
                    r.arc(xScale(x6m), yScale(y6m), rScale(R2m), Math.PI/2, alfa4m, true);
                    r.arc(xScale(x4m), yScale(y4m), rScale(R1_l), alfa4m, 0, true);
                }
                else {
                    r.arc(xScale(x7m), yScale(y7m), rScale(R1_l), Math.PI/2, alfa4m, true);
                    r.arc(xScale(x6m), yScale(y6m), rScale(R2m), alfa4m, 0, true);
                }
                // Superior MO
                r.arc(xScale(x4m), yScale(y4m), rScale(R1_l), 0, -alfa1m, true);
                r.arc(xScale(x3m), yScale(y3m), rScale(R1_s),  -alfa2m, -alfa3m, true);
                // Vuelta
                // Superior MO
                r.lineTo(xScale(x0), yScale(y0-e));
                r.arc(xScale(x3m), yScale(y3m), rScale(R1_s - e),  -alfa3m, -alfa2m);
                r.arc(xScale(x4m), yScale(y4m), rScale(R1_l - e), -alfa1m, 0);
                // Inferior MO
                if (pos_lmo<pos_inf){
                    r.arc(xScale(x4m), yScale(y4m), rScale(R1_l - e), 0, alfa4m);
                    r.arc(xScale(x6m), yScale(y6m), rScale(R2m - e), alfa4m, Math.PI/2);
                }
                else {
                    
                    r.arc(xScale(x6m), yScale(y6m), rScale(R2m - e), 0, alfa4m);
                    r.arc(xScale(x7m), yScale(y7m), rScale(R1_l - e), alfa4m, Math.PI/2);
                }
                // Inferior OP   
                if (pos_lop<pos_inf){
                    r.arc(xScale(x6), yScale(y6), rScale(R2 - e), Math.PI/2, Math.PI - alfa4);
                    r.arc(xScale(x4), yScale(y4), rScale(R1_l - e ), Math.PI - alfa4, Math.PI);
                }
                else {
                    r.arc(xScale(x7), yScale(y7), rScale(R1_l - e), Math.PI/2, Math.PI - alfa4);
                    r.arc(xScale(x6), yScale(y6), rScale(R2 - e), Math.PI - alfa4, Math.PI);
                }
                // Superior OP
                r.arc(xScale(x4), yScale(y4), rScale(R1_l - e), Math.PI, Math.PI + alfa1);
                r.arc(xScale(x3), yScale(y3), rScale(R1_s - e), Math.PI + alfa2, Math.PI + alfa3);

            }

            // Debug
            console.log('Draw W ...');
            // console.log('y1: ', y1);
            // console.log('alfa1: ', alfa1*180/Math.PI);
            // console.log('alfa2: ', alfa2*180/Math.PI);
            // console.log('alfa3: ', alfa3*180/Math.PI);
            // console.log('alfa1m: ', alfa1m*180/Math.PI);
            // console.log('alfa2m: ', alfa2m*180/Math.PI);
            // console.log('alfa3m: ', alfa3m*180/Math.PI);
            // console.log('superior op: ');
            // console.log('x5, y5 ',x5,y5);
            // console.log('superior mo: ');
            // console.log('x5m, y5m ',x5m,y5m);
            // console.log('x5 ', x5);
            // console.log(roll_lop, roll_i, roll_lmo, roll_sop, roll_smo)
            // console.log(pos_inf, pos_lop, pos_lmo, pos_h_mo, pos_v_mo, pos_h_op, pos_v_op);

            return r.toString()
        }
        
        function draw_flawer(m,i) {
          let p = '';
          if (posiciones){
            switch (m.tipo) {
                case 'BD':
                    p = draw_BD(m,i);
                    break;
                case 'FP':
                    p = draw_FP(m, i);
                    break;
                case 'W':
                    p = draw_W(m, i);
                    break;
            }
        }
          return p;
        }

        select(svg).select('.grid-x')
            .attr('transform',`translate(${margin.left},${margin.top + innerHeight})`)
            .style("stroke-dasharray",("3,3"))
            .call(make_x_gridlines()
              .tickSize(-innerHeight)
              .tickFormat("")
            );

        select(svg).select('.grid-y')
            .attr('transform', `translate(${margin.left},${margin.top})`)
            .style("stroke-dasharray",("3,3"))
            .call(make_y_gridlines()
              .tickSize(-innerWidth)
              .tickFormat("")
            );

        // Dibujo de la flor
        select(svg).select('.grafico')
            .selectAll('path')
            .data(montaje)
            .join('path')
            .attr('fill', m => m.color)
            // .attr('fill', 'none')
            .attr('opacity', 0.5)
            .attr('stroke', m => m.color)
            .style("stroke-width", 1)
            .attr('d', (m,i) => draw_flawer(m,i));

        // Dibujo del fleje
        select(svg).select('.grafico')
            .selectAll('rect')
            .data([fleje])
            .join('rect')
            .attr('fill', f => f.color) 
            .attr('opacity', 0.5)
            .attr('stroke', f => f.color)
            .style("stroke-width", 1)
            .attr('x', f => xScale(-f.ancho/2))
            .attr('y', f => yScale(f.espesor /2))
            .attr('width', f => rScale(f.ancho))
            .attr('height', f => rScale(f.espesor));
               
    },[dimensions, montaje, posiciones, fleje]);

    return (
        <div ref={wrapperRef}>
            <svg ref={svgRef} className='standChart'>
                <g className='grafico'></g>
                <g className='grid-x grid'></g>
                <g className='grid-y grid'></g>
                <g className='eje-x'></g>
                <g className='eje-y'></g>  
            </svg>
        </div>
    );
}

export default FlowerChart2;