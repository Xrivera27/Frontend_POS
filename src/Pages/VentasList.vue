<template>
    <div class="encabezado" >
      <h1> Ventas</h1>
      <ProfileButton :companyName="'Perdomo y Asociados'" :role="'Gerente'" />
      
    </div>
    <hr>
  
  <div class="wrapper">
  <div class="main-container">


  <div class="inputs-container">
    <div class=" input-container codigo-input">
      <label for="codigo-busqueda" class="label-input" >Codigo del producto:</label>
        <input name="codigo-busqueda" ref="codigo" type="text" class="campo codigo-busqueda" v-model="addQuery">
        <button class="agregar-producto bi bi-plus-circle-fill" @click="agregarProducto()" ></button>
      </div>
  
      <!-- Barra de búsqueda -->
      <div class="input-container input-cantidad">
        <label for="cantidad" class="label-input">Cantidad:</label>
        <input name="cantidad" class="campo" type="text" v-model="addQuantity" />
      </div>

      <div>
        <button id="delete-last-producto" class="btn" @click="deleteUltimo" >Cancelar ultimo</button>
      </div>
  </div>
      
  
      <div class="table-container">
        <table class="table">
          <thead>
            <th>No. Producto</th>
            <th>Codigo</th>
            <th>Nombre</th>
            <th>Cantidad</th>
            <th>Precio Unitario</th>
            <th>Descuento</th>
            <th style="width: 100px;">Opciones</th>
          </thead>
          <tbody>
            <tr v-for="(producto, index) in productosLista" :key="index">
            <td>{{ index + 1 }}</td>
            <td>{{ producto.codigo}}</td>
            <td>{{ producto.nombre }}</td>
            <td>{{ producto.cantidad }}</td>
            <td>{{ producto.precioUnitario }}</td>
            <td>{{ producto.descuento }}</td>
            <td class="botones-accion" >
                <button id="btnDisminuir" class="btn btn-botones-accion" @click="disminuirCantidad(index)"><b><i class="bi bi-dash-circle-fill"></i></b></button>
                <button id="btnAumentar" class="btn btn-botones-accion" @click="aumentarCantidad(index)"><b><i class="bi bi-plus-circle-fill"></i></b></button>
                <button id="btnEliminar" class="btn btn-botones-accion" @click="deleteProducto(index)"><b><i class="bi bi-x-circle-fill"></i></b></button>
            </td>
           
        </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="end-container" >
      <button class="btn" id="cancelar-venta" @click="cancelarVenta" ><span>Esc</span><br>Cancelar Venta</button>
      <div class="end-container-cobro">
        <button class="btn" id="boton-cobrar" @click="payModalOpen" >F12-Cobrar</button>
        <div class="end-container-cobro-p" >
        <p id="total" >{{ calcularTotal }}</p>
        <p id="moneda">Lempiras</p>
      </div>
      </div>
    </div>
      
    
    <div class="modal-overlay" v-if="payModal">
      <div class="modal-content">
        <h2>Resumen de Venta</h2>
        <div class="div-modal-resumen">
        <label for="subtotal">Subtotal:</label>
        <input type="text" id="subtotal" v-model="subtotal" disabled>
      </div>

      <div class="div-modal-resumen" >
        <label for="discounts">Descuentos:</label>
        <input type="text" id="discounts" v-model="discounts" disabled />
      </div>

      <div class="div-modal-resumen">
        <label for="taxes">Impuestos:</label>
        <input type="text" id="taxes" v-model="taxes" disabled/>
      </div>

      <div class="div-modal-resumen">
        <label for="total">Total:</label>
        <input type="text" id="totalModal" v-model="total" disabled/>
      </div>

      <div class="div-modal-resumen div-modal-resumen-rtn">
        <label for="rtn">RTN:</label>
        <input type="text" id="rtn" v-model="rtn" />
        <button class="agregar-cliente bi bi-plus-circle-fill"></button>
      </div>

      <div class="payment-methods">
        <label>
          <input type="radio" v-model="paymentMethod" @change="selectRadioButton('cash')" value="cash"> Efectivo
        </label>
        <label>
          <input type="radio" v-model="paymentMethod" @change="selectRadioButton('card')" value="card" > Tarjeta
        </label>
        <!-- Añadir otros métodos si es necesario -->
      </div>

      <div v-if="paymentMethod === 'cash'">
        <div class="div-modal-resumen">
        <label for="pago">Monto Recibido:</label>
        <input type="text" id="pago" v-model="pago" />
      </div>
       
      </div>

      <div v-if="paymentMethod === 'card'">
        <label for="cardNumber">Número de Tarjeta:</label>
        <input type="text" id="cardNumber" v-model="cardNumber" />
        <!-- Añadir otros campos si es necesario -->
      </div>

      <div class="modal-actions">
        <button class="btn" @click="confirmPayment">Confirmar Pago</button>
        <button class="btn" @click="cancelPayment">Cancelar</button>
      </div>
      </div>
    </div>
    <div class="modal" v-if="confirmModal">
  <div class="modal-overlay">
  <div class="modal-content">
    <h2>Pago Realizado.</h2>
    <div class="modal-summary">
      <p v-if="cambio !=0 ">Cambio: {{ cambio }}</p>
    </div>
    <button @click="confirmPaymentClose" class="btn close-btn">Cerrar</button>
  </div>
</div>
</div>

<div class="modal-overlay" v-if="showConfirmModal">
  <div class="modal-content">
    <h2>Confirmación</h2>
    <p>¿Estás seguro de que quieres cancelar la venta?</p>
    <div class="modal-actions">
      <button class="btn" @click="confirmCancel">Sí, cancelar</button>
      <button class="btn" @click="cancelCancel">No, volver</button>
    </div>
  </div>
</div>

    </div>

    
  </template>
  
  <script>
  import ProfileButton from '../components/ProfileButton.vue';
  export default {
    components: {
      ProfileButton
    },
    data() {
      return {
        addQuery: '',
        addQuantity: '',
        payModal: false,
        subtotal: '',
        discounts: '',
        taxes: '',
        total: '',
        rtn: '',
        cambio: 0,
        pago: '',
        paymentMethod: '',
        confirmModal: '',
        showConfirmModal: false,
        productoForm: {
          codigo: '',
          nombre: '',
          cantidad: '',
          precioUnitario: '',
          descuento: '',
        
        },
        productos: [
        {
          
    codigo: '1',
    nombre: 'Leche',
    cantidad: 0, // La cantidad será introducida por el usuario
    precioUnitario: 25,
    descuento: 0
  },
  {
    codigo: '2',
    nombre: 'Pan',
    cantidad: 0, // La cantidad será introducida por el usuario
    precioUnitario: 15,
    descuento: 2
  },
  {
    codigo: '3',
    nombre: 'Arroz',
    cantidad: 0, // La cantidad será introducida por el usuario
    precioUnitario: 12,
    descuento: 1
  },
  {
    codigo: '4',
    nombre: 'Aceite',
    cantidad: 0, // La cantidad será introducida por el usuario
    precioUnitario: 30,
    descuento: 3
  },
  {
    codigo: '5',
    nombre: 'Huevos',
    cantidad: 0, // La cantidad será introducida por el usuario
    precioUnitario: 18,
    descuento: 0
  },
  {
    codigo: '6',
    nombre: 'Azúcar',
    cantidad: 0, // La cantidad será introducida por el usuario
    precioUnitario: 10,
    descuento: 0
  },
  {
    codigo: '7',
    nombre: 'Sal',
    cantidad: 0, // La cantidad será introducida por el usuario
    precioUnitario: 5,
    descuento: 1
  },
  {
    codigo: '8',
    nombre: 'Café',
    cantidad: 0, // La cantidad será introducida por el usuario
    precioUnitario: 50,
    descuento: 5
  },
  {
    codigo: '9',
    nombre: 'Harina',
    cantidad: 0, // La cantidad será introducida por el usuario
    precioUnitario: 20,
    descuento: 2
  },
  {
    codigo: '10',
    nombre: 'Pasta',
    cantidad: 0, // La cantidad será introducida por el usuario
    precioUnitario: 14,
    descuento: 0
  },
  {
    codigo: '11',
    nombre: 'Mantequilla',
    cantidad: 0, // La cantidad será introducida por el usuario
    precioUnitario: 22,
    descuento: 1
  }
          // Más clientes...
        ],
        productosLista: [],
      };
    },
    computed: {
      calcularTotal(){
        let totalActual = 0;
        this.productosLista.forEach(p => totalActual += (p.precioUnitario*p.cantidad));
        return totalActual;
      }
    },
    

    methods: {  
      pushEnter(event)
      {
        if(event.key === 'Enter'){this.agregarProducto();}
      },

      pushEsc(event){
        if(event.key === 'Esc' || event.key === 'Escape'){
          this.cancelarVenta();
        }
      },
      pushDelete(event) {
  const target = event.target;
  const isInputField = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

  if (!isInputField && event.key === 'Backspace') {
    this.deleteUltimo();
  }
},

pushF12(event) {
      if (event.key === 'F12') {
        event.preventDefault(); 
        this.payModalOpen(); 
      }
    },

      agregarProducto(){
        if (!this.addQuery) {
           this.addQuery = 'Ingresa codigo';
            return;   
          }

        if(isNaN(this.addQuantity)){
          this.addQuantity = 'Ingresa cantidad';
          return;
        }
        if(!this.addQuantity){
          this.addQuantity = '1';
        }
        const newProduct = this.productos.find(p => p.codigo === this.addQuery);
        const exitProduct = this.productosLista.find(p => p.codigo === this.addQuery);

        if(!newProduct){
          alert("No existe el producto");
        }

        else {
          if(exitProduct){
            exitProduct.cantidad += Number(this.addQuantity);
            
          }
          else{
          newProduct.cantidad = Number(this.addQuantity);
          this.productosLista.push(newProduct);
          
          }
          this.reiniciarInputs();
          this.$refs.codigo.focus();
        } 
        
      },
      disminuirCantidad(index){
        if(this.productosLista[index].cantidad > 0){
          this.productosLista[index].cantidad -= 1;
          if(this.productosLista[index].cantidad == 0){
            this.deleteProducto(index);
          }
        }
        
      },
      aumentarCantidad(index){
        this.productosLista[index].cantidad += 1;
      },
      deleteUltimo(){
        if(this.productosLista){
          this.productosLista.pop();
        }
        
      },
      deleteProducto(index) {
      this.productosLista.splice(index, 1);
    },

    confirmCancel(){
      this.productosLista = [];
      this.showConfirmModal = false;
      this.cambio = 0;
    },
    cancelCancel(){
      this.showConfirmModal = false;
    },
    cancelarVenta(){
      if(this.productosLista.length != 0){
        this.showConfirmModal = true;
      }
      
    },

    reiniciarInputs(){
      this.addQuery = '';
      this.addQuantity = '';
    },

    payModalOpen(){
      if(this.productosLista.length > 0){
        let numSubTotal = 0;
        this.productosLista.forEach(p => numSubTotal += (p.precioUnitario*p.cantidad));
        this.subtotal = `${numSubTotal}`;
        this.discounts = '00.00'
        this.taxes = '00.00';
        this.total = `${numSubTotal}`;
        this.payModal = true;
        this.paymentMethod = '';
      }
      
    },
    cancelPayment(){
      this.payModal = false;
    },
    selectRadioButton(opcion){
      if(opcion === 'cash'){ this.paymentMethod = 'cash'; }
      else{ this.paymentMethod = 'card'; }
    },
    confirmPayment(){
      if(Number(this.pago) > Number(this.total) || this.paymentMethod === 'card' ){
      this.cambio =   Number(this.pago) - Number(this.total);
        this.confirmModal = true;
        this.payModal = false;
        this.productosLista = [];
      }
      
    },

    confirmPaymentClose(){
      this.confirmModal = false;
    }
    },
    
    mounted() {
    // Añade el manejador de eventos cuando el componente se monta
    window.addEventListener('keydown', this.pushEnter);
    window.addEventListener('keydown', this.pushDelete);
    window.addEventListener('keydown', this.pushEsc);
    window.addEventListener('keydown', this.pushF12);
  },
  beforeUnmount() {
    // Elimina el manejador de eventos cuando el componente se destruye
    window.removeEventListener('keydown', this.pushEnter);
    window.removeEventListener('keydown', this.pushDelete);
    window.removeEventListener('keydown', this.pushEsc);
    window.removeEventListener('keydown', this.pushF12);
  },

  };
  </script>
  
  <style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap');
  
  * {
    font-family: 'Montserrat', sans-serif;
  }
  
.encabezado{
  display: flex;
  justify-content: space-between;
}

.wrapper{
  
  padding: 16px;
  display: flex;
  height: 80%;
  flex-direction: column;
  justify-content: space-between;
}

  #delete-last-producto {
    background-color: rgb(207, 57, 57);
    font-size: 16px;
    width: 170px;
    height: 40px;
    border-radius: 10px;
    margin-bottom: 15px;
    color: white;
    font-weight: bold;
  }
  
  #btnAdd:hover {
    background-color: #a38655;
    transform: scale(1.05);
    transition: all 0.3s ease;
  }
  
  #btnEditar {
    font-size: 18px;
    width: 50px;
    height: 40px;
    border-radius: 10px;
  }
  
  #btnEditar:hover {
    background-color: #e8af06;
    transform: scale(1.05);
    transition: all 0.3s ease;
  }
  
  #btnEliminar:hover {
    color: #b72433;
    transform: scale(1.05);
    transition: all 0.3s ease;
  }

  
  
  #btnAumentar:hover {
    color: #46ce10;
    transform: scale(1.05);
    transition: all 0.3s ease;
  }

 
  
  #btnDisminuir:hover {
    color: #13e4d9;
    transform: scale(1.05);
    transition: all 0.3s ease;
  }
  
  #campana {
    margin-right: 10px;
    font-size: 18px;
    color: #a38655;
  }
  
  .container-top {
    width: 100%;
    text-align: right;
  }
  
  .rol {
    color: #969696;
    font-size: 14px;
  }
  
  select {
    border: 1px solid #ccc;
    margin-top: 10px;
    margin-left: 5px;
    margin-right: 5px;
    width: 60px;
    height: 35px;
    border-radius: 5px;
  }
  
 .inputs-container{
    display: flex;
    justify-content:space-between;

 }
  .campo{
    padding: 10px;
    font-size: 14px;
    border-radius: 10px;
    border-width: 0.5px;
    
  }

  .label-input{
    margin-right: 10px;
  }
  .input-container{
   
    margin-bottom: 20px;
    margin-right: 20px;
  }

  .agregar-producto, .agregar-cliente{
    padding: 0;
    margin-left: 10px;
    background: transparent;
    border: none;
    color: rgb(18, 228, 18);
    font-size: 24px;
    font-size: 24px;
    cursor: pointer;
  }
  .codigo-input{
    display: flex;
    
    align-items: center;
  }
  
  
  
  .input-cantidad {
    margin-bottom: 16px;
  }
  
  .table-container {
    max-height: 40vh; 
    overflow-y:scroll; 
    width: 100%;
    border-radius: 10px;
    border: 1px solid #ddd;
    margin-top: 16px;
  }
  
  .table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
  }
  
  .table th,
  .table td {
    padding: 8px;
  }
  
  .table thead th {
    background-color: #e7e4e4;
    text-align: center;
    border-bottom: 1px solid #ddd;
  }
  
  .table tbody td {
    text-align: center;
    border-top: 1px solid #ddd;
  }
  
  .table thead th:first-child {
    border-top-left-radius: 10px;
  }
  
  .table thead th:last-child {
    border-top-right-radius: 10px;
  }
  
  .table tbody tr:last-child td:first-child {
    border-bottom-left-radius: 10px;
  }
  
  .table tbody tr:last-child td:last-child {
    border-bottom-right-radius: 10px;
  }
  
  .btn {
    padding: 8px 16px;
    margin: 4px;
    border: none;
    border-bottom: solid gray 2px;
    border-right: solid gray 2px;
    cursor: pointer;
    border-radius: 10px;
  }

  .btn-botones-accion{
  background: transparent;
  border: none;
  padding: 0;
  font-size: 22px;
}
  
  .btn-primary {
    background-color: #007bff;
    color: white;
  }
  
  #cancelar-venta {
    background-color: #dc3545;
    color: black;
  }
  
  .close-btn {
    background-color: #dc3545;
    color: white;
  }
  
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  #AddClienteModal {
    background: #a38655;
    border-radius: 15px;
    font-size: 16px
  }
  
  #BtnCerrar {
    border-radius: 15px;
    background-color: #ebebeb;
    font-size: 16px;
  }
  
  .modal-content {
    background-color: white;
    padding: 20px;
    border-radius: 4px;
    max-width: 500px;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .form-group {
    margin-bottom: 16px;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 8px;
  }
  
  .form-group input {
    width: 50%;
    height: 20px;
    border-radius: 5px;
    padding: 5px;
  }

  .end-container-cobro{
    display: flex;
    width: 100%;
    justify-content: end;
    align-items: center;
    height: 100px;
    
  }

  .end-container{
    display: flex;
    flex-direction: row;
    align-items: center;

    border-top: solid rgb(75, 75, 75) 1px;
  }

  .end-container-cobro-p{
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .end-container-cobro p{
    text-align: center;
    margin: 0;
    color: #094688;
  }
  #total{
    font-weight: bolder;
    font-size: 40px;
  }

  #boton-cobrar{
    height: 60%;
    width: 10%;
    margin-right: 15px;
    background-color: #094688;
    font-weight: bold;
    color: white;
  }

  #cancelar-venta{
    height: 60%;
    width: 14%;
    margin-right: 15px;
    background-color: rgb(185, 10, 10);
    font-weight: bold;
    font-size: 12px;
    color: white;
  }

  #cancelar-venta span{
    font-size: 15px;
  }

  .modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
}

.product-list {
  list-style-type: none;
  padding: 0;
}

.product-list li {
  margin-bottom: 10px;
}
.payment-methods{
  display: flex;
}
.payment-methods label {
  display: block;
  margin-bottom: 10px;
}

.modal-actions {
  margin-top: 20px;
}

.modal-actions button {
  margin-right: 10px;
}

.div-modal-resumen {
  display: flex;
  align-items: center;
  margin-bottom: 10px; /* Espacio entre los campos */
}

.div-modal-resumen label {
  width: 120px; /* Ajusta el ancho del label según sea necesario */
  margin-right: 10px; /* Espacio entre el label y el input */
}

.div-modal-resumen input {
  flex: 1; /* El input ocupará el resto del espacio disponible */
}
.div-modal-resumen-rtn{
  margin-left: 30px;
}
  </style>