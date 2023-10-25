const montaje = [
    {
        operacion: 1,
        color: 'blue',
        tipo: 'BD_W',
        nombre: 'BD-I',
        rodillos: [
            {
                tipo_plano: 'BD_W_INF',
                eje: 'INF',
                parametros: {
                    Ancho: 660,
                    Dext: 550,
                    Df: 300,
                    Dc: 338.5,
                    R1: 126,
                    alfa1: 63,
                    xc1: 155.3,
                    R2: 489,
                    alfa2: 12,
                    R3:15
                }
            },
            {
                tipo_plano: 'BD_W_SUP',
                eje: 'SUP',
                parametros: {
                    Ancho: 246,
                    Df: 740,
                    R: 123,
                    H: 310.5
                }
            }
        ]
    },
    {
        operacion: 2,
        color: 'magenta',
        tipo: 'BD_2R',
        nombre: 'BD-II',
        rodillos: [
            {
                tipo_plano: 'BD_2R_INF',
                eje: 'INF',
                parametros: {
                    Ancho: 606,
                    Dext: 660,
                    Df: 300,
                    R1: 422,
                    alfa1: 20,
                    R2: 126,
                    alfa2: 35,
                    R3: 377,
                    alfa3: 21.24,
                    R4: 40
                }
            },
            {
                tipo_plano: 'BD_2R_SUP',
                eje: 'SUP',
                parametros: {
                    Ancho: 277,
                    Dext: 740,
                    R1: 419,
                    alfa1: 10,
                    R2: 123,
                    alfa2: 24.57,
                    R3: 40
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
                eje: 'INF',
                parametros: {
                    Ancho: 290,
                    Dext: 505.847,
                    Df: 300,
                    Dc: 511.847,
                    R1: 85.313,
                    alfa1: 120,
                    R2: 126.534,
                    alfa2: 30,
                    R3: 379.603,
                    alfa3: 10.612
                }
            },
            {
                tipo_plano: 'FP_SUP',
                eje: 'SUP',
                parametros: {
                    Ancho: 290,
                    Dext: 498.05,
                    Df: 300,
                    Dc: 504.05,
                    R1: 0,
                    alfa1: 0,
                    R2: 126.534,
                    alfa2: 53.73,
                    R3: 379.603,
                    alfa3: 10.612,
                    Cuchilla: 78.3,
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
                eje: 'INF',
                parametros: {
                    Ancho: 290,
                    Dext: 491.765,
                    Df: 300,
                    Dc: 497.765,
                    R1: 89.427,
                    alfa1: 120,
                    R2: 108.338,
                    alfa2: 30,
                    R3: 325.013,
                    alfa3: 11.584
                }
            },
            {
                tipo_plano: 'FP_SUP',
                eje: 'SUP',
                parametros: {
                    Ancho: 290,
                    Dext: 483.98,
                    Df: 300,
                    Dc: 489.98,
                    R1: 89.43,
                    alfa1: 120,
                    R2: 108.34,
                    alfa2: 30,
                    R3: 325.01,
                    alfa3: 11.584,
                    Cuchilla: 52.2,
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
                eje: 'INF',
                parametros: {
                    Ancho: 290,
                    Dext: 474.47,
                    Df: 300,
                    Dc: 480.47,
                    R1: 93.933,
                    alfa1: 120,
                    R2: 86.537,
                    alfa2: 30,
                    R3: 259.611,
                    alfa3: 13.262
                }
            },
            {
                tipo_plano: 'FP_SUP',
                eje: 'SUP',
                parametros: {
                    Ancho: 290,
                    Dext: 472.65,
                    Df: 300,
                    Dc: 478.65,
                    R1: 93.93,
                    alfa1: 120,
                    R2: 86.54,
                    alfa2: 30,
                    R3: 259.61,
                    alfa3: 13.262,
                    Cuchilla: 26.1,
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
                eje: 'LAT_OP',
                parametros: {
                    Ancho: 210,
                    Df: 335,
                    R1: 96.05,
                    alfa1: 120,
                    R2: 3,
                    alfa2: 7,
                    C: 3
                }
            },
            {
                tipo_plano: 'W_Lat',
                eje: 'LAT_MO',
                parametros: {
                    Ancho: 210,
                    Df: 335,
                    R1: 96.05,
                    alfa1: 120,
                    R2: 3,
                    alfa2: 7,
                    C: 3
                }
            },
            {
                tipo_plano: 'W_Inf',
                eje: 'INF',
                parametros: {
                    Ancho: 140,
                    Df: 350,
                    R1: 96.05,
                    alfa1: 60,
                    R2: 3,
                    alfa2: 7,
                    C: 3
                }
            }
        ]
    }
]

const fleje = {
    espesor: 4,
    ancho: 547,
    calidad: 'S350',
    color: 'aqua'
}

export {fleje, montaje}