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
                    Ancho: 760,
                    Dext: 620,
                    Df: 300, 
                    R: 480,
                    alfa: 90
                }
            },
            {
                tipo_plano: 'BD_SUP',
                eje: 'SUP',
                parametros: {
                    Ancho: 650,
                    Df: 740,
                    R: 461
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
        operacion: 4,
        color: 'red',
        tipo: 'FP',
        nombre: 'FP-I',
        rodillos: [
            {
                tipo_plano: 'FP_INF',
                eje: 'INF',
                parametros: {
                    Ancho: 270,
                    Dext: 513.3,
                    Df: 298.4,
                    Dc: 519.8,
                    R1: 91.66,
                    alfa1: 120,
                    R2: 135.948,
                    alfa2: 30,
                    R3: 407.845,
                    alfa3: 10.612
                }
            },
            {
                tipo_plano: 'FP_SUP',
                eje: 'SUP',
                parametros: {
                    Ancho: 270,
                    Dext: 506.8,
                    Df: 298.4,
                    Dc: 513.1,
                    R1: 0,
                    alfa1: 0,
                    R2: 135.948,
                    alfa2: 53.74,
                    R3: 407.845,
                    alfa3: 10.612,
                    Cuchilla: 84.1,
                    D_cuchilla: 325
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
                    Ancho: 270,
                    Dext: 500.0,
                    Df: 300,
                    Dc: 506.483,
                    R1: 96.082,
                    alfa1: 120,
                    R2: 116.4,
                    alfa2: 30,
                    R3: 349.201,
                    alfa3: 11.584
                }
            },
            {
                tipo_plano: 'FP_SUP',
                eje: 'SUP',
                parametros: {
                    Ancho: 270,
                    Dext: 491.9,
                    Df: 300,
                    Dc: 498.122,
                    R1: 96.082,
                    alfa1: 120,
                    R2: 116.4,
                    alfa2: 30,
                    R3: 349.201,
                    alfa3: 11.584,
                    Cuchilla: 56.06,
                    D_cuchilla: 330
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
                    Ancho: 270,
                    Dext: 481.4,
                    Df: 300,
                    Dc: 487.903,
                    R1: 100.925,
                    alfa1: 120,
                    R2: 92.979,
                    alfa2: 30,
                    R3: 278.936,
                    alfa3: 13.262
                }
            },
            {
                tipo_plano: 'FP_SUP',
                eje: 'SUP',
                parametros: {
                    Ancho: 270,
                    Dext: 479.7,
                    Df: 300,
                    Dc: 485.947,
                    R1: 100.925,
                    alfa1: 120,
                    R2: 92.979,
                    alfa2: 30,
                    R3: 278.936,
                    alfa3: 13.262,
                    Cuchilla: 28.04,
                    D_cuchilla: 330
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
    espesor: 10,
    ancho: 558,
    calidad: 'S350',
    color: 'aqua'
}

export {fleje, montaje}