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
                    Ancho: 230,
                    Dext: 477,
                    Df: 296,
                    Dc: 484.308,
                    R1: 75.833,
                    alfa1: 120,
                    R2: 112.475,
                    alfa2: 30,
                    R3: 337.425,
                    alfa3: 10.612
                }
            },
            {
                tipo_plano: 'FP_SUP',
                eje: 'SUP',
                parametros: {
                    Ancho: 230,
                    Dext: 470,
                    Df: 296,
                    Dc: 477.373,
                    R1: 0,
                    alfa1: 0,
                    R2: 112.475,
                    alfa2: 53.73,
                    R3: 337.425,
                    alfa3: 10.612,
                    Cuchilla: 69.5,
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
                    Ancho: 230,
                    Dext: 463,
                    Df: 294.5,
                    Dc: 470.291,
                    R1: 79.491,
                    alfa1: 120,
                    R2: 96.3,
                    alfa2: 30,
                    R3: 288.9,
                    alfa3: 11.584
                }
            },
            {
                tipo_plano: 'FP_SUP',
                eje: 'SUP',
                parametros: {
                    Ancho: 230,
                    Dext: 456.3,
                    Df: 294.5,
                    Dc: 463.369,
                    R1: 79.491,
                    alfa1: 120,
                    R2: 96.3,
                    alfa2: 30,
                    R3: 288.9,
                    alfa3: 11.584,
                    Cuchilla: 46.3,
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
                    Ancho: 230,
                    Dext: 451.7,
                    Df: 300,
                    Dc: 460.317,
                    R1: 83.496,
                    alfa1: 120,
                    R2: 76.922,
                    alfa2: 30,
                    R3: 230.765,
                    alfa3: 13.262
                }
            },
            {
                tipo_plano: 'FP_SUP',
                eje: 'SUP',
                parametros: {
                    Ancho: 230,
                    Dext: 451.7,
                    Df: 300,
                    Dc: 458.798,
                    R1: 83.496,
                    alfa1: 120,
                    R2: 76.922,
                    alfa2: 30,
                    R3: 230.765,
                    alfa3: 13.262,
                    Cuchilla: 23.1,
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
                    Ancho: 180,
                    Df: 345,
                    R1: 79.85,
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
                    Ancho: 180,
                    Df: 345,
                    R1: 79.85,
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
                    Ancho: 120,
                    Df: 360,
                    R1: 79.85,
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
    ancho: 511,
    calidad: 'S350',
    color: 'aqua'
}

export {fleje, montaje}