import bcrypt from "bcryptjs";
// Hashear contraseña
export const hashPassword = async (password) => {
  const saltRounds = 10; // Entre 10-12 es recomendado
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  return hashedPassword;
};

// Verificar contraseña
export const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};