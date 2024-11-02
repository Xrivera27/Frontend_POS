import { notificaciones } from "./notificaciones.js";

export default {
  // Valida que un campo no esté vacío
  validarEmpty(form) {
    console.log("Validando formulario:", form); // Ver el objeto completo
    for (const [key, value] of Object.entries(form)) {
      console.log(`Validando campo: ${key}, valor: ${value}`); // Ver cada campo y su valor
      if (
        value === "" || // Campo vacío
        value === undefined || // Campo indefinido
        value === null || // Campo nulo
        value === "default" || // Valor por defecto de un select
        !value // Cualquier valor falsy
      ) {
        notificaciones("empty-campo", key); // Notifica el error
        return false; // Retorna false si hay un campo vacío
      }
    }
    return true; // Retorna true si todos los campos son válidos
  },

  // Valida que dos contraseñas coincidan
  validarPass(password1, password2) {
    if (password1 !== password2) {
      notificaciones("diferent-password");
    }

    return password1 === password2;
  },

  // Valida que el email pertenezca a un dominio aceptado
  validarEmail(email) {
    const emailPattern =
      /^[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.com|hotmail\.com)$/;

    if (!emailPattern.test(email)) {
      notificaciones("invalid-email");
    }
    return emailPattern.test(email);
  },

  // Valida que la contraseña tenga números, mayúsculas, minúsculas y caracteres especiales
  validarPasswordSegura(password) {
    const passwordPattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

    if (!passwordPattern.test(password)) {
      notificaciones("invalid-password");
    }

    return passwordPattern.test(password);
  },

  // Valida que el teléfono tenga 8 dígitos y sea numérico
  validarTelefono(telefono) {
    const phonePattern = /^(?:\d{8}|\d{4}-\d{4})$/;
    if (!phonePattern.test(telefono)) {
      notificaciones("invalid-phone");
    }
    return phonePattern.test(telefono);
  },

  validarSinLetras(campo, nombreCampo) {
    const soloNumerosPattern = /^\d+$/; // Expresión regular que permite solo dígitos
    if (!soloNumerosPattern.test(campo)) {
      notificaciones("campo-no-numerico", nombreCampo);
      return false;
    }
    return true;
  },

  // Valida que el campo contenga al menos un número
  validarContieneNumeros(campo, nombreCampo) {
    const contieneNumerosPattern = /\d/; // Expresión regular que busca al menos un dígito
    if (!contieneNumerosPattern.test(campo)) {
      notificaciones("sin-numeros", nombreCampo); // Envía el nombre del campo
      return false; // Retorna false si no contiene números
    }
    return true; // Retorna true si contiene números
  },

  validarRTN(rtn) {
    const rtnPattern = /^[\d\s-]+$/; // Permite solo números, espacios y guiones
    if (!rtnPattern.test(rtn)) {
      notificaciones("invalid-rtn");
    }
    return rtnPattern.test(rtn);
  },

  formSuccess() {
    notificaciones("form-success");
  },

  validarSiNumero(campo) {
    return /^[+-]?\d+(\.\d+)?$/.test(campo);
  },
};
