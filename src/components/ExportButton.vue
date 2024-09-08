<template>
    <button @click="exportPDF">Exportar a PDF</button>
</template>

<script>
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default {
    props: {
        columns: {
            type: Array,
            required: true
        },
        rows: {
            type: Array,
            required: true
        },
        fileName: {
            type: String,
            default: 'table.pdf'
        }
    },
    methods: {
        exportPDF() {
            const doc = new jsPDF();

            // Verificar que las filas y columnas se están recibiendo correctamente
            console.log('Exportando con columnas:', this.columns);
            console.log('Exportando con filas:', this.rows);

            doc.autoTable({
                head: [this.columns.map(col => col.header)], // Asigna los encabezados desde las columnas
                body: this.rows.map(row => Object.values(row)) // Genera el cuerpo desde las filas
            });

            doc.save(this.fileName);
        }
    }
};
</script>


<style scoped>
button {
    background-color: #4CAF50;
    color: white;
    padding: 10px 20px;
    border: none;
    cursor: pointer;
    margin-top: 15px;
    border-radius: 10px;
}

button:hover {
    background-color: #45a049;
}
</style>
