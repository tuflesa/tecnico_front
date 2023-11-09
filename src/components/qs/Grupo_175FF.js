const montaje = [
    {
        operacion: 1,
        color: 'blue',
        tipo: 'BD',
        nombre: 'BD-I',
        rodillos: [
            {
                tipo_plano: 'BD_INF',
                eje: 'INF',
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
                eje: 'SUP',
                parametros: {
                    Ancho: 520,
                    Df: 740,
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
                eje: 'INF',
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
                eje: 'SUP',
                parametros: {
                    Ancho: 340,
                    Df: 740,
                    R: 170
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
    espesor: 3,
    ancho: 553,
    calidad: 'S350',
    color: 'aqua'
}

export {fleje, montaje}