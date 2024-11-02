import { notificaciones } from './notificaciones.js';

export default {
  // Valida que un campo no esté vacío
  validarEmpty(form) {
    for ( const [key, value] of Object.entries(form) ){
      if ( value === '' || value === undefined || !value ){
        notificaciones('empty-campo', key);
        return false;
      }
      return true;

    }
  },

  // Valida que dos contraseñas coincidan
  validarPass(password1, password2) {
    if ( password1 !== password2 ){
      notificaciones('diferent-password');
    }
    
    return password1 === password2;
  },

  // Valida que el email pertenezca a un dominio aceptado
  validarEmail(email) {
    const emailPattern =
      /^[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.com|hotmail\.com)$/;

      if ( !emailPattern.test(email) ){
        notificaciones('invalid-email');
      }
    return emailPattern.test(email);
  },

  // Valida que la contraseña tenga números, mayúsculas, minúsculas y caracteres especiales
  validarPasswordSegura(password) {
    const passwordPattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

      if ( !passwordPattern.test(password) ){
        notificaciones('invalid-password');
      }

    return passwordPattern.test(password);
  },

  // Valida que el teléfono tenga 8 dígitos y sea numérico
  validarTelefono(telefono) {
    const phonePattern = /^(?:\d{8}|\d{4}-\d{4})$/;
    if ( !phonePattern.test(telefono) ){
      notificaciones('invalid-phone');
    }
    return phonePattern.test(telefono);
  },

  formSuccess(){
    notificaciones('form-success');
  },

  validarSiNumero(campo) {
    return /^[+-]?\d+(\.\d+)?$/.test(campo);
  },

};
