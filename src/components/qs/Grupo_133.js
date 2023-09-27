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
                    Ancho: 660,
                    Dext: 740,
                    Df: 300,
                    R: 300,
                    alfa: 120
                }
            },
            {
                tipo_plano: 'BD_SUP',
                parametros: {
                    Ancho: 520,
                    Dext: 740,
                    R: 281
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
                    Ancho: 470,
                    Dext: 660,
                    Df: 300,
                    R: 190,
                    alfa: 130
                }
            },
            {
                tipo_plano: 'BD_SUP',
                parametros: {
                    Ancho: 340,
                    Dext: 740,
                    R: 170
                }
            }
        ]   
    },
    // {
    //     operacion: 1,
    //     color: 'blue',
    //     tipo: 'BD_W',
    //     nombre: 'BD-I',
    //     rodillos: [
    //         {
    //             tipo_plano: 'BD_W_INF',
    //             parametros: {
    //                 Ancho: 660,
    //                 Dext: 550,
    //                 Df: 300,
    //                 Dc: 338.5,
    //                 R1: 126,
    //                 alfa1: 63,
    //                 xc1: 155.3,
    //                 R2: 489,
    //                 alfa2: 12,
    //                 R3:15
    //             }
    //         },
    //         {
    //             tipo_plano: 'BD_W_SUP',
    //             parametros: {
    //                 Ancho: 246,
    //                 Dext: 740,
    //                 R: 123,
    //                 H: 310.5
    //             }
    //         }
    //     ]
    // },
    // {
    //     operacion: 2,
    //     color: 'magenta',
    //     tipo: 'BD_2R',
    //     nombre: 'BD-II',
    //     rodillos: [
    //         {
    //             tipo_plano: 'BD_2R_INF',
    //             parametros: {
    //                 Ancho: 606,
    //                 Dext: 660,
    //                 Df: 300,
    //                 R1: 422,
    //                 alfa1: 20,
    //                 R2: 126,
    //                 alfa2: 35,
    //                 R3: 377,
    //                 alfa3: 21.24,
    //                 R4: 40
    //             }
    //         },
    //         {
    //             tipo_plano: 'BD_2R_SUP',
    //             parametros: {
    //                 Ancho: 277,
    //                 Dext: 740,
    //                 R1: 419,
    //                 alfa1: 10,
    //                 R2: 123,
    //                 alfa2: 24.57,
    //                 R3: 40
    //             }
    //         }
    //     ]   
    // },
    {
        operacion: 4,
        color: 'red',
        tipo: 'FP',
        nombre: 'FP-I',
        rodillos: [
            {
                tipo_plano: 'FP_INF',
                parametros: {
                    Ancho: 200,
                    Dext: 453.67,
                    Df: 295,
                    Dc: 459.67,
                    R1: 66.313,
                    alfa1: 120,
                    R2: 98.354,
                    alfa2: 30,
                    R3: 295.062,
                    alfa3: 10.612
                }
            },
            {
                tipo_plano: 'FP_SUP',
                parametros: {
                    Ancho: 200,
                    Dext: 447.57,
                    Df: 295,
                    Dc: 453.57,
                    R1: 0,
                    alfa1: 0,
                    R2: 98.354,
                    alfa2: 53.72,
                    R3: 295.062,
                    alfa3: 10.612,
                    Cuchilla: 60.9,
                    D_cuchilla: 332
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
                    Ancho: 200,
                    Dext: 441.71,
                    Df: 294,
                    Dc: 447.71,
                    R1: 69.508,
                    alfa1: 120,
                    R2: 84.206,
                    alfa2: 30,
                    R3: 252.619,
                    alfa3: 11.584
                }
            },
            {
                tipo_plano: 'FP_SUP',
                parametros: {
                    Ancho: 200,
                    Dext: 435.65,
                    Df: 294,
                    Dc: 441.65,
                    R1: 69.508,
                    alfa1: 120,
                    R2: 84.206,
                    alfa2: 30,
                    R3: 252.619,
                    alfa3: 11.584,
                    Cuchilla: 40.6,
                    D_cuchilla: 338
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
                    Ancho: 200,
                    Dext: 428.27,
                    Df: 294,
                    Dc: 434.27,
                    R1: 73.007,
                    alfa1: 120,
                    R2: 67.259,
                    alfa2: 30,
                    R3: 201.778,
                    alfa3: 13.262
                }
            },
            {
                tipo_plano: 'FP_SUP',
                parametros: {
                    Ancho: 200,
                    Dext: 426.85,
                    Df: 294,
                    Dc: 432.85,
                    R1: 73.007,
                    alfa1: 120,
                    R2: 67.259,
                    alfa2: 30,
                    R3: 201.778,
                    alfa3: 13.262,
                    Cuchilla: 20.3,
                    D_cuchilla: 338
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
                    Ancho: 165,
                    Df: 375,
                    R1: 70.15,
                    alfa1: 120,
                    R2: 3,
                    alfa2: 7,
                    C: 5
                }
            },
            {
                tipo_plano: 'W_Lat',
                parametros: {
                    Ancho: 165,
                    Df: 375,
                    R1: 70.15,
                    alfa1: 120,
                    R2: 3,
                    alfa2: 7,
                    C: 5
                }
            },
            {
                tipo_plano: 'W_Inf',
                parametros: {
                    Ancho: 110,
                    Df: 385,
                    R1: 70.15,
                    alfa1: 60,
                    R2: 3,
                    alfa2: 7,
                    C: 5
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
    ancho: 442,
    calidad: 'S350',
    color: 'aqua'
}

export {fleje, montaje}