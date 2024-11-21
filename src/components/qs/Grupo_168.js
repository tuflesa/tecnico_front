// OJO!!!! No están bien los diámetros

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
                    Ancho: 250,
                    Dext: 494.6,
                    Df: 289.8,
                    Dc: 496.6,
                    R1: 83.316,
                    alfa1: 120,
                    R2: 123.573,
                    alfa2: 30,
                    R3: 370.718,
                    alfa3: 10.612
                }
            },
            {
                tipo_plano: 'FP_SUP',
                eje: 'SUP',
                parametros: {
                    Ancho: 250,
                    Dext: 486.1,
                    Df: 289.1,
                    Dc: 488.1,
                    R1: 0,
                    alfa1: 0,
                    R2: 123.573,
                    alfa2: 53.74,
                    R3: 370.718,
                    alfa3: 10.612,
                    Cuchilla: 76.4,
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
                    Dext: 480.13,
                    Df: 290.5,
                    Dc: 482.13,
                    R1: 87.331,
                    alfa1: 120,
                    R2: 105.799,
                    alfa2: 30,
                    R3: 317.396,
                    alfa3: 11.584
                }
            },
            {
                tipo_plano: 'FP_SUP',
                eje: 'SUP',
                parametros: {
                    Ancho: 270,
                    Dext: 472.52,
                    Df: 290.5,
                    Dc: 474.52,
                    R1: 87.331,
                    alfa1: 120,
                    R2: 105.799,
                    alfa2: 30,
                    R3: 317.396,
                    alfa3: 11.584,
                    Cuchilla: 50.9,
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
                    Dext: 463.74,
                    Df: 291,
                    Dc: 465.74,
                    R1: 91.729,
                    alfa1: 120,
                    R2: 84.507,
                    alfa2: 30,
                    R3: 253.52,
                    alfa3: 13.262
                }
            },
            {
                tipo_plano: 'FP_SUP',
                eje: 'SUP',
                parametros: {
                    Ancho: 270,
                    Dext: 461.95,
                    Df: 291,
                    Dc: 463.95,
                    R1: 91.729,
                    alfa1: 120,
                    R2: 84.507,
                    alfa2: 30,
                    R3: 253.52,
                    alfa3: 13.262,
                    Cuchilla: 25.4,
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
    espesor: 4,
    ancho: 547,
    calidad: 'S350',
    color: 'aqua'
}

export {fleje, montaje}