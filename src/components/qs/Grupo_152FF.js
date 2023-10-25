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
                    Dext: 474.5,//476.87,
                    Df: 295.8,
                    Dc: 481.37,
                    R1: 73.8,
                    alfa1: 117.5,
                    R2: 110.4,
                    alfa2: 31.25,
                    R3: 0,
                    alfa3: 2
                }
            },
            {
                tipo_plano: 'FP_SUP',
                eje: 'SUP',
                parametros: {
                    Ancho: 230,
                    Dext: 468.0,//471.86,
                    Df: 295.8,
                    Dc: 474.86,
                    R1: 0,
                    alfa1: 0,
                    R2: 110.4,
                    alfa2: 54.19,
                    R3: 0,
                    alfa3: 4,
                    Cuchilla: 66.6,
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
                eje: 'INF',
                parametros: {
                    Ancho: 230,
                    Dext: 462.5, //466.46,
                    Df: 296.36,
                    Dc: 469.46,
                    R1: 77.2,
                    alfa1: 120,
                    R2: 95.9,
                    alfa2: 30,
                    R3: 0,
                    alfa3: 4
                }
            },
            {
                tipo_plano: 'FP_SUP',
                eje: 'SUP',
                parametros: {
                    Ancho: 230,
                    Dext: 456.0, //459.94,
                    Df: 296.36,
                    Dc: 462.94,
                    R1: 77.2,
                    alfa1: 120,
                    R2: 95.9,
                    alfa2: 30,
                    R3: 0,
                    alfa3: 5,
                    Cuchilla: 44.4,
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
                eje: 'INF',
                parametros: {
                    Ancho: 230,
                    Dext: 447.0, //451.7,
                    Df: 297,
                    Dc: 454.7,
                    R1: 80.7,
                    alfa1: 120,
                    R2: 77,
                    alfa2: 30,
                    R3: 0,
                    alfa3: 3
                }
            },
            {
                tipo_plano: 'FP_SUP',
                eje: 'SUP',
                parametros: {
                    Ancho: 230,
                    Dext: 445.5, //450.18,
                    Df: 297,
                    Dc: 453.18,
                    R1: 80.7,
                    alfa1: 120,
                    R2: 77,
                    alfa2: 30,
                    R3: 0,
                    alfa3: 5,
                    Cuchilla: 22.1,
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
                eje: 'LAT_MO',
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
                eje: 'INF',
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

const fleje = {
    espesor: 2,
    ancho: 473,
    calidad: 'S350',
    color: 'aqua'
}

export {fleje, montaje}