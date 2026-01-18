const sequelize = require('./db');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const seedUsers = async () => {
    await sequelize.sync({ force: true }); // WARNING: This drops tables

    const roles = ['admin', 'alumno', 'profesor', 'padre', 'preceptor', 'director'];
    const users = [];

    for (const role of roles) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('123456', salt);
        users.push({
            email: `${role}@academia.com`,
            password: hashedPassword,
            name: `Usuario ${role.charAt(0).toUpperCase() + role.slice(1)}`,
            role: role
        });
    }

    try {
        await User.bulkCreate(users);
        console.log('Users seeded successfully');
        console.log('Credentials:');
        users.forEach(u => console.log(`${u.email} / 123456`));
    } catch (err) {
        console.error('Error seeding users:', err);
    }
};

seedUsers().then(() => process.exit());
