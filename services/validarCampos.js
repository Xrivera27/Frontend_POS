import { useToast } from "vue-toastification"; // Importación para el popup

export default {
  // Valida que un campo no esté vacío
  validarEmpty(form) {
    for ( const [key, value] of Object.entries(form) ){
      if ( value === '' || value === undefined || !value ){
        this.notificaciones('empty-campo', key);
        return false;
      }
      return true;

    }
  },

  // Valida que dos contraseñas coincidan
  validarPass(password1, password2) {
    return password1 === password2;
  },

  // Valida que el email pertenezca a un dominio aceptado
  validarEmail(email) {
    const emailPattern =
      /^[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.com|hotmail\.com)$/;
    return emailPattern.test(email);
  },

  // Valida que la contraseña tenga números, mayúsculas, minúsculas y caracteres especiales
  validarPasswordSegura(password) {
    const passwordPattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    return passwordPattern.test(password);
  },

  // Valida que el teléfono tenga 8 dígitos y sea numérico
  validarTelefono(telefono) {
    const phonePattern = /^(?:\d{8}|\d{4}-\d{4})$/;
    return phonePattern.test(telefono);
  },

  validarSiNumero(campo) {
    // Verifica si el campo coincide con la expresión regular de un número
    return /^[+-]?\d+(\.\d+)?$/.test(campo);
  },

  notificaciones(tipo, campo) {
    const toast = useToast();
    let mensaje;

    switch (tipo){
      case 'empty-campo': 
      mensaje = 'El campo ' + campo + ' esta vacio.' ;
      
      break;

      default: mensaje = 'Error al enviar formulario';
    }
    toast.error(mensaje, { timeout: 5000 });
    
  },

};
