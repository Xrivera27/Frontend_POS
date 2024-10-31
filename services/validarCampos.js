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
    if ( password1 !== password2 ){
      this.notificaciones('diferent-password');
    }
    
    return password1 === password2;
  },

  // Valida que el email pertenezca a un dominio aceptado
  validarEmail(email) {
    const emailPattern =
      /^[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.com|hotmail\.com)$/;

      if ( !emailPattern.test(email) ){
        this.notificaciones('invalid-email');
      }
    return emailPattern.test(email);
  },

  // Valida que la contraseña tenga números, mayúsculas, minúsculas y caracteres especiales
  validarPasswordSegura(password) {
    const passwordPattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

      if ( !passwordPattern.test(password) ){
        this.notificaciones('invalid-password');
      }

    return passwordPattern.test(password);
  },

  // Valida que el teléfono tenga 8 dígitos y sea numérico
  validarTelefono(telefono) {
    const phonePattern = /^(?:\d{8}|\d{4}-\d{4})$/;
    if ( !phonePattern.test(telefono) ){
      this.notificaciones('invalid-phone');
    }
    return phonePattern.test(telefono);
  },

  formSuccess(){
    this.notificaciones('form-success');
  },

  validarSiNumero(campo) {
    return /^[+-]?\d+(\.\d+)?$/.test(campo);
  },

  notificaciones(tipo, campo = '') {
    const toast = useToast();
    let mensaje;

    switch (tipo){
      case 'empty-campo': 
      mensaje = 'El campo ' + campo + ' esta vacio.' ;
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

      default: mensaje = 'Error al enviar formulario';
    }

    if (tipo === 'form-success'){
      toast.success(mensaje, { timeout: 5000 });
    }
    else {
      toast.error(mensaje, { timeout: 5000 });
    }

    
    
  },

};
