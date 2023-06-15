const express = require("express");
const router = express.Router();
const supabase=require("../config")
const bcrypt = require("bcryptjs");


// Insertar nota
router.post("/notas/insertar-nota", async (req, res) => {
    const { titulo, cuerpo, fecha, id_usuario } =
      req.body;
  
   console.log("backenddddd"+titulo+cuerpo+fecha+id_usuario)
    try {
      const { data, error } = await supabase
        .from("notas")
        .insert([
          {
            titulo, cuerpo, fecha, id_usuario
          },
        ])
        .single();
  
      if (error) {
        console.error(error);
        return res.sendStatus(500); // Devuelve un código de estado 500 si hay algún error
      }
  
      const notas = data;
  
      res.send(notas);
    } catch (error) {
      console.error(error);
      res.sendStatus(500); // Devuelve un código de estado 500 si hay algún error
    }
  });

  //obtener lista de citas
  router.get("/notas/getNotas/:id_usuario", async (req, res) => {
    const id_usuario = req.params.id_usuario;
  
    try {
      const [notasResult] = await Promise.all([
        supabase
          .from("notas")
          .select("*")
          .eq("id_usuario", id_usuario),
      ]);
  
      const notas = notasResult.data;
  
      res.send(notas);
    } catch (error) {
      console.error(error);
      res.sendStatus(500); // Devuelve un código de estado 500 si hay algún error
    }
  });

//Editar nota
router.put("/notas/:id_notas", async (req, res) => {
    try {
      const id = req.params.id_notas;
      const { titulo, cuerpo,color } = req.body;
      console.log("id backend  "+id,cuerpo,titulo)
      // eslint-disable-next-line no-console
      console.log(id);
      const { data, error } = await supabase
        .from("notas")
        .update({ titulo, cuerpo,color })
        .eq("id_notas", id)
        .single();
  
      if (error) {
        console.error(error);
        res
          .status(500)
          .json({ mensaje: "Error en la consulta de actualización" });
      } else {
        res.status(200).json({ mensaje: "Nota actualizada correctamente" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensaje: "Error interno del servidor" });
    }
  });


  router.delete("/notas/borrar-notas/:id_notas", async (req, res) => {
    try {
      const id = req.params.id_notas;

      const { data, error } = await supabase
        .from("notas")
        .delete()
        .eq("id_notas", id);
        console.log(id)
       
  
      if (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error interno del servidor" });
      } else {
        res.status(200).json({ mensaje: "Nota eliminada correctamente" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensaje: "Error interno del servidor" });
    }
  });
  
// Endpoint para insertar la nota y enviarla a otro usuario
router.post('/notas/enviar-nota/:id_notas', async (req, res) => {
  try {
    const { userEmail } = req.body; // Obtener el email del usuario a través del cuerpo de la solicitud
    const notaId = req.params.id_notas; // Obtener el ID de la nota de los parámetros de la URL
console.log(notaId)
    // Buscar al usuario en Supabase por su email
    const { data: users, error: userError } = await supabase
      .from('usuario')
      .select('*')
      .eq('email', userEmail)
      .limit(1);

    if (userError) {
      throw new Error('Error al buscar el usuario en Supabase');
    }

    if (users.length === 0) {
      throw new Error('No se encontró un usuario con el email proporcionado');
    }

    const user = users[0]; // Obtener el usuario encontrado
console.log (user)
    // Obtener la nota por su ID
    const { data: notaData, error: notaError } = await supabase
    .from('notas')
    .select('*')
    .eq('id_notas', notaId);
console.log("nota "+notaData)
    if (notaError) {
      throw new Error('Error al buscar la nota en Supabase');
    }

    if (notaData.length === 0) {
      throw new Error('No se encontró una nota con el ID proporcionado');
    }

    const nota = notaData[0]; // Obtener la nota encontada
console.log(nota)
    // Insertar la nota asociada a ese usuario en Supabase
    const { data: newNote, error: insertError } = await supabase
      .from('notas')
      .insert([{ id_usuario: user.id_usuario, cuerpo: nota.cuerpo,titulo: nota.titulo, fecha:nota.fecha, nombre_usuario: user.nombre }])
      .single();

    if (insertError) {
      throw new Error('Error al insertar la nota en Supabase');
    }

    res.status(200).json({ message: 'Nota insertada correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


  module.exports = router;
  