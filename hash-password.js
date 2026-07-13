const bcrypt = require('bcryptjs');
const { sequelize } = require('./config/database');

async function updateAdminPassword() {
  const password = 'admin123';
  const hash = await bcrypt.hash(password, 10);
  
  await sequelize.query(
    `UPDATE usuarios SET password_hash = :hash WHERE email = 'admin@agrosmart.com'`,
    { replacements: { hash }, type: sequelize.QueryTypes.UPDATE }
  );
  console.log('✅ Contraseña del admin actualizada con hash:', hash);
  process.exit();
}

updateAdminPassword();