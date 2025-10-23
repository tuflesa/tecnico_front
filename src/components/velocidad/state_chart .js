import React, { useEffect, useRef, useState } from 'react';
import {
    select,
    scaleTime,
    scaleLinear,
    axisBottom,
    axisLeft,
    line,
    curveStepAfter,
    pointer,
    bisector
  } from 'd3';
import moment from 'moment';
import './velocidad.css';

const useResizeObserver = (ref) => {
    const [dimensions, setDimensions] = useState(null);
    useEffect(() => {
      const observeTarget = ref.current;
      const resizeObserver = new ResizeObserver((entries) => {
        entries.forEach((entry) => {
          setDimensions(entry.contentRect);
        });
      });
      resizeObserver.observe(observeTarget);
      return () => {
        resizeObserver.unobserve(observeTarget);
      };
    }, [ref]);
    return dimensions;
  };

const StateChart = ({data, flejes, fecha, hora_inicio, hora_fin}) => {
    const svgRef = useRef();
    const wrapperRef = useRef();
    const dimensions = useResizeObserver(wrapperRef);

    // Cuando cambian los datos actualizamos el grafico
    useEffect(()=>{
        if (!dimensions) return;
        const width = dimensions.width
            , height = dimensions.height
        const margin = {top: 20, right: 30, bottom: 20, left: 30};
        const innerWidth = width - margin.left - margin.right
        const innerHeight = height - margin.top - margin.bottom;

        const svg =svgRef.current;
        
        // console.log(dimensions);
        console.log(flejes);

        const inicio = moment(fecha + ' ' + hora_inicio)
        const fin = moment(fecha + ' ' + hora_fin)
        const n_ticks_x = fin.diff(inicio, 'hours');
                
        const xScale = scaleTime()
            .domain([inicio, fin])
            .range([0, innerWidth]);
        
        const yScale = scaleLinear()
            .domain([-40, 100])
            .range([innerHeight, 0]);

        const ejeX = axisBottom(xScale);
        const ejeY = axisLeft(yScale)
          .tickValues(yScale.ticks(10).filter(t => t >= 0));

        select(svg).select('.grafico')
        .attr('transform', `translate(${margin.left},${margin.top})`);

        select(svg).select('.eje-x')
        .attr('transform', `translate(${margin.left},${margin.top + yScale(0)})`)
        .call(ejeX);

        select(svg).select('.eje-y')
        .attr('transform', `translate(${margin.left},${margin.top})`)
        .call(ejeY);

        function make_x_gridlines() {
            return axisBottom(xScale)
                .ticks(n_ticks_x)
          }

        function make_y_gridlines() {
            return axisLeft(yScale)
                .ticks(10)
          }

        const myLine = line()
            .curve(curveStepAfter)
            .x( d => xScale(d.x))
            .y( d => {
                if (d.y>0) {
                    return yScale(d.y);
                }
                else {
                    return yScale(0);
                }
            });

        // console.log(data);
        data && select(svg).select('.grafico')
            .selectAll('path')
            .data(data)
            .join('path')
            .attr('fill', 'none')
            .attr('stroke', value => value.color)
            .style("stroke-width", 2)
            .transition()
            .attr('d', value => myLine(value.datos));

        // Circulos para señalizar el cursor
        data && select(svg).select('.grafico')
            .selectAll('circle')
            .data(data)
            .join('circle')
            .attr("r", 0)
            .attr("fill", value => value.color)
            .attr("class", value => value.siglas)
            .style("stroke", "white")
            .attr("opacity", .70)
            .style("pointer-events", "none");

        // Textos
        data && select(svg).select('.grafico')
            .selectAll('text')
            .data(data)
            .join('text')
            .attr("fill", value => value.color)
            .attr("class", value => 't-' + value.siglas)
            .text('');

        // Dibujar Flejes
        flejes && select(svg).select('.grafico')
          .selectAll('rect.fleje')
          .data(flejes)
          .join('rect')
          .attr("class", "fleje")
          .attr("x", f => xScale(f.x_in))
          .attr("y", f => yScale(f.y_in))
          .attr("width", f => xScale(f.x_out) - xScale(f.x_in))
          .attr("height", f => yScale(f.y_in) - yScale(f.y_out))
          .attr("fill", f => f.color);
        
        // Lisening rectangles: para saber cuando entra y sale el ratón
        data && select(svg).select('.grafico')
            .selectAll('rect.listener')
            .data(data)
            .join('rect')
            .attr("class", "listener")
            .attr("width", dimensions.width)
            .attr("height", dimensions.height)
            .on("mousemove", event => {
              const [xCoord] = pointer(event, this);
              const bisectDate = bisector(d => d.x).left;
              const x0 = xScale.invert(xCoord);
              data.map(maquina => {
                const i = bisectDate(maquina.datos, x0, 1);
                const d0 = maquina.datos[i - 1];
                const d1 = maquina.datos[i];
                if(d0&&d1){
                  const d = x0 - d0.x > d1.x - x0 ? d1 : d0;
                  const xPos = xScale(d.x);
                  const yPos = yScale(d.y);
                  // console.log(d.x.getHours() + ':' + d.x.getMinutes());
                  select(svg).select('.grafico').select('.' + maquina.siglas)
                    .attr("cx", xPos)
                    .attr("cy", yPos)
                    .transition()
                    .duration(50)
                    .attr("r", 5);

                  select(svg).select('.grafico').select('.t-' + maquina.siglas)
                    .attr("x", xPos)
                    .attr("y", yPos - 20)
                    .text(d.x.toLocaleTimeString() + ' - ' + d.y.toFixed(1) + ' m/min');
                  }
              });
            });

        select(svg).select('.grid-x')
            // .attr("class","rejilla")
            .attr('transform',`translate(${margin.left},${margin.top + innerHeight})`)
            .style("stroke-dasharray",("3,3"))
            .call(make_x_gridlines()
            .tickSize(-innerHeight)
            .tickFormat("")
            );

        select(svg).select('.grid-y')
            // .attr("class","rejilla")
            .attr('transform', `translate(${margin.left},${margin.top})`)
            .style("stroke-dasharray",("3,3"))
            .call(make_y_gridlines()
              .tickSize(-innerWidth)
              .tickFormat("")
            );

        
    },[data, fecha, hora_fin, hora_inicio, dimensions]);

    return (
        <div ref={wrapperRef} id='speedChart'>
            <svg ref={svgRef} 
                 className='speedChart'
                // width={size.width} 
                // height={size.height}
                // viewBox={`0 0 ${size.width} ${size.height}`}
                >
                <g className='grafico'></g>
                <g className='grid-x grid'></g>
                <g className='grid-y grid'></g>
                <g className='eje-x'></g>
                <g className='eje-y'></g>  
            </svg>
        </div>
    );
}

export default StateChart;