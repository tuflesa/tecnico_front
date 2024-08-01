import React from 'react';
import { Switch, Route } from 'react-router-dom';
import RepNavBar from './rep_nav';
import RepLista from './rep_lista';
import RepNuevo from './rep_nuevo';
import RepDetalle from './rep_editar';
import RepAlmacenesLista from './rep_almacenes_lista';
import RepAlmacenNuevo from './rep_almacen_nuevo';
import RepAlmacenEdit from './rep_almacen_editar';
import RepProveedoresLista from './rep_proveedores_lista';
import RepProveedorNuevo from './rep_proveedor_nuevo';
import RepProveedorEdit from './rep_proveedor_editar';
import PedLista from './rep_pedidos_lista';
import PedidoEditar from './rep_pedido_editar';
import RepPedidoNuevo from './rep_pedido_nuevo';
import RepSalidasGenerico from './rep_salidas_generico';
import RepSalidasID from './rep_salidas_id';
import RepPendientes from './rep_pendientes';
import RepInventario from './rep_inventario';
import RepTraspasoAlmacen from './rep_traspaso_almacen';
import RepPrecio from './rep_precio';
import Programadores from './a_rep_programadores';
import LineaAdicional from './rep_lineas_adicionales';
import RepPedidosPRL from './rep_pedidos_prl';
import { useCookies } from 'react-cookie';

const Repuestos = () => {
    const [user] = useCookies(['tec-user']);
    const nosoyTecnico = user['tec-user'].perfil.puesto.nombre!=='Mantenimiento'&&user['tec-user'].perfil.puesto.nombre!=='Operador'?false:true;
    
    return (
        <React.Fragment>
            <RepNavBar />
            <Switch>
                <Route path='/repuestos/precio' component={RepPrecio} />
                <Route path='/repuestos/prl' component={RepPedidosPRL} />
                <Route path='/repuestos/programadores' component={Programadores} />
                <Route path='/repuestos/traspasos' component={RepTraspasoAlmacen} /> 
                <Route path='/repuestos/inventario' component={RepInventario} /> 
                <Route path='/repuestos/listado' component={RepLista} />
                <Route path='/repuestos/lineas_adicionales' component={LineaAdicional} /> 
                <Route path='/repuestos/pedidos' component={PedLista} /> 
                <Route path='/repuestos/salidas/:id' component={RepSalidasID} /> 
                <Route path='/repuestos/salidas' component={RepSalidasGenerico} />                    
                <Route path='/repuestos/pedido_detalle/:id' component={PedidoEditar} />                
                <Route path='/repuestos/pedido/nuevo' component={RepPedidoNuevo} />
                <Route path='/repuestos/nuevo' component={RepNuevo} />
                <Route path='/repuestos/almacenes' component={RepAlmacenesLista} />
                <Route path='/repuestos/almacen/nuevo' component={RepAlmacenNuevo} />
                <Route path='/repuestos/almacen/:id' component={RepAlmacenEdit} />
                <Route path='/repuestos/proveedores' component={RepProveedoresLista} />  
                <Route path='/repuestos/proveedor/nuevo' component={RepProveedorNuevo} />
                <Route path='/repuestos/proveedor/:id' component={RepProveedorEdit} />                              
                <Route path='/repuestos/:id' component={RepDetalle} />                
                {!nosoyTecnico?<Route path='/repuestos/' exact component={RepPendientes} /> : <Route path='/repuestos/' exact component={RepLista} /> }
            </Switch>
        </React.Fragment>
    )
}

export default Repuestos;