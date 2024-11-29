import { notificaciones } from "./notificaciones.js";
import { COUNTRY_CODES } from "./countrySelector.js";

const validacionesComunes = {
  validarEmpty(campos) {
    for (const [campo, valor] of Object.entries(campos)) {
      if (
        valor === "" ||
        valor === undefined ||
        valor === null ||
        valor === "default"
      ) {
        // Verificar si el campo es un select por su nombre
        if (campo === "Rol" || campo === "Sucursal" || campo === "País") {
          notificaciones("empty-campo-select", campo);
        } else {
          notificaciones("empty-campo", campo);
        }
        return false;
      }
    }
    return true;
  },

  validarEmail(email) {
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!pattern.test(email)) {
      notificaciones("invalid-email");
      return false;
    }
    return true;
  },

  validarTelefono(telefono, codigoPais) {
    const numeroLimpio = telefono.replace(/[\s-]/g, "");
    const config = COUNTRY_CODES[codigoPais];

    if (!config) {
      notificaciones("pais-no-soportado");
      return false;
    }

    if (numeroLimpio.length !== config.length) {
      notificaciones(
        "invalid-phone",
        `El número debe tener ${config.length} dígitos para ${codigoPais}`
      );
      return false;
    }

    const soloNumeros = /^\d+$/.test(numeroLimpio);
    if (!soloNumeros) {
      notificaciones("invalid-phone", "El teléfono solo debe contener números");
      return false;
    }

    return true;
  },

  validarPass(password1, password2) {
    if (password1 !== password2) {
      notificaciones("diferent-password");
      return false;
    }
    return true;
  },

  validarPasswordSegura(password) {
    const pattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    if (!pattern.test(password)) {
      notificaciones("invalid-password");
      return false;
    }
    return true;
  },

  validarSelect(valor, campo) {
    if (!valor || valor === "default" || valor === "") {
      notificaciones("select-invalido", `Debe seleccionar un ${campo}`);
      return false;
    }
    return true;
  },
};

const validacionesUsuario = {
  validarCampos(form, isPassEdit, selectedCountry) {
    const campos = {
      Nombre: form.nombre,
      Apellido: form.apellido,
      "Nombre de Usuario": form.nombre_usuario,
      Correo: form.correo,
      Telefono: form.telefono,
      Direccion: form.direccion,
      Sucursal: form.sucursal,
      Rol: form.rol,
    };

    // Validar campos vacíos
    if (!validacionesComunes.validarEmpty(campos)) return false;

    // Validar selects
    if (!validacionesComunes.validarSelect(form.sucursal, "sucursal"))
      return false;
    if (!validacionesComunes.validarSelect(form.rol, "rol")) return false;

    // Validar nombre de usuario (alfanumérico y guiones bajos, 4-20 caracteres)
    const usernamePattern = /^[a-zA-Z0-9_]{4,20}$/;
    if (!usernamePattern.test(form.nombre_usuario)) {
      notificaciones("invalid-username");
      return false;
    }

    // Validar correo
    if (!validacionesComunes.validarEmail(campos.Correo)) return false;

    // Validar teléfono
    if (!validacionesComunes.validarTelefono(campos.Telefono, selectedCountry))
      return false;

    // Validar contraseña si es requerida
    if (isPassEdit) {
      if (!validacionesComunes.validarPass(form.password, form.confirmPassword))
        return false;
      if (!validacionesComunes.validarPasswordSegura(form.password))
        return false;
    }

    // Validar nombre y apellido (solo letras y espacios, mínimo 3 caracteres)
    const nombrePattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,}$/;
    if (!nombrePattern.test(form.nombre)) {
      notificaciones(
        "invalid-name",
        "El nombre debe contener solo letras y tener al menos 3 caracteres"
      );
      return false;
    }
    if (!nombrePattern.test(form.apellido)) {
      notificaciones(
        "invalid-name",
        "El apellido debe contener solo letras y tener al menos 3 caracteres"
      );
      return false;
    }

    return true;
  },
};

const validacionesCategorias = {
  validarCampos(form) {
    const campos = {
      Nombre: form.nombre_categoria,
      Descripción: form.descripcion,
    };

    // Validar campos vacíos
    if (!validacionesComunes.validarEmpty(campos)) return false;

    // Validar nombre
    const nombrePattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s]{3,50}$/;
    if (!nombrePattern.test(form.nombre_categoria)) {
      notificaciones("empty-campo", "Nombre");
      return false;
    }

    // Validar longitud de descripción
    if (form.descripcion.length < 10 || form.descripcion.length > 200) {
      notificaciones("descripcion-length");
      return false;
    }

    // Validar caracteres de descripción
    const descPattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s.,;:()\-_!¡¿?""'']+$/;
    if (!descPattern.test(form.descripcion)) {
      notificaciones("empty-campo", "Descripción");
      return false;
    }

    return true;
  },
};

const validacionesSucursal = {
  validarCampos(form, selectedCountry) {
    const campos = {
      Nombre: form.nombre_administrativo,
      Correo: form.correo,
      Telefono: form.telefono,
      Direccion: form.direccion,
    };

    if (!validacionesComunes.validarEmpty(campos)) return false;

    // Validar nombre (letras, números y espacios, 3-50 caracteres)
    const nombrePattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s]{3,50}$/;
    if (!nombrePattern.test(form.nombre_administrativo)) {
      notificaciones(
        "invalid-name",
        "El nombre debe tener entre 3 y 50 caracteres"
      );
      return false;
    }

    // Validar correo
    if (!validacionesComunes.validarEmail(form.correo)) return false;

    // Validar teléfono
    if (!validacionesComunes.validarTelefono(form.telefono, selectedCountry))
      return false;

    return true;
  },
};

const validacionesProductos = {
  validarCampos(form) {
    const campos = {
      Código: form.codigo_producto,
      Nombre: form.nombre,
      Descripción: form.descripcion,
      "Unidad de Medida": form.unidad_medida,
      Impuesto: form.impuesto,
      Proveedor: form.proveedor,
      "Precio Unitario": form.precio_unitario,
      "Precio Mayorista": form.precio_mayorista,
      "Cantidad Mayoreo": form.cantidad_activar_mayorista,
      Categoría: form.categoria,
    };

    // Validar campos vacíos
    if (!validacionesComunes.validarEmpty(campos)) return false;

    // Validar selects
    if (
      !validacionesComunes.validarSelect(form.unidad_medida, "unidad de medida")
    )
      return false;
    if (!validacionesComunes.validarSelect(form.proveedor, "proveedor"))
      return false;
    if (!validacionesComunes.validarSelect(form.impuesto, "impuesto"))
      return false;

    // Validar código de producto (alfanumérico, sin espacios, entre 3-20 caracteres)
    const codigoPattern = /^[a-zA-Z0-9-_]{3,20}$/;
    if (!codigoPattern.test(form.codigo_producto)) {
      notificaciones(
        "invalid-code",
        "El código debe contener entre 3 y 20 caracteres alfanuméricos, guiones o guiones bajos"
      );
      return false;
    }

    // Validar nombre (letras, números y espacios, 3-50 caracteres)
    const nombrePattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s]{3,50}$/;
    if (!nombrePattern.test(form.nombre)) {
      notificaciones(
        "invalid-name",
        "El nombre debe tener entre 3 y 50 caracteres y solo puede contener letras, números y espacios"
      );
      return false;
    }

    // Validar descripción (longitud)
    if (form.descripcion.length < 10 || form.descripcion.length > 200) {
      notificaciones(
        "descripcion-length",
        "La descripción debe tener entre 10 y 200 caracteres"
      );
      return false;
    }

    // Validar caracteres permitidos en la descripción
    const descPattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s.,;:()\-_!¡¿?""'']+$/;
    if (!descPattern.test(form.descripcion)) {
      notificaciones(
        "invalid-description",
        "La descripción contiene caracteres no permitidos"
      );
      return false;
    }

    // Validar precios y cantidades (números positivos)
    if (!this.validarPrecios(form)) return false;

    // Validar que el precio mayorista sea menor que el precio unitario
    if (parseFloat(form.precio_mayorista) >= parseFloat(form.precio_unitario)) {
      notificaciones("invalid-price-may-uni");
      return false;
    }

    // Validar cantidad mínima para mayoreo (número entero positivo)
    if (
      !Number.isInteger(Number(form.cantidad_activar_mayorista)) ||
      Number(form.cantidad_activar_mayorista) <= 0
    ) {
      notificaciones("invalid-quantity");
      return false;
    }

    return true;
  },

  validarPrecios(form) {
    // Validar que los precios sean números positivos
    const precios = {
      "Precio Unitario": form.precio_unitario,
      "Precio Mayorista": form.precio_mayorista,
    };

    for (const [valor] of Object.entries(precios)) {
      // Convertir a número y validar
      const precio = parseFloat(valor);
      if (isNaN(precio) || precio <= 0) {
        notificaciones("invalid-price");
        return false;
      }

      // Validar que tenga máximo 2 decimales
      if (!/^\d+(\.\d{1,2})?$/.test(valor)) {
        notificaciones("invalid-price-decimal");
        return false;
      }
    }

    return true;
  },

  validarCategorias(categorias) {
    // Validar que exista el array de categorías
    if (!Array.isArray(categorias)) {
      notificaciones("invalid-categories", "No se han definido las categorías");
      return false;
    }

    // Validar que tenga al menos un objeto
    if (categorias.length === 0) {
      notificaciones(
        "empty-categories",
        "Debe seleccionar al menos una categoría"
      );
      return false;
    }

    return true;
  },
};

export {
  validacionesComunes,
  validacionesUsuario,
  validacionesCategorias,
  validacionesSucursal,
  validacionesProductos,
};
