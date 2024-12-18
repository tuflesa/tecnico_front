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


const StandChart = ({montaje, ejes, posiciones, simulador, gap, fleje}) => {
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

        let ancho_max = 0;
        for (let i = 0; i < montaje[0].rodillos.length; i++) {
            if (ancho_max < montaje[0].rodillos[i].parametros.Ancho) {ancho_max = montaje[0].rodillos[i].parametros.Ancho}
        }
        const limite = ancho_max / 2 + 100;
                
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

        function draw_BD(stand, i) {
            
            const r = path();
            // Rodillos
            const roll_i = stand.rodillos[0];
            const roll_s = stand.rodillos[1];

            // Rodillo inferior
            // Definición del rodillo
            const AxisPos0_i = -ejes['INF']; // Posición del eje inferior referido al centro de la máquina
            const AxisPos0_s = ejes['SUP']; // Posición del eje superior referido al centro de la máquina

            // Variables
            let R;
            let Dext; 
            let Ancho;
            let alfa;
            let pos;
            let xc, yc, x0, y0, x1, y1, x2, y2, x3, y3;
            
           
            R = roll_i.parametros.R;
            Dext = roll_i.parametros.Dext;
            Ancho = roll_i.parametros.Ancho;
            alfa = roll_i.parametros.alfa * Math.PI / 180;
            const Df = roll_i.parametros.Df;
              
            // Calculos
            xc = 0;
            yc = AxisPos0_i + Df/2 + R;
            pos = R - yc; // Posición del fondo del rodillo respecto al centro de máquina
            x0 = R * Math.sin(alfa/2);
            y0 = R * (1 - Math.cos(alfa/2)) - pos;
            y1 = (Dext - Df) / 2 - pos;
            x1 = x0 + (y1-y0) / Math.tan(alfa/2)
            x2 = Ancho/2;
            y2 = (Dext-Df)/2 - pos;
            x3 = x2;
            y3 = (Dext-Df)/2 - pos - 120;
              
            // Dibujo
            r.arc(xScale(xc), yScale(yc), rScale(R), Math.PI/2, (alfa + Math.PI)/2);
            r.arcTo(xScale(-x1), yScale(y1), xScale(-x2), yScale(y2), rScale(40));
            r.lineTo(xScale(-x2), yScale(y2));
            r.lineTo(xScale(-x3), yScale(y3));
            r.moveTo(xScale(xc), yScale(-pos));
            r.arc(xScale(xc), yScale(yc), rScale(R), Math.PI/2, Math.PI/2 - alfa/2, true);
            r.arcTo(xScale(x1), yScale(y1), xScale(x2), yScale(y2), rScale(40));
            r.lineTo(xScale(x2), yScale(y2));
            r.lineTo(xScale(x3), yScale(y3));

            // Rodillo superior
            R = roll_s.parametros.R;
            Dext = roll_s.parametros.Df;
            Ancho = roll_s.parametros.Ancho;

            // Calculos
            alfa = 2 * Math.asin(Ancho / (2*R));
            pos = AxisPos0_s - Dext / 2;
            const pos_i = roll_i.parametros.Df/2 + AxisPos0_i;
            let c = 60; 

            if (pos<= pos_i+fleje.espesor) {
              c = c - (pos_i - pos + fleje.espesor);
              pos= pos_i + fleje.espesor;
            }

            xc = 0;
            yc = pos + R;
            x0 = Ancho / 2;
            y0 = R + pos;
            x1 = x0;
            y1 = yc - R * Math.cos(alfa/2);


            r.moveTo(xScale(x0), yScale(y0));
            r.lineTo(xScale(x1), yScale(y1));
            r.arc(xScale(xc), yScale(yc), rScale(R), Math.PI/2 - alfa/2,  Math.PI/2 + alfa/2);
            r.lineTo(xScale(-x0), yScale(y0));
            

            return r.toString()
        }

        function draw_BD_W(stand, i) {
            
            const r = path();
            // Rodillos
            const roll_i = stand.rodillos[0];
            const roll_s = stand.rodillos[1];

            // Rodillo inferior
            // Definición del rodillo
            const AxisPos0_i = -ejes['INF']; // Posición del eje inferior referido al centro de la máquina
            const AxisPos0_s = ejes['SUP']; // Posición del eje superior referido al centro de la máquina

            // Variables
            let R1, R2, R3;
            let Dext; 
            let Ancho;
            let alfa1, alfa2;
            let pos;
            let xc1, yc1, x0, y0, x1, y1, x2, y2, x3, y3, x4, y4, x5, y5, x6, y6;
            
           
            R1 = roll_i.parametros.R1;
            R2 = roll_i.parametros.R2;
            R3 = roll_i.parametros.R3;
            Dext = roll_i.parametros.Dext;
            Ancho = roll_i.parametros.Ancho;
            alfa1 = roll_i.parametros.alfa1 * Math.PI / 180;
            alfa2 = roll_i.parametros.alfa2 * Math.PI / 180;
            let Df = roll_i.parametros.Df;
            const Dc = roll_i.parametros.Dc;
              
            // Calculos
            xc1 = -roll_i.parametros.xc1;
            yc1 = AxisPos0_i + Df/2 + R1;
            pos = R1 - yc1; // Posición del fondo del rodillo respecto al centro de máquina
            x0 = xc1 - R1 * Math.sin(alfa1);
            y0 = yc1 - R1 * Math.cos(alfa1);
            x2 = -Ancho/2;
            y2 = (Dext-Df)/2 - pos;
            y1 = y2;
            x1 = x0 - (y1-y0) / Math.tan(alfa1);
            x3 = x2;
            y3 = (Dext-Df)/2 - pos - 120;
            x4 = xc1 + R1 * Math.sin(alfa2);
            y4 = yc1 - R1 * Math.cos(alfa2);
            x6 = 0
            y6 = (Dc-Df)/2 - pos;
            y5 = y6;
            x5 = x4 + (y5-y4) / Math.tan(alfa2)
              
            // Dibujo
            r.arc(xScale(xc1), yScale(yc1), rScale(R1), Math.PI/2 - alfa2, alfa1 + Math.PI/2);
            r.arcTo(xScale(x1), yScale(y1), xScale(x2), yScale(y2), rScale(R3));
            r.lineTo(xScale(x2), yScale(y2));
            r.lineTo(xScale(x3), yScale(y3));
            r.moveTo(xScale(x4), yScale(y4));
            r.arcTo(xScale(x5), yScale(y5), xScale(x6), yScale(y6), rScale(R2));
            r.arc(xScale(0), yScale(y6-R2), rScale(R2), 3*Math.PI/2, 3*Math.PI/2 + alfa2);
            r.lineTo(xScale(-x4), yScale(y4));
            r.arc(xScale(-xc1), yScale(yc1), rScale(R1), Math.PI/2 + alfa2, -alfa1 + Math.PI/2, true);
            r.arcTo(xScale(-x1), yScale(y1), xScale(-x2), yScale(y2), rScale(R3));
            r.lineTo(xScale(-x2), yScale(y2));
            r.lineTo(xScale(-x3), yScale(y3));

            // Rodillo superior
            const R = roll_s.parametros.R;
            const H = roll_s.parametros.H;
            Df = roll_s.parametros.Df;
            Ancho = roll_s.parametros.Ancho;

            // Calculos
            const alfa = 2 * Math.asin(Ancho / (2*R));
            pos = AxisPos0_s - Df / 2;
            const pos_i = roll_i.parametros.Df/2 + AxisPos0_i;
            let c = 60; 

            if (pos<= pos_i+fleje.espesor) {
              c = c - (pos_i - pos + fleje.espesor);
              pos= pos_i + fleje.espesor;
            }
            // console.log('OP: ', stand.operacion);
            // console.log('Piston: ', c);

            const xc = H/2;
            const yc = pos + R;
            x0 = (Ancho + H) / 2;
            y0 = R + pos + 100;
            x1 = x0;
            y1 = yc - R * Math.cos(alfa/2);
            x2 = x0 - Ancho;
            y2 = y0

            r.moveTo(xScale(x0), yScale(y0));
            r.lineTo(xScale(x1), yScale(y1));
            r.arc(xScale(xc), yScale(yc), rScale(R), Math.PI/2 - alfa/2,  Math.PI/2 + alfa/2);
            r.lineTo(xScale(x2), yScale(y2));
            r.moveTo(xScale(-x0), yScale(y0));
            r.lineTo(xScale(-x1), yScale(y1));
            r.arc(xScale(-xc), yScale(yc), rScale(R), Math.PI/2 + alfa/2,  Math.PI/2 - alfa/2, true);
            r.lineTo(xScale(-x2), yScale(y2));
            

            return r.toString()
        }

        function draw_BD_2R(stand, i) {
            
            const r = path();
            // Rodillos
            const roll_i = stand.rodillos[0];
            const roll_s = stand.rodillos[1];

            // Rodillo inferior
            // Definición del rodillo
            const AxisPos0_i = -ejes['INF']; // Posición del eje inferior referido al centro de la máquina
            const AxisPos0_s = ejes['SUP']; // Posición del eje superior referido al centro de la máquina

            // Variables
            let R1, R2, R3, R4;
            let Dext; 
            let Ancho;
            let alfa1, alfa2, alfa3;
            let pos;
            let xc1, yc1, xc2, yc2, xc3, yc3;
            let x0, y0, x1, y1, x2, y2, x3, y3, x4, y4;
            
           
            R1 = roll_i.parametros.R1;
            R2 = roll_i.parametros.R2;
            R3 = roll_i.parametros.R3;
            R4 = roll_i.parametros.R4;
            Dext = roll_i.parametros.Dext;
            Ancho = roll_i.parametros.Ancho;
            alfa1 = roll_i.parametros.alfa1 * Math.PI / 180;
            alfa2 = roll_i.parametros.alfa2 * Math.PI / 180;
            alfa3 = roll_i.parametros.alfa3 * Math.PI / 180;
            const Df = roll_i.parametros.Df;
              
            // Calculos
            xc1 = 0;
            yc1 = AxisPos0_i + Df/2 + R1;
            pos = R1 - yc1; // Posición del fondo del rodillo respecto al centro de máquina
            xc2 = -(R1-R2) * Math.sin(alfa1/2);
            yc2 = yc1 - (R1-R2) * Math.cos(alfa1/2);
            xc3 = xc2 + (R3-R2) * Math.sin(alfa2+alfa1/2);
            yc3 = yc2 + (R3-R2) * Math.cos(alfa2+alfa1/2);
            x0 = xc3 - R3 * Math.sin(alfa3+alfa2+alfa1/2);
            y0 = yc3 - R3 * Math.cos(alfa3+alfa2+alfa1/2);
            x2 = -Ancho/2;
            y2 = (Dext-Df)/2 - pos;
            y1 = y2;
            x1 = x0 - (y1-y0) / Math.tan(alfa3+alfa2+alfa1/2);
            x3 = x2;
            y3 = (Dext-Df)/2 - pos - 120;
            x4 = R1 * Math.sin(alfa1/2);
            y4 = yc1 - R1 * Math.cos(alfa1/2);

            // Dibujo
            r.arc(xScale(xc1), yScale(yc1), rScale(R1), (Math.PI - alfa1) / 2, (alfa1 + Math.PI)/2);
            r.arc(xScale(xc2), yScale(yc2), rScale(R2), (Math.PI + alfa1) / 2, alfa2 + (alfa1 + Math.PI)/2);
            r.arc(xScale(xc3), yScale(yc3), rScale(R3), alfa2 + (Math.PI + alfa1) / 2, alfa3 + alfa2 + (alfa1 + Math.PI)/2);
            r.arcTo(xScale(x1), yScale(y1), xScale(x2), yScale(y2), rScale(R4));
            r.lineTo(xScale(x2), yScale(y2));
            r.lineTo(xScale(x3), yScale(y3));
            r.moveTo(xScale(x4), yScale(y4));
            r.arc(xScale(-xc2), yScale(yc2), rScale(R2), (Math.PI - alfa1) / 2, (Math.PI-alfa1)/2 - alfa2, true);
            r.arc(xScale(-xc3), yScale(yc3), rScale(R3), (Math.PI - alfa1) / 2 - alfa2, (Math.PI-alfa1)/2 - alfa2 - alfa3, true);
            r.arcTo(xScale(-x1), yScale(y1), xScale(-x2), yScale(y2), rScale(R4));
            r.lineTo(xScale(-x2), yScale(y2));
            r.lineTo(xScale(-x3), yScale(y3));

            // Rodillo superior
            R1 = roll_s.parametros.R1;
            R2 = roll_s.parametros.R2;
            R3 = roll_s.parametros.R3;
            alfa1 = roll_s.parametros.alfa1 * Math.PI / 180;
            alfa2 = roll_s.parametros.alfa2 * Math.PI / 180;
            Dext = roll_s.parametros.Df;
            Ancho = roll_s.parametros.Ancho;

            // Calculos
            pos = AxisPos0_s - Dext / 2;
            const pos_i = roll_i.parametros.Df/2 + AxisPos0_i;
            let c = 60; 

            if (pos<= pos_i+fleje.espesor) {
              c = c - (pos_i - pos + fleje.espesor);
              pos= pos_i + fleje.espesor;
            }

            xc1 = 0;
            yc1 = pos + R1;
            xc2 = xc1 + (R1-R2) * Math.sin(alfa1);
            yc2 = yc1 - (R1-R2) * Math.cos(alfa1);
            x0 = 0;
            y0 = pos;

            x1 = xc2 + R2 * Math.sin(alfa2+alfa1);
            y1 = yc2 - R2 * Math.cos(alfa2+alfa1);
            x3 = Ancho/2;
            y3 = Dext/2 + pos;
            x2 = x3;
            y2 = y1 + (x2-x1) * Math.tan(alfa2+alfa1);

            r.moveTo(xScale(x0), yScale(y0));
            r.arc(xScale(xc1), yScale(yc1), rScale(R1), Math.PI/2,  Math.PI/2 - alfa1, true);
            r.arc(xScale(xc2), yScale(yc2), rScale(R2), Math.PI/2 - alfa1,  Math.PI/2 - alfa1 - alfa2, true);
            r.arcTo(xScale(x2), yScale(y2), xScale(x3), yScale(y3), rScale(R3));
            r.lineTo(xScale(x3), yScale(y3));
            r.moveTo(xScale(x0), yScale(y0));
            r.arc(xScale(-xc1), yScale(yc1), rScale(R1), Math.PI/2,  Math.PI/2 + alfa1);
            r.arc(xScale(-xc2), yScale(yc2), rScale(R2), Math.PI/2 + alfa1,  Math.PI/2 + alfa1 + alfa2);
            r.arcTo(xScale(-x2), yScale(y2), xScale(-x3), yScale(y3), rScale(R3));
            r.lineTo(xScale(-x3), yScale(y3));
            // r.moveTo(xScale(-x0), yScale(y0));
            // r.lineTo(xScale(-x1), yScale(y1));
            // r.arc(xScale(-xc), yScale(yc), rScale(R), Math.PI/2 + alfa/2,  Math.PI/2 - alfa/2, true);
            // r.lineTo(xScale(-x2), yScale(y2));
            

            return r.toString()
        }

        function draw_FP(stand, i) {
            const r = path();
            
            // Rodillos y ejes
            const roll_i = stand.rodillos[0];
            const roll_s = stand.rodillos[1];
            const AxisPos0_i = ejes['INF'];
            const AxisPos0_s = ejes['SUP'];

            // Dibujo rodillo inferior
            // Variables
            let xc1, yc1, xc2, yc2, xc3, yc3;
            let x1, y1, x2, y2, x3, y3, x4, y4, x5, y5, x6, y6;
            let Ancho, Dext, Df, Dc, C, D_cuchilla;
            let R1, alfa1, R2, alfa2, R3, alfa3;
            let pos;

            // Parametros
            R1 = roll_i.parametros.R1;
            R2 = roll_i.parametros.R2;
            R3 = roll_i.parametros.R3;
            alfa1 = roll_i.parametros.alfa1 * Math.PI / 180;
            alfa2 = roll_i.parametros.alfa2 * Math.PI / 180;
            alfa3 = roll_i.parametros.alfa3 * Math.PI / 180;
            const alfa4 = 2 * Math.PI / 180; // Dos grados
            Dext = roll_i.parametros.Dext;
            Df = roll_i.parametros.Df;
            Dc = roll_i.parametros.Dc;
            Ancho = roll_i.parametros.Ancho;

            // Calculos
            pos = -AxisPos0_i + Df /2;
            xc1 = 0;
            yc1 = pos + R1;
            xc2 = (R2-R1) * Math.sin(alfa1/2);
            yc2 = yc1 + (R2-R1) * Math.cos(alfa1/2);
            xc3 = xc2 + (R3-R2) * Math.cos(alfa3);
            yc3 = yc2 + (R3-R2) * Math.sin(alfa3);
            x1 = xc3 - R3 * Math.cos(alfa3-alfa4);
            y1 = yc3 - R3 * Math.sin(alfa3-alfa4);
            y2 = pos + (Dext-Df)/2; // yc2 -(Dc-Dext) / 2;
            x2 = x1 - Math.tan(alfa3-alfa4) * (y2-y1);
            x3 = -Ancho / 2;
            y3 = y2;
            x4 = x3;
            y4 = y3 - (Dext-Df) / 2;
            x5 = R1 * Math.sin(alfa1/2);
            y5 = yc1 - R1 * Math.cos(alfa1/2);

            r.arc(xScale(xc1), yScale(yc1), rScale(R1), (Math.PI - alfa1)/2, (Math.PI + alfa1)/2);
            r.arc(xScale(xc2), yScale(yc2), rScale(R2), (Math.PI+alfa1)/2, Math.PI - alfa3);
            r.arc(xScale(xc3), yScale(yc3), rScale(R3), Math.PI - alfa3 , Math.PI - alfa3 + alfa4); // dos grados, es una aproximación al plano, no el plano real.
            r.arcTo(xScale(x2), yScale(y2), xScale(x3), yScale(y3), rScale(3));
            r.lineTo(xScale(x3), yScale(y3));
            r.lineTo(xScale(x4), yScale(y4));
            r. moveTo(xScale(x5), yScale(y5));
            r.arc(xScale(-xc2), yScale(yc2), rScale(R2), (Math.PI-alfa1)/2, alfa3, true);
            r.arc(xScale(-xc3), yScale(yc3), rScale(R3), alfa3 , alfa3 - alfa4, true);
            r.arcTo(xScale(-x2), yScale(y2), xScale(-x3), yScale(y3), rScale(3));
            r.lineTo(xScale(-x3), yScale(y3));
            r.lineTo(xScale(-x4), yScale(y4));

            // Dibujo rodillos superior
            // Parametros
            R1 = roll_s.parametros.R1;
            R2 = roll_s.parametros.R2;
            R3 = roll_s.parametros.R2;
            alfa1 = roll_s.parametros.alfa1 * Math.PI / 180;
            alfa2 = roll_s.parametros.alfa2 * Math.PI / 180;
            alfa3 = roll_s.parametros.alfa3 * Math.PI / 180;

            Dext = roll_s.parametros.Dext;
            Df = roll_s.parametros.Df;
            Dc = roll_s.parametros.Dc;
            D_cuchilla = roll_s.parametros.D_cuchilla;
            Ancho = roll_s.parametros.Ancho;
            C = roll_s.parametros.Cuchilla;

            // Calculos
            pos = AxisPos0_s - Df / 2;
            x1 = -C/2;
            y1 = pos;
            xc1 = 0;
            
            if (R1!==0){
                yc1 = pos - Math.sqrt(Math.pow(R1,2)-Math.pow(C/2,2));
                xc2 = (R2-R1) * Math.cos(alfa2);
                yc2 = yc1 - (R2-R1) * Math.sin(alfa2);
            }
            else{
                xc2 = R2 * Math.cos(alfa2) - C/2;
                yc2 = y1 - R2 * Math.sin(alfa2);
            }
            xc3 = xc2 + (R3-R2) * Math.cos(alfa3);
            yc3 = yc2 - (R3-R2) * Math.sin(alfa3);
            x2 = xc3 - R3 * Math.cos(alfa3-alfa4);
            y2 = yc3 + R3 * Math.sin(alfa3-alfa4);
            y3 = pos - (Dext - Df)/2;// yc2 + (Dc-Dext)/2;
            x3 = x2 + Math.tan(alfa3-alfa4) * (y3-y2);
            x4 = -Ancho/2;
            y4 = y3;
            x5 = x4;
            y5 = y4 + (Dext-Df)/2;
            y6 = y1 - (D_cuchilla-Df)/2;
            if(alfa1!==0){
                x6 = x1 + Math.tan(Math.asin((C/2)/R1)) * (y1-y6);
            }
            else{
                x6 = x1 - (1/Math.tan(alfa2)) * (y6-y1);
            }

            // Dibujo
            r.moveTo(xScale(x1), yScale(y1));
            if (R1!==0){
                r.arc(xScale(xc1), yScale(yc1), rScale(R1), (3*Math.PI/2) - Math.asin((C/2)/R1), Math.PI + alfa2, true);
            }
            r.arc(xScale(xc2), yScale(yc2), rScale(R2), Math.PI + alfa2, Math.PI + alfa3, true);
            r.arc(xScale(xc3), yScale(yc3), rScale(R3), Math.PI + alfa3, Math.PI + alfa3 - alfa4, true);
            r.arcTo(xScale(x3), yScale(y3), xScale(x4), yScale(y4), rScale(3));
            r.lineTo(xScale(x4), yScale(y4));
            r.lineTo(xScale(x5), yScale(y5));
            r.moveTo(xScale(x1), yScale(y1));
            r.lineTo(xScale(x6), yScale(y6));
            r.lineTo(xScale(-x6), yScale(y6));
            r.lineTo(xScale(-x1), yScale(y1));
            if (R1!==0){
                r.arc(xScale(xc1), yScale(yc1), rScale(R1), (3*Math.PI/2) + Math.asin((C/2)/R1), -alfa2);
            }
            r.arc(xScale(-xc2), yScale(yc2), rScale(R2), 2*Math.PI - alfa2, 2*Math.PI - alfa3);
            r.arc(xScale(-xc3), yScale(yc3), rScale(R3), 2*Math.PI - alfa3, 2*Math.PI  - alfa3 + alfa4);
            r.arcTo(xScale(-x3), yScale(y3), xScale(-x4), yScale(y4), rScale(3));
            r.lineTo(xScale(-x4), yScale(y4));
            r.lineTo(xScale(-x5), yScale(y5));

            const gap = AxisPos0_i + AxisPos0_s - roll_i.parametros.Dext /2 - roll_s.parametros.Dext / 2;
            // console.log(stand.nombre + ' gap: ', gap);

            return r.toString()
        }

        function draw_IS1(stand,i){
            console.log(stand);
            const r = path();

            // Rodillos y ejes
            const roll_Lat= stand.rodillos[0];
            const AxisPos0_Lat_Alto = ejes['ALTO_S1'];
            const AxisPos0_Lat_Ancho = ejes['ANCHO_S1'];

            // Variables
            let xc, yc, x1, y1, x2, y2, x3, y3, x4, y4, x5, y5, x6, y6, x7, y7, xc2, yc2;
            let Df, Dc, Dsup, Dext, R1, R2, alfa1, alfa2, Ancho, Hc;

            // Parametros
            R1 = roll_Lat.parametros.R1;
            R2 = roll_Lat.parametros.R2;
            Df = roll_Lat.parametros.Df;
            Dc = roll_Lat.parametros.Dc;
            Dsup = roll_Lat.parametros.Dsup;
            Dext = roll_Lat.parametros.Dext;
            alfa1 = roll_Lat.parametros.alfa1 * Math.PI / 180;
            Ancho = roll_Lat.parametros.Ancho;
            Hc = roll_Lat.parametros.Hc;

            // Calculos
            const pos_h = 170 + AxisPos0_Lat_Ancho - Df;
            const pos_v = AxisPos0_Lat_Alto - 40;

            x1 = -pos_h/2 - Df/2 + Dext/2 - 50;
            y1 =  pos_v - 310;
            x2 = x1 + 50;
            y2 = y1;
            xc = -pos_h/2 - Df/2 + Dc/2;
            yc = y1 + Hc;
            alfa2 = Math.acos((R2+(Dc-Dext)/2)/(R1+R2));
            x3 = x2;
            y3 = y2 + Hc - (R1+R2)*Math.sin(alfa2);
            xc2 = x3 - R2;
            yc2 = y3;
            x4 = -pos_h/2;
            y4 = y2 + Hc - R1 * Math.sin(alfa1);
            x5 = x4 + (Dsup - Df)/2;
            y5 = y4 + Math.tan(alfa1)*(x5-x4);
            x6 = x5;
            y6 = y5 + 20;
            y7 = y2 + Ancho;
            x7 = x6 + (y7-y6)/Math.tan(Math.PI/2 + 25*Math.PI/180);

            // Dibujo lado operador
            r.moveTo(xScale(x1), yScale(y1));
            r.lineTo(xScale(x2), yScale(y2));
            r.lineTo(xScale(x3), yScale(y3));
            r.arc(xScale(xc2), yScale(yc2), rScale(R2), 0, -alfa2, true);
            r.arc(xScale(xc), yScale(yc), rScale(R1), -alfa2 + Math.PI, Math.PI - alfa1);
            r.lineTo(xScale(x5), yScale(y5));
            r.lineTo(xScale(x6), yScale(y6));
            r.lineTo(xScale(x7), yScale(y7));

            // Dibujo lado motor
            r.moveTo(xScale(-x1), yScale(y1));
            r.lineTo(xScale(-x2), yScale(y2));
            r.lineTo(xScale(-x3), yScale(y3));
            r.arc(xScale(-xc2), yScale(yc2), rScale(R2), Math.PI, -Math.PI/2  - alfa2);
            r.arc(xScale(-xc), yScale(yc), rScale(R1), alfa2, alfa1, true);
            r.lineTo(xScale(-x5), yScale(y5));
            r.lineTo(xScale(-x6), yScale(y6));
            r.lineTo(xScale(-x7), yScale(y7));

            return r.toString()
        }

        function draw_IS23(stand, i){
            const r = path();

            // Rodillos y ejes
            const roll_Lat= stand.rodillos[0];
            const AxisPos0_Lat_Alto = ejes['ALTO'];
            const AxisPos0_Lat_Ancho = ejes['ANCHO'];

            // Variables
            let xc, yc, x1, y1, x2, y2, x3, y3, x4, y4, x5, y5, x6, y6, xc2, yc2;
            let Df, Dc, Dsup, Dext, R1, R2, alfa1, alfa2, alfa3, Ancho;

            // Parametros
            R1 = roll_Lat.parametros.R1;
            R2 = roll_Lat.parametros.R2;
            Df = roll_Lat.parametros.Df;
            Dc = roll_Lat.parametros.Dc;
            Dsup = roll_Lat.parametros.Dsup;
            Dext = roll_Lat.parametros.Dext;
            alfa1 = roll_Lat.parametros.alfa1 * Math.PI / 180;
            Ancho = roll_Lat.parametros.Ancho;

            // Calculos
            const pos_h = 170 + AxisPos0_Lat_Ancho - Df;
            const pos_v = AxisPos0_Lat_Alto - 270;
            xc = -pos_h/2 + R2;
            yc = pos_v;
            x1 = xc - R2 + (Dsup-Df)/2;
            let b = -2*yc;
            let c = (x1 - xc)**2 + yc**2 - R2**2;
            y1 = (-b + Math.sqrt(b**2-4*c))/2;
            alfa2 = Math.asin((y1-yc)/R2);
            x2 = x1;
            y2 = yc + Ancho/2;
            x3 = x2 -50;
            y3 = y2;
            xc2 = xc - (R2-R1)*Math.cos(alfa1/2);
            yc2 = yc - (R2-R1)*Math.sin(alfa1/2);
            x4 = xc - R2 + (Dext-Df)/2;
            b = -2*yc2;
            c = (x4 - xc2)**2 + yc2**2 - R1**2;
            y4 = (-b - Math.sqrt(b**2-4*c))/2; 
            alfa3 =  Math.PI/2 - alfa1/2 - Math.asin((xc2-x4)/R2);
            x5 = x4;
            y5 = yc - Ancho/2;
            x6 = x5 -50
            y6 = y5;

            // Dibujo lado operador
            r.moveTo(xScale(x3), yScale(y3));
            r.lineTo(xScale(x2), yScale(y2));
            r.lineTo(xScale(x1), yScale(y1));
            r.arc(xScale(xc), yScale(yc), rScale(R2), Math.PI + alfa2, Math.PI - alfa1/2, true);
            r.arc(xScale(xc2), yScale(yc2), rScale(R1), Math.PI - alfa1/2, Math.PI - alfa1/2 - alfa3, true);
            r.lineTo(xScale(x4), yScale(y4));
            r.lineTo(xScale(x5), yScale(y5));
            r.lineTo(xScale(x6), yScale(y6));

            // Dibujo lado operador
            r.moveTo(xScale(-x3), yScale(y3));
            r.lineTo(xScale(-x2), yScale(y2));
            r.lineTo(xScale(-x1), yScale(y1));
            r.arc(xScale(-xc), yScale(yc), rScale(R2), -alfa2, alfa1/2);
            r.arc(xScale(-xc2), yScale(yc2), rScale(R1), alfa1/2, alfa1/2 + alfa3);
            r.lineTo(xScale(-x4), yScale(y4));
            r.lineTo(xScale(-x5), yScale(y5));
            r.lineTo(xScale(-x6), yScale(y6));

            return r.toString()
        }

        function draw_W(stand, i){
            const r = path();

            // Rodillos y ejes
            const roll_Lat_Operador= stand.rodillos[0];
            const roll_Lat_Motor = stand.rodillos[1];
            const roll_Inf = stand.rodillos[2];
            const roll_Sup_Operador = stand.rodillos[4];
            const roll_Sup_Motor = stand.rodillos[6];
            const AxisPos0_Lat_Operador = ejes['LAT_OP'];
            const AxisPos0_Lat_Motor = ejes['LAT_MO'];
            const AxisPos0_Inf = ejes['INF_W'];
            const AxisPos0_Sup_Alto_Operador = ejes['SUP_V_OP'];
            const AxisPos0_Sup_Alto_Motor = ejes['SUP_V_MO'];
            const AxisPos0_Sup_Ancho_Operador = ejes['SUP_H_OP'];
            const AxisPos0_Sup_Ancho_Motor = ejes['SUP_H_MO'];
            const h_cab = ejes['CAB'] - 300;

            // Variables
            let xc, yc;
            let x0, y0, x1, y1, x2, y2, x3, y3, x4, x5, x6, y4, y5, y6, y7, m1, m2, B1, B2;
            let Ancho, Df, Dc, C, C1, C2, L1;
            let R1, alfa1, R2, alfa2, alfa3;
            let pos;

            // Lado operador
            switch (roll_Lat_Operador.tipo_plano){
                case 'W_Lat_5':
                // Parametros
                R1 = roll_Lat_Operador.parametros.R1;
                R2 = roll_Lat_Operador.parametros.R2;
                alfa1 = roll_Lat_Operador.parametros.alfa1 * Math.PI / 180;
                alfa2 = roll_Lat_Operador.parametros.alfa2 * Math.PI / 180;
                Df = roll_Lat_Operador.parametros.Df;
                Ancho = roll_Lat_Operador.parametros.Ancho;
                C = roll_Lat_Operador.parametros.C;

                // Calculos
                pos = -AxisPos0_Lat_Operador + Df/2;
                xc = pos+R1;
                yc = h_cab;
                x1 = xc - R1 * Math.cos((alfa1/2)-alfa2);
                y1 = R1 * Math.sin((alfa1/2)-alfa2) + yc ;
                m1 = 1/Math.tan(alfa1/2-alfa2);
                m2 = Math.tan(alfa1/2);
                B1 = y1 - m1 * x1;
                B2 = -yc + m2 * (C/Math.sin(alfa1/2) - xc);
                x2 = -(B1+B2)/(m1+m2);
                y2 = m1 * x2 + B1;
                y3 = Ancho/2 + yc;
                x3 = -(y3+B2)/m2; 
                x4 = x3 - 50;
                y4 = y3;
                y5 = yc - R1 * Math.sin((alfa1/2)-alfa2);
                y6 = -y2 + 2*yc;
                y7 = -y3+2*yc;

                // Dibujo lado operador
                r.arc(xScale(xc), yScale(yc), rScale(R1), Math.PI - alfa1/2 + alfa2, Math.PI + alfa1/2 - alfa2);
                r.arcTo(xScale(x2), yScale(y2), xScale(x3), yScale(y3), rScale(R2));
                r.lineTo(xScale(x3), yScale(y3));
                r.lineTo(xScale(x4), yScale(y4));
                r.moveTo(xScale(x1), yScale(y5));
                r.arcTo(xScale(x2), yScale(y6), xScale(x3), yScale(y7), rScale(R2));
                r.lineTo(xScale(x3), yScale(y7));
                r.lineTo(xScale(x4), yScale(y7));
                    break;
                case 'W_Lat_4':
                    // Parametros
                    R1 = roll_Lat_Operador.parametros.R1;
                    R2 = roll_Lat_Operador.parametros.R2;
                    alfa2 = roll_Lat_Operador.parametros.alfa2 * Math.PI / 180;
                    alfa1 = roll_Lat_Operador.parametros.alfa1 * Math.PI / 180;
                    Df = roll_Lat_Operador.parametros.Df;
                    Ancho = roll_Lat_Operador.parametros.Ancho;
                    C1 = roll_Lat_Operador.parametros.C1;
                    C2 = roll_Lat_Operador.parametros.C2;

                    // Calculos
                    pos = -AxisPos0_Lat_Operador + Df/2;
                    xc = pos+R1;
                    yc = h_cab;
                    alfa3 = Math.asin(C1/R1);
                    x1 = xc - R1 * Math.sin(alfa1+alfa2);
                    y1 = yc + R1 * Math.cos(alfa1+alfa2);
                    m1 = 1/Math.tan(alfa1+alfa2);
                    m2 = Math.tan(Math.PI/2 + alfa1);
                    B1 = C2/Math.cos(Math.PI/2-(alfa1+alfa2));
                    x2 = (1/(m1-m2))*(yc-y1+m1*x1+m2*(B1-xc));
                    y2 = y1 + m1*(x2-x1);
                    y3 = yc + Ancho/2;
                    x3 = xc - B1 + (y3-yc)/m2; 
                    x4 = x3 - 50;
                    y4 = y3;
                    x5 = xc - R1 * Math.sin(alfa3);
                    y5 = yc - R1 * Math.cos(alfa3);
                    x6 = x5;
                    y6 = yc -Ancho/2;

                    // Dibujo lado operador
                    r.arc(xScale(xc), yScale(yc), rScale(R1), Math.PI/2 + alfa3, 3*Math.PI/2 - alfa1 - alfa2);
                    r.arcTo(xScale(x2), yScale(y2), xScale(x3), yScale(y3), rScale(R2));
                    r.lineTo(xScale(x3), yScale(y3));
                    r.lineTo(xScale(x4), yScale(y4));
                    r.moveTo(xScale(x5), yScale(y5));
                    r.lineTo(xScale(x6), yScale(y6));
                    r.lineTo(xScale(x4), yScale(y6));
                    break;
            }
            
            // Lado motor
            switch (roll_Lat_Motor.tipo_plano){
                case 'W_Lat_5':
                    // Parametros
                    R1 = roll_Lat_Motor.parametros.R1;
                    R2 = roll_Lat_Motor.parametros.R2;
                    alfa1 = roll_Lat_Motor.parametros.alfa1 * Math.PI / 180;
                    alfa2 = roll_Lat_Motor.parametros.alfa2 * Math.PI / 180;
                    Df = roll_Lat_Motor.parametros.Df;
                    Ancho = roll_Lat_Motor.parametros.Ancho;
                    C = roll_Lat_Motor.parametros.C;

                    // Calculos
                    pos = AxisPos0_Lat_Motor - Df/2;
                    xc = pos-R1;
                    yc = h_cab;
                    x1 = xc + R1 * Math.cos((alfa1/2)-alfa2);
                    y1 = R1 * Math.sin((alfa1/2)-alfa2) + yc;
                    
                    m1 = -1/Math.tan(alfa1/2-alfa2);
                    m2 = Math.tan(alfa1/2);
                    B1 = y1 - m1 * x1;
                    B2 = yc - m2 * (C/Math.sin(alfa1/2) + xc);

                    x2 = (B2-B1)/(m1-m2);
                    y2 = m1 * x2 + B1;
                    y3 = Ancho/2 + yc;
                    x3 = (1/m2)*(y3-B2); 
                    x4 = x3 + 50;
                    y4 = y3;
                    y5 = yc - R1 * Math.sin((alfa1/2)-alfa2);
                    y6 = -y2 + 2*yc;
                    y7 = -y3+2*yc;

                    // Dibujo
                    r.moveTo(xScale(x1), yScale(y5));
                    r.arc(xScale(xc), yScale(yc), rScale(R1), alfa1/2 - alfa2, alfa2 -alfa1/2, true);
                    r.arcTo(xScale(x2), yScale(y2), xScale(x3), yScale(y3), rScale(R2));
                    r.lineTo(xScale(x3), yScale(y3));
                    r.lineTo(xScale(x4), yScale(y4));
                    r.moveTo(xScale(x1), yScale(y5));
                    r.arcTo(xScale(x2), yScale(y6), xScale(x3), yScale(y7), rScale(R2));
                    r.lineTo(xScale(x3), yScale(y7));
                    r.lineTo(xScale(x4), yScale(y7));
                    break;

                case 'W_Lat_4':
                    // Parametros
                    R1 = roll_Lat_Motor.parametros.R1;
                    R2 = roll_Lat_Motor.parametros.R2;
                    alfa1 = roll_Lat_Motor.parametros.alfa1 * Math.PI / 180;
                    alfa2 = roll_Lat_Motor.parametros.alfa2 * Math.PI / 180;
                    Df = roll_Lat_Motor.parametros.Df;
                    Ancho = roll_Lat_Motor.parametros.Ancho;
                    C1 = roll_Lat_Motor.parametros.C1;
                    C2 = roll_Lat_Motor.parametros.C2;

                    // Calculos
                    pos = AxisPos0_Lat_Motor - Df/2;
                    xc = pos-R1;
                    yc = h_cab;
                    alfa3 = Math.asin(C1/R1);
                    x1 = xc + R1 * Math.sin(alfa1+alfa2);
                    y1 = yc + R1 * Math.cos(alfa1+alfa2);
                    m1 = Math.tan(Math.PI/2 - alfa1);
                    m2 = Math.tan(Math.PI - alfa1 - alfa2);
                    B1 = C2/Math.sin(Math.PI/2-alfa1);
                    x2 = (1/(m2-m1))*(yc-y1+m2*x1-m1*(B1+xc));
                    y2 = y1 + m2*(x2-x1);
                    y3 = yc + Ancho/2;
                    x3 = xc + B1 + (y3-yc)/m1;
                    x4 = x3 + 50;
                    y4 = y3;
                    x5 = xc + R1 * Math.sin(alfa3);
                    y5 = yc - R1 * Math.cos(alfa3);
                    x6 = x5;
                    y6 = yc -Ancho/2;

                    // Dibujo
                    r.moveTo(xScale(x5), yScale(y5));
                    r.arc(xScale(xc), yScale(yc), rScale(R1), Math.PI/2 - alfa3, -Math.PI/2 + alfa1 + alfa2, true);
                    r.arcTo(xScale(x2), yScale(y2), xScale(x3), yScale(y3), rScale(R2));
                    r.lineTo(xScale(x3), yScale(y3));
                    r.lineTo(xScale(x4), yScale(y4));
                    r.moveTo(xScale(x5), yScale(y5));
                    r.lineTo(xScale(x6), yScale(y6));
                    r.lineTo(xScale(x4), yScale(y6));
                    break;
            }
            

            // Inferior
            // Parametros
            R1 = roll_Inf.parametros.R1;
            R2 = roll_Inf.parametros.R2;
            alfa1 = roll_Inf.parametros.alfa1 * Math.PI / 180;
            alfa2 = roll_Inf.parametros.alfa2 * Math.PI / 180;
            Df = roll_Inf.parametros.Df;
            Ancho = roll_Inf.parametros.Ancho;
            C = roll_Inf.parametros.C;

            // Calculos
            pos = -AxisPos0_Inf + Df/2;// + h_cab;
            xc = 0;
            yc = pos + R1;
            x1 = xc + R1 * Math.sin((alfa1/2)-alfa2);
            y1 = yc - R1 * Math.cos((alfa1/2)-alfa2);
             
            m1 = Math.tan(alfa1/2-alfa2);
            m2 = -1/Math.tan(alfa1/2);
            B1 = y1 - m1 * x1;
            B2 = yc - C/Math.sin(alfa1/2);

            x2 = (B2-B1)/(m1-m2);
            y2 = m1 * x2 + B1;
            x3 = Ancho/2;
            y3 = m2* x3 + B2; 
            x4 = x3;
            y4 = y3 - 20;

            // Dibujo
            r.moveTo(xScale(-x1), yScale(y1));
            r.arc(xScale(xc), yScale(yc), rScale(R1), (Math.PI + alfa1)/2 - alfa2, (Math.PI - alfa1)/2 + alfa2, true);
            r.arcTo(xScale(x2), yScale(y2), xScale(x3), yScale(y3), rScale(R2));
            r.lineTo(xScale(x3), yScale(y3));
            r.lineTo(xScale(x4), yScale(y4));
            r.moveTo(xScale(-x1), yScale(y1));
            r.arcTo(xScale(-x2), yScale(y2), xScale(-x3), yScale(y3), rScale(R2));
            r.lineTo(xScale(-x3), yScale(y3));
            r.lineTo(xScale(-x4), yScale(y4));

            // Superior Motor
            // Parámetros
            Ancho = roll_Sup_Motor.parametros.Ancho;
            Df = roll_Sup_Motor.parametros.Df;
            Dc = roll_Sup_Motor.parametros.Dc;
            R1 = roll_Sup_Motor.parametros.R1;
            C1 = roll_Sup_Motor.parametros.C1;
            C2 = roll_Sup_Motor.parametros.C2;
            L1 = roll_Sup_Motor.parametros.L1;

            // Calculos
            y0 = h_cab + 465 - AxisPos0_Sup_Alto_Motor;
            x0 = 71.05 + 69 - AxisPos0_Sup_Ancho_Motor;
            x1 = x0 - Dc * Math.cos(75*Math.PI/180)/2;
            y1 = y0 - Dc * Math.sin(75*Math.PI/180)/2;
            xc = x1;
            yc = y1 - L1;
            alfa1 = Math.asin(C1/R1);
            x2 = x1 + C1;
            y2 = y1 + R1 * Math.cos(alfa1) - L1;
            x4 = x1 - C2/Math.cos(30*Math.PI/180);
            y4 = y1;
            m1 = Math.tan(60*Math.PI/180);
            let aa = 1 + m1**2;
            let bb = 2*m1*(y4-m1*x4-yc) - 2*xc;
            let cc = (m1**2)*(x4**2) - 2*y4*m1*x4 + 2*m1*x4*yc - R1**2 + xc**2 + yc**2 + y4**2 - 2*yc*y4;
            x3 = (-bb + Math.sqrt(bb**2 - 4*aa*cc))/(2*aa);
            y3 = y4 + m1*(x3-x4);
            alfa2 = Math.atan((x3-x1)/(y3-y1+L1));
            x5 = x3 + 50*Math.sin(30*Math.PI/180);
            y5 = y4 + m1*(x5-x4);

            // Dibujo
            r.moveTo(xScale(x2), yScale(y2+50));
            r.lineTo(xScale(x2), yScale(y2));
            r.arc(xScale(xc), yScale(yc), rScale(R1), -Math.PI/2 + alfa1,  -Math.PI/2 + alfa2);
            r.lineTo(xScale(x5), yScale(y5));

            // Superior Operador
            // Parámetros
            Ancho = roll_Sup_Operador.parametros.Ancho;
            Df = roll_Sup_Operador.parametros.Df;
            Dc = roll_Sup_Operador.parametros.Dc;
            R1 = roll_Sup_Operador.parametros.R1;
            C1 = roll_Sup_Operador.parametros.C1;
            C2 = roll_Sup_Operador.parametros.C2;
            L1 = roll_Sup_Operador.parametros.L1;

            // Calculos
            y0 = h_cab + 465 - AxisPos0_Sup_Alto_Operador;
            x0 = -72.95 - 68 + AxisPos0_Sup_Ancho_Operador;
            x1 = x0 + Dc * Math.cos(75*Math.PI/180)/2;
            y1 = y0 - Dc * Math.sin(75*Math.PI/180)/2;
            xc = x1;
            yc = y1 - L1;
            alfa1 = Math.asin(C1/R1);
            x2 = x1 - C1;
            y2 = y1 + R1 * Math.cos(alfa1) - L1;
            x4 = x1 + C2/Math.cos(30*Math.PI/180);
            y4 = y1;
            m1 = Math.tan(120*Math.PI/180);
            aa = 1 + m1**2;
            bb = 2*m1*(y4-m1*x4-yc) - 2*xc;
            cc = (m1**2)*(x4**2) - 2*y4*m1*x4 + 2*m1*x4*yc - R1**2 + xc**2 + yc**2 + y4**2 - 2*yc*y4;
            x3 = (-bb - Math.sqrt(bb**2 - 4*aa*cc))/(2*aa);
            y3 = y4 + m1*(x3-x4);
            alfa2 = Math.atan((x3-x1)/(y3-y1+L1));
            x5 = x3 - 50*Math.sin(30*Math.PI/180);
            y5 = y4 + m1*(x5-x4);

            // Dibujo
            r.moveTo(xScale(x2), yScale(y2+50));
            r.lineTo(xScale(x2), yScale(y2));
            r.arc(xScale(xc), yScale(yc), rScale(R1), -Math.PI/2 - alfa1,  -Math.PI/2 + alfa2, true);
            r.lineTo(xScale(x5), yScale(y5));

            return r.toString()
        }

        function draw_W_4(stand, i){
            const r = path();
            // Rodillos y ejes
            const roll_Lat_Operador= stand.rodillos[0];
            const roll_Lat_Motor = stand.rodillos[1];
            const AxisPos0_Lat_Operador = ejes['LAT_OP'];
            const AxisPos0_Lat_Motor = ejes['LAT_MO'];
            const h_cab = ejes['CAB'] - 300;

            // Variables
            let xc, yc;
            let x1, y1, x2, y2, x3, y3, x4, y4, x5, y5, x6, y6, m1, m2, B1;
            let Ancho, Df, C1, C2;
            let R1, alfa1, R2, alfa2, alfa3;
            let pos;

            // Lado operador
            // Parametros
            R1 = roll_Lat_Operador.parametros.R1;
            R2 = roll_Lat_Operador.parametros.R2;
            alfa2 = roll_Lat_Operador.parametros.alfa2 * Math.PI / 180;
            alfa1 = roll_Lat_Operador.parametros.alfa1 * Math.PI / 180;
            Df = roll_Lat_Operador.parametros.Df;
            Ancho = roll_Lat_Operador.parametros.Ancho;
            C1 = roll_Lat_Operador.parametros.C1;
            C2 = roll_Lat_Operador.parametros.C2;

            // Calculos
            pos = -AxisPos0_Lat_Operador + Df/2;
            xc = pos+R1;
            yc = h_cab;
            alfa3 = Math.asin(C1/R1);
            x1 = xc - R1 * Math.sin(alfa1+alfa2);
            y1 = yc + R1 * Math.cos(alfa1+alfa2);
            m1 = 1/Math.tan(alfa1+alfa2);
            m2 = Math.tan(Math.PI/2 + alfa1);
            B1 = C2/Math.cos(Math.PI/2-(alfa1+alfa2));
            x2 = (1/(m1-m2))*(yc-y1+m1*x1+m2*(B1-xc));
            y2 = y1 + m1*(x2-x1);
            y3 = yc + Ancho/2;
            x3 = xc - B1 + (y3-yc)/m2; 
            x4 = x3 - 50;
            y4 = y3;
            x5 = xc - R1 * Math.sin(alfa3);
            y5 = yc - R1 * Math.cos(alfa3);
            x6 = x5;
            y6 = yc -Ancho/2;

            // Dibujo lado operador
            r.arc(xScale(xc), yScale(yc), rScale(R1), Math.PI/2 + alfa3, 3*Math.PI/2 - alfa1 - alfa2);
            r.arcTo(xScale(x2), yScale(y2), xScale(x3), yScale(y3), rScale(R2));
            r.lineTo(xScale(x3), yScale(y3));
            r.lineTo(xScale(x4), yScale(y4));
            r.moveTo(xScale(x5), yScale(y5));
            r.lineTo(xScale(x6), yScale(y6));
            r.lineTo(xScale(x4), yScale(y6));

            // Lado motor
            // Parametros
            R1 = roll_Lat_Motor.parametros.R1;
            R2 = roll_Lat_Motor.parametros.R2;
            alfa1 = roll_Lat_Motor.parametros.alfa1 * Math.PI / 180;
            alfa2 = roll_Lat_Motor.parametros.alfa2 * Math.PI / 180;
            Df = roll_Lat_Motor.parametros.Df;
            Ancho = roll_Lat_Motor.parametros.Ancho;
            C1 = roll_Lat_Motor.parametros.C1;
            C2 = roll_Lat_Motor.parametros.C2;

            // Calculos
            pos = AxisPos0_Lat_Motor - Df/2;
            xc = pos-R1;
            yc = h_cab;
            alfa3 = Math.asin(C1/R1);
            x1 = xc + R1 * Math.sin(alfa1+alfa2);
            y1 = yc + R1 * Math.cos(alfa1+alfa2);
            m1 = Math.tan(Math.PI/2 - alfa1);
            m2 = Math.tan(Math.PI - alfa1 - alfa2);
            B1 = C2/Math.sin(Math.PI/2-alfa1);
            x2 = (1/(m2-m1))*(yc-y1+m2*x1-m1*(B1+xc));
            y2 = y1 + m2*(x2-x1);
            y3 = yc + Ancho/2;
            x3 = xc + B1 + (y3-yc)/m1;
            x4 = x3 + 50;
            y4 = y3;
            x5 = xc + R1 * Math.sin(alfa3);
            y5 = yc - R1 * Math.cos(alfa3);
            x6 = x5;
            y6 = yc -Ancho/2;

            // Dibujo
            r.moveTo(xScale(x5), yScale(y5));
            r.arc(xScale(xc), yScale(yc), rScale(R1), Math.PI/2 - alfa3, -Math.PI/2 + alfa1 + alfa2, true);
            r.arcTo(xScale(x2), yScale(y2), xScale(x3), yScale(y3), rScale(R2));
            r.lineTo(xScale(x3), yScale(y3));
            r.lineTo(xScale(x4), yScale(y4));
            r.moveTo(xScale(x5), yScale(y5));
            r.lineTo(xScale(x6), yScale(y6));
            r.lineTo(xScale(x4), yScale(y6));
            
            return r.toString()
        }

        function draw_CB(stand, i){
            const r = path();

            // Rodillos y ejes
            const roll_Superior= stand.rodillos[0];
            const roll_Inferior = stand.rodillos[1];
            const roll_Lat_Operador= stand.rodillos[2];
            const roll_Lat_Motor = stand.rodillos[3];
            const AxisPos0_Superior = ejes['SUP'];
            const AxisPos0_Inferior = ejes['INF'];
            const AxisPos0_Lat_Operador = ejes['LAT_OP'];
            const AxisPos0_Lat_Motor = ejes['LAT_MO'];

            // Variables
            let xc, yc;
            let x1, y1, x2, y2, x3, y3, x4, y4, x5, y5;
            let Ancho, Df, Dext, Dc;
            let R1, R2, L1, C;
            let alfa1, alfa2;
            let pos;
            let m1, m2;

            // Superior
            switch (roll_Superior.tipo_plano) {
                case 'CB-CR-123': // Calibrador Cuadrado Rectangular 1 2 3 caja
                    // Parametros
                    R1 = roll_Superior.parametros.R1;
                    Dext = roll_Superior.parametros.Dext;
                    Df = roll_Superior.parametros.Df;
                    Ancho = roll_Superior.parametros.Ancho;
                    L1 = roll_Superior.parametros.L1;

                    // Calculos
                    pos = AxisPos0_Superior - Df/2;
                    xc = 0;
                    yc = pos - R1;
                    alfa1 = Math.asin(L1/(2*R1));
                    x1 = xc + R1*Math.sin(alfa1);
                    y1 = yc + R1*Math.cos(alfa1);
                    x2 = Ancho/2;
                    y2 = y1 + Math.tan(45*Math.PI/180)*(x2-x1);
                    x3 = x2;
                    y3 = y2 + 50;
                    
                    //Dibujo
                    r.moveTo(xScale(-x1), yScale(y1));
                    r.arc(xScale(xc), yScale(yc), rScale(R1), -Math.PI/2 - alfa1,  -Math.PI/2 + alfa1);
                    r.lineTo(xScale(x2), yScale(y2));
                    r.lineTo(xScale(x3), yScale(y3));
                    r.moveTo(xScale(-x1), yScale(y1));
                    r.lineTo(xScale(-x2), yScale(y2));
                    r.lineTo(xScale(-x3), yScale(y3));
                    break;

                case 'CB-R-4': // Redondo de 4 rodillos por operación
                    // Parametros
                    R1 = roll_Superior.parametros.R1;
                    R2 = roll_Superior.parametros.R2;
                    Dext = roll_Superior.parametros.Dext;
                    Df = roll_Superior.parametros.Df;
                    Ancho = roll_Superior.parametros.Ancho;
                    C = roll_Superior.parametros.C;
                    alfa1 = roll_Superior.parametros.alfa1 * Math.PI/180;
                    alfa2 = roll_Superior.parametros.alfa2 * Math.PI/180;

                    // Calculos
                    pos = AxisPos0_Superior - Df/2;
                    xc = 0;
                    yc = pos - R1;
                    x1 = 0;
                    y1 = pos;
                    x2 = -R1 * Math.sin(-alfa2 + alfa1/2);
                    y2 = yc + R1 * Math.cos(-alfa2 + alfa1/2);
                    m1 = Math.tan(alfa1/2 - alfa2);
                    x3 = C / Math.cos(alfa1/2);
                    y3 = yc;
                    m2 = Math.tan(Math.PI/2 + alfa1/2);
                    x4 = -Ancho/alfa1;
                    y4 = y3 + m2*(x4-x3);
                    x5 = (1/(m2-m1)) * (y2-y3+m2*x3-m1*x2);
                    y5 = y3 +m2*(x5-x3);

                    //Dibujo
                    r.moveTo(xScale(x1), yScale(y1));
                    r.arc(xScale(xc), yScale(yc), rScale(R1), -Math.PI/2,  -Math.PI/2 - alfa1/2 + alfa2, true);
                    r.arcTo(xScale(x5), yScale(y5), xScale(x4), yScale(y4), rScale(R2));
                    r.lineTo(xScale(x4), yScale(y4));
                    r.lineTo(xScale(x4), yScale(y4+50));
                    r.moveTo(xScale(x1), yScale(y1));
                    r.arc(xScale(xc), yScale(yc), rScale(R1), -Math.PI/2, -Math.PI/2 + alfa1/2 - alfa2);
                    r.arcTo(xScale(-x5), yScale(y5), xScale(-x4), yScale(y4), rScale(R2));
                    r.lineTo(xScale(-x4), yScale(y4));
                    r.lineTo(xScale(-x4), yScale(y4+50));
                    break;

                case 'CB-R-2': // Redondo de 2 rodillos por operación (media caña)
                    // Parametros
                    R1 = roll_Superior.parametros.R1;
                    R2 = roll_Superior.parametros.R2;
                    Dext = roll_Superior.parametros.Dext;
                    Df = roll_Superior.parametros.Df;
                    Dc = roll_Superior.parametros.Dc;
                    Ancho = roll_Superior.parametros.Ancho;
                    alfa1 = roll_Superior.parametros.alfa1 * Math.PI/180;

                    // Calculos
                    pos = AxisPos0_Superior - Df/2;
                    xc = 0;
                    yc = pos - R1;
                    x1 = xc + R1*Math.cos(alfa1);
                    y1 = yc + R1*Math.sin(alfa1);
                    m1 = Math.tan(Math.PI/2 - alfa1);
                    y2 = y1;
                    x2 = -x1;
                    x4 = -Ancho/2;
                    y4 = yc + (Dc-Dext)/2;
                    y3 = y4;
                    x3 = x2 + (y3-y2)/m1;

                    //Dibujo
                    r.moveTo(xScale(x1), yScale(y1));
                    r.arc(xScale(xc), yScale(yc), rScale(R1), -alfa1,  Math.PI + alfa1, true);
                    r.arcTo(xScale(x3), yScale(y3), xScale(x4), yScale(y4), rScale(R2));
                    r.lineTo(xScale(x4), yScale(y4));
                    r.lineTo(xScale(x4), yScale(y4+50));
                    r.moveTo(xScale(x1), yScale(y1));
                    r.arcTo(xScale(-x3), yScale(y3), xScale(-x4), yScale(y4), rScale(R2));
                    r.lineTo(xScale(-x4), yScale(y4));
                    r.lineTo(xScale(-x4), yScale(y4+50));
                    break;

                case 'CB-CR-4': // Cuadrado y rectangular caja 4 (planos)
                    // Parametros
                    Df = roll_Superior.parametros.Df;
                    L1 = roll_Superior.parametros.L1;
                    Ancho = roll_Superior.parametros.Ancho;

                    // Calculos
                    pos = AxisPos0_Superior - Df/2;
                    x1 = 0;
                    y1 = pos;
                    x2 = x1 + L1/2;
                    y2 = y1;
                    x3 = Ancho/2;
                    y3 = y2 + (x3-x2); // Pendiente 1 (45º)

                    // Dibujo
                    r.moveTo(xScale(x1), yScale(y1));
                    r.lineTo(xScale(x2), yScale(y2));
                    r.lineTo(xScale(x3), yScale(y3));
                    r.lineTo(xScale(x3), yScale(y3+50));
                    r.moveTo(xScale(x1), yScale(y1));
                    r.lineTo(xScale(-x2), yScale(y2));
                    r.lineTo(xScale(-x3), yScale(y3));
                    r.lineTo(xScale(-x3), yScale(y3+50));
                    break;
                case 'CB-CONVEX': //Rodillo convexo
                    // Parametros
                    Df = roll_Superior.parametros.Df;
                    R1 = roll_Superior.parametros.R1;
                    Ancho = roll_Superior.parametros.Ancho;

                    // Calculos
                    pos = AxisPos0_Superior - Df/2;
                    alfa1 = Math.asin(Ancho/(2*R1));
                    xc = 0;
                    yc = pos + R1;
                    x1 = -Ancho/2;
                    y1 = yc - R1*Math.cos(alfa1);

                    // Dibujo
                    r.moveTo(xScale(x1), yScale(y1));
                    r.arc(xScale(xc), yScale(yc), rScale(R1),Math.PI/2  + alfa1, Math.PI/2 - alfa1, true);
                    r.lineTo(xScale(-x1), yScale(y1+50));
                    r.moveTo(xScale(x1), yScale(y1));
                    r.lineTo(xScale(x1), yScale(y1+50));
                    break;
            }
            
            // Inferior
            switch (roll_Inferior.tipo_plano) {
                case 'CB-CR-123':
                    // Parametros
                    R1 = roll_Inferior.parametros.R1;
                    Dext = roll_Inferior.parametros.Dext;
                    Df = roll_Inferior.parametros.Df;
                    Ancho = roll_Inferior.parametros.Ancho;
                    L1 = roll_Inferior.parametros.L1;

                    // Calculos
                    pos = -AxisPos0_Inferior + Df/2;
                    xc = 0;
                    yc = pos + R1;
                    alfa1 = Math.asin(L1/(2*R1));
                    x1 = xc + R1*Math.sin(alfa1);
                    y1 = yc - R1*Math.cos(alfa1);
                    x2 = Ancho/2;
                    y2 = y1 - Math.tan(45*Math.PI/180)*(x2-x1);
                    x3 = x2;
                    y3 = y2 - 50;
                    
                    //Dibujo
                    r.moveTo(xScale(x1), yScale(y1));
                    r.arc(xScale(xc), yScale(yc), rScale(R1), Math.PI/2 - alfa1,  Math.PI/2 + alfa1);
                    r.lineTo(xScale(-x2), yScale(y2));
                    r.lineTo(xScale(-x3), yScale(y3));
                    r.moveTo(xScale(x1), yScale(y1));
                    r.lineTo(xScale(x2), yScale(y2));
                    r.lineTo(xScale(x3), yScale(y3));
                    break;

                case 'CB-R-4':
                    // Parametros
                    R1 = roll_Inferior.parametros.R1;
                    R2 = roll_Inferior.parametros.R2;
                    Dext = roll_Inferior.parametros.Dext;
                    Df = roll_Inferior.parametros.Df;
                    Ancho = roll_Inferior.parametros.Ancho;
                    C = roll_Inferior.parametros.C;
                    alfa1 = roll_Inferior.parametros.alfa1 * Math.PI/180;
                    alfa2 = roll_Inferior.parametros.alfa2 * Math.PI/180;

                    // Calculos
                    pos = -AxisPos0_Inferior + Df/2;
                    xc = 0;
                    yc = pos + R1;
                    x1 = 0;
                    y1 = pos;
                    x2 = -R1 * Math.sin(-alfa2 + alfa1/2);
                    y2 = yc - R1 * Math.cos(-alfa2 + alfa1/2);
                    m1 = -Math.tan(alfa1/2 - alfa2);
                    x3 = C / Math.cos(alfa1/2);
                    y3 = yc;
                    m2 = -Math.tan(Math.PI/2 + alfa1/2);
                    x4 = -Ancho/alfa1;
                    y4 = y3 + m2*(x4-x3);
                    x5 = (1/(m2-m1)) * (y2-y3+m2*x3-m1*x2);
                    y5 = y3 +m2*(x5-x3);

                    //Dibujo
                    r.moveTo(xScale(x1), yScale(y1));
                    r.arc(xScale(xc), yScale(yc), rScale(R1), Math.PI/2,  Math.PI/2 + alfa1/2 - alfa2);
                    r.arcTo(xScale(x5), yScale(y5), xScale(x4), yScale(y4), rScale(R2));
                    r.lineTo(xScale(x4), yScale(y4));
                    r.lineTo(xScale(x4), yScale(y4-50));
                    r.moveTo(xScale(x1), yScale(y1));
                    r.arc(xScale(xc), yScale(yc), rScale(R1), Math.PI/2, Math.PI/2 - alfa1/2 + alfa2, true);
                    r.arcTo(xScale(-x5), yScale(y5), xScale(-x4), yScale(y4), rScale(R2));
                    r.lineTo(xScale(-x4), yScale(y4));
                    r.lineTo(xScale(-x4), yScale(y4-50));
                    break;

                case 'CB-R-2': // Redondo de 2 rodillos por operación (media caña)
                    // Parametros
                    R1 = roll_Inferior.parametros.R1;
                    R2 = roll_Inferior.parametros.R2;
                    Dext = roll_Inferior.parametros.Dext;
                    Df = roll_Inferior.parametros.Df;
                    Dc = roll_Inferior.parametros.Dc;
                    Ancho = roll_Inferior.parametros.Ancho;
                    alfa1 = roll_Inferior.parametros.alfa1 * Math.PI/180;

                    // Calculos
                    pos = -AxisPos0_Inferior + Df/2;
                    xc = 0;
                    yc = pos + R1;
                    x1 = xc + R1*Math.cos(alfa1);
                    y1 = yc - R1*Math.sin(alfa1);
                    m1 = -Math.tan(Math.PI/2 - alfa1);
                    y2 = y1;
                    x2 = -x1;
                    x4 = -Ancho/2;
                    y4 = yc - (Dc-Dext)/2;
                    y3 = y4;
                    x3 = x2 + (y3-y2)/m1;

                    //Dibujo
                    r.moveTo(xScale(x1), yScale(y1));
                    r.arc(xScale(xc), yScale(yc), rScale(R1), alfa1,  Math.PI - alfa1);
                    r.arcTo(xScale(x3), yScale(y3), xScale(x4), yScale(y4), rScale(R2));
                    r.lineTo(xScale(x4), yScale(y4));
                    r.lineTo(xScale(x4), yScale(y4-50));
                    r.moveTo(xScale(x1), yScale(y1));
                    r.arcTo(xScale(-x3), yScale(y3), xScale(-x4), yScale(y4), rScale(R2));
                    r.lineTo(xScale(-x4), yScale(y4));
                    r.lineTo(xScale(-x4), yScale(y4-50));
                    break;

                case 'CB-CR-4': // Cuadrado y rectangular caja 4 (planos)
                    // Parametros
                    Df = roll_Inferior.parametros.Df;
                    L1 = roll_Inferior.parametros.L1;
                    Ancho = roll_Inferior.parametros.Ancho;

                    // Calculos
                    pos = -AxisPos0_Inferior + Df/2;
                    x1 = 0;
                    y1 = pos;
                    x2 = x1 + L1/2;
                    y2 = y1;
                    x3 = Ancho/2;
                    y3 = y2 - (x3-x2); // Pendiente -1 (45º)

                    // Dibujo
                    r.moveTo(xScale(x1), yScale(y1));
                    r.lineTo(xScale(x2), yScale(y2));
                    r.lineTo(xScale(x3), yScale(y3));
                    r.lineTo(xScale(x3), yScale(y3-50));
                    r.moveTo(xScale(x1), yScale(y1));
                    r.lineTo(xScale(-x2), yScale(y2));
                    r.lineTo(xScale(-x3), yScale(y3));
                    r.lineTo(xScale(-x3), yScale(y3-50));
                    break;

                case 'CB-CONVEX': //Rodillo convexo
                    // Parametros
                    Df = roll_Inferior.parametros.Df;
                    R1 = roll_Inferior.parametros.R1;
                    Ancho = roll_Inferior.parametros.Ancho;

                    // Calculos
                    pos = -AxisPos0_Inferior + Df/2;
                    alfa1 = Math.asin(Ancho/(2*R1));
                    xc = 0;
                    yc = pos - R1;
                    x1 = Ancho/2;
                    y1 = yc + R1*Math.cos(alfa1);

                    // Dibujo
                    r.moveTo(xScale(x1), yScale(y1));
                    r.arc(xScale(xc), yScale(yc), rScale(R1),-Math.PI/2  + alfa1, -Math.PI/2 - alfa1, true);
                    r.lineTo(xScale(-x1), yScale(y1-50));
                    r.moveTo(xScale(x1), yScale(y1));
                    r.lineTo(xScale(x1), yScale(y1-50));
                    break;
            }
            
            // Lateral operador
            switch (roll_Lat_Operador.tipo_plano) {
                case 'CB-CR-123':
                    // Parametros
                    R1 = roll_Lat_Operador.parametros.R1;
                    Dext = roll_Lat_Operador.parametros.Dext;
                    Df = roll_Lat_Operador.parametros.Df;
                    Ancho = roll_Lat_Operador.parametros.Ancho;
                    L1 = roll_Lat_Operador.parametros.L1;

                    // Calculos
                    pos = -AxisPos0_Lat_Operador + Df/2;
                    yc = 0;
                    xc = pos + R1;
                    alfa1 = Math.asin(L1/(2*R1));
                    x1 = xc - R1*Math.cos(alfa1);
                    y1 = yc - R1*Math.sin(alfa1);
                    y2 = Ancho/2;
                    x2 = x1 - Math.tan(45*Math.PI/180)*(y2+y1);
                    y3 = y2;
                    x3 = x2 - 50;
                    
                    //Dibujo
                    r.moveTo(xScale(x1), yScale(y1));
                    r.arc(xScale(xc), yScale(yc), rScale(R1), Math.PI - alfa1,  Math.PI + alfa1);
                    r.lineTo(xScale(x2), yScale(y2));
                    r.lineTo(xScale(x3), yScale(y3));
                    r.moveTo(xScale(x1), yScale(y1));
                    r.lineTo(xScale(x2), yScale(-y2));
                    r.lineTo(xScale(x3), yScale(-y3));
                    break;

                case 'CB-CR-4': // Cuadrado y rectangular caja 4 (planos)
                    // Parametros
                    Df = roll_Lat_Operador.parametros.Df;
                    L1 = roll_Lat_Operador.parametros.L1;
                    Ancho = roll_Lat_Operador.parametros.Ancho;

                    // Calculos
                    pos = -AxisPos0_Lat_Operador + Df/2;
                    y1 = 0;
                    x1 = pos;
                    y2 = y1 + L1/2;
                    x2 = x1;
                    y3 = Ancho/2;
                    x3 = x2 - (y3-y2); // Pendiente -1 (45º)

                    // Dibujo
                    r.moveTo(xScale(x1), yScale(y1));
                    r.lineTo(xScale(x2), yScale(y2));
                    r.lineTo(xScale(x3), yScale(y3));
                    r.lineTo(xScale(x3-50), yScale(y3));
                    r.moveTo(xScale(x1), yScale(y1));
                    r.lineTo(xScale(x2), yScale(-y2));
                    r.lineTo(xScale(x3), yScale(-y3));
                    r.lineTo(xScale(x3-50), yScale(-y3));
                    break;

                case 'CB-R-4': 
                    // Parametros
                    R1 = roll_Lat_Operador.parametros.R1;
                    R2 = roll_Lat_Operador.parametros.R2;
                    Dext = roll_Lat_Operador.parametros.Dext;
                    Df = roll_Lat_Operador.parametros.Df;
                    Ancho = roll_Lat_Operador.parametros.Ancho;
                    C = roll_Lat_Operador.parametros.C;
                    alfa1 = roll_Lat_Operador.parametros.alfa1 * Math.PI/180;
                    alfa2 = roll_Lat_Operador.parametros.alfa2 * Math.PI/180;

                    // Calculos
                    pos = -AxisPos0_Lat_Operador + Df/2;
                    yc = 0;
                    xc = pos + R1;
                    y1 = 0;
                    x1 = pos;
                    y2 = R1 * Math.sin(-alfa2 + alfa1/2);
                    x2 = xc - R1 * Math.cos(-alfa2 + alfa1/2);
                    m1 = Math.tan(Math.PI/2 - alfa1/2 + alfa2);
                    x3 =  xc - C / Math.sin(alfa1/2);
                    y3 = yc;
                    m2 = Math.tan(Math.PI - alfa1/2);
                    y4 = Ancho/2;
                    x4 = x3 + (y4-y3)/m2;
                    x5 = (1/(m2-m1)) * (y2-y3+m2*x3-m1*x2);
                    y5 = y3 +m2*(x5-x3);

                    //Dibujo
                    r.moveTo(xScale(x1), yScale(y1));
                    r.arc(xScale(xc), yScale(yc), rScale(R1), Math.PI, Math.PI + alfa1/2 - alfa2);
                    r.arcTo(xScale(x5), yScale(y5), xScale(x4), yScale(y4), rScale(R2));
                    r.lineTo(xScale(x4), yScale(y4));
                    r.lineTo(xScale(x4-50), yScale(y4));
                    r.moveTo(xScale(x1), yScale(y1));
                    r.arc(xScale(xc), yScale(yc), rScale(R1), Math.PI, Math.PI - alfa1/2 + alfa2, true);
                    r.arcTo(xScale(x5), yScale(-y5), xScale(x4), yScale(-y4), rScale(R2));
                    r.lineTo(xScale(x4), yScale(-y4));
                    r.lineTo(xScale(x4-50), yScale(-y4));
                    break;

                case 'CB-R-2': // Redondo de media caña
                    // Parametros
                    R1 = roll_Lat_Operador.parametros.R1;
                    Dext = roll_Lat_Operador.parametros.Dext;
                    Df = roll_Lat_Operador.parametros.Df;
                    Dc = roll_Lat_Operador.parametros.Dc;
                    Ancho = roll_Lat_Operador.parametros.Ancho;
                    alfa1 = roll_Lat_Operador.parametros.alfa1 * Math.PI/180;

                    // Calculos
                    pos = -AxisPos0_Lat_Operador + Df/2;
                    xc = pos + R1;
                    yc = 0;
                    x1 = xc - R1*Math.sin(alfa1);
                    y1 = R1*Math.cos(alfa1);
                    x2 = x1;
                    y2 = -y1;
                    m1 = -Math.tan(alfa1);
                    y4 = -Ancho/2;
                    x4 = pos + (Dext-Df)/2;
                    x3 = x4;
                    y3 = y2 + m1*(x3-x2);

                    // Dibujo
                    r.moveTo(xScale(x1), yScale(y1));
                    r.arc(xScale(xc), yScale(yc), rScale(R1), 3*Math.PI/2 - alfa1, Math.PI/2 + alfa1, true);
                    r.arcTo(xScale(x3), yScale(y3), xScale(x4), yScale(y4), rScale(R2));
                    r.lineTo(xScale(x4), yScale(y4));
                    r.lineTo(xScale(x4-50), yScale(y4));
                    r.moveTo(xScale(x1), yScale(y1));
                    r.arcTo(xScale(x3), yScale(-y3), xScale(x4), yScale(-y4), rScale(R2));
                    r.lineTo(xScale(x4), yScale(-y4));
                    r.lineTo(xScale(x4-50), yScale(-y4));
                    break;

                case 'CB-CONVEX': //Rodillo convexo
                    // Parametros
                    Df = roll_Lat_Operador.parametros.Df;
                    R1 = roll_Lat_Operador.parametros.R1;
                    Ancho = roll_Lat_Operador.parametros.Ancho;

                    // Calculos
                    pos = -AxisPos0_Lat_Operador + Df/2;
                    alfa1 = Math.asin(Ancho/(2*R1));
                    yc = 0;
                    xc = pos - R1;
                    y1 = -Ancho/2;
                    x1 = xc + R1*Math.cos(alfa1);

                    // Dibujo
                    r.moveTo(xScale(x1), yScale(y1));
                    r.arc(xScale(xc), yScale(yc), rScale(R1),alfa1, -alfa1, true);
                    r.lineTo(xScale(x1-50), yScale(-y1));
                    r.moveTo(xScale(x1), yScale(y1));
                    r.lineTo(xScale(x1-50), yScale(y1));
                    break;
            }

            // Lateral Motor
            switch (roll_Lat_Motor.tipo_plano) {
                case 'CB-CR-123':
                    // Parametros
                    R1 = roll_Lat_Motor.parametros.R1;
                    Dext = roll_Lat_Motor.parametros.Dext;
                    Df = roll_Lat_Motor.parametros.Df;
                    Ancho = roll_Lat_Motor.parametros.Ancho;
                    L1 = roll_Lat_Motor.parametros.L1;

                    // Calculos
                    pos = AxisPos0_Lat_Motor - Df/2;
                    yc = 0;
                    xc = pos - R1;
                    alfa1 = Math.asin(L1/(2*R1));
                    x1 = xc + R1*Math.cos(alfa1);
                    y1 = yc + R1*Math.sin(alfa1);
                    y2 = -Ancho/2;
                    x2 = x1 - Math.tan(45*Math.PI/180)*(y2+y1);
                    y3 = y2;
                    x3 = x2 + 50;
                    
                    //Dibujo
                    r.moveTo(xScale(x1), yScale(y1));
                    r.arc(xScale(xc), yScale(yc), rScale(R1), -alfa1, alfa1);
                    r.lineTo(xScale(x2), yScale(y2));
                    r.lineTo(xScale(x3), yScale(y3));
                    r.moveTo(xScale(x1), yScale(y1));
                    r.lineTo(xScale(x2), yScale(-y2));
                    r.lineTo(xScale(x3), yScale(-y3));
                    break;

                case 'CB-CR-4': // Cuadrado y rectangular caja 4 (planos)
                    // Parametros
                    Df = roll_Lat_Motor.parametros.Df;
                    L1 = roll_Lat_Motor.parametros.L1;
                    Ancho = roll_Lat_Motor.parametros.Ancho;

                    // Calculos
                    pos = AxisPos0_Lat_Motor - Df/2;
                    y1 = 0;
                    x1 = pos;
                    y2 = y1 + L1/2;
                    x2 = x1;
                    y3 = Ancho/2;
                    x3 = x2 + (y3-y2); // Pendiente -1 (45º)

                    // Dibujo
                    r.moveTo(xScale(x1), yScale(y1));
                    r.lineTo(xScale(x2), yScale(y2));
                    r.lineTo(xScale(x3), yScale(y3));
                    r.lineTo(xScale(x3+50), yScale(y3));
                    r.moveTo(xScale(x1), yScale(y1));
                    r.lineTo(xScale(x2), yScale(-y2));
                    r.lineTo(xScale(x3), yScale(-y3));
                    r.lineTo(xScale(x3+50), yScale(-y3));
                    break;

                case 'CB-R-4':
                    // Parametros
                    R1 = roll_Lat_Motor.parametros.R1;
                    R2 = roll_Lat_Motor.parametros.R2;
                    Dext = roll_Lat_Motor.parametros.Dext;
                    Df = roll_Lat_Motor.parametros.Df;
                    Ancho = roll_Lat_Motor.parametros.Ancho;
                    C = roll_Lat_Motor.parametros.C;
                    alfa1 = roll_Lat_Motor.parametros.alfa1 * Math.PI/180;
                    alfa2 = roll_Lat_Motor.parametros.alfa2 * Math.PI/180;

                    // Calculos
                    pos = AxisPos0_Lat_Motor - Df/2;
                    yc = 0;
                    xc = pos - R1;
                    y1 = 0;
                    x1 = pos;
                    y2 = -R1 * Math.sin(-alfa2 + alfa1/2);
                    x2 = xc + R1 * Math.cos(-alfa2 + alfa1/2);
                    m1 = 1/Math.tan(alfa1/2 - alfa2);
                    x3 =  xc + C / Math.sin(alfa1/2);
                    y3 = yc;
                    m2 = Math.tan(Math.PI - alfa1/2);
                    y4 = -Ancho/2;
                    x4 = x3 + (y4-y3)/m2;
                    x5 = (1/(m2-m1)) * (y2-y3+m2*x3-m1*x2);
                    y5 = y3 +m2*(x5-x3);

                    //Dibujo
                    r.moveTo(xScale(x1), yScale(y1));
                    r.arc(xScale(xc), yScale(yc), rScale(R1), 0, alfa1/2 - alfa2);
                    r.arcTo(xScale(x5), yScale(y5), xScale(x4), yScale(y4), rScale(R2));
                    r.lineTo(xScale(x4), yScale(y4));
                    r.lineTo(xScale(x4+50), yScale(y4));
                    r.moveTo(xScale(x1), yScale(y1));
                    r.arc(xScale(xc), yScale(yc), rScale(R1), 0, - alfa1/2 + alfa2, true);
                    r.arcTo(xScale(x5), yScale(-y5), xScale(x4), yScale(-y4), rScale(R2));
                    r.lineTo(xScale(x4), yScale(-y4));
                    r.lineTo(xScale(x4+50), yScale(-y4));
                    break;

                case 'CB-R-2': // Redondo de media caña
                    // Parametros
                    R1 = roll_Lat_Motor.parametros.R1;
                    Dext = roll_Lat_Motor.parametros.Dext;
                    Df = roll_Lat_Motor.parametros.Df;
                    Dc = roll_Lat_Motor.parametros.Dc;
                    Ancho = roll_Lat_Motor.parametros.Ancho;
                    alfa1 = roll_Lat_Motor.parametros.alfa1 * Math.PI/180;

                    // Calculos
                    pos = AxisPos0_Lat_Motor - Df/2;
                    xc = pos - R1;
                    yc = 0;
                    x1 = xc + R1*Math.sin(alfa1);
                    y1 = -R1*Math.cos(alfa1);
                    x2 = x1;
                    y2 = -y1;
                    m1 = -Math.tan(alfa1);
                    y4 = Ancho/2;
                    x4 = pos - (Dext-Df)/2;
                    x3 = x4;
                    y3 = y2 + m1*(x3-x2);

                    // Dibujo
                    r.moveTo(xScale(x1), yScale(y1));
                    r.arc(xScale(xc), yScale(yc), rScale(R1), Math.PI/2 - alfa1, -Math.PI/2 + alfa1, true);
                    r.arcTo(xScale(x3), yScale(y3), xScale(x4), yScale(y4), rScale(R2));
                    r.lineTo(xScale(x4), yScale(y4));
                    r.lineTo(xScale(x4+50), yScale(y4));
                    r.moveTo(xScale(x1), yScale(y1));
                    r.arcTo(xScale(x3), yScale(-y3), xScale(x4), yScale(-y4), rScale(R2));
                    r.lineTo(xScale(x4), yScale(-y4));
                    r.lineTo(xScale(x4+50), yScale(-y4));
                    break;

                case 'CB-CONVEX': //Rodillo convexo
                    // Parametros
                    Df = roll_Lat_Motor.parametros.Df;
                    R1 = roll_Lat_Motor.parametros.R1;
                    Ancho = roll_Lat_Motor.parametros.Ancho;

                    // Calculos
                    pos = AxisPos0_Lat_Motor - Df/2;
                    alfa1 = Math.asin(Ancho/(2*R1));
                    yc = 0;
                    xc = pos + R1;
                    y1 = Ancho/2;
                    x1 = xc - R1*Math.cos(alfa1);

                    // Dibujo
                    r.moveTo(xScale(x1), yScale(y1));
                    r.arc(xScale(xc), yScale(yc), rScale(R1),Math.PI + alfa1, Math.PI - alfa1, true);
                    r.lineTo(xScale(x1+50), yScale(-y1));
                    r.moveTo(xScale(x1), yScale(y1));
                    r.lineTo(xScale(x1+50), yScale(y1));
                    break;
            }
            return r.toString()
        }

        function draw_stand(stand, i) {
          let p = '';
          switch (stand.tipo) {
            case 'BD':
                p = draw_BD(stand, i);
                break;
            case 'BD_W':
                p = draw_BD_W(stand, i);
                break;
            case 'BD_2R':
                p = draw_BD_2R(stand, i);
                break;
            case 'FP':
                p = draw_FP(stand, i);
                break;
            case 'IS1':
                p = draw_IS1(stand, i);
                break;
            case 'IS2-3':
                p = draw_IS23(stand, i);
                break;
            case 'W':
                p = draw_W(stand, i);
                break;
            case 'W-4':
                p = draw_W_4(stand, i);
                break;
            case 'CB':
                p = draw_CB(stand, i);
                break;
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

        ejes&&select(svg).select('.grafico')
            .selectAll('path')
            .data(montaje)
            .join('path')
            .attr('fill', 'none')
            .attr('stroke', m => m.color)
            .style("stroke-width", 2)
            .attr('d', (m, i) => draw_stand(m, i));

        posiciones&&select(svg).select('.pos')
            .selectAll('text')
            .data(posiciones)
            .join('text')
            .style('font-size', 15)//0.03*dimensions.width)//function(d) { return dimensions.width; })
            .attr('x', p => {
                switch(p.eje) {
                    case 'INF':
                    case 'INF_W':
                        return xScale(limite*0.6);
                    case 'SUP':
                        return xScale(limite*0.6);
                    case 'LAT_OP':
                        return xScale(-limite*0.9);
                    case 'LAT_MO':
                        return xScale(limite*0.6);
                    case 'CAB':
                        return xScale(-limite*0.9);
                    case 'SUP_V_OP':
                        return xScale(-limite*0.9);
                    case 'SUP_H_OP':
                        return xScale(-limite*0.9);
                    case 'SUP_V_MO':
                        return xScale(limite*0.5);
                    case 'SUP_H_MO':
                        return xScale(limite*0.5);
                    case 'ANCHO':
                    case 'ALTO':
                    case 'ANCHO_S1':
                    case 'ALTO_S1':
                        return xScale(-limite*0.9);
                }
            })
            .attr('y', p => {
                switch(p.eje) {
                    case 'INF':
                    case 'INF_W':
                        return yScale(-limite*0.9);
                    case 'SUP':
                        return yScale(limite*0.9);
                    case 'LAT_OP':
                        return yScale(limite*0.0);
                    case 'LAT_MO':
                        return yScale(limite*0.0);
                    case 'CAB':
                        return yScale(limite*0.8);
                    case 'SUP_V_OP':
                        return yScale(limite*0.7);
                    case 'SUP_H_OP':
                        return yScale(limite*0.6);
                    case 'SUP_V_MO':
                        return yScale(limite*0.7);
                    case 'SUP_H_MO':
                        return yScale(limite*0.6);
                    case 'ANCHO_S1':
                    case 'ANCHO':
                        return yScale(limite*0.9);
                    case 'ALTO_S1':
                    case 'ALTO':
                        return yScale(limite*0.8);
                }
            })
            .text(p => simulador ? (p.eje + ': ' + p.pos_sim.toFixed(2)) : (p.eje + ': ' + p.pos.toFixed(2)));

        gap&&select(svg).select('.gap')
            .selectAll('text')
            .data(gap)
            .join('text')
            .attr("x", xScale(-limite*0.8))
            .attr("y", yScale(-limite*0.9))
            .text(g => g.gap&&('Gap: ' + g.gap.toFixed(2)));

        gap&&select(svg).select('.piston')
            .selectAll('text')
            .data(gap)
            .join('text')
            .attr("x", xScale(-limite*0.8))
            .attr("y", yScale(limite*0.9))
            .text(g => g.piston&&('Piston: ' + g.piston.toFixed(2)));
               
    },[dimensions, montaje, ejes, fleje]);

    return (
        <div ref={wrapperRef}>
            <svg ref={svgRef} className='standChart'>
                <g className='grafico'></g>
                <g className='grid-x grid'></g>
                <g className='grid-y grid'></g>
                <g className='eje-x'></g>
                <g className='eje-y'></g>
                <g className='pos'></g>
                <g className='gap'></g>
                <g className= 'piston'></g>
            </svg>
        </div>
    );
}

export default StandChart;