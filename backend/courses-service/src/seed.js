const sequelize = require('./db');
const Curso = require('./models/Curso');
const Unidad = require('./models/Unidad');
const Material = require('./models/Material');
const Actividad = require('./models/Actividad');
const Inscripcion = require('./models/Inscripcion');

const seedData = async () => {
    await sequelize.sync({ force: true });

    console.log('--- Seeding Academia Courses (Training Center Style) ---');

    // 1. Curso: Electrónica (Imagen de circuito/placa)
    const cursoElectro = await Curso.create({
        nombre: 'Aplicaciones de Electrónica Digital',
        descripcion: 'Domina los microcontroladores PIC y Arduino. Aprende a diseñar circuitos digitales modernos y sistemas embebidos profesionales.',
        imagen: 'https://images.unsplash.com/photo-1553406830-ef2513450d76?q=80&w=1000&auto=format&fit=crop', // Placa electrónica
        finalizado: false
    });

    // 2. Curso: Gastronomía - Manipulación (Imagen de chef/cocina limpia)
    const cursoAlimentos = await Curso.create({
        nombre: 'Manipulación Segura de Alimentos',
        descripcion: 'Certificación obligatoria para trabajadores del rubro gastronómico. Normas BPM y seguridad e higiene.',
        imagen: 'https://images.unsplash.com/photo-1556910103-1c02745a30bf?q=80&w=1000&auto=format&fit=crop', // Cocina chef
        finalizado: false
    });

    // 3. Curso: Gastronomía - Pizzero (Imagen de pizza/horno)
    const cursoPizzero = await Curso.create({
        nombre: 'Maestro Pizzero y Rotisero',
        descripcion: 'Aprende las técnicas de amasado, fermentación y cocción para pizzas a la piedra, molde, empanadas y tartas.',
        imagen: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=1000&auto=format&fit=crop', // Pizza
        finalizado: false
    });

    // 4. Curso: Informática (Imagen de código/pc)
    await Curso.create({
        nombre: 'Programación Full Stack',
        descripcion: 'Desarrollo web moderno con React y Node.js. Conviértete en desarrollador de software profesional.',
        imagen: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1000&auto=format&fit=crop', // Coding
        finalizado: false
    });

    // --- CONTENIDO DEL CURSO DE ELECTRÓNICA ---
    const unidad1 = await Unidad.create({ titulo: 'Unidad 1: Lógica Digital', descripcion: 'Compuertas y Álgebra de Boole', orden: 1, CursoId: cursoElectro.id });
    const unidad2 = await Unidad.create({ titulo: 'Unidad 2: Arduino Básico', descripcion: 'Entradas y Salidas Digitales', orden: 2, CursoId: cursoElectro.id });

    await Material.create({ titulo: 'Manual de Arduino', tipo: 'pdf', UnidadId: unidad2.id });
    await Actividad.create({ titulo: 'Práctica: Semáforo', tipo: 'entrega', fechaEntrega: new Date('2026-04-10'), UnidadId: unidad2.id });

    // --- INSCRIPCIONES ---
    await Inscripcion.create({ alumnoEmail: 'alumno@academia.com', CursoId: cursoElectro.id });

    console.log('Courses seeded! Training center ready.');
};

seedData().then(() => process.exit()).catch(err => console.error(err));
