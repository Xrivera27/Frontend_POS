import { useToast } from "vue-toastification";

function notificaciones(tipo, objeto = "") {
  const toast = useToast();
  let mensaje;

  switch (tipo) {
    case "empty-campo":
      mensaje = "El campo " + objeto + " está vacío.";
      break;

    case "empty-campo-select":
      mensaje = "Escoja una opción en: " + objeto;
      break;

    case "invalid-password":
      mensaje = "La contraseña no cumple con los requisitos de seguridad";
      break;

    case "invalid-name":
      mensaje = "El nombre debe tener entre 3 y 50 caracteres";
      break;

    case "invalid-username":
      mensaje =
        "El nombre de usuario debe tener entre 4 y 20 caracteres y solo puede contener letras, números y guiones bajos";
      break;

    case "invalid-price":
      mensaje = objeto + " debe ser un número positivo mayor a cero";
      break;

    case "invalid-quantity":
      mensaje =
        "La cantidad para activar precio mayorista debe ser un número entero positivo";
      break;

    case "invalid-price-may-uni":
      mensaje = "El precio mayorista debe ser menor que el precio unitario";
      break;

    case "invalid-price-decimal":
      mensaje = objeto + " debe tener máximo 2 decimales";
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

    case "descripcion-length":
       mensaje =  "La descripción debe tener entre 10 y 200 caracteres";
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

  if (
    tipo === "form-success" ||
    tipo === "success" ||
    tipo === "venta-guardada"
  ) {
    toast.success(mensaje, { timeout: 5000 });
  } else {
    toast.error(mensaje, { timeout: 5000 });
  }
}

export { notificaciones };
