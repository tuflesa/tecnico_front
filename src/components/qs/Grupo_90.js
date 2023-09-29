const montaje = [
    {
        operacion: 1,
        color: 'blue',
        tipo: 'BD',
        nombre: 'BD-I',
        rodillos: [
            {
                tipo_plano: 'BD_INF',
                parametros: {
                    Ancho: 410,
                    Dext: 550,
                    Df: 300,
                    R: 140,
                    alfa: 130
                }
            },
            {
                tipo_plano: 'BD_SUP',
                parametros: {
                    Ancho: 250,
                    Dext: 740,
                    R: 125
                }
            }
        ]
    },
    
    {
        operacion: 2,
        color: 'magenta',
        tipo: 'BD',
        nombre: 'BD-II',
        rodillos: [
            {
                tipo_plano: 'BD_INF',
                parametros: {
                    Ancho: 360,
                    Dext: 510,
                    Df: 300,
                    R: 85,
                    alfa: 140
                }
            },
            {
                tipo_plano: 'BD_SUP',
                parametros: {
                    Ancho: 150,
                    Dext: 740,
                    R: 77.3
                }
            }
        ]   
    },
    {
        operacion: 4,
        color: 'red',
        tipo: 'FP',
        nombre: 'FP-I',
        rodillos: [
            {
                tipo_plano: 'FP_INF',
                parametros: {
                    Ancho: 150,
                    Dext: 390.39,
                    Df: 288.5,
                    Dc: 392.39,
                    R1: 41.828,
                    alfa1: 120,
                    R2: 62.038,
                    alfa2: 30,
                    R3: 186.115,
                    alfa3: 10.612
                }
            },
            {
                tipo_plano: 'FP_SUP',
                parametros: {
                    Ancho: 150,
                    Dext: 386.53,
                    Df: 288.5,
                    Dc: 388.53,
                    R1: 0,
                    alfa1: 0,
                    R2: 62.038,
                    alfa2: 53.73,
                    R3: 186.115,
                    alfa3: 10.612,
                    Cuchilla: 38.4,
                    D_cuchilla: 320
                },

            }
        ]   
    },
    {
        operacion: 5,
        color: 'green',
        tipo: 'FP',
        nombre: 'FP-II',
        rodillos: [
            {
                tipo_plano: 'FP_INF',
                parametros: {
                    Ancho: 150,
                    Dext: 375.95,
                    Df: 282,
                    Dc: 377.95,
                    R1: 43.844,
                    alfa1: 120,
                    R2: 53.116,
                    alfa2: 30,
                    R3: 159.347,
                    alfa3: 11.584
                }
            },
            {
                tipo_plano: 'FP_SUP',
                parametros: {
                    Ancho: 190,
                    Dext: 373.14,
                    Df: 282,
                    Dc: 375.14,
                    R1: 43.844,
                    alfa1: 120,
                    R2: 53.116,
                    alfa2: 30,
                    R3: 159.347,
                    alfa3: 11.584,
                    Cuchilla: 25.6,
                    D_cuchilla: 320
                },
                
            }
        ]   
    },
    {
        operacion: 6,
        color: 'orange',
        tipo: 'FP',
        nombre: 'FP-III',
        rodillos: [
            {
                tipo_plano: 'FP_INF',
                parametros: {
                    Ancho: 150,
                    Dext: 370.48,
                    Df: 284,
                    Dc: 372.48,
                    R1: 46.052,
                    alfa1: 120,
                    R2: 42.427,
                    alfa2: 30,
                    R3: 127.28,
                    alfa3: 13.262
                }
            },
            {
                tipo_plano: 'FP_SUP',
                parametros: {
                    Ancho: 190,
                    Dext: 369.58,
                    Df: 284,
                    Dc: 371.58,
                    R1: 46.052,
                    alfa1: 120,
                    R2: 42.427,
                    alfa2: 30,
                    R3: 127.28,
                    alfa3: 13.262,
                    Cuchilla: 12.8,
                    D_cuchilla: 310
                }
            }
        ]   
    },
    {
        operacion: 7,
        color: 'lime',
        tipo: 'W',
        nombre: 'Welding',
        rodillos: [
            {
                tipo_plano: 'W_Lat',
                parametros: {
                    Ancho: 120,
                    Df: 420,
                    R1: 45.65,
                    alfa1: 120,
                    R2: 2,
                    alfa2: 7,
                    C: 2.5
                }
            },
            {
                tipo_plano: 'W_Lat',
                parametros: {
                    Ancho: 120,
                    Df: 420,
                    R1: 45.65,
                    alfa1: 120,
                    R2: 2,
                    alfa2: 7,
                    C: 2.5
                }
            },
            {
                tipo_plano: 'W_Inf',
                parametros: {
                    Ancho: 90,
                    Df: 435,
                    R1: 45.65,
                    alfa1: 60,
                    R2: 2,
                    alfa2: 7,
                    C: 2.5
                }
            }
        ]
    }
]

// const ejes = [{op:1, pos: [174, 343.57]},
//               {op:2, pos: [177.91, 340.49]},
//               {op:4, pos: [207.01, 201.08]},
//               {op:5, pos: [206.43, 197.73]},
//               {op:6, pos: [201.79, 187.88]},
//               {op:7, pos: [255.65, 255.65, 263.15]}
//             ]; 
const fleje = {
    espesor: 3,
    ancho: 271,
    calidad: 'S350',
    color: 'aqua'
}

export {fleje, montaje}