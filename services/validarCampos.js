import { notificaciones } from "./notificaciones.js";
import validator from "validator";
import { parsePhoneNumberFromString } from "libphonenumber-js";

export default {
  // Valida que un campo no esté vacío
  validarEmpty(form) {
    for (const [key, value] of Object.entries(form)) {
      if (validator.isEmpty(value || "", { ignore_whitespace: true })) {
        notificaciones("empty-campo", key);
        return false;
      }
    }
    return true;
  },

  // Valida que dos contraseñas coincidan
  validarPass(password1, password2) {
    if (password1 !== password2) {
      notificaciones("diferent-password");
      return false;
    }
    return true;
  },

  // Valida que el email pertenezca a dominios específicos
  validarEmail(email) {
    if (!validator.isEmail(email)) {
      notificaciones("invalid-email");
      return false;
    }
    return true;
  },

  // Valida que la contraseña sea segura
  validarPasswordSegura(password) {
    const strongPasswordOptions = {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,

      minSymbols: 1,
    };
    if (!validator.isStrongPassword(password, strongPasswordOptions)) {
      notificaciones("invalid-password");
      return false;
    }
    return true;
  },

  // Valida el teléfono con libphonenumber-js
  validarTelefono(telefono, codigoPais) {
    const numero = parsePhoneNumberFromString(telefono, codigoPais);
    if (!numero || !numero.isValid()) {
      notificaciones("invalid-phone");
      return false;
    }
    return true;
  },

  // Valida que un campo no contenga letras
  validarSinLetras(campo, nombreCampo) {
    if (!validator.isNumeric(campo, { no_symbols: true })) {
      notificaciones("campo-no-numerico", nombreCampo);
      return false;
    }
    return true;
  },

  // Valida que el campo contenga al menos un número
  validarContieneNumeros(campo, nombreCampo) {
    if (!/\d/.test(campo)) {
      notificaciones("sin-numeros", nombreCampo);
      return false;
    }
    return true;
  },

  // Valida que el RTN contenga solo números, espacios o guiones
  validarRTN(rtn) {
    if (!/^[\d\s-]+$/.test(rtn)) {
      notificaciones("invalid-rtn");
      return false;
    }
    return true;
  },

  formSuccess() {
    notificaciones("form-success");
  },

  // Valida si el campo es un número (enteros o decimales)
  validarSiNumero(campo) {
    if (!validator.isNumeric(campo.toString(), { no_symbols: false })) {
      notificaciones("invalid-number");
      return false;
    }
    return true;
  },
};
