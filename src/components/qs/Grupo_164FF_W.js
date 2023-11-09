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
                    Df: 740,
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
                    Ancho: 245,
                    Dext: 492.38,
                    Df: 300,
                    Dc: 495.38,
                    R1: 78.68,
                    alfa1: 120,
                    R2: 116.7,
                    alfa2: 30,
                    R3: 350.07,
                    alfa3: 10.612
                }
            },
            {
                tipo_plano: 'FP_SUP',
                eje: 'SUP',
                parametros: {
                    Ancho: 245,
                    Dext: 485.19,
                    Df: 300,
                    Dc: 488.19,
                    R1: 0,
                    alfa1: 0,
                    R2: 116.7,
                    alfa2: 53.73,
                    R3: 350.07,
                    alfa3: 10.612,
                    Cuchilla: 72.1,
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
                    Ancho: 245,
                    Dext: 479.38,
                    Df: 300,
                    Dc: 482.38,
                    R1: 82.47,
                    alfa1: 120,
                    R2: 99.91,
                    alfa2: 30,
                    R3: 299.73,
                    alfa3: 11.584
                }
            },
            {
                tipo_plano: 'FP_SUP',
                eje: 'SUP',
                parametros: {
                    Ancho: 245,
                    Dext: 472.2,
                    Df: 300,
                    Dc: 475.2,
                    R1: 82.47,
                    alfa1: 120,
                    R2: 99.91,
                    alfa2: 30,
                    R3: 299.73,
                    alfa3: 11.584,
                    Cuchilla: 48.04,
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
                    Ancho: 245,
                    Dext: 463.43,
                    Df: 300,
                    Dc: 466.43,
                    R1: 86.63,
                    alfa1: 120,
                    R2: 79.8,
                    alfa2: 30,
                    R3: 239.41,
                    alfa3: 13.262
                }
            },
            {
                tipo_plano: 'FP_SUP',
                eje: 'SUP',
                parametros: {
                    Ancho: 245,
                    Dext: 461.76,
                    Df: 300,
                    Dc: 464.76,
                    R1: 86.63,
                    alfa1: 120,
                    R2: 79.8,
                    alfa2: 30,
                    R3: 239.41,
                    alfa3: 13.262,
                    Cuchilla: 23.9,
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
                    Ancho: 200,
                    Df: 335,
                    R1: 82.3,
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
                    Ancho: 200,
                    Df: 335,
                    R1: 82.3,
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
                    Ancho: 130,
                    Df: 360,
                    R1: 82.3,
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
    ancho: 505,
    calidad: 'S350',
    color: 'aqua'
}

export {fleje, montaje}