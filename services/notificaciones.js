import { useToast } from "vue-toastification"; 


    function notificaciones(tipo, objeto = '') {
        const toast = useToast();
        let mensaje;
    
        switch (tipo){
          case 'empty-campo': 
          mensaje = 'El campo ' + objeto + ' esta vacio.' ;
          break;
    
          case 'invalid-password': 
          mensaje = 'La contraseña no cumple con los requisitos de seguridad';
          break;
    
          case 'diferent-password': 
          mensaje = 'Las contraseñas no coinciden';
          break;
    
          case 'invalid-phone': 
          mensaje = 'El teléfono no es válido';
          break;
    
          case 'invalid-email': 
          mensaje = 'El correo no es válido';
          break;
    
          case 'form-success': 
          mensaje = 'Usuario válido, procesando guardado...';
          break;

          case 'error': 
          mensaje = objeto;
          break;
    
          default: mensaje = 'Ocurrio un error desconocido';
        }
    
        if (tipo === 'form-success'){
          toast.success(mensaje, { timeout: 5000 });
        }
        else {
          toast.error(mensaje, { timeout: 5000 });
        }
      }

      export { notificaciones }


