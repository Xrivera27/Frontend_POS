export default {
  // Valida que un campo no esté vacío
  validarEmpty(form) {
    const campos = Object.values(form);
    return campos.every((campo) => {
      // Verifica si el campo es un string y no está vacío
      if (typeof campo === "string") {
        return campo.trim() !== "";
      }
      // Verifica si el campo es un valor de selección (select)
      if (typeof campo === "number" || typeof campo === "string") {
        return campo !== "" && campo !== null; // Cambia '' por el valor que consideres como "no seleccionado"
      }
      return campo !== null && campo !== undefined; // Asegúrate de que no sea null o undefined
    });
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
    const phonePattern = /^\d{8}$/;
    return phonePattern.test(telefono);
  },

  validarSiNumero(campo) {
    // Verifica si el campo coincide con la expresión regular de un número
    return /^[+-]?\d+(\.\d+)?$/.test(campo);
  }
};
