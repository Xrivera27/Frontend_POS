import { notis } from "./notificaciones.js";
import { COUNTRY_CODES } from "./countrySelector.js";
import solicitudes from "./solicitudes.js";

const validacionesComunes = {
  validarEmpty(campos) {
    const camposPresentes = Object.keys(campos);

    for (const nombreCampo of camposPresentes) {
      const valor = campos[nombreCampo];
      if (
        valor === "" ||
        valor === undefined ||
        valor === null ||
        valor === "default"
      ) {
        notis("warning", "El campo " + nombreCampo + " está vacío");
        return false;
      }
    }
    return true;
  },

  validarRTN(rtn) {
    const soloNumeros = /^\d+$/.test(rtn);
    if (!soloNumeros || rtn.length !== 14) {
      notis("warning", "RTN inválido");
      return false;
    }
    return true;
  },

  validarSelect(valor, campo) {
    if (
      !valor ||
      valor === "default" ||
      valor === undefined ||
      valor === null ||
      valor === ""
    ) {
      notis("warning", `Debe seleccionar: ${campo}`);
      return false;
    }
    return true;
  },

  validarNombre(nombre) {
    const caracteresPattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!caracteresPattern.test(nombre)) {
      notis("warning", `El nombre tiene caracteres no permitidos`);
      return false;
    }

    if (nombre.length < 3 || nombre.length > 50) {
      notis("warning", `El nombre debe tener entre 3 y 50 caracteres`);
      return false;
    }

    return true;
  },

  validarDireccion(direccion) {
    if (direccion.length < 10 || direccion.length > 150) {
      notis("warning", `La direccion debe tener entre 10 y 150 caracteres`);
      return false;
    }

    return true;
  },

  validarNumero(valor, campo) {
    if (isNaN(valor)) {
      notis("warning", `El campo ${campo} debe ser un número`);
      return false;
    }
    return true;
  },

  validarEmail(email) {
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!pattern.test(email)) {
      console.log("Correo inválido");
      notis("warning", "El correo electrónico ingresado no es válido");
      return false;
    }
    return true;
  },

  validarDescripcion(descripcion) {
    const descPattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s.,;:()\-_!¡¿?""'']+$/;
    if (!descPattern.test(descripcion)) {
      notis("warning", "La descripción contiene caracteres no permitidos");
      return false;
    }

    if (descripcion.length < 10 || descripcion.length > 200) {
      notis("warning", "La descripción debe tener entre 10 y 200 caracteres");
      return false;
    }

    return true;
  },

  validarTelefono(telefono, codigoPais) {
    const numeroLimpio = telefono.replace(/[\s-]/g, "");
    const config = COUNTRY_CODES[codigoPais];

    if (!config) {
      notis("warning", "País no soportado");
      return false;
    }

    const soloNumeros = /^\d+$/.test(numeroLimpio);
    if (!soloNumeros) {
      notis("warning", "El teléfono solo debe contener números");
      return false;
    }

    if (numeroLimpio.length !== config.length) {
      notis(
        "warning",
        `El teléfono debe tener ${config.length} dígitos para ${codigoPais}`
      );
      return false;
    }

    return true;
  },

  validarPass(password1, password2) {
    if (password1 !== password2) {
      notis("warning", "Las contraseñas no coinciden");
      return false;
    }
    return true;
  },

  validarPasswordSegura(password) {
    const pattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    if (!pattern.test(password)) {
      notis(
        "warning",
        "La contraseña no cumple con los requisitos de seguridad"
      );
      return false;
    }
    return true;
  },
};

const validacionesUsuario = {
  async validarDuplicados(form, isEditing = false) {
    try {
      const parametros = `/usuario/validar${
        isEditing ? "/" + form.id_usuario : ""
      }`;
      const response = await solicitudes.postRegistro(parametros, {
        nombre_usuario: form.nombre_usuario,
        correo: form.correo,
      });

      if (response && response.error) {
        notis("error", response.error);
        return false;
      }

      if (response && response.duplicados) {
        if (response.duplicados.includes("nombre_usuario")) {
          notis(
            "warning",
            "El nombre de usuario ya está registrado en el sistema"
          );
          return false;
        }
        if (response.duplicados.includes("correo")) {
          notis(
            "warning",
            "El correo electrónico ya está registrado en el sistema"
          );
          return false;
        }
      }

      return true;
    } catch (error) {
      notis("error", "Error al validar la información del usuario");
      return false;
    }
  },

  async validarCampos(form, isPassEdit, selectedCountry, isEditing = false) {
    const campos = {
      Nombre: form.nombre,
      Apellido: form.apellido,
      "Nombre de Usuario": form.nombre_usuario,
      Correo: form.correo,
      Rol: form.rol,
      Contraseña: form.password,
      "Confirmar Contraseña": form.confirmPassword,
      Telefono: form.telefono,
      Direccion: form.direccion,
      Sucursal: form.sucursal,
    };

    const campos2 = {
      Nombre: form.nombre,
      Apellido: form.apellido,
      "Nombre de Usuario": form.nombre_usuario,
      Correo: form.correo,
      Rol: form.rol,
      Telefono: form.telefono,
      Direccion: form.direccion,
      Sucursal: form.sucursal,
    };

    if (isPassEdit) {
      if (!validacionesComunes.validarEmpty(campos)) return false;
    } else {
      if (!validacionesComunes.validarEmpty(campos2)) return false;
    }

    if (!validacionesComunes.validarNombre(campos.Nombre)) return false;

    const nombrePattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,50}$/;
    if (!nombrePattern.test(form.apellido)) {
      notis(
        "warning",
        "El apellido debe contener solo letras y tener al menos 3 caracteres"
      );
      return false;
    }

    const usernamePattern = /^[a-zA-Z0-9_]+$/;
    if (!usernamePattern.test(campos["Nombre de Usuario"])) {
      notis(
        "warning",
        "El nombre de usuario solo puede contener letras, números y guiones bajos"
      );
      return false;
    }
    if (
      campos["Nombre de Usuario"].length < 3 ||
      campos["Nombre de Usuario"].length > 50
    ) {
      notis(
        "warning",
        "El nombre de usuario debe tener entre al menos 3 caracteres"
      );
      return false;
    }

    if (!validacionesComunes.validarEmail(campos.Correo)) return false;

    // Validar duplicados
    if (!(await this.validarDuplicados(form, isEditing))) return false;

    if (!validacionesComunes.validarSelect(campos.Rol, "Rol")) return false;

    if (isPassEdit) {
      if (!validacionesComunes.validarPasswordSegura(campos.Contraseña))
        return false;
      if (
        !validacionesComunes.validarPass(
          campos.Contraseña,
          campos["Confirmar Contraseña"]
        )
      )
        return false;
    }

    if (!validacionesComunes.validarTelefono(campos.Telefono, selectedCountry))
      return false;

    if (!validacionesComunes.validarDireccion(campos.Direccion)) return false;

    if (!validacionesComunes.validarSelect(campos.Sucursal, "Sucursal"))
      return false;

    return true;
  },
};

const validacionesCategorias = {
  validarCampos(form) {
    const campos = {
      Nombre: form.nombre_categoria,
      Descripción: form.descripcion,
    };

    if (!validacionesComunes.validarEmpty(campos)) return false;

    if (!validacionesComunes.validarNombre(campos.Nombre)) return false;

    if (!validacionesComunes.validarDescripcion(campos.Descripción))
      return false;

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

    if (!validacionesComunes.validarNombre(campos.Nombre)) return false;
    if (!validacionesComunes.validarEmail(campos.Correo)) return false;

    if (!validacionesComunes.validarTelefono(campos.Telefono, selectedCountry))
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
      Impuesto: form.impuesto,
      Proveedor: form.proveedor,
      "Precio Unitario": form.precio_unitario,
      "Precio Mayorista": form.precio_mayorista,
      "Cantidad Mayoreo": form.cantidad_activar_mayorista,
      "Unidad de Medida": form.unidad_medida,
    };

    if (!validacionesComunes.validarEmpty(campos)) return false;

    const longitudPattern = /^.{3,20}$/;
    const alfanumericoPattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s]+$/;

    if (!longitudPattern.test(campos.Código)) {
      notis("warning", "El código debe contener entre 3 y 20 caracteres.");
      return false;
    }

    if (!alfanumericoPattern.test(campos.Código)) {
      notis("warning", "El código tiene caracteres no permitidos");
      return false;
    }

    const nombrePattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-()]+$/;
    if (!nombrePattern.test(campos.Nombre)) {
      notis(
        "warning",
        "El nombre solo puede contener letras, números, guiones y paréntesis"
      );
      return false;
    }

    if (!validacionesComunes.validarDescripcion(campos.Descripción))
      return false;

    if (!validacionesComunes.validarSelect(campos.Impuesto, "Impuesto"))
      return false;

    if (!validacionesComunes.validarSelect(campos.Proveedor, "Proveedor"))
      return false;

    if (
      !validacionesComunes.validarNumero(
        campos["Precio Unitario"],
        "Precio Unitario"
      )
    )
      return false;

    if (
      !validacionesComunes.validarNumero(
        campos["Precio Mayorista"],
        "Precio Mayorista"
      )
    )
      return false;

    if (
      parseFloat(campos["Precio Mayorista"]) >=
      parseFloat(campos["Precio Unitario"])
    ) {
      notis(
        "warning",
        "El precio mayorista debe ser menor que el precio unitario"
      );
      return false;
    }

    if (
      !Number.isInteger(Number(campos["Cantidad Mayoreo"])) ||
      Number(campos["Cantidad Mayoreo"]) <= 0
    ) {
      notis(
        "warning",
        "La cantidad para activar precio mayorista debe ser un número entero positivo"
      );
      return false;
    }

    if (
      !validacionesComunes.validarSelect(
        campos["Unidad de Medida"],
        "unidad de medida"
      )
    )
      return false;

    return true;
  },

  validarCategorias(categorias) {
    if (!Array.isArray(categorias)) {
      notis("warning", "No se han definido las categorías");
      return false;
    }

    if (categorias.length === 0) {
      notis("warning", "Debe seleccionar al menos una categoría");
      return false;
    }

    return true;
  },
};

const validacionesClientes = {
  validarCampos(form, selectedCountry) {
    const campos = {
      Nombre: form.nombre_completo,
      Correo: form.correo,
      Direccion: form.direccion,
      Telefono: form.telefono,
      RTN: form.rtn,
    };

    if (!validacionesComunes.validarEmpty(campos)) return false;
    if (!validacionesComunes.validarNombre(campos.Nombre)) return false;
    if (!validacionesComunes.validarEmail(campos.Correo)) return false;
    if (!validacionesComunes.validarDireccion(campos.Direccion)) return false;
    if (!validacionesComunes.validarTelefono(campos.Telefono, selectedCountry))
      return false;
    if (!validacionesComunes.validarRTN(campos.RTN)) return false;

    return true;
  },
};

const validacionesProveedores = {
  validarCampos(form, selectedCountry) {
    const campos = {
      Nombre: form.nombre,
      Telefono: form.telefono,
      Correo: form.correo,
      Direccion: form.direccion,
    };

    if (!validacionesComunes.validarEmpty(campos)) return false;
    if (!validacionesComunes.validarNombre(campos.Nombre)) return false;
    if (!validacionesComunes.validarTelefono(campos.Telefono, selectedCountry))
      return false;
    if (!validacionesComunes.validarEmail(campos.Correo)) return false;
    if (!validacionesComunes.validarDireccion(campos.Direccion)) return false;

    return true;
  },
};

const validacionesConfigPage = {
  validarCamposConfiguracion(form, isPassEdit, selectedCountry) {
    const campos = {
      "Nombre de usuario": form.nombre_usuario,
      Telefono: form.telefono,
      Direccion: form.direccion,
    };

    // Validaciones básicas siempre
    if (!validacionesComunes.validarEmpty(campos)) return false;

    const usernamePattern = /^[a-zA-Z0-9_]+$/;
    if (!usernamePattern.test(campos["Nombre de usuario"])) {
      notis(
        "warning",
        "El nombre de usuario solo puede contener letras, números y guiones bajos"
      );
      return false;
    }

    if (
      campos["Nombre de usuario"].length < 3 ||
      campos["Nombre de usuario"].length > 50
    ) {
      notis(
        "warning",
        "El nombre de usuario debe tener entre al menos 3 caracteres"
      );
      return false;
    }

    if (!validacionesComunes.validarTelefono(campos.Telefono, selectedCountry))
      return false;
    if (!validacionesComunes.validarDireccion(campos.Direccion)) return false;

    // Solo validar contraseñas si isPassEdit es true
    if (isPassEdit) {
      // Agregar campos de contraseña al objeto campos solo si estamos en modo edición de contraseña
      campos.Contraseña = form.contraseña;
      campos["Contraseña nueva"] = form.contraseña_nueva;
      campos["Confirmar contraseña"] = form.contraseña_confirm;

      // Validar que los campos no estén vacíos
      if (!validacionesComunes.validarEmpty(campos)) return false;

      // Validar la contraseña nueva
      if (
        !validacionesComunes.validarPasswordSegura(campos["Contraseña nueva"])
      )
        return false;

      // Validar que las contraseñas coincidan
      if (
        !validacionesComunes.validarPass(
          campos["Contraseña nueva"],
          campos["Confirmar contraseña"]
        )
      )
        return false;
    }

    return true;
  },

  validarCamposConfiguracionAvanzada(form) {
    const campos = {
      Nombre: form.nombre,
      Apellido: form.apellido,
      Correo: form.correo,
    };

    if (!validacionesComunes.validarEmpty(campos)) return false;

    if (!validacionesComunes.validarNombre(campos.Nombre)) return false;

    const nombrePattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,50}$/;
    if (!nombrePattern.test(form.apellido)) {
      notis(
        "warning",
        "El apellido debe contener solo letras y tener al menos 3 caracteres"
      );
      return false;
    }

    if (!validacionesComunes.validarEmail(campos.Correo)) return false;

    return true;
  },
};

export {
  validacionesComunes,
  validacionesUsuario,
  validacionesCategorias,
  validacionesSucursal,
  validacionesProductos,
  validacionesClientes,
  validacionesProveedores,
  validacionesConfigPage,
};
