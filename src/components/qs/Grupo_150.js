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
                    Ancho: 220,
                    Dext: 465.43,
                    Df: 292,
                    Dc: 472.428,
                    R1: 72.66,
                    alfa1: 120,
                    R2: 107.768,
                    alfa2: 30,
                    R3: 323.304,
                    alfa3: 10.612
                }
            },
            {
                tipo_plano: 'FP_SUP',
                eje: 'SUP',
                parametros: {
                    Ancho: 220,
                    Dext: 463.77,
                    Df: 292,
                    Dc: 465.774,
                    R1: 0,
                    alfa1: 0,
                    R2: 107.768,
                    alfa2: 53.73,
                    R3: 323.304,
                    alfa3: 10.612,
                    Cuchilla: 66.6,
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
                    Ancho: 220,
                    Dext: 455.432, //466.46,
                    Df: 294,
                    Dc: 462.434,
                    R1: 76.163,
                    alfa1: 120,
                    R2: 92.269,
                    alfa2: 30,
                    R3: 276.807,
                    alfa3: 11.584
                }
            },
            {
                tipo_plano: 'FP_SUP',
                eje: 'SUP',
                parametros: {
                    Ancho: 220,
                    Dext: 448.797, //459.94,
                    Df: 294,
                    Dc: 455.797,
                    R1: 76.163,
                    alfa1: 120,
                    R2: 92.269,
                    alfa2: 30,
                    R3: 276.807,
                    alfa3: 11.584,
                    Cuchilla: 44.4,
                    D_cuchilla: 331.6
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
                    Ancho: 220,
                    Dext: 440.7, //451.7,
                    Df: 294,
                    Dc: 447.7,
                    R1: 80,
                    alfa1: 120,
                    R2: 73.701,
                    alfa2: 30,
                    R3: 221.103,
                    alfa3: 13.262
                }
            },
            {
                tipo_plano: 'FP_SUP',
                eje: 'SUP',
                parametros: {
                    Ancho: 220,
                    Dext: 439.15, //450.18,
                    Df: 294,
                    Dc: 446.148,
                    R1: 80,
                    alfa1: 120,
                    R2: 73.701,
                    alfa2: 30,
                    R3: 221.103,
                    alfa3: 13.262,
                    Cuchilla: 22.1,
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
                    Df: 350,
                    R1: 76.6,
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
                    Df: 350,
                    R1: 76.6,
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
                    Df: 370,
                    R1: 76.6,
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
    espesor: 2,
    ancho: 473,
    calidad: 'S350',
    color: 'aqua'
}

export {fleje, montaje}