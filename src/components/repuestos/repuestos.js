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

const Repuestos = () => {
    
    return (
        <React.Fragment>
            <RepNavBar />
            <Switch>
                <Route path='/repuestos' exact component={RepLista} />
                <Route path='/repuestos/pedidos' component={PedLista} />                
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
            </Switch>
        </React.Fragment>
    )
}

export default Repuestos;