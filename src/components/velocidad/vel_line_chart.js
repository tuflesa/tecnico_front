import React, { useEffect, useRef, useState } from 'react';
import {
    select,
    scaleTime,
    scaleLinear,
    axisBottom,
    axisLeft,
    line,
    curveStepAfter
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

const LineChart = ({data, fecha, hora_inicio, hora_fin}) => {
    const svgRef = useRef();
    const wrapperRef = useRef();
    const dimensions = useResizeObserver(wrapperRef);
    // const [size, setSize] = useState({width: 1150, height: 370})

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

        const inicio = moment(fecha + ' ' + hora_inicio)
        const fin = moment(fecha + ' ' + hora_fin)
        const n_ticks_x = fin.diff(inicio, 'hours');
                
        const xScale = scaleTime()
            .domain([inicio, fin])
            .range([0, innerWidth]);
        
        const yScale = scaleLinear()
            .domain([0, 100])
            .range([innerHeight, 0]);

        const ejeX = axisBottom(xScale);
        const ejeY = axisLeft(yScale);

        select(svg).select('.grafico')
        .attr('transform', `translate(${margin.left},${margin.top})`);

        select(svg).select('.eje-x')
        .attr('transform',`translate(${margin.left},${margin.top + innerHeight})`)
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
        <div ref={wrapperRef}>
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

export default LineChart;