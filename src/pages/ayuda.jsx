import React from "react";
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import './ayuda.css';
import rp from '../assets/img/RegistrarProducto.png'
import movin from '../assets/img/MovInv.png'
import rc from '../assets/img/RegistrarCliente.png'
import sc from '../assets/img/SaldoCliente.png'
import rpp from '../assets/img/RegistrarProveedor.png'
import rv from '../assets/img/RegistrarVenta.png'
import dv from '../assets/img/DetalleVenta.png'
import rdev from '../assets/img/RegistrarDevolucion.png'
import ddev from '../assets/img/DetalleDevoluciones.png'
import ac from '../assets/img/AperturaCaja.png'
import cc from '../assets/img/CierreCaja.png'
import mc from '../assets/img/MovimientoCaja.png'
import c from '../assets/img/Consultas.png'
import rep from '../assets/img/Reportes.png'

function ayuda() {
    const location = useLocation();
    useEffect(() => {
        if (location.hash) {
            const id = location.hash.substring(1);
            const element = document.getElementById(id);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
        }, [location]);
return(
    <div className="formulario-ayuda">
    <form>
        <h1 className="text-center">Ayuda del sistema</h1>
        <p>
            ¡Bienvenido! Esta es la seccion de ayuda, donde usted encontrará la informacion necesaria para todos los apartados del sistema.
            Para acceder de forma rapida a una seccion haz clic en los siguientes enlaces:
        </p>
        <strong>Sección Productos</strong><br/>
        <a href="#registrar">Registrar/Editar un producto</a><br/>
        <a href="#movimientosinv">Movimientos de Inventario</a><br/>
        <strong>Sección Clientes</strong><br/>
        <a href="#registrar_cliente">Registrar Cliente</a><br/>
        <a href="#saldo_cliente">Saldo del cliente</a><br/>
        <strong>Sección Proveedores</strong><br/>
        <a href="#registrar_Proveedor">Registrar/Editar proveedor</a><br/>
        <strong>Sección Ventas</strong><br/>
        <a href="#registrar_venta">Registrar Venta</a><br/>
        <a href="#detalle_venta">Detalle de ventas</a><br/>
        <strong>Sección Devoluciones</strong><br/>
        <a href="#registrar_devolucion">Registrar Devolución</a><br/>
        <a href="#detalle_devolucion">Detalle de Devolución</a><br/>
        <strong>Sección Caja</strong><br/>
        <a href="#apertura_caja">Apertura de Caja</a><br/>
        <a href="#cierre_caja">Cierre de Caja</a><br/>
        <strong>Sección Consultas</strong><br/>
        <a href="#consultas">Consultas</a><br/>
        <a href="#Reportes">Reportes</a>
        <br/><hr/>

        <h2>Sección Productos</h2>
        <h3 id="registrar">Registrar/Editar un producto</h3>
        <p>Este formulario permite registrar y editar nuevos y viejos productos en el sistema, asignando su información básica, precios y niveles de inventario</p>
        <img src = {rp} className="imagen"/>
        <br/>
        <p>Estos son los campos disponibles:</p>
        <table>
        <thead>
          <tr>
            <th>Numero</th>
            <th>Campo</th>
            <th>Descripcion</th>
            <th>Tipo de dato</th>
            <th>Ejemplo</th>
          </tr>
        </thead>
        <tbody>
            <td>1</td>
            <td>Codigo de Barras</td>
            <td>Identificador único del producto, generalmente impreso en el empaque.</td>
            <td>Numerico</td>
            <td>7591530300038</td>
        </tbody>
        <tbody>
            <td>2</td>
            <td>Nombre</td>
            <td>Nombre o descripción del producto.</td>
            <td>Texto</td>
            <td>Manzana Roja</td>
        </tbody>
        <tbody>
            <td>3</td>
            <td>Unidad de Medida</td>
            <td>Unidad en que se maneja el producto.</td>
            <td>Selección desplegable</td>
            <td>Kilogramo</td>
        </tbody>
        <tbody>
            <td>4</td>
            <td>Costo</td>
            <td>Precio de adquisición o costo de producción del producto.</td>
            <td>Numerico con decimales</td>
            <td>3.99</td>
        </tbody>
        <tbody>
            <td>5</td>
            <td>Ganancia(%)</td>
            <td>Porcentaje de ganancia que se desea aplicar sobre el costo.</td>
            <td>Numerico, se representa en porcentaje</td>
            <td>25</td>
        </tbody>
        <tbody>
            <td>6</td>
            <td>Precio Venta</td>
            <td>Precio final al público.</td>
            <td>Númerico</td>
            <td>35</td>
        </tbody>
        <tbody>
            <td>7</td>
            <td>Stock Inicial</td>
            <td>Cantidad inicial disponible del producto en inventario.</td>
            <td>Númerico entero</td>
            <td>75</td>
        </tbody>
        <tbody>
            <td>8</td>
            <td>Stock Mínimo</td>
            <td>Cantidad mínima que se debe mantener antes de generar alertas de reposición.</td>
            <td>Númerico entero</td>
            <td>250</td>
        </tbody>
        <tbody>
            <td>9</td>
            <td>Stock Máximo</td>
            <td>Cantidad máxima para mantener en inventario.</td>
            <td>Númerico entero</td>
            <td>1000</td>
        </tbody>
        <tbody>
            <td>10</td>
            <td>Crear</td>
            <td>Permite crear/añadir el producto seleccionado a la base de datos.</td>
            <td>Boton</td>
            <td>No aplica</td>
        </tbody>
        <tbody>
            <td>11</td>
            <td>Consultar</td>
            <td>Abre una ventana emergente donde podrás seleccionar un producto ya existente.</td>
            <td>Boton</td>
            <td>No aplica</td>
        </tbody>
        <tbody>
            <td>12</td>
            <td>Cancelar</td>
            <td>Limpia todos los campos de la pantalla.</td>
            <td>Boton</td>
            <td>No aplica</td>
        </tbody>
      </table>
        <p><b>Pasos de funcionamiento para registrar un producto:</b></p>
        <p><b>1. -</b> Llenar todos los campos (Código de barras, Nombre, Unidad de medida, etc).</p>
        <p><b>2. -</b> Verificar que el precio puesto sea el correcto.</p>
        <p><b>3. -</b> Revisar los valores de stock para que encajen con lo previsto</p>
        <p><b>4. -</b> Pulsar el boton "Crear" para guardar la informacion.</p>
        <p><b>Pasos de funcionamiento para editar un producto:</b></p>
        <p><b>1. -</b> Pulsar el boton "Consultar".</p>
        <p><b>2. -</b> Buscar el producto correspondiente.</p>
        <p><b>3. -</b> Seleccionar mediante el uso del boton el producto correspondiente.</p>
        <p><b>4. -</b> Modificar los campos correspondiente.</p>
        <p><b>5. -</b> Pulsar el boton "Guardar" para guardar los cambios.</p>
        
        <h3 id="movimientosinv">Movimientos de Inventario</h3>
        <p>
            Esta seccion permite realizar las entradas y salidas de los productos que se tienen registrados en la base de datos,
            ademas de permitir que se pueda consultar el stock actual de cada producto.
        </p>
        <img src = {movin} className="imagen"/>
        <p>Estas son las opciones que se pueden realizar en esta seccion:</p>
        <table>
        <thead>
            <tr>
            <th>Numero</th>
            <th>Campo</th>
            <th>Descripcion</th>
            <th>Tipo de dato</th>
            <th>Ejemplo</th>
            </tr>
        </thead>
        <tbody>
            <td>1</td>
            <td>Entrada</td>
            <td>Permite agregar mas cantidad de producto al producto seleccionado.</td>
            <td>Boton</td>
            <td>No aplica</td>
        </tbody>
        <tbody>
            <td>2</td>
            <td>Salida</td>
            <td>Permite disminuir la cantidad de producto del producto seleccionado.</td>
            <td>Boton</td>
            <td>No aplica</td>
        </tbody>
        <tbody>
            <td>3</td>
            <td>Cancelar</td>
            <td>Elimina el producto seleccionado de la pantalla.</td>
            <td>Boton</td>
            <td>No aplica</td>
        </tbody>
        <tbody>
            <td>4</td>
            <td>Buscar Producto</td>
            <td>Abre una ventana emergente donde podrás seleccionar un producto ya existente.</td>
            <td>Boton</td>
            <td>No aplica</td>
        </tbody>
        <tbody>
            <td>5</td>
            <td>Cuadro de seleccion</td>
            <td>Parte de la pantalla donde se muestra la informacion del producto seleccionado</td>
            <td>Visualización</td>
            <td>No aplica</td>
        </tbody>
        </table>
        <p><b>Pasos para realizar un movimiento de inventario:</b></p>
        <p><b>1. -</b> Pulsar el boton "Buscar Producto".</p>
        <p><b>2. -</b> Buscar el producto correspondiente.</p>
        <p><b>3. -</b> Seleccionar mediante el uso del boton el producto correspondiente.</p>
        <p><b>4. -</b> Pulsar el boton "Entrada" o "Salida" segun sea el caso.</p>
        <p><b>5. -</b> Ingresar la cantidad a mover en la barra inferior.</p>
        <p><b>6. -</b> Pulsar el boton "Confirmar entrada/salida" para guardar los cambios.</p>
        <hr></hr>

        <h2>Sección Clientes</h2>
        <h3 id="registrar_cliente">Registrar Cliente</h3>
        <p>Este formulario permite registrar nuevos clientes en el sistema, asignando su información básica y opcionalmente su credito.</p>
        <img src = {rc} className="imagen"/>
        <br/>
        <p>Estos son los campos disponibles:</p>
        <table>
        <thead>
          <tr>
            <th>Numero</th>
            <th>Campo</th>
            <th>Descripcion</th>
            <th>Tipo de dato</th>
            <th>Ejemplo</th>
          </tr>
        </thead>
        <tbody>
            <td>1</td>
            <td>Nombre</td>
            <td>Nombre(s) del cliente.</td>
            <td>Texto</td>
            <td>Pedro Alejandro</td>
        </tbody>
        <tbody>
            <td>2</td>
            <td>Apellido Paterno</td>
            <td>Apellido paterno del cliente.</td>
            <td>Texto</td>
            <td>Gomez</td>
        </tbody>
        <tbody>
            <td>3</td>
            <td>Apellido Materno</td>
            <td>Apellido materno del cliente.</td>
            <td>Texto</td>
            <td>Lopez</td>
        </tbody>
        <tbody>
            <td>4</td>
            <td>Domicilio</td>
            <td>Dirección de residencia del cliente.</td>
            <td>Texto</td>
            <td>Calle Falsa 123</td>
        </tbody>
        <tbody>
            <td>5</td>
            <td>Teléfono</td>
            <td>Número de contacto del cliente.</td>
            <td>Numerico</td>
            <td>5551234567</td>
        </tbody>
        <tbody>
            <td>6</td>
            <td>Limite de credito (opcional)</td>
            <td>Monto máximo de crédito asignado al cliente.</td>
            <td>Numerico con decimales</td>
            <td>5000.00</td>
        </tbody>
        <tbody>
            <td>7</td>
            <td>Registrar</td>
            <td>Permite crear/editar el cliente seleccionado a la base de datos.</td>
            <td>Boton</td>
            <td>No aplica</td>
        </tbody>
        <tbody>
            <td>8</td>
            <td>Consultar Cliente</td>
            <td>Abre una ventana emergente donde podrás seleccionar un cliente ya existente y modificar sus datos.</td>
            <td>Boton</td>
            <td>No aplica</td>
        </tbody>
        <tbody>
            <td>9</td>
            <td>Cancelar</td>
            <td>Limpia todos los campos de la pantalla.</td>
            <td>Boton</td>
            <td>No aplica</td>
        </tbody>
        </table>
        <p><b>Pasos de funcionamiento para registrar un cliente:</b></p>
        <p><b>1. -</b> Llenar todos los campos (Nombre, Apellidos, Domicilio, etc).</p>
        <p><b>2. -</b> Verificar que la información puesta sea la correcta.</p>
        <p><b>3. -</b> Pulsar el boton "Registrar" para guardar la informacion.</p>
        <p><b>Pasos de funcionamiento para editar un cliente:</b></p>
        <p><b>1. -</b> Pulsar el boton "Consultar Cliente".</p>
        <p><b>2. -</b> Buscar el cliente correspondiente.</p>
        <p><b>3. -</b> Seleccionar mediante el uso del boton el cliente correspondiente.</p>
        <p><b>4. -</b> Modificar los campos correspondiente.</p>
        <p><b>5. -</b> Pulsar el boton "Guardar" para guardar los cambios.</p>
        <h3 id="saldo_cliente">Saldo del cliente</h3>
        <p>
            Esta seccion permite consultar el saldo actual de un cliente registrado en el sistema,
            ademas de permitir revisar la linea de credito que posee.
        </p>
        <img src = {sc} className="imagen"/>
        <p>Estas son las opciones que se pueden realizar en esta seccion:</p>
        <table>
        <thead>
            <tr>
            <th>Numero</th>
            <th>Campo</th>
            <th>Descripcion</th>
            <th>Tipo de dato</th>
            <th>Ejemplo</th>
            </tr>
        </thead>
        <tbody>
            <td>1</td>
            <td>Buscar Cliente</td>
            <td>Linea de texto que permite buscar un cliente ya existente.</td>
            <td>Cuadro de texto</td>
            <td>Pedro Alejandro Gomez Lopez</td>
        </tbody>
        <tbody>
            <td>2</td>
            <td>Cuadro de informacion</td>
            <td>Parte de la pantalla donde se muestra a todos los clientes registrados.</td>
            <td>Visualización</td>
            <td>No aplica</td>
        </tbody>
        <tbody>
            <td>3</td>
            <td>Seleccionar Cliente</td>
            <td>Boton que permite seleccionar el cliente mediante el uso de un boton.</td>
            <td>Boton</td>
            <td>No aplica</td>
        </tbody>
        <tbody>
            <td>4</td>
            <td>Cuadro de saldo</td>
            <td>Parte de la pantalla donde se muestra la informacion basica y el limite de credito del cliente seleccionado.</td>
            <td>Visualización</td>
            <td>No aplica</td>
        </tbody>
        <tbody>
            <td>5</td>
            <td>Limpiar seleccion</td>
            <td>Boton que permite limpiar la seleccion del cliente actual.</td>
            <td>Boton</td>
            <td>No aplica</td>
        </tbody>
        <tbody>
            <td>6</td>
            <td>Cuadro de linea de credito</td>
            <td>Parte de la pantalla donde se muestra el saldo actual y la deuda del cliente seleccionado.</td>
            <td>Visualización</td>
            <td>No aplica</td>
        </tbody>
        <tbody>
            <td>7</td>
            <td>Monto a abonar</td>
            <td>Cuadro de texto que permite ingresar el monto a abonar por el cliente.</td>
            <td>Cuadro de texto, numerico</td>
            <td>1500.00</td>
        </tbody>
        <tbody>
            <td>8</td>
            <td>Abonar</td>
            <td>Boton que permite realizar el abono al saldo del cliente.</td>
            <td>Boton</td>
            <td>No aplica</td>
        </tbody>
        </table>
        <p><b>Pasos para consultar el saldo de un cliente y abonar:</b></p>
        <p><b>1. -</b> Ingresar el nombre del cliente en la barra de busqueda.</p>
        <p><b>2. -</b> Seleccionar el cliente correspondiente de la lista.</p>
        <p><b>3. -</b> Revisar la informacion mostrada en el cuadro de informacion.</p>
        <p><b>4. -</b> En caso de querer realizar un abono, ingresar el monto a abonar en la barra inferior.</p>
        <p><b>5. -</b> Pulsar el boton "Abonar" para realizar el abono.</p>
        <hr></hr>

        <h2>Sección proveedores</h2>
        <h3 id="registrar_Proveedor">Registrar/Editar proveedor</h3>
        <p>Este formulario permite registrar nuevos proveedores en el sistema, asignando su información básica.</p>
        <img src = {rpp} className="imagen-proveedor"/>
        <br/>
        <p>Estos son los campos disponibles:</p>
        <table>
        <thead>
            <tr>
            <th>Numero</th>
            <th>Campo</th>
            <th>Descripcion</th>
            <th>Tipo de dato</th>
            <th>Ejemplo</th>
            </tr>
        </thead>
        <tbody>
            <td>1</td>
            <td>Nombre del Proveedor</td>
            <td>Nombre o razón social del proveedor.</td>
            <td>Texto</td>
            <td>Distribuciones Alimenticias S.A.</td>
        </tbody>
        <tbody>
            <td>2</td>
            <td>Teléfono</td>
            <td>Número de contacto del proveedor.</td>
            <td>Numerico</td>
            <td>5559876543</td>
        </tbody>
        <tbody>
            <td>3</td>
            <td>Crear</td>
            <td>Permite crear/editar el proveedor seleccionado a la base de datos.</td>
            <td>Boton</td>
            <td>No aplica</td>
        </tbody>
        <tbody>
            <td>4</td>
            <td>Consultar Proveedor</td>
            <td>Abre una ventana emergente donde podrás seleccionar un proveedor ya existente y modificar sus datos.</td>
            <td>Boton</td>
            <td>No aplica</td>
        </tbody>
        <tbody>
            <td>5</td>
            <td>Cancelar</td>
            <td>Limpia todos los campos de la pantalla.</td>
            <td>Boton</td>
            <td>No aplica</td>
        </tbody>
        </table>
        <p><b>Pasos de funcionamiento para registrar un proveedor:</b></p>
        <p><b>1. -</b> Llenar todos los campos (Nombre del Proveedor, Teléfono, etc).</p>
        <p><b>2. -</b> Verificar que la información puesta sea la correcta.</p>
        <p><b>3. -</b> Pulsar el boton "Crear" para guardar la informacion.</p>
        <p><b>Pasos de funcionamiento para editar un proveedor:</b></p>
        <p><b>1. -</b> Pulsar el boton "Consultar Proveedor".</p>
        <p><b>2. -</b> Buscar el proveedor correspondiente.</p>
        <p><b>3. -</b> Seleccionar mediante el uso del boton el proveedor correspondiente.</p>
        <p><b>4. -</b> Modificar los campos correspondiente.</p>
        <p><b>5. -</b> Pulsar el boton "Guardar" para guardar los cambios.</p>
        <hr></hr>

        <h2>Sección ventas</h2>
        <h3 id="registrar_venta">Registrar Venta</h3>
        <p>
            Esta seccion permite registrar nuevas ventas en el sistema, seleccionando los productos a vender,
            asi como el cliente al que se le realiza la venta.
        </p>
        <img src = {rv} className="imagen"/>
        <p>Estas son las opciones que se pueden realizar en esta seccion:</p>
        <table>
        <thead>
            <tr>
            <th>Numero</th>
            <th>Campo</th>
            <th>Descripcion</th>
            <th>Tipo de dato</th>
            <th>Ejemplo</th>
            </tr>
        </thead>
        <tbody>
            <td>1</td>
            <td>Buscar Producto</td>
            <td>Boton que abre una ventana emergente para seleccionar un producto ya existente.</td>
            <td>Boton</td>
            <td>No aplica</td>
        </tbody>
        <tbody>
            <td>2</td>
            <td>Cuadro de productos</td>
            <td>Parte de la pantalla donde se muestra la lista de productos seleccionados para la venta.</td>
            <td>Visualización</td>
            <td>No aplica</td>
        </tbody>
        <tbody>
            <td>3</td>
            <td>Tipo de pago</td>
            <td>Selección del método de pago utilizado por el cliente.</td>
            <td>Texto (Contado, Credito)</td>
            <td>No aplica</td>
        </tbody>
        <tbody>
            <td>4</td>
            <td>Contado</td>
            <td>Indica si la venta se realiza a contado.</td>
            <td>Boton</td>
            <td>No aplica</td>
        </tbody>
        <tbody>
            <td>5</td>
            <td>Credito</td>
            <td>
                Indica si la venta se realiza a credito, para realizarla se requiere
                seleccionar al cliente registrado.
            </td>
            <td>Boton</td>
            <td>No aplica</td>
        </tbody>
        <tbody>
            <td>6</td>
            <td>Quitar cliente</td>
            <td>Boton que permite eliminar la seleccion del cliente actual.</td>
            <td>Boton</td>
            <td>No aplica</td>
        </tbody>
        <tbody>
            <td>7</td>
            <td>Cancelar venta</td>
            <td>Boton que permite cancelar la venta actual y limpiar la tabla.</td>
            <td>Boton</td>
            <td>No aplica</td>
        </tbody>
        <tbody>
            <td>8</td>
            <td>Cobrar</td>
            <td>Boton que permite finalizar la venta y guardar la informacion en la base de datos.</td>
            <td>Boton</td>
            <td>No aplica</td>
        </tbody>
        </table>
        <p><b>Pasos para registrar una venta:</b></p>
        <p><b>1. -</b> Pulsar el boton "Buscar Producto".</p>
        <p><b>2. -</b> Buscar el producto correspondiente.</p>
        <p><b>3. -</b> Seleccionar mediante el uso del boton el producto correspondiente.</p>
        <p><b>4. -</b> Repetir los pasos 1 a 3 hasta agregar todos los productos deseados.</p>
        <p><b>5. -</b> Seleccionar el tipo de pago (Contado o Credito).</p>
        <p><b>6. -</b> En caso de seleccionar credito, buscar y seleccionar el cliente correspondiente.</p>
        <p><b>7. -</b> Pulsar el boton "Cobrar" para finalizar la venta.</p>

        <h3 id="detalle_venta">Detalle de ventas</h3>
        <p>
            Esta seccion permite consultar el detalle de una venta ya realizada en el sistema,
            mostrando la informacion completa de la venta seleccionada y pudiendo realizar
            busquedas mediante fecha, id o nombre del cliente.
        </p>
        <img src = {dv} className="imagen"/>
        <p>Estas son las opciones que se pueden realizar en esta seccion:</p>
        <table>
        <thead>
            <tr>
            <th>Numero</th>
            <th>Campo</th>
            <th>Descripcion</th>
            <th>Tipo de dato</th>
            <th>Ejemplo</th>
            </tr>
        </thead>
        <tbody>
            <td>1</td>
            <td>ID de venta</td>
            <td>Permite filtrar por el numero de venta.</td>
            <td>Cuadro de texto, numerico</td>
            <td>1023</td>
        </tbody>
        <tbody>
            <td>2</td>
            <td>Cliente (solo credito)</td>
            <td>Permite filtrar por el nombre del cliente en caso de ser por credito.</td>
            <td>Cuadro de texto</td>
            <td>Pedro Alejandro Gomez Lopez</td>
        </tbody>
        <tbody>
            <td>3</td>
            <td>Tipo de pago</td>
            <td>Selección del método de pago utilizado en la venta.</td>
            <td>Lista desplegable (Contado, Credito)</td>
            <td>Credito</td>
        </tbody>
        <tbody>
            <td>4</td>
            <td>Fecha inicio</td>
            <td>Permite filtrar las ventas a partir de una fecha inicial.</td>
            <td>Selector de fecha</td>
            <td>01/01/2024</td>
        </tbody>
        <tbody>
            <td>5</td>
            <td>Fecha fin</td>
            <td>Permite filtrar las ventas hasta una fecha final.</td>
            <td>Selector de fecha</td>
            <td>31/01/2024</td>
        </tbody>
        <tbody>
            <td>6</td>
            <td>Cuadro de informacion</td>
            <td>
                Parte de la pantalla donde se muestra la lista de ventas realizadas o
                que cumplen con los filtros aplicados.
            </td>
            <td>Visualización</td>
            <td>No aplica</td>
        </tbody>
        <tbody>
            <td>7</td>
            <td>Seleccionar</td>
            <td>Boton que permite seleccionar la venta mediante el uso de un boton.</td>
            <td>Boton</td>
            <td>No aplica</td>
        </tbody>
        <tbody>
            <td>8</td>
            <td>Cuadro de detalle de venta</td>
            <td>
                Parte de la pantalla donde se muestra la informacion detallada de la venta seleccionada.
            </td>
            <td>Visualización</td>
            <td>No aplica</td>
        </tbody>
        <tbody>
            <td>9</td>
            <td>Imprimir ticket</td>
            <td>Boton que permite imprimir el ticket de la venta seleccionada.</td>
            <td>Boton</td>
            <td>No aplica</td>
        </tbody>
        </table>
        <p><b>Pasos para consultar el detalle de una venta:</b></p>
        <p><b>1. -</b> Ingresar los filtros deseados en caso de ser necesario (ID de venta, Cliente, Tipo de pago, Fecha inicio/fin).</p>
        <p><b>2. -</b> Seleccionar la venta correspondiente de la lista.</p>
        <p><b>3. -</b> Revisar la informacion mostrada en el cuadro de informacion.</p>
        <p><b>4. -</b> En caso de querer imprimir el ticket de la venta, pulsar el boton "Imprimir ticket".</p>
        <hr></hr>

        <h2>Sección devoluciones</h2>
        <h3 id="registrar_devolucion">Registrar Devolución</h3>
        <p>
            Esta seccion permite registrar nuevas devoluciones en el sistema, seleccionando los productos a devolver, asi como el cliente al que se le realiza la devolucion
            en caso de ser en credito.
        </p>
        <img src = {rdev} className="imagen"/>
        <p>Estas son las opciones que se pueden realizar en esta seccion:</p>
        <table>
        <thead>
            <tr>
            <th>Numero</th>
            <th>Campo</th>
            <th>Descripcion</th>
            <th>Tipo de dato</th>
            <th>Ejemplo</th>
            </tr>
        </thead>
        <tbody>
            <td>1</td>
            <td>Buscar Producto</td>
            <td>Boton que abre una ventana emergente para seleccionar un producto ya existente.</td>
            <td>Boton</td>
            <td>No aplica</td>
        </tbody>
        <tbody>
            <td>2</td>
            <td>Cuadro de productos</td>
            <td>Parte de la pantalla donde se muestra la lista de productos seleccionados para la devolucion, se pueden agregar mas productos o eliminarlos.</td>
            <td>Visualización</td>
            <td>No aplica</td>
        </tbody>
        <tbody>
            <td>3</td>
            <td>Tipo de devolucion</td>
            <td>Muestra el tipo de devolucion a realizar (Credito, Contado).</td>
            <td>Texto (Contado, Credito)</td>
            <td>No aplica</td>
        </tbody>
        <tbody>
            <td>4</td>
            <td>Contado</td>
            <td>Indica si la devolucion se realiza a contado.</td>
            <td>Boton</td>
            <td>No aplica</td>
        </tbody>
        <tbody>
            <td>5</td>
            <td>Credito</td>
            <td>
                Indica si la devolucion se realiza a credito, para realizarla se requiere
                seleccionar al cliente registrado.
            </td>
            <td>Boton</td>
            <td>No aplica</td>
        </tbody>
        <tbody>
            <td>6</td>
            <td>Quitar cliente</td>
            <td>Boton que permite eliminar la seleccion del cliente actual.</td>
            <td>Boton</td>
            <td>No aplica</td>
        </tbody>
        <tbody>
            <td>7</td>
            <td>Cancelar devolucion</td>
            <td>Boton que permite cancelar la devolucion actual y limpiar la tabla.</td>
            <td>Boton</td>
            <td>No aplica</td>
        </tbody>
        <tbody>
            <td>8</td>
            <td>Registrar devolucion</td>
            <td>Boton que permite finalizar la devolucion y guardar la informacion en la base de datos.</td>
            <td>Boton</td>
            <td>No aplica</td>
        </tbody>
        </table>
        <p><b>Pasos para registrar una devolucion:</b></p>
        <p><b>1. -</b> Pulsar el boton "Buscar Producto".</p>
        <p><b>2. -</b> Buscar el producto correspondiente.</p>
        <p><b>3. -</b> Seleccionar mediante el uso del boton el producto correspondiente.</p>
        <p><b>4. -</b> Repetir los pasos 1 a 3 hasta agregar todos los productos deseados.</p>
        <p><b>5. -</b> Seleccionar el tipo de devolucion (Contado o Credito).</p>
        <p><b>6. -</b> En caso de seleccionar credito, buscar y seleccionar el cliente correspondiente.</p>
        <p><b>7. -</b> Pulsar el boton "Procesar devolucion" para finalizar la devolucion.</p>
        
        <h3 id="detalle_devolucion">Detalle de Devolución</h3>
        <p>
            Esta seccion permite consultar el detalle de una devolucion ya realizada en el sistema,
            mostrando la informacion completa de la devolucion seleccionada y pudiendo realizar
            busquedas mediante fecha, id o nombre del cliente.
        </p>
        <img src = {ddev} className="imagen"/>
        <p>Estas son las opciones que se pueden realizar en esta seccion:</p>
        <table>
        <thead>
            <tr>
            <th>Numero</th>
            <th>Campo</th>
            <th>Descripcion</th>
            <th>Tipo de dato</th>
            <th>Ejemplo</th>
            </tr>
        </thead>
        <tbody>
            <td>1</td>
            <td>ID devolucion</td>
            <td>Permite filtrar por el numero de devolucion.</td>
            <td>Cuadro de texto, numerico</td>
            <td>205</td>
        </tbody>
        <tbody>
            <td>2</td>
            <td>Cliente</td>
            <td>Permite filtrar por el nombre del cliente.</td>
            <td>Cuadro de texto</td>
            <td>Pedro Alejandro Gomez Lopez</td>
        </tbody>
        <tbody>
            <td>3</td>
            <td>Tipo de devolucion</td>
            <td>Selección del método de devolucion utilizado.</td>
            <td>Lista desplegable (Contado, Credito)</td>
            <td>Credito</td>
        </tbody>
        <tbody>
            <td>4</td>
            <td>Desde</td>
            <td>Permite filtrar las devoluciones a partir de una fecha inicial.</td>
            <td>Selector de fecha</td>
            <td>21/12/2024</td>
        </tbody>
        <tbody>
            <td>5</td>
            <td>Hasta</td>
            <td>Permite filtrar las devoluciones hasta una fecha final.</td>
            <td>Selector de fecha</td>
            <td>25/05/2025</td>
        </tbody>
        <tbody>
            <td>6</td>
            <td>Cuadro de informacion</td>
            <td>
                Parte de la pantalla donde se muestra la lista de devoluciones realizadas o
                que cumplen con los filtros aplicados.
            </td>
            <td>Visualización</td>
            <td>No aplica</td>
        </tbody>
        <tbody>
            <td>7</td>
            <td>Ver detalle</td>
            <td>Boton que permite seleccionar la devolucion y mostrarla en la parte inferior.</td>
            <td>Boton</td>
            <td>No aplica</td>
        </tbody>
        <tbody>
            <td>8</td>
            <td>Cuadro de detalle de devolucion</td>
            <td>Parte de la pantalla donde se muestra la informacion detallada de la devolucion seleccionada.</td>
            <td>Visualización</td>
            <td>No aplica</td>
        </tbody>
        <tbody>
            <td>9</td>
            <td>Imprimir ticket</td>
            <td>Boton que permite imprimir el ticket de la devolucion seleccionada.</td>
            <td>Boton</td>
            <td>No aplica</td>
        </tbody>
        </table>
        <p><b>Pasos para consultar el detalle de una devolucion:</b></p>
        <p><b>1. -</b> Ingresar los filtros deseados en caso de ser necesario (ID de devolucion, Cliente, Tipo de devolucion, Desde/Hasta).</p>
        <p><b>2. -</b> Seleccionar la devolucion correspondiente de la lista.</p>
        <p><b>3. -</b> Revisar la informacion mostrada en el cuadro de informacion.</p>
        <p><b>4. -</b> En caso de querer imprimir el ticket de la devolucion, pulsar el boton "Imprimir ticket".</p>
        <hr/>

        <h2>Sección Caja</h2>
        <h3 id="apertura_caja">Apertura de Caja</h3>
        <p>Este es el apartado donde se abre la caja, el sistema siempre llega a este punto en caso de no existir una caja abierta.</p>
        <img src = {ac} className="imagen"/>
        <p>Estos son los campos disponibles:</p>
        <table>
            <thead>
            <tr>
                <th>Numero</th>
                <th>Campo</th>
                <th>Descripcion</th>
                <th>Tipo de dato</th>
                <th>Ejemplo</th>
                </tr>
            </thead>
            <tbody>
                <td>1</td>
                <td>Fecha</td>
                <td>Fecha actual del sistema a la hora de abrir la caja.</td>
                <td>Caja de texto, Visualización</td>
                <td>15/03/2024</td>
            </tbody>
            <tbody>
                <td>2</td>
                <td>Hora</td>
                <td>Hora actual del sistema a la hora de abrir la caja.</td>
                <td>Caja de texto, Visualización</td>
                <td>09:30:05</td>
            </tbody>
            <tbody>
                <td>3</td>
                <td>Monto inicial</td>
                <td>Monto con el que se abre la caja.</td>
                <td>Caja de texto, Numerico con decimales</td>
                <td>10345.50</td>
            </tbody>
            <tbody>
                <td>4</td>
                <td>Abrir caja</td>
                <td>Boton que permite abrir la caja con el monto inicial ingresado.</td>
                <td>Boton</td>
                <td>No aplica</td>
            </tbody>
        </table>
        <p><b>Pasos para abrir la caja:</b></p>
        <p><b>1. -</b> Ingresar el monto inicial con el que se abre la caja.</p>
        <p><b>2. -</b> Pulsar el boton "Abrir caja" para abrir la caja y continuar con las operaciones diarias.</p>
        <p><b>ATENCION:</b> El programa no te dejara utilizar ningun apartado si no existe una caja abierta por lo menos.</p>
        <h3 id="cierre_caja">Cierre de Caja</h3>
        <p>Este es el apartado donde se cierra la caja, el sistema llegara a este punto cuando se vaya a finalizar las operaciones diarias.</p>
        <img src = {cc} className="imagen"/>
        <p>Estos son los campos disponibles:</p>
        <table>
            <thead>
                <tr>
                <th>Numero</th>
                <th>Campo</th>
                <th>Descripcion</th>
                <th>Tipo de dato</th>
                <th>Ejemplo</th>
                </tr>
            </thead>
            <tbody>
                <td>1</td>
                <td>Cuadro de informacion del dia</td>
                <td>Parte de la pantalla donde se muestra la informacion resumida del dia actual junto al ID del corte del dia respectivo.</td>
                <td>Visualización</td>
                <td>No aplica</td>
            </tbody>
            <tbody>
                <td>2</td>
                <td>Cuadro de informacion monetaria</td>
                <td>Parte de la pantalla donde se muestra la informacion de todos los movimientos de dinero realizados en el dia.</td>
                <td>Visualización</td>
                <td>No aplica</td>
            </tbody>
            <tbody>
                <td>3</td>
                <td>Cuadro de informacion de diferencia</td>
                <td>Parte de la pantalla donde se muestra el dinero que se posee actualmente y la diferencia del dinero del dia.</td>
                <td>Visualización</td>
                <td>No aplica</td>
            </tbody>
            <tbody>
                <td>4</td>
                <td>Cerrar caja</td>
                <td>Boton que permite cerrar la caja y guardar toda la informacion del dia en la base de datos.</td>
                <td>Boton</td>
                <td>No aplica</td>
            </tbody>
            <tbody>
                <td>5</td>
                <td>Imprimir ticket</td>
                <td>Boton que permite imprimir el corte de caja del dia actual.</td>
                <td>Boton</td>
                <td>No aplica</td>
            </tbody> 
        </table>
        <p><b>Pasos para cerrar la caja:</b></p>
        <p><b>1. -</b> Revisar que toda la informacion mostrada sea correcta.</p>
        <p><b>2. -</b> Pulsar el boton "Cerrar caja" para finalizar las operaciones del dia y guardar la informacion.</p>
        <p><b>3. -</b> En caso de querer un comprobante fisico, pulsar el boton "Imprimir ticket" para obtener el corte de caja.</p>
        <h3 id="movimientos_caja">Movimientos de Caja</h3>
        <p>Este apartado permite registrar movimientos adicionales de dinero en la caja, ya sea ingresos o egresos.</p>
        <img src = {mc} className="imagen"/>
        <p>Estos son los campos disponibles:</p>
        <table>
            <thead>
            <tr>
            <th>Numero</th>
            <th>Campo</th>
            <th>Descripcion</th>
            <th>Tipo de dato</th>
            <th>Ejemplo</th>
            </tr>
            </thead>
            <tbody>
                <td>1</td>
                <td>Tipo de movimiento</td>
                <td>Selecciona si el movimiento es un deposito, retiro o un pago a proveedor.</td>
                <td>Lista desplegable (Deposito, Retiro, Pago a Proveedor)</td>
                <td>Deposito</td>
            </tbody>
            <tbody>
                <td>2</td>
                <td>Monto</td>
                <td>Cantidad de dinero que se utilizará para el movimiento.</td>
                <td>Caja de texto, Numerico con decimales</td>
                <td>9000.00</td>
            </tbody>
            <tbody>
                <td>3</td>
                <td>Descripcion</td>
                <td>Breve descripcion del motivo del movimiento.</td>
                <td>Caja de texto</td>
                <td>Pago de servicios</td>
            </tbody> 
            <tbody>
                <td>4</td>
                <td>Registrar</td>
                <td>Boton que permite registrar el movimiento en la caja actual.</td>
                <td>Boton</td>
                <td>No aplica</td>
            </tbody>
        </table>
        <p><b>Pasos para registrar un movimiento de caja:</b></p>
        <p><b>1. -</b> Seleccionar el tipo de movimiento (Deposito, Retiro, Pago a Proveedor).</p>
        <p><b>2. -</b> Ingresar el monto del movimiento.</p>
        <p><b>3. -</b> Ingresar una breve descripcion del motivo del movimiento.</p>
        <p><b>4. -</b> Pulsar el boton "Registrar" para guardar el movimiento en la caja actual.</p>
        <hr/>

        <h2>Sección Consultas</h2>
        <h3 id="consultas">Consultas</h3>
        <p>
            Esta seccion permite realizar consultas generales en el sistema, pudiendo filtrar por diferentes criterios
            y obteniendo reportes detallados de las operaciones realizadas.
        </p>
        <img src = {c} className="imagen"/>
        <p>Estas son las opciones que se pueden realizar en esta seccion:</p>
        <table>
        <thead>
            <tr>
            <th>Numero</th>
            <th>Campo</th>
            <th>Descripcion</th>
            <th>Tipo de dato</th>
            <th>Ejemplo</th>
            </tr>
        </thead>
        <tbody>
            <td>1</td>
            <td>Producto con existencias</td>
            <td>Genera un reporte de todos los productos que tienen existencias en el inventario.</td>
            <td>Boton</td>
            <td>No aplica</td>
        </tbody>
        <tbody>
            <td>2</td>
            <td>Producto sin existencias</td>
            <td>Genera un reporte de todos los productos que <b>no</b> tienen existencias en el inventario.</td>
            <td>Boton</td>
            <td>No aplica</td>
        </tbody>
        <tbody>
            <td>3</td>
            <td>Desde:</td>
            <td>Selector de fecha que permite filtrar los reportes a partir de una fecha inicial.</td>
            <td>Selector de fecha</td>
            <td>05/08/2025</td>
        </tbody>
        <tbody>
            <td>4</td>
            <td>Hasta:</td>
            <td>Selector de fecha que permite filtrar los reportes hasta una fecha final.</td>
            <td>Selector de fecha</td>
            <td>20/08/2025</td>
        </tbody>
        <tbody>
            <td>5</td>
            <td>Ventas (credito)</td>
            <td>Genera un reporte de todas las ventas realizadas a credito en el periodo seleccionado.</td>
            <td>Boton</td>
            <td>No aplica</td>
        </tbody>
        <tbody>
            <td>6</td>
            <td>Ventas (contado)</td>
            <td>Genera un reporte de todas las ventas realizadas a contado en el periodo seleccionado.</td>
            <td>Boton</td>
            <td>No aplica</td>
        </tbody>
        <tbody>
            <td>7</td>
            <td>Devoluciones</td>
            <td>Genera un reporte de todas las devoluciones realizadas en el periodo seleccionado.</td>
            <td>Boton</td>
            <td>No aplica</td>
        </tbody>
        <tbody>
            <td>8</td>
            <td>Cuadro de informacion</td>
            <td>Parte de la pantalla donde se muestra la lista de reportes generados.</td>
            <td>Visualización</td>
            <td>No aplica</td>
        </tbody>
        </table>
        <p><b>Pasos para generar un reporte:</b></p>
        <p><b>1. -</b> Seleccionar las fechas de inicio y fin del periodo a consultar.</p>
        <p><b>2. -</b> Pulsar el boton correspondiente al tipo de reporte que se desea generar.</p>
        <p><b>3. -</b> Revisar la informacion correspondiente en el apartado especifico.</p>
        <h3 id="Reportes">Reportes</h3>
        <p>
            Esta seccion permite generar reportes, exportarlo a Excel, imprimirlo todo o de forma especifica de las diferentes 
            operaciones realizadas en el sistema, como ventas, devoluciones y movimientos de caja.
        </p>
        <img src = {rep} className="imagen"/>
        <p>Estas son las opciones que se pueden realizar en esta seccion:</p>
        <table>
        <thead>
            <tr>
                <th>Numero</th>
                <th>Campo</th>
                <th>Descripcion</th>
                <th>Tipo de dato</th>
               <th>Ejemplo</th>
            </tr>
        </thead>
        <tbody>
            <td>1</td>
            <td>Ventas</td>
            <td>Genera un reporte de todas las ventas realizadas en el periodo seleccionado o en general.</td>
            <td>Boton</td>
            <td>No aplica</td>
        </tbody>
        <tbody>
            <td>2</td>
            <td>Devolucion</td>
            <td>Genera un reporte de todas las devoluciones realizadas en el periodo seleccionado o en general.</td>
            <td>Boton</td>
            <td>No aplica</td>
        </tbody>
        <tbody>
            <td>3</td>
            <td>Corte Caja</td>
            <td>Genera un reporte de todos los cortes de caja realizados en el periodo seleccionado o en general.</td>
            <td>Boton</td>
            <td>No aplica</td>
        </tbody>
        <tbody>
            <td>4</td>
            <td>Productos vendidos</td>
            <td>Genera un reporte de todos los productos vendidos en el periodo seleccionado o en general.</td>
            <td>Boton</td>
            <td>No aplica</td>
        </tbody>
        <tbody>
            <td>5</td>
            <td>Productos devueltos</td>
            <td>Genera un reporte de todos los productos devueltos en el periodo seleccionado o en general.</td>
            <td>Boton</td>
            <td>No aplica</td>
        </tbody>
        <tbody>
            <td>6</td>
            <td>Ventas tipo pago</td>
            <td>Genera un reporte de las ventas filtradas por tipo de pago en el periodo seleccionado o en general.</td>
            <td>Boton</td>
            <td>No aplica</td>
        </tbody>
        <tbody>
            <td>7</td>
            <td>Stock minimo</td>
            <td>Genera un reporte de todos los productos que estan por debajo del stock minimo establecido.</td>
            <td>Boton</td>
            <td>No aplica</td>
        </tbody>
        <tbody>
            <td>8</td>
            <td>Fecha inicio</td>
            <td>Selector de fecha que permite filtrar los reportes a partir de una fecha inicial.</td>
            <td>Selector de fecha</td>
            <td>10/09/2025</td>
        </tbody>
        <tbody>
            <td>9</td>
            <td>Fecha fin</td>
            <td>Selector de fecha que permite filtrar los reportes hasta una fecha final.</td>
            <td>Selector de fecha</td>
            <td>25/09/2025</td>
        </tbody>
        <tbody>
            <td>10</td>
            <td>Exportar Excel</td>
            <td>Boton que permite exportar el reporte generado a un archivo de Excel.</td>
            <td>Boton</td>
            <td>No aplica</td>
        </tbody>
        <tbody>
            <td>11</td>
            <td>Imprimir todo</td>
            <td>Boton que permite imprimir todo el reporte generado.</td>
            <td>Boton</td>
            <td>No aplica</td>
        </tbody>
        <tbody>
            <td>12</td>
            <td>Imprimir filas seleccionadas</td>
            <td>Boton que permite imprimir solo las filas seleccionadas del reporte generado.</td>
            <td>Boton</td>
            <td>No aplica</td>
        </tbody>
        <tbody>
            <td>13</td>
            <td>Cuadro de informacion</td>
            <td>Parte de la pantalla donde se muestra la lista de reportes generados, tiene la particularidad de poder seleccionar una o varias filas.</td>
            <td>Visualización</td>
            <td>No aplica</td>
        </tbody>
        </table>
        <p><b>Pasos para generar un reporte:</b></p>
        <p><b>1. -</b> Seleccionar las fechas de inicio y fin del periodo a consultar en caso de ser necesario.</p>
        <p><b>2. -</b> Pulsar el boton correspondiente al tipo de reporte que se desea generar.</p>
        <p><b>3. -</b> Revisar la informacion correspondiente en el cuadro de informacion.</p>
        <p><b>4. -</b> En caso de querer exportar el reporte a Excel, pulsar el boton "Exportar Excel".</p>
        <p><b>5. -</b> En caso de querer imprimir el reporte, pulsar el boton "Imprimir todo" o "Imprimir filas seleccionadas" segun sea el caso.</p>
        <hr/>
    </form>
    </div>
);
}
export default ayuda;