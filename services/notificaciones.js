import { useToast } from "vue-toastification";

function notis(tipo, mensaje) {
  const toast = useToast();

  switch (tipo) {
    case "error":
      toast.error(mensaje, { timeout: 5000 });
      break;
    case "success":
      toast.success(mensaje, { timeout: 5000 });
      break;
    case "warning":
      toast.warning(mensaje, { timeout: 5000 });
      break;
    case "info":
      toast.info(mensaje, { timeout: 5000 });
      break;
    default:
      toast.error(mensaje, { timeout: 5000 });
  }
}

function notificaciones(tipo, objeto = "") {
  const toast = useToast();
  let mensaje;

  switch (tipo) {
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

export { notificaciones, notis };
