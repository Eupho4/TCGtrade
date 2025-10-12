const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Servir archivos estáticos desde la raíz
app.use(express.static('.'));

// Servir el HTML principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'index.html'));
});

// Servir archivos CSS y JS
app.get('/css/:file', (req, res) => {
    res.sendFile(path.join(__dirname, req.params.file));
});

app.get('/js/:file', (req, res) => {
    res.sendFile(path.join(__dirname, 'js', req.params.file));
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    console.log(`📁 Sirviendo archivos desde: ${__dirname}`);
});