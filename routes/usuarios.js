const express = require("express");
const router = express.Router();
const supabase = require("../config")
const bcrypt = require("bcryptjs");
/// Insertar usuario
router.post("/usuarios/usuario", async (req, res) => {
  const {
    nombre,
    apellidos,
    email,
    contrasenya,
  } = req.body;

  // Verificar si ya existe un usuario con el mismo correo electrónico
  const { data: emailExists, error: emailExistsError } = await supabase
    .from("usuario")
    .select("count", { count: "exact" })
    .eq("email", email)
    .single();

  if (emailExistsError) {
    console.error("Error al verificar el correo electrónico", emailExistsError);
    return res
      .status(500)
      .send(JSON.stringify({ message: "Error interno del servidor" }));
  }

  if (emailExists.count > 0) {
    // Si el correo electrónico ya existe, mostrar un mensaje de error
    return res
      .status(400)
      .send(
        JSON.stringify({ message: "El correo electrónico ya está en uso" })
      );
  }

  // Verificar que el correo electrónico contenga un "@"
  if (!email.includes("@")) {
    return res
      .status(400)
      .send(JSON.stringify({ message: "El correo electrónico no es válido" }));
  }

  // Verificar que la contraseña tenga al menos 8 caracteres con mayúsculas, minúsculas y un carácter especial
  if (
    !/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}/.test(
      contrasenya
    )
  ) {
    return res.status(400).send(
      JSON.stringify({
        message:
          "La contraseña debe tener al menos 8 caracteres con mayúsculas, minúsculas, un número y un carácter especial",
      })
    );
  }

  // Insertar el nuevo usuario
  const hashedPassword = await bcrypt.hash(contrasenya, 10);

  const { user, error: signUpError } = await supabase.auth.signUp({
    email: email,
    password: contrasenya,
  });

  if (signUpError) {
    console.error("Error al crear el usuario", signUpError);
    return res
      .status(500)
      .send(JSON.stringify({ message: "Error al crear usuario" }));
  }
  console.log(nombre,
    apellidos,
    email,
    hashedPassword,)
  const { id_usuario, error: insertError } = await supabase
    .from("usuario")
    .insert([
      {
        nombre,
        apellidos,
        email,
        contrasenya: hashedPassword,
      },
    ])
    .single();

  if (insertError) {
    console.error("Error al insertar usuario", insertError);
    // Manejar el error de inserción aquí
    return res.status(500).send(JSON.stringify({ message: "Error al insertar usuario" }));
  }

  // Buscar el cliente recién insertado por el correo electrónico
  const { data: usuario, error: selectError } = await supabase
    .from("usuario")
    .select("id_usuario")
    .eq("email", email)
    .single();

  if (selectError) {
    console.error("Error al buscar el usuario", selectError);
    return res
      .status(500)
      .send(JSON.stringify({ message: "Error al crear usuario" }));
  }
  res.status(201).send(
    JSON.stringify({
      message: "Usuario creado exitosamente",
      id_usuario: usuario.id_usuario,
      nombre,
      apellidos,
      email,
    })
  );
});



////INICIAR SESIÓN
router.post("/usuarios/iniciarSesion", async (req, res) => {
  const { email, contrasenya } = req.body;

  // Verificar si ya existe un cliente con el mismo correo electrónico
  const { data: emailExists, error: emailExistsError } = await supabase
    .from("usuario")
    .select("*")
    .eq("email", email)
    .single();

  if (emailExistsError) {
    console.error("Error al verificar el correo electrónico", emailExistsError);
    return res.status(500).send(
      JSON.stringify({
        success: false,
        message: "Error interno del servidor",
      })
    );
  }

  if (emailExists) {
    // Si el correo electrónico ya existe, verificar la contraseña
    const user = emailExists;
    const passwordMatches = await bcrypt.compare(
      contrasenya,
      user.contrasenya
    );

    if (passwordMatches) {
      // Si la contraseña coincide, iniciar sesión exitosamente
      // eslint-disable-next-line no-console
      console.log(user.nombre);
      const { id_usuario, nombre, email } = user;
      return res.status(200).send(
        JSON.stringify({
          success: true,
          message: "Inicio de sesión exitoso",
          id_usuario,
          nombre,
          email,
        })
      );
    } else {
      // Si la contraseña no coincide, mostrar un mensaje de error
      return res
        .status(400)
        .send(
          JSON.stringify({ success: false, message: "Contraseña incorrecta" })
        );
    }
  }
});

router.get('/usuarios/emails', async (req, res) => {
  try {
    const { data, error } = await supabase.from('usuario').select('email');

    if (error) {
      console.error('Error al obtener los correos electrónicos de los usuarios:', error);
      res.status(500).json({ error: 'Ocurrió un error al obtener los correos electrónicos de los usuarios' });
    } else {
      const emails = data.map(user => user.email);
      res.json({ emails });
    }
  } catch (error) {
    console.error('Error al obtener los correos electrónicos de los usuarios:', error);
    res.status(500).json({ error: 'Ocurrió un error al obtener los correos electrónicos de los usuarios' });
  }
});




module.exports = router;