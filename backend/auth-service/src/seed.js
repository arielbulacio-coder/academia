const sequelize = require('./db');
const User = require('./models/User');
const Escuela = require('./models/Escuela');
const bcrypt = require('bcryptjs');

const seedAuth = async () => {
    await sequelize.sync({ force: true });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('123456', salt);

    // 1. Crear Escuela Modelo
    const escuelaTecnica = await Escuela.create({
        nombre: 'Academia Técnica Profesional N°1',
        direccion: 'Av. Tecnológica 1234',
        logo: 'https://cdn-icons-png.flaticon.com/512/3074/3074063.png'
    });

    // 2. Admin General (Superusuario)
    await User.create({
        name: 'Super Admin',
        email: 'admin@academia.com',
        password,
        role: 'admin',
        photo: 'https://i.pravatar.cc/150?u=admin'
    });

    // 3. Director de Escuela
    await User.create({
        name: 'Roberto Director',
        email: 'director@academia.com',
        password,
        role: 'director',
        EscuelaId: escuelaTecnica.id,
        photo: 'https://i.pravatar.cc/150?u=director'
    });

    // 4. Secretario
    await User.create({
        name: 'Sandra Secretaria',
        email: 'secretario@academia.com',
        password,
        role: 'secretario',
        EscuelaId: escuelaTecnica.id,
        photo: 'https://i.pravatar.cc/150?u=secretario'
    });

    // 5. Instructor (Profesor Curso)
    await User.create({
        name: 'Ariel Bulacio',
        email: 'profesor@academia.com', // Mantengo email original para compatibilidad
        password,
        role: 'profesor',
        EscuelaId: escuelaTecnica.id,
        photo: 'https://i.pravatar.cc/150?u=ariel'
    });

    await User.create({
        name: 'Chef Gordon',
        email: 'chef@academia.com',
        password,
        role: 'profesor', // Instructor
        EscuelaId: escuelaTecnica.id,
        photo: 'https://i.pravatar.cc/150?u=chef'
    });

    // 6. Alumno
    await User.create({
        name: 'Juan Alumno',
        email: 'alumno@academia.com',
        password,
        role: 'alumno',
        EscuelaId: escuelaTecnica.id,
        photo: 'https://i.pravatar.cc/150?u=alumno'
    });

    console.log('Auth Database Seeded with School and Roles!');
};

seedAuth().then(() => process.exit()).catch(err => console.error(err));
