import { useToast } from "vue-toastification";

function notificaciones(tipo, objeto = "") {
  const toast = useToast();
  let mensaje;

  switch (tipo) {
    case "empty-campo":
      mensaje = "El campo " + objeto + " está vacío.";
      break;

    case "invalid-password":
      mensaje = "La contraseña no cumple con los requisitos de seguridad";
      break;

    case "diferent-password":
      mensaje = "Las contraseñas no coinciden";
      break;

    case "campo-no-numerico":
      mensaje = "El campo " + objeto + " tiene que ser numerico";
      break;

    case "invalid-phone":
      mensaje = "El teléfono no es válido";
      break;

    case "invalid-rtn":
      mensaje = "El RTN no es válido";
      break;

    case "invalid-email":
      mensaje = "El correo no es válido";
      break;

    case "sin-numeros":
      mensaje = "El campo " + objeto + " tiene que ser numérico";
      break;

    case "form-success":
      mensaje = "Procesando guardado...";
      break;

      case "success":
      mensaje = "Actualizando datos...";
      break;

      case "venta-guardada":
      mensaje = "Guardando Venta...";
      break;

    case "error":
      mensaje = objeto;
      break;

    default:
      mensaje = "Ocurrio un error desconocido";
  }

  if (tipo === "form-success" || tipo === "success" || tipo === "venta-guardada") {
    toast.success(mensaje, { timeout: 5000 });
  } else {
    toast.error(mensaje, { timeout: 5000 });
  }
}

export { notificaciones };
